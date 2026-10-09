import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReviewHeading, ReviewSummary } from '../components/scan/ReviewHeading';
import {
  ReviewFields,
  validReviewQuantity as validQuantity,
  validReviewExpiry as validExpiry,
} from '../components/scan/ReviewFields';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import { useWeekStore } from '../stores/useWeekStore';
import { getIngredientImage } from '../lib/ingredient-images';
import {
  CheckCircle2,
  ShoppingBag,
  Trash2,
  Store,
  Calendar,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';
import type { StandardUnit } from '@frigo/domain';
import { clsx } from 'clsx';
import { capturePrivateSession } from '../lib/private-session';
import { invalidateInventoryDependents } from '../lib/query-invalidation';
import {
  presentConfidence,
  presentDomainError,
  presentPrice,
  presentPurchaseDate,
  presentRefetchOutcome,
} from '../lib/inventory-truth';
import { ApiError } from '../services/http';
import { ReviewSource } from '../components/scan/ReviewSource';
import { ScanProcessingState } from '../components/scan/ScanProcessingState';
import { scanErrorMessage } from '../lib/scan-errors';

interface ReceiptItemState {
  id: string;
  rawName: string;
  canonicalId?: string | null;
  estimatedQuantity: number | '';
  unit: StandardUnit;
  unitPriceVnd?: number;
  totalPriceVnd?: number;
  category?: string;
  storage: 'fridge' | 'freezer' | 'pantry';
  /** Provider-reported confidence; undefined means the model reported none. */
  confidence?: number | null;
  /** Raw OCR extraction, retained separately from the confirmed value. */
  rawEvidence?: {
    rawName?: string | null;
    estimatedQuantity?: number | null;
    unit?: StandardUnit | null;
  };
  /** Explicit reviewer rejection, recorded durably by the server. */
  rejected?: boolean;
  reviewState?: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  expiryDate?: string;
  expiryEstimated?: boolean;
  /** Server-recorded accepted expiry kind for a CONFIRMED line (T13R-A P2-B). */
  expiryKind?: 'KNOWN' | 'ESTIMATED' | 'UNKNOWN';
}

interface ReceiptState {
  id: string;
  status: 'pending' | 'processing' | 'ready' | 'confirmed' | 'failed';
  items: ReceiptItemState[];
  merchantName?: string;
  purchaseDate?: string;
  invoiceNumber?: string;
  totalAmountVnd?: number;
  errorCode?: string;
  supportId?: string;
  errorMessage?: string;
}

const MISMATCH_MESSAGE =
  'Dữ liệu trả về không khớp với hóa đơn đang mở nên không được hiển thị. Vui lòng tải lại.';

class ReceiptOwnershipError extends Error {
  constructor() {
    super('Receipt response does not belong to this route');
    this.name = 'ReceiptOwnershipError';
  }
}

/** The only acceptable receipt for this route is the one whose id equals the route's scanId. */
function ownsReceipt(receiptScanId: string, receipt: { id?: unknown } | null | undefined): boolean {
  return Boolean(receipt) && typeof receipt!.id === 'string' && receipt!.id === receiptScanId;
}

function reviewedItems(receipt: ReceiptState): ReceiptItemState[] {
  return receipt.items.map((item) => ({
    ...item,
    rejected: item.reviewState === 'REJECTED' || item.rejected === true,
  }));
}

export const ReceiptReviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const receiptScanId = searchParams.get('scanId');
  return <ReceiptReview key={receiptScanId || ''} receiptScanId={receiptScanId} />;
};

const ReceiptReview: React.FC<{ receiptScanId: string | null }> = ({ receiptScanId }) => {
  const navigate = useNavigate();
  const currentPlan = useWeekStore((s) => s.currentPlan);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // History survives logout. Only the authorized scan endpoint may supply receipt data.
  const [liveReceipt, setLiveReceipt] = useState<ReceiptState>({
    id: receiptScanId || '',
    status: receiptScanId ? 'pending' : 'failed',
    items: [],
  });
  const [pollError, setPollError] = useState<string | null>(
    receiptScanId ? null : 'Không tìm thấy bản quét hóa đơn. Vui lòng quay lại và quét ảnh mới.',
  );
  const [retryIndex, setRetryIndex] = useState(0);
  const [items, setItems] = useState<ReceiptItemState[]>([]);
  const isPending = liveReceipt.status === 'pending' || liveReceipt.status === 'processing';
  const isReady = liveReceipt.status === 'ready';
  const isConfirmed = liveReceipt.status === 'confirmed';

  // Async receipt scans arrive as a pending DTO. Poll the tenant-scoped scan
  // endpoint until the queue processor publishes ready/failed state.
  useEffect(() => {
    if (!receiptScanId) return;
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;
    const isCurrent = capturePrivateSession();
    setPollError(null);
    setLiveReceipt((previous) => ({ ...previous, status: 'pending' }));
    const poll = async () => {
      try {
        const next: ReceiptState = await api.getScan(receiptScanId);
        if (cancelled || !isCurrent()) return;
        // T13R-A P1-4: the route's scanId is the only identity. A DTO for any
        // other scan — however it arrived — is never rendered or reviewable.
        if (!ownsReceipt(receiptScanId, next)) {
          setLiveReceipt({ id: receiptScanId, status: 'failed', items: [] });
          setItems([]);
          setPollError(MISMATCH_MESSAGE);
          return;
        }
        setPollError(null);
        setLiveReceipt(next);
        setItems(reviewedItems(next));
        if (next.status === 'pending' || next.status === 'processing') {
          attempts += 1;
          if (attempts < 90) timer = window.setTimeout(poll, 1000);
          else
            setPollError(
              'Hóa đơn đang xử lý lâu hơn dự kiến. Bạn có thể kiểm tra lại hoặc chọn ảnh mới.',
            );
        } else if (next.status === 'failed') {
          setPollError(scanErrorMessage(next.errorCode, 'receipt', { requestId: next.supportId }));
        }
      } catch {
        if (cancelled || !isCurrent()) return;
        setPollError('Không thể cập nhật trạng thái hóa đơn. Kiểm tra kết nối rồi thử lại.');
        attempts += 1;
        if (attempts < 90) {
          timer = window.setTimeout(poll, 1000);
        } else {
          setPollError(
            'Không thể cập nhật hóa đơn trong thời gian cho phép. Bạn có thể kiểm tra lại hoặc chọn ảnh mới.',
          );
        }
      }
    };
    timer = window.setTimeout(poll, 500);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [receiptScanId, retryIndex]);
  // Rejected lines stay in the request (the server records the rejection)
  // but they are not part of what will enter the fridge.
  const acceptedItems = items.filter((it) => !it.rejected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const invalidItems = acceptedItems.some(
    (item) =>
      !item.rawName.trim() ||
      !validQuantity(item.estimatedQuantity) ||
      !validExpiry(item.expiryDate),
  );
  const canSubmit = isReady && items.length > 0 && !invalidItems && !isSubmitting;

  const updateItem = (id: string, changes: Partial<ReceiptItemState>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  };

  const handleConfirm = async (openWeek = false) => {
    if (!canSubmit) return;
    const isCurrent = capturePrivateSession();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Purchase facts and raw evidence remain server-owned, never recomputed from edits.
      const confirmation = items.map((item) =>
        item.rejected
          ? { id: item.id, rejected: true }
          : {
              id: item.id,
              rawName: item.rawName.trim(),
              estimatedQuantity: item.estimatedQuantity,
              unit: item.unit,
              canonicalId: item.canonicalId,
              category: item.category,
              storage: item.storage,
              expiryDate: item.expiryDate || undefined,
              expiryEstimated: Boolean(item.expiryDate && item.expiryEstimated),
              rejected: false,
            },
      );
      // Mutation target is the authoritative route id, never the DTO's.
      if (!receiptScanId || !ownsReceipt(receiptScanId, liveReceipt)) {
        throw new ReceiptOwnershipError();
      }
      const result = await api.confirmScan(receiptScanId, confirmation);
      if (!mounted.current || !isCurrent()) return;
      void invalidateInventoryDependents();
      setSuccessToast(
        result?.pendingSync
          ? 'Đã lưu yêu cầu, đang chờ đồng bộ khi có kết nối.'
          : acceptedItems.length > 0
            ? 'Đã nhập nguyên liệu hóa đơn vào tủ lạnh thành công!'
            : 'Đã lưu các dòng bỏ qua.',
      );
      setTimeout(() => {
        if (mounted.current && isCurrent()) {
          navigate(openWeek && currentPlan ? `/week/${currentPlan.id}/shopping` : '/fridge');
        }
      }, 1200);
    } catch (err) {
      if (!mounted.current || !isCurrent()) return;
      if (err instanceof ReceiptOwnershipError) {
        setSubmitError(MISMATCH_MESSAGE);
        setIsSubmitting(false);
        return;
      }
      // Recoverable domain states get specific guidance, never raw JSON.
      const code = err instanceof ApiError ? err.code : null;
      const presentation = presentDomainError(code, 'Chưa lưu được hóa đơn. Vui lòng thử lại.');
      if (presentation.refetch) {
        try {
          const next: ReceiptState = await api.getScan(receiptScanId as string);
          if (!mounted.current || !isCurrent()) return;
          if (!ownsReceipt(receiptScanId as string, next)) {
            setLiveReceipt({ id: receiptScanId as string, status: 'failed', items: [] });
            setItems([]);
            setSubmitError(MISMATCH_MESSAGE);
            setIsSubmitting(false);
            return;
          }
          setLiveReceipt(next);
          setItems(reviewedItems(next));
        } catch {
          if (!mounted.current || !isCurrent()) return;
          setSubmitError(
            'Thông tin đã thay đổi nhưng chưa tải lại được. Vui lòng tải lại trang trước khi thử lại.',
          );
          setIsSubmitting(false);
          return;
        }
      }
      setSubmitError(
        presentRefetchOutcome(presentation, presentation.refetch ? true : null).message,
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-workspace">
      <ReviewHeading receipt confirmed={isConfirmed} />

      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-semantic-text-primary text-semantic-text-inverse px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in max-w-md mx-auto border border-white/10">
          <CheckCircle2 className="w-5 h-5 text-takosan-mint shrink-0" />
          <p role="status" className="text-sm font-semibold leading-relaxed">
            {successToast}
          </p>
        </div>
      )}

      <div className="review-layout">
        <aside className="review-sidebar">
          <ReviewSummary
            total={items.length}
            accepted={acceptedItems.length}
            confirmed={isConfirmed}
          />
          <ReviewSource scanId={receiptScanId ?? ''} verified={isReady || isConfirmed} />
        </aside>
        <div className="review-main">
          {isPending && (
            <ScanProcessingState
              stage={liveReceipt.status === 'processing' ? 'analyzing' : 'queued'}
              kind="receipt"
              compact
            />
          )}
          {isPending && !pollError && (
            <div className="rounded-xl border border-semantic-warning/30 bg-semantic-warning-soft px-3 py-2 text-xs text-semantic-warning-strong">
              Hóa đơn đang được AI xử lý nền. Trang sẽ tự cập nhật khi hoàn tất...
            </div>
          )}
          {pollError && (
            <div
              role="alert"
              className="rounded-xl border border-semantic-danger/30 bg-semantic-danger-soft px-3 py-2 text-xs text-semantic-danger-strong flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pollError}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isPending && (
                  <button
                    className="underline font-semibold"
                    onClick={() => {
                      setPollError(null);
                      setRetryIndex((value) => value + 1);
                    }}
                  >
                    Thử tải lại
                  </button>
                )}
                {!isPending && !isReady && pollError === MISMATCH_MESSAGE && (
                  <button
                    className="underline font-semibold"
                    onClick={() => setRetryIndex((value) => value + 1)}
                  >
                    Thử tải lại
                  </button>
                )}
                {!isPending && !isReady && (
                  <button className="underline font-semibold" onClick={() => navigate('/scan')}>
                    Quét ảnh mới
                  </button>
                )}
              </div>
            </div>
          )}
          {isConfirmed && (
            <p
              role="status"
              className="rounded-xl bg-takosan-mint p-3 text-xs text-takosan-green-deep"
            >
              Hóa đơn đã được xác nhận. Thông tin dưới đây đã lưu; sửa lô trong tủ lạnh nếu cần.
            </p>
          )}
          {/* Receipt Header Card */}
          <div className="bg-white rounded-xl p-4 border border-semantic-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-takosan-mint border border-takosan-mint-deep flex items-center justify-center text-takosan-green-deep shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-semantic-text-primary">
                    {liveReceipt.merchantName || 'Không rõ cửa hàng'}
                  </h3>
                  <p className="text-xs text-semantic-text-muted flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-semantic-text-muted" />
                    <span>{presentPurchaseDate(liveReceipt.purchaseDate)}</span>
                    {liveReceipt.invoiceNumber && <span>• {liveReceipt.invoiceNumber}</span>}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-takosan-mint text-takosan-green-deep border border-takosan-mint-deep/60">
                AI OCR
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-semantic-border/70">
              <span className="text-xs text-semantic-text-muted">Tổng hóa đơn (OCR):</span>
              <span
                data-testid="receipt-total"
                className="font-heading font-bold text-lg text-semantic-text-primary"
              >
                {presentPrice(liveReceipt.totalAmountVnd)}
              </span>
            </div>
          </div>

          {/* Extracted Items Count */}
          <div className="flex items-center justify-between px-1">
            <h4 className="font-heading font-semibold text-sm text-semantic-text-primary">
              Hàng hóa nhận diện ({items.length} món)
            </h4>
            <span className="text-xs text-semantic-text-muted">Kiểm tra từng dòng</span>
          </div>

          {/* Items List */}
          <div className="space-y-2.5">
            {items.map((item) => {
              const confidence = presentConfidence(item.confidence);
              const raw = item.rawEvidence;
              const corrected =
                (raw?.rawName != null && raw.rawName !== item.rawName) ||
                (raw?.estimatedQuantity != null &&
                  raw.estimatedQuantity !== item.estimatedQuantity) ||
                (raw?.unit != null && raw.unit !== item.unit);
              const disabled = item.rejected || !isReady || isSubmitting;
              return (
                <div
                  key={item.id}
                  data-testid="receipt-line"
                  data-rejected={Boolean(item.rejected)}
                  className="review-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-semantic-background-subtle border border-semantic-border/70 p-1.5 shrink-0 flex items-center justify-center">
                        <img
                          src={getIngredientImage(item.canonicalId ?? undefined, item.rawName)}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="break-words">{item.rawName || 'Chưa có tên'}</h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className="text-xs font-semibold text-takosan-green"
                            data-testid="receipt-price"
                          >
                            Thành tiền OCR: {presentPrice(item.totalPriceVnd)}
                          </span>
                          <span
                            data-testid="receipt-confidence"
                            className={clsx(
                              'text-xs px-1.5 py-0.5 rounded font-semibold border',
                              confidence.tone === 'unknown'
                                ? 'bg-semantic-border/60 text-semantic-text-secondary border-semantic-border'
                                : confidence.tone === 'low'
                                  ? 'bg-semantic-danger-soft text-semantic-danger-strong border-semantic-danger/30'
                                  : confidence.tone === 'medium'
                                    ? 'bg-semantic-warning-soft text-semantic-warning-strong border-semantic-warning/30'
                                    : 'bg-takosan-mint text-takosan-green-deep border-takosan-mint-deep/60',
                            )}
                          >
                            {confidence.label}
                          </span>
                        </div>
                        {!item.canonicalId && (
                          <p className="text-sm text-semantic-warning-strong mt-1">
                            Chưa nhận diện nguyên liệu chuẩn
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => updateItem(item.id, { rejected: !item.rejected })}
                        disabled={!isReady || isSubmitting}
                        aria-label={
                          item.rejected ? `Khôi phục ${item.rawName}` : `Bỏ qua ${item.rawName}`
                        }
                        aria-pressed={Boolean(item.rejected)}
                        className="p-1.5 text-semantic-text-muted hover:text-semantic-danger hover:bg-semantic-danger-soft rounded-lg transition-colors tap-target"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="ml-1 text-xs">
                          {item.rejected ? 'Khôi phục' : 'Bỏ qua'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <ReviewFields
                    prefix={`receipt-${item.id}`}
                    item={item}
                    disabled={Boolean(disabled)}
                    receipt
                    onChange={(changes) => updateItem(item.id, changes)}
                  />
                  {!isConfirmed ? (
                    <div className="review-expiry text-semantic-text-secondary space-y-1">
                      <p data-testid="receipt-expiry-status">
                        {item.expiryDate
                          ? item.expiryEstimated
                            ? 'Hạn dùng ước tính'
                            : 'Hạn dùng do bạn cung cấp'
                          : 'Chưa cung cấp hạn dùng. Hệ thống có thể gợi ý hạn dùng ước tính.'}
                      </p>
                      {item.expiryDate && (
                        <button
                          disabled={disabled}
                          onClick={() =>
                            updateItem(item.id, { expiryDate: undefined, expiryEstimated: false })
                          }
                          className="underline tap-target"
                        >
                          Không rõ hạn dùng
                        </button>
                      )}
                    </div>
                  ) : (
                    <p
                      className="review-expiry text-semantic-text-secondary"
                      data-testid="receipt-expiry-status"
                    >
                      {/* T13R-A P2-B: a confirmed line reports the accepted expiry the server recorded, never a re-derived guess. */}
                      {item.rejected
                        ? 'Đã bỏ qua: không có hạn dùng.'
                        : item.expiryDate
                          ? item.expiryEstimated
                            ? 'Hạn dùng ước tính đã xác nhận.'
                            : 'Hạn dùng do bạn cung cấp.'
                          : item.reviewState === 'CONFIRMED' && item.expiryKind === 'UNKNOWN'
                            ? 'Đã xác nhận không rõ hạn dùng.'
                            : 'Hạn dùng đã lưu: xem chi tiết lô trong tủ lạnh.'}
                    </p>
                  )}
                  {item.unitPriceVnd != null && (
                    <p className="text-sm text-semantic-text-muted">
                      Đơn giá OCR: {presentPrice(item.unitPriceVnd)}
                    </p>
                  )}
                  <details className="text-xs text-semantic-text-secondary break-words">
                    <summary className="cursor-pointer py-1 font-medium">
                      Xem OCR gốc và giá trị xác nhận{corrected ? ' · Đã chỉnh sửa' : ''}
                    </summary>
                    <p data-testid="receipt-raw-evidence" className="mt-1">
                      OCR gốc: {raw?.rawName ?? 'Chưa rõ tên'} ·{' '}
                      {raw?.estimatedQuantity ?? 'Chưa rõ số lượng'} ·{' '}
                      {raw?.unit ?? 'Chưa rõ đơn vị'}
                    </p>
                    <p data-testid="receipt-confirmed-evidence" className="mt-1">
                      {item.rejected ? 'Đã bỏ qua' : isConfirmed ? 'Đã xác nhận' : 'Bạn xác nhận'}:{' '}
                      {item.rawName || 'Chưa có tên'} · {item.estimatedQuantity} · {item.unit}
                    </p>
                  </details>
                  <div className="text-sm">
                    {item.rejected && (
                      <span className="text-xs font-semibold text-semantic-danger-strong">
                        Đã bỏ qua khỏi tủ lạnh
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {items.length === 0 && !isPending && !pollError && (
              <div className="text-center py-10 bg-white rounded-xl p-6 border border-semantic-border">
                <p className="text-xs text-semantic-text-muted">Không còn món nào trong hóa đơn</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explicit confirmation; existing Week shortcut is retained. */}
      <div className="review-actions">
        <div className="review-actions-inner">
          {submitError && (
            <p role="alert" className="text-xs text-semantic-danger-strong">
              {submitError}
            </p>
          )}
          {isConfirmed ? (
            <Button fullWidth onClick={() => navigate('/fridge')}>
              Xem tủ lạnh
            </Button>
          ) : (
            <>
              <Button
                fullWidth
                size="lg"
                disabled={!canSubmit}
                onClick={() => void handleConfirm()}
                className="flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Đang lưu…'
                    : acceptedItems.length === 0 && items.length > 0
                      ? `Lưu ${items.length} dòng bỏ qua`
                      : `Nhập ${acceptedItems.length} món vào Tủ lạnh`}
                </span>
              </Button>

              {currentPlan && (
                <Button
                  fullWidth
                  variant="outline"
                  size="md"
                  disabled={!canSubmit}
                  onClick={() => void handleConfirm(true)}
                  className="flex items-center justify-center gap-2 text-semantic-text-primary"
                >
                  <CalendarCheck className="w-4 h-4 text-takosan-green" />
                  <span>Lưu hóa đơn & mở danh sách tuần</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

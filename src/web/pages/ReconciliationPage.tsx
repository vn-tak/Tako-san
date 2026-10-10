import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { KitchenDetailPage } from '../components/common/KitchenDetailPage';
import { TAKOSAN_KITCHEN } from '../lib/takosan-kitchen';
import { Button } from '../components/common/Button';
import { InlineLoading, InlineError } from '../components/common/AsyncState';
import { api, ApiError } from '../services/api';
import { queryKeys } from '../lib/queryKeys';
import { invalidateInventoryDependents } from '../lib/query-invalidation';
import { presentDomainError, provenanceLabel } from '../lib/inventory-truth';
import type { InventoryObservationView } from '../services/inventory-truth';
import { ScanLine } from 'lucide-react';

// T13 reconciliation surface. It shows what was observed, what the fridge
// currently says and which difference the server's planner found — then
// submits INTENT only. Every decision semantic stays on the server.

const VERDICT_LABEL: Record<string, string> = {
  MATCH: 'Khớp với tủ lạnh',
  NO_ACTION: 'Không cần xử lý',
  STALE_OBSERVATION: 'Bằng chứng đã cũ',
  AMBIGUOUS: 'Chưa xác định được lô',
  CONFLICT: 'Có mâu thuẫn cần bạn quyết định',
  PROPOSE_CORRECTION: 'Đề xuất sửa số lượng',
  PROPOSE_MOVE: 'Đề xuất chuyển vị trí',
  PROPOSE_EXPIRY_UPDATE: 'Đề xuất cập nhật hạn dùng',
  UNSUPPORTED: 'Chưa hỗ trợ tự động',
};

const REASON_LABEL: Record<string, string> = {
  QUANTITY_MISMATCH: 'Số lượng ghi nhận khác với tủ lạnh',
  STORAGE_MISMATCH: 'Vị trí bảo quản khác với tủ lạnh',
  EXPIRY_MISMATCH: 'Hạn dùng khác với tủ lạnh',
  EXPIRY_EVIDENCE_UPGRADE: 'Xác nhận hạn dùng đang là ước tính',
  NO_MATCHING_LOT: 'Chưa có lô tương ứng trong tủ',
  MULTIPLE_CANDIDATES: 'Có nhiều lô trùng tên',
  INCOMPATIBLE_UNIT: 'Đơn vị không quy đổi được',
};

function claimSummary(observation: InventoryObservationView): string {
  const claim = observation.claim as Record<string, unknown>;
  const parts: string[] = [];
  if (claim.quantity !== null && claim.quantity !== undefined) {
    parts.push(`${claim.quantity} ${claim.unit ?? ''}`.trim());
  }
  if (claim.storage)
    parts.push(
      ({ fridge: 'Ngăn mát', freezer: 'Ngăn đông', pantry: 'Tủ đồ khô' } as Record<string, string>)[
        String(claim.storage)
      ] ?? String(claim.storage),
    );
  if (claim.expiryDate) {
    parts.push(
      claim.expiryKind === 'ESTIMATED'
        ? `hạn ước tính ${claim.expiryDate}`
        : `hạn ${claim.expiryDate}`,
    );
  }
  return parts.length > 0 ? parts.join(' · ') : 'Không có số liệu cụ thể';
}

export const ReconciliationPage: React.FC = () => {
  const navigate = useNavigate();
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (actionError) errorRef.current?.focus();
  }, [actionError]);

  const observationsQuery = useQuery({
    queryKey: queryKeys.inventoryObservations(),
    queryFn: () => api.getInventoryObservations('OPEN'),
    retry: false,
  });

  const decide = useMutation({
    mutationFn: (input: { observation: InventoryObservationView; accept: boolean }) => {
      const { observation, accept } = input;
      if (!accept) {
        return api.decideInventoryObservation({
          observationId: observation.observationId,
          expectedObservationVersion: observation.version,
          decisionType: 'DISMISS',
        });
      }
      // The decision type follows the server's own verdict; the client never
      // invents a mutation of its own.
      const decisionType = observation.verdict === 'PROPOSE_MOVE' ? 'MOVE' : 'CORRECT';
      return api.decideInventoryObservation({
        observationId: observation.observationId,
        expectedObservationVersion: observation.version,
        decisionType,
        proposals: observation.proposals,
      });
    },
    onSuccess: async () => {
      setActionError(null);
      await invalidateInventoryDependents();
      await observationsQuery.refetch();
    },
    onError: async (error: unknown) => {
      const code = error instanceof ApiError ? error.code : null;
      const presentation = presentDomainError(
        code,
        'Chưa xử lý được mục đối chiếu. Vui lòng thử lại.',
      );
      setActionError(presentation.message);
      // Stale or already-decided evidence only makes sense after a reload.
      if (presentation.refetch) await observationsQuery.refetch();
    },
  });

  const observations = observationsQuery.data ?? [];

  return (
    <KitchenDetailPage
      title="Đối chiếu tủ lạnh"
      description="Kiểm tra ghi nhận từ hóa đơn và ảnh quét. Bạn quyết định áp dụng hay bỏ qua từng đề xuất."
    >
      {actionError && (
        <p
          ref={errorRef}
          tabIndex={-1}
          className="text-xs text-semantic-danger-strong bg-semantic-danger-soft border border-semantic-danger/30 rounded-xl px-3 py-2 font-medium"
          role="alert"
        >
          {actionError}
        </p>
      )}

      {observationsQuery.isPending ? (
        <InlineLoading label="Đang tải mục cần đối chiếu…" />
      ) : observationsQuery.isError ? (
        <InlineError
          error={observationsQuery.error}
          onRetry={() => void observationsQuery.refetch()}
        />
      ) : observations.length === 0 ? (
        <section className="bg-white rounded-xl border border-semantic-border p-6 space-y-4">
          <img src={TAKOSAN_KITCHEN.symbol} alt="" width={64} height={64} />
          <h2>Không có mục nào cần đối chiếu</h2>
          <p>Khi bạn quét hóa đơn hoặc ảnh tủ lạnh, các khác biệt sẽ xuất hiện ở đây.</p>
          <Button variant="outline" onClick={() => navigate('/fridge')}>
            Về tủ lạnh
          </Button>
        </section>
      ) : (
        observations.map((observation) => {
          const actionable = observation.proposals.length > 0;
          return (
            <article
              key={observation.observationId}
              data-testid="reconciliation-item"
              className="reconciliation-record bg-white rounded-xl border border-semantic-border space-y-2"
            >
              <header>
                <div className="flex items-center gap-2 min-w-0">
                  <ScanLine aria-hidden="true" className="w-4 h-4 text-takosan-green shrink-0" />
                  <h2 className="font-heading font-semibold text-semantic-text-primary">
                    {observation.rawName ?? observation.ingredientId ?? 'Nguyên liệu'}
                  </h2>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-semantic-border/60 text-semantic-text-secondary font-medium shrink-0">
                  {provenanceLabel(observation.dataSource)}
                </span>
              </header>

              <dl className="text-xs space-y-1">
                <div className="flex justify-between gap-3">
                  <dt className="text-semantic-text-muted shrink-0">Ghi nhận</dt>
                  <dd className="text-semantic-text-primary font-medium text-right">
                    {claimSummary(observation)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-semantic-text-muted shrink-0">Kết luận</dt>
                  <dd className="text-semantic-text-primary font-medium text-right">
                    {VERDICT_LABEL[observation.verdict ?? ''] ?? 'Đang chờ xử lý'}
                  </dd>
                </div>
                {observation.reasons.length > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-semantic-text-muted shrink-0">Khác biệt</dt>
                    <dd className="text-semantic-text-secondary text-right">
                      {observation.reasons
                        .map((reason) => REASON_LABEL[reason] ?? reason)
                        .join('; ')}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="reconciliation-actions">
                <Button
                  fullWidth
                  size="sm"
                  disabled={!actionable || decide.isPending}
                  onClick={() => decide.mutate({ observation, accept: true })}
                >
                  Áp dụng
                </Button>
                <Button
                  fullWidth
                  size="sm"
                  variant="outline"
                  disabled={decide.isPending}
                  onClick={() => decide.mutate({ observation, accept: false })}
                >
                  Bỏ qua
                </Button>
              </div>
              {!actionable && (
                <p className="text-[11px] text-semantic-text-muted">
                  Mục này không có thao tác tự động an toàn; bạn có thể bỏ qua hoặc sửa trực tiếp
                  trong tủ lạnh.
                </p>
              )}
            </article>
          );
        })
      )}
    </KitchenDetailPage>
  );
};

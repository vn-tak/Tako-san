import React, { useEffect, useState } from 'react';
import { Clock3, LoaderCircle, ScanLine, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export type ScanProcessingStage = 'uploading' | 'queued' | 'analyzing' | 'validating' | 'preparing';

const STAGES: ReadonlyArray<{ id: ScanProcessingStage; label: string }> = [
  { id: 'uploading', label: 'Đang gửi ảnh' },
  { id: 'queued', label: 'Đã xếp hàng xử lý' },
  { id: 'analyzing', label: 'AI đang đọc nội dung' },
  { id: 'validating', label: 'Đang kiểm tra kết quả' },
  { id: 'preparing', label: 'Đang chuẩn bị kết quả' },
];

const STAGE_INDEX: Record<ScanProcessingStage, number> = {
  uploading: 0,
  queued: 1,
  analyzing: 2,
  validating: 3,
  preparing: 4,
};

interface ScanProcessingStateProps {
  stage?: ScanProcessingStage;
  kind?: 'fridge' | 'receipt';
  compact?: boolean;
}

export const ScanProcessingState: React.FC<ScanProcessingStateProps> = ({
  stage = 'analyzing',
  kind = 'fridge',
  compact = false,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      setElapsedSeconds(elapsed);
      // Polling has a bounded lifetime too; do not leave a background timer
      // alive after the UI has switched to its timeout/retry message.
      if (elapsed >= 90) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentIndex = STAGE_INDEX[stage];
  const noun = kind === 'receipt' ? 'hóa đơn' : 'nguyên liệu';
  return (
    <div
      data-testid="scan-processing-state"
      className={clsx(
        'rounded-2xl border border-takosan-mint-deep/60 bg-white/95 text-semantic-text-primary shadow-lg',
        compact ? 'p-3' : 'p-4',
      )}
    >
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {STAGES[currentIndex].label}.
      </p>
      <div className="flex items-start gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-takosan-mint text-takosan-green-deep">
          <ScanLine className="h-5 w-5" />
          <span className="absolute inset-0 rounded-xl border border-takosan-green/40 scan-processing-motion motion-safe:animate-ping" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-bold">Đang xử lý {noun}…</p>
          <p className="mt-0.5 text-sm text-semantic-text-secondary">
            Bạn có thể chờ ở màn hình này; kết quả chỉ hiện khi AI xử lý xong và đã được kiểm tra.
          </p>
        </div>
        <Sparkles className="h-4 w-4 shrink-0 scan-processing-motion motion-safe:animate-pulse text-takosan-coral" />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm" aria-label="Trạng thái bản quét">
        <LoaderCircle
          className="h-4 w-4 scan-processing-motion motion-safe:animate-spin"
          aria-hidden="true"
        />
        <span>{STAGES[currentIndex].label}</span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-sm text-semantic-text-muted">
        <Clock3 className="h-3.5 w-3.5" />
        <span>Đã chờ {elapsedSeconds < 1 ? 'dưới 1 giây' : `${elapsedSeconds} giây`}</span>
        <span aria-hidden="true">·</span>
        <span>Kết quả chưa sẵn sàng</span>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MealPlan } from '@frigo/domain';
import { useWeekStore } from '../stores/useWeekStore';
import { TAKOSAN_KITCHEN } from '../lib/takosan-kitchen';
import { WeekWorkspace } from '../features/week/WeekWorkspace';
import { capturePrivateSession, currentPrivateScope } from '../lib/private-session';
import { todayLocalIso } from '../lib/format';
import { InlineError, InlineLoading } from '../components/common/AsyncState';
import { Button } from '../components/common/Button';

export const WeekGeneratingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setupDraft, generatePlan } = useWeekStore();
  const request = useRef<Promise<MealPlan> | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    const isCurrent = capturePrivateSession();
    const { userId, householdId } = currentPrivateScope();
    if (!userId || !householdId) {
      setError(new Error('Vui lòng xác minh phiên trước khi tạo thực đơn.'));
      return;
    }
    // Reuse the command during StrictMode's effect replay.
    request.current ??= generatePlan({
      householdId,
      startDate: todayLocalIso(),
      householdSize: setupDraft.householdSize || 2,
      mealSlotsPreset: setupDraft.mealSlotsPreset || 'dinner_only',
      budgetTargetVnd:
        setupDraft.budgetTargetVnd !== undefined ? setupDraft.budgetTargetVnd : 750000,
      priorities: setupDraft.priorities || ['use_fridge'],
      shoppingFrequency: setupDraft.shoppingFrequency || 'once',
    });
    void request.current
      .then((plan) => {
        if (!cancelled && isCurrent()) navigate(`/week/${plan.id}`, { replace: true });
      })
      .catch((err: unknown) => {
        if (!cancelled && isCurrent()) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [generatePlan, navigate, setupDraft]);

  return (
    <WeekWorkspace
      title={error ? 'Chưa tạo được thực đơn.' : 'Đang lên thực đơn cho tuần của bạn…'}
      narrow
      description="Thực đơn là kế hoạch dự kiến. Nguyên liệu trong tủ chỉ thay đổi khi bạn xác nhận mua thêm hoặc nấu."
    >
      <div className="week-paper week-generating" aria-busy={!error}>
        <img src={TAKOSAN_KITCHEN.symbol} alt="" width={80} height={80} />
        {error ? (
          <>
            <InlineError error={error} />
            <Button className="mt-4" onClick={() => navigate('/week/setup', { replace: true })}>
              Quay lại thiết lập
            </Button>
          </>
        ) : (
          <InlineLoading label="Đang chờ kết quả tạo thực đơn…" />
        )}
        <p className="week-muted">
          Bạn có thể quay lại thực đơn tuần. Yêu cầu đang gửi có thể vẫn hoàn tất.
        </p>
      </div>
    </WeekWorkspace>
  );
};

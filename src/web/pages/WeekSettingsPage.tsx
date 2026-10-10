import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ShoppingFrequency } from '@frigo/domain';
import { useWeekStore } from '../stores/useWeekStore';
import { WeekWorkspace } from '../features/week/WeekWorkspace';
import { WeekBudgetChoices, WeekFrequencyChoices } from '../features/week/WeekSetupChoices';

export function WeekSettingsPage() {
  const { planId } = useParams<{ planId: string }>();
  const { setupDraft, updateSetupDraft } = useWeekStore();
  const [budget, setBudget] = useState<number | null>(
    setupDraft.budgetTargetVnd !== undefined ? setupDraft.budgetTargetVnd : 750000,
  );
  const [frequency, setFrequency] = useState<ShoppingFrequency>(
    setupDraft.shoppingFrequency || 'once',
  );
  const [applied, setApplied] = useState(false);
  const backTo = planId ? `/week/${planId}` : '/week';
  return (
    <WeekWorkspace
      title="Chuẩn bị cho thực đơn tiếp theo."
      backTo={backTo}
      narrow
      description="Thiết lập này chỉ dùng cho lần tạo tiếp theo trong phiên đang mở. Thực đơn hiện tại không thay đổi; tải lại trang sẽ đặt lại bản nháp."
    >
      <div className="week-paper week-settings">
        <WeekBudgetChoices
          value={budget}
          onChange={(value) => {
            setBudget(value);
            setApplied(false);
          }}
        />
        <WeekFrequencyChoices
          value={frequency}
          onChange={(value) => {
            setFrequency(value);
            setApplied(false);
          }}
        />
        {applied && (
          <p className="week-note" role="status">
            Đã áp dụng vào bản nháp trong phiên này. Bạn có thể xem lại các bước trước khi tạo thực
            đơn mới.
          </p>
        )}
        <div className="week-actions">
          <button
            type="button"
            className="week-button"
            onClick={() => {
              updateSetupDraft({ budgetTargetVnd: budget, shoppingFrequency: frequency });
              setApplied(true);
            }}
          >
            Áp dụng vào bản nháp
          </button>
          <Link className="week-button week-button-secondary" to={backTo}>
            Về thực đơn hiện tại
          </Link>
          {applied && (
            <Link className="week-text-link" to="/week/setup">
              Xem lại trước khi tạo mới
            </Link>
          )}
        </div>
      </div>
    </WeekWorkspace>
  );
}

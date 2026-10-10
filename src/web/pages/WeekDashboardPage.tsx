import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ShoppingBag, Share2, ArrowRight } from 'lucide-react';
import { useWeekStore } from '../stores/useWeekStore';
import { WeekWorkspace, weekDate, mealLabels } from '../features/week/WeekWorkspace';
import { WeekSummaryCards } from '../features/week/WeekSummaryCards';
import { MealCard } from '../features/week/MealCard';
import { MealSwapSheet } from '../features/week/MealSwapSheet';
import { WeekExportModal } from '../features/week/WeekExportModal';
import { InlineError, InlineLoading } from '../components/common/AsyncState';
import { api } from '../services/api';
import { queryKeys } from '../lib/queryKeys';

const statusLabels = {
  DRAFT: 'Bản nháp',
  GENERATING: 'Đang tạo',
  READY: 'Đã lên kế hoạch',
  ACTIVE: 'Đang thực hiện',
  COMPLETED: 'Đã hoàn tất',
  ARCHIVED: 'Đã lưu trữ',
  FAILED: 'Chưa tạo được',
};
export function WeekDashboardPage() {
  const { planId } = useParams<{ planId?: string }>();
  const { openSwap, error: workflowError } = useWeekStore();
  const planQuery = useQuery({
    queryKey: planId ? queryKeys.weekPlan(planId) : queryKeys.currentWeekPlan(),
    queryFn: () => (planId ? api.getWeekPlan(planId) : api.getCurrentWeekPlan()),
  });
  const currentPlan = planQuery.data ?? null;
  const [isExportOpen, setIsExportOpen] = useState(false);
  useEffect(() => {
    useWeekStore.setState({ currentPlan });
  }, [currentPlan]);

  return (
    <WeekWorkspace
      title="Tuần này, mình ăn gì?"
      backTo="/"
      description={
        currentPlan
          ? `${weekDate(currentPlan.startDate)} – ${weekDate(currentPlan.endDate)} · ${statusLabels[currentPlan.status]}`
          : 'Từ nguyên liệu trong tủ đến những bữa ăn trong tuần.'
      }
      action={
        currentPlan && (
          <Link to={`/week/${currentPlan.id}/shopping`} className="week-button">
            <ShoppingBag size={18} aria-hidden="true" />
            Đi chợ ({currentPlan.shoppingItems.length})
          </Link>
        )
      }
    >
      {planQuery.isPending ? (
        <InlineLoading label="Đang tải thực đơn tuần…" />
      ) : planQuery.isError ? (
        <InlineError error={planQuery.error} onRetry={() => planQuery.refetch()} />
      ) : !currentPlan ? (
        <section className="week-paper week-empty">
          <p className="week-eyebrow">BẮT ĐẦU TỪ BẾP NHÀ</p>
          <h2>Chưa có thực đơn tuần</h2>
          <p className="week-muted">
            Chọn bữa cần nấu, ngân sách và ưu tiên. Takosan sẽ đề xuất thực đơn để bạn xem lại.
          </p>
          <Link to="/week/setup" className="week-button">
            Lên thực đơn tuần
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <>
          {workflowError && <InlineError message={workflowError} />}
          <WeekSummaryCards plan={currentPlan} />
          <div className="week-toolbar">
            <p className="week-muted">
              Kế hoạch dự kiến theo dữ liệu lúc tạo. Kiểm tra lại tủ trước khi nấu; giá mua thực tế
              có thể khác.
            </p>
            <div className="week-actions">
              <button
                type="button"
                className="week-button week-button-secondary"
                onClick={() => setIsExportOpen(true)}
              >
                <Share2 size={18} aria-hidden="true" />
                Chia sẻ thực đơn
              </button>
              <Link className="week-text-link" to={`/week/${currentPlan.id}/settings`}>
                Thiết lập lần tiếp theo
              </Link>
              <Link className="week-text-link" to="/week/setup">
                Xem lại để tạo mới
              </Link>
            </div>
          </div>
          {currentPlan.aiExplanation && (
            <aside className="week-note">
              <h2>Gợi ý cho tuần</h2>
              <p>{currentPlan.aiExplanation}</p>
            </aside>
          )}
          <section aria-labelledby="week-days-title" className="week-days-section">
            <h2 id="week-days-title">Bữa ăn từng ngày</h2>
            <div className="week-day-board">
              {currentPlan.days.map((day) => (
                <section key={day.id} className="week-day">
                  <div className="week-day-heading">
                    <h3>{day.dayNameVi}</h3>
                    <time dateTime={day.date}>{weekDate(day.date)}</time>
                  </div>
                  {day.dayType !== 'cooking' && (
                    <p className="week-muted">
                      {
                        {
                          eat_out: 'Ăn ngoài',
                          flexible: 'Linh hoạt',
                          away: 'Vắng nhà',
                          leftover: 'Dùng món còn lại',
                        }[day.dayType]
                      }
                    </p>
                  )}
                  {day.slots.length ? (
                    day.slots.map((slot) => (
                      <div key={slot.id} className="week-day-slot">
                        <p className="week-slot-label">{mealLabels[slot.slotType]}</p>
                        <MealCard
                          slot={slot}
                          to={`/week/${currentPlan.id}/meal/${slot.id}`}
                          onSwapClick={() => {
                            void openSwap(slot.id);
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="week-muted">Chưa có bữa nào trong ngày này.</p>
                  )}
                </section>
              ))}
            </div>
            {!currentPlan.days.length && (
              <p className="week-note">
                Thực đơn này chưa có bữa ăn. Bạn có thể xem lại thiết lập để tạo kế hoạch mới.
              </p>
            )}
          </section>
          <MealSwapSheet />
          <WeekExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            plan={currentPlan}
            shoppingItems={currentPlan.shoppingItems}
          />
        </>
      )}
    </WeekWorkspace>
  );
}

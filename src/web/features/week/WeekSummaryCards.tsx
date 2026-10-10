import type { MealPlan } from '@frigo/domain';
import { weekCurrency } from './WeekWorkspace';

export function WeekSummaryCards({ plan }: { plan: MealPlan }) {
  const meals = plan.days
    .flatMap((day) => day.slots)
    .filter((slot) => slot.status === 'PLANNED' || slot.status === 'COOKED').length;
  return (
    <dl className="week-summary">
      <div className="week-summary-budget">
        <dt>Mua thêm · ước tính</dt>
        <dd>{plan.budget.displayText || 'Chưa có ước tính giá'}</dd>
        <dd className="week-summary-detail">
          {plan.budget.targetVnd !== null
            ? `Hạn mức ${weekCurrency(plan.budget.targetVnd)}`
            : 'Không giới hạn ngân sách'}
        </dd>
      </div>
      <div>
        <dt>Dự kiến tận dụng tủ</dt>
        <dd>{plan.utilization.utilizationPercent}%</dd>
        <dd className="week-summary-detail">
          {plan.utilization.plannedItemsCount}/{plan.utilization.totalUsableItemsCount} nguyên liệu
          sẵn có
        </dd>
      </div>
      <div>
        <dt>Bữa có món</dt>
        <dd>{meals}</dd>
        <dd className="week-summary-detail">
          {plan.shoppingItems.length} nguyên liệu cần mua thêm
        </dd>
      </div>
      <div>
        <dt>Nguy cơ bỏ phí · dự kiến</dt>
        <dd>{{ LOW: 'Thấp', MEDIUM: 'Vừa', HIGH: 'Cao' }[plan.wasteRisk.level]}</dd>
        <dd className="week-summary-detail">
          {plan.wasteRisk.rescuedItemsCount}/{plan.wasteRisk.expiringItemsCount} nguyên liệu sắp hết
          hạn được xếp vào kế hoạch
        </dd>
      </div>
    </dl>
  );
}

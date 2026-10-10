import type { ShoppingFrequency } from '@frigo/domain';
import { weekCurrency } from './WeekWorkspace';

export const frequencyOptions: { id: ShoppingFrequency; label: string; description: string }[] = [
  { id: 'once', label: '1 lần / tuần', description: 'Một chuyến mua sắm đầu tuần.' },
  { id: 'twice', label: '2 lần / tuần', description: 'Chia nhu cầu mua sắm thành hai chuyến.' },
  { id: 'three_plus', label: '3 lần trở lên', description: 'Mua bổ sung nhiều lần trong tuần.' },
  { id: 'flexible', label: 'Không cố định', description: 'Chọn thời điểm phù hợp với bạn.' },
];

export function WeekBudgetChoices({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <fieldset className="week-choices">
      <legend>Hạn mức mua thêm cho tuần</legend>
      <div className="week-choice-grid">
        {[500000, 750000, 1000000, 1500000, null].map((budget) => (
          <label
            key={budget ?? 'unlimited'}
            className="week-choice"
            data-selected={value === budget}
          >
            <input
              type="radio"
              name="week-budget"
              value={budget ?? 'unlimited'}
              checked={value === budget}
              onChange={() => onChange(budget)}
            />
            <span>{budget === null ? 'Không giới hạn ngân sách' : weekCurrency(budget)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function WeekFrequencyChoices({
  value,
  onChange,
}: {
  value: ShoppingFrequency;
  onChange: (value: ShoppingFrequency) => void;
}) {
  return (
    <fieldset className="week-choices">
      <legend>Tần suất đi chợ</legend>
      {frequencyOptions.map((option) => (
        <label key={option.id} className="week-choice" data-selected={value === option.id}>
          <input
            type="radio"
            name="week-frequency"
            value={option.id}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
          />
          <span>
            <strong>{option.label}</strong>
            <span className="week-muted week-choice-description">{option.description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

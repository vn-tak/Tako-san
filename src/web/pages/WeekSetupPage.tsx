import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MealPlanSetupInput, WeeklyPriority, ShoppingFrequency } from '@frigo/domain';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useWeekStore } from '../stores/useWeekStore';
import { WeekWorkspace, weekCurrency } from '../features/week/WeekWorkspace';
import {
  WeekBudgetChoices,
  WeekFrequencyChoices,
  frequencyOptions,
} from '../features/week/WeekSetupChoices';

const presets: { id: MealPlanSetupInput['mealSlotsPreset']; title: string; description: string }[] =
  [
    {
      id: 'dinner_only',
      title: 'Chỉ bữa tối',
      description: 'Bữa tối tại nhà từ thứ 2 đến chủ nhật.',
    },
    {
      id: 'working_people',
      title: 'Người đi làm bận rộn',
      description: 'Bữa tối ngày thường; bữa trưa và tối cuối tuần.',
    },
    { id: 'all', title: 'Sáng, trưa và tối', description: 'Lên kế hoạch cho cả ba bữa mỗi ngày.' },
  ];
const prioritiesOptions: { id: WeeklyPriority; label: string }[] = [
  { id: 'use_fridge', label: 'Dùng đồ trong tủ' },
  { id: 'budget', label: 'Tiết kiệm chi phí' },
  { id: 'quick', label: 'Ưu tiên nấu nhanh' },
  { id: 'variety', label: 'Ăn đa dạng, đổi món' },
  { id: 'more_veggies', label: 'Nhiều rau xanh hơn' },
  { id: 'high_protein', label: 'Giàu đạm hơn' },
  { id: 'low_oil', label: 'Ít dầu mỡ hơn' },
  { id: 'less_shopping', label: 'Ít mua thêm' },
  { id: 'meal_prep', label: 'Ưu tiên chuẩn bị sẵn' },
  { id: 'new_recipes', label: 'Thử món mới' },
];
const steps = ['Bữa ăn', 'Ngân sách', 'Ưu tiên', 'Đi chợ'];

export function WeekSetupPage() {
  const navigate = useNavigate();
  const { setupDraft, updateSetupDraft } = useWeekStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [mealPreset, setMealPreset] = useState(setupDraft.mealSlotsPreset || 'dinner_only');
  const [budget, setBudget] = useState<number | null>(
    setupDraft.budgetTargetVnd !== undefined ? setupDraft.budgetTargetVnd : 750000,
  );
  const [priorities, setPriorities] = useState<WeeklyPriority[]>(
    setupDraft.priorities || ['use_fridge'],
  );
  const [frequency, setFrequency] = useState<ShoppingFrequency>(
    setupDraft.shoppingFrequency || 'once',
  );
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stepHeading.current?.focus();
  }, [currentStep]);

  function togglePriority(priority: WeeklyPriority) {
    setPriorities((selected) =>
      selected.includes(priority)
        ? selected.length > 1
          ? selected.filter((value) => value !== priority)
          : selected
        : selected.length < 3
          ? [...selected, priority]
          : selected,
    );
  }
  function next() {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }
    updateSetupDraft({
      mealSlotsPreset: mealPreset,
      budgetTargetVnd: budget,
      priorities,
      shoppingFrequency: frequency,
    });
    navigate('/week/generating');
  }

  return (
    <WeekWorkspace
      title="Một tuần ăn uống, có kế hoạch."
      narrow
      description="Chọn bữa ăn và các ưu tiên của bạn. Bạn sẽ xem lại thực đơn trước khi đi chợ hoặc nấu."
    >
      <ol className="week-step-list" aria-label="Các bước thiết lập">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={currentStep === index + 1 ? 'step' : undefined}
            data-complete={currentStep > index + 1}
          >
            <span aria-hidden="true">0{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <section className="week-paper week-setup-stage" aria-labelledby="week-step-heading">
        <p className="week-eyebrow">Bước {currentStep} / 4</p>
        <h2 id="week-step-heading" ref={stepHeading} tabIndex={-1}>
          {
            [
              'Bạn muốn lên kế hoạch cho những bữa nào?',
              'Bạn muốn dành bao nhiêu cho việc mua thêm?',
              'Tuần này bạn ưu tiên điều gì?',
              'Bạn muốn đi chợ mấy lần?',
            ][currentStep - 1]
          }
        </h2>
        {currentStep === 1 && (
          <fieldset className="week-choices">
            <legend className="sr-only">Bữa ăn cần lên kế hoạch</legend>
            {presets.map((option) => (
              <label
                key={option.id}
                className="week-choice"
                data-selected={mealPreset === option.id}
              >
                <input
                  type="radio"
                  name="week-preset"
                  value={option.id}
                  checked={mealPreset === option.id}
                  onChange={() => setMealPreset(option.id)}
                />
                <span>
                  <strong>{option.title}</strong>
                  <span className="week-muted week-choice-description">{option.description}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
        {currentStep === 2 && (
          <>
            <p className="week-muted">
              Chi phí trong thực đơn là ước tính, có thể khác giá thực tế khi mua.
            </p>
            <WeekBudgetChoices value={budget} onChange={setBudget} />
          </>
        )}
        {currentStep === 3 && (
          <>
            <p className="week-muted" aria-live="polite">
              Chọn từ 1 đến 3 ưu tiên. Đang chọn {priorities.length}/3.
            </p>
            <fieldset className="week-choices">
              <legend className="sr-only">Ưu tiên cho thực đơn</legend>
              <div className="week-choice-grid">
                {prioritiesOptions.map((option) => {
                  const selected = priorities.includes(option.id);
                  return (
                    <label key={option.id} className="week-choice" data-selected={selected}>
                      <input
                        type="checkbox"
                        name="week-priority"
                        value={option.id}
                        checked={selected}
                        disabled={selected ? priorities.length === 1 : priorities.length === 3}
                        onChange={() => togglePriority(option.id)}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </>
        )}
        {currentStep === 4 && (
          <>
            <WeekFrequencyChoices value={frequency} onChange={setFrequency} />
            <div className="week-note">
              <h3>Kiểm tra trước khi tạo</h3>
              <p>
                {presets.find((p) => p.id === mealPreset)?.title} ·{' '}
                {budget === null ? 'Không giới hạn ngân sách' : weekCurrency(budget)} ·{' '}
                {frequencyOptions.find((f) => f.id === frequency)?.label}
              </p>
              <p>
                {priorities
                  .map((priority) => prioritiesOptions.find((p) => p.id === priority)?.label)
                  .join(' · ')}
              </p>
              <p className="week-muted">Tạo thực đơn chưa mua thêm hay trừ nguyên liệu trong tủ.</p>
            </div>
          </>
        )}
        <div className="week-actions week-setup-actions">
          <button
            type="button"
            className="week-button week-button-secondary"
            onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/week'))}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            {currentStep === 1 ? 'Về thực đơn' : 'Bước trước'}
          </button>
          <button type="button" className="week-button" onClick={next}>
            {currentStep === 4 ? 'Tạo thực đơn tuần' : 'Tiếp tục'}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>
    </WeekWorkspace>
  );
}

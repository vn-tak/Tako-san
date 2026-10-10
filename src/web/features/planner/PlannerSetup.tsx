import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { mealPlanningApi } from '../../services/meal-planning';
import { plannerCopy, type PlannerLocale } from './copy';
import { buildPlanningIntent, localDate } from './intent';
import type { usePlanner } from './usePlanner';

export const plannerInputClass =
  'planning-input block w-full min-h-11 mt-1 rounded-xl border border-semantic-border-strong bg-white p-3 text-sm text-semantic-text-primary focus:ring-2 focus:ring-takosan-green focus:outline-none';

export function PlannerSetup({
  model,
  locale,
}: {
  model: ReturnType<typeof usePlanner>;
  locale: PlannerLocale;
}) {
  const t = plannerCopy[locale];
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(() => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    return localDate(next);
  });
  const [days, setDays] = useState(7);
  const [servings, setServings] = useState(2);
  const [meals, setMeals] = useState<Array<'breakfast' | 'lunch' | 'dinner'>>(['dinner']);
  const [mode, setMode] = useState<'shopping_allowed' | 'cook_now'>('shopping_allowed');
  const [maxTime, setMaxTime] = useState('');
  const [invalid, setInvalid] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (invalid) {
      errorRef.current?.focus();
      errorRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [invalid]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setInvalid(false);
    let intent;
    try {
      intent = buildPlanningIntent({
        startDate,
        days,
        servings,
        meals,
        mode,
        maxTime,
        offset: -new Date().getTimezoneOffset(),
      });
    } catch {
      setInvalid(true);
      return;
    }
    const plan = await model.perform(
      'generate',
      () => mealPlanningApi.generate(intent, model.requestKey(intent)),
      (result) => {
        model.replacePlan(result);
        model.retireRequestKey(intent);
      },
    );
    if (plan) navigate(`/planner/${plan.id}`, { replace: true });
  }
  return (
    <div className="planning-setup-layout">
      <Card className="planning-setup-form">
        <div className="flex items-center gap-3 mb-5">
          <span className="p-3 rounded-2xl bg-takosan-mint text-takosan-green-deep">
            <CalendarDays />
          </span>
          <h2 className="text-xl font-heading font-bold text-semantic-text-primary">{t.newPlan}</h2>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <fieldset disabled={!!model.busy} className="space-y-5 disabled:opacity-70">
            <label className="block text-sm font-semibold">
              {t.date}
              <input
                type="date"
                name="start-date"
                required
                min={localDate()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={plannerInputClass}
              />
            </label>
            <div className="planning-pair">
              <label className="text-sm font-semibold">
                {t.days}
                <input
                  type="number"
                  min={1}
                  max={14}
                  required
                  name="days"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className={plannerInputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                {t.servings}
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  name="servings"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className={plannerInputClass}
                />
              </label>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold mb-2">{t.slots}</legend>
              <div className="planning-meal-choices">
                {(['breakfast', 'lunch', 'dinner'] as const).map((type) => (
                  <label
                    key={type}
                    className={`flex flex-col sm:flex-row items-center gap-2 p-3 rounded-xl border text-sm cursor-pointer ${meals.includes(type) ? 'bg-takosan-mint border-takosan-green text-takosan-green-deep' : 'border-semantic-border'}`}
                  >
                    <input
                      type="checkbox"
                      checked={meals.includes(type)}
                      onChange={(e) =>
                        setMeals(
                          e.target.checked
                            ? [...meals, type]
                            : meals.filter((item) => item !== type),
                        )
                      }
                      className="accent-takosan-green w-4 h-4"
                    />
                    {t[type]}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm font-semibold">
              {t.mode}
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
                className={plannerInputClass}
              >
                <option value="shopping_allowed">{t.allowShopping}</option>
                <option value="cook_now">{t.cookNow}</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              {t.maxTime}
              <input
                type="number"
                min={1}
                max={1440}
                name="max-time"
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                className={plannerInputClass}
              />
            </label>
          </fieldset>
          <details className="planning-setup-details">
            <summary>{locale === 'vi' ? 'Điều cần biết về kế hoạch' : 'About your plan'}</summary>
            <p>{t.future}</p>
            <p>{t.policy}</p>
            <p>{t.timezone}</p>
          </details>
          {invalid && (
            <p ref={errorRef} tabIndex={-1} role="alert" className="planning-error">
              {t.invalidForm}
            </p>
          )}
          <Button type="submit" fullWidth size="lg" isLoading={!!model.busy}>
            {t.generate}
          </Button>
          {model.busy && (
            <p role="status" className="text-sm text-center text-takosan-green-deep">
              {t.generating}
            </p>
          )}
        </form>
      </Card>
      <aside className="planning-setup-context">
        <p className="planning-eyebrow">{locale === 'vi' ? 'TUẦN CỦA BẠN' : 'YOUR WEEK'}</p>
        <h2>
          {locale === 'vi' ? 'Chọn bữa trước. Đi chợ sau.' : 'Choose meals first. Shop next.'}
        </h2>
        <p>{t.intro}</p>
        <dl>
          <div>
            <dt>{t.days}</dt>
            <dd>{days}</dd>
          </div>
          <div>
            <dt>{locale === 'vi' ? 'Tổng số bữa' : 'Total meals'}</dt>
            <dd>{meals.length * days}</dd>
          </div>
          <div>
            <dt>{t.servings}</dt>
            <dd>{servings}</dd>
          </div>
        </dl>
        <p className="planning-context-choice">
          {mode === 'cook_now' ? t.cookNow : t.allowShopping}
        </p>
        <p className="planning-note">{t.planNote}</p>
      </aside>
    </div>
  );
}

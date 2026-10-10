import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, ShoppingBag, ArrowRight } from 'lucide-react';
import type { MealPlanDto } from '../../../../packages/domain/src/meal-planning-api';
import { KitchenHeader } from '../../components/common/KitchenHeader';
import { plannerCopy, type PlannerLocale } from './copy';
import { freshnessReasonLabel, plannerErrorMessage } from './presentation';
import { Button } from '../../components/common/Button';

export function PlannerShell({
  children,
  plan,
  locale,
  setLocale,
}: {
  children: ReactNode;
  plan?: MealPlanDto | null;
  locale: PlannerLocale;
  setLocale: (locale: PlannerLocale) => void;
}) {
  const t = plannerCopy[locale];
  const shopping = useLocation().pathname.endsWith('/shopping');
  return (
    <div className="planning-workspace" lang={locale}>
      <KitchenHeader backTo="/" />
      <div className="planning-page-body">
        <header className="planning-heading">
          <div>
            <p className="planning-eyebrow" translate="no">
              {t.eyebrow}
            </p>
            <h1>{t.title}</h1>
            <p className="planning-intro">{t.intro}</p>
          </div>
          <label className="planning-locale">
            Language
            <select
              aria-label="Language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as PlannerLocale)}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </label>
        </header>
        {plan && (
          <nav aria-label={t.week} className="planning-tabs">
            <Link to={`/planner/${plan.id}`} aria-current={!shopping ? 'page' : undefined}>
              <CalendarDays size={18} aria-hidden="true" />
              {t.week}
            </Link>
            <Link to={`/planner/${plan.id}/shopping`} aria-current={shopping ? 'page' : undefined}>
              <ShoppingBag size={18} aria-hidden="true" />
              {t.shopping}
            </Link>
          </nav>
        )}
        <div className="planning-content">{children}</div>
        <footer className="planning-footer">
          <p>{t.planNote}</p>
          <Link className="planning-text-link" to="/shopping">
            {locale === 'vi' ? 'Danh sách mua sắm đã lưu' : 'Saved shopping list'}{' '}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </div>
  );
}

export function PlannerError({
  error,
  locale,
  onRetry,
  focus = false,
}: {
  error: unknown;
  locale: PlannerLocale;
  onRetry?: () => void;
  focus?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dialog = document.querySelector('[role="dialog"][aria-modal="true"], dialog[open]');
    if (focus && (!dialog || dialog.contains(ref.current))) {
      ref.current?.focus();
      ref.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [error, focus]);
  return (
    <div
      ref={ref}
      tabIndex={focus ? -1 : undefined}
      role="alert"
      className="planning-notice planning-error"
    >
      <p>{plannerErrorMessage(error, locale)}</p>
      {onRetry && (
        <Button className="mt-3" variant="outline" onClick={onRetry}>
          {plannerCopy[locale].retry}
        </Button>
      )}
    </div>
  );
}

export function FreshnessNotice({ plan, locale }: { plan: MealPlanDto; locale: PlannerLocale }) {
  if (plan.freshness.status === 'fresh') return null;
  const t = plannerCopy[locale];
  const past = plan.freshness.reasons.includes('planning_time_elapsed');
  return (
    <section role="status" className="planning-notice planning-stale">
      <h2>{t.staleTitle}</h2>
      <p>{past ? t.historical : t.staleText}</p>
      <ul>
        {plan.freshness.reasons.map((code) => (
          <li key={code}>{freshnessReasonLabel(code, locale)}</li>
        ))}
      </ul>
      <Link className="planning-text-link" to="/planner/new">
        {t.newPlan}
      </Link>
    </section>
  );
}

import { Button } from '../../components/common/Button';
import { PlannerError } from './PlannerShell';
import { plannerCopy, type PlannerLocale } from './copy';
import { compositionCopy, usePlanCompositions } from './composition';

export function CompositionLoadState({ query, locale, missing = false }: {
  query: ReturnType<typeof usePlanCompositions>; locale: PlannerLocale; missing?: boolean;
}) {
  if (query.isError) return <PlannerError error={query.error} locale={locale} onRetry={() => void query.refetch()} />;
  if (query.isPending) return <p role="status" className="text-sm">{compositionCopy[locale].loadingDishes}</p>;
  if (!missing) return null;
  return <div role="alert" className="rounded-xl border border-semantic-danger/30 bg-semantic-danger-soft p-4 text-sm text-semantic-danger-strong">
    <p>{compositionCopy[locale].loadFailed}</p>
    <Button className="mt-3" variant="outline" onClick={() => void query.refetch()}>{plannerCopy[locale].retry}</Button>
  </div>;
}

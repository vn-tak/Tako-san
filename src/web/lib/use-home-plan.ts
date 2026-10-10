import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { mealPlanningApi } from '../services/meal-planning';
import { isMealPlannerEnabled } from '../features/planner/feature';
import {
  compositionUnavailable,
  isMealCompositionEnabled,
  usePlanCompositions,
} from '../features/planner/composition';
import { queryKeys } from './queryKeys';
import { presentCanonicalHome, presentLegacyHome, type CompositionEvidence } from './home-plan';

export function useHomePlan(now: Date) {
  const client = useQueryClient();
  const enabled = isMealPlannerEnabled();
  const canonical = useQuery({
    queryKey: queryKeys.currentMealPlanningPlan(),
    queryFn: async () => (await mealPlanningApi.current()).plan,
    enabled,
    retry: false,
    staleTime: 0,
  });
  const legacy = useQuery({
    queryKey: queryKeys.currentWeekPlan(),
    queryFn: () => api.getCurrentWeekPlan(),
    enabled: !enabled,
  });
  const compositions = usePlanCompositions(
    canonical.data ?? undefined,
    enabled && canonical.isSuccess,
  );
  const query = enabled ? canonical : legacy;
  let evidence: CompositionEvidence = { kind: 'legacy' };
  if (enabled && isMealCompositionEnabled() && !compositionUnavailable(compositions.error)) {
    evidence = compositions.isError
      ? { kind: 'error' }
      : compositions.isPending
        ? { kind: 'pending' }
        : compositions.data?.planRevision !== canonical.data?.revision
          ? { kind: 'mismatch' }
          : { kind: 'ready', data: compositions.data! };
  }
  const plan = enabled
    ? canonical.data
      ? presentCanonicalHome(canonical.data, now, evidence)
      : null
    : legacy.data
      ? presentLegacyHome(legacy.data, now)
      : null;
  const retry = async () => {
    if (enabled) {
      const fresh = await canonical.refetch();
      if (fresh.isSuccess && fresh.data && isMealCompositionEnabled()) {
        // Target the returned revision; refetching this render's observer can request an old plan.
        await client.invalidateQueries({
          queryKey: queryKeys.mealPlanningCompositions(fresh.data.id, fresh.data.revision),
          exact: true,
        });
      }
    } else await legacy.refetch();
  };
  return { query, plan, retry, setupHref: enabled ? '/planner/new' : '/week/setup' };
}

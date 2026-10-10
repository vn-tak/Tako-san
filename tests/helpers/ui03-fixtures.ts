import type { RecipeMatchResult } from '@frigo/recipes';
import {
  DiscoveryQuerySchema,
  type DiscoveryParams,
} from '../../packages/recipes/src/discovery-contract';
import { presentDiscoveryPage, selectDiscoveryPage } from '../../packages/recipes/src/discovery';
import { filterDiscoveryResults } from '../../src/web/lib/recipe-discovery';

export const DISCOVERY_FIXTURE_SNAPSHOT = 'a'.repeat(64);
export function discoveryFixture(matches: RecipeMatchResult[], params: DiscoveryParams = {}) {
  const query = DiscoveryQuerySchema.parse(params);
  const filtered = filterDiscoveryResults(matches, {
    q: query.q,
    cuisine: query.cuisine ?? null,
    category: query.category ?? null,
    region: query.region ?? null,
    noBuy: query.noBuy,
    fast: query.maxTime === 20,
    page: query.page,
  });
  return presentDiscoveryPage(
    selectDiscoveryPage(filtered, query, DISCOVERY_FIXTURE_SNAPSHOT),
    'server',
  );
}

import type { Env, AuthContext } from '../types';
import type { RecipeAuthoritySnapshot } from '../../../packages/recipes/src/recipe-authority';
import type { DiscoveryQuery } from '../../../packages/recipes/src/discovery-contract';
import {
  discoverySnapshot,
  rankDiscovery,
  selectDiscoveryPage,
  presentDiscoveryPage,
} from '../../../packages/recipes/src/discovery';
import { InventoryReadError, fetchHouseholdInventoryFromDb } from '../routes/inventory';
import { enrichRecipesWithMedia } from './recipe-media';

export async function discoverRecipes(
  env: Env,
  auth: AuthContext,
  catalog: RecipeAuthoritySnapshot,
  query: DiscoveryQuery,
) {
  const inventory = await fetchHouseholdInventoryFromDb(env.DB, auth.householdId, undefined, {
    actorId: auth.userId,
    strict: true,
  }).catch(() => {
    throw new InventoryReadError();
  });
  const snapshot = await discoverySnapshot({
    source: `server:${catalog.source}`,
    catalogFingerprint: catalog.fingerprint,
    userId: auth.userId,
    householdId: auth.householdId,
    inventory,
    query,
  });
  const selection = selectDiscoveryPage(
    rankDiscovery(catalog.list(), inventory, query),
    query,
    snapshot,
  );
  const page = presentDiscoveryPage(selection, 'server');
  const recipes = await enrichRecipesWithMedia(
    env,
    page.items.map((item) => item.recipe),
  );
  return { ...page, items: page.items.map((item, index) => ({ ...item, recipe: recipes[index] })) };
}

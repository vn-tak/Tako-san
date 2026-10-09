import { rankRecipes } from './engine';
import type { Recipe, RecipeMatchResult, RecipeScoringContext } from './types';
import { stableRuntimeJson } from './runtime-recipe';
import {
  DISCOVERY_CURSOR_PATTERN,
  type DiscoveryItem,
  type DiscoveryPage,
  type DiscoveryQuery,
} from './discovery-contract';

export class DiscoveryCursorError extends Error {
  constructor(readonly code: 'DISCOVERY_CURSOR_INVALID' | 'DISCOVERY_SNAPSHOT_CHANGED') {
    super(code);
  }
}
export const normalizeDiscoverySearch = (value: string) =>
  value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');

export function rankDiscovery(
  recipes: Recipe[],
  inventory: RecipeScoringContext['inventory'],
  query: DiscoveryQuery,
): RecipeMatchResult[] {
  const search = normalizeDiscoverySearch(query.q.trim());
  const candidates = recipes.filter((recipe) => {
    if (query.cuisine && recipe.cuisine !== query.cuisine) return false;
    if (query.category && recipe.category !== query.category) return false;
    if (query.region && recipe.region !== query.region && recipe.region !== 'toan_quoc')
      return false;
    if (query.maxTime && recipe.cookTimeMinutes > query.maxTime) return false;
    return (
      !search ||
      [
        recipe.title,
        recipe.description,
        ...recipe.tags,
        ...recipe.ingredients.map((line) => line.name),
      ].some((text) => normalizeDiscoverySearch(text).includes(search))
    );
  });
  return rankRecipes(candidates, {
    inventory,
    onlyNoBuyNeeded: query.noBuy,
    maxCookTimeMinutes: query.maxTime,
    preferredCuisines: query.cuisine ? [query.cuisine] : undefined,
  }).sort(
    (a, b) =>
      b.score - a.score ||
      b.matchPercentage - a.matchPercentage ||
      a.recipe.cookTimeMinutes - b.recipe.cookTimeMinutes ||
      (a.recipe.id < b.recipe.id ? -1 : a.recipe.id > b.recipe.id ? 1 : 0),
  );
}

export async function discoverySnapshot(input: {
  source: string;
  catalogFingerprint: string;
  userId: string;
  householdId: string;
  inventory: RecipeScoringContext['inventory'];
  query: DiscoveryQuery;
}): Promise<string> {
  const { page: _page, cursor: _cursor, ...filters } = input.query;
  // Sorting JSON rows removes dependence on database row order while retaining versions/quantity evidence.
  const inventory = input.inventory.map((row) => stableRuntimeJson(row)).sort();
  const text = stableRuntimeJson({
    version: 1,
    source: input.source,
    catalog: input.catalogFingerprint,
    userId: input.userId,
    householdId: input.householdId,
    inventory,
    filters: { ...filters, q: normalizeDiscoverySearch(filters.q.trim()) },
  });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function selectDiscoveryPage(
  ranked: RecipeMatchResult[],
  query: DiscoveryQuery,
  snapshot: string,
) {
  if (query.cursor) {
    const cursor = DISCOVERY_CURSOR_PATTERN.exec(query.cursor);
    if (!cursor || Number(cursor[1]) !== query.page)
      throw new DiscoveryCursorError('DISCOVERY_CURSOR_INVALID');
    if (cursor[2] !== snapshot) throw new DiscoveryCursorError('DISCOVERY_SNAPSHOT_CHANGED');
  }
  const pages = Math.max(1, Math.ceil(ranked.length / query.pageSize));
  const page = Math.min(query.page, pages);
  const offset = (page - 1) * query.pageSize;
  return {
    selected: ranked.slice(offset, offset + query.pageSize),
    total: ranked.length,
    page,
    pageSize: query.pageSize,
    pages,
    snapshot,
    previousCursor: page > 1 ? `v1.${page - 1}.${snapshot}` : null,
    nextCursor: page < pages ? `v1.${page + 1}.${snapshot}` : null,
  };
}

export function summarizeDiscovery(match: RecipeMatchResult): DiscoveryItem {
  const { id, slug, title, description, cuisine, cookTimeMinutes, servings, imageUrl } =
    match.recipe;
  return {
    recipe: { id, slug, title, description, cuisine, cookTimeMinutes, servings, imageUrl },
    matchPercentage: match.matchPercentage,
    canCookWithoutBuying: match.canCookWithoutBuying,
    missingRequiredIngredientCount: match.missingRequiredIngredients.length,
  };
}

export function presentDiscoveryPage(
  selection: ReturnType<typeof selectDiscoveryPage>,
  source: DiscoveryPage['source'],
): DiscoveryPage {
  const { selected, ...metadata } = selection;
  return { schemaVersion: 1, source, ...metadata, items: selected.map(summarizeDiscovery) };
}

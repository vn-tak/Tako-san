import type { RecipeMatchResult, VietnameseCategory } from '@frigo/recipes';

export const DISCOVERY_PAGE_SIZE = 24;
export const DISCOVERY_CUISINES = [
  'vietnamese',
  'korean',
  'japanese',
  'chinese',
  'thai',
  'italian',
] as const;
export const DISCOVERY_CATEGORIES: VietnameseCategory[] = [
  'mon_canh',
  'mon_kho',
  'mon_xao',
  'mon_chien',
  'mon_hap_luoc',
  'mon_cuon_nom',
  'mon_bun_pho',
  'mon_chay',
  'mon_nhanh_sang',
  'mon_lau_tiec',
];
export const DISCOVERY_REGIONS = ['bac', 'trung', 'nam'] as const;
export interface DiscoveryFilters {
  q: string;
  cuisine: string | null;
  category: VietnameseCategory | null;
  region: 'bac' | 'trung' | 'nam' | null;
  noBuy: boolean;
  fast: boolean;
  page: number;
}

function accepted<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  return allowed.find((item) => item === value) ?? null;
}
export function readDiscoveryFilters(params: URLSearchParams): DiscoveryFilters {
  const page = params.get('page');
  return {
    q: (params.get('q') ?? '').slice(0, 160),
    cuisine: accepted(params.get('cuisine'), DISCOVERY_CUISINES),
    category: accepted(params.get('category'), DISCOVERY_CATEGORIES),
    region: accepted(params.get('region'), DISCOVERY_REGIONS),
    noBuy: params.get('noBuy') === 'true',
    fast: params.get('maxTime') === '20',
    page: page && /^[1-9][0-9]{0,3}$/.test(page) ? Number(page) : 1,
  };
}
export function updateDiscoveryFilters(params: URLSearchParams, patch: Partial<DiscoveryFilters>) {
  const next = new URLSearchParams(params);
  if (!Object.hasOwn(patch, 'page')) next.delete('page');
  for (const [key, value] of Object.entries(patch)) {
    const name = key === 'fast' ? 'maxTime' : key;
    const encoded =
      key === 'fast'
        ? value
          ? '20'
          : ''
        : key === 'noBuy'
          ? value
            ? 'true'
            : ''
          : String(value ?? '');
    if (!encoded || (key === 'page' && value === 1)) next.delete(name);
    else next.set(name, encoded);
  }
  return next;
}
export function resetDiscoveryFilters(params: URLSearchParams) {
  const next = new URLSearchParams(params);
  for (const name of ['q', 'cuisine', 'category', 'region', 'noBuy', 'maxTime', 'page'])
    next.delete(name);
  return next;
}
const normalized = (value: string) =>
  value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd');
export function filterDiscoveryResults(recipes: RecipeMatchResult[], filters: DiscoveryFilters) {
  const search = normalized(filters.q.trim());
  return recipes.filter(({ recipe, canCookWithoutBuying }) => {
    if (filters.noBuy && !canCookWithoutBuying) return false;
    if (filters.fast && recipe.cookTimeMinutes > 20) return false;
    if (filters.cuisine && recipe.cuisine !== filters.cuisine) return false;
    if (filters.category && recipe.category !== filters.category) return false;
    if (filters.region && recipe.region !== filters.region && recipe.region !== 'toan_quoc')
      return false;
    if (!search) return true;
    return [
      recipe.title,
      recipe.description,
      ...recipe.tags,
      ...recipe.ingredients.map((item) => item.name),
    ].some((value) => normalized(value).includes(search));
  });
}
export function pageDiscoveryResults(results: RecipeMatchResult[], requestedPage: number) {
  const pages = Math.max(1, Math.ceil(results.length / DISCOVERY_PAGE_SIZE));
  const page = Math.min(requestedPage, pages);
  const offset = (page - 1) * DISCOVERY_PAGE_SIZE;
  return { page, pages, offset, items: results.slice(offset, offset + DISCOVERY_PAGE_SIZE) };
}

import { z } from 'zod';

export const DISCOVERY_PAGE_SIZE = 24;
export const DISCOVERY_CUISINES = [
  'vietnamese',
  'korean',
  'japanese',
  'chinese',
  'thai',
  'italian',
] as const;
export const DISCOVERY_CATEGORIES = [
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
] as const;
export const DISCOVERY_REGIONS = ['bac', 'trung', 'nam'] as const;
export const DISCOVERY_CURSOR_PATTERN = /^v1\.([1-9][0-9]{0,3})\.([a-f0-9]{64})$/;
const integer = (fallback: number, max: number) =>
  z.preprocess(
    (value) =>
      value === undefined
        ? fallback
        : typeof value === 'string' && /^[1-9][0-9]*$/.test(value)
          ? Number(value)
          : value,
    z.number().int().min(1).max(max),
  );
export const DiscoveryQuerySchema = z
  .object({
    q: z.string().max(160).default(''),
    cuisine: z.enum(DISCOVERY_CUISINES).optional(),
    category: z.enum(DISCOVERY_CATEGORIES).optional(),
    region: z.enum(DISCOVERY_REGIONS).optional(),
    noBuy: z.preprocess(
      (value) => (value === 'true' ? true : value === 'false' ? false : value),
      z.boolean().default(false),
    ),
    maxTime: z.preprocess(
      (value) => (typeof value === 'string' && /^[1-9][0-9]*$/.test(value) ? Number(value) : value),
      z.number().int().min(1).max(240).optional(),
    ),
    page: integer(1, 9999),
    pageSize: integer(DISCOVERY_PAGE_SIZE, DISCOVERY_PAGE_SIZE),
    cursor: z.string().max(80).regex(DISCOVERY_CURSOR_PATTERN).optional(),
  })
  .strict();
export type DiscoveryQuery = z.output<typeof DiscoveryQuerySchema>;
export type DiscoveryParams = Partial<DiscoveryQuery>;

const HeroSchema = z
  .object({
    url: z.string().nullable(),
    source: z.enum(['canonical_r2', 'legacy_static', 'legacy_external', 'missing']),
    version: z.number().int().positive().nullable(),
    width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
  })
  .strict();
export const DiscoveryItemSchema = z
  .object({
    recipe: z
      .object({
        id: z.string().min(1),
        slug: z.string().min(1),
        title: z.string().min(1),
        description: z.string(),
        cuisine: z.enum(DISCOVERY_CUISINES),
        cookTimeMinutes: z.number().int().positive(),
        servings: z.number().positive(),
        imageUrl: z.string(),
        media: z.object({ hero: HeroSchema }).strict().optional(),
      })
      .strict(),
    matchPercentage: z.number().int().min(0).max(100),
    canCookWithoutBuying: z.boolean(),
    missingRequiredIngredientCount: z.number().int().nonnegative(),
  })
  .strict();
export type DiscoveryItem = z.infer<typeof DiscoveryItemSchema>;
export const DiscoveryPageSchema = z
  .object({
    schemaVersion: z.literal(1),
    source: z.enum(['server', 'device']),
    snapshot: z.string().regex(/^[a-f0-9]{64}$/),
    items: z.array(DiscoveryItemSchema).max(DISCOVERY_PAGE_SIZE),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().min(1).max(DISCOVERY_PAGE_SIZE),
    pages: z.number().int().positive(),
    previousCursor: z.string().regex(DISCOVERY_CURSOR_PATTERN).nullable(),
    nextCursor: z.string().regex(DISCOVERY_CURSOR_PATTERN).nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const cursor = (page: number) => `v1.${page}.${value.snapshot}`;
    const count = Math.max(
      0,
      Math.min(value.pageSize, value.total - (value.page - 1) * value.pageSize),
    );
    if (
      value.pages !== Math.max(1, Math.ceil(value.total / value.pageSize)) ||
      value.page > value.pages ||
      value.items.length !== count ||
      value.previousCursor !== (value.page > 1 ? cursor(value.page - 1) : null) ||
      value.nextCursor !== (value.page < value.pages ? cursor(value.page + 1) : null) ||
      new Set(value.items.map((item) => item.recipe.id)).size !== value.items.length ||
      value.items.some(
        (item) => item.canCookWithoutBuying !== (item.missingRequiredIngredientCount === 0),
      )
    ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Inconsistent discovery page' });
    }
  });
export type DiscoveryPage = z.infer<typeof DiscoveryPageSchema>;

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import {
  budgetStatusLabel,
  formatMoney,
  formatQuantity,
  freshnessReasonLabel,
  ingredientLabel,
  parseBudgetMinorAmount,
  plannerConclusionLabel,
  plannerCopy,
  plannerErrorMessage,
  plannerLocale,
  plannerStatusLabel,
  reasonLabel,
  wasteRiskLabel,
} from '../../src/web/features/planner/presentation';
import { ApiError } from '../../src/web/services/http';

describe('exact planner money presentation', () => {
  it.each([
    ['JPY', '4820', '¥4,820'],
    ['JPY', '9007199254740993123456789', '¥9,007,199,254,740,993,123,456,789'],
    ['USD', '9007199254740993123456789', '$90,071,992,547,409,931,234,567.89'],
    ['USD', '1', '$0.01'],
    ['USD', '100', '$1.00'],
    ['USD', '101', '$1.01'],
    ['USD', '0', '$0.00'],
    ['JPY', '0', '¥0'],
    ['EUR', '12345', '€123.45'],
  ] as const)('preserves %s minor amount %s', (currency, minorAmount, expected) => {
    const money = Object.freeze({ currency, minorAmount });
    expect(formatMoney(money, 'en')).toBe(expected);
    expect(money.minorAmount).toBe(minorAmount);
  });

  it('keeps all 100 allowed digits rather than rounding or switching to scientific notation', () => {
    const minorAmount = '9'.repeat(100);
    for (const currency of ['JPY', 'USD'] as const) {
      const formatted = formatMoney({ currency, minorAmount }, 'en');
      expect(formatted.replace(/\D/g, '')).toBe(minorAmount);
      expect(formatted).not.toContain('e+');
    }
  });

  it('localizes separators without changing exact fractional digits', () => {
    expect(formatMoney({ currency: 'USD', minorAmount: '9007199254740993123' }, 'vi')).toContain(
      '90.071.992.547.409.931,23',
    );
    expect(formatMoney({ currency: 'VND', minorAmount: '4820' }, 'vi')).toContain('4.820');
  });

  it('keeps unknown and malformed money separate from known zero', () => {
    for (const input of [
      null,
      undefined,
      { currency: 'USD' as const, minorAmount: 'not-a-price' },
    ]) {
      expect(formatMoney(input, 'en')).toBe(plannerCopy.en.ui.unknownPrice);
      expect(formatMoney(input, 'vi')).toBe(plannerCopy.vi.ui.unknownPrice);
    }
    expect(formatMoney({ currency: 'USD', minorAmount: '0' }, 'en')).not.toBe(
      plannerCopy.en.ui.unknownPrice,
    );
  });
});

describe('exact budget user intent parsing', () => {
  it.each([
    ['0', 'USD', 'en', '0'],
    ['0001.02', 'USD', 'en', '102'],
    ['12.3', 'USD', 'en', '1230'],
    ['12,34', 'EUR', 'vi', '1234'],
    ['12.34', 'EUR', 'vi', '1234'],
    [' 4820 ', 'JPY', 'en', '4820'],
    ['90071992547409.91', 'USD', 'en', '9007199254740991'],
    ['9007199254740991', 'VND', 'vi', '9007199254740991'],
  ] as const)('parses %s %s exactly', (input, currency, locale, expected) => {
    expect(parseBudgetMinorAmount(input, currency, locale)).toBe(expected);
  });

  it.each([
    '',
    ' ',
    '-1',
    '+1',
    '1e3',
    'NaN',
    'Infinity',
    '12.345',
    '1,000.00',
    '1.000,00',
    '1 000',
    '.1',
    '1.',
    '90071992547409.92',
  ])('rejects unsupported or ambiguous USD input %s without rounding', (input) => {
    expect(parseBudgetMinorAmount(input, 'USD', 'en')).toBeNull();
  });

  it('rejects fractional zero-minor-digit currencies and out-of-range budgets', () => {
    expect(parseBudgetMinorAmount('1.00', 'JPY', 'en')).toBeNull();
    expect(parseBudgetMinorAmount('1,01', 'VND', 'vi')).toBeNull();
    expect(parseBudgetMinorAmount('9007199254740992', 'JPY')).toBeNull();
    expect(parseBudgetMinorAmount('9'.repeat(101), 'USD')).toBeNull();
    expect(parseBudgetMinorAmount('1,23', 'USD', 'en')).toBeNull();
  });
});

describe('quantity and ingredient presentation', () => {
  it.each(['0', '0.000001', '5e-17', '1e+21', '0.30000000000000004'])(
    'preserves raw canonical quantity %s',
    (value) => {
      expect(formatQuantity({ value, unit: 'g' }, 'en')).toBe(`${value} g`);
    },
  );

  it('localizes contextual units without inventing conversions', () => {
    expect(formatQuantity({ value: '2', unit: 'bunch' }, 'vi')).toBe('2 bó');
    expect(formatQuantity({ value: '2', unit: 'pack' }, 'en')).toBe('2 pack(s)');
    expect(formatQuantity(null, 'vi')).toBe(plannerCopy.vi.ui.unknownQuantity);
    expect(formatQuantity({ value: 'unknown', unit: 'g' }, 'en')).toBe(
      plannerCopy.en.ui.unknownQuantity,
    );
  });

  it('uses canonical names for display only and never prints unknown IDs', () => {
    expect(ingredientLabel('PORK_BELLY', 'vi')).toBe('Thịt ba chỉ');
    expect(ingredientLabel('PORK_BELLY', 'en')).toBe('Pork belly');
    expect(ingredientLabel('PRIVATE_INTERNAL_ID', 'en')).toBe(plannerCopy.en.ui.unknownIngredient);
  });
});

describe('centralized safe localized copy', () => {
  it('covers the current T03/T04 selected-meal reason contracts without loading engine code', () => {
    for (const [file, type] of [['planner-types.ts', 'PlannerReason'], ['ranking.ts', 'RankingReason']]) {
      const source = readFileSync(new URL(`../../packages/recipes/src/${file}`, import.meta.url), 'utf8');
      const declaration = source.match(new RegExp(`export type ${type} = ([\\s\\S]*?);`));
      expect(declaration).not.toBeNull();
      const codes = [...declaration![1].matchAll(/'([A-Z][A-Z0-9_]*)'/g)].map((match) => match[1]);
      expect(codes.length).toBeGreaterThan(5);
      for (const locale of ['vi', 'en'] as const) {
        for (const code of codes) {
          expect(reasonLabel(code, locale), `${locale}: ${code}`).not.toBe(plannerCopy[locale].ui.unknownReason);
          expect(reasonLabel(code, locale)).not.toBe(code);
        }
      }
    }
  });

  it('has matching nonempty Vietnamese and English keys', () => {
    for (const section of Object.keys(plannerCopy.vi) as Array<keyof typeof plannerCopy.vi>) {
      expect(Object.keys(plannerCopy.en[section]).sort()).toEqual(
        Object.keys(plannerCopy.vi[section]).sort(),
      );
      for (const value of Object.values(plannerCopy.en[section])) expect(value.trim()).not.toBe('');
      for (const value of Object.values(plannerCopy.vi[section])) expect(value.trim()).not.toBe('');
    }
  });

  it('falls back to Vietnamese for unsupported or omitted locale', () => {
    expect(plannerLocale('en-US')).toBe('en');
    expect(plannerLocale('EN-gb')).toBe('en');
    expect(plannerLocale('vi-VN')).toBe('vi');
    expect(plannerLocale('ja')).toBe('vi');
    expect(plannerLocale('english')).toBe('vi');
    expect(reasonLabel('REQUIRES_SHOPPING')).toBe(plannerCopy.vi.reasons.REQUIRES_SHOPPING);
  });

  it('never echoes unknown codes, HTML or object prototype properties', () => {
    for (const code of [
      'NEW_PRIVATE_CODE',
      '<img src=x onerror=alert(1)>',
      '__proto__',
      'constructor',
      'toString',
    ]) {
      expect(reasonLabel(code, 'en')).toBe(plannerCopy.en.ui.unknownReason);
      expect(plannerStatusLabel(code, 'en')).toBe(plannerCopy.en.ui.unknownState);
      expect(plannerConclusionLabel(code, 'en')).toBe(plannerCopy.en.ui.unknownState);
      expect(budgetStatusLabel(code, 'en')).toBe(plannerCopy.en.budget.unknown);
      expect(wasteRiskLabel(code, 'en')).toBe(plannerCopy.en.waste.unknown);
      expect(freshnessReasonLabel(code, 'en')).toBe(plannerCopy.en.ui.unknownReason);
    }
  });

  it('distinguishes partial, search-limited, proven infeasible and all budget states', () => {
    expect(
      new Set(Object.keys(plannerCopy.en.status).map((key) => plannerStatusLabel(key, 'en'))).size,
    ).toBe(5);
    expect(
      new Set(Object.keys(plannerCopy.en.budget).map((key) => budgetStatusLabel(key, 'en'))).size,
    ).toBe(4);
    expect(plannerConclusionLabel('no_plan_found_without_proof', 'en')).toContain(
      'not been proven',
    );
    expect(plannerConclusionLabel('proven_infeasible', 'en')).toContain('supplied data scope');
    expect(reasonLabel('BEST_KNOWN_COST', 'en')).toContain('not proven optimal');
    expect(plannerCopy.en.ui.largestKnownCosts).toBe('Largest known costs');
    expect(plannerCopy.en.ui.surplusHint).toContain('does not mean');
    expect(plannerCopy.en.ui.safetyNotRequested).toContain('does not mean allergy-safe');
  });
});

describe('safe actionable planner errors', () => {
  it.each([
    [401, 'auth', 'auth'],
    [403, 'auth', 'forbidden'],
    [404, 'http', 'notFound'],
    [409, 'http', 'conflict'],
    [429, 'http', 'rateLimited'],
    [422, 'http', 'invalid'],
    [503, 'http', 'unavailable'],
  ] as const)('maps HTTP %s without showing server text', (status, kind, key) => {
    expect(
      plannerErrorMessage(new ApiError(kind, `HTTP ${status}: private raw details`, status), 'en'),
    ).toBe(plannerCopy.en.errors[key]);
  });

  it('uses known error codes to explain stale data and rejected swaps', () => {
    for (const code of [
      'PLAN_REVALIDATION_REQUIRED',
      'SWAP_NOT_FEASIBLE',
      'MEAL_PLANNER_DISABLED',
    ] as const) {
      expect(
        plannerErrorMessage(
          new ApiError('http', `HTTP 422: ${JSON.stringify({ code, error: 'private data' })}`, 422),
          'en',
        ),
      ).toBe(plannerCopy.en.errors[code]);
    }
  });

  it('has deterministic fallbacks for offline, unknown, malformed and schema errors', () => {
    expect(plannerErrorMessage(new ApiError('offline', 'private URL'), 'en')).toBe(
      plannerCopy.en.errors.offline,
    );
    expect(plannerErrorMessage(new Error('<script>private data</script>'), 'en')).toBe(
      plannerCopy.en.errors.unavailable,
    );
    expect(
      plannerErrorMessage(new ApiError('http', 'HTTP 500: {"code":"INTERNAL_UNKNOWN"}', 500), 'en'),
    ).toBe(plannerCopy.en.errors.unavailable);
    const parsed = z.string().safeParse(1);
    if (!parsed.success)
      expect(plannerErrorMessage(parsed.error, 'en')).toBe(plannerCopy.en.errors.invalid);
  });
});

describe('T20 actionable composition errors', () => {
  it.each([
    ['PROPOSAL_STALE', 'gợi ý mới', 'new suggestion'],
    ['HARD_CONSTRAINT_CONFLICT', 'giới hạn thời gian', 'time limit'],
    ['DUPLICATE_COMPONENT', 'đã có', 'already in'],
    ['ROLE_NOT_PERMITTED', 'vai trò khác', 'another role'],
    ['TARGET_NOT_FOUND', 'danh sách', 'choices'],
    ['COMPONENT_LIMIT', 'bớt', 'Remove a dish'],
  ])('%s guides recovery in Vietnamese and English without showing a machine code', (code, viText, enText) => {
    const error = new ApiError('http', `HTTP 422: ${JSON.stringify({ code, error: 'private raw detail' })}`, 422);
    expect(plannerErrorMessage(error, 'vi')).toContain(viText);
    expect(plannerErrorMessage(error, 'en')).toContain(enText);
    expect(plannerErrorMessage(error, 'en')).not.toContain(code);
    expect(plannerErrorMessage(error, 'en')).not.toContain('private raw detail');
  });
});

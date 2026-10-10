// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import type { Recipe } from '@frigo/recipes';
import { useCookingStore } from '../../src/web/stores/useCookingStore';
import { reviewCookingDeductions } from '../../src/web/lib/cooking-review';
import { submitCookingCompletion } from '../../src/web/lib/cooking-completion';
import { resetPrivateSession } from '../../src/web/lib/private-session';
import { ApiError } from '../../src/web/services/http';

const mocks = vi.hoisted(() => ({ complete: vi.fn(), invalidate: vi.fn() }));
vi.mock('../../src/web/services/recipes', () => ({
  recipesApi: { completeCooking: mocks.complete },
}));
vi.mock('../../src/web/lib/query-invalidation', () => ({
  invalidateWeekDependents: mocks.invalidate,
}));
const recipe: Recipe = {
  id: 'pork',
  slug: 'pork',
  title: 'Pork',
  description: '',
  cuisine: 'vietnamese',
  cookTimeMinutes: 10,
  servings: 2,
  difficulty: 'easy',
  imageUrl: '',
  tags: [],
  ingredients: [{ ingredientId: 'PORK_BELLY', name: 'Pork', requiredQuantity: 0.5, unit: 'kg' }],
  steps: [
    { stepNumber: 1, instruction: 'First', timerMinutes: 1 },
    { stepNumber: 2, instruction: 'Second' },
  ],
};
const inventory = [
  { id: 'a', ingredientId: 'PORK_BELLY', quantity: 250, unit: 'g' as const },
  { id: 'b', ingredientId: 'PORK_BELLY', quantity: 0.5, unit: 'kg' as const },
];
const state = () => useCookingStore.getState();
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('frigo_user_id', 'user');
  localStorage.setItem('frigo_household_id', 'house');
  state().resetCooking();
  mocks.complete.mockReset();
  mocks.invalidate.mockReset();
  mocks.invalidate.mockResolvedValue(undefined);
  state().startCooking(recipe, inventory);
});
afterEach(() => {
  vi.useRealTimers();
  state().resetCooking();
});

it('preserves fractional actual use, blank-invalid and explicit zero without submitting blank as zero', () => {
  state().editDeduction(0, '0.125');
  expect(state().deductions[0]).toMatchObject({
    currentQuantity: 0.75,
    quantityDeducted: 0.125,
    remainingQuantity: 0.625,
  });
  state().editDeduction(0, '');
  expect(state().deductionInputs).toEqual(['']);
  expect(state().deductionErrors[0]).toMatch(/Nhập lượng/);
  expect(state().beginCompletion()).toBeNull();
  state().editDeduction(0, '0');
  expect(state().deductionErrors).toEqual([null]);
  expect(state().beginCompletion()?.deductions[0].quantityDeducted).toBe(0);
});
it('rejects invalid, overflowing and insufficient quantities before beginning a command', () => {
  for (const input of ['-1', 'NaN', 'Infinity', '100001', '0.751']) {
    state().editDeduction(0, input);
    expect(state().deductionErrors[0]).toBeTruthy();
    expect(state().beginCompletion()).toBeNull();
  }
});
it('reserves duplicate ingredient demands once across mixed units and validates after an edit', () => {
  const duplicate: Recipe = {
    ...recipe,
    ingredients: [
      ...recipe.ingredients,
      { ...recipe.ingredients[0], requiredQuantity: 200, unit: 'g' },
    ],
  };
  state().startCooking(duplicate, inventory);
  expect(state().deductions.map((line) => line.quantityDeducted)).toEqual([0.5, 200]);
  state().editDeduction(0, '0.6');
  expect(state().deductionErrors[1]).toMatch(/150 g/);
  expect(state().beginCompletion()).toBeNull();
  state().editDeduction(1, '150');
  expect(state().deductionErrors).toEqual([null, null]);
});
it('does not guess contextual package mass and accepts zero use for unresolved stock', () => {
  const result = reviewCookingDeductions(
    recipe,
    [{ ...inventory[0], quantity: 2, unit: 'pack' }],
    ['0.1'],
  );
  expect(result.errors[0]).toMatch(/Chưa quy đổi/);
  expect(
    reviewCookingDeductions(recipe, [{ ...inventory[0], unit: 'pack' }], ['0']).errors,
  ).toEqual([null]);
});
it('freezes attempted payload/key, blocks double clicks, and preserves it across ambiguous retry', () => {
  const first = state().beginCompletion()!;
  expect(state().beginCompletion()).toBeNull();
  state().editDeduction(0, '0.1');
  expect(state().deductionInputs).toEqual(['0.5']);
  state().startCooking({ ...recipe, id: 'different' }, []);
  expect(state().activeRecipe?.id).toBe('pork');
  state().finishCompletion(state().runId!, first.commandId, 'uncertain');
  const retry = state().beginCompletion()!;
  expect(retry.commandId).toBe(first.commandId);
  expect(retry.deductions).toEqual(first.deductions);
});
it('rejected requests unlock only on fresh stock and preserve actual-use intent with a new key', () => {
  state().editDeduction(0, '0.6');
  const first = state().beginCompletion()!;
  state().finishCompletion(state().runId!, first.commandId, 'rejected');
  state().editDeduction(0, '0.1');
  expect(state().deductionInputs).toEqual(['0.6']);
  state().refreshStock([{ ...inventory[0], quantity: 400 }]);
  expect(state().deductionInputs).toEqual(['0.6']);
  expect(state().deductionErrors[0]).toBeTruthy();
  state().editDeduction(0, '0.3');
  expect(state().beginCompletion()?.commandId).not.toBe(first.commandId);
});
it('deadline catches elapsed background time, ends at zero in the same tick and cannot resume zero', () => {
  vi.useFakeTimers();
  vi.setSystemTime(1000);
  state().setTimer(60);
  vi.setSystemTime(21000);
  state().tickTimer();
  expect(state().timerSecondsRemaining).toBe(40);
  state().toggleTimer();
  vi.setSystemTime(121000);
  state().tickTimer();
  expect(state().timerSecondsRemaining).toBe(40);
  state().toggleTimer();
  vi.setSystemTime(162000);
  state().tickTimer();
  expect(state()).toMatchObject({
    timerSecondsRemaining: 0,
    isTimerRunning: false,
    timerDeadline: null,
  });
  state().toggleTimer();
  expect(state().isTimerRunning).toBe(false);
});
it('timer reset creates a new alert generation and changing steps clears the deadline', () => {
  state().setTimer(10);
  const generation = state().timerGeneration;
  state().setTimer(10);
  expect(state().timerGeneration).toBe(generation + 1);
  state().nextStep();
  expect(state()).toMatchObject({
    currentStepIndex: 1,
    timerDeadline: null,
    timerSecondsRemaining: null,
    isTimerRunning: false,
  });
  state().prevStep();
  expect(state().currentStepIndex).toBe(0);
});
it('reports queued versus server success and invalidates dependents once per single flight', async () => {
  mocks.complete.mockResolvedValue({ success: true, pendingSync: true });
  await Promise.all([submitCookingCompletion(), submitCookingCompletion()]);
  expect(mocks.complete).toHaveBeenCalledOnce();
  expect(mocks.invalidate).toHaveBeenCalledOnce();
  expect(state().attempt?.status).toBe('queued');
  state().startCooking(recipe, inventory);
  mocks.complete.mockResolvedValue({ success: true, pendingSync: false });
  await submitCookingCompletion();
  expect(state().attempt?.status).toBe('saved');
});
it('retries an unknown response using precisely the same command and does not allow edits', async () => {
  mocks.complete
    .mockRejectedValueOnce(new TypeError('lost body'))
    .mockResolvedValueOnce({ success: true });
  await submitCookingCompletion();
  expect(state().attempt?.status).toBe('uncertain');
  state().editDeduction(0, '0.1');
  await submitCookingCompletion();
  expect(mocks.complete.mock.calls[0]).toEqual(mocks.complete.mock.calls[1]);
  expect(state().attempt?.status).toBe('saved');
});
it('surfaces a known insufficient-inventory rejection and keeps the submitted amount locked', async () => {
  mocks.complete.mockRejectedValue(
    new ApiError('http', 'HTTP 409: {"code":"INSUFFICIENT_INVENTORY"}', 409),
  );
  await submitCookingCompletion();
  expect(state().attempt).toMatchObject({
    status: 'rejected',
    error: expect.stringContaining('không đủ'),
  });
  expect(state().beginCompletion()).toBeNull();
});
it('blocks safety/idempotency conflicts without permitting a new command', async () => {
  for (const code of ['HARD_CONSTRAINT_CONFLICT', 'IDEMPOTENCY_CONFLICT']) {
    state().resetCooking();
    state().startCooking(recipe, inventory);
    mocks.complete.mockRejectedValue(new ApiError('http', `HTTP 422: {"code":"${code}"}`, 422));
    await submitCookingCompletion();
    expect(state().attempt?.status).toBe(
      code === 'HARD_CONSTRAINT_CONFLICT' ? 'restricted' : 'blocked',
    );
    state().refreshStock(inventory);
    expect(state().attempt?.status).toBe(
      code === 'HARD_CONSTRAINT_CONFLICT' ? 'restricted' : 'blocked',
    );
  }
});
it('a late successful response cannot reset or complete a newly started run', async () => {
  let finish!: (result: { success: true }) => void;
  mocks.complete.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = submitCookingCompletion();
  state().resetCooking();
  state().startCooking({ ...recipe, id: 'next' }, inventory);
  finish({ success: true });
  await pending;
  expect(state().activeRecipe?.id).toBe('next');
  expect(state().attempt).toBeNull();
  expect(mocks.invalidate).not.toHaveBeenCalled();
});
it('private session reset removes actual-use data and fences a late completion', async () => {
  let finish!: (result: { success: true }) => void;
  mocks.complete.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = submitCookingCompletion();
  resetPrivateSession();
  finish({ success: true });
  await pending;
  expect(state()).toMatchObject({
    runId: null,
    activeRecipe: null,
    deductions: [],
    deductionInputs: [],
    attempt: null,
  });
  expect(mocks.invalidate).not.toHaveBeenCalled();
});

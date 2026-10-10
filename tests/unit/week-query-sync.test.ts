import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MealPlan, MealPlanSetupInput } from '@frigo/domain';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

function plan(id = 'plan-current', householdId = 'house-a'): MealPlan {
  return {
    id, householdId, startDate: '2026-09-08', endDate: '2026-09-14', status: 'ACTIVE', days: [],
    budget: { targetVnd: 700000, estimatedMinVnd: 100000, estimatedMaxVnd: 120000, status: 'UNDER', displayText: '' },
    utilization: { utilizationPercent: 0, plannedItemsCount: 0, totalUsableItemsCount: 0, highPriorityUsedCount: 0 },
    wasteRisk: { level: 'LOW', expiringItemsCount: 0, rescuedItemsCount: 0, displayText: '' },
    shoppingItems: ['carrot', 'onion'].map((ingredientId) => ({
      ingredientId, name: ingredientId, category: 'vegetable', requiredQuantity: 1,
      existingInventoryQuantity: 0, missingQuantity: 1, recommendedPurchaseQuantity: 1,
      unit: 'piece', estimatedPriceMin: 1000, estimatedPriceMax: 2000, checked: false, sourceRecipes: [],
    })),
    priorities: ['use_fridge'], shoppingFrequency: 'once', createdAt: '2026-09-08', updatedAt: '2026-09-08',
  };
}

const input: MealPlanSetupInput = {
  householdId: 'house-a', startDate: '2026-09-08', householdSize: 2,
  mealSlotsPreset: 'dinner_only', budgetTargetVnd: 700000, priorities: ['use_fridge'], shoppingFrequency: 'once',
};
const privateError = new Error('PRIVATE_SERVER_DETAIL_DO_NOT_RENDER');

async function loadClient() {
  const { api } = await import('../../src/web/services/api');
  const { useAuthStore } = await import('../../src/web/stores/useAuthStore');
  const { useWeekStore } = await import('../../src/web/stores/useWeekStore');
  const { queryClient } = await import('../../src/web/lib/query-client');
  const { queryKeys } = await import('../../src/web/lib/queryKeys');
  const session = await import('../../src/web/lib/private-session');
  queryClient.setDefaultOptions({ queries: { retry: false, gcTime: Infinity, networkMode: 'always' } });
  return { api, auth: useAuthStore, week: useWeekStore, queryClient, queryKeys, session };
}

type Client = Awaited<ReturnType<typeof loadClient>>;
let client: Client;

function signIn(id = 'user-a', householdId = 'house-a') {
  client.auth.getState().setAuthSession({ id, householdId, email: `${id}@example.test`, displayName: id });
}

function seedPlan(value = plan()) {
  client.week.setState({ currentPlan: value, swapSlotId: 'meal-1' });
  client.queryClient.setQueryData(client.queryKeys.currentWeekPlan(), value);
  client.queryClient.setQueryData(client.queryKeys.weekPlan(value.id), value);
  return value;
}

function expectPlanCached(value: MealPlan) {
  expect(client.week.getState().currentPlan).toEqual(value);
  expect(client.queryClient.getQueryData(client.queryKeys.currentWeekPlan())).toEqual(value);
  expect(client.queryClient.getQueryData(client.queryKeys.weekPlan(value.id))).toEqual(value);
}

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('localStorage', new MemoryStorage());
  vi.stubGlobal('sessionStorage', new MemoryStorage());
  vi.stubGlobal('window', new EventTarget());
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unexpected network request')));
  client = await loadClient();
  signIn();
});

afterEach(() => {
  client?.queryClient.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Week Query-backed reads', () => {
  it('loads the current plan through the shared Query client and mirrors its scoped ID key', async () => {
    const value = plan();
    const apiRead = vi.spyOn(client.api, 'getCurrentWeekPlan').mockResolvedValue(value);
    const fetchQuery = vi.spyOn(client.queryClient, 'fetchQuery');
    await expect(client.week.getState().loadCurrentPlan()).resolves.toEqual(value);
    expect(apiRead).toHaveBeenCalledOnce();
    expect(fetchQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['weekPlan', 'user-a', 'house-a', 'current'] }));
    expectPlanCached(value);
    expect(client.week.getState()).toMatchObject({ isLoading: false, error: null });
  });

  it('deduplicates concurrent store reads without bypassing API spies', async () => {
    const response = deferred<MealPlan>();
    const apiRead = vi.spyOn(client.api, 'getCurrentWeekPlan').mockReturnValue(response.promise);
    const first = client.week.getState().loadCurrentPlan();
    const second = client.week.getState().loadCurrentPlan();
    response.resolve(plan());
    await expect(Promise.all([first, second])).resolves.toEqual([plan(), plan()]);
    expect(apiRead).toHaveBeenCalledOnce();
  });

  it('keeps a null current plan as an honest empty result', async () => {
    seedPlan();
    vi.spyOn(client.api, 'getCurrentWeekPlan').mockResolvedValue(null);
    await expect(client.week.getState().loadCurrentPlan()).resolves.toBeNull();
    expect(client.week.getState().currentPlan).toBeNull();
    expect(client.queryClient.getQueryData(client.queryKeys.currentWeekPlan())).toBeNull();
  });

  it('updates the current key after a matching ID lookup', async () => {
    seedPlan();
    const updated = { ...plan(), aiExplanation: 'NEW_FROM_ID_LOOKUP' };
    const apiRead = vi.spyOn(client.api, 'getWeekPlan').mockResolvedValue(updated);
    const fetchQuery = vi.spyOn(client.queryClient, 'fetchQuery');
    await expect(client.week.getState().loadPlanById(updated.id)).resolves.toEqual(updated);
    expect(apiRead).toHaveBeenCalledWith(updated.id);
    expect(fetchQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: client.queryKeys.weekPlan(updated.id) }));
    expectPlanCached(updated);
  });

  it.each(['different plan', 'absent', 'null'] as const)('does not promote an ID lookup when current is %s', async (current) => {
    const active = plan('active');
    if (current !== 'absent') client.queryClient.setQueryData(client.queryKeys.currentWeekPlan(), current === 'null' ? null : active);
    const archived = { ...plan('archived'), status: 'ARCHIVED' as const };
    vi.spyOn(client.api, 'getWeekPlan').mockResolvedValue(archived);
    await expect(client.week.getState().loadPlanById(archived.id)).resolves.toEqual(archived);
    expect(client.queryClient.getQueryData(client.queryKeys.weekPlan(archived.id))).toEqual(archived);
    expect(client.queryClient.getQueryData(client.queryKeys.currentWeekPlan())).toEqual(current === 'absent' ? undefined : current === 'null' ? null : active);
  });

  it.each(['current', 'by ID'] as const)('returns a safe error state when reading %s fails', async (kind) => {
    vi.spyOn(client.api, 'getCurrentWeekPlan').mockRejectedValue(privateError);
    vi.spyOn(client.api, 'getWeekPlan').mockRejectedValue(privateError);
    const result = kind === 'current' ? client.week.getState().loadCurrentPlan() : client.week.getState().loadPlanById('missing');
    await expect(result).resolves.toBeNull();
    expect(client.week.getState().error).toContain('Vui lòng thử lại.');
    expect(client.week.getState().error).not.toContain(privateError.message);
    expect(client.week.getState().isLoading).toBe(false);
  });

  it('does not show a failure when an initial read is cancelled without replacement data', async () => {
    const response = deferred<MealPlan>();
    vi.spyOn(client.api, 'getCurrentWeekPlan').mockReturnValue(response.promise);
    const loading = client.week.getState().loadCurrentPlan();
    await client.queryClient.cancelQueries({ queryKey: client.queryKeys.currentWeekPlan(), exact: true });
    response.resolve(plan());
    await expect(loading).resolves.toBeNull();
    expect(client.week.getState()).toMatchObject({ currentPlan: null, isLoading: false, error: null });
    expect(client.queryClient.getQueryData(client.queryKeys.currentWeekPlan())).toBeUndefined();
  });
});

describe('Week mutations publish scoped server state', () => {
  it('generation sets a new current plan and its ID key while invalidating dependents', async () => {
    const previous = seedPlan();
    const inventoryKey = client.queryKeys.inventory();
    client.queryClient.setQueryData(inventoryKey, []);
    const next = plan('generated');
    vi.spyOn(client.api, 'createWeekPlan').mockResolvedValue(next);
    await expect(client.week.getState().generatePlan(input)).resolves.toEqual(next);
    expectPlanCached(next);
    expect(client.queryClient.getQueryData(client.queryKeys.weekPlan(previous.id))).toEqual(previous);
    expect(client.queryClient.getQueryState(inventoryKey)?.isInvalidated).toBe(true);
    expect(client.week.getState()).toMatchObject({ isGenerating: false, error: null });
  });

  it('cancels an older current-plan fetch before publishing a generated plan', async () => {
    seedPlan();
    const response = deferred<MealPlan>();
    const fetching = client.queryClient.fetchQuery({ queryKey: client.queryKeys.currentWeekPlan(), queryFn: () => response.promise }).catch(() => null);
    const next = plan('generated');
    vi.spyOn(client.api, 'createWeekPlan').mockResolvedValue(next);
    await client.week.getState().generatePlan(input);
    response.resolve(plan());
    await fetching;
    expectPlanCached(next);
  });

  it.each(['current', 'by ID'] as const)('does not turn a cancelled %s store read into a visible failure after generation', async (kind) => {
    seedPlan();
    const response = deferred<MealPlan>();
    vi.spyOn(client.api, 'getCurrentWeekPlan').mockReturnValue(response.promise);
    vi.spyOn(client.api, 'getWeekPlan').mockReturnValue(response.promise);
    const next = plan('generated');
    const loading = kind === 'current'
      ? client.week.getState().loadCurrentPlan()
      : client.week.getState().loadPlanById(next.id);
    vi.spyOn(client.api, 'createWeekPlan').mockResolvedValue(next);
    await client.week.getState().generatePlan(input);
    response.resolve(plan());
    await expect(loading).resolves.toEqual(next);
    expectPlanCached(next);
    expect(client.week.getState()).toMatchObject({ error: null, isLoading: false });
  });

  it.each(['swap', 'cooked'] as const)('%s publishes the returned plan to the ID/current keys', async (kind) => {
    seedPlan();
    const updated = { ...plan(), aiExplanation: `UPDATED_${kind}` };
    if (kind === 'swap') {
      const swap = vi.spyOn(client.api, 'swapMeal').mockResolvedValue({ plan: updated });
      await client.week.getState().executeSwap('new-recipe');
      expect(swap).toHaveBeenCalledWith(updated.id, 'meal-1', 'new-recipe');
      expect(client.week.getState().swapSlotId).toBeNull();
    } else {
      const mark = vi.spyOn(client.api, 'updateMealSlot').mockResolvedValue(updated);
      await client.week.getState().markMealCooked('meal-1');
      expect(mark).toHaveBeenCalledWith(updated.id, 'meal-1', { status: 'COOKED' });
    }
    expectPlanCached(updated);
  });

  it('never replaces the current query with an archived plan mutation', async () => {
    const active = seedPlan();
    const archived = plan('archived');
    client.week.setState({ currentPlan: archived });
    const updated = { ...archived, aiExplanation: 'ARCHIVED_CHANGE' };
    vi.spyOn(client.api, 'swapMeal').mockResolvedValue({ plan: updated });
    await client.week.getState().executeSwap('new-recipe');
    expect(client.week.getState().currentPlan).toEqual(updated);
    expect(client.queryClient.getQueryData(client.queryKeys.weekPlan(archived.id))).toEqual(updated);
    expect(client.queryClient.getQueryData(client.queryKeys.currentWeekPlan())).toEqual(active);
  });

  it.each(['swap', 'cooked'] as const)('%s invalidates Week when a successful response has no plan body', async (kind) => {
    seedPlan();
    if (kind === 'swap') {
      vi.spyOn(client.api, 'swapMeal').mockResolvedValue({});
      await client.week.getState().executeSwap('new-recipe');
    } else {
      vi.spyOn(client.api, 'updateMealSlot').mockResolvedValue(null);
      await client.week.getState().markMealCooked('meal-1');
    }
    expect(client.queryClient.getQueryState(client.queryKeys.currentWeekPlan())?.isInvalidated).toBe(true);
  });

  it.each(['generation', 'swap', 'cooked', 'alternatives'] as const)('%s failure exposes only safe store error copy', async (kind) => {
    seedPlan();
    if (kind === 'generation') {
      vi.spyOn(client.api, 'createWeekPlan').mockRejectedValue(privateError);
      await expect(client.week.getState().generatePlan(input)).rejects.toThrow('Không thể tạo thực đơn tuần.');
    } else if (kind === 'cooked') {
      vi.spyOn(client.api, 'updateMealSlot').mockRejectedValue(privateError);
      await client.week.getState().markMealCooked('meal-1');
    } else {
      vi.spyOn(client.api, 'swapMeal').mockRejectedValue(privateError);
      if (kind === 'swap') await client.week.getState().executeSwap('new-recipe');
      else await client.week.getState().openSwap('meal-1');
    }
    expect(client.week.getState().error).toContain('Vui lòng thử lại.');
    expect(client.week.getState().error).not.toContain(privateError.message);
    expect(client.week.getState()).toMatchObject({ isLoading: false, isGenerating: false, isLoadingAlternatives: false });
  });
});

describe('Week shopping optimism, rollback and reconciliation', () => {
  it('publishes optimistic checked state to both Week query keys and reconciles on success', async () => {
    const original = seedPlan();
    const response = deferred<void>();
    vi.spyOn(client.api, 'toggleWeekShoppingItem').mockReturnValue(response.promise);
    const task = client.week.getState().toggleShoppingItem('carrot', true);
    const updated = { ...original, shoppingItems: original.shoppingItems.map((item) => ({ ...item, checked: item.ingredientId === 'carrot' })) };
    expectPlanCached(updated);
    response.resolve();
    await task;
    expectPlanCached(updated);
    expect(client.queryClient.getQueryState(client.queryKeys.currentWeekPlan())?.isInvalidated).toBe(true);
  });

  it('rolls back a rejected optimistic item without discarding another item update', async () => {
    const original = seedPlan();
    const carrot = deferred<void>();
    const onion = deferred<void>();
    vi.spyOn(client.api, 'toggleWeekShoppingItem').mockReturnValueOnce(carrot.promise).mockReturnValueOnce(onion.promise);
    const first = client.week.getState().toggleShoppingItem('carrot', true);
    const second = client.week.getState().toggleShoppingItem('onion', true);
    carrot.reject(privateError);
    await first;
    const updated = { ...original, shoppingItems: original.shoppingItems.map((item) => ({ ...item, checked: item.ingredientId === 'onion' })) };
    expectPlanCached(updated);
    expect(client.week.getState().error).toBe('Không thể cập nhật danh sách đi chợ. Vui lòng thử lại.');
    onion.resolve();
    await second;
    expectPlanCached(updated);
  });

  it('does not roll back a newer toggle when the older request fails late', async () => {
    const original = seedPlan();
    const firstResponse = deferred<void>();
    const secondResponse = deferred<void>();
    const thirdResponse = deferred<void>();
    vi.spyOn(client.api, 'toggleWeekShoppingItem')
      .mockReturnValueOnce(firstResponse.promise)
      .mockReturnValueOnce(secondResponse.promise)
      .mockReturnValueOnce(thirdResponse.promise);
    const first = client.week.getState().toggleShoppingItem('carrot', true);
    const second = client.week.getState().toggleShoppingItem('carrot', false);
    const third = client.week.getState().toggleShoppingItem('carrot', true);
    secondResponse.resolve();
    await second;
    thirdResponse.resolve();
    await third;
    firstResponse.reject(privateError);
    await first;
    expectPlanCached({ ...original, shoppingItems: original.shoppingItems.map((item) => ({ ...item, checked: item.ingredientId === 'carrot' })) });
    expect(client.week.getState().error).toBeNull();
  });

  it('rolls back archived shopping without touching the active current plan', async () => {
    const active = seedPlan();
    const archived = plan('archived');
    client.week.setState({ currentPlan: archived });
    vi.spyOn(client.api, 'toggleWeekShoppingItem').mockRejectedValue(privateError);
    await client.week.getState().toggleShoppingItem('carrot', true);
    expect(client.week.getState().currentPlan).toEqual(archived);
    expect(client.queryClient.getQueryData(client.queryKeys.weekPlan(archived.id))).toEqual(archived);
    expect(client.queryClient.getQueryData(client.queryKeys.currentWeekPlan())).toEqual(active);
  });

  it('shopping completion invalidates Week, inventory, recommendations, notifications, me and shopping only for its owner', async () => {
    const original = plan();
    original.shoppingItems[0].checked = true;
    seedPlan(original);
    const keys = [client.queryKeys.inventory(), client.queryKeys.recommendationLists(), client.queryKeys.notifications(), client.queryKeys.me(), client.queryKeys.shoppingList()];
    for (const key of keys) client.queryClient.setQueryData(key, []);
    const unrelatedKey = ['inventory', 'user-b', 'house-b'];
    client.queryClient.setQueryData(unrelatedKey, ['OTHER_OWNER']);
    const complete = vi.spyOn(client.api, 'completeWeekShopping').mockResolvedValue({ success: true, importedItemsCount: 0 });
    await expect(client.week.getState().completeShopping()).resolves.toEqual({ success: true, count: 0 });
    expect(complete).toHaveBeenCalledWith(original.id, [original.shoppingItems[0]]);
    for (const key of [...keys, client.queryKeys.currentWeekPlan()]) expect(client.queryClient.getQueryState(key)?.isInvalidated).toBe(true);
    expect(client.queryClient.getQueryState(unrelatedKey)?.isInvalidated).toBe(false);
    expect(client.queryClient.getQueryData(unrelatedKey)).toEqual(['OTHER_OWNER']);
  });

  it.each([true, false])('passes through the existing completion pendingSync=%s receipt', async (pendingSync) => {
    const active = plan(); active.shoppingItems[0].checked = true; seedPlan(active);
    vi.spyOn(client.api, 'completeWeekShopping').mockResolvedValue({ success: true, importedItemsCount: 1, pendingSync });
    await expect(client.week.getState().completeShopping()).resolves.toEqual({ success: true, count: 1, pendingSync });
  });

  it.each(['rejected', 'unsuccessful'] as const)('does not report shopping completion when the server response is %s', async (outcome) => {
    seedPlan();
    const complete = vi.spyOn(client.api, 'completeWeekShopping');
    if (outcome === 'rejected') complete.mockRejectedValue(privateError);
    else complete.mockResolvedValue({ success: false });
    await expect(client.week.getState().completeShopping()).rejects.toThrow('Không thể nhập nguyên liệu vào tủ lạnh. Vui lòng thử lại.');
    expect(client.week.getState().error).toBe('Không thể nhập nguyên liệu vào tủ lạnh. Vui lòng thử lại.');
    expect(client.queryClient.getQueryState(client.queryKeys.currentWeekPlan())?.isInvalidated).toBe(false);
  });
});

const actions = ['current read', 'ID read', 'generation', 'alternatives', 'swap', 'cooked', 'toggle', 'complete'] as const;
type Action = typeof actions[number];

function startDeferredAction(action: Action) {
  const response = deferred<any>();
  let task: Promise<unknown>;
  switch (action) {
    case 'current read':
      vi.spyOn(client.api, 'getCurrentWeekPlan').mockReturnValue(response.promise);
      task = client.week.getState().loadCurrentPlan();
      break;
    case 'ID read':
      vi.spyOn(client.api, 'getWeekPlan').mockReturnValue(response.promise);
      task = client.week.getState().loadPlanById('plan-current');
      break;
    case 'generation':
      vi.spyOn(client.api, 'createWeekPlan').mockReturnValue(response.promise);
      task = client.week.getState().generatePlan(input);
      break;
    case 'alternatives':
    case 'swap':
      vi.spyOn(client.api, 'swapMeal').mockReturnValue(response.promise);
      task = action === 'swap' ? client.week.getState().executeSwap('new-recipe') : client.week.getState().openSwap('meal-1');
      break;
    case 'cooked':
      vi.spyOn(client.api, 'updateMealSlot').mockReturnValue(response.promise);
      task = client.week.getState().markMealCooked('meal-1');
      break;
    case 'toggle':
      vi.spyOn(client.api, 'toggleWeekShoppingItem').mockReturnValue(response.promise);
      task = client.week.getState().toggleShoppingItem('carrot', true);
      break;
    case 'complete':
      vi.spyOn(client.api, 'completeWeekShopping').mockReturnValue(response.promise);
      task = client.week.getState().completeShopping();
      break;
  }
  return { response, result: task.then((value) => ({ value, error: null }), (error: Error) => ({ value: undefined, error })) };
}

for (const scopeChange of ['user', 'household', 'session generation'] as const) {
  describe(`Week stale continuations after ${scopeChange} change`, () => {
    it.each(actions.flatMap((action) => (['success', 'failure'] as const).map((outcome) => ({ action, outcome }))))('ignores old $action $outcome without changing the new owner query/store state', async ({ action, outcome }) => {
      seedPlan();
      const { response, result } = startDeferredAction(action);
      if (scopeChange === 'user') signIn('user-b', 'house-a');
      else if (scopeChange === 'household') signIn('user-a', 'house-b');
      else client.session.resetPrivateSession();
      const next = { ...plan('plan-current', scopeChange === 'household' ? 'house-b' : 'house-a'), aiExplanation: 'NEW_PRIVATE_STATE' };
      seedPlan(next);
      client.week.setState({ error: 'NEW_OWNER_NOTICE' });
      const inventoryKey = client.queryKeys.inventory();
      client.queryClient.setQueryData(inventoryKey, ['NEW_PRIVATE_INVENTORY']);
      const cacheBefore = client.queryClient.getQueryCache().getAll().map((query) => query.queryKey);
      const invalidate = vi.spyOn(client.queryClient, 'invalidateQueries');
      if (outcome === 'failure') response.reject(privateError);
      else if (action === 'swap') response.resolve({ plan: { ...plan(), aiExplanation: 'OLD_PRIVATE_STATE' } });
      else if (action === 'alternatives') response.resolve({ alternatives: [] });
      else if (action === 'toggle') response.resolve(undefined);
      else if (action === 'complete') response.resolve({ success: true, importedItemsCount: 3 });
      else response.resolve({ ...plan(), aiExplanation: 'OLD_PRIVATE_STATE' });
      const settled = await result;
      if (action === 'generation') expect(settled.error?.message).toBe('Session changed');
      else {
        expect(settled.error).toBeNull();
        if (action === 'current read' || action === 'ID read') expect(settled.value).toBeNull();
        if (action === 'complete') expect(settled.value).toEqual({ success: false, count: 0 });
      }
      expectPlanCached(next);
      expect(client.week.getState()).toMatchObject({ error: 'NEW_OWNER_NOTICE', isLoading: false, isGenerating: false, isLoadingAlternatives: false });
      expect(client.queryClient.getQueryData(inventoryKey)).toEqual(['NEW_PRIVATE_INVENTORY']);
      expect(client.queryClient.getQueryCache().getAll().map((query) => query.queryKey)).toEqual(cacheBefore);
      expect(invalidate).not.toHaveBeenCalled();
    });
  });
}

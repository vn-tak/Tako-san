// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { shoppingApi, projectShoppingList } from '../../src/web/services/shopping';
import { parseShoppingForm } from '../../src/web/lib/shopping-form';
import { getPendingOps } from '../../src/web/lib/sync';
import { privateCacheKey, resetPrivateSession } from '../../src/web/lib/private-session';

const fetchMock = vi.fn();
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const item = { id: 'shop_existing', name: 'Rice', quantity: 0.125, unit: 'kg', isChecked: false };
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  resetPrivateSession();
  localStorage.setItem('frigo_user_id', 'user-a');
  localStorage.setItem('frigo_household_id', 'house-a');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});
afterEach(() => vi.unstubAllGlobals());
it('keeps blank, zero, negative, nonfinite and incompatible form values invalid; preserves decimals', () => {
  for (const value of ['', ' ', '0', '-1', 'Infinity', 'NaN'])
    expect(parseShoppingForm('Rice', value, 'kg')).toBeNull();
  expect(parseShoppingForm('', '1', 'kg')).toBeNull();
  expect(parseShoppingForm('Rice', '1', 'unknown')).toBeNull();
  expect(parseShoppingForm(' Rice ', '0.125', 'kg')).toEqual({
    name: 'Rice',
    quantity: 0.125,
    unit: 'kg',
  });
});
it('adds on the server without a second read masking a committed mutation; replay keeps the client ID', async () => {
  fetchMock
    .mockResolvedValueOnce(response({ item }))
    .mockRejectedValue(new Error('Unexpected follow-up read'));
  expect(await shoppingApi.addShoppingItem({ ...item })).toEqual(item);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(JSON.parse(localStorage.getItem(privateCacheKey('shopping_list', 'house-a'))!)).toEqual([
    { ...item, pendingSync: false },
  ]);
});
it('offline add deduplicates a stable client ID, labels device data and overlays pending writes on server reads', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  const input = { id: item.id, name: item.name, quantity: item.quantity, unit: item.unit };
  expect((await shoppingApi.addShoppingItem(input)).pendingSync).toBe(true);
  await shoppingApi.addShoppingItem(input);
  const device = await shoppingApi.getShoppingListSnapshot();
  expect(device.source).toBe('device');
  expect(device.items).toHaveLength(1);
  expect(getPendingOps()).toHaveLength(1);
  fetchMock.mockResolvedValue(response({ items: [] }));
  expect((await shoppingApi.getShoppingListSnapshot()).items).toEqual([
    { ...input, isChecked: false, pendingSync: true },
  ]);
  fetchMock.mockResolvedValue(response({ items: [item] }));
  expect((await shoppingApi.getShoppingListSnapshot()).items).toHaveLength(1);
});
it('offline check and delete expose durable receipts and do not resurrect rows on an online read', async () => {
  localStorage.setItem(privateCacheKey('shopping_list', 'house-a'), JSON.stringify([item]));
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  expect(await shoppingApi.toggleShoppingItem(item.id, true)).toEqual({ pendingSync: true });
  fetchMock.mockResolvedValue(response({ items: [item] }));
  expect((await shoppingApi.getShoppingList())[0]).toMatchObject({
    isChecked: true,
    pendingSync: true,
  });
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  expect(await shoppingApi.deleteShoppingItem(item.id)).toEqual({ pendingSync: true });
  fetchMock.mockResolvedValue(response({ items: [item] }));
  expect(await shoppingApi.getShoppingList()).toEqual([]);
});
it('does not report pending sync when durable storage rejects a command', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Quota exceeded');
  });
  await expect(shoppingApi.toggleShoppingItem(item.id, true)).rejects.toThrow(
    'Không thể lưu thay đổi',
  );
  expect(getPendingOps()).toEqual([]);
  vi.restoreAllMocks();
});
it('retains scope fences and rejects malformed server success rather than fabricating an empty list', async () => {
  fetchMock.mockResolvedValue(response({ items: 'wrong' }));
  await expect(shoppingApi.getShoppingList()).rejects.toThrow();
  let release!: (value: Response) => void;
  fetchMock.mockReturnValue(
    new Promise<Response>((resolve) => {
      release = resolve;
    }),
  );
  const pending = shoppingApi.getShoppingList();
  resetPrivateSession();
  release(response({ items: [item] }));
  await expect(pending).rejects.toThrow();
  expect(localStorage.getItem(privateCacheKey('shopping_list', 'house-a'))).toBeNull();
});
it('removes obsolete pending badges when the outbox has replayed', () => {
  expect(projectShoppingList([{ ...item, pendingSync: true }], [])).toEqual([
    { ...item, pendingSync: false },
  ]);
});
it('keeps an online edit behind an earlier queued add/check instead of allowing later replay to overwrite it', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  await shoppingApi.addShoppingItem({ ...item });
  await shoppingApi.toggleShoppingItem(item.id, true);
  fetchMock.mockReset().mockResolvedValue(response({ success: true }));
  expect(await shoppingApi.toggleShoppingItem(item.id, false)).toEqual({ pendingSync: true });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(getPendingOps().map((op) => op.method)).toEqual(['POST', 'PATCH', 'PATCH']);
  expect(JSON.parse(getPendingOps().at(-1)!.body!).isChecked).toBe(false);
  expect(await shoppingApi.deleteShoppingItem(item.id)).toEqual({ pendingSync: true });
  expect(fetchMock).not.toHaveBeenCalled();
});
it('rejects invalid quantities before queuing an offline create', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(shoppingApi.addShoppingItem({ ...item, quantity: 0 })).rejects.toThrow();
  expect(getPendingOps()).toEqual([]);
  expect(fetchMock).not.toHaveBeenCalled();
});

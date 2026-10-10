import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, String(value));
  }
}
beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('localStorage', new MemoryStorage());
  vi.stubGlobal('sessionStorage', new MemoryStorage());
  localStorage.setItem('frigo_user_id', 'ui04-user');
  localStorage.setItem('frigo_household_id', 'ui04-house');
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const accepted = {
  id: 'draft-a',
  rawName: 'Muối',
  estimatedQuantity: 0.25,
  unit: 'pack',
  storage: 'pantry',
};

it('imports only accepted offline drafts, retains fractional quantities and deduplicates retries', async () => {
  const { scansApi } = await import('../../src/web/services/scans');
  const { readCachedInventory } = await import('../../src/web/services/http');
  const { getPendingOps } = await import('../../src/web/lib/sync');
  const lines = [
    accepted,
    { ...accepted, id: 'draft-rejected', estimatedQuantity: 0, rejected: true },
  ];
  const first = await scansApi.confirmScan('scan_offline_ui04', lines);
  expect(first).toMatchObject({ pendingSync: true, importedItemsCount: 1 });
  expect(readCachedInventory()).toEqual([
    expect.objectContaining({ name: 'Muối', quantity: 0.25, unit: 'pack', pendingSync: true }),
  ]);
  await scansApi.confirmScan('scan_offline_ui04', lines);
  expect(readCachedInventory()).toHaveLength(1);
  expect(getPendingOps()).toHaveLength(1);
  expect(JSON.parse(getPendingOps()[0].body!)).toMatchObject({ quantity: 0.25 });
});

it('all rejected offline drafts create no inventory operation', async () => {
  const { scansApi } = await import('../../src/web/services/scans');
  const { getPendingOps } = await import('../../src/web/lib/sync');
  const result = await scansApi.confirmScan('scan_offline_ui04', [
    { id: 'discarded', rejected: true },
  ]);
  expect(result).toMatchObject({ success: true, pendingSync: false, importedItemsCount: 0 });
  expect(getPendingOps()).toEqual([]);
});

describe('invalid accepted quantity fails before any partial local mutation', () => {
  it.each([undefined, '', 0, -1, 10001, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects %s without fabricating quantity1',
    async (quantity) => {
      const { scansApi } = await import('../../src/web/services/scans');
      const { readCachedInventory } = await import('../../src/web/services/http');
      const { getPendingOps } = await import('../../src/web/lib/sync');
      await expect(
        scansApi.confirmScan('scan_offline_ui04', [
          accepted,
          { ...accepted, id: 'bad', estimatedQuantity: quantity },
        ]),
      ).rejects.toMatchObject({ code: 'INVALID_QUANTITY' });
      expect(getPendingOps()).toEqual([]);
      expect(readCachedInventory()).toEqual([]);
    },
  );
});

it('preserves the estimated expiry qualifier in the offline operation', async () => {
  const { scansApi } = await import('../../src/web/services/scans');
  const { getPendingOps } = await import('../../src/web/lib/sync');
  await scansApi.confirmScan('scan_offline_ui04', [
    { ...accepted, expiryDate: '2030-12-31', expiryEstimated: true },
  ]);
  const { readCachedInventory } = await import('../../src/web/services/http');
  const { presentExpiry } = await import('../../src/web/lib/inventory-truth');
  expect(presentExpiry(readCachedInventory()[0])).toMatchObject({
    estimated: true,
    date: '2030-12-31',
  });
  expect(JSON.parse(getPendingOps()[0].body!)).toMatchObject({
    expiryDate: '2030-12-31',
    expiryEstimated: true,
  });
});

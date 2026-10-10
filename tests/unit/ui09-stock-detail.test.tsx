// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IngredientDetailPage } from '../../src/web/pages/IngredientDetailPage';
import { ApiError } from '../../src/web/services/http';
import type { InventoryLotDetail } from '../../src/web/services/inventory-truth';
const mocks = vi.hoisted(() => ({
  lot: vi.fn(),
  legacy: vi.fn(),
  update: vi.fn(),
  invalidate: vi.fn(),
}));
vi.mock('../../src/web/services/api', async () => ({
  ApiError: (await import('../../src/web/services/http')).ApiError,
  api: {
    getInventoryLot: mocks.lot,
    getInventory: mocks.legacy,
    updateInventoryItem: mocks.update,
  },
}));
vi.mock('../../src/web/lib/query-invalidation', () => ({
  invalidateInventoryDependents: mocks.invalidate,
}));
const lot: InventoryLotDetail = {
  id: 'projection-egg',
  lotId: 'lot-egg',
  legacyItemId: 'projection-egg',
  name: 'Trứng',
  ingredientId: 'CHICKEN_EGG',
  category: 'egg',
  quantity: 2,
  unit: 'piece',
  quantityMilli: 2000,
  canonicalUnit: 'piece',
  storage: 'fridge',
  storageLocationId: 'fridge-location',
  state: 'ACTIVE',
  freshness: 'fresh',
  expiryKind: 'UNKNOWN',
  expiryAt: null,
  estimatedExpiryAt: null,
  openedAt: null,
  purchasedAt: null,
  sourceType: 'MANUAL',
  dataSource: 'manual',
  sourceId: null,
  lotVersion: 7,
  version: 7,
  inventoryVersion: 3,
  createdAt: '2026-10-01',
  updatedAt: '2026-10-01',
};
let root: Root, host: HTMLDivElement, client: QueryClient;
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
async function until(check: () => void) {
  for (let i = 0; i < 100; i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 5));
    });
    try {
      check();
      return;
    } catch (e) {
      if (i === 99) throw e;
    }
  }
}
const button = (label: string) =>
  [...host.querySelectorAll('button')].find((el) => el.textContent?.trim() === label)!;
async function click(label: string) {
  await act(async () => button(label).click());
}
async function fill(value: string) {
  const input = host.querySelector<HTMLInputElement>('#lot-name-input')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function render() {
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/fridge/lot-egg']}>
          <Routes>
            <Route path="/fridge/:id" element={<IngredientDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  );
}
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  localStorage.clear();
  localStorage.setItem('frigo_user_id', 'ui09-user');
  localStorage.setItem('frigo_household_id', 'ui09-house');
  mocks.lot.mockReset().mockResolvedValue(lot);
  mocks.legacy.mockReset().mockResolvedValue([]);
  mocks.update.mockReset().mockResolvedValue(lot);
  mocks.invalidate.mockReset().mockResolvedValue(undefined);
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  client.clear();
  localStorage.clear();
  vi.unstubAllGlobals();
});
describe('UI09 detail interaction and honest state', () => {
  it('keeps loading while the compatibility fallback is pending instead of claiming absence', async () => {
    const legacy = deferred<unknown[]>();
    mocks.lot.mockRejectedValue(new ApiError('http', 'HTTP 404', 404));
    mocks.legacy.mockReturnValue(legacy.promise);
    await render();
    await until(() => expect(mocks.legacy).toHaveBeenCalled());
    expect(host.querySelector('[role=status]')?.textContent).toContain('Đang tải nguyên liệu');
    expect(host.textContent).not.toContain('Không tìm thấy');
    await act(async () => legacy.resolve([]));
    await until(() => expect(host.textContent).toContain('Không tìm thấy nguyên liệu'));
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it('focuses editing, locks controls during one versioned save and returns focus after success', async () => {
    const saving = deferred<InventoryLotDetail>();
    mocks.update.mockReturnValue(saving.promise);
    await render();
    await until(() => expect(button('Sửa thông tin nguyên liệu')).toBeTruthy());
    await click('Sửa thông tin nguyên liệu');
    expect(document.activeElement?.id).toBe('lot-name-input');
    await fill('Trứng đã kiểm tra');
    await click('Lưu thay đổi');
    await until(() => expect(host.querySelector('fieldset')?.disabled).toBe(true));
    expect(host.querySelector<HTMLInputElement>('#lot-name-input')?.matches(':disabled')).toBe(
      true,
    );
    expect(button('Hủy').matches(':disabled')).toBe(true);
    expect(mocks.update).toHaveBeenCalledExactlyOnceWith(
      'projection-egg',
      { name: 'Trứng đã kiểm tra' },
      7,
    );
    mocks.lot.mockResolvedValue({ ...lot, name: 'Trứng đã kiểm tra', version: 8, lotVersion: 8 });
    await act(async () => saving.resolve(lot));
    await until(() => expect(host.querySelector('form')).toBeNull());
    expect(document.activeElement).toBe(button('Sửa thông tin nguyên liệu'));
  });
  it('retains a rejected draft and focuses safe error copy', async () => {
    mocks.update.mockRejectedValue(new ApiError('http', 'HTTP 500 PRIVATE_DETAIL', 500));
    await render();
    await until(() => expect(button('Sửa thông tin nguyên liệu')).toBeTruthy());
    await click('Sửa thông tin nguyên liệu');
    await fill('Trứng mới');
    await click('Lưu thay đổi');
    await until(() => expect(document.activeElement?.getAttribute('role')).toBe('alert'));
    expect(host.querySelector<HTMLInputElement>('#lot-name-input')?.value).toBe('Trứng mới');
    expect(host.textContent).not.toContain('PRIVATE_DETAIL');
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(host.querySelector('fieldset')?.disabled).toBe(false);
  });
  it('warns on document exit only for a dirty draft or pending save and removes warning on cancel', async () => {
    await render();
    await until(() => expect(button('Sửa thông tin nguyên liệu')).toBeTruthy());
    await click('Sửa thông tin nguyên liệu');
    expect(window.dispatchEvent(new Event('beforeunload', { cancelable: true }))).toBe(true);
    await fill('Trứng khác');
    expect(window.dispatchEvent(new Event('beforeunload', { cancelable: true }))).toBe(false);
    await click('Hủy');
    expect(window.dispatchEvent(new Event('beforeunload', { cancelable: true }))).toBe(true);
    expect(document.activeElement).toBe(button('Sửa thông tin nguyên liệu'));
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it('labels related recipes as ingredient relevance and preserves unknown expiry', async () => {
    await render();
    await until(() => expect(host.querySelector('[data-testid=lot-expiry]')).toBeTruthy());
    expect(host.textContent).toContain('Món có nguyên liệu này');
    expect(host.textContent).toContain('kiểm tra lượng cần, nguyên liệu còn thiếu');
    expect(host.textContent).not.toContain('Món ngon có thể nấu');
    expect(host.querySelector('[data-testid=lot-expiry]')?.textContent).toBe('Chưa rõ hạn dùng');
    expect(host.querySelectorAll('h1')).toHaveLength(1);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});

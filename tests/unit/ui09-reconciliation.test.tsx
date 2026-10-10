// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReconciliationPage } from '../../src/web/pages/ReconciliationPage';
import { ApiError } from '../../src/web/services/http';
import type { InventoryObservationView } from '../../src/web/services/inventory-truth';
const mocks = vi.hoisted(() => ({ read: vi.fn(), decide: vi.fn(), invalidate: vi.fn() }));
vi.mock('../../src/web/services/api', async () => ({
  ApiError: (await import('../../src/web/services/http')).ApiError,
  api: { getInventoryObservations: mocks.read, decideInventoryObservation: mocks.decide },
}));
vi.mock('../../src/web/lib/query-invalidation', () => ({
  invalidateInventoryDependents: mocks.invalidate,
}));
const observation: InventoryObservationView = {
  observationId: 'observation-1',
  sourceType: 'SCAN',
  sourceRef: 'scan-1',
  dataSource: 'scan',
  observedAt: '2026-10-10',
  recordedAt: '2026-10-10',
  rawName: 'Trứng kiểm kê',
  ingredientId: 'CHICKEN_EGG',
  lotId: 'lot-1',
  legacyItemId: null,
  evidence: 'CONFIRMED',
  note: null,
  status: 'OPEN',
  version: 4,
  claim: { quantity: 5, unit: 'piece', storage: 'freezer' },
  verdict: 'PROPOSE_CORRECTION',
  reasons: ['QUANTITY_MISMATCH'],
  matchedLotId: 'lot-1',
  proposals: [{ opaqueServerProposal: 'retain exactly' }],
};
let host: HTMLDivElement, root: Root, client: QueryClient;
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
async function render() {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <QueryClientProvider client={client}>
          <ReconciliationPage />
        </QueryClientProvider>
      </MemoryRouter>,
    ),
  );
}
const button = (name: string) =>
  [...host.querySelectorAll('button')].find((el) => el.textContent?.trim() === name)!;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  localStorage.clear();
  localStorage.setItem('frigo_user_id', 'ui09-user');
  localStorage.setItem('frigo_household_id', 'ui09-house');
  mocks.read.mockReset().mockResolvedValue([observation]);
  mocks.decide.mockReset().mockResolvedValue({ success: true });
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
describe('UI09 reconciliation preserves server authority', () => {
  it.each([
    ['PROPOSE_CORRECTION', 'CORRECT'],
    ['PROPOSE_MOVE', 'MOVE'],
  ])(
    'echoes the existing %s proposals and version without inventing stock',
    async (verdict, decisionType) => {
      mocks.read.mockResolvedValue([{ ...observation, verdict }]);
      await render();
      await until(() => expect(button('Áp dụng')).toBeTruthy());
      expect(host.textContent).toContain('Ngăn đông');
      expect(host.textContent).not.toContain('freezer');
      mocks.read.mockResolvedValue([]);
      await act(async () => button('Áp dụng').click());
      await until(() => expect(host.querySelector('article')).toBeNull());
      expect(mocks.decide).toHaveBeenCalledExactlyOnceWith({
        observationId: 'observation-1',
        expectedObservationVersion: 4,
        decisionType,
        proposals: observation.proposals,
      });
      expect(host.textContent).toContain('Không có mục nào cần đối chiếu');
      expect(host.querySelectorAll('h1')).toHaveLength(1);
    },
  );
  it('allows dismissing unsupported evidence without proposals or a stock mutation', async () => {
    mocks.read.mockResolvedValue([{ ...observation, verdict: 'UNSUPPORTED', proposals: [] }]);
    await render();
    await until(() => expect(button('Áp dụng')).toBeTruthy());
    expect(button('Áp dụng').disabled).toBe(true);
    await act(async () => button('Bỏ qua').click());
    expect(mocks.decide).toHaveBeenCalledExactlyOnceWith({
      observationId: 'observation-1',
      expectedObservationVersion: 4,
      decisionType: 'DISMISS',
    });
  });
  it('focuses a safe failure and leaves the observation available for explicit retry', async () => {
    mocks.decide.mockRejectedValue(new ApiError('http', 'HTTP 500 PRIVATE_SERVER_DETAIL', 500));
    await render();
    await until(() => expect(button('Áp dụng')).toBeTruthy());
    await act(async () => button('Áp dụng').click());
    await until(() => expect(document.activeElement?.getAttribute('role')).toBe('alert'));
    expect(host.textContent).not.toContain('PRIVATE_SERVER_DETAIL');
    expect(host.querySelector('article')).toBeTruthy();
    expect(mocks.decide).toHaveBeenCalledTimes(1);
    expect(mocks.invalidate).not.toHaveBeenCalled();
  });
});

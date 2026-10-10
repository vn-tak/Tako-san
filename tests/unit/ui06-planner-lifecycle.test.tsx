// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PlannerPage } from '../../src/web/pages/PlannerPage';
import { usePlanner } from '../../src/web/features/planner/usePlanner';

const mocks = vi.hoisted(() => ({ current: vi.fn(), generate: vi.fn(), accepted: vi.fn() }));
vi.mock('../../src/web/services/meal-planning', () => ({
  mealPlanningApi: { current: mocks.current, generate: mocks.generate },
}));
vi.mock('../../src/web/features/planner/PlannerShell', () => ({
  PlannerShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PlannerError: () => null,
  FreshnessNotice: () => null,
}));
vi.mock('../../src/web/features/planner/PlannerSetup', () => ({
  PlannerSetup: ({ model }: { model: ReturnType<typeof usePlanner> }) => (
    <button
      onClick={async () => {
        const result = await model.perform('generate', mocks.generate, mocks.accepted);
        if (result) mocks.accepted('navigate');
      }}
    >
      Generate
    </button>
  ),
}));
vi.mock('../../src/web/features/planner/PlannerWeek', () => ({ PlannerWeek: () => null }));
vi.mock('../../src/web/features/planner/PlannerMeal', () => ({ PlannerMeal: () => null }));
vi.mock('../../src/web/features/planner/PlannerShopping', () => ({ PlannerShopping: () => null }));
let root: Root;
let host: HTMLDivElement;
let client: QueryClient;
let navigate: ReturnType<typeof useNavigate>;
function Navigation() {
  navigate = useNavigate();
  return <PlannerPage />;
}
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('frigo_user_id', 'user-a');
  localStorage.setItem('frigo_household_id', 'house-a');
  mocks.current.mockResolvedValue({ plan: null });
  mocks.generate.mockReset();
  mocks.accepted.mockReset();
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  client.clear();
  vi.unstubAllGlobals();
});
async function open() {
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/planner/new']}>
          <Navigation />
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  );
}
it('ignores late generation after a pathname change and allows the new workspace to operate', async () => {
  let release!: (value: unknown) => void;
  mocks.generate.mockReturnValueOnce(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  await open();
  await act(async () => host.querySelector('button')!.click());
  await act(async () => navigate('/planner'));
  await act(async () => release({ id: 'old-plan' }));
  expect(mocks.accepted).not.toHaveBeenCalled();
  await act(async () => navigate('/planner/new'));
  mocks.generate.mockResolvedValue({ id: 'new-plan' });
  await act(async () => host.querySelector('button')!.click());
  expect(mocks.accepted).toHaveBeenCalledWith({ id: 'new-plan' });
  expect(mocks.accepted).toHaveBeenCalledWith('navigate');
});
it('keeps a single flight while the owning workspace is open', async () => {
  let release!: (value: unknown) => void;
  mocks.generate.mockReturnValue(
    new Promise((resolve) => {
      release = resolve;
    }),
  );
  await open();
  await act(async () => {
    host.querySelector('button')!.click();
    host.querySelector('button')!.click();
  });
  expect(mocks.generate).toHaveBeenCalledTimes(1);
  await act(async () => release({ id: 'plan' }));
  expect(mocks.accepted.mock.calls).toEqual([[{ id: 'plan' }], ['navigate']]);
});

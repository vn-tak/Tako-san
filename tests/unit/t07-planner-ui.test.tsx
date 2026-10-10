// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlannerPage } from '../../src/web/pages/PlannerPage';
import { queryClient } from '../../src/web/lib/query-client';
import { queryKeys } from '../../src/web/lib/queryKeys';
import { clearPrivateIdentity, resetPrivateSession } from '../../src/web/lib/private-session';
import { isMealPlannerEnabled } from '../../src/web/features/planner/feature';
import { hookPlan, hookPlanId, hookShopping } from '../helpers/planner-hook-fixtures';

const fetchMock = vi.fn<typeof fetch>();
let root: Root | undefined;
let container: HTMLDivElement;
let storedPlan = hookPlan();

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function setOwner(userId = 'user-a', householdId = 'house-a') {
  localStorage.setItem('frigo_user_id', userId);
  localStorage.setItem('frigo_household_id', householdId);
}

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function PlannerRoutes() {
  return <><LocationProbe /><Routes>
    <Route path="/planner" element={<PlannerPage />} />
    <Route path="/planner/new" element={<PlannerPage />} />
    <Route path="/planner/:planId" element={<PlannerPage />} />
    <Route path="/planner/:planId/meal/:slotId" element={<PlannerPage />} />
    <Route path="/planner/:planId/shopping" element={<PlannerPage />} />
  </Routes></>;
}

async function flush() {
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 5)); });
}

async function until(assertion: () => void) {
  const deadline = Date.now() + 1_500;
  for (;;) {
    await flush();
    try { assertion(); return; }
    catch (failure) { if (Date.now() >= deadline) throw failure; }
  }
}

async function mount(path: string) {
  root ??= createRoot(container);
  await act(async () => {
    root!.render(<QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PlannerRoutes />
      </MemoryRouter>
    </QueryClientProvider>);
  });
  await flush();
}

function button(label: string) {
  const found = [...container.querySelectorAll('button')].find((item) =>
    item.textContent?.trim() === label || item.getAttribute('aria-label') === label);
  expect(found, `button ${label}`).toBeTruthy();
  return found!;
}

async function click(label: string) {
  await act(async () => { button(label).click(); });
  await flush();
}

async function follow(path: string) {
  const link = container.querySelector<HTMLAnchorElement>(`a[href="${path}"]`);
  expect(link, `link ${path}`).toBeTruthy();
  await act(async () => {
    link!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  });
  await flush();
}

beforeEach(() => {
  // jsdom has no layout scrolling API; browser QA verifies visibility and focus.
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('fetch', fetchMock);
  localStorage.clear(); sessionStorage.clear(); setOwner();
  localStorage.setItem('frigo_planner_locale', 'en');
  queryClient.clear(); storedPlan = hookPlan();
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (input) => {
    const url = String(input);
    if (url.endsWith('/current')) return response({ plan: storedPlan });
    if (url.endsWith('/shopping')) return response(hookShopping(storedPlan.revision));
    return response(storedPlan);
  });
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(async () => {
  await act(async () => { root?.unmount(); });
  root = undefined;
  queryClient.clear();
  container.remove();
  vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks();
});

describe('T07 planner mounted route and session audit', () => {
  it.each([undefined, '', 'false', 'TRUE', 'enabled'])('keeps the frontend planner feature off for %s', (value) => {
    vi.stubEnv('VITE_MEAL_PLANNER_ENABLED', value);
    expect(isMealPlannerEnabled()).toBe(false);
  });

  it('enables the frontend planner only for the literal true flag', () => {
    vi.stubEnv('VITE_MEAL_PLANNER_ENABLED', 'true');
    expect(isMealPlannerEnabled()).toBe(true);
  });

  it('keeps a revision response authoritative when an older direct-route GET completes late', async () => {
    const oldGet = deferred<Response>();
    queryClient.setQueryData(queryKeys.mealPlanningPlan(hookPlanId), hookPlan());
    fetchMock.mockReturnValueOnce(oldGet.promise);

    await mount(`/planner/${hookPlanId}`);
    await until(() => expect(container.textContent).toContain('Dinner revision 1'));
    fetchMock.mockResolvedValueOnce(response(hookPlan(2)));
    await click('Regenerate plan');
    await click('Regenerate');
    await until(() => expect(container.textContent).toContain('Dinner revision 2'));

    await act(async () => { oldGet.resolve(response(hookPlan())); });
    await flush();
    expect(container.textContent).toContain('Dinner revision 2');
    expect(container.textContent).not.toContain('Dinner revision 1');
    expect(queryClient.getQueryData(queryKeys.mealPlanningPlan(hookPlanId))).toEqual(hookPlan(2));
  });

  it('removes shopping state after same-session navigation from shopping to regeneration', async () => {
    await mount(`/planner/${hookPlanId}/shopping`);
    await until(() => expect(container.textContent).toContain('Prepare shopping list'));
    await click('Prepare shopping list');
    await until(() => expect(container.querySelector('[data-testid="shopping-result"]')).not.toBeNull());

    await follow(`/planner/${hookPlanId}`);
    await until(() => expect(container.querySelector('[data-testid="location"]')?.textContent).toBe(`/planner/${hookPlanId}`));
    fetchMock.mockResolvedValueOnce(response(hookPlan(2)));
    await click('Regenerate plan');
    await click('Regenerate');
    await until(() => expect(container.textContent).toContain('Dinner revision 2'));

    expect(container.querySelector('[data-testid="shopping-result"]')).toBeNull();
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/shopping'))).toHaveLength(1);
    const regenerate = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/regenerate'));
    expect(JSON.parse(String(regenerate?.[1]?.body))).toMatchObject({ revision: 1 });
  });

  it('does not flash account A private plan while logout and login switch to account B', async () => {
    await mount(`/planner/${hookPlanId}`);
    await until(() => expect(container.textContent).toContain('Dinner revision 1'));
    storedPlan = hookPlan(3, 'house-b');

    await act(async () => {
      clearPrivateIdentity();
      setOwner('user-b', 'house-b');
      resetPrivateSession();
    });
    await flush();
    expect(container.textContent).not.toContain('Dinner revision 1');
    await until(() => expect(container.textContent).toContain('Dinner revision 3'));
    expect(queryClient.getQueryData(['mealPlanningPlan', 'user-a', 'house-a', hookPlanId])).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.mealPlanningPlan(hookPlanId))).toEqual(storedPlan);
  });

  it('replaces the plan after a 409 recovery without retaining a stale conflict alert', async () => {
    await mount(`/planner/${hookPlanId}`);
    await until(() => expect(container.textContent).toContain('Dinner revision 1'));
    fetchMock.mockResolvedValueOnce(response({ code: 'PLAN_REVISION_CONFLICT' }, 409))
      .mockResolvedValueOnce(response(hookPlan(2)));

    await click('Regenerate plan');
    await click('Regenerate');
    await until(() => expect(container.textContent).toContain('Dinner revision 2'));
    expect(container.textContent).toContain('The latest plan has been loaded. Review it before continuing.');
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(queryClient.getQueryData(queryKeys.mealPlanningPlan(hookPlanId))).toEqual(hookPlan(2));
  });

  it.each([
    ['unavailable', response({ error: 'private outage' }, 503)],
    ['malformed', response({ ...hookPlan(), revision: 0 })],
  ] as const)('keeps the prior plan and never announces recovery when the 409 refresh is %s', async (_name, recovery) => {
    await mount(`/planner/${hookPlanId}`);
    await until(() => expect(container.textContent).toContain('Dinner revision 1'));
    fetchMock.mockResolvedValueOnce(response({ code: 'PLAN_REVISION_CONFLICT' }, 409))
      .mockResolvedValueOnce(recovery);

    await click('Regenerate plan');
    await click('Regenerate');
    await until(() => expect(container.querySelector('[role="alert"]')).not.toBeNull());
    expect(container.textContent).toContain('Dinner revision 1');
    expect(container.textContent).not.toContain('Latest revision loaded');
    expect(queryClient.getQueryData(queryKeys.mealPlanningPlan(hookPlanId))).toEqual(hookPlan());
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/regenerate'))).toHaveLength(1);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith(`/${hookPlanId}`))).toHaveLength(2);
  });
});

// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/web/App';
import { useAuthStore } from '../../src/web/stores/useAuthStore';
import { queryClient } from '../../src/web/lib/query-client';
const mocks = vi.hoisted(() => ({ complete: vi.fn() }));
vi.mock('../../src/web/services/api', () => ({ api: { completeOnboarding: mocks.complete } }));
// Isolate the actual App guards from unrelated boot verification and destination data.
vi.mock('../../src/web/components/common/SessionBoundary', () => ({ SessionBoundary: ({ children }: { children: ReactNode }) => children }));
vi.mock('../../src/web/pages/HomePage', () => ({ HomePage: () => <h1>Home destination</h1> }));
vi.mock('../../src/web/pages/WeekSetupPage', () => ({ WeekSetupPage: () => <h1>Legacy Week destination</h1> }));
vi.mock('../../src/web/pages/PlannerPage', () => ({ PlannerPage: () => <h1>Planner destination</h1> }));
let root: Root, host: HTMLDivElement;
async function until(check: () => void) {
  const end = Date.now() + 1500;
  for (;;) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 5)); });
    try { check(); return; } catch (error) { if (Date.now() >= end) throw error; }
  }
}
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubEnv('VITE_MEAL_PLANNER_ENABLED', 'true');
  localStorage.clear(); sessionStorage.clear();
  localStorage.setItem('frigo_user_id', 'guard-user'); localStorage.setItem('frigo_household_id', 'guard-house');
  useAuthStore.setState({ userId: 'guard-user', householdId: 'guard-house', isGuest: true, isOnboarded: false, householdSize: 2, spicyLevel: 'medium', favoriteCuisines: [], dietaryRestrictions: [], primaryGoal: undefined });
  mocks.complete.mockReset(); mocks.complete.mockResolvedValue({ success: true, onboardingCompleted: true });
  window.history.replaceState({}, '', '/onboarding/goals');
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); queryClient.clear(); localStorage.clear(); sessionStorage.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('UI08 completion intent through actual App guards', () => {
  it.each(['today', 'week', 'both'] as const)('%s reaches its chosen destination after server confirmation', async (goal) => {
    await act(async () => root.render(<App />));
    await until(() => expect(host.querySelector('input[name="primary-goal"]')).toBeTruthy());
    await act(async () => host.querySelector<HTMLInputElement>(`input[value="${goal}"]`)!.click());
    const submit = [...host.querySelectorAll('button')].find((el) => el.textContent?.includes('Bắt đầu với Takosan'))!;
    await act(async () => submit.click());
    await until(() => expect(window.location.pathname).toBe(goal === 'week' ? '/planner/new' : '/'));
    expect(useAuthStore.getState().isOnboarded).toBe(true);
    expect(mocks.complete.mock.calls[0][0]).not.toHaveProperty('primaryGoal');
    expect(host.textContent).toContain(goal === 'week' ? 'Planner destination' : 'Home destination');
  });
  it('week retains the legacy setup destination when planner is disabled', async () => {
    vi.stubEnv('VITE_MEAL_PLANNER_ENABLED', 'false');
    await act(async () => root.render(<App />));
    await until(() => expect(host.querySelector('input[name="primary-goal"]')).toBeTruthy());
    await act(async () => host.querySelector<HTMLInputElement>('input[value="week"]')!.click());
    await act(async () => [...host.querySelectorAll('button')].find((el) => el.textContent?.includes('Bắt đầu với Takosan'))!.click());
    await until(() => expect(window.location.pathname).toBe('/week/setup'));
    expect(host.textContent).toContain('Legacy Week destination');
  });
  it('an already completed account with no client goal goes Home', async () => {
    useAuthStore.setState({ isOnboarded: true, primaryGoal: undefined });
    await act(async () => root.render(<App />));
    await until(() => expect(window.location.pathname).toBe('/'));
    expect(mocks.complete).not.toHaveBeenCalled();
  });
  it('keeps a rejected completion on the selected goal instead of redirecting', async () => {
    mocks.complete.mockResolvedValue({ success: true, onboardingCompleted: false });
    await act(async () => root.render(<App />));
    await until(() => expect(host.querySelector('input[name="primary-goal"]')).toBeTruthy());
    await act(async () => host.querySelector<HTMLInputElement>('input[value="week"]')!.click());
    await act(async () => [...host.querySelectorAll('button')].find((el) => el.textContent?.includes('Bắt đầu với Takosan'))!.click());
    expect(window.location.pathname).toBe('/onboarding/goals');
    expect(useAuthStore.getState().isOnboarded).toBe(false);
    expect(host.querySelector<HTMLInputElement>('input[value="week"]')!.checked).toBe(true);
    expect(host.querySelector('[role=alert]')?.textContent).toContain('Chưa thể lưu');
  });
});

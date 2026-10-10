// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { App } from '../../src/web/App';
import { useAuthStore } from '../../src/web/stores/useAuthStore';
import { queryClient } from '../../src/web/lib/query-client';
vi.mock('../../src/web/components/common/SessionBoundary', () => ({
  SessionBoundary: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('../../src/web/pages/PlannerPage', () => ({
  PlannerPage: () => <h1>Planner destination</h1>,
}));
vi.mock('../../src/web/pages/WeekDashboardPage', () => ({
  WeekDashboardPage: () => <h1>Week board</h1>,
}));
vi.mock('../../src/web/pages/WeekSetupPage', () => ({ WeekSetupPage: () => <h1>Week setup</h1> }));
vi.mock('../../src/web/pages/WeekGeneratingPage', () => ({
  WeekGeneratingPage: () => <h1>Week generating</h1>,
}));
vi.mock('../../src/web/pages/MealDetailPage', () => ({ MealDetailPage: () => <h1>Week meal</h1> }));
vi.mock('../../src/web/pages/WeekShoppingPage', () => ({
  WeekShoppingPage: () => <h1>Week shopping</h1>,
}));
vi.mock('../../src/web/pages/WeekSettingsPage', () => ({
  WeekSettingsPage: () => <h1>Week settings</h1>,
}));
vi.mock('../../src/web/pages/settings/PlanningSettingsPage', () => ({
  PlanningSettingsPage: () => <h1>Planner destination</h1>,
}));
let root: Root, host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('frigo_user_id', 'routes-user');
  localStorage.setItem('frigo_household_id', 'routes-house');
  useAuthStore.setState({
    userId: 'routes-user',
    householdId: 'routes-house',
    isGuest: true,
    isOnboarded: true,
  });
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  queryClient.clear();
  localStorage.clear();
  sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
const paths = [
  ['/week', '/planner', 'Week board'],
  ['/week/setup', '/planner/new', 'Week setup'],
  ['/week/generating', '/planner', 'Week generating'],
  ['/week/plan-a', '/planner/plan-a', 'Week board'],
  ['/week/plan-a/meal/meal-a', '/planner/plan-a/meal/meal-a', 'Week meal'],
  ['/week/plan-a/shopping', '/planner/plan-a/shopping', 'Week shopping'],
  ['/week/plan-a/settings', '/settings/planning', 'Week settings'],
];
it.each(paths)('planner on preserves %s → %s', async (source, destination) => {
  vi.stubEnv('VITE_MEAL_PLANNER_ENABLED', 'true');
  window.history.replaceState({}, '', source);
  await act(async () => root.render(<App />));
  await vi.waitFor(async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    expect(host.textContent).toContain('Planner destination');
  });
  expect(window.location.pathname).toBe(destination);
});
it.each(paths)(
  'planner off keeps %s at its Week destination',
  async (source, _destination, label) => {
    vi.stubEnv('VITE_MEAL_PLANNER_ENABLED', 'false');
    window.history.replaceState({}, '', source);
    await act(async () => root.render(<App />));
    await vi.waitFor(async () => {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
      });
      expect(host.textContent).toContain(label);
    });
    expect(window.location.pathname).toBe(source);
  },
);

// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from '../../src/web/pages/HomePage';
import { RecipeDetailPage } from '../../src/web/pages/RecipeDetailPage';
import { RecipesPage } from '../../src/web/pages/RecipesPage';
import { KitchenHeader } from '../../src/web/components/common/KitchenHeader';
import { useHomePlan } from '../../src/web/lib/use-home-plan';
import { ApiError } from '../../src/web/services/http';
import { queryKeys } from '../../src/web/lib/queryKeys';
import { hookPlan } from '../helpers/planner-hook-fixtures';
import { homeComposition, discoveryRecipes, homeWeekPlan } from '../helpers/ui02-fixtures';

const mocks = vi.hoisted(() => ({
  current: vi.fn(),
  week: vi.fn(),
  compositions: vi.fn(),
  inventory: vi.fn(),
  recommendations: vi.fn(),
  recipe: vi.fn(),
}));
vi.mock('../../src/web/services/api', async () => ({
  ApiError: (await import('../../src/web/services/http')).ApiError,
  api: {
    getCurrentWeekPlan: mocks.week,
    getInventory: mocks.inventory,
    getRecommendations: mocks.recommendations,
    getRecipeById: mocks.recipe,
  },
}));
vi.mock('../../src/web/services/meal-planning', () => ({
  mealPlanningApi: { current: mocks.current },
}));
vi.mock('../../src/web/services/meal-composition', () => ({
  mealCompositionApi: { plan: mocks.compositions },
}));
let root: Root;
let container: HTMLDivElement;
let client: QueryClient;
let homeModel: ReturnType<typeof useHomePlan>;
const instant = new Date('2030-01-01T16:00:00Z');
function HomeProbe() {
  homeModel = useHomePlan(instant);
  return (
    <output>
      {homeModel.plan?.meal?.state ?? (homeModel.query.isPending ? 'loading' : 'no-plan')}
    </output>
  );
}
function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-location>
        {location.pathname}
        {location.search}
      </output>
      <button onClick={() => navigate(-1)}>History back</button>
    </>
  );
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
async function until(assertion: () => void) {
  const deadline = Date.now() + 2000;
  for (;;) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    try {
      assertion();
      return;
    } catch (error) {
      if (Date.now() >= deadline) throw error;
    }
  }
}
async function mount(node: ReactNode, path = '/') {
  await act(async () =>
    root.render(
      <QueryClientProvider client={client}>
        <MemoryRouter
          initialEntries={[path]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <LocationProbe />
          {node}
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  );
}
async function click(text: string) {
  const target = [...container.querySelectorAll<HTMLElement>('a,button')].find(
    (item) => item.textContent?.trim() === text,
  );
  expect(target).toBeDefined();
  await act(async () => target!.click());
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubEnv('VITE_MEAL_PLANNER_ENABLED', 'true');
  vi.stubEnv('VITE_MEAL_COMPOSITION_V2_ENABLED', 'true');
  localStorage.setItem('frigo_user_id', 'user-a');
  localStorage.setItem('frigo_household_id', 'house-a');
  mocks.current.mockResolvedValue({ plan: hookPlan() });
  mocks.week.mockResolvedValue(null);
  mocks.compositions.mockResolvedValue(homeComposition());
  mocks.inventory.mockResolvedValue([]);
  mocks.recommendations.mockResolvedValue(discoveryRecipes());
  mocks.recipe.mockResolvedValue({
    recipe: discoveryRecipes(1)[0].recipe,
    match: { matchPercentage: 0, availableIngredientCount: 0 },
  });
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  container.remove();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
describe('Home authority and recovery', () => {
  it('flag on reads the canonical source and scoped query key exclusively', async () => {
    await mount(<HomeProbe />);
    await until(() => expect(homeModel.plan?.meal?.state).toBe('ready'));
    expect(mocks.current).toHaveBeenCalledTimes(1);
    expect(mocks.week).not.toHaveBeenCalled();
    expect(client.getQueryData(queryKeys.currentMealPlanningPlan())).toEqual(hookPlan());
  });
  it('flag off retains Week and does not request canonical composition', async () => {
    vi.stubEnv('VITE_MEAL_PLANNER_ENABLED', 'false');
    mocks.week.mockResolvedValue(homeWeekPlan());
    await mount(<HomeProbe />);
    await until(() => expect(homeModel.query.isSuccess).toBe(true));
    expect(mocks.week).toHaveBeenCalledTimes(1);
    expect(mocks.current).not.toHaveBeenCalled();
    expect(mocks.compositions).not.toHaveBeenCalled();
    expect(homeModel.setupHref).toBe('/week/setup');
    expect(homeModel.plan!.meal!.href).toBe('/week/week-plan/meal/week-meal');
  });
  it('composition UI off allows the anchor and retry never requests disabled composition', async () => {
    vi.stubEnv('VITE_MEAL_COMPOSITION_V2_ENABLED', 'false');
    await mount(<HomeProbe />);
    await until(() => expect(homeModel.plan?.meal?.state).toBe('ready'));
    await act(async () => {
      await homeModel.retry();
    });
    expect(homeModel.plan!.meal!.dishes).toEqual(['Dinner revision 1']);
    expect(mocks.compositions).not.toHaveBeenCalled();
  });
  it.each([404, 500])('only explicit404 allows V1 fallback (status%s)', async (status) => {
    mocks.compositions.mockRejectedValue(new ApiError('http', 'test error', status));
    await mount(<HomeProbe />);
    await until(() => expect(homeModel.plan?.meal?.state).toBe(status === 404 ? 'ready' : 'error'));
    expect(homeModel.plan!.meal!.dishes).toEqual(status === 404 ? ['Dinner revision 1'] : []);
  });
  it('retry follows a changed plan identity without rereading the old composition', async () => {
    mocks.compositions.mockRejectedValueOnce(new ApiError('http', 'test', 500));
    await mount(<HomeProbe />);
    await until(() => expect(homeModel.plan?.meal?.state).toBe('error'));
    const next = { ...hookPlan(2), id: '8195b083-ddb7-462d-90c3-1e3c83cbb59c' };
    mocks.current.mockResolvedValue({ plan: next });
    mocks.compositions.mockResolvedValue(homeComposition(next, ['Món hiện tại']));
    await act(async () => {
      await homeModel.retry();
    });
    await until(() => expect(homeModel.plan?.meal?.dishes).toEqual(['Món hiện tại']));
    expect(mocks.compositions.mock.calls.map(([id]) => id)).toEqual([hookPlan().id, next.id]);
  });
  it('composition failure can recover within the same revision', async () => {
    mocks.compositions.mockRejectedValueOnce(new ApiError('http', 'test', 500));
    await mount(<HomeProbe />);
    await until(() => expect(homeModel.plan?.meal?.state).toBe('error'));
    await act(async () => {
      await homeModel.retry();
    });
    await until(() => expect(homeModel.plan?.meal?.state).toBe('ready'));
    expect(mocks.compositions).toHaveBeenCalledTimes(2);
  });
  it('Home renders a tomorrow composed meal and routes to its authoritative detail', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(instant);
    await mount(<HomePage />);
    await until(() => expect(container.textContent).toContain('Canh rau'));
    expect(container.textContent).toContain('Thực đơn bắt đầu ngày mai.');
    const primary = container.querySelector('[data-testid="t18c-home-primary"]')!;
    expect(primary.textContent).toContain('Canh rau');
    expect(primary.textContent).toContain('Cơm');
    expect(primary.textContent).not.toContain('Dinner revision');
    expect(primary.textContent).not.toContain('Chưa có thực đơn');
    expect(primary.querySelector('a')!.href).toContain('/planner/');
    expect(container.querySelectorAll('.kitchen-header')).toHaveLength(1);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });
  it('a recipe opened from Home returns to Home using a native back link', async () => {
    await mount(
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
      </Routes>,
    );
    await until(() =>
      expect(
        container.querySelector(
          '[data-testid="t18c-home-recommendations"] a[href="/recipes/mon-0"]',
        ),
      ).not.toBeNull(),
    );
    await act(async () =>
      container
        .querySelector<HTMLAnchorElement>(
          '[data-testid="t18c-home-recommendations"] a[href="/recipes/mon-0"]',
        )!
        .click(),
    );
    await until(() =>
      expect(container.querySelector('.recipe-intro h1')!.textContent).toBe('Món 0'),
    );
    expect(container.querySelector('a[aria-label="Quay lại"]')!.getAttribute('href')).toBe('/');
    await act(async () =>
      container.querySelector<HTMLAnchorElement>('a[aria-label="Quay lại"]')!.click(),
    );
    await until(() => expect(container.querySelector('h1')!.textContent).toBe('Hôm nay ăn gì?'));
  });
  it('pending/error never looks like no plan or empty fridge', async () => {
    const pending = deferred<{ plan: ReturnType<typeof hookPlan> }>();
    const stock = deferred<[]>();
    mocks.current.mockReturnValue(pending.promise);
    mocks.inventory.mockReturnValue(stock.promise);
    await mount(<HomePage />);
    expect(container.textContent).toContain('Đang tải thực đơn');
    expect(container.textContent).not.toContain('Chưa có thực đơn');
    expect(container.textContent).not.toContain('Tủ lạnh đang trống');
    mocks.current.mockRejectedValue(new ApiError('http', 'test', 500));
    await act(async () => {
      pending.resolve({ plan: hookPlan() });
      stock.resolve([]);
    });
    await until(() => expect(container.textContent).toContain('Canh rau'));
    await act(async () => {
      await client.invalidateQueries({ queryKey: queryKeys.currentMealPlanningPlan() });
    });
    await until(() => expect(container.querySelector('[role="alert"]')).not.toBeNull());
    expect(container.textContent).not.toContain('Chưa có thực đơn');
  });
});
describe('Discovery mounted URL interactions', () => {
  it('renders24/page with native pagination and focuses the new results heading', async () => {
    await mount(<RecipesPage />, '/recipes');
    await until(() => expect(container.querySelectorAll('.discovery-grid > a')).toHaveLength(24));
    expect(container.querySelector('a[href="/recipes?page=2"]')).not.toBeNull();
    await click('Tiếp');
    await until(() =>
      expect(container.querySelector('[data-location]')!.textContent).toBe('/recipes?page=2'),
    );
    expect(container.querySelector('.discovery-grid h3')!.textContent).toBe('Món 24');
    expect(document.activeElement).toBe(container.querySelector('#recipes-results-heading'));
    await click('History back');
    await until(() =>
      expect(container.querySelector('.discovery-grid h3')!.textContent).toBe('Món 0'),
    );
    expect(mocks.recommendations).toHaveBeenCalledTimes(1);
  });
  it('deep-linked search reaches later ingredients and reset restores all results/focus', async () => {
    await mount(<RecipesPage />, '/recipes?q=dau+do&page=8&origin=home');
    await until(() => expect(container.querySelectorAll('.discovery-grid > a')).toHaveLength(1));
    expect(container.querySelector('.discovery-grid h3')!.textContent).toBe('Món 50');
    expect(container.querySelector('[data-location]')!.textContent).toBe(
      '/recipes?q=dau+do&origin=home',
    );
    await click('Xóa tìm kiếm và bộ lọc');
    await until(() => expect(container.querySelectorAll('.discovery-grid > a')).toHaveLength(24));
    expect(document.activeElement).toBe(container.querySelector('#recipe-search'));
    expect(container.querySelector('[data-location]')!.textContent).toBe('/recipes?origin=home');
  });
  it('preserves catalog context through detail state for the real back link', async () => {
    await mount(
      <Routes>
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/recipes/:slug" element={<DetailReturn />} />
      </Routes>,
      '/recipes?page=2',
    );
    await until(() => expect(container.querySelectorAll('.discovery-grid > a')).toHaveLength(24));
    await act(async () =>
      container.querySelector<HTMLAnchorElement>('.discovery-grid > a')!.click(),
    );
    await until(() =>
      expect(container.querySelector('a[aria-label="Quay lại"]')!.getAttribute('href')).toBe(
        '/recipes?page=2',
      ),
    );
    await act(async () =>
      container.querySelector<HTMLAnchorElement>('a[aria-label="Quay lại"]')!.click(),
    );
    await until(() =>
      expect(container.querySelector('.discovery-grid h3')!.textContent).toBe('Món 24'),
    );
  });
  it('a pending list does not claim zero matches', async () => {
    const pending = deferred<ReturnType<typeof discoveryRecipes>>();
    mocks.recommendations.mockReturnValue(pending.promise);
    await mount(<RecipesPage />, '/recipes?page=2');
    expect(container.textContent).toContain('Đang tìm món phù hợp');
    expect(container.textContent).not.toContain('0 món');
    expect(container.querySelector('[data-location]')!.textContent).toBe('/recipes?page=2');
    await act(async () => pending.resolve(discoveryRecipes()));
    await until(() =>
      expect(container.querySelector('.discovery-grid h3')!.textContent).toBe('Món 24'),
    );
  });
});
function DetailReturn() {
  const location = useLocation();
  return <KitchenHeader backTo={(location.state as { discoveryReturn: string }).discoveryReturn} />;
}

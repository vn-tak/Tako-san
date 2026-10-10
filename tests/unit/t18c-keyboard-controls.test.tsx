// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { MealSlotItem } from '@frigo/domain';
import { ALL_RECIPES } from '@frigo/recipes';
import { MealCard } from '../../src/web/features/week/MealCard';
import { MemoryRouter } from 'react-router-dom';
import { WeekSetupPage } from '../../src/web/pages/WeekSetupPage';

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), save: vi.fn() }));
vi.mock('react-router-dom', async (original) => ({
  ...(await original<typeof import('react-router-dom')>()),
  useNavigate: () => mocks.navigate,
}));
vi.mock('../../src/web/components/common/TopBar', () => ({ TopBar: () => <h1>Week setup</h1> }));
vi.mock('../../src/web/stores/useWeekStore', () => ({
  useWeekStore: () => ({ setupDraft: {}, updateSetupDraft: mocks.save }),
}));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
async function render(node: ReactNode) {
  await act(async () => root.render(<MemoryRouter>{node}</MemoryRouter>));
}
function button(name: string) {
  const target = [...container.querySelectorAll('button')].find(
    (element) => (element.getAttribute('aria-label') ?? element.textContent?.trim()) === name,
  );
  expect(target, name).toBeDefined();
  expect(target!.tabIndex).toBe(0);
  expect(target!.querySelector('button, a, input')).toBeNull();
  return target!;
}
async function click(name: string) {
  await act(async () => button(name).click());
}

it.each(['PLANNED', 'COOKED', 'EATING_OUT', 'FLEXIBLE'] as const)(
  'Week %s card exposes only actionable native controls',
  async (status) => {
    const swap = vi.fn();
    const slot: MealSlotItem = {
      id: 'slot',
      dayId: 'day',
      planId: 'plan',
      slotType: 'dinner',
      status,
      date: '2026-09-21',
      dayOfWeek: 1,
      recipe: ALL_RECIPES[0],
      servings: 2,
      source: 'AUTO',
      availabilityPercent: 100,
      incrementalCostVnd: 0,
      rescuedExpiringIngredients: [],
      badges: [],
      ingredients: [],
    };
    await render(<MealCard slot={slot} to="/week/plan/meal/slot" onSwapClick={swap} />);
    const hasDetail = status === 'PLANNED' || status === 'COOKED';
    const detail = container.querySelector('h4 a');
    if (hasDetail) {
      expect(detail?.textContent).toBe(slot.recipe!.title);
      expect(detail?.getAttribute('href')).toBe('/week/plan/meal/slot');
      expect(detail?.querySelector('button, a, input')).toBeNull();
    } else expect(detail).toBeNull();
    expect(swap).not.toHaveBeenCalled();
    if (status !== 'COOKED') {
      await click(
        status === 'EATING_OUT' || status === 'FLEXIBLE'
          ? 'Chọn món khác'
          : `Đổi món ${slot.recipe!.title}`,
      );
      expect(swap).toHaveBeenCalledTimes(1);
    }
  },
);

it('Week setup exposes selection state without changing the saved draft contract', async () => {
  await render(<WeekSetupPage />);
  async function choose(value: string) {
    await act(async () =>
      container.querySelector<HTMLInputElement>(`input[value="${value}"]`)!.click(),
    );
  }
  await choose('all');
  expect(container.querySelector<HTMLInputElement>('input[value="all"]')!.checked).toBe(true);
  await click('Tiếp tục');
  await choose('unlimited');
  expect(container.querySelector<HTMLInputElement>('input[value="unlimited"]')!.checked).toBe(true);
  await click('Tiếp tục');
  await choose('budget');
  expect(container.querySelector<HTMLInputElement>('input[value="budget"]')!.checked).toBe(true);
  await click('Tiếp tục');
  await choose('twice');
  expect(container.querySelector<HTMLInputElement>('input[value="twice"]')!.checked).toBe(true);
  await click('Tạo thực đơn tuần');
  expect(mocks.save).toHaveBeenCalledExactlyOnceWith({
    mealSlotsPreset: 'all',
    budgetTargetVnd: null,
    priorities: ['use_fridge', 'budget'],
    shoppingFrequency: 'twice',
  });
  expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith('/week/generating');
});

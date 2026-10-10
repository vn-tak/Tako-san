// @vitest-environment jsdom
import { StrictMode, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MealPlan } from '@frigo/domain';
import { WeekSetupPage } from '../../src/web/pages/WeekSetupPage';
import { WeekSettingsPage } from '../../src/web/pages/WeekSettingsPage';
import { WeekGeneratingPage } from '../../src/web/pages/WeekGeneratingPage';
import { WeekShoppingPage } from '../../src/web/pages/WeekShoppingPage';
import { WeekDashboardPage } from '../../src/web/pages/WeekDashboardPage';
import { WeekExportModal } from '../../src/web/features/week/WeekExportModal';
import { useWeekStore } from '../../src/web/stores/useWeekStore';
import { queryClient } from '../../src/web/lib/query-client';
import { isKitchenSurface } from '../../src/web/components/layout/AppLayout';
import { resetPrivateSession } from '../../src/web/lib/private-session';
const api = vi.hoisted(() => ({
  createWeekPlan: vi.fn(),
  getWeekPlan: vi.fn(),
  getCurrentWeekPlan: vi.fn(),
  completeWeekShopping: vi.fn(),
}));
vi.mock('../../src/web/services/api', async (original) => ({
  ...(await original<typeof import('../../src/web/services/api')>()),
  api,
}));

const plan: MealPlan = {
  id: 'week-one',
  householdId: 'house-ui10',
  status: 'READY',
  startDate: '2026-10-10',
  endDate: '2026-10-16',
  days: [],
  budget: {
    targetVnd: null,
    estimatedMinVnd: 10000,
    estimatedMaxVnd: 20000,
    status: 'UNDER',
    displayText: '10.000–20.000đ',
  },
  utilization: {
    utilizationPercent: 0,
    plannedItemsCount: 0,
    totalUsableItemsCount: 0,
    highPriorityUsedCount: 0,
  },
  wasteRisk: { level: 'LOW', expiringItemsCount: 0, rescuedItemsCount: 0, displayText: '' },
  shoppingItems: [
    {
      ingredientId: 'carrot',
      name: 'Cà rốt',
      category: 'vegetable',
      unit: 'g',
      requiredQuantity: 200,
      existingInventoryQuantity: 0,
      missingQuantity: 200,
      recommendedPurchaseQuantity: 250,
      estimatedPriceMin: 1000,
      estimatedPriceMax: 2000,
      checked: true,
      sourceRecipes: [],
    },
  ],
  priorities: ['use_fridge'],
  shoppingFrequency: 'once',
  createdAt: '2026-10-10',
  updatedAt: '2026-10-10',
};
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}
let host: HTMLDivElement, root: Root;
function Location() {
  return <output data-path>{useLocation().pathname}</output>;
}
async function mount(element: React.ReactNode, path = '/week/setup') {
  await act(async () =>
    root.render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[path]}>
          <Location />
          <Routes>
            <Route path={path.replace('week-one', ':planId')} element={element} />
            <Route path="*" element={<p>Destination</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  );
}
const buttons = () => [...host.querySelectorAll<HTMLButtonElement>('button')];
async function click(text: string) {
  const target = buttons().find((button) => button.textContent?.includes(text));
  expect(target, text).toBeTruthy();
  await act(async () => target!.click());
}
async function input(value: string) {
  await act(async () => host.querySelector<HTMLInputElement>(`input[value="${value}"]`)!.click());
}
async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 5));
  });
}
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('frigo_user_id', 'user-ui10');
  localStorage.setItem('frigo_household_id', 'house-ui10');
  useWeekStore.setState(useWeekStore.getInitialState(), true);
  queryClient.clear();
  queryClient.setDefaultOptions({
    queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
  });
  for (const fn of Object.values(api)) fn.mockReset();
  api.getWeekPlan.mockResolvedValue(plan);
  api.getCurrentWeekPlan.mockResolvedValue(plan);
  api.createWeekPlan.mockResolvedValue(plan);
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  queryClient.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
  sessionStorage.clear();
});

describe('UI10 truthful setup and generation', () => {
  it('retains choices on back and submits four real stages only after explicit generation', async () => {
    await mount(<WeekSetupPage />);
    expect(host.querySelectorAll('h1')).toHaveLength(1);
    await input('working_people');
    await click('Tiếp tục');
    await input('unlimited');
    await click('Tiếp tục');
    expect(host.querySelector('h2')?.textContent).toContain('ưu tiên');
    expect(document.activeElement).toBe(host.querySelector('h2'));
    await input('budget');
    await input('quick');
    expect(host.querySelector<HTMLInputElement>('input[value="variety"]')!.disabled).toBe(true);
    await click('Bước trước');
    expect(host.querySelector<HTMLInputElement>('input[value="unlimited"]')!.checked).toBe(true);
    await click('Bước trước');
    expect(host.querySelector<HTMLInputElement>('input[value="working_people"]')!.checked).toBe(
      true,
    );
    await click('Tiếp tục');
    await click('Tiếp tục');
    await click('Tiếp tục');
    await input('twice');
    expect(api.createWeekPlan).not.toHaveBeenCalled();
    expect(host.textContent).toContain('Bước 4 / 4');
    await click('Tạo thực đơn tuần');
    expect(host.querySelector('[data-path]')!.textContent).toBe('/week/generating');
    expect(useWeekStore.getState().setupDraft).toMatchObject({
      mealSlotsPreset: 'working_people',
      budgetTargetVnd: null,
      priorities: ['use_fridge', 'budget', 'quick'],
      shoppingFrequency: 'twice',
    });
    expect(useWeekStore.getState().setupDraft).not.toHaveProperty('schedule');
  });
  it('keeps at least one priority selected', async () => {
    await mount(<WeekSetupPage />);
    await click('Tiếp tục');
    await click('Tiếp tục');
    expect(host.querySelector<HTMLInputElement>('input[value="use_fridge"]')!.disabled).toBe(true);
    await input('budget');
    await input('use_fridge');
    expect(host.querySelector<HTMLInputElement>('input[value="budget"]')!.disabled).toBe(true);
  });
  it.each([null, undefined] as const)(
    'preserves budget %s and reuses one command under StrictMode',
    async (budget) => {
      const response = deferred<MealPlan>();
      api.createWeekPlan.mockReturnValue(response.promise);
      useWeekStore.setState({ setupDraft: { budgetTargetVnd: budget } });
      await mount(
        <StrictMode>
          <WeekGeneratingPage />
        </StrictMode>,
        '/week/generating',
      );
      expect(api.createWeekPlan).toHaveBeenCalledTimes(1);
      expect(api.createWeekPlan.mock.calls[0][0].budgetTargetVnd).toBe(
        budget === undefined ? 750000 : null,
      );
      await act(async () => response.resolve(plan));
      expect(host.querySelector('[data-path]')!.textContent).toBe('/week/week-one');
    },
  );
  it('does not generate without a private identity', async () => {
    localStorage.clear();
    await mount(<WeekGeneratingPage />, '/week/generating');
    expect(api.createWeekPlan).not.toHaveBeenCalled();
    expect(host.textContent).toContain('Chưa tạo được');
  });
  it('ignores generation completion after private reset', async () => {
    const response = deferred<MealPlan>();
    api.createWeekPlan.mockReturnValue(response.promise);
    await mount(<WeekGeneratingPage />, '/week/generating');
    await act(async () => {
      resetPrivateSession();
      response.resolve(plan);
    });
    expect(host.querySelector('[data-path]')!.textContent).toBe('/week/generating');
  });
  it('shows a safe generation failure and explicit return', async () => {
    api.createWeekPlan.mockRejectedValue(new Error('PRIVATE_INTERNAL'));
    await mount(<WeekGeneratingPage />, '/week/generating');
    expect(host.querySelector('[role="alert"]')).toBeTruthy();
    expect(host.textContent).not.toContain('PRIVATE_INTERNAL');
    await click('Quay lại thiết lập');
    expect(host.querySelector('[data-path]')!.textContent).toBe('/week/setup');
  });
  it('applies settings to the session draft without mutating the current plan or navigating on a timer', async () => {
    useWeekStore.setState({
      currentPlan: plan,
      setupDraft: { budgetTargetVnd: null, shoppingFrequency: 'twice' },
    });
    await mount(<WeekSettingsPage />, '/week/week-one/settings');
    expect(host.querySelector<HTMLInputElement>('input[value="unlimited"]')!.checked).toBe(true);
    await input('500000');
    await click('Áp dụng vào bản nháp');
    expect(useWeekStore.getState().setupDraft.budgetTargetVnd).toBe(500000);
    expect(useWeekStore.getState().currentPlan).toBe(plan);
    expect(host.querySelector('[role="status"]')!.textContent).toContain('trong phiên');
    expect(host.querySelector('[data-path]')!.textContent).toBe('/week/week-one/settings');
    expect(host.querySelector('a[href="/week/week-one"]')).toBeTruthy();
    expect(Object.values(api).flatMap((mock) => mock.mock.calls)).toHaveLength(0);
  });
  it('review to create a new plan is a setup link and sends no generation command', async () => {
    await mount(<WeekDashboardPage />, '/week');
    await flush();
    expect(
      [...host.querySelectorAll('a')]
        .find((link) => link.textContent === 'Xem lại để tạo mới')
        ?.getAttribute('href'),
    ).toBe('/week/setup');
    expect(api.createWeekPlan).not.toHaveBeenCalled();
    expect(host.textContent).not.toContain('Tạo lại thực đơn theo hướng');
  });
});

describe('UI10 export receipt and dialog lifecycle', () => {
  async function open() {
    await act(async () =>
      root.render(
        <WeekExportModal isOpen onClose={vi.fn()} plan={plan} shoppingItems={plan.shoppingItems} />,
      ),
    );
  }
  it('does not report copied until clipboard completion', async () => {
    const request = deferred<void>();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn(() => request.promise) },
    });
    await open();
    await click('Sao chép thực đơn');
    expect(host.textContent).not.toContain('Đã sao chép');
    await act(async () => request.resolve());
    expect(host.querySelector('[role="status"]')!.textContent).toContain('Đã sao chép thực đơn');
  });
  it.each(['rejected', 'unsupported'])(
    'focuses safe feedback for clipboard %s',
    async (failure) => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value:
          failure === 'unsupported'
            ? undefined
            : { writeText: vi.fn().mockRejectedValue(new Error('PRIVATE_CLIPBOARD')) },
      });
      await open();
      await click('Sao chép thực đơn');
      expect(document.activeElement).toBe(host.querySelector('[role="alert"]'));
      expect(host.textContent).not.toContain('PRIVATE_CLIPBOARD');
      expect(host.textContent).not.toContain('Đã sao chép');
    },
  );
  it('discards an old clipboard receipt after closing and reopening', async () => {
    const request = deferred<void>();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn(() => request.promise) },
    });
    await open();
    await click('Sao chép thực đơn');
    await act(async () =>
      root.render(<WeekExportModal isOpen={false} onClose={vi.fn()} plan={plan} />),
    );
    await open();
    await act(async () => request.resolve());
    expect(host.textContent).not.toContain('Đã sao chép');
  });
  it('native share cancellation reports cancellation without success', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError')),
    });
    await open();
    await click('Chia sẻ trên thiết bị');
    expect(host.querySelector('[role="status"]')!.textContent).toContain('đóng bảng chia sẻ');
    expect(host.textContent).not.toContain('Đã hoàn tất');
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  });
});

describe('UI10 shopping receipt presentation', () => {
  it.each([true, false])(
    'captures selected items and renders pendingSync=%s truthfully',
    async (pendingSync) => {
      useWeekStore.setState({ currentPlan: plan });
      api.completeWeekShopping.mockResolvedValue({
        success: true,
        importedItemsCount: 1,
        pendingSync,
      });
      await mount(<WeekShoppingPage />, '/week/week-one/shopping');
      await flush();
      await click('Bắt đầu đi chợ');
      await click('Nhập 1 nguyên liệu');
      expect(api.completeWeekShopping).toHaveBeenCalledWith('week-one', plan.shoppingItems);
      expect(host.querySelector('h1')!.textContent).toContain(
        pendingSync ? 'chờ đồng bộ' : 'Đã nhập',
      );
      expect(host.querySelector('.week-completion-list')!.textContent).toContain('Cà rốt');
      if (pendingSync) expect(host.textContent).not.toContain('Đã nhận xác nhận nhập');
      expect(document.activeElement).toBe(host.querySelector('.week-completion'));
    },
  );
  it('keeps selection and focuses completion failure, with no false success', async () => {
    useWeekStore.setState({ currentPlan: plan });
    api.completeWeekShopping.mockRejectedValue(new Error('PRIVATE_IMPORT'));
    await mount(<WeekShoppingPage />, '/week/week-one/shopping');
    await flush();
    await click('Bắt đầu đi chợ');
    await click('Nhập 1 nguyên liệu');
    expect(document.activeElement).toBe(host.querySelector('[role="alert"]'));
    expect(host.querySelector('h1')!.textContent).not.toContain('Đã nhập');
    expect(host.querySelector('.week-shopping-item')!.getAttribute('aria-pressed')).toBe('true');
  });
});

it('adopts exact Week route families and excludes unrelated nested paths', () => {
  for (const path of [
    '/week',
    '/week/',
    '/week/setup',
    '/week/generating',
    '/week/plan-a',
    '/week/plan-a/shopping',
    '/week/plan-a/settings',
    '/week/plan-a/meal/meal-a',
  ])
    expect(isKitchenSurface(path), path).toBe(true);
  for (const path of [
    '/week-old',
    '/week/plan-a/other',
    '/week/plan-a/meal/a/extra',
    '/billing',
    '/checkout',
  ])
    expect(isKitchenSurface(path), path).toBe(false);
});

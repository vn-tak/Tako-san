// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FoodPreferencesPage } from '../../src/web/pages/settings/FoodPreferencesPage';
import { PlanningSettingsPage } from '../../src/web/pages/settings/PlanningSettingsPage';
import { NotificationPreferencesPage } from '../../src/web/pages/settings/NotificationPreferencesPage';
import { SettingsPage } from '../../src/web/pages/SettingsPage';
import { NotificationsPage } from '../../src/web/pages/NotificationsPage';
import { useAuthStore } from '../../src/web/stores/useAuthStore';

const mocks = vi.hoisted(() => ({ food: vi.fn(), saveFood: vi.fn(), planning: vi.fn(), savePlanning: vi.fn(), notifications: vi.fn() }));
vi.mock('../../src/web/services/auth', () => ({ authApi: { getFoodPreferences: mocks.food, updateFoodPreferences: mocks.saveFood } }));
vi.mock('../../src/web/services/week', () => ({ weekApi: { getWeekPreferences: mocks.planning, updateWeekPreferences: mocks.savePlanning } }));
vi.mock('../../src/web/services/api', async () => ({ ApiError: (await import('../../src/web/services/http')).ApiError, api: { getNotifications: mocks.notifications } }));
let root: Root, host: HTMLDivElement, client: QueryClient;
const food = { householdSize: 7, spicyLevel: 'hot', favoriteCuisines: ['italian'], dietaryRestrictions: ['vegetarian'] };
const planning = { mealSlotsPreset: 'all', budgetTargetVnd: 1000000, shoppingFrequency: 'twice', priorities: ['variety'], autoWeeklyPlanEnabled: true };
async function mount(node: ReactNode) {
  await act(async () => root.render(<QueryClientProvider client={client}><MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{node}</MemoryRouter></QueryClientProvider>));
}
async function until(check: () => void) {
  const end = Date.now() + 1500;
  for (;;) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 5)); });
    try { check(); return; } catch (error) { if (Date.now() >= end) throw error; }
  }
}
function button(name: string) {
  const element = [...host.querySelectorAll('button')].find((el) => el.textContent?.trim() === name);
  expect(element, name).toBeDefined();
  return element!;
}
const click = async (name: string) => { await act(async () => button(name).click()); };
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  localStorage.clear();
  localStorage.setItem('frigo_user_id', 'ui08-user');
  localStorage.setItem('frigo_household_id', 'ui08-house');
  useAuthStore.setState({ userId: 'ui08-user', householdId: 'ui08-house', isGuest: false, isOnboarded: true, ...food });
  mocks.food.mockResolvedValue(food); mocks.planning.mockResolvedValue(planning);
  mocks.saveFood.mockResolvedValue({ success: true }); mocks.savePlanning.mockResolvedValue({ success: true });
  mocks.notifications.mockResolvedValue([]);
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); client.clear(); host.remove(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('UI08 account forms retain real preference contracts', () => {
  it('shows 5+ selected for an authoritative size above five and preserves unknown vocabulary', async () => {
    await mount(<FoodPreferencesPage />);
    await until(() => expect(button('5+').getAttribute('aria-pressed')).toBe('true'));
    await click('Lưu sở thích');
    expect(mocks.saveFood).toHaveBeenCalledWith(food);
    expect(useAuthStore.getState().isOnboarded).toBe(true);
    expect(host.textContent).toContain('Đã lưu sở thích.');
    await click('Ít cay');
    expect(host.textContent).not.toContain('Đã lưu sở thích.');
  });
  it('locks the food draft while its exact request is saving', async () => {
    let done!: () => void;
    mocks.saveFood.mockReturnValue(new Promise<void>((resolve) => { done = resolve; }));
    await mount(<FoodPreferencesPage />);
    await until(() => expect(host.querySelector('.account-editor')).toBeTruthy());
    await click('Lưu sở thích');
    expect(host.querySelector<HTMLFieldSetElement>('.account-editor')?.disabled).toBe(true);
    await click('Ít cay');
    expect(button('Rất cay').getAttribute('aria-pressed')).toBe('true');
    await act(async () => done());
    expect(host.querySelector<HTMLFieldSetElement>('.account-editor')?.disabled).toBe(false);
  });
  it('reports failed food saves without claiming success', async () => {
    mocks.saveFood.mockRejectedValue(new Error('synthetic failure'));
    await mount(<FoodPreferencesPage />);
    await until(() => expect(host.querySelector('.account-editor')).toBeTruthy());
    await click('Lưu sở thích');
    expect(host.querySelector('[role=alert]')?.textContent).toContain('Chưa thể lưu');
    expect(document.activeElement).toBe(host.querySelector('[role=alert]'));
    expect(host.textContent).not.toContain('Đã lưu sở thích.');
  });
  it('saves planning defaults without generating a plan and clears obsolete success after editing', async () => {
    await mount(<PlanningSettingsPage />);
    await until(() => expect(host.querySelector('.account-editor')).toBeTruthy());
    await click('Lưu cài đặt');
    expect(mocks.savePlanning).toHaveBeenCalledWith(planning);
    expect(host.textContent).toContain('Đã lưu cài đặt lập thực đơn.');
    await click('500k VND');
    expect(host.textContent).not.toContain('Đã lưu cài đặt lập thực đơn.');
  });
  it('distinguishes queued planning writes from a server save', async () => {
    mocks.savePlanning.mockResolvedValue({ pendingSync: true });
    await mount(<PlanningSettingsPage />);
    await until(() => expect(host.querySelector('.account-editor')).toBeTruthy());
    await click('Lưu cài đặt');
    expect(host.textContent).toContain('sẽ được đồng bộ');
    expect(host.textContent).not.toContain('Đã lưu cài đặt lập thực đơn.');
  });
  it('shows a real unavailable state for offline planning preferences', async () => {
    mocks.planning.mockResolvedValue(null);
    await mount(<PlanningSettingsPage />);
    await until(() => expect(host.textContent).toContain('Không tải được cài đặt khi ngoại tuyến'));
    expect(host.querySelector('.account-editor')).toBeNull();
  });
});

describe('UI08 local capability and failures', () => {
  it('accepts only stored booleans, keeps the existing owner key, and discloses delivery limits', async () => {
    localStorage.setItem('frigo_notify_prefs_ui08-user', JSON.stringify({ remindWeekPlan: 'false', remindShopping: false }));
    await mount(<NotificationPreferencesPage />);
    const switches = host.querySelectorAll<HTMLButtonElement>('[role=switch]');
    expect(switches[0].getAttribute('aria-checked')).toBe('true');
    expect(switches[2].getAttribute('aria-checked')).toBe('false');
    await act(async () => switches[0].click());
    expect(JSON.parse(localStorage.getItem('frigo_notify_prefs_ui08-user')!).remindWeekPlan).toBe(false);
    expect(localStorage.getItem('frigo_notify_prefs_other-user')).toBeNull();
    expect(host.textContent).toContain('chưa lọc hộp');
    expect(host.textContent).toContain('Email xác thực tài khoản là luồng riêng');
  });
  it('does not claim persistence when notification storage fails', async () => {
    await mount(<NotificationPreferencesPage />);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    await act(async () => host.querySelector<HTMLButtonElement>('[role=switch]')!.click());
    expect(host.textContent).toContain('Chưa lưu được trên thiết bị');
    expect(host.textContent).not.toContain('Đã ghi nhớ lựa chọn');
  });
  it('shows notification read failures and retries the same reader', async () => {
    mocks.notifications.mockRejectedValueOnce(new Error('synthetic read failure'));
    await mount(<NotificationsPage />);
    await until(() => expect(host.querySelector('[role=alert]')).toBeTruthy());
    await click('Thử lại');
    await until(() => expect(host.textContent).toContain('Không có thông báo để hiển thị'));
    expect(mocks.notifications).toHaveBeenCalledTimes(2);
  });
  it('reports cache deletion failures and never clears queued local data', async () => {
    localStorage.setItem('ui08-pending-proof', 'retained');
    vi.stubGlobal('caches', { keys: vi.fn().mockResolvedValue(['application-cache']), delete: vi.fn().mockRejectedValue(new Error('denied')) });
    await mount(<SettingsPage />);
    await click('Xóa bộ nhớ đệm ứng dụng');
    expect(host.querySelector('[role=alert]')?.textContent).toContain('Chưa xóa được');
    expect(host.textContent).not.toContain('Đã xóa bộ nhớ đệm');
    expect(localStorage.getItem('ui08-pending-proof')).toBe('retained');
  });
  it('clears cache resources and reports successful completion', async () => {
    const deletion = vi.fn().mockResolvedValue(true);
    vi.stubGlobal('caches', { keys: vi.fn().mockResolvedValue(['one', 'two']), delete: deletion });
    await mount(<SettingsPage />);
    await click('Xóa bộ nhớ đệm ứng dụng');
    expect(deletion.mock.calls).toEqual([['one'], ['two']]);
    expect(host.querySelector('[role=status]')?.textContent).toContain('Đã xóa bộ nhớ đệm');
  });
});

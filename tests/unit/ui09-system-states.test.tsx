// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionBoundary } from '../../src/web/components/common/SessionBoundary';
import { useAuthStore } from '../../src/web/stores/useAuthStore';
import { queryClient } from '../../src/web/lib/query-client';
const mocks = vi.hoisted(() => ({ me: vi.fn(), logout: vi.fn() }));
vi.mock('../../src/web/services/api', () => ({ api: { getMe: mocks.me } }));
let host: HTMLDivElement, root: Root;
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
        <SessionBoundary>
          <p>PRIVATE_CHILD</p>
        </SessionBoundary>
      </MemoryRouter>,
    ),
  );
}
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  localStorage.clear();
  sessionStorage.clear();
  queryClient.clear();
  localStorage.setItem('frigo_user_id', 'ui09-user');
  localStorage.setItem('frigo_household_id', 'ui09-house');
  useAuthStore.setState({
    userId: 'ui09-user',
    householdId: 'ui09-house',
    isGuest: false,
    isOnboarded: true,
    logoutStatus: 'idle',
    logoutError: null,
    logout: mocks.logout,
  });
  mocks.me.mockReset();
  mocks.logout.mockReset().mockResolvedValue(false);
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
});
describe('UI09 system presentation preserves session gates', () => {
  it('withholds children while verifying and renders one branded busy heading', async () => {
    mocks.me.mockReturnValue(new Promise(() => {}));
    await render();
    expect(host.textContent).not.toContain('PRIVATE_CHILD');
    expect(host.querySelectorAll('h1')).toHaveLength(1);
    expect(host.querySelector('main')?.getAttribute('aria-busy')).toBe('true');
    expect(host.querySelector('img')?.getAttribute('src')).toBe('/takosan/rebuild/lockup.svg');
    expect(host.querySelector('[role=status]')?.textContent).toContain('Đang kiểm tra phiên');
  });
  it('retries verification explicitly and reveals children only after the real gate resolves', async () => {
    mocks.me
      .mockRejectedValueOnce(new Error('synthetic verification failure'))
      .mockResolvedValueOnce({
        user: { id: 'ui09-user', onboardingCompleted: true, isPlus: false },
      });
    await render();
    await until(() => expect(host.querySelector('[role=alert]')).toBeTruthy());
    expect(host.textContent).not.toContain('PRIVATE_CHILD');
    expect(host.querySelector('main')?.getAttribute('aria-busy')).toBe('false');
    await act(async () => host.querySelector('button')!.click());
    await until(() => expect(host.textContent).toContain('PRIVATE_CHILD'));
    expect(mocks.me).toHaveBeenCalledTimes(2);
    expect(host.querySelector('.system-status-page')).toBeNull();
  });
  it.each(['pending', 'error'] as const)(
    'withholds children during %s logout without re-verifying or auto-retrying',
    async (logoutStatus) => {
      useAuthStore.setState({ logoutStatus, logoutError: 'Chưa thu hồi được phiên.' });
      await render();
      expect(host.textContent).not.toContain('PRIVATE_CHILD');
      expect(host.querySelectorAll('h1')).toHaveLength(1);
      expect(mocks.me).not.toHaveBeenCalled();
      expect(host.querySelector('main')?.getAttribute('aria-busy')).toBe(
        String(logoutStatus === 'pending'),
      );
      if (logoutStatus === 'error') {
        await act(async () => host.querySelector('button')!.click());
        expect(mocks.logout).toHaveBeenCalledOnce();
      } else {
        expect(host.querySelector('button')).toBeNull();
        expect(mocks.logout).not.toHaveBeenCalled();
      }
    },
  );
});

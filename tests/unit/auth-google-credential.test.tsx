// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthPage } from '../../src/web/pages/AuthPage';

describe('Google authentication entry point', () => {
  let root: Root;
  let host: HTMLDivElement;
  const initialize = vi.fn();
  const renderButton = vi.fn();
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    host = document.createElement('div');
    document.body.appendChild(host);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          turnstileSiteKey: null,
          googleClientId: 'runtime-client.apps.googleusercontent.com',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    Object.defineProperty(window, 'google', {
      configurable: true,
      value: { accounts: { id: { initialize, renderButton } } },
    });
  });

  afterEach(() => {
    act(() => root?.unmount());
    host.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    initialize.mockReset();
    renderButton.mockReset();
  });

  const mount = async () => {
    await act(async () => {
      root = createRoot(host);
      root.render(
        <MemoryRouter initialEntries={['/auth']}>
          <AuthPage />
        </MemoryRouter>,
      );
      await Promise.resolve();
    });
  };

  it('renders only the real GIS entry point and never offers a credential-less fallback', async () => {
    await mount();
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'runtime-client.apps.googleusercontent.com',
        callback: expect.any(Function),
        auto_select: false,
      }),
    );
    expect(renderButton).toHaveBeenCalledTimes(1);
    expect(renderButton).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ width: 320, text: 'signin_with', locale: 'vi' }),
    );
    expect(host.textContent).not.toContain('Đăng nhập nhanh với Google');
    expect(
      fetchMock.mock.calls.some(([, init]) => String(init?.body || '').includes('"userInfo"')),
    ).toBe(false);
  });

  it('updates provider width without reinitializing auth and ignores unchanged or stale observations', async () => {
    let resizeCallback: ResizeObserverCallback;
    const disconnect = vi.fn();
    const observe = vi.fn();
    const observer = { observe, disconnect, unobserve: vi.fn() };
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback;
          return observer;
        }
      },
    );
    await mount();
    const googleHost = renderButton.mock.calls[0][0] as HTMLElement;
    expect(observe).toHaveBeenCalledWith(googleHost);
    const bounds = vi.spyOn(googleHost, 'getBoundingClientRect');
    bounds.mockReturnValue({ width: 280 } as DOMRect);
    act(() => resizeCallback([], observer));
    expect(renderButton).toHaveBeenLastCalledWith(
      googleHost,
      expect.objectContaining({ width: 280, text: 'signin_with' }),
    );
    act(() => resizeCallback([], observer));
    expect(renderButton).toHaveBeenCalledTimes(2);
    bounds.mockReturnValue({ width: 478 } as DOMRect);
    act(() => resizeCallback([], observer));
    expect(renderButton).toHaveBeenLastCalledWith(
      googleHost,
      expect.objectContaining({ width: 400 }),
    );
    expect(initialize).toHaveBeenCalledTimes(1);
    act(() => root.unmount());
    expect(disconnect).toHaveBeenCalledTimes(1);
    act(() => resizeCallback([], observer));
    window.dispatchEvent(new Event('resize'));
    expect(renderButton).toHaveBeenCalledTimes(3);
  });

  it('updates width on window resize when ResizeObserver is unavailable', async () => {
    vi.stubGlobal('ResizeObserver', undefined);
    await mount();
    const googleHost = renderButton.mock.calls[0][0] as HTMLElement;
    vi.spyOn(googleHost, 'getBoundingClientRect').mockReturnValue({ width: 280 } as DOMRect);
    act(() => window.dispatchEvent(new Event('resize')));
    expect(renderButton).toHaveBeenLastCalledWith(
      googleHost,
      expect.objectContaining({ width: 280, text: 'signin_with' }),
    );
    expect(initialize).toHaveBeenCalledTimes(1);
    act(() => root.unmount());
    window.dispatchEvent(new Event('resize'));
    expect(renderButton).toHaveBeenCalledTimes(2);
  });

  it('recovers from a blocked GIS script when the user retries', async () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'google', { configurable: true, value: undefined });
    await mount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    const retry = [...host.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Tải lại Google Sign-In'),
    );
    expect(retry).toBeDefined();
    Object.defineProperty(window, 'google', {
      configurable: true,
      value: { accounts: { id: { initialize, renderButton } } },
    });
    await act(async () => {
      retry?.click();
      await Promise.resolve();
    });
    const script = document.getElementById('google-identity-services') as HTMLScriptElement | null;
    expect(script?.src).toBe('https://accounts.google.com/gsi/client');
    expect(script?.referrerPolicy).toBe('strict-origin-when-cross-origin');
    expect(renderButton).toHaveBeenCalledTimes(1);
    expect(renderButton).toHaveBeenLastCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ text: 'signin_with' }),
    );
    expect(host.textContent).not.toContain('Không tải được Google Sign-In');
  });
});

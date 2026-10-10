// @vitest-environment jsdom
import React, { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Loaded = { LegacyNavIndicator: React.FC<{ indicatorId: string }> };
let host: HTMLDivElement, root: Root;
let resolveModule: (module: Loaded) => void;
let rejectModule: (reason: Error) => void;
let request: ReturnType<typeof vi.fn>;
const Animated: Loaded['LegacyNavIndicator'] = ({ indicatorId }) => (
  <span aria-hidden="true" data-loaded-indicator={indicatorId} />
);

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const module = new Promise<Loaded>((resolve, reject) => {
    resolveModule = resolve;
    rejectModule = reject;
  });
  request = vi.fn(() => module);
  vi.doMock('../../src/web/design-system/legacy-nav-indicator', request);
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.doUnmock('../../src/web/design-system/legacy-nav-indicator');
  vi.unstubAllGlobals();
});
async function load() {
  return (await import('../../src/web/design-system/deferred-nav-indicator')).DeferredNavIndicator;
}
const fallback = () => host.querySelector('span.bg-semantic-success-soft');

describe('UI14 optional navigation motion', () => {
  it('shows a decorative active highlight immediately while the engine is pending', async () => {
    const Indicator = await load();
    const navigate = vi.fn();
    await act(async () =>
      root.render(
        <a
          href="/recipes"
          aria-current="page"
          onClick={(event) => {
            event.preventDefault();
            navigate();
          }}
        >
          <Indicator indicatorId="bottom" />
          Công thức
        </a>,
      ),
    );
    expect(fallback()?.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('a')?.getAttribute('aria-current')).toBe('page');
    await act(async () => host.querySelector('a')!.click());
    expect(navigate).toHaveBeenCalledOnce();
    expect(host.querySelector('[data-loaded-indicator]')).toBeNull();
  });
  it('shares one pending request across the mounted bottom bar and rail and retains their identities', async () => {
    const Indicator = await load();
    await act(async () =>
      root.render(
        <>
          <Indicator indicatorId="bottom" />
          <Indicator indicatorId="rail" />
        </>,
      ),
    );
    expect(host.querySelectorAll('span.bg-semantic-success-soft')).toHaveLength(2);
    expect(request).toHaveBeenCalledOnce();
    await act(async () => resolveModule({ LegacyNavIndicator: Animated }));
    expect(
      [...host.querySelectorAll('[data-loaded-indicator]')].map((el) =>
        el.getAttribute('data-loaded-indicator'),
      ),
    ).toEqual(['bottom', 'rail']);
    expect(fallback()).toBeNull();
  });
  it('keeps active state and navigation available after an import failure and on remount', async () => {
    const Indicator = await load();
    await act(async () =>
      root.render(
        <a href="/recipes">
          <Indicator indicatorId="bottom" />
          Công thức
        </a>,
      ),
    );
    await act(async () => rejectModule(new Error('Optional chunk unavailable')));
    expect(fallback()).not.toBeNull();
    expect(host.querySelector('a')?.getAttribute('href')).toBe('/recipes');
    await act(async () => root.render(<Indicator key="remount" indicatorId="rail" />));
    expect(fallback()).not.toBeNull();
    expect(request).toHaveBeenCalledOnce();
  });
  it('does not render a late receipt into an abandoned mount; a later mount can reuse the loaded module', async () => {
    const Indicator = await load();
    const renderAnimated = vi.fn(Animated);
    await act(async () => root.render(<Indicator indicatorId="abandoned" />));
    await act(async () => root.render(null));
    await act(async () => resolveModule({ LegacyNavIndicator: renderAnimated }));
    expect(host.textContent).toBe('');
    expect(renderAnimated).not.toHaveBeenCalled();
    await act(async () => root.render(<Indicator indicatorId="current" />));
    expect(
      host.querySelector('[data-loaded-indicator]')?.getAttribute('data-loaded-indicator'),
    ).toBe('current');
    expect(request).toHaveBeenCalledOnce();
  });
  it('survives StrictMode effect cleanup and uses the current identity when the receipt arrives', async () => {
    const Indicator = await load();
    await act(async () =>
      root.render(
        <StrictMode>
          <Indicator indicatorId="first" />
        </StrictMode>,
      ),
    );
    await act(async () =>
      root.render(
        <StrictMode>
          <Indicator indicatorId="latest" />
        </StrictMode>,
      ),
    );
    await act(async () => resolveModule({ LegacyNavIndicator: Animated }));
    expect(
      host.querySelector('[data-loaded-indicator]')?.getAttribute('data-loaded-indicator'),
    ).toBe('latest');
    expect(request).toHaveBeenCalledOnce();
  });
});

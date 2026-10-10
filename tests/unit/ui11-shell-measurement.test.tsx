// @vitest-environment jsdom
import { act, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useKitchenShell } from '../../src/web/components/layout/use-kitchen-shell';
let host: HTMLDivElement, root: Root, resize: () => void;
const observer = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
function Harness({ enabled = true, route = '/' }: { enabled?: boolean; route?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useKitchenShell(ref, enabled, route);
  return (
    <div ref={ref} id="shell">
      <nav className="kitchen-bottom-nav" data-height="84" />
      <header className="kitchen-header" data-height="124" style={{ position: 'sticky' }} />
      <main id="kitchen-main">
        <input aria-label="Measurement field" />
      </main>
    </div>
  );
}
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
}
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe = observer.observe;
      unobserve = observer.unobserve;
      disconnect = observer.disconnect;
    },
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const height = Number(this.dataset.height ?? 0);
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 320,
      bottom: height,
      width: height ? 320 : 0,
      height,
      toJSON: () => ({}),
    };
  });
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  Object.values(observer).forEach((fn) => fn.mockClear());
  document.documentElement.style.scrollPaddingTop = '7px';
  document.documentElement.style.scrollPaddingBottom = '9px';
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('style');
});
describe('UI11 measured offset lifecycle', () => {
  it('tracks resized nav including safe-area space and late fixed actions', async () => {
    await act(async () => root.render(<Harness />));
    await settle();
    const shell = host.querySelector<HTMLElement>('#shell')!;
    expect(shell.style.getPropertyValue('--kitchen-nav-height')).toBe('84px');
    const nav = shell.querySelector<HTMLElement>('nav')!;
    nav.dataset.height = '116';
    resize();
    await settle();
    expect(shell.style.getPropertyValue('--kitchen-nav-height')).toBe('116px');
    const action = document.createElement('div');
    action.dataset.kitchenAction = 'fixed';
    action.dataset.height = '72';
    action.style.position = 'fixed';
    action.style.bottom = '128px';
    action.style.setProperty('--kitchen-action-gap', '12px');
    shell.appendChild(action);
    await settle();
    expect(observer.observe).toHaveBeenCalledWith(action, { box: 'border-box' });
    expect(shell.style.getPropertyValue('--kitchen-action-reserve')).toBe('84px');
    action.remove();
    await settle();
    expect(observer.unobserve).toHaveBeenCalledWith(action);
    expect(shell.style.getPropertyValue('--kitchen-action-reserve')).toBe('0px');
  });
  it('reserves only fixed actions, while sticky actions still clear focus', async () => {
    await act(async () => root.render(<Harness />));
    await settle();
    const shell = host.querySelector<HTMLElement>('#shell')!;
    const action = document.createElement('div');
    action.className = 'review-actions';
    action.dataset.height = '80';
    action.style.position = 'sticky';
    action.style.bottom = '84px';
    shell.appendChild(action);
    await settle();
    expect(shell.style.getPropertyValue('--kitchen-action-reserve')).toBe('0px');
    expect(document.documentElement.style.scrollPaddingBottom).toBe('176px');
  });
  it('restores scrolling styles and disconnects on leaving kitchen scope', async () => {
    await act(async () => root.render(<Harness />));
    await settle();
    expect(document.documentElement.style.scrollPaddingTop).toBe('136px');
    await act(async () => root.render(<Harness enabled={false} route="/plus" />));
    expect(document.documentElement.style.scrollPaddingTop).toBe('7px');
    expect(document.documentElement.style.scrollPaddingBottom).toBe('9px');
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });
});

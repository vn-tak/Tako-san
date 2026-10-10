import { useEffect, type RefObject } from 'react';

/** Chrome can resize with text, safe areas and lazy routes; offsets follow its boxes. */
export function useKitchenShell(ref: RefObject<HTMLDivElement>, enabled: boolean, route: string) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    const scrollRoot = document.documentElement;
    const previousTop = scrollRoot.style.scrollPaddingTop;
    const previousBottom = scrollRoot.style.scrollPaddingBottom;
    const observed = new Set<Element>();
    let frame = 0;
    let focusFrame = 0;
    const height = (element: Element | null) => element?.getBoundingClientRect().height ?? 0;
    const measure = () => {
      const nav = height(root.querySelector('.kitchen-bottom-nav'));
      const header = root.querySelector('.kitchen-header');
      const headerHeight =
        header && getComputedStyle(header).position === 'sticky' ? height(header) : 0;
      const banner = height(root.querySelector('.kitchen-banner-slot > div'));
      let reserve = 0;
      let obstruction = 0;
      root.querySelectorAll('[data-kitchen-action], .review-actions').forEach((element) => {
        const style = getComputedStyle(element);
        if (style.display === 'none' || height(element) === 0) return;
        if (style.position === 'fixed' || style.position === 'sticky') {
          const space =
            height(element) + (parseFloat(style.getPropertyValue('--kitchen-action-gap')) || 0);
          obstruction = Math.max(obstruction, space);
          if (style.position === 'fixed') reserve = Math.max(reserve, space);
        }
      });
      root.style.setProperty('--kitchen-nav-height', `${nav}px`);
      root.style.setProperty('--kitchen-header-height', `${headerHeight}px`);
      root.style.setProperty('--kitchen-banner-height', `${banner}px`);
      root.style.setProperty('--kitchen-action-reserve', `${reserve}px`);
      scrollRoot.style.scrollPaddingTop = `${headerHeight + banner + 12}px`;
      scrollRoot.style.scrollPaddingBottom = `${nav + obstruction + 12}px`;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    const bind = () => {
      const targets = new Set(
        root.querySelectorAll(
          '.kitchen-bottom-nav, .kitchen-header, .kitchen-banner-slot > div, [data-kitchen-action], .review-actions',
        ),
      );
      observed.forEach((element) => {
        if (!targets.has(element)) {
          resize?.unobserve(element);
          observed.delete(element);
        }
      });
      targets.forEach((element) => {
        if (!observed.has(element)) {
          resize?.observe(element, { box: 'border-box' });
          observed.add(element);
        }
      });
      schedule();
    };
    const mutations = new MutationObserver(bind);
    mutations.observe(root, { childList: true, subtree: true });
    const focus = (event: FocusEvent) => {
      const target = event.target;
      if (
        !(target instanceof HTMLElement) ||
        !target.closest('#kitchen-main') ||
        target.closest(
          '[role="dialog"], [role="alertdialog"], .kitchen-header, [data-kitchen-action], .review-actions',
        )
      )
        return;
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => {
        if (!target.isConnected || document.activeElement !== target) return;
        const box = target.getBoundingClientRect();
        const top = parseFloat(scrollRoot.style.scrollPaddingTop) || 0;
        const bottom = innerHeight - (parseFloat(scrollRoot.style.scrollPaddingBottom) || 0);
        if (box.top < top) window.scrollBy({ top: box.top - top, behavior: 'instant' });
        else if (box.bottom > bottom)
          window.scrollBy({
            top: Math.min(box.bottom - bottom, box.top - top),
            behavior: 'instant',
          });
      });
    };
    root.addEventListener('focusin', focus);
    window.addEventListener('resize', schedule);
    bind();
    return () => {
      resize?.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(focusFrame);
      root.removeEventListener('focusin', focus);
      window.removeEventListener('resize', schedule);
      scrollRoot.style.scrollPaddingTop = previousTop;
      scrollRoot.style.scrollPaddingBottom = previousBottom;
    };
  }, [ref, enabled, route]);
}

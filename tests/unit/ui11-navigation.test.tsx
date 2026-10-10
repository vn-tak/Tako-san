import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
vi.mock('../../src/web/stores/useAuthStore', () => ({ useAuthStore: () => ({ avatarUrl: null }) }));
import {
  BottomNavigationBar,
  NAV_ITEMS,
  isKitchenNavActive,
} from '../../src/web/design-system/navigation';
import { AppLayout } from '../../src/web/components/layout/AppLayout';
import { KitchenHeader } from '../../src/web/components/common/KitchenHeader';
const render = (node: React.ReactElement, route = '/') =>
  renderToStaticMarkup(<StaticRouter location={route}>{node}</StaticRouter>);
afterEach(() => vi.unstubAllEnvs());
describe('UI11 destination and compatibility contracts', () => {
  it('exposes all five labelled root links and current page without a sixth action cell', () => {
    const html = render(<BottomNavigationBar kitchen />, '/recipes/soup');
    expect(html.match(/<a /g)).toHaveLength(5);
    for (const item of NAV_ITEMS) expect(html).toContain(item.label);
    expect(html).toMatch(/<a(?=[^>]*href="\/recipes")(?=[^>]*aria-current="page")[^>]*>/);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).not.toContain('href="/scan"');
  });
  it('provides an explicit Scan link from the header', () => {
    const html = render(<KitchenHeader backTo="/fridge" />, '/scan/item/review');
    expect(html).toContain('Quét nguyên liệu');
    expect(html).toMatch(/<a(?=[^>]*href="\/scan")(?=[^>]*aria-current="page")[^>]*>/);
    expect(html).toContain('aria-label="Quay lại"');
  });
  it('keeps the legacy default six-link Scan contract', () => {
    const html = render(<BottomNavigationBar />, '/fridge');
    expect(html.match(/<a /g)).toHaveLength(6);
    expect(html).toContain('aria-label="Quét AI"');
  });
  it.each([
    ['/inventory-reconciliation', 'fridge'],
    ['/ingredients/lot', 'fridge'],
    ['/inventory/lot', 'fridge'],
    ['/cook/soup', 'recipe'],
    ['/cooking/run', 'recipe'],
    ['/week/plan/shopping', 'mealPlan'],
    ['/planner/new', 'mealPlan'],
    ['/settings/planning', 'profile'],
    ['/notifications', 'profile'],
  ])('%s selects exactly its route family', (route, icon) => {
    const active = NAV_ITEMS.filter((item) => isKitchenNavActive(item, route));
    expect(active).toHaveLength(1);
    expect(active[0].icon).toBe(icon);
  });
  it.each([
    '/mealtime',
    '/recipes-old',
    '/week-old',
    '/inventory-old',
    '/scan/item/review',
    '/shopping',
  ])('%s does not accidentally select a root', (route) => {
    expect(NAV_ITEMS.some((item) => isKitchenNavActive(item, route))).toBe(false);
  });
  it.each(['/scan', '/cook/soup', '/cooking/run', '/onboarding/goals', '/auth/login'])(
    '%s keeps immersive workflows free of shell navigation',
    (route) => {
      const html = render(<AppLayout />, route);
      expect(html).not.toContain('<nav');
      expect(html).not.toContain('data-kitchen-navigation="persistent"');
    },
  );
  it('retains persistent navigation and main focus target on scan review', () => {
    const html = render(<AppLayout />, '/scan/item/review');
    expect(html).toContain('data-kitchen-navigation="persistent"');
    expect(html).toContain('id="kitchen-main"');
  });
  it.each(['/plus', '/checkout', '/settings/billing'])(
    '%s retains legacy shell and identity',
    (route) => {
      const html = render(<AppLayout />, route);
      expect(html).not.toContain('kitchen-shell-content');
      expect(html).not.toContain('kitchen-bottom-nav');
      expect(html).toContain('pb-[calc(68px+env(safe-area-inset-bottom,0px))]');
    },
  );
  it.each([
    ['true', '/planner'],
    ['false', '/week'],
  ])('preserves the %s build flag destination', async (flag, destination) => {
    vi.stubEnv('VITE_MEAL_PLANNER_ENABLED', flag);
    vi.resetModules();
    const module = await import('../../src/web/design-system/navigation');
    expect(module.NAV_ITEMS.find((item) => item.icon === 'mealPlan')?.path).toBe(destination);
  });
});

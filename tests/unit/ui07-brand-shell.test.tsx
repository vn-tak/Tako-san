import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
vi.mock('../../src/web/stores/useAuthStore', () => ({ useAuthStore: () => ({ avatarUrl: null }) }));
import { KitchenHeader } from '../../src/web/components/common/KitchenHeader';
import { AppLayout } from '../../src/web/components/layout/AppLayout';
import { TAKOSAN_KITCHEN } from '../../src/web/lib/takosan-kitchen';

const render = (node: React.ReactElement, route = '/') => renderToStaticMarkup(<StaticRouter location={route}>{node}</StaticRouter>);
describe('UI07 shell ownership and accessible brand', () => {
  it('keeps a named home link, decorative logo, explicit aspect and back/actions', () => {
    const html = render(<KitchenHeader backTo="/recipes" />);
    expect(html).toContain('aria-label="Takosan — Trang chủ"');
    expect(html).toContain(`src="${TAKOSAN_KITCHEN.logo}" alt="" width="300" height="72"`);
    expect(html).toContain('translate="no"');
    expect(html).toContain('aria-label="Quay lại"');
    expect(html).toContain('href="/recipes"');
    expect(html).toContain('aria-label="Thông báo"');
    expect(html).toContain('aria-label="Tài khoản cá nhân"');
    expect(html).toContain(`aria-hidden="true">${TAKOSAN_KITCHEN.motto}`);
  });
  it.each(['/', '/recipes', '/fridge', '/scan/review/example', '/planner', '/shopping'])('persistent %s owns the desktop brand', (route) => {
    expect(render(<AppLayout />, route)).toContain('data-kitchen-navigation="persistent"');
  });
  it.each(['/scan', '/cook/recipe', '/cooking/complete'])('immersive %s preserves the header identity', (route) => {
    const html = render(<AppLayout />, route);
    expect(html).not.toContain('data-kitchen-navigation="persistent"');
    expect(html).not.toContain('<nav');
  });
  it.each(['/plus', '/settings', '/week'])('legacy %s retains the supplied shell contract', (route) => {
    const html = render(<AppLayout />, route);
    expect(html).not.toContain('data-kitchen-navigation="persistent"');
    expect(html).toContain('/takosan/brand/takosan-logo-horizontal-primary.svg');
  });
});

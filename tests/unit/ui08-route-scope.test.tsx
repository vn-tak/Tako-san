import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
vi.mock('../../src/web/stores/useAuthStore', () => ({ useAuthStore: () => ({ avatarUrl: null }) }));
import { AppLayout, isKitchenSurface } from '../../src/web/components/layout/AppLayout';
import { AccountPage } from '../../src/web/components/common/AccountPage';
import { RouteFallback } from '../../src/web/components/common/RouteFallback';

describe('UI08 adoption boundary', () => {
  it.each(['/me', '/profile', '/me/preferences', '/me/household', '/notifications', '/settings/app', '/settings/privacy', '/settings/planning', '/settings/notifications'])('adopts the actual account route %s', (route) => {
    const html = renderToStaticMarkup(<StaticRouter location={route}><AppLayout /></StaticRouter>);
    expect(html).toContain('data-kitchen-navigation="persistent"');
    expect(html).toContain('/takosan/rebuild/lockup.svg');
    expect(html).toContain('id="kitchen-main"');
  });
  it.each(['/plus', '/checkout', '/week', '/week/setup', '/settings', '/me/unrelated', '/settings/billing', '/fridge/item/other', '/inventory-reconciliation/other'])('keeps unmigrated/protected %s outside the new route scope', (route) => {
    expect(isKitchenSurface(route)).toBe(false);
  });
  it('uses one page heading, explicit account return and existing header actions', () => {
    const html = renderToStaticMarkup(<StaticRouter location="/me/preferences"><AccountPage title="Sở thích" description="Gu món"><p>Nội dung</p></AccountPage></StaticRouter>);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<a[^>]*aria-label="Quay lại"[^>]*href="\/me"/);
    expect(html).toContain('aria-label="Thông báo"');
  });
  it('keeps route loading as a real live status with the new decorative symbol', () => {
    const html = renderToStaticMarkup(<RouteFallback />);
    expect(html).toContain('role="status"');
    expect(html).toContain('src="/takosan/rebuild/symbol.svg" alt="" width="64" height="64"');
    expect(html).toContain('motion-reduce:animate-none');
  });
});

import { describe, expect, it, vi } from 'vitest';
vi.mock('../../src/web/stores/useAuthStore', () => ({ useAuthStore: () => ({ avatarUrl: null }) }));
import { isKitchenSurface } from '../../src/web/components/layout/AppLayout';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { KitchenDetailPage } from '../../src/web/components/common/KitchenDetailPage';
describe('UI09 scope preserves protected and legacy boundaries', () => {
  it.each([
    '/fridge/lot-1',
    '/fridge/lot-1/',
    '/inventory/lot-1',
    '/ingredients/lot-1',
    '/inventory-reconciliation',
  ])('adopts %s', (route) => expect(isKitchenSurface(route)).toBe(true));
  it.each([
    '/plus',
    '/checkout',
    '/week',
    '/week/setup',
    '/settings/billing',
    '/inventory-reconciliation/other',
    '/fridge/lot-1/other',
    '/ingredients',
  ])('retains the unmigrated/protected %s scope', (route) =>
    expect(isKitchenSurface(route)).toBe(false),
  );
  it('uses one heading and an explicit fridge return destination for deep links', () => {
    const html = renderToStaticMarkup(
      <StaticRouter location="/ingredients/lot-1">
        <KitchenDetailPage title="Chi tiết nguyên liệu">
          <p>Quantity</p>
        </KitchenDetailPage>
      </StaticRouter>,
    );
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toMatch(/<a[^>]*aria-label="Về tủ lạnh"[^>]*href="\/fridge"/);
  });
});

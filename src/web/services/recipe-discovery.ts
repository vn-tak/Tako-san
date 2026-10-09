import { ALL_RECIPES } from '@frigo/recipes';
import { fingerprintRecipes } from '../../../packages/recipes/src/catalog-fingerprint';
import {
  DiscoveryPageSchema,
  DiscoveryQuerySchema,
  type DiscoveryParams,
  type DiscoveryPage,
} from '../../../packages/recipes/src/discovery-contract';
import {
  DiscoveryCursorError,
  discoverySnapshot,
  rankDiscovery,
  selectDiscoveryPage,
  presentDiscoveryPage,
} from '../../../packages/recipes/src/discovery';
import { ApiError, fetchJson, getCurrentScope, guardPrivateSession, isOffline } from './http';
import { inventoryApi } from './inventory';

export const discoveryApi = {
  getRecipeDiscovery: async (params: DiscoveryParams = {}): Promise<DiscoveryPage> => {
    const assertCurrent = guardPrivateSession();
    const scope = getCurrentScope();
    const parsed = DiscoveryQuerySchema.safeParse(params);
    if (!parsed.success)
      throw new ApiError(
        'http',
        `HTTP 400: ${JSON.stringify({ code: params.cursor ? 'DISCOVERY_CURSOR_INVALID' : 'DISCOVERY_QUERY_INVALID' })}`,
        400,
      );
    const query = parsed.data;
    const search = new URLSearchParams();
    for (const [name, value] of Object.entries(query))
      if (value !== undefined && value !== '' && value !== false) search.set(name, String(value));
    try {
      const response = await fetchJson<unknown>(`/recipe-discovery?${search}`);
      assertCurrent();
      const page = DiscoveryPageSchema.parse(response);
      if (
        page.source !== 'server' ||
        page.pageSize !== query.pageSize ||
        page.page !== Math.min(query.page, page.pages) ||
        (query.cursor && query.cursor.split('.')[2] !== page.snapshot)
      )
        throw new Error('Danh sách công thức trả về không hợp lệ');
      return page;
    } catch (error) {
      assertCurrent();
      if (!isOffline(error)) throw error;
      const inventory = await inventoryApi.getInventory();
      assertCurrent();
      const snapshot = await discoverySnapshot({
        source: 'device:static',
        catalogFingerprint: await fingerprintRecipes(ALL_RECIPES),
        userId: scope.userId,
        householdId: scope.householdId,
        inventory,
        query,
      });
      assertCurrent();
      try {
        return presentDiscoveryPage(
          selectDiscoveryPage(rankDiscovery(ALL_RECIPES, inventory, query), query, snapshot),
          'device',
        );
      } catch (error) {
        if (error instanceof DiscoveryCursorError)
          throw new ApiError('http', `HTTP 409: ${JSON.stringify({ code: error.code })}`, 409);
        throw error;
      }
    }
  },
};

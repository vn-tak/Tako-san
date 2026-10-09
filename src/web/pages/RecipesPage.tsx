import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KitchenPageHeading } from '../components/common/KitchenHeader';
import { TopBar } from '../components/common/TopBar';
import { RecipeCard } from '../components/common/RecipeCard';
import { InlineError, InlineLoading } from '../components/common/AsyncState';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import { queryKeys } from '../lib/queryKeys';
import {
  readDiscoveryFilters,
  updateDiscoveryFilters,
  resetDiscoveryFilters,
  filterDiscoveryResults,
  pageDiscoveryResults,
  type DiscoveryFilters,
} from '../lib/recipe-discovery';
import { Search, ArrowLeft, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

const CATEGORIES = [
  ['mon_canh', 'Canh'],
  ['mon_kho', 'Kho / rim'],
  ['mon_xao', 'Xào'],
  ['mon_chien', 'Chiên / rán'],
  ['mon_hap_luoc', 'Hấp / luộc'],
  ['mon_cuon_nom', 'Cuốn / nộm'],
  ['mon_bun_pho', 'Bún / phở'],
  ['mon_chay', 'Chay'],
  ['mon_nhanh_sang', 'Ăn sáng'],
  ['mon_lau_tiec', 'Lẩu / tiệc'],
];
const CUISINES = [
  ['vietnamese', 'Món Việt'],
  ['korean', 'Món Hàn'],
  ['japanese', 'Món Nhật'],
  ['chinese', 'Trung Hoa'],
  ['thai', 'Món Thái'],
  ['italian', 'Món Ý'],
];

export const RecipesPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const filters = readDiscoveryFilters(params);
  const [filtersOpen, setFiltersOpen] = useState(
    () => window.matchMedia?.('(min-width: 1280px)').matches ?? false,
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia('(min-width: 1280px)');
    const updatePanel = () => setFiltersOpen(media.matches);
    media.addEventListener('change', updatePanel);
    return () => media.removeEventListener('change', updatePanel);
  }, []);
  const filterCount = [
    filters.cuisine,
    filters.category,
    filters.region,
    filters.noBuy,
    filters.fast,
  ].filter(Boolean).length;
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusResults = useRef(false);
  const update = (patch: Partial<DiscoveryFilters>, replace = false) =>
    setParams(updateDiscoveryFilters(params, patch), { replace });
  const reset = () => {
    setParams(resetDiscoveryFilters(params));
    inputRef.current?.focus();
  };
  const query = useQuery({
    queryKey: queryKeys.recommendations({
      noBuy: filters.noBuy,
      cuisine: filters.cuisine,
      category: filters.category,
      region: filters.region,
      maxTime: filters.fast ? 20 : undefined,
    }),
    queryFn: () =>
      api.getRecommendations({
        noBuy: filters.noBuy,
        cuisine: filters.cuisine ?? undefined,
        category: filters.category ?? undefined,
        region: filters.region ?? undefined,
        maxTime: filters.fast ? 20 : undefined,
      }),
  });
  const { q, cuisine, category, region, noBuy, fast } = filters;
  const filtered = useMemo(
    () =>
      filterDiscoveryResults(query.data ?? [], {
        q,
        cuisine,
        category,
        region,
        noBuy,
        fast,
        page: 1,
      }),
    [query.data, q, cuisine, category, region, noBuy, fast],
  );
  const result = pageDiscoveryResults(filtered, filters.page);
  useEffect(() => {
    if (query.isSuccess && filters.page !== result.page)
      setParams(updateDiscoveryFilters(params, { page: result.page }), { replace: true });
  }, [query.isSuccess, filters.page, result.page, params, setParams]);
  useEffect(() => {
    if (focusResults.current && query.isSuccess) {
      focusResults.current = false;
      headingRef.current?.focus();
    }
  }, [result.page, query.isSuccess]);
  const active = !!(
    filters.q ||
    filters.cuisine ||
    filters.category ||
    filters.region ||
    filters.noBuy ||
    filters.fast
  );
  const pagerHref = (page: number) => `?${updateDiscoveryFilters(params, { page })}`;

  return (
    <div className="takosan-rebuild min-h-screen bg-semantic-background pb-12">
      <TopBar kitchen />
      <div className="kitchen-page-body animate-fade-in">
        <KitchenPageHeading
          eyebrow="Công thức mỗi ngày"
          title="Chọn món cho căn bếp của bạn"
          description="Tìm theo món, nguyên liệu hoặc cách nấu. Kiểm tra phần cần mua trước khi bắt đầu."
        />
        <div className="discovery-workspace">
          <aside className="discovery-controls" aria-label="Tìm và lọc công thức">
            <label htmlFor="recipe-search" className="block text-sm font-semibold mb-2">
              Tìm món hoặc nguyên liệu
            </label>
            <div className="relative">
              <Search
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-3.5 text-semantic-text-muted"
              />
              <input
                id="recipe-search"
                ref={inputRef}
                type="search"
                name="q"
                autoComplete="off"
                maxLength={160}
                value={filters.q}
                onChange={(event) => update({ q: event.target.value }, true)}
                placeholder="Ví dụ: thịt kho, trứng, canh chua…"
                className="kitchen-search-input"
              />
            </div>
            <details
              className="discovery-filter-panel"
              open={filtersOpen}
              onToggle={(event) => setFiltersOpen(event.currentTarget.open)}
            >
              <summary>Bộ lọc{filterCount ? ` · ${filterCount} đang dùng` : ''}</summary>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <label className="discovery-select-label">
                  Ẩm thực
                  <select
                    name="cuisine"
                    autoComplete="off"
                    value={filters.cuisine ?? ''}
                    onChange={(event) => update({ cuisine: event.target.value || null })}
                  >
                    <option value="">Tất cả ẩm thực</option>
                    {CUISINES.map(([id, label]) => (
                      <option value={id} key={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="discovery-select-label">
                  Cách nấu
                  <select
                    name="category"
                    autoComplete="off"
                    value={filters.category ?? ''}
                    onChange={(event) =>
                      update({
                        category: (event.target.value as DiscoveryFilters['category']) || null,
                      })
                    }
                  >
                    <option value="">Tất cả cách nấu</option>
                    {CATEGORIES.map(([id, label]) => (
                      <option value={id} key={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="discovery-select-label">
                  Vùng miền
                  <select
                    name="region"
                    autoComplete="off"
                    value={filters.region ?? ''}
                    onChange={(event) =>
                      update({ region: (event.target.value as DiscoveryFilters['region']) || null })
                    }
                  >
                    <option value="">Toàn quốc</option>
                    <option value="bac">Miền Bắc</option>
                    <option value="trung">Miền Trung</option>
                    <option value="nam">Miền Nam</option>
                  </select>
                </label>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 xl:flex-col">
                <button
                  type="button"
                  aria-pressed={filters.noBuy}
                  onClick={() => update({ noBuy: !filters.noBuy })}
                  className={clsx('discovery-toggle', filters.noBuy && 'discovery-toggle-active')}
                >
                  <CheckCircle size={17} aria-hidden="true" />
                  Không mua thêm
                </button>
                <button
                  type="button"
                  aria-pressed={filters.fast}
                  onClick={() => update({ fast: !filters.fast })}
                  className={clsx('discovery-toggle', filters.fast && 'discovery-toggle-active')}
                >
                  <Clock size={17} aria-hidden="true" />
                  Tối đa 20 phút
                </button>
              </div>
              <p className="mt-5 text-sm text-semantic-text-muted leading-relaxed">
                “Không mua thêm” kiểm tra lượng đã biết trong tủ. Đơn vị chưa quy đổi được vẫn cần
                kiểm tra.
              </p>
            </details>
            {active && (
              <Button variant="outline" className="mt-5" onClick={reset}>
                Xóa tìm kiếm và bộ lọc
              </Button>
            )}
          </aside>
          <section aria-labelledby="recipes-results-heading" className="min-w-0 space-y-4">
            <div className="kitchen-section-heading">
              <h2 id="recipes-results-heading" ref={headingRef} tabIndex={-1}>
                {filters.q.trim() ? `Kết quả cho “${filters.q.trim()}”` : 'Công thức phù hợp'}
              </h2>
              {query.isSuccess && (
                <p role="status" className="text-sm text-semantic-text-muted shrink-0">
                  {filtered.length} món
                </p>
              )}
            </div>
            {query.isPending ? (
              <InlineLoading label="Đang tìm món phù hợp…" />
            ) : query.isError ? (
              <InlineError error={query.error} onRetry={() => void query.refetch()} />
            ) : !filtered.length ? (
              <div className="kitchen-neutral-panel" role="status">
                <h3 className="text-lg font-semibold">Không tìm thấy món phù hợp</h3>
                <p className="mt-2 text-sm text-semantic-text-secondary">
                  Thử tên nguyên liệu khác hoặc xóa bộ lọc hiện tại.
                </p>
                <Button className="mt-4" onClick={reset}>
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-semantic-text-secondary">
                  Đang xem {result.offset + 1}–{result.offset + result.items.length} trong{' '}
                  {filtered.length} món
                </p>
                <div data-testid="recipe-discovery-grid" className="discovery-grid">
                  {result.items.map((item) => (
                    <RecipeCard
                      key={item.recipe.id}
                      matchResult={item}
                      variant="grid"
                      headingLevel={3}
                      onClick={() =>
                        navigate(`/recipes/${item.recipe.slug}`, {
                          state: { discoveryReturn: `/recipes?${params}` },
                        })
                      }
                    />
                  ))}
                </div>
                {result.pages > 1 && (
                  <nav aria-label="Phân trang công thức" className="discovery-pager">
                    {result.page > 1 ? (
                      <Link
                        to={pagerHref(result.page - 1)}
                        onClick={(event) => {
                          if (
                            event.button === 0 &&
                            !event.metaKey &&
                            !event.ctrlKey &&
                            !event.shiftKey &&
                            !event.altKey
                          )
                            focusResults.current = true;
                        }}
                        className="kitchen-text-link"
                      >
                        <ArrowLeft size={17} aria-hidden="true" />
                        Trước
                      </Link>
                    ) : (
                      <span />
                    )}
                    <span className="text-sm text-semantic-text-secondary">
                      Trang {result.page}/{result.pages}
                    </span>
                    {result.page < result.pages ? (
                      <Link
                        to={pagerHref(result.page + 1)}
                        onClick={(event) => {
                          if (
                            event.button === 0 &&
                            !event.metaKey &&
                            !event.ctrlKey &&
                            !event.shiftKey &&
                            !event.altKey
                          )
                            focusResults.current = true;
                        }}
                        className="kitchen-text-link"
                      >
                        Tiếp <ArrowRight size={17} aria-hidden="true" />
                      </Link>
                    ) : (
                      <span />
                    )}
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

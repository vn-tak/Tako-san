import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Clock, Users } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { TopBar } from '../components/common/TopBar';
import { RecipeCard } from '../components/common/RecipeCard';
import { KitchenPageHeading } from '../components/common/KitchenHeader';
import { InlineLoading, InlineError, SkeletonCard } from '../components/common/AsyncState';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import { queryKeys } from '../lib/queryKeys';
import { daysUntil } from '../lib/format';
import { presentExpiry } from '../lib/inventory-truth';
import { calendarLabel, type HomePlan } from '../lib/home-plan';
import { useHomePlan } from '../lib/use-home-plan';
import { getIngredientImage } from '../lib/ingredient-images';
import { resolveRecipeImage, recipeImageErrorHandler } from '../lib/recipe-media';

const MEAL_LABELS = { breakfast: 'Bữa sáng', lunch: 'Bữa trưa', dinner: 'Bữa tối' };

function PlannedMeal({ plan, onRetry }: { plan: HomePlan; onRetry: () => void }) {
  const meal = plan.meal;
  const label = meal ? calendarLabel(meal.date, plan.today) : null;
  const image = meal?.recipe ? resolveRecipeImage(meal.recipe) : null;
  return (
    <section aria-labelledby="home-plan-heading" className="home-plan-card">
      <div className="home-plan-copy">
        <p className="kitchen-eyebrow">
          <CalendarDays size={16} aria-hidden="true" />
          {meal ? `${MEAL_LABELS[meal.mealType]} · ${label}` : 'Thực đơn của bạn'}
        </p>
        <h2 id="home-plan-heading" className="home-meal-title">
          {!meal
            ? 'Không còn bữa sắp tới trong lịch'
            : meal.state === 'pending'
              ? 'Đang tải các món trong bữa…'
              : meal.state === 'error'
                ? 'Chưa kiểm tra được các món trong bữa'
                : meal.state === 'empty'
                  ? 'Bữa này chưa có món nào'
                  : meal.dishes.length === 1
                    ? meal.dishes[0]
                    : `${MEAL_LABELS[meal.mealType]} có ${meal.dishes.length} món`}
        </h2>
        {meal?.state === 'ready' && meal.dishes.length > 1 && (
          <ul className="mt-4 space-y-2 text-base" aria-label="Các món trong bữa">
            {meal.dishes.map((title, index) => (
              <li key={`${title}-${index}`}>{title}</li>
            ))}
          </ul>
        )}
        {meal && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-semantic-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Users size={16} aria-hidden="true" />
              {meal.servings} người
            </span>
            {meal.state === 'ready' && meal.cookTimeMinutes !== null && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={16} aria-hidden="true" />
                {meal.cookTimeMinutes} phút
              </span>
            )}
          </div>
        )}
        {meal && meal.date > plan.today && (
          <p className="mt-3 text-sm text-semantic-text-secondary">
            {plan.startDate > plan.today
              ? `Thực đơn bắt đầu ${calendarLabel(plan.startDate, plan.today).toLocaleLowerCase('vi-VN')}.`
              : 'Đây là bữa sắp tới trong lịch của bạn.'}
          </p>
        )}
        {meal?.state === 'pending' && (
          <p role="status" className="mt-3 text-sm">
            Đang kiểm tra thực đơn mới nhất.
          </p>
        )}
        {meal?.state === 'error' && (
          <div role="alert" className="mt-3 text-sm text-semantic-danger-strong">
            <p>Thực đơn có thể đã thay đổi hoặc chưa tải được. Tải lại để xem các món hiện tại.</p>
            <Button variant="outline" className="mt-3" onClick={onRetry}>
              Tải lại thực đơn
            </Button>
          </div>
        )}
        <Link to={meal?.href ?? plan.href} className="kitchen-primary-link mt-5">
          {meal?.state === 'empty' ? 'Chọn món cho bữa này' : meal ? 'Xem bữa ăn' : 'Xem thực đơn'}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        {plan.requiresReview && (
          <p className="mt-3 text-sm text-semantic-warning-strong">
            Dữ liệu đã thay đổi. Kiểm tra lại nguyên liệu trước khi nấu.
          </p>
        )}
      </div>
      {image && (
        <img
          className="home-meal-image"
          src={image.src}
          alt={image.source === 'placeholder' ? 'Chưa có ảnh món ăn' : meal!.dishes[0]}
          width={320}
          height={240}
          onError={recipeImageErrorHandler(image.fallbackSrc)}
        />
      )}
    </section>
  );
}

export const HomePage = () => {
  const navigate = useNavigate();
  const { displayName } = useAuthStore();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const update = () => setNow(new Date());
    const timer = window.setInterval(update, 60_000);
    window.addEventListener('focus', update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', update);
    };
  }, []);
  const home = useHomePlan(now);
  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory(),
    queryFn: () => api.getInventory(),
  });
  const recommendationsQuery = useQuery({
    queryKey: queryKeys.recommendations({ noBuy: false, cuisine: null }),
    queryFn: () => api.getRecommendations({ noBuy: false }),
  });
  const inventory = inventoryQuery.data ?? [];
  const useSoon = inventory
    .filter((item) => item.freshness === 'use_soon' || item.freshness === 'expiring')
    .sort(
      (a, b) =>
        (daysUntil(presentExpiry(a).date ?? undefined) ?? 99) -
        (daysUntil(presentExpiry(b).date ?? undefined) ?? 99),
    )
    .slice(0, 4);
  const firstName = displayName?.trim().split(/\s+/).at(-1);
  const plan = home.plan;
  const recommendations = (recommendationsQuery.data ?? []).slice(0, 3);

  return (
    <div className="takosan-rebuild min-h-screen bg-semantic-background pb-12">
      <TopBar kitchen />
      <div className="kitchen-page-body animate-fade-in">
        <KitchenPageHeading
          eyebrow={firstName ? `Chào ${firstName}` : 'Căn bếp của bạn'}
          title="Hôm nay ăn gì?"
          description="Xem bữa sắp tới, dùng nguyên liệu đang có và chuẩn bị phần cần mua."
        />
        <div className="home-workspace">
          <div data-testid="t18c-home-primary" className="min-w-0 space-y-6">
            {home.query.isPending ? (
              <div role="status">
                <SkeletonCard className="h-64" />
                <span className="sr-only">Đang tải thực đơn…</span>
              </div>
            ) : home.query.isError ? (
              <InlineError error={home.query.error} onRetry={() => void home.retry()} />
            ) : plan ? (
              <PlannedMeal plan={plan} onRetry={() => void home.retry()} />
            ) : (
              <section aria-labelledby="home-plan-heading" className="home-plan-card">
                <div className="home-plan-copy">
                  <p className="kitchen-eyebrow">Bắt đầu từ căn bếp của bạn</p>
                  <h2 id="home-plan-heading" className="home-meal-title">
                    Chưa có thực đơn hiện tại
                  </h2>
                  <p className="mt-3 text-base text-semantic-text-secondary">
                    Chọn ngày và số người. Takosan sẽ giúp bạn sắp xếp các bữa từ nguyên liệu đang
                    có.
                  </p>
                  <Link className="kitchen-primary-link mt-5" to={home.setupHref}>
                    Lên thực đơn <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </section>
            )}
            {plan && home.query.isSuccess && (
              <section className="home-plan-summary" aria-label="Tổng quan thực đơn">
                <div>
                  <p className="kitchen-eyebrow">Trong thực đơn</p>
                  <p className="mt-2 text-lg font-semibold">
                    {plan.planned === null
                      ? plan.meal?.state === 'error'
                        ? 'Chưa kiểm tra được các bữa đã xếp'
                        : plan.meal?.state === 'pending'
                          ? 'Đang kiểm tra các bữa đã xếp'
                          : 'Chưa xác nhận số bữa đã xếp'
                      : `${plan.planned}/${plan.total} bữa đã xếp`}
                  </p>
                  {plan.budgetText && (
                    <p className="mt-2 text-sm text-semantic-text-muted">{plan.budgetText}</p>
                  )}
                </div>
                <Link to={plan.href} className="kitchen-text-link">
                  Xem lịch <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </section>
            )}
            <section aria-labelledby="use-soon-heading" className="space-y-4">
              <div className="kitchen-section-heading">
                <h2 id="use-soon-heading">Nên dùng sớm</h2>
                <Link to="/fridge" className="kitchen-text-link">
                  Mở tủ lạnh <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
              {inventoryQuery.isPending ? (
                <InlineLoading label="Đang tải nguyên liệu…" />
              ) : inventoryQuery.isError ? (
                <InlineError
                  error={inventoryQuery.error}
                  onRetry={() => void inventoryQuery.refetch()}
                />
              ) : !useSoon.length ? (
                <div className="kitchen-neutral-panel">
                  <p className="text-sm text-semantic-text-secondary">
                    {inventory.length
                      ? 'Chưa có nguyên liệu được đánh dấu cần dùng sớm. Kiểm tra hạn dùng trong tủ lạnh.'
                      : 'Tủ lạnh đang trống. Thêm nguyên liệu để tìm món phù hợp.'}
                  </p>
                  {!inventory.length && (
                    <Link to="/scan" className="kitchen-text-link mt-2">
                      Quét nguyên liệu <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              ) : (
                <div className="home-stock-list">
                  {useSoon.map((item) => {
                    const expiry = presentExpiry(item);
                    const days = expiry.date === null ? null : daysUntil(expiry.date);
                    const label =
                      expiry.tone === 'unknown' || days === null
                        ? 'Chưa rõ hạn dùng'
                        : expiry.tone === 'expired'
                          ? expiry.estimated
                            ? 'Ước tính đã quá hạn'
                            : 'Đã quá hạn'
                          : expiry.estimated
                            ? days <= 0
                              ? 'Ước tính hết hạn hôm nay'
                              : `Ước tính còn ${days} ngày`
                            : days <= 0
                              ? 'Hết hạn hôm nay'
                              : `Còn ${days} ngày`;
                    return (
                      <Link
                        key={item.id}
                        to={`/ingredients/${item.id}`}
                        className="home-stock-item"
                      >
                        <img
                          src={getIngredientImage(item.ingredientId, item.name)}
                          alt=""
                          width={48}
                          height={48}
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold">{item.name}</h3>
                          <p
                            className="mt-1 text-sm text-semantic-text-muted"
                            data-testid="home-use-soon-expiry"
                            data-expiry-kind={
                              expiry.tone === 'unknown'
                                ? 'UNKNOWN'
                                : expiry.estimated
                                  ? 'ESTIMATED'
                                  : 'KNOWN'
                            }
                          >
                            {label}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
          <section
            data-testid="t18c-home-recommendations"
            className="min-w-0 space-y-4"
            aria-labelledby="home-recipes-heading"
          >
            <div className="kitchen-section-heading">
              <h2 id="home-recipes-heading">Gợi ý cho bữa tới</h2>
              <Link to="/recipes" className="kitchen-text-link">
                Xem thêm <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            {recommendationsQuery.isPending ? (
              <InlineLoading label="Đang tìm món phù hợp…" />
            ) : recommendationsQuery.isError ? (
              <InlineError
                error={recommendationsQuery.error}
                onRetry={() => void recommendationsQuery.refetch()}
              />
            ) : recommendations.length ? (
              <div className="space-y-4">
                {recommendations.map((match) => (
                  <RecipeCard
                    key={match.recipe.id}
                    matchResult={match}
                    headingLevel={3}
                    onClick={() =>
                      navigate(`/recipes/${match.recipe.slug}`, { state: { discoveryReturn: '/' } })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="kitchen-neutral-panel">
                <p className="text-sm">Chưa có món phù hợp để gợi ý.</p>
                <Link to="/recipes" className="kitchen-text-link mt-2">
                  Tìm trong công thức <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            )}
            <Link to="/recipes?noBuy=true" className="kitchen-discovery-link">
              Chỉ xem món đủ lượng trong tủ <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

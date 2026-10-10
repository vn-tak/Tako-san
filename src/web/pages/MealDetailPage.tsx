import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ChefHat, ArrowRightLeft } from 'lucide-react';
import { useWeekStore } from '../stores/useWeekStore';
import { WeekWorkspace, weekCurrency, mealLabels } from '../features/week/WeekWorkspace';
import { InlineError, InlineLoading } from '../components/common/AsyncState';
import { MealSwapSheet } from '../features/week/MealSwapSheet';
import { getIngredientImage } from '../lib/ingredient-images';
import { queryKeys } from '../lib/queryKeys';
import { api } from '../services/api';
import { resolveRecipeImage, recipeImageErrorHandler } from '../lib/recipe-media';

export function MealDetailPage() {
  const { planId, mealId } = useParams<{ planId: string; mealId: string }>();
  const { openSwap, error: workflowError } = useWeekStore();
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps' | 'nutrition'>('ingredients');
  const planQuery = useQuery({
    queryKey: queryKeys.weekPlan(planId || ''),
    queryFn: () => api.getWeekPlan(planId!),
    enabled: Boolean(planId),
  });
  const currentPlan = planQuery.data ?? null;
  useEffect(() => {
    if (currentPlan) useWeekStore.setState({ currentPlan });
  }, [currentPlan]);
  const day = currentPlan?.days.find((entry) => entry.slots.some((slot) => slot.id === mealId));
  const slot = day?.slots.find((entry) => entry.id === mealId);
  const recipe = slot?.recipe;
  const media = recipe ? resolveRecipeImage(recipe) : null;
  const backTo = planId ? `/week/${planId}` : '/week';
  return (
    <WeekWorkspace
      title={recipe?.title || 'Chi tiết món ăn'}
      backTo={backTo}
      description={
        day && slot
          ? `${day.dayNameVi} · ${mealLabels[slot.slotType]} · ${slot.servings} phần ăn`
          : 'Món ăn trong thực đơn tuần của bạn.'
      }
    >
      {planQuery.isError ? (
        <InlineError error={planQuery.error} onRetry={() => planQuery.refetch()} />
      ) : planQuery.isPending ? (
        <InlineLoading label="Đang tải món trong thực đơn…" />
      ) : !recipe || !slot || !media ? (
        <div className="week-paper">
          <p role="status">Không tìm thấy thông tin món ăn này.</p>
          <Link to={backTo} className="week-text-link">
            Về thực đơn tuần
          </Link>
        </div>
      ) : (
        <>
          {workflowError && <InlineError message={workflowError} />}
          <div className="week-meal-overview">
            <img
              className="week-recipe-cover"
              src={media.src}
              alt={recipe.title}
              width={720}
              height={480}
              onError={recipeImageErrorHandler(media.fallbackSrc)}
            />
            <div className="week-paper week-recipe-facts">
              <h2>Chuẩn bị bữa ăn</h2>
              <dl>
                <div>
                  <dt>Thời gian theo công thức</dt>
                  <dd>{recipe.cookTimeMinutes} phút</dd>
                </div>
                <div>
                  <dt>Theo kế hoạch · có sẵn</dt>
                  <dd>{slot.availabilityPercent}%</dd>
                </div>
                <div>
                  <dt>Mua thêm · ước tính</dt>
                  <dd>~{weekCurrency(slot.incrementalCostVnd)}</dd>
                </div>
              </dl>
              <p className="week-muted">
                Kiểm tra lại số lượng và hạn dùng thực tế trước khi nấu. Chi phí dự kiến có thể
                thiếu dữ liệu giá.
              </p>
              <div className="week-actions">
                <button
                  type="button"
                  className="week-button week-button-secondary"
                  onClick={() => openSwap(mealId!)}
                >
                  <ArrowRightLeft size={18} aria-hidden="true" />
                  Đổi món
                </button>
                <Link to={`/cook/${recipe.slug}`} className="week-button">
                  <ChefHat size={18} aria-hidden="true" />
                  Bắt đầu nấu
                </Link>
              </div>
            </div>
          </div>
          {slot.rescuedExpiringIngredients.length > 0 && (
            <aside className="week-note">
              <h2>Ưu tiên nguyên liệu sắp hết hạn</h2>
              <p>{slot.rescuedExpiringIngredients.join(', ')}</p>
              <p className="week-muted">Được xếp vào kế hoạch; chưa phải nguyên liệu đã sử dụng.</p>
            </aside>
          )}
          <div className="week-tabs" role="group" aria-label="Nội dung công thức">
            {(
              [
                { id: 'ingredients', label: 'Nguyên liệu' },
                { id: 'steps', label: 'Cách nấu' },
                { id: 'nutrition', label: 'Dinh dưỡng' },
              ] as const
            ).map((tab) => (
              <button
                type="button"
                key={tab.id}
                className="week-button week-button-secondary"
                aria-pressed={activeTab === tab.id}
                aria-controls="week-recipe-content"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <section
            id="week-recipe-content"
            className="week-paper week-recipe-content"
            aria-live="polite"
          >
            {activeTab === 'ingredients' && (
              <>
                <h2>Nguyên liệu ({slot.ingredients.length})</h2>
                <p className="week-muted">
                  Số lượng dự kiến cho {slot.servings} phần ăn, theo dữ liệu của thực đơn.
                </p>
                <ul className="week-ingredient-list">
                  {slot.ingredients.map((ingredient) => (
                    <li key={ingredient.ingredientId}>
                      <img
                        src={getIngredientImage(ingredient.ingredientId, ingredient.name)}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                      />
                      <div>
                        <h3>{ingredient.name}</h3>
                        <p>
                          Cần {ingredient.requiredQuantity} {ingredient.unit} · dự kiến có{' '}
                          {ingredient.availableQuantity} {ingredient.unit}
                        </p>
                      </div>
                      <p className="week-badge">
                        {ingredient.missingQuantity > 0
                          ? `Cần mua ${ingredient.missingQuantity} ${ingredient.unit}`
                          : 'Dự kiến đủ'}
                      </p>
                    </li>
                  ))}
                </ul>
                {!slot.ingredients.length && (
                  <p className="week-note">Chưa có dữ liệu nguyên liệu trong bữa này.</p>
                )}
              </>
            )}
            {activeTab === 'steps' && (
              <>
                <h2>Các bước chế biến</h2>
                {recipe.steps?.length ? (
                  <ol className="week-recipe-steps">
                    {recipe.steps.map((step, index) => (
                      <li key={index}>
                        <span className="week-step-number" aria-hidden="true">
                          {index + 1}
                        </span>
                        <div>
                          <h3>{`Bước ${index + 1}`}</h3>
                          <p>{step.instruction}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="week-note">Chưa có hướng dẫn chế biến cho công thức này.</p>
                )}
              </>
            )}
            {activeTab === 'nutrition' && (
              <>
                <h2>Dinh dưỡng theo công thức · mỗi phần</h2>
                <p className="week-muted">
                  Số liệu tham khảo của công thức, có thể khác nguyên liệu thực tế. Dấu — là chưa có
                  dữ liệu, không phải bằng 0.
                </p>
                <dl className="week-nutrition">
                  {[
                    ['Năng lượng', recipe.nutrition?.calories, 'kcal'],
                    ['Đạm', recipe.nutrition?.proteinG, 'g'],
                    ['Chất béo', recipe.nutrition?.fatG, 'g'],
                    ['Tinh bột', recipe.nutrition?.carbG, 'g'],
                  ].map(([label, value, unit]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        {value ?? '—'} <span>{unit}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </section>
          <MealSwapSheet />
        </>
      )}
    </WeekWorkspace>
  );
}

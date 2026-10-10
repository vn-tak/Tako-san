import { useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useModalFocus } from '../../design-system/use-modal-focus';
import { useWeekStore } from '../../stores/useWeekStore';
import { InlineError, InlineLoading } from '../../components/common/AsyncState';
import { resolveRecipeImage, recipeImageErrorHandler } from '../../lib/recipe-media';
import { weekCurrency } from './WeekWorkspace';

export function MealSwapSheet() {
  const {
    swapSlotId,
    swapAlternatives,
    isLoadingAlternatives,
    closeSwap,
    executeSwap,
    currentPlan,
    error,
    openSwap,
    isLoading,
  } = useWeekStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useModalFocus(Boolean(swapSlotId && currentPlan), panelRef, closeSwap, closeRef);
  if (!swapSlotId || !currentPlan) return null;
  const slot = currentPlan.days.flatMap((day) => day.slots).find((item) => item.id === swapSlotId);
  return (
    <div className="week-modal-backdrop" onClick={closeSwap} role="presentation">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="week-dialog week-swap-dialog"
      >
        <div className="week-dialog-heading">
          <div>
            <p className="week-eyebrow">ĐỔI MÓN</p>
            <h2 id={titleId}>Thay thế: {slot?.recipe?.title || slot?.notes || 'Bữa này'}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="week-icon-button"
            onClick={closeSwap}
            aria-label="Đóng bảng đổi món"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="week-dialog-body" aria-busy={isLoadingAlternatives || isLoading}>
          <p className="week-muted">
            Chi phí và mức khớp là ước tính theo kế hoạch. Đổi món chưa làm thay đổi nguyên liệu
            trong tủ.
          </p>
          {error && <InlineError message={error} onRetry={() => openSwap(swapSlotId)} />}
          {isLoadingAlternatives ? (
            <InlineLoading label="Đang tìm món thay thế…" />
          ) : !swapAlternatives.length ? (
            <p role="status" className="week-note">
              Không tìm thấy món thay thế phù hợp với ràng buộc hiện tại.
            </p>
          ) : (
            swapAlternatives.map((alternative) => {
              const media = resolveRecipeImage(alternative.recipe);
              return (
                <article key={alternative.recipe.id} className="week-swap-option">
                  <img
                    src={media.src}
                    alt=""
                    width={88}
                    height={88}
                    loading="lazy"
                    onError={recipeImageErrorHandler(media.fallbackSrc)}
                  />
                  <div>
                    <h3>{alternative.recipe.title}</h3>
                    <p className="week-muted">
                      {alternative.recipe.cookTimeMinutes} phút · khớp {alternative.matchPercent}%
                    </p>
                    <p>
                      Chênh lệch mua thêm: {alternative.budgetDeltaVnd > 0 ? '+' : ''}
                      {weekCurrency(alternative.budgetDeltaVnd)}
                    </p>
                    <div className="week-badges">
                      {alternative.badges.map((badge) => (
                        <span className="week-badge" key={badge}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="week-button"
                    disabled={isLoading}
                    onClick={() => executeSwap(alternative.recipe.id)}
                    aria-label={`Chọn món ${alternative.recipe.title}`}
                  >
                    {isLoading ? 'Đang đổi…' : 'Chọn món'}
                  </button>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

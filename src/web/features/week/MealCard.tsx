import type { MouseEvent } from 'react';
import type { MealSlotItem } from '@frigo/domain';
import { Link } from 'react-router-dom';
import { ArrowRightLeft } from 'lucide-react';
import { resolveRecipeImage, recipeImageErrorHandler } from '../../lib/recipe-media';
import { weekCurrency } from './WeekWorkspace';

export function MealCard({
  slot,
  to,
  onSwapClick,
}: {
  slot: MealSlotItem;
  to: string;
  onSwapClick: (event: MouseEvent) => void;
}) {
  const recipe = slot.recipe;
  if (
    !recipe ||
    slot.status === 'EATING_OUT' ||
    slot.status === 'FLEXIBLE' ||
    slot.status === 'SKIPPED'
  ) {
    const title = {
      EATING_OUT: 'Bữa ăn ngoài',
      FLEXIBLE: 'Bữa linh hoạt',
      SKIPPED: 'Bỏ qua bữa này',
      LEFTOVER: 'Dùng món còn lại',
      PLANNED: 'Chưa có món',
      COOKED: 'Bữa đã nấu',
    }[slot.status];
    return (
      <article className="week-meal-card">
        <h4>{title}</h4>
        <p className="week-muted">{slot.notes || 'Bữa này chưa có công thức để chuẩn bị.'}</p>
        {slot.status !== 'SKIPPED' && slot.status !== 'COOKED' && (
          <button type="button" className="week-button week-button-secondary" onClick={onSwapClick}>
            Chọn món khác
          </button>
        )}
      </article>
    );
  }
  const media = resolveRecipeImage(recipe);
  return (
    <article className="week-meal-card">
      <img
        src={media.src}
        alt=""
        width={320}
        height={180}
        loading="lazy"
        onError={recipeImageErrorHandler(media.fallbackSrc)}
      />
      <div className="week-meal-copy">
        {slot.status === 'COOKED' && <p className="week-badge">Đã nấu</p>}
        <h4>
          <Link className="week-meal-title" to={to}>
            {recipe.title}
          </Link>
        </h4>
        <p className="week-muted">
          {recipe.cookTimeMinutes} phút · {slot.servings} phần ăn
        </p>
        {slot.badges.length > 0 && (
          <div className="week-badges">
            {slot.badges.map((badge) => (
              <span className="week-badge" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        )}
        <p className="week-muted">
          Theo kế hoạch: có sẵn {slot.availabilityPercent}% · mua thêm ~
          {weekCurrency(slot.incrementalCostVnd)}
        </p>
        {slot.status !== 'COOKED' && (
          <button
            type="button"
            className="week-button week-button-secondary"
            onClick={onSwapClick}
            aria-label={`Đổi món ${recipe.title}`}
          >
            <ArrowRightLeft size={16} aria-hidden="true" />
            Đổi món
          </button>
        )}
      </div>
    </article>
  );
}

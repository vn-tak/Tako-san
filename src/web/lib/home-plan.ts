import type { MealPlan } from '@frigo/domain';
import type { Recipe } from '@frigo/recipes';
import type { MealPlanDto } from '../../../packages/domain/src/meal-planning-api';
import type { PlanCompositionsDto } from '../../../packages/domain/src/meal-composition-api';
import { findTodayMeal } from './home-meal';
import { formatVndCompact, todayLocalIso } from './format';

export type CompositionEvidence =
  | { kind: 'legacy' }
  | { kind: 'ready'; data: PlanCompositionsDto }
  | { kind: 'pending' | 'error' | 'mismatch' };

export interface HomeMeal {
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  servings: number;
  href: string;
  dishes: string[];
  cookTimeMinutes: number | null;
  state: 'ready' | 'empty' | 'pending' | 'error';
  recipe?: Recipe;
}
export interface HomePlan {
  id: string;
  href: string;
  today: string;
  startDate: string;
  endDate: string;
  total: number;
  planned: number | null;
  meal: HomeMeal | null;
  requiresReview: boolean;
  budgetText?: string;
}

const END_HOURS = { breakfast: 11, lunch: 16, dinner: 24 };
const DEFAULT_TIMES = { breakfast: '08:00', lunch: '12:00', dinner: '18:00' };

export function calendarLabel(date: string, today: string) {
  if (date === today) return 'Hôm nay';
  const tomorrow = new Date(`${today}T12:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  if (date === tomorrow.toISOString().slice(0, 10)) return 'Ngày mai';
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

export function presentCanonicalHome(
  plan: MealPlanDto,
  now: Date,
  evidence: CompositionEvidence,
): HomePlan {
  const localNow = new Date(now.getTime() + plan.intent.utcOffsetMinutes * 60_000);
  const today = localNow.toISOString().slice(0, 10);
  const slots = [...plan.intent.slots].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time ?? DEFAULT_TIMES[a.mealType]).localeCompare(b.time ?? DEFAULT_TIMES[b.mealType]) ||
      a.sequence - b.sequence,
  );
  // Keep the current meal window, then the next scheduled slot in the plan's offset.
  const selected = slots.find(
    (slot) =>
      slot.date > today ||
      (slot.date === today &&
        (localNow.getUTCHours() < END_HOURS[slot.mealType] ||
          (slot.time !== undefined && slot.time >= localNow.toISOString().slice(11, 16)))),
  );
  const composition = evidence.kind === 'ready' ? evidence.data : undefined;
  const compositionValid =
    composition?.planId === plan.id && composition.planRevision === plan.revision;
  const slotId = (slot: (typeof slots)[number]) => `${slot.date}:${slot.mealType}:${slot.sequence}`;
  const entries = new Map(
    compositionValid ? composition.compositions.map((item) => [item.slotId, item]) : [],
  );
  const anchors = new Map(plan.result.meals.map((item) => [item.slotId, item]));
  // Family variants have no composable recipe component in an explicit V1 projection.
  const isFamilyProjection = (id: string) =>
    entries.get(id)?.source === 'v1_projection' && anchors.get(id)?.source.kind === 'family';
  const allPresent = compositionValid && slots.every((slot) => entries.has(slotId(slot)));
  const planned =
    evidence.kind === 'legacy'
      ? plan.result.meals.length
      : allPresent
        ? slots.filter(
            (slot) =>
              entries.get(slotId(slot))!.components.length > 0 || isFamilyProjection(slotId(slot)),
          ).length
        : null;
  let meal: HomeMeal | null = null;
  if (selected) {
    const id = slotId(selected);
    const anchor = anchors.get(id);
    const entry = entries.get(id);
    const useAnchor = evidence.kind === 'legacy' || isFamilyProjection(id);
    const ready = evidence.kind === 'legacy' || (evidence.kind === 'ready' && !!entry);
    const dishes = useAnchor
      ? anchor
        ? [anchor.title]
        : []
      : ready
        ? entry!.components.map((item) => item.title)
        : [];
    meal = {
      date: selected.date,
      mealType: selected.mealType,
      servings:
        entry?.servings ?? anchor?.servings ?? selected.servings ?? plan.intent.defaultServings,
      href: `/planner/${plan.id}/meal/${encodeURIComponent(id)}`,
      dishes,
      cookTimeMinutes: useAnchor
        ? (anchor?.cookTimeMinutes ?? null)
        : entry?.components.length === 1
          ? entry.components[0].cookTimeMinutes
          : null,
      state:
        evidence.kind === 'pending'
          ? 'pending'
          : !ready
            ? 'error'
            : dishes.length
              ? 'ready'
              : 'empty',
    };
  }
  return {
    id: plan.id,
    href: `/planner/${plan.id}`,
    today,
    startDate: plan.intent.startDate,
    endDate: slots.at(-1)?.date ?? plan.intent.startDate,
    total: slots.length,
    planned,
    meal,
    requiresReview: plan.freshness.status !== 'fresh',
  };
}

export function presentLegacyHome(plan: MealPlan, now: Date): HomePlan {
  const today = todayLocalIso(now);
  const current = findTodayMeal(plan, now);
  const upcoming = [...plan.days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((day) => day.date > today)
    .flatMap((day) => day.slots)
    .find((slot) => slot.recipe && (slot.status === 'PLANNED' || slot.status === 'LEFTOVER'));
  const selected = current ?? upcoming;
  const slots = plan.days.flatMap((day) => day.slots);
  const budget = plan.budget;
  return {
    id: plan.id,
    href: `/week/${plan.id}`,
    today,
    startDate: [...plan.days].map((day) => day.date).sort()[0] ?? today,
    endDate:
      [...plan.days]
        .map((day) => day.date)
        .sort()
        .at(-1) ?? today,
    total: slots.length,
    planned: slots.filter(
      (slot) => slot.recipe || slot.status === 'COOKED' || slot.status === 'LEFTOVER',
    ).length,
    requiresReview: false,
    ...(budget?.targetVnd
      ? {
          budgetText: `Ước tính ${formatVndCompact(budget.estimatedMaxVnd)} / ${formatVndCompact(budget.targetVnd)} ngân sách`,
        }
      : budget?.displayText
        ? { budgetText: budget.displayText }
        : {}),
    meal: selected?.recipe
      ? {
          date: selected.date,
          mealType: selected.slotType,
          servings: selected.servings,
          href: `/week/${plan.id}/meal/${selected.id}`,
          dishes: [selected.recipe.title],
          cookTimeMinutes: selected.recipe.cookTimeMinutes,
          state: 'ready',
          recipe: selected.recipe,
        }
      : null,
  };
}

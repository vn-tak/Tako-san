import { create } from 'zustand';
import { evaluateRecipeAvailability, type Recipe, type RecipeScoringContext } from '@frigo/recipes';
import { onPrivateSessionReset } from '../lib/private-session';
import {
  reviewCookingDeductions,
  type CookingDeduction,
  type DeductionDraft,
} from '../lib/cooking-review';
import { createClientItemId } from '../services/http';

export type { DeductionDraft } from '../lib/cooking-review';
export interface CookingAttempt {
  commandId: string;
  deductions: CookingDeduction[];
  status: 'sending' | 'uncertain' | 'rejected' | 'restricted' | 'blocked' | 'saved' | 'queued';
  error: string | null;
}
interface CookingState {
  runId: string | null;
  activeRecipe: Recipe | null;
  currentStepIndex: number;
  timerSecondsRemaining: number | null;
  timerDeadline: number | null;
  timerGeneration: number;
  isTimerRunning: boolean;
  deductions: DeductionDraft[];
  deductionInputs: string[];
  deductionErrors: Array<string | null>;
  stockSnapshot: RecipeScoringContext['inventory'];
  attempt: CookingAttempt | null;
  startCooking: (recipe: Recipe, inventory: RecipeScoringContext['inventory']) => void;
  nextStep: () => void;
  prevStep: () => void;
  setTimer: (seconds: number) => void;
  tickTimer: () => void;
  toggleTimer: () => void;
  clearTimer: () => void;
  editDeduction: (index: number, input: string) => void;
  updateDeduction: (ingredientId: string, quantity: number) => void;
  beginCompletion: () => CookingAttempt | null;
  finishCompletion: (
    runId: string,
    commandId: string,
    status: CookingAttempt['status'],
    error?: string,
  ) => void;
  refreshStock: (inventory: RecipeScoringContext['inventory']) => void;
  resetCooking: () => void;
}
const empty = {
  runId: null,
  activeRecipe: null,
  currentStepIndex: 0,
  timerSecondsRemaining: null,
  timerDeadline: null,
  timerGeneration: 0,
  isTimerRunning: false,
  deductions: [],
  deductionInputs: [],
  deductionErrors: [],
  stockSnapshot: [],
  attempt: null,
};
const stoppedTimer = { timerSecondsRemaining: null, timerDeadline: null, isTimerRunning: false };

export const useCookingStore = create<CookingState>((set, get) => ({
  ...empty,
  startCooking: (recipe, inventory) => {
    const attempt = get().attempt;
    if (attempt && !['saved', 'queued'].includes(attempt.status)) return;
    const availability = evaluateRecipeAvailability(recipe, inventory);
    const inputs = recipe.ingredients.map((line, index) =>
      String(Math.min(availability[index].availableQuantity, line.requiredQuantity)),
    );
    const review = reviewCookingDeductions(recipe, inventory, inputs);
    set({
      ...empty,
      runId: createClientItemId('cooking_run'),
      activeRecipe: recipe,
      stockSnapshot: inventory,
      deductionInputs: inputs,
      deductions: review.deductions,
      deductionErrors: review.errors,
    });
  },
  nextStep: () => {
    const { activeRecipe, currentStepIndex, attempt } = get();
    if (!attempt && activeRecipe && currentStepIndex < activeRecipe.steps.length - 1)
      set({ currentStepIndex: currentStepIndex + 1, ...stoppedTimer });
  },
  prevStep: () => {
    const { currentStepIndex, attempt } = get();
    if (!attempt && currentStepIndex > 0)
      set({ currentStepIndex: currentStepIndex - 1, ...stoppedTimer });
  },
  setTimer: (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0 || get().attempt) return;
    const duration = Math.ceil(seconds);
    set({
      timerSecondsRemaining: duration,
      timerDeadline: Date.now() + duration * 1000,
      isTimerRunning: true,
      timerGeneration: get().timerGeneration + 1,
    });
  },
  tickTimer: () => {
    const { isTimerRunning, timerDeadline, timerSecondsRemaining } = get();
    if (!isTimerRunning || timerDeadline === null) return;
    const remaining = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
    if (remaining === timerSecondsRemaining) return;
    set({
      timerSecondsRemaining: remaining,
      isTimerRunning: remaining > 0,
      timerDeadline: remaining > 0 ? timerDeadline : null,
    });
  },
  toggleTimer: () => {
    get().tickTimer();
    const { timerSecondsRemaining, isTimerRunning } = get();
    if (timerSecondsRemaining === null || timerSecondsRemaining === 0 || get().attempt) return;
    set({
      isTimerRunning: !isTimerRunning,
      timerDeadline: isTimerRunning ? null : Date.now() + timerSecondsRemaining * 1000,
    });
  },
  clearTimer: () => set(stoppedTimer),
  editDeduction: (index, input) => {
    const { activeRecipe, attempt, stockSnapshot, deductionInputs } = get();
    if (!activeRecipe || attempt || index < 0 || index >= deductionInputs.length) return;
    const inputs = deductionInputs.map((value, row) => (row === index ? input : value));
    const review = reviewCookingDeductions(activeRecipe, stockSnapshot, inputs);
    set({ deductionInputs: inputs, deductions: review.deductions, deductionErrors: review.errors });
  },
  updateDeduction: (ingredientId, quantity) => {
    if (!Number.isFinite(quantity) || quantity < 0) return;
    const index = get().deductions.findIndex((line) => line.ingredientId === ingredientId);
    get().editDeduction(index, String(quantity));
  },
  beginCompletion: () => {
    const state = get();
    if (
      !state.activeRecipe ||
      !state.runId ||
      state.deductionErrors.some(Boolean) ||
      (state.attempt && state.attempt.status !== 'uncertain')
    )
      return null;
    const attempt: CookingAttempt = state.attempt
      ? { ...state.attempt, status: 'sending', error: null }
      : {
          commandId: createClientItemId('cook'),
          status: 'sending',
          error: null,
          deductions: state.deductions.map(({ ingredientId, name, quantityDeducted, unit }) => ({
            ingredientId,
            name,
            quantityDeducted,
            unit,
          })),
        };
    set({ attempt });
    return attempt;
  },
  finishCompletion: (runId, commandId, status, error) => {
    const state = get();
    if (state.runId === runId && state.attempt?.commandId === commandId)
      set({ attempt: { ...state.attempt, status, error: error ?? null } });
  },
  refreshStock: (inventory) => {
    const { activeRecipe, deductionInputs, attempt } = get();
    if (!activeRecipe || attempt?.status !== 'rejected') return;
    const review = reviewCookingDeductions(activeRecipe, inventory, deductionInputs);
    set({
      stockSnapshot: inventory,
      attempt: null,
      deductions: review.deductions,
      deductionErrors: review.errors,
    });
  },
  resetCooking: () => set(empty),
}));
onPrivateSessionReset(() => useCookingStore.getState().resetCooking());

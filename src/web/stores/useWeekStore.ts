import { create } from 'zustand';
import { isCancelledError } from '@tanstack/react-query';
import { MealPlan, MealPlanSetupInput, MealSwapAlternative } from '@frigo/domain';
import { api } from '../services/api';
import { capturePrivateSession, onPrivateSessionReset } from '../lib/private-session';
import { queryClient } from '../lib/query-client';
import { queryKeys } from '../lib/queryKeys';
import { invalidateWeekDependents } from '../lib/query-invalidation';

const shoppingEdits = new Map<string, symbol>();

function cachePlan(plan: MealPlan, { makeCurrent = false, cancelPending = false } = {}) {
  const keys = [queryKeys.weekPlan(plan.id)];
  const currentKey = queryKeys.currentWeekPlan();
  if (makeCurrent || queryClient.getQueryData<MealPlan | null>(currentKey)?.id === plan.id) {
    keys.push(currentKey);
  }
  for (const queryKey of keys) {
    if (cancelPending) void queryClient.cancelQueries({ queryKey, exact: true });
    queryClient.setQueryData(queryKey, plan);
  }
}

interface WeekStoreState {
  currentPlan: MealPlan | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  setupDraft: Partial<MealPlanSetupInput>;
  swapSlotId: string | null;
  swapAlternatives: MealSwapAlternative[];
  isLoadingAlternatives: boolean;

  // Actions
  loadCurrentPlan: () => Promise<MealPlan | null>;
  loadPlanById: (id: string) => Promise<MealPlan | null>;
  updateSetupDraft: (updates: Partial<MealPlanSetupInput>) => void;
  resetSetupDraft: () => void;
  generatePlan: (input: MealPlanSetupInput) => Promise<MealPlan>;
  openSwap: (slotId: string) => Promise<void>;
  closeSwap: () => void;
  executeSwap: (recipeId: string) => Promise<void>;
  markMealCooked: (mealId: string) => Promise<void>;
  toggleShoppingItem: (itemId: string, checked: boolean) => Promise<void>;
  completeShopping: () => Promise<{ success: boolean; count: number; pendingSync?: boolean }>;
}

export const useWeekStore = create<WeekStoreState>((set, get) => ({
  currentPlan: null,
  isLoading: false,
  isGenerating: false,
  error: null,
  setupDraft: {
    householdSize: 3,
    mealSlotsPreset: 'dinner_only',
    budgetTargetVnd: 750000,
    priorities: ['use_fridge'],
    shoppingFrequency: 'once',
  },
  swapSlotId: null,
  swapAlternatives: [],
  isLoadingAlternatives: false,

  loadCurrentPlan: async () => {
    const isCurrent = capturePrivateSession();
    if (!isCurrent()) return null;
    set({ isLoading: true, error: null });
    try {
      const plan = await queryClient.fetchQuery({
        queryKey: queryKeys.currentWeekPlan(),
        queryFn: async () => {
          const result = await api.getCurrentWeekPlan();
          if (!isCurrent()) throw new Error('Session changed');
          return result;
        },
      });
      if (!isCurrent()) return null;
      if (plan) cachePlan(plan);
      set({ currentPlan: plan, isLoading: false });
      return plan;
    } catch (error) {
      if (!isCurrent()) return null;
      if (isCancelledError(error)) {
        set({ isLoading: false });
        return null;
      }
      set({ error: 'Không thể tải thực đơn tuần. Vui lòng thử lại.', isLoading: false });
      return null;
    }
  },

  loadPlanById: async (id: string) => {
    const isCurrent = capturePrivateSession();
    if (!isCurrent()) return null;
    set({ isLoading: true, error: null });
    try {
      const plan = await queryClient.fetchQuery({
        queryKey: queryKeys.weekPlan(id),
        queryFn: async () => {
          const result = await api.getWeekPlan(id);
          if (!isCurrent()) throw new Error('Session changed');
          return result;
        },
      });
      if (!isCurrent()) return null;
      if (plan) cachePlan(plan);
      set({ currentPlan: plan, isLoading: false });
      return plan;
    } catch (error) {
      if (!isCurrent()) return null;
      if (isCancelledError(error)) {
        set({ isLoading: false });
        return null;
      }
      set({ error: 'Không thể tải thực đơn này. Vui lòng thử lại.', isLoading: false });
      return null;
    }
  },

  updateSetupDraft: (updates) => {
    set((state) => ({
      setupDraft: { ...state.setupDraft, ...updates },
    }));
  },

  resetSetupDraft: () => {
    set({
      setupDraft: {
        householdSize: 3,
        mealSlotsPreset: 'dinner_only',
        budgetTargetVnd: 750000,
        priorities: ['use_fridge'],
        shoppingFrequency: 'once',
      },
    });
  },

  generatePlan: async (input) => {
    const isCurrent = capturePrivateSession();
    if (!isCurrent()) throw new Error('Session changed');
    set({ isGenerating: true, error: null });
    try {
      const plan = await api.createWeekPlan(input);
      if (!isCurrent()) throw new Error('Session changed');
      cachePlan(plan, { makeCurrent: true, cancelPending: true });
      set({ currentPlan: plan, isGenerating: false });
      void invalidateWeekDependents();
      return plan;
    } catch {
      if (!isCurrent()) throw new Error('Session changed');
      const error = 'Không thể tạo thực đơn tuần. Vui lòng thử lại.';
      set({ error, isGenerating: false });
      throw new Error(error);
    }
  },

  openSwap: async (slotId: string) => {
    const isCurrent = capturePrivateSession();
    const { currentPlan } = get();
    if (!currentPlan || !isCurrent()) return;

    set({ swapSlotId: slotId, isLoadingAlternatives: true, swapAlternatives: [], error: null });
    try {
      const res = await api.swapMeal(currentPlan.id, slotId);
      if (!isCurrent() || get().currentPlan?.id !== currentPlan.id || get().swapSlotId !== slotId) return;
      set({
        swapAlternatives: res.alternatives || [],
        isLoadingAlternatives: false,
      });
    } catch {
      if (!isCurrent() || get().currentPlan?.id !== currentPlan.id || get().swapSlotId !== slotId) return;
      set({ error: 'Không thể tải món thay thế. Vui lòng thử lại.', isLoadingAlternatives: false });
    }
  },

  closeSwap: () => {
    set({ swapSlotId: null, swapAlternatives: [], isLoadingAlternatives: false });
  },

  executeSwap: async (recipeId: string) => {
    const isCurrent = capturePrivateSession();
    const { currentPlan, swapSlotId } = get();
    if (!currentPlan || !swapSlotId || !isCurrent()) return;

    set({ isLoading: true, error: null });
    try {
      const res = await api.swapMeal(currentPlan.id, swapSlotId, recipeId);
      if (!isCurrent()) return;
      if (res.plan) {
        cachePlan(res.plan, { cancelPending: true });
        if (get().currentPlan?.id === currentPlan.id) {
          set({ currentPlan: res.plan, swapSlotId: null, swapAlternatives: [], isLoading: false });
        }
      } else if (get().currentPlan?.id === currentPlan.id) {
        set({ isLoading: false });
      }
      void invalidateWeekDependents();
    } catch {
      if (!isCurrent() || get().currentPlan?.id !== currentPlan.id) return;
      set({ error: 'Không thể đổi món. Vui lòng thử lại.', isLoading: false });
    }
  },

  markMealCooked: async (mealId: string) => {
    const isCurrent = capturePrivateSession();
    const { currentPlan } = get();
    if (!currentPlan || !isCurrent()) return;

    set({ error: null });
    try {
      const updated = await api.updateMealSlot(currentPlan.id, mealId, {
        status: 'COOKED',
      });
      if (!isCurrent()) return;
      if (updated) {
        cachePlan(updated, { cancelPending: true });
        if (get().currentPlan?.id === currentPlan.id) set({ currentPlan: updated });
      }
      void invalidateWeekDependents();
    } catch {
      if (!isCurrent() || get().currentPlan?.id !== currentPlan.id) return;
      set({ error: 'Không thể cập nhật bữa ăn. Vui lòng thử lại.' });
    }
  },

  toggleShoppingItem: async (itemId: string, checked: boolean) => {
    const isCurrent = capturePrivateSession();
    const { currentPlan } = get();
    const previousItem = currentPlan?.shoppingItems.find((item) => item.ingredientId === itemId);
    if (!currentPlan || !previousItem || !isCurrent()) return;
    const editKey = JSON.stringify([...queryKeys.weekPlan(currentPlan.id), itemId]);
    const edit = Symbol();
    shoppingEdits.set(editKey, edit);

    const updatedItems = currentPlan.shoppingItems.map((item) =>
      item.ingredientId === itemId ? { ...item, checked } : item
    );
    const optimisticPlan = { ...currentPlan, shoppingItems: updatedItems };
    cachePlan(optimisticPlan, { cancelPending: true });
    set({ currentPlan: optimisticPlan, error: null });

    try {
      await api.toggleWeekShoppingItem(currentPlan.id, itemId, checked);
      if (!isCurrent()) return;
      if (shoppingEdits.get(editKey) === edit) shoppingEdits.delete(editKey);
      void queryClient.invalidateQueries({ queryKey: queryKeys.weekPlans() });
    } catch {
      if (!isCurrent() || shoppingEdits.get(editKey) !== edit) return;
      shoppingEdits.delete(editKey);
      // Restore only this edit, not another item's optimistic update or a newer toggle.
      const rollback = (plan: MealPlan): MealPlan => plan.id !== currentPlan.id ? plan : {
        ...plan,
        shoppingItems: plan.shoppingItems.map((item) => item.ingredientId === itemId
          ? { ...item, checked: previousItem.checked } : item),
      };
      for (const queryKey of [queryKeys.weekPlan(currentPlan.id), queryKeys.currentWeekPlan()]) {
        queryClient.setQueryData<MealPlan | null>(queryKey, (plan) => plan ? rollback(plan) : plan);
      }
      if (get().currentPlan?.id === currentPlan.id) {
        set((state) => ({
          currentPlan: state.currentPlan ? rollback(state.currentPlan) : null,
          error: 'Không thể cập nhật danh sách đi chợ. Vui lòng thử lại.',
        }));
      }
    }
  },

  completeShopping: async () => {
    const isCurrent = capturePrivateSession();
    const { currentPlan } = get();
    if (!currentPlan || !isCurrent()) return { success: false, count: 0 };

    set({ error: null });
    const checkedItems = currentPlan.shoppingItems.filter((i) => i.checked);
    try {
      const res = await api.completeWeekShopping(currentPlan.id, checkedItems);
      if (!isCurrent()) return { success: false, count: 0 };
      if (!res.success) throw new Error('Shopping not completed');
      void invalidateWeekDependents();
      void queryClient.invalidateQueries({ queryKey: queryKeys.shoppingList() });
      return { success: true, count: res.importedItemsCount ?? checkedItems.length, ...(res.pendingSync !== undefined ? { pendingSync: res.pendingSync } : {}) };
    } catch {
      if (!isCurrent()) return { success: false, count: 0 };
      const error = 'Không thể nhập nguyên liệu vào tủ lạnh. Vui lòng thử lại.';
      if (get().currentPlan?.id === currentPlan.id) set({ error });
      throw new Error(error);
    }
  },
}));

onPrivateSessionReset(() => {
  shoppingEdits.clear();
  useWeekStore.setState(useWeekStore.getInitialState());
});

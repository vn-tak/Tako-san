import type { RecipeIngredientAvailability } from './legacy-availability';
import { StandardUnit } from '@frigo/domain';

export type CuisineType = 'vietnamese' | 'korean' | 'japanese' | 'chinese' | 'thai' | 'italian';

export interface RecipeIngredient {
  ingredientId: string; // Canonical ID (e.g. 'PORK_BELLY')
  name: string;
  requiredQuantity: number;
  unit: StandardUnit;
  isOptional?: boolean;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  tip?: string;
  timerMinutes?: number;
}

export type VietnameseCategory =
  | 'mon_canh'
  | 'mon_kho'
  | 'mon_xao'
  | 'mon_chien'
  | 'mon_hap_luoc'
  | 'mon_cuon_nom'
  | 'mon_bun_pho'
  | 'mon_chay'
  | 'mon_nhanh_sang'
  | 'mon_lau_tiec';

export type CulinaryRegion = 'bac' | 'trung' | 'nam' | 'toan_quoc';

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description: string;
  cuisine: CuisineType;
  category?: VietnameseCategory | string;
  region?: CulinaryRegion;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl: string;
  nutrition?: {
    calories: number;
    proteinG: number;
    fatG: number;
    carbG: number;
  };
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tags: string[];
}

export interface RecipeScoringContext {
  inventory: Array<{
    id?: string;
    ingredientId: string;
    quantity: number;
    unit: StandardUnit;
    freshness?: 'fresh' | 'use_soon' | 'expiring' | 'out_of_stock';
  }>;
  preferredCuisines?: CuisineType[];
  maxCookTimeMinutes?: number;
  onlyNoBuyNeeded?: boolean; // "Không mua thêm gì" filter
  recentCookedRecipeIds?: string[];
}

export interface RecipeMatchResult {
  recipe: Recipe;
  score: number; // 0 - 100
  matchPercentage: number; // 0 - 100
  availableIngredientCount: number;
  missingRequiredIngredients: RecipeIngredient[];
  expiringIngredientsUsed: string[];
  canCookWithoutBuying: boolean;
  ingredientAvailability?: RecipeIngredientAvailability[];
}

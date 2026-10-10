import {
  createRecipeAvailabilityIndex,
  type Recipe,
  type RecipeScoringContext,
} from '@frigo/recipes';
import {
  createAvailabilitySession,
  type IngredientAvailability,
  type StandardUnit,
} from '@frigo/domain';
import { ApiError } from '../services/http';
import { presentDomainError } from './inventory-truth';

export interface DeductionDraft {
  ingredientId: string;
  name: string;
  currentQuantity: number;
  quantityDeducted: number;
  remainingQuantity: number;
  unit: StandardUnit;
}
export interface CookingDeduction {
  ingredientId: string;
  name?: string;
  quantityDeducted: number;
  unit: StandardUnit;
}
export const cookingUnitLabel = (unit: string) =>
  ({ piece: 'cái', pack: 'gói', bunch: 'bó', slice: 'lát' })[unit] ?? unit;
export const cookingQuantityText = (quantity: number, unit: string) =>
  `${new Intl.NumberFormat('vi-VN', { maximumSignificantDigits: 15 }).format(quantity)} ${cookingUnitLabel(unit)}`;

export function reviewCookingDeductions(
  recipe: Recipe,
  inventory: RecipeScoringContext['inventory'],
  inputs: string[],
): { deductions: DeductionDraft[]; errors: Array<string | null> } {
  const errors: Array<string | null> = recipe.ingredients.map((_, index) => {
    const raw = inputs[index] ?? '';
    const value = Number(raw);
    return raw.trim() === ''
      ? 'Nhập lượng đã dùng; nhập 0 nếu không dùng.'
      : !Number.isFinite(value) || value < 0 || value > 100000
        ? 'Nhập số từ 0 đến 100.000.'
        : null;
  });
  const quantities = recipe.ingredients.map((_, index) =>
    errors[index] ? 0 : Number(inputs[index]),
  );
  const availability: IngredientAvailability[] = [];
  try {
    const session = createAvailabilitySession(createRecipeAvailabilityIndex([recipe], inventory));
    // Required rows retain priority; zero/blank rows inspect stock without reserving it.
    for (const optional of [false, true]) {
      recipe.ingredients.forEach((line, index) => {
        if (Boolean(line.isOptional) !== optional) return;
        const demand = { ...line, requiredQuantity: quantities[index] || 1 };
        availability[index] = quantities[index] > 0 ? session.take(demand) : session.peek(demand);
      });
    }
  } catch {
    return {
      deductions: recipe.ingredients.map((line) => ({
        ingredientId: line.ingredientId,
        name: line.name,
        unit: line.unit,
        currentQuantity: 0,
        quantityDeducted: 0,
        remainingQuantity: 0,
      })),
      errors: errors.map(
        (error) => error ?? 'Lượng này chưa thể tính chính xác. Hãy kiểm tra lại số đã nhập.',
      ),
    };
  }
  const deductions = recipe.ingredients.map((line, index) => {
    const available = availability[index].availableQuantity;
    const used = quantities[index];
    if (!errors[index] && used > available) {
      errors[index] =
        available === 0 && availability[index].status === 'unresolved'
          ? 'Chưa quy đổi được lượng trong tủ. Nhập 0 hoặc sửa đơn vị ở Tủ lạnh.'
          : `Vượt lượng có thể dùng: ${cookingQuantityText(available, line.unit)}. Hãy kiểm tra lại.`;
    }
    return {
      ingredientId: line.ingredientId,
      name: line.name,
      unit: line.unit,
      currentQuantity: available,
      quantityDeducted: used,
      remainingQuantity: Math.max(0, available - used),
    };
  });
  return { deductions, errors };
}

export function cookingFailure(error: unknown): { message: string; recoverable: boolean } {
  if (error instanceof ApiError) {
    if (error.code === 'HARD_CONSTRAINT_CONFLICT')
      return {
        message:
          'Món này không phù hợp với ràng buộc ăn uống hiện tại. Chưa ghi nhận bữa nấu; hãy kiểm tra lựa chọn món.',
        recoverable: false,
      };
    if (error.kind === 'auth')
      return {
        message: 'Phiên hoặc quyền truy cập đã thay đổi. Hãy kiểm tra đăng nhập trước khi thử lại.',
        recoverable: false,
      };
    if (error.code === 'IDEMPOTENCY_CONFLICT')
      return {
        message:
          'Mã yêu cầu đã có dữ liệu khác. Hãy kiểm tra Tủ lạnh trước khi tiếp tục; không gửi một lần trừ mới.',
        recoverable: false,
      };
    if (error.kind === 'http' && [400, 409, 422].includes(error.status ?? 0))
      return {
        message: presentDomainError(
          error.code,
          'Yêu cầu chưa được chấp nhận. Hãy tải lại lượng trong tủ và kiểm tra số đã dùng.',
        ).message,
        recoverable: true,
      };
  }
  return {
    message:
      'Chưa xác nhận được kết quả từ máy chủ. Lượng đã gửi được giữ nguyên; thử lại cùng yêu cầu để tránh trừ hai lần.',
    recoverable: false,
  };
}

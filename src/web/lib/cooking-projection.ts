import { createAvailabilitySession, Quantity, type StandardUnit } from '@frigo/domain';
import { createRecipeAvailabilityIndex, type RecipeScoringContext } from '@frigo/recipes';

interface CookingDeduction {
  ingredientId: string;
  name?: string;
  quantityDeducted: number;
  unit: StandardUnit;
}
type StockLot = RecipeScoringContext['inventory'][number] & { id: string };

/** Pending offline projection; the queued server command remains authoritative. */
export function projectCookingInventory<T extends StockLot>(
  inventory: T[],
  deductions: CookingDeduction[],
): Array<T & { pendingSync?: boolean }> {
  const ingredients = deductions
    .filter((item) => item.quantityDeducted > 0)
    .map((item) => ({
      ingredientId: item.ingredientId,
      name: item.name ?? item.ingredientId,
      requiredQuantity: item.quantityDeducted,
      unit: item.unit,
    }));
  const session = createAvailabilitySession(
    createRecipeAvailabilityIndex([{ ingredients }], inventory),
  );
  const allocated = new Map<string, Quantity>();
  for (const ingredient of ingredients) {
    for (const lot of session.take(ingredient).lotsUsed) {
      allocated.set(
        lot.lotId,
        (allocated.get(lot.lotId) ?? Quantity.from(0)).add(Quantity.from(lot.quantity)),
      );
    }
  }
  return inventory
    .map((item) => {
      const used = allocated.get(item.id);
      if (!used) return item;
      return {
        ...item,
        quantity: Quantity.from(item.quantity).subtract(used).toNumber(),
        pendingSync: true,
      };
    })
    .filter((item) => item.quantity > 0);
}

export const SHOPPING_UNITS = [
  { value: 'piece', label: 'Cái / quả / bìa' },
  { value: 'g', label: 'Gam (g)' },
  { value: 'kg', label: 'Kilôgam (kg)' },
  { value: 'ml', label: 'Mililít (ml)' },
  { value: 'l', label: 'Lít (l)' },
  { value: 'bunch', label: 'Bó' },
  { value: 'pack', label: 'Gói' },
  { value: 'slice', label: 'Lát' },
] as const;
export function parseShoppingForm(name: string, quantity: string, unit: string) {
  const amount = quantity.trim() === '' ? NaN : Number(quantity);
  if (
    !name.trim() ||
    name.trim().length > 100 ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !SHOPPING_UNITS.some((entry) => entry.value === unit)
  )
    return null;
  return { name: name.trim(), quantity: amount, unit };
}
export function shoppingQuantity(quantity: number, unit: string) {
  const labels: Record<string, string> = {
    piece: 'cái / quả / bìa',
    bunch: 'bó',
    pack: 'gói',
    slice: 'lát',
  };
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 12 }).format(quantity)} ${labels[unit] ?? unit}`;
}

import { VIETNAMESE_DISH_IMAGES } from './vietnamese-images';

// See the UI03 mapping audit. These URLs have no dish-specific review evidence.
const unreviewedPhotos = new Set(Object.values(VIETNAMESE_DISH_IMAGES));
const mismatches: Record<string, string> = {
  'gl-07': '/frigo/recipes/global/kimchi-fried-rice.webp',
  'gl-08': '/frigo/recipes/global/kimchi-fried-rice.webp',
  'gl-09': '/frigo/recipes/global/oyakodon.webp',
  'gl-10': '/frigo/recipes/global/pad-krapow.webp',
  'gl-11': '/frigo/recipes/global/carbonara.webp',
  'gl-12': '/frigo/recipes/vietnam/dau-phu-sot-ca-chua.webp',
};
export function legacyRecipeImageIssue(recipe: {
  id?: string;
  imageUrl: string;
}): 'generic_illustration' | 'unreviewed_photo' | 'wrong_dish_or_missing_file' | null {
  const url = recipe.imageUrl.trim();
  if (url === '/frigo/illustrations/delicious-meal.png') return 'generic_illustration';
  if (unreviewedPhotos.has(url)) return 'unreviewed_photo';
  if (recipe.id && mismatches[recipe.id] === url) return 'wrong_dish_or_missing_file';
  return null;
}

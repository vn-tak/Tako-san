import { test, expect } from '@playwright/test';

test('H: controlled T20 OFF or UI-on/server-off preserves V1 weekly/detail/shopping behavior', async ({ page }) => {
  const compositionReads: number[] = [];
  page.on('response', (response) => { if (response.url().endsWith('/compositions')) compositionReads.push(response.status()); });
  await page.goto('/__preview');
  await page.getByRole('button', { name: 'Đặt lại dữ liệu thử nghiệm và đăng nhập' }).click();
  await page.waitForURL('**/planner');
  await page.getByRole('combobox', { name: 'Language' }).selectOption('en');
  await page.getByRole('link', { name: 'Plan a new week', exact: true }).click();
  await page.getByRole('button', { name: 'Generate plan', exact: true }).click();
  await expect(page.getByTestId('planned-meal').first()).toBeVisible();
  await page.getByTestId('planned-meal').first().getByRole('link').click();
  await expect(page.getByRole('button', { name: 'Swap meal', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Complete this meal', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ingredients for this meal', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Shopping', exact: true }).click();
  await page.getByRole('button', { name: 'Prepare shopping list', exact: true }).click();
  await expect(page.getByTestId('shopping-result')).toBeVisible();
  if (process.env.T20_FLAG_DRILL === 'off') expect(compositionReads).toEqual([]);
  else { expect(compositionReads.length).toBeGreaterThan(0); expect(compositionReads.every((status) => status === 404)).toBe(true); }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

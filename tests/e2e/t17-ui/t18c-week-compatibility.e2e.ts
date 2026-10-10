import { test, expect, reset } from '../t13b/fixtures';

test('flag-off Week setup keeps native keyboard selections and unchanged progression', async ({
  page,
}, info) => {
  // The isolated Preview normally enables Planner; exercise the supported fallback.
  await page.route('**/src/web/features/planner/feature.ts*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: 'export const isMealPlannerEnabled = () => false;',
    }),
  );
  await reset(page);
  await page.goto('/week/setup');
  await expect(page.getByRole('heading', { name: 'Một tuần ăn uống, có kế hoạch.' })).toBeVisible();
  const meals = page.getByRole('radio', { name: /Sáng, trưa và tối/ });
  await meals.press('Space');
  await expect(meals).toBeChecked();
  await page.screenshot({ path: info.outputPath('week-setup-meals.png'), fullPage: true });
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).press('Enter');
  const budget = page.getByRole('radio', { name: 'Không giới hạn ngân sách', exact: true });
  await budget.press('Space');
  await expect(budget).toBeChecked();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).press('Enter');
  const priority = page.getByRole('checkbox', { name: 'Tiết kiệm chi phí', exact: true });
  await priority.press('Space');
  await expect(priority).toBeChecked();
  await page.getByRole('button', { name: 'Tiếp tục', exact: true }).press('Enter');
  const frequency = page.getByRole('radio', { name: /2 lần/ });
  await frequency.press('Space');
  await expect(frequency).toBeChecked();
  await expect(page.getByRole('button', { name: 'Tạo thực đơn tuần', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/week\/setup$/);
  await page.screenshot({ path: info.outputPath('week-setup-frequency.png'), fullPage: true });
});

import { expect, test } from '@playwright/test';

test.describe('feature flags', () => {
  test('shows the environment', async ({ page }) => {
    await page.goto('/flags');
    await expect(page.getByTestId('environment')).toHaveText('staging');
  });

  test('fully rolled out flags are on for everyone', async ({ page }) => {
    await page.goto('/flags');
    const row = page.locator('[data-flag="playlist-v2"]');
    await expect(row.locator('td', { hasText: /^off$/ })).toHaveCount(0);
  });

  test('overridden flags are marked and on', async ({ page }) => {
    await page.goto('/flags');
    const row = page.locator('[data-flag="mood-heatmap"]');
    await expect(row).toContainText('(override)');
    await expect(row.locator('td', { hasText: /^off$/ })).toHaveCount(0);
  });
});

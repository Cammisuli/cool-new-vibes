import { expect, test } from '@playwright/test';

test.describe('dashboard', () => {
  test('shows headline stats', async ({ page }) => {
    await page.goto('/');
    const stats = page.getByTestId('stats');
    await expect(stats.getByTestId('stat-tile')).toHaveCount(4);
    await expect(stats).toContainText('Vibes51');
    await expect(stats).toContainText('Needs review3');
  });

  test('mood mix adds up to ~100%', async ({ page }) => {
    await page.goto('/');
    const cells = await page.getByTestId('mood-mix').locator('td:nth-child(2)').allTextContents();
    const total = cells.reduce((sum, c) => sum + parseFloat(c), 0);
    expect(total).toBeGreaterThan(99.5);
    expect(total).toBeLessThan(100.5);
  });

  test('funnel narrows at each step', async ({ page }) => {
    await page.goto('/');
    const counts = (await page.getByTestId('funnel').locator('td:nth-child(2)').allTextContents()).map(Number);
    expect(counts).toEqual([40, 30, 20, 10]);
  });

  test('activity lists days', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('activity')).toContainText('2026-06-01');
  });
});

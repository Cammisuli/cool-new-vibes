import { expect, test } from '@playwright/test';

test.describe('feed', () => {
  test('shows the top 20 vibes', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'The vibe right now' })).toBeVisible();
    await expect(page.getByTestId('vibe-card')).toHaveCount(20);
  });

  test('shows the dominant mood', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dominant-mood').getByTestId('mood-badge')).toHaveText(/^#\w+$/);
  });

  test('filters by mood', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mood-filters').getByRole('link', { name: 'chill' }).click();
    await expect(page).toHaveURL(/mood=chill/);
    const badges = page.getByTestId('feed').getByTestId('mood-badge');
    await expect(badges.first()).toHaveText('#chill');
    for (const text of await badges.allTextContents()) expect(text).toBe('#chill');
  });

  test('reactions are rendered on cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('vibe-card').first().getByRole('button').first()).toBeVisible();
  });
});

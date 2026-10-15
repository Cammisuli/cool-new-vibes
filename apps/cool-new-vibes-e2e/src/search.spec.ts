import { expect, test } from '@playwright/test';

test.describe('search', () => {
  test('finds vibes by keyword', async ({ page }) => {
    await page.goto('/search');
    await page.getByLabel('query').fill('rain');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL(/q=rain/);
    await expect(page.getByTestId('results').getByTestId('vibe-card').first()).toContainText('rain');
  });

  test('tolerates typos', async ({ page }) => {
    await page.goto('/search?q=sunshne');
    await expect(page.getByTestId('results')).toContainText('sunshine');
  });

  test('searches by mood hashtag', async ({ page }) => {
    await page.goto('/search?q=%23focused');
    await expect(page.getByTestId('result-count')).toContainText('results for "#focused"');
    for (const text of await page.getByTestId('results').getByTestId('mood-badge').allTextContents()) {
      expect(text).toBe('#focused');
    }
  });

  test('shows zero results for nonsense', async ({ page }) => {
    await page.goto('/search?q=zzzzzzzz');
    await expect(page.getByTestId('result-count')).toHaveText('0 results for "zzzzzzzz"');
  });
});

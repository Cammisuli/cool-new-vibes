import { expect, test } from '@playwright/test';

test.describe('moderation', () => {
  test('lists flagged vibes, riskiest first', async ({ page }) => {
    await page.goto('/moderation');
    await expect(page.getByTestId('queue-size')).toHaveText('3 vibes need attention');
    const rows = page.getByTestId('queue').locator('tr');
    await expect(rows.first()).toContainText('FREE CRYPTO');
    await expect(rows.first()).toHaveAttribute('data-verdict', 'reject');
  });

  test('explains why a vibe was flagged', async ({ page }) => {
    await page.goto('/moderation');
    await expect(page.getByTestId('queue')).toContainText('repeated characters');
  });

  test('queue api matches the page', async ({ request }) => {
    const body = await (await request.get('/api/moderation-queue')).json();
    expect(body.queue).toHaveLength(3);
  });
});

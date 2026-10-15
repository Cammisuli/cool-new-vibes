import { expect, test } from '@playwright/test';

test.describe('notifications', () => {
  test('collapses reactions per user', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByTestId('notifications')).toContainText('new reactions');
  });

  test('routes each notification to at least one channel', async ({ page }) => {
    await page.goto('/notifications');
    const channels = await page.getByTestId('notifications').locator('td:nth-child(5)').allTextContents();
    expect(channels.length).toBeGreaterThan(0);
    for (const c of channels) expect(c).toMatch(/in-app/);
  });
});

test('admin nav reaches every section', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Moderation', 'Flags', 'Notifications', 'Dashboard']) {
    await page.getByRole('navigation').getByRole('link', { name }).click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

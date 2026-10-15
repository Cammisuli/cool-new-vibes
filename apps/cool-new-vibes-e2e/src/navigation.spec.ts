import { expect, test } from '@playwright/test';

test('top nav links work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Playlists' }).click();
  await expect(page).toHaveURL(/\/playlists\/chill$/);
  await page.getByRole('navigation').getByRole('link', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/search$/);
  await page.getByRole('navigation').getByRole('link', { name: 'Feed' }).click();
  await expect(page.getByRole('heading', { name: 'The vibe right now' })).toBeVisible();
});

test('has a title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('cool new vibes');
});

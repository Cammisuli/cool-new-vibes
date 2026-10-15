import { expect, test } from '@playwright/test';

const moods = ['euphoric', 'chill', 'melancholy', 'focused', 'chaotic', 'cozy'];

test.describe('playlists', () => {
  for (const mood of moods) {
    test(`builds a ${mood} playlist under 15 minutes`, async ({ page }) => {
      await page.goto(`/playlists/${mood}`);
      await expect(page.getByRole('heading', { name: `Playlist for #${mood}` })).toBeVisible();
      const summary = page.getByTestId('playlist-summary');
      await expect(summary).toHaveText(/^\d+ tracks · \d+:\d\d · fit \d+%$/);
      const minutes = (await summary.innerText()).split(' · ')[1].split(':')[0];
      expect(Number(minutes)).toBeLessThan(15);
    });
  }

  test('euphoric playlist includes Neon Rain', async ({ page }) => {
    await page.goto('/playlists/euphoric');
    await expect(page.getByTestId('playlist-tracks')).toContainText('Neon Rain');
  });

  test('unknown moods 404', async ({ page }) => {
    const res = await page.goto('/playlists/grumpy');
    expect(res?.status()).toBe(404);
  });
});

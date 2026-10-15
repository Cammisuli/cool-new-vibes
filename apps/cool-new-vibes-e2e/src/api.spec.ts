import { expect, test } from '@playwright/test';

test.describe('public api', () => {
  test('GET /api/vibes returns ranked vibes', async ({ request }) => {
    const res = await request.get('/api/vibes?limit=7');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.vibes).toHaveLength(7);
  });

  test('GET /api/vibes filters by mood', async ({ request }) => {
    const body = await (await request.get('/api/vibes?mood=cozy')).json();
    expect(body.vibes.every((v: { mood: string }) => v.mood === 'cozy')).toBe(true);
  });

  test('GET /api/vibes validates input', async ({ request }) => {
    expect((await request.get('/api/vibes?mood=grumpy')).status()).toBe(400);
    expect((await request.get('/api/vibes?limit=0')).status()).toBe(400);
  });

  test('GET /api/playlist builds a playlist', async ({ request }) => {
    const body = await (await request.get('/api/playlist?mood=focused&minutes=20')).json();
    expect(body.playlist.mood).toBe('focused');
    expect(body.playlist.durationSec).toBeLessThanOrEqual(1200);
  });
});

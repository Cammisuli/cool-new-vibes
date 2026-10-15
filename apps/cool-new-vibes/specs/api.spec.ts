import { GET as getVibes } from '../src/app/api/vibes/route';
import { GET as getPlaylist } from '../src/app/api/playlist/route';

describe('GET /api/vibes', () => {
  it('returns ranked vibes', async () => {
    const res = await getVibes(new Request('http://x/api/vibes?limit=5'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.vibes).toHaveLength(5);
  });

  it('rejects unknown moods', async () => {
    const res = await getVibes(new Request('http://x/api/vibes?mood=grumpy'));
    expect(res.status).toBe(400);
  });

  it('rejects bad limits', async () => {
    const res = await getVibes(new Request('http://x/api/vibes?limit=500'));
    expect(res.status).toBe(400);
  });
});

describe('GET /api/playlist', () => {
  it('builds a playlist', async () => {
    const res = await getPlaylist(new Request('http://x/api/playlist?mood=chill&minutes=10'));
    const body = await res.json();
    expect(body.playlist.mood).toBe('chill');
    expect(body.playlist.durationSec).toBeLessThanOrEqual(600);
  });
});

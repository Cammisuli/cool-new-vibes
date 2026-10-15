import { isMood } from '@cool-new-vibes/vibe-model';
import { rankFeed } from '@cool-new-vibes/vibe-scoring';
import { NOW, vibes } from '../../../lib/data';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mood = url.searchParams.get('mood');
  const limit = Number(url.searchParams.get('limit') ?? 20);
  if (mood !== null && !isMood(mood)) {
    return Response.json({ error: `unknown mood "${mood}"` }, { status: 400 });
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return Response.json({ error: 'limit must be an integer from 1 to 100' }, { status: 400 });
  }
  const filtered = mood ? vibes.filter((v) => v.mood === mood) : vibes;
  return Response.json({ vibes: rankFeed(filtered, { now: NOW }).slice(0, limit) });
}

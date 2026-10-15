import { buildPlaylist } from '@cool-new-vibes/playlist-engine';
import { isMood } from '@cool-new-vibes/vibe-model';
import { tracks } from '../../../lib/data';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mood = url.searchParams.get('mood');
  const minutes = Number(url.searchParams.get('minutes') ?? 15);
  if (!isMood(mood)) {
    return Response.json({ error: `unknown mood "${mood}"` }, { status: 400 });
  }
  return Response.json({ playlist: buildPlaylist(tracks, { mood, targetMinutes: minutes }) });
}

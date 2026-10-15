import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildPlaylist, formatDuration } from '@cool-new-vibes/playlist-engine';
import { MoodBadge } from '@cool-new-vibes/ui';
import { MOODS, isMood } from '@cool-new-vibes/vibe-model';
import { tracks } from '../../../lib/data';

export default async function PlaylistPage({ params }: { params: Promise<{ mood: string }> }) {
  const { mood } = await params;
  if (!isMood(mood)) notFound();
  const playlist = buildPlaylist(tracks, { mood, targetMinutes: 15 });

  return (
    <main className="stack">
      <h1>
        Playlist for <MoodBadge mood={mood} />
      </h1>
      <div className="row">
        {MOODS.map((m) => (
          <Link key={m} href={`/playlists/${m}`}>
            {m}
          </Link>
        ))}
      </div>
      <p data-testid="playlist-summary">
        {playlist.tracks.length} tracks · {formatDuration(playlist.durationSec)} · fit{' '}
        {Math.round(playlist.averageFit * 100)}%
      </p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Artist</th>
            <th>BPM</th>
            <th>Length</th>
          </tr>
        </thead>
        <tbody data-testid="playlist-tracks">
          {playlist.tracks.map((t, i) => (
            <tr key={t.id}>
              <td>{i + 1}</td>
              <td>{t.title}</td>
              <td>{t.artist}</td>
              <td>{t.bpm}</td>
              <td>{formatDuration(t.durationSec)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {playlist.tracks.length === 0 && <p>No tracks match this mood yet.</p>}
    </main>
  );
}

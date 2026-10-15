import type { Mood, Track } from '@cool-new-vibes/vibe-model';
import { trackMoodFit } from '@cool-new-vibes/vibe-scoring';

export interface PlaylistOptions {
  mood: Mood;
  targetMinutes: number;
  maxPerArtist?: number;
  minFit?: number;
}

export interface Playlist {
  mood: Mood;
  tracks: Track[];
  durationSec: number;
  averageFit: number;
}

/**
 * Greedy playlist builder: picks best-fitting tracks under the time budget,
 * caps tracks per artist, then orders them to smooth BPM transitions.
 */
export function buildPlaylist(library: Track[], options: PlaylistOptions): Playlist {
  const { mood, targetMinutes, maxPerArtist = 2, minFit = 0.4 } = options;
  const budget = targetMinutes * 60;
  const candidates = library
    .map((track) => ({ track, fit: trackMoodFit(track, mood) }))
    .filter((c) => c.fit >= minFit)
    .sort((a, b) => b.fit - a.fit || a.track.id.localeCompare(b.track.id));

  const perArtist = new Map<string, number>();
  const picked: { track: Track; fit: number }[] = [];
  let duration = 0;
  for (const c of candidates) {
    const count = perArtist.get(c.track.artist) ?? 0;
    if (count >= maxPerArtist) continue;
    if (duration + c.track.durationSec > budget) continue;
    picked.push(c);
    perArtist.set(c.track.artist, count + 1);
    duration += c.track.durationSec;
  }

  const ordered = smoothTransitions(picked.map((p) => p.track));
  const averageFit =
    picked.length === 0 ? 0 : picked.reduce((s, p) => s + p.fit, 0) / picked.length;
  return { mood, tracks: ordered, durationSec: duration, averageFit };
}

/** Nearest-neighbour ordering by BPM, starting from the slowest track. */
export function smoothTransitions(tracks: Track[]): Track[] {
  if (tracks.length <= 2) return [...tracks].sort((a, b) => a.bpm - b.bpm);
  const remaining = [...tracks].sort((a, b) => a.bpm - b.bpm);
  const ordered = remaining.splice(0, 1);
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let bestIndex = 0;
    for (let i = 1; i < remaining.length; i++) {
      if (Math.abs(remaining[i].bpm - last.bpm) < Math.abs(remaining[bestIndex].bpm - last.bpm)) {
        bestIndex = i;
      }
    }
    ordered.push(remaining.splice(bestIndex, 1)[0]);
  }
  return ordered;
}

export function totalBpmJump(tracks: Track[]): number {
  let total = 0;
  for (let i = 1; i < tracks.length; i++) total += Math.abs(tracks[i].bpm - tracks[i - 1].bpm);
  return total;
}

export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

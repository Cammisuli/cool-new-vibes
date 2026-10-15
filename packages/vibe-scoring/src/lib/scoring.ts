import type { Mood, Track, Vibe } from '@cool-new-vibes/vibe-model';
import { HOUR, decay } from '@cool-new-vibes/time';

/** Target audio profile for each mood: [energy, valence]. */
export const MOOD_PROFILES: Record<Mood, { energy: number; valence: number }> = {
  euphoric: { energy: 0.85, valence: 0.85 },
  chill: { energy: 0.25, valence: 0.6 },
  melancholy: { energy: 0.3, valence: 0.15 },
  focused: { energy: 0.5, valence: 0.45 },
  chaotic: { energy: 0.95, valence: 0.55 },
  cozy: { energy: 0.35, valence: 0.8 },
};

/** 0..1, how well a track fits a mood (1 = perfect). */
export function trackMoodFit(track: Track, mood: Mood): number {
  const target = MOOD_PROFILES[mood];
  const distance = Math.hypot(track.energy - target.energy, track.valence - target.valence);
  return Math.max(0, 1 - distance / Math.SQRT2);
}

export function bestMoodForTrack(track: Track): Mood {
  let best: Mood = 'chill';
  let bestFit = -1;
  for (const mood of Object.keys(MOOD_PROFILES) as Mood[]) {
    const fit = trackMoodFit(track, mood);
    if (fit > bestFit) {
      best = mood;
      bestFit = fit;
    }
  }
  return best;
}

export function totalReactions(vibe: Vibe): number {
  return Object.values(vibe.reactions).reduce((sum, n) => sum + n, 0);
}

export interface HotnessOptions {
  now: Date;
  halfLifeHours?: number;
}

/** Ranking score for feeds: engagement and intensity, decayed by age. */
export function hotness(vibe: Vibe, { now, halfLifeHours = 6 }: HotnessOptions): number {
  const age = now.getTime() - Date.parse(vibe.createdAt);
  const engagement = Math.log2(2 + totalReactions(vibe));
  const intensity = 0.5 + vibe.intensity / 20;
  return engagement * intensity * decay(age, halfLifeHours * HOUR);
}

export function rankFeed(vibes: Vibe[], options: HotnessOptions): Vibe[] {
  return vibes
    .map((vibe) => ({ vibe, score: hotness(vibe, options) }))
    .sort((a, b) => b.score - a.score || a.vibe.id.localeCompare(b.vibe.id))
    .map(({ vibe }) => vibe);
}

/** Distribution of moods (0..1 shares) weighted by intensity. */
export function moodBreakdown(vibes: Vibe[]): Record<Mood, number> {
  const totals = Object.fromEntries(
    Object.keys(MOOD_PROFILES).map((m) => [m, 0]),
  ) as Record<Mood, number>;
  let sum = 0;
  for (const vibe of vibes) {
    totals[vibe.mood] += vibe.intensity;
    sum += vibe.intensity;
  }
  if (sum === 0) return totals;
  for (const mood of Object.keys(totals) as Mood[]) {
    totals[mood] = totals[mood] / sum;
  }
  return totals;
}

export function dominantMood(vibes: Vibe[]): Mood | undefined {
  if (vibes.length === 0) return undefined;
  const breakdown = moodBreakdown(vibes);
  return (Object.entries(breakdown) as [Mood, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

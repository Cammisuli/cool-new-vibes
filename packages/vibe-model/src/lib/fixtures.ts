import type { Mood, Track, User, Vibe } from './types.js';

export const sampleUsers: User[] = [
  { id: 'u1', handle: 'nova', displayName: 'Nova', joinedAt: '2025-11-02T10:00:00Z', role: 'admin' },
  { id: 'u2', handle: 'driftwood', displayName: 'Drift Wood', joinedAt: '2026-01-14T08:30:00Z', role: 'moderator' },
  { id: 'u3', handle: 'lofi_lena', displayName: 'Lena', joinedAt: '2026-02-20T19:45:00Z', role: 'member' },
  { id: 'u4', handle: 'kazoo', displayName: 'Kaz', joinedAt: '2026-04-01T12:00:00Z', role: 'member' },
];

export const sampleTracks: Track[] = [
  { id: 't1', title: 'Neon Rain', artist: 'Glass Animals at Night', durationSec: 214, bpm: 128, energy: 0.86, valence: 0.74, tags: ['synth', 'dance'] },
  { id: 't2', title: 'Slow Tide', artist: 'Harbor', durationSec: 245, bpm: 72, energy: 0.22, valence: 0.55, tags: ['ambient', 'lofi'] },
  { id: 't3', title: 'Grey Window', artist: 'Paper Lungs', durationSec: 198, bpm: 84, energy: 0.31, valence: 0.12, tags: ['indie', 'sad'] },
  { id: 't4', title: 'Deep Work', artist: 'Monotone', durationSec: 360, bpm: 110, energy: 0.48, valence: 0.45, tags: ['instrumental', 'focus'] },
  { id: 't5', title: 'Feral Hours', artist: 'Static Kids', durationSec: 176, bpm: 172, energy: 0.97, valence: 0.6, tags: ['punk', 'dnb'] },
  { id: 't6', title: 'Cinnamon Steam', artist: 'Kettle Club', durationSec: 222, bpm: 90, energy: 0.35, valence: 0.8, tags: ['acoustic', 'warm'] },
  { id: 't7', title: 'Afterglow Avenue', artist: 'Glass Animals at Night', durationSec: 201, bpm: 122, energy: 0.78, valence: 0.88, tags: ['synth', 'pop'] },
  { id: 't8', title: 'Low Orbit', artist: 'Harbor', durationSec: 288, bpm: 64, energy: 0.15, valence: 0.4, tags: ['ambient'] },
];

const texts: Record<Mood, string[]> = {
  euphoric: ['just shipped to prod on a friday and it WORKED', 'sunshine + new sneakers'],
  chill: ['rain on the window, tea in hand', 'sunday reset complete'],
  melancholy: ['missing summer already', 'the cache was cold and so am I'],
  focused: ['four hours of deep work, zero slack pings', 'flow state unlocked'],
  chaotic: ['three deploys, two rollbacks, one coffee', 'my tabs have tabs'],
  cozy: ['blanket fort engineering', 'soup weather'],
};

export function makeVibes(count: number, start = new Date('2026-06-01T00:00:00Z')): Vibe[] {
  const moods = Object.keys(texts) as Mood[];
  return Array.from({ length: count }, (_, i) => {
    const mood = moods[i % moods.length];
    const options = texts[mood];
    return {
      id: `v${i + 1}`,
      authorId: sampleUsers[i % sampleUsers.length].id,
      mood,
      intensity: (i % 10) + 1,
      text: options[Math.floor(i / moods.length) % options.length],
      trackId: sampleTracks[i % sampleTracks.length].id,
      createdAt: new Date(start.getTime() + i * 37 * 60_000).toISOString(),
      reactions: { '🔥': (i * 7) % 13, '💜': (i * 3) % 5 },
    };
  });
}

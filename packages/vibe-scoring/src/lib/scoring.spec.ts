import { makeVibes, sampleTracks, type Vibe } from '@cool-new-vibes/vibe-model';
import {
  bestMoodForTrack,
  dominantMood,
  hotness,
  moodBreakdown,
  rankFeed,
  trackMoodFit,
} from './scoring.js';

const now = new Date('2026-06-02T00:00:00Z');
const track = (id: string) => {
  const found = sampleTracks.find((t) => t.id === id);
  if (!found) throw new Error(`No fixture track "${id}"`);
  return found;
};

describe('track fit', () => {
  it('fits are bounded 0..1', () => {
    for (const t of sampleTracks) {
      const fit = trackMoodFit(t, 'chill');
      expect(fit).toBeGreaterThanOrEqual(0);
      expect(fit).toBeLessThanOrEqual(1);
    }
  });

  it.each([
    ['t1', 'euphoric'],
    ['t2', 'chill'],
    ['t3', 'melancholy'],
    ['t4', 'focused'],
    ['t5', 'chaotic'],
    ['t6', 'cozy'],
  ])('track %s is best for %s', (id, mood) => {
    expect(bestMoodForTrack(track(id))).toBe(mood);
  });
});

describe('hotness', () => {
  const base: Vibe = makeVibes(1)[0];

  it('newer vibes beat older ones with equal engagement', () => {
    const fresh = { ...base, createdAt: '2026-06-01T23:00:00Z' };
    const stale = { ...base, createdAt: '2026-06-01T01:00:00Z' };
    expect(hotness(fresh, { now })).toBeGreaterThan(hotness(stale, { now }));
  });

  it('reactions increase score', () => {
    const quiet = { ...base, reactions: {} };
    const loud = { ...base, reactions: { '🔥': 100 } };
    expect(hotness(loud, { now })).toBeGreaterThan(hotness(quiet, { now }));
  });

  it('ranks deterministically', () => {
    const vibes = makeVibes(30);
    const a = rankFeed(vibes, { now }).map((v) => v.id);
    const b = rankFeed([...vibes].reverse(), { now }).map((v) => v.id);
    expect(a).toEqual(b);
    expect(a).toHaveLength(30);
  });
});

describe('mood breakdown', () => {
  it('sums to 1', () => {
    const shares = Object.values(moodBreakdown(makeVibes(24)));
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });

  it('is all zeros for empty input', () => {
    expect(Object.values(moodBreakdown([])).every((v) => v === 0)).toBe(true);
    expect(dominantMood([])).toBeUndefined();
  });

  it('finds the dominant mood', () => {
    const vibes = makeVibes(6).map((v) => ({ ...v, intensity: v.mood === 'cozy' ? 10 : 1 }));
    expect(dominantMood(vibes)).toBe('cozy');
  });
});

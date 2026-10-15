import { makeVibes, sampleTracks } from './fixtures.js';
import { isMood, validateTrack, validateVibe } from './validate.js';

describe('validateVibe', () => {
  const good = makeVibes(1)[0];

  it('accepts a valid vibe and trims text', () => {
    const result = validateVibe({ ...good, text: '  hi  ' });
    expect(result).toEqual({ ok: true, value: { ...good, text: 'hi' } });
  });

  it('reports every issue at once', () => {
    const result = validateVibe({ mood: 'angry' as never, intensity: 11, text: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((i) => i.field).sort()).toEqual(
        ['authorId', 'createdAt', 'id', 'intensity', 'mood', 'text'].sort(),
      );
    }
  });

  it('rejects text that is too long', () => {
    const result = validateVibe({ ...good, text: 'x'.repeat(281) });
    expect(result.ok).toBe(false);
  });

  it('rejects fractional intensity', () => {
    expect(validateVibe({ ...good, intensity: 2.5 }).ok).toBe(false);
  });
});

describe('validateTrack', () => {
  it('accepts every fixture track', () => {
    for (const track of sampleTracks) {
      expect(validateTrack(track).ok).toBe(true);
    }
  });

  it('rejects out of range audio features', () => {
    const result = validateTrack({ ...sampleTracks[0], energy: 2, bpm: 5 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((i) => i.field)).toEqual(['bpm', 'energy']);
    }
  });
});

describe('fixtures', () => {
  it('generates valid vibes', () => {
    for (const vibe of makeVibes(50)) {
      expect(validateVibe(vibe).ok).toBe(true);
    }
  });

  it('isMood narrows strings', () => {
    expect(isMood('cozy')).toBe(true);
    expect(isMood('grumpy')).toBe(false);
  });
});

import { makeVibes, type Vibe } from '@cool-new-vibes/vibe-model';
import { buildQueue, capsRatio, longestRun, moderate } from './moderation.js';

const base: Vibe = { ...makeVibes(1)[0], reactions: {} };
const withText = (text: string, extra: Partial<Vibe> = {}): Vibe => ({ ...base, text, ...extra });

describe('moderate', () => {
  it('approves normal vibes', () => {
    expect(moderate(withText('soup weather')).verdict).toBe('approve');
  });

  it('rejects blocked terms', () => {
    const result = moderate(withText('FREE CRYPTO for everyone'));
    expect(result.verdict).toBe('reject');
    expect(result.reasons).toContain('blocked term: "free crypto"');
  });

  it('flags link spam for review', () => {
    const result = moderate(withText('see http://a.com and https://b.com'));
    expect(result.verdict).toBe('review');
  });

  it('flags shouting and repeated chars', () => {
    const result = moderate(withText('WHY IS EVERYTHING ON FIREEEEEEEE'));
    expect(result.reasons).toEqual(['excessive caps', 'repeated characters']);
    expect(result.verdict).toBe('review');
  });

  it('gives popular vibes the benefit of the doubt', () => {
    const loud = withText('THIS DEPLOY IS AMAZING', { reactions: { '🔥': 40 } });
    expect(moderate(loud).verdict).toBe('approve');
  });
});

describe('helpers', () => {
  it('capsRatio ignores short text', () => {
    expect(capsRatio('OK')).toBe(0);
    expect(capsRatio('HELLO WORLD')).toBe(1);
  });
  it('longestRun counts repeated chars', () => {
    expect(longestRun('heyyyy')).toBe(4);
    expect(longestRun('')).toBe(0);
  });
});

describe('buildQueue', () => {
  it('only includes non-approved vibes sorted by risk', () => {
    const vibes = [
      withText('soup weather', { id: 'ok' }),
      withText('click here to buy followers', { id: 'spam' }),
      withText('LOOK AT THIS AMAZING THING', { id: 'shout' }),
    ];
    expect(buildQueue(vibes).map((r) => r.vibeId)).toEqual(['spam', 'shout']);
  });
});

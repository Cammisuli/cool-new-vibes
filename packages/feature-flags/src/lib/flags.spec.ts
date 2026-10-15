import { UnknownFlagError, bucket, createFlagClient } from './flags.js';

const staging = { environment: 'staging' as const, featureFlagOverrides: {} };

describe('bucket', () => {
  it('is stable and in range', () => {
    expect(bucket('abc')).toBe(bucket('abc'));
    for (let i = 0; i < 500; i++) {
      const b = bucket(`user-${i}`);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(100);
    }
  });

  it('distributes roughly evenly', () => {
    let below50 = 0;
    for (let i = 0; i < 2000; i++) if (bucket(`u${i}`) < 50) below50++;
    expect(below50 / 2000).toBeGreaterThan(0.4);
    expect(below50 / 2000).toBeLessThan(0.6);
  });
});

describe('flag client', () => {
  it('enables 100% rollouts for everyone', () => {
    const flags = createFlagClient(staging);
    expect(flags.isEnabled('playlist-v2', 'anyone')).toBe(true);
  });

  it('respects overrides', () => {
    const flags = createFlagClient({ ...staging, featureFlagOverrides: { 'playlist-v2': false } });
    expect(flags.isEnabled('playlist-v2', 'anyone')).toBe(false);
  });

  it('respects environment restrictions', () => {
    const prod = createFlagClient({ environment: 'production', featureFlagOverrides: {} });
    for (let i = 0; i < 100; i++) {
      expect(prod.isEnabled('mood-heatmap', `u${i}`)).toBe(false);
    }
  });

  it('throws on unknown flags', () => {
    expect(() => createFlagClient(staging).isEnabled('nope', 'u1')).toThrow(UnknownFlagError);
  });

  it('lists enabled flags for a user', () => {
    const flags = createFlagClient(staging);
    expect(flags.enabledFor('u1')).toEqual(expect.arrayContaining(['playlist-v2', 'auto-moderation']));
  });
});

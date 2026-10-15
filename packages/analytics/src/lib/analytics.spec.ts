import { createFlagClient } from '@cool-new-vibes/feature-flags';
import { createLogger, createMemorySink } from '@cool-new-vibes/logger';
import { createTracker, funnel, type AnalyticsEvent } from './analytics.js';

const flags = createFlagClient({ environment: 'staging', featureFlagOverrides: {} });
const logger = createLogger({ scope: 'test', sink: createMemorySink() });

describe('tracker', () => {
  it('batches events and flushes when full', async () => {
    const batches: AnalyticsEvent[][] = [];
    const tracker = createTracker({
      transport: async (b) => void batches.push(b),
      flags,
      logger,
      batchSize: 3,
    });
    for (let i = 0; i < 7; i++) await tracker.track('vibe_posted', `u${i}`);
    expect(batches.map((b) => b.length)).toEqual([3, 3]);
    expect(tracker.pending).toBe(1);
    expect(await tracker.flush()).toBe(1);
  });

  it('attaches enabled flags to events', async () => {
    const batches: AnalyticsEvent[][] = [];
    const tracker = createTracker({ transport: async (b) => void batches.push(b), flags, logger });
    await tracker.track('page_view', 'u1', { path: '/' });
    await tracker.flush();
    expect(batches[0][0].flags).toContain('playlist-v2');
  });

  it('samples events', async () => {
    const tracker = createTracker({
      transport: async () => undefined,
      flags,
      logger,
      sampleRate: 0.5,
      random: (() => {
        let i = 0;
        return () => (i++ % 2 === 0 ? 0.1 : 0.9);
      })(),
    });
    for (let i = 0; i < 10; i++) await tracker.track('x', 'u1');
    expect(tracker.pending).toBe(5);
  });

  it('propagates transport failures', async () => {
    const tracker = createTracker({
      transport: async () => {
        throw new Error('network down');
      },
      flags,
      logger,
      batchSize: 1,
    });
    await expect(tracker.track('x', 'u1')).rejects.toThrow('network down');
  });
});

describe('funnel', () => {
  const ev = (userId: string, name: string, minute: number): AnalyticsEvent => ({
    name,
    userId,
    properties: {},
    flags: [],
    at: `2026-06-01T00:${String(minute).padStart(2, '0')}:00Z`,
  });

  it('counts users reaching each step in order', () => {
    const events = [
      ev('a', 'visit', 1), ev('a', 'signup', 2), ev('a', 'post', 3),
      ev('b', 'visit', 1), ev('b', 'signup', 5),
      ev('c', 'signup', 1), ev('c', 'visit', 2),
    ];
    expect(funnel(events, ['visit', 'signup', 'post'])).toEqual([3, 2, 1]);
  });
});

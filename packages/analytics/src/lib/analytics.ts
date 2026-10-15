import type { FlagClient } from '@cool-new-vibes/feature-flags';
import type { Logger } from '@cool-new-vibes/logger';

export interface AnalyticsEvent {
  name: string;
  userId: string;
  properties: Record<string, string | number | boolean>;
  flags: string[];
  at: string;
}

export type Transport = (batch: AnalyticsEvent[]) => Promise<void>;

export interface TrackerOptions {
  transport: Transport;
  flags: FlagClient;
  logger: Logger;
  batchSize?: number;
  sampleRate?: number;
  random?: () => number;
  now?: () => Date;
}

export function createTracker(options: TrackerOptions) {
  const {
    transport,
    flags,
    logger,
    batchSize = 20,
    sampleRate = 1,
    random = Math.random,
    now = () => new Date(),
  } = options;
  const log = logger.child('analytics');
  let queue: AnalyticsEvent[] = [];

  async function flush(): Promise<number> {
    if (queue.length === 0) return 0;
    const batch = queue;
    queue = [];
    await transport(batch);
    log.debug('flushed analytics batch', { size: batch.length });
    return batch.length;
  }

  return {
    async track(name: string, userId: string, properties: AnalyticsEvent['properties'] = {}) {
      if (random() >= sampleRate) return;
      queue.push({ name, userId, properties, flags: flags.enabledFor(userId), at: now().toISOString() });
      if (queue.length >= batchSize) await flush();
    },
    flush,
    get pending() {
      return queue.length;
    },
  };
}

export function funnel(events: AnalyticsEvent[], steps: string[]): number[] {
  const progress = new Map<string, number>();
  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));
  for (const event of sorted) {
    const reached = progress.get(event.userId) ?? 0;
    if (steps[reached] === event.name) progress.set(event.userId, reached + 1);
  }
  return steps.map((_, i) => [...progress.values()].filter((r) => r > i).length);
}

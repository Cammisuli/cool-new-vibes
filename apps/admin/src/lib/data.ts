import type { AnalyticsEvent } from '@cool-new-vibes/analytics';
import { loadConfig } from '@cool-new-vibes/config';
import { createFlagClient } from '@cool-new-vibes/feature-flags';
import { makeVibes, sampleUsers, type Vibe } from '@cool-new-vibes/vibe-model';

export const NOW = new Date('2026-06-02T12:00:00Z');

const suspicious: Vibe[] = [
  { id: 's1', authorId: 'u4', mood: 'chaotic', intensity: 9, text: 'FREE CRYPTO click here https://x.io https://y.io', createdAt: '2026-06-02T09:00:00Z', reactions: {} },
  { id: 's2', authorId: 'u3', mood: 'euphoric', intensity: 10, text: 'WHY IS NOBODY TALKING ABOUT THISSSSSSSS', createdAt: '2026-06-02T10:00:00Z', reactions: {} },
  { id: 's3', authorId: 'u4', mood: 'chill', intensity: 2, text: 'buy followers cheap, dm me', createdAt: '2026-06-02T11:00:00Z', reactions: {} },
];

export const vibes: Vibe[] = [...makeVibes(48), ...suspicious];
export const users = sampleUsers;

export const config = loadConfig({
  VIBES_ENV: 'staging',
  VIBES_API_URL: 'https://api.staging.coolnewvibes.dev',
  VIBES_FLAGS: 'mood-heatmap=on',
});

export const flags = createFlagClient(config);

/** Synthetic onboarding events: user N gets through the first (N % 4) + 1 steps. */
export const funnelEvents: AnalyticsEvent[] = Array.from({ length: 40 }, (_, n) =>
  ['visit', 'signup', 'first_vibe', 'playlist_play'].slice(0, (n % 4) + 1).map((name, step) => ({
    name,
    userId: `user-${n}`,
    properties: {},
    flags: flags.enabledFor(`user-${n}`),
    at: new Date(NOW.getTime() - (40 - n) * 3_600_000 + step * 60_000).toISOString(),
  })),
).flat();

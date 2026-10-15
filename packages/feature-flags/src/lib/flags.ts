import type { AppConfig } from '@cool-new-vibes/config';

export interface FlagDefinition {
  name: string;
  description: string;
  /** Percentage of users (0..100) that get the flag when no override applies. */
  rollout: number;
  environments?: AppConfig['environment'][];
}

export const FLAGS: FlagDefinition[] = [
  { name: 'playlist-v2', description: 'Smooth-transition playlists', rollout: 100 },
  { name: 'vibe-search', description: 'Typo tolerant search', rollout: 50 },
  { name: 'mood-heatmap', description: 'Mood heatmap on profile', rollout: 10, environments: ['development', 'staging'] },
  { name: 'auto-moderation', description: 'Auto reject high-risk vibes', rollout: 100 },
];

/** FNV-1a hash -> stable bucket in 0..99. */
export function bucket(key: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % 100;
}

export class UnknownFlagError extends Error {
  constructor(name: string) {
    super(`Unknown feature flag "${name}"`);
    this.name = 'UnknownFlagError';
  }
}

export function createFlagClient(
  config: Pick<AppConfig, 'environment' | 'featureFlagOverrides'>,
  definitions: FlagDefinition[] = FLAGS,
) {
  const byName = new Map(definitions.map((d) => [d.name, d]));
  return {
    isEnabled(name: string, userId: string): boolean {
      const def = byName.get(name);
      if (!def) throw new UnknownFlagError(name);
      const override = config.featureFlagOverrides[name];
      if (override !== undefined) return override;
      if (def.environments && !def.environments.includes(config.environment)) return false;
      return bucket(`${name}:${userId}`) < def.rollout;
    },
    enabledFor(userId: string): string[] {
      return definitions.filter((d) => this.isEnabled(d.name, userId)).map((d) => d.name);
    },
  };
}

export type FlagClient = ReturnType<typeof createFlagClient>;

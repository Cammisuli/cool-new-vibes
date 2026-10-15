import { relativeTime } from '@cool-new-vibes/time';
import { makeVibes, sampleTracks, sampleUsers } from '@cool-new-vibes/vibe-model';

/** Fixed clock so pages (and e2e assertions) are deterministic. */
export const NOW = new Date('2026-06-02T12:00:00Z');

export const vibes = makeVibes(48);
export const tracks = sampleTracks;

export function handleFor(userId: string): string {
  const user = sampleUsers.find((u) => u.id === userId);
  if (!user) throw new Error(`No user with id "${userId}"`);
  return user.handle;
}

export function agoFor(createdAt: string): string {
  return relativeTime(new Date(createdAt), NOW);
}

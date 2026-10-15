import { MOODS, type Mood, type Track, type Vibe } from './types.js';

export interface ValidationIssue {
  field: string;
  message: string;
}

export type Result<T> = { ok: true; value: T } | { ok: false; issues: ValidationIssue[] };

export const MAX_VIBE_LENGTH = 280;

export function isMood(value: unknown): value is Mood {
  return typeof value === 'string' && (MOODS as readonly string[]).includes(value);
}

export function validateVibe(input: Partial<Vibe>): Result<Vibe> {
  const issues: ValidationIssue[] = [];
  if (!input.id) issues.push({ field: 'id', message: 'is required' });
  if (!input.authorId) issues.push({ field: 'authorId', message: 'is required' });
  if (!isMood(input.mood)) {
    issues.push({ field: 'mood', message: `must be one of ${MOODS.join(', ')}` });
  }
  if (
    typeof input.intensity !== 'number' ||
    !Number.isInteger(input.intensity) ||
    input.intensity < 1 ||
    input.intensity > 10
  ) {
    issues.push({ field: 'intensity', message: 'must be an integer from 1 to 10' });
  }
  const text = input.text?.trim() ?? '';
  if (text.length === 0) issues.push({ field: 'text', message: 'is required' });
  if (text.length > MAX_VIBE_LENGTH) {
    issues.push({ field: 'text', message: `must be at most ${MAX_VIBE_LENGTH} characters` });
  }
  if (!input.createdAt || Number.isNaN(Date.parse(input.createdAt))) {
    issues.push({ field: 'createdAt', message: 'must be an ISO date' });
  }
  if (issues.length > 0) return { ok: false, issues };
  return {
    ok: true,
    value: { ...(input as Vibe), text, reactions: input.reactions ?? {} },
  };
}

export function validateTrack(input: Partial<Track>): Result<Track> {
  const issues: ValidationIssue[] = [];
  for (const key of ['id', 'title', 'artist'] as const) {
    if (!input[key]) issues.push({ field: key, message: 'is required' });
  }
  if (!input.durationSec || input.durationSec <= 0) {
    issues.push({ field: 'durationSec', message: 'must be positive' });
  }
  if (!input.bpm || input.bpm < 20 || input.bpm > 300) {
    issues.push({ field: 'bpm', message: 'must be between 20 and 300' });
  }
  for (const key of ['energy', 'valence'] as const) {
    const v = input[key];
    if (typeof v !== 'number' || v < 0 || v > 1) {
      issues.push({ field: key, message: 'must be between 0 and 1' });
    }
  }
  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: { ...(input as Track), tags: input.tags ?? [] } };
}

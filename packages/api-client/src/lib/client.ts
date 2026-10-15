import type { Logger } from '@cool-new-vibes/logger';
import { validateVibe, type Mood, type Vibe } from '@cool-new-vibes/vibe-model';

export type Fetch = (input: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    message: string,
  ) {
    super(`${status} ${path}: ${message}`);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  fetch: Fetch;
  logger: Logger;
  token?: string;
}

export interface NewVibe {
  mood: Mood;
  intensity: number;
  text: string;
  trackId?: string;
}

export function createApiClient({ baseUrl, fetch, logger, token }: ApiClientOptions) {
  const log = logger.child('api');

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (token) headers['authorization'] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      log.warn('api request failed', { method, path, status: res.status });
      throw new ApiError(res.status, path, data.error ?? 'request failed');
    }
    return data as T;
  }

  function parseVibe(raw: unknown, path: string): Vibe {
    const result = validateVibe(raw as Partial<Vibe>);
    if (!result.ok) {
      const detail = result.issues.map((i) => `${i.field} ${i.message}`).join('; ');
      throw new ApiError(500, path, `server returned invalid vibe: ${detail}`);
    }
    return result.value;
  }

  return {
    async listVibes(params: { mood?: Mood; limit?: number } = {}): Promise<Vibe[]> {
      const qs = new URLSearchParams();
      if (params.mood) qs.set('mood', params.mood);
      if (params.limit) qs.set('limit', String(params.limit));
      const path = `/vibes${qs.size ? `?${qs}` : ''}`;
      const data = await request<{ vibes: unknown[] }>('GET', path);
      return data.vibes.map((v) => parseVibe(v, path));
    },
    async postVibe(vibe: NewVibe): Promise<Vibe> {
      const data = await request<{ vibe: unknown }>('POST', '/vibes', vibe);
      return parseVibe(data.vibe, '/vibes');
    },
    async react(vibeId: string, emoji: string): Promise<Record<string, number>> {
      const path = `/vibes/${encodeURIComponent(vibeId)}/reactions`;
      const data = await request<{ reactions: Record<string, number> }>('POST', path, { emoji });
      return data.reactions;
    },
  };
}

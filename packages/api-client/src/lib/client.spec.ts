import { createLogger, createMemorySink } from '@cool-new-vibes/logger';
import { makeVibes } from '@cool-new-vibes/vibe-model';
import { ApiError, createApiClient, type Fetch } from './client.js';

const logger = createLogger({ scope: 'test', sink: createMemorySink() });

function fakeFetch(status: number, body: unknown) {
  const calls: { url: string; init?: Parameters<Fetch>[1] }[] = [];
  const fetch: Fetch = async (url, init) => {
    calls.push({ url, init });
    return { ok: status < 400, status, json: async () => body };
  };
  return { fetch, calls };
}

describe('api client', () => {
  it('lists vibes with query params and auth header', async () => {
    const { fetch, calls } = fakeFetch(200, { vibes: makeVibes(3) });
    const api = createApiClient({ baseUrl: 'https://api.test', fetch, logger, token: 'abc' });
    const vibes = await api.listVibes({ mood: 'cozy', limit: 3 });
    expect(vibes).toHaveLength(3);
    expect(calls[0].url).toBe('https://api.test/vibes?mood=cozy&limit=3');
    expect(calls[0].init?.headers?.['authorization']).toBe('Bearer abc');
  });

  it('posts vibes as json', async () => {
    const [vibe] = makeVibes(1);
    const { fetch, calls } = fakeFetch(201, { vibe });
    const api = createApiClient({ baseUrl: 'https://api.test', fetch, logger });
    await api.postVibe({ mood: vibe.mood, intensity: 3, text: 'hi' });
    expect(calls[0].init?.method).toBe('POST');
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ mood: vibe.mood, intensity: 3, text: 'hi' });
  });

  it('throws ApiError with the server message', async () => {
    const { fetch } = fakeFetch(422, { error: 'text is required' });
    const api = createApiClient({ baseUrl: 'https://api.test', fetch, logger });
    await expect(api.postVibe({ mood: 'chill', intensity: 1, text: '' })).rejects.toThrow(
      new ApiError(422, '/vibes', 'text is required'),
    );
  });

  it('rejects invalid payloads from the server', async () => {
    const { fetch } = fakeFetch(200, { vibes: [{ id: 'x' }] });
    const api = createApiClient({ baseUrl: 'https://api.test', fetch, logger });
    await expect(api.listVibes()).rejects.toThrow(/server returned invalid vibe/);
  });

  it('encodes vibe ids in reaction paths', async () => {
    const { fetch, calls } = fakeFetch(200, { reactions: { '🔥': 1 } });
    const api = createApiClient({ baseUrl: 'https://api.test', fetch, logger });
    await api.react('a/b', '🔥');
    expect(calls[0].url).toBe('https://api.test/vibes/a%2Fb/reactions');
  });
});

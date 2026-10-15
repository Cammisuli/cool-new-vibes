import { createLogger, createMemorySink } from '@cool-new-vibes/logger';
import { collapseReactions, createDispatcher, route, type Notification } from './notifications.js';

const at = (iso: string) => new Date(iso);
const n = (over: Partial<Notification> = {}): Notification => ({
  userId: 'u1',
  kind: 'reaction',
  title: 'New reaction',
  body: '🔥',
  createdAt: at('2026-06-01T14:20:00Z'),
  ...over,
});

const all = { channels: ['push', 'email', 'in-app'] as const, quietHours: true, digestOnly: false };

describe('route', () => {
  it('delivers to all channels during the day, batching email to the next hour', () => {
    const deliveries = route(n(), { ...all, channels: [...all.channels] });
    expect(deliveries.map((d) => d.channel)).toEqual(['push', 'email', 'in-app']);
    expect(deliveries[1].deliverAt.toISOString()).toBe('2026-06-01T15:00:00.000Z');
  });

  it('suppresses push during quiet hours', () => {
    const deliveries = route(n({ createdAt: at('2026-06-01T02:00:00Z') }), { ...all, channels: [...all.channels] });
    expect(deliveries.map((d) => d.channel)).toEqual(['email', 'in-app']);
  });

  it('always pushes moderation notices immediately', () => {
    const deliveries = route(n({ kind: 'moderation', createdAt: at('2026-06-01T02:00:00Z') }), {
      ...all,
      channels: [...all.channels],
      digestOnly: true,
    });
    expect(deliveries.map((d) => d.channel)).toEqual(['push', 'email', 'in-app']);
    expect(deliveries.every((d) => d.deliverAt.getTime() === d.notification.createdAt.getTime())).toBe(true);
  });

  it('drops non-digest notifications for digest-only users', () => {
    expect(route(n(), { ...all, channels: [...all.channels], digestOnly: true })).toEqual([]);
  });
});

describe('collapseReactions', () => {
  it('collapses reactions per user and keeps others', () => {
    const items = [
      n({ body: '🔥', createdAt: at('2026-06-01T10:00:00Z') }),
      n({ body: '💜', createdAt: at('2026-06-01T10:01:00Z') }),
      n({ kind: 'mention', title: 'mentioned you', createdAt: at('2026-06-01T09:00:00Z') }),
      n({ userId: 'u2', body: '🎧', createdAt: at('2026-06-01T11:00:00Z') }),
    ];
    const out = collapseReactions(items);
    expect(out.map((x) => x.title)).toEqual(['mentioned you', '2 new reactions', 'New reaction']);
    expect(out[1].body).toBe('🔥, 💜');
  });
});

describe('dispatcher', () => {
  it('reports and logs failures', async () => {
    const sink = createMemorySink();
    const dispatch = createDispatcher(
      async (d) => {
        if (d.channel === 'email') throw new Error('smtp down');
      },
      createLogger({ scope: 'test', sink }),
    );
    const result = await dispatch(route(n(), { ...all, channels: [...all.channels] }));
    expect(result).toEqual({ sent: 2, failed: 1 });
    expect(sink.records[0].context['reason']).toBe('Error: smtp down');
  });
});

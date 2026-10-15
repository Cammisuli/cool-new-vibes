import type { Logger } from '@cool-new-vibes/logger';
import { HOUR, partOfDay } from '@cool-new-vibes/time';

export type Channel = 'push' | 'email' | 'in-app';

export interface Notification {
  userId: string;
  kind: 'reaction' | 'mention' | 'moderation' | 'digest';
  title: string;
  body: string;
  createdAt: Date;
}

export interface Preferences {
  channels: Channel[];
  quietHours: boolean;
  digestOnly: boolean;
}

export interface Delivery {
  notification: Notification;
  channel: Channel;
  deliverAt: Date;
}

/** Decide which channels a notification goes to and when. */
export function route(n: Notification, prefs: Preferences): Delivery[] {
  if (prefs.digestOnly && n.kind !== 'digest' && n.kind !== 'moderation') return [];
  const quiet = prefs.quietHours && partOfDay(n.createdAt) === 'night';
  return prefs.channels
    .filter((c) => !(quiet && c === 'push') || n.kind === 'moderation')
    .map((channel) => ({
      notification: n,
      channel,
      deliverAt: channel === 'email' && n.kind !== 'moderation' ? nextHour(n.createdAt) : n.createdAt,
    }));
}

function nextHour(date: Date): Date {
  return new Date(Math.ceil((date.getTime() + 1) / HOUR) * HOUR);
}

/** Collapse many reaction notifications for the same user into one. */
export function collapseReactions(items: Notification[]): Notification[] {
  const reactions = new Map<string, Notification[]>();
  const others: Notification[] = [];
  for (const n of items) {
    if (n.kind !== 'reaction') {
      others.push(n);
      continue;
    }
    reactions.set(n.userId, [...(reactions.get(n.userId) ?? []), n]);
  }
  const collapsed = [...reactions.values()].map((group) =>
    group.length === 1
      ? group[0]
      : {
          ...group[group.length - 1],
          title: `${group.length} new reactions`,
          body: group.map((g) => g.body).slice(0, 3).join(', ') + (group.length > 3 ? '…' : ''),
        },
  );
  return [...others, ...collapsed].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function createDispatcher(send: (d: Delivery) => Promise<void>, logger: Logger) {
  const log = logger.child('notifications');
  return async function dispatch(deliveries: Delivery[]) {
    const results = await Promise.allSettled(deliveries.map(send));
    const failed = results
      .map((r, i) => ({ r, d: deliveries[i] }))
      .filter((x) => x.r.status === 'rejected');
    for (const { r, d } of failed) {
      log.error('notification delivery failed', {
        userId: d.notification.userId,
        channel: d.channel,
        reason: String((r as PromiseRejectedResult).reason),
      });
    }
    return { sent: deliveries.length - failed.length, failed: failed.length };
  };
}

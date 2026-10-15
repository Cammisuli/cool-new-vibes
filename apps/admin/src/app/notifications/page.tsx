import { collapseReactions, route, type Notification } from '@cool-new-vibes/notifications';
import { relativeTime } from '@cool-new-vibes/time';
import { NOW, vibes } from '../../lib/data';

function recentNotifications(): Notification[] {
  return vibes.slice(-12).flatMap((v) =>
    Object.entries(v.reactions)
      .filter(([, count]) => count > 0)
      .map(([emoji]) => ({
        userId: v.authorId,
        kind: 'reaction' as const,
        title: 'New reaction',
        body: emoji,
        createdAt: new Date(v.createdAt),
      })),
  );
}

export default function NotificationsPage() {
  const collapsed = collapseReactions(recentNotifications());
  const prefs = { channels: ['push', 'email', 'in-app'] as ('push' | 'email' | 'in-app')[], quietHours: true, digestOnly: false };

  return (
    <main className="stack">
      <h1>Notification preview</h1>
      <p data-testid="notification-count">{collapsed.length} notifications after collapsing</p>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Title</th>
            <th>Body</th>
            <th>When</th>
            <th>Channels</th>
          </tr>
        </thead>
        <tbody data-testid="notifications">
          {collapsed.map((n, i) => (
            <tr key={i}>
              <td>{n.userId}</td>
              <td>{n.title}</td>
              <td>{n.body}</td>
              <td>{relativeTime(n.createdAt, NOW)}</td>
              <td>{route(n, prefs).map((d) => d.channel).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

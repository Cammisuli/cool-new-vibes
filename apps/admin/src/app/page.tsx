import { bucketByDay } from '@cool-new-vibes/time';
import { MoodBadge, StatTile } from '@cool-new-vibes/ui';
import type { Mood } from '@cool-new-vibes/vibe-model';
import { moodBreakdown, totalReactions } from '@cool-new-vibes/vibe-scoring';
import { buildQueue } from '@cool-new-vibes/moderation';
import { funnel } from '@cool-new-vibes/analytics';
import { funnelEvents, users, vibes } from '../lib/data';

const FUNNEL_STEPS = ['visit', 'signup', 'first_vibe', 'playlist_play'];

export default function DashboardPage() {
  const breakdown = Object.entries(moodBreakdown(vibes)) as [Mood, number][];
  const reactions = vibes.reduce((sum, v) => sum + totalReactions(v), 0);
  const byDay = bucketByDay(vibes, (v) => new Date(v.createdAt));

  return (
    <main className="stack">
      <h1>Dashboard</h1>
      <div className="row" data-testid="stats">
        <StatTile label="Vibes" value={vibes.length} />
        <StatTile label="Users" value={users.length} />
        <StatTile label="Reactions" value={reactions} />
        <StatTile label="Needs review" value={buildQueue(vibes).length} />
      </div>
      <h2>Mood mix</h2>
      <table data-testid="mood-mix">
        <tbody>
          {breakdown.map(([mood, share]) => (
            <tr key={mood}>
              <td>
                <MoodBadge mood={mood} />
              </td>
              <td>{(share * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Onboarding funnel</h2>
      <table data-testid="funnel">
        <tbody>
          {funnel(funnelEvents, FUNNEL_STEPS).map((count, i) => (
            <tr key={FUNNEL_STEPS[i]}>
              <td>{FUNNEL_STEPS[i]}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Activity</h2>
      <table data-testid="activity">
        <tbody>
          {[...byDay.entries()].map(([day, items]) => (
            <tr key={day}>
              <td>{day}</td>
              <td>{items.length} vibes</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

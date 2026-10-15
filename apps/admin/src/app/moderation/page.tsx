import { buildQueue } from '@cool-new-vibes/moderation';
import { vibes } from '../../lib/data';

export default function ModerationPage() {
  const queue = buildQueue(vibes);
  const byId = new Map(vibes.map((v) => [v.id, v]));

  return (
    <main className="stack">
      <h1>Moderation queue</h1>
      <p data-testid="queue-size">{queue.length} vibes need attention</p>
      <table>
        <thead>
          <tr>
            <th>Vibe</th>
            <th>Verdict</th>
            <th>Risk</th>
            <th>Reasons</th>
          </tr>
        </thead>
        <tbody data-testid="queue">
          {queue.map((item) => (
            <tr key={item.vibeId} data-verdict={item.verdict}>
              <td>{byId.get(item.vibeId)?.text}</td>
              <td>{item.verdict}</td>
              <td>{item.risk.toFixed(2)}</td>
              <td>{item.reasons.join('; ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

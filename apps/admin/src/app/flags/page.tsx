import { FLAGS } from '@cool-new-vibes/feature-flags';
import { config, flags, users } from '../../lib/data';

export default function FlagsPage() {
  return (
    <main className="stack">
      <h1>Feature flags</h1>
      <p>
        Environment: <code data-testid="environment">{config.environment}</code>
      </p>
      <table>
        <thead>
          <tr>
            <th>Flag</th>
            <th>Rollout</th>
            {users.map((u) => (
              <th key={u.id}>@{u.handle}</th>
            ))}
          </tr>
        </thead>
        <tbody data-testid="flags">
          {FLAGS.map((flag) => (
            <tr key={flag.name} data-flag={flag.name}>
              <td title={flag.description}>{flag.name}</td>
              <td>
                {flag.rollout}%{config.featureFlagOverrides[flag.name] !== undefined && ' (override)'}
              </td>
              {users.map((u) => (
                <td key={u.id}>{flags.isEnabled(flag.name, u.id) ? 'on' : 'off'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

import type { Vibe } from '@cool-new-vibes/vibe-model';
import { MoodBadge } from './mood-badge';

export interface VibeCardProps {
  vibe: Vibe;
  authorHandle: string;
  ago: string;
  onReact?: (emoji: string) => void;
}

export function VibeCard({ vibe, authorHandle, ago, onReact }: VibeCardProps) {
  return (
    <article data-testid="vibe-card" style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <header style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <strong>@{authorHandle}</strong>
        <MoodBadge mood={vibe.mood} />
        <small>{ago}</small>
        <small aria-label="intensity">{'▮'.repeat(vibe.intensity)}</small>
      </header>
      <p>{vibe.text}</p>
      <footer style={{ display: 'flex', gap: 6 }}>
        {Object.entries(vibe.reactions).map(([emoji, count]) => (
          <button key={emoji} type="button" onClick={onReact && (() => onReact(emoji))}>
            {emoji} {count}
          </button>
        ))}
      </footer>
    </article>
  );
}

import { moodPalette, readableTextColor } from '@cool-new-vibes/design-tokens';
import type { Mood } from '@cool-new-vibes/vibe-model';

export function MoodBadge({ mood }: { mood: Mood }) {
  const background = moodPalette[mood];
  return (
    <span
      data-testid="mood-badge"
      style={{
        background,
        color: readableTextColor(background),
        borderRadius: 999,
        padding: '2px 10px',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      #{mood}
    </span>
  );
}

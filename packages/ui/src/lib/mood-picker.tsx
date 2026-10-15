import { MOODS, type Mood } from '@cool-new-vibes/vibe-model';

export interface MoodPickerProps {
  value: Mood | 'all';
  onChange: (mood: Mood | 'all') => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <label>
      Mood{' '}
      <select
        data-testid="mood-picker"
        value={value}
        onChange={(e) => onChange(e.target.value as Mood | 'all')}
      >
        <option value="all">all</option>
        {MOODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </label>
  );
}

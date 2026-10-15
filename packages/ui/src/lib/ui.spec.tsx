import { fireEvent, render, screen } from '@testing-library/react';
import { makeVibes } from '@cool-new-vibes/vibe-model';
import { MoodBadge } from './mood-badge';
import { MoodPicker } from './mood-picker';
import { StatTile } from './stat-tile';
import { VibeCard } from './vibe-card';

describe('MoodBadge', () => {
  it('renders the mood as a hashtag with its palette color', () => {
    render(<MoodBadge mood="chill" />);
    const badge = screen.getByTestId('mood-badge');
    expect(badge.textContent).toBe('#chill');
    expect(badge.style.background).toBe('rgb(43, 210, 255)');
  });
});

describe('VibeCard', () => {
  const vibe = { ...makeVibes(1)[0], reactions: { '🔥': 3, '💜': 1 } };

  it('renders author, text and intensity', () => {
    render(<VibeCard vibe={vibe} authorHandle="nova" ago="5m ago" />);
    expect(screen.getByText('@nova')).toBeTruthy();
    expect(screen.getByText(vibe.text)).toBeTruthy();
    expect(screen.getByLabelText('intensity').textContent).toHaveLength(vibe.intensity);
  });

  it('calls onReact with the emoji', () => {
    const onReact = vi.fn();
    render(<VibeCard vibe={vibe} authorHandle="nova" ago="now" onReact={onReact} />);
    fireEvent.click(screen.getByText('💜 1'));
    expect(onReact).toHaveBeenCalledWith('💜');
  });
});

describe('MoodPicker', () => {
  it('offers all moods and reports changes', () => {
    const onChange = vi.fn();
    render(<MoodPicker value="all" onChange={onChange} />);
    const select = screen.getByTestId('mood-picker') as HTMLSelectElement;
    expect(select.options).toHaveLength(7);
    fireEvent.change(select, { target: { value: 'cozy' } });
    expect(onChange).toHaveBeenCalledWith('cozy');
  });
});

describe('StatTile', () => {
  it('renders label, value and optional hint', () => {
    render(<StatTile label="Vibes today" value={42} hint="+12%" />);
    expect(screen.getByTestId('stat-tile').textContent).toBe('Vibes today42+12%');
  });
});

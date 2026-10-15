import { render, screen } from '@testing-library/react';
import DashboardPage from '../src/app/page';
import ModerationPage from '../src/app/moderation/page';
import FlagsPage from '../src/app/flags/page';
import { GET } from '../src/app/api/moderation-queue/route';

describe('DashboardPage', () => {
  it('shows headline stats', () => {
    render(<DashboardPage />);
    expect(screen.getAllByTestId('stat-tile')).toHaveLength(4);
    expect(screen.getByText('51')).toBeTruthy();
  });
});

describe('ModerationPage', () => {
  it('lists the suspicious vibes', () => {
    render(<ModerationPage />);
    expect(screen.getByTestId('queue-size').textContent).toBe('3 vibes need attention');
  });
});

describe('FlagsPage', () => {
  it('marks overridden flags', () => {
    render(<FlagsPage />);
    expect(screen.getByText('10% (override)')).toBeTruthy();
  });
});

describe('GET /api/moderation-queue', () => {
  it('returns the queue sorted by risk', async () => {
    const body = await (await GET()).json();
    expect(body.queue.map((q: { vibeId: string }) => q.vibeId)).toEqual(['s1', 's3', 's2']);
  });
});

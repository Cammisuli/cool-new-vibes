import { render, screen } from '@testing-library/react';
import FeedPage from '../src/app/page';
import PlaylistPage from '../src/app/playlists/[mood]/page';

describe('FeedPage', () => {
  it('renders the 20 hottest vibes', async () => {
    render(await FeedPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getAllByTestId('vibe-card')).toHaveLength(20);
  });

  it('filters by mood', async () => {
    render(await FeedPage({ searchParams: Promise.resolve({ mood: 'cozy' }) }));
    const badges = screen.getAllByTestId('vibe-card').map((c) => c.querySelector('[data-testid="mood-badge"]')?.textContent);
    expect(new Set(badges)).toEqual(new Set(['#cozy']));
  });

  it('ignores unknown moods', async () => {
    render(await FeedPage({ searchParams: Promise.resolve({ mood: 'grumpy' }) }));
    expect(screen.getAllByTestId('vibe-card')).toHaveLength(20);
  });
});

describe('PlaylistPage', () => {
  it('renders tracks for a mood', async () => {
    render(await PlaylistPage({ params: Promise.resolve({ mood: 'euphoric' }) }));
    expect(screen.getByText('Neon Rain')).toBeTruthy();
  });
});

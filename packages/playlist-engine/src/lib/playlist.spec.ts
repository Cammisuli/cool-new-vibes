import { sampleTracks, type Track } from '@cool-new-vibes/vibe-model';
import { buildPlaylist, formatDuration, smoothTransitions, totalBpmJump } from './playlist.js';

describe('buildPlaylist', () => {
  it('respects the time budget', () => {
    const playlist = buildPlaylist(sampleTracks, { mood: 'chill', targetMinutes: 8 });
    expect(playlist.durationSec).toBeLessThanOrEqual(8 * 60);
    expect(playlist.tracks.length).toBeGreaterThan(0);
  });

  it('caps tracks per artist', () => {
    const playlist = buildPlaylist(sampleTracks, {
      mood: 'chill',
      targetMinutes: 60,
      maxPerArtist: 1,
      minFit: 0,
    });
    const artists = playlist.tracks.map((t) => t.artist);
    expect(new Set(artists).size).toBe(artists.length);
  });

  it('returns an empty playlist when nothing fits', () => {
    const playlist = buildPlaylist(sampleTracks, { mood: 'chaotic', targetMinutes: 1 });
    expect(playlist).toEqual({ mood: 'chaotic', tracks: [], durationSec: 0, averageFit: 0 });
  });

  it('puts the best fit for the mood in the playlist', () => {
    const playlist = buildPlaylist(sampleTracks, { mood: 'euphoric', targetMinutes: 10 });
    expect(playlist.tracks.map((t) => t.id)).toContain('t1');
    expect(playlist.averageFit).toBeGreaterThan(0.7);
  });
});

describe('smoothTransitions', () => {
  it('never increases total bpm jump vs. input order for a shuffled library', () => {
    const shuffled: Track[] = [sampleTracks[4], sampleTracks[1], sampleTracks[0], sampleTracks[7], sampleTracks[3]];
    expect(totalBpmJump(smoothTransitions(shuffled))).toBeLessThanOrEqual(totalBpmJump(shuffled));
  });

  it('keeps every track', () => {
    const out = smoothTransitions(sampleTracks);
    expect(out.map((t) => t.id).sort()).toEqual(sampleTracks.map((t) => t.id).sort());
  });
});

describe('formatDuration', () => {
  it.each([
    [59, '0:59'],
    [61, '1:01'],
    [3600, '1:00:00'],
    [3725, '1:02:05'],
  ])('%d -> %s', (sec, expected) => {
    expect(formatDuration(sec)).toBe(expected);
  });
});

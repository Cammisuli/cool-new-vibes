export const MOODS = ['euphoric', 'chill', 'melancholy', 'focused', 'chaotic', 'cozy'] as const;
export type Mood = (typeof MOODS)[number];

export interface User {
  id: string;
  handle: string;
  displayName: string;
  joinedAt: string;
  role: 'member' | 'moderator' | 'admin';
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  bpm: number;
  energy: number; // 0..1
  valence: number; // 0..1
  tags: string[];
}

export interface Vibe {
  id: string;
  authorId: string;
  mood: Mood;
  intensity: number; // 1..10
  text: string;
  trackId?: string;
  createdAt: string;
  reactions: Record<string, number>;
}

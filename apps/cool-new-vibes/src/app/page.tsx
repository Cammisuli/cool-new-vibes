import Link from 'next/link';
import { MoodBadge, VibeCard } from '@cool-new-vibes/ui';
import { MOODS, isMood } from '@cool-new-vibes/vibe-model';
import { dominantMood, rankFeed } from '@cool-new-vibes/vibe-scoring';
import { NOW, agoFor, handleFor, vibes } from '../lib/data';

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ mood?: string }>;
}) {
  const { mood } = await searchParams;
  const filtered = isMood(mood) ? vibes.filter((v) => v.mood === mood) : vibes;
  const ranked = rankFeed(filtered, { now: NOW }).slice(0, 20);
  const dominant = dominantMood(vibes);

  return (
    <main className="stack">
      <h1>The vibe right now</h1>
      {dominant && (
        <p data-testid="dominant-mood">
          Today&apos;s dominant mood: <MoodBadge mood={dominant} />
        </p>
      )}
      <div className="row" data-testid="mood-filters">
        <Link href="/">all</Link>
        {MOODS.map((m) => (
          <Link key={m} href={`/?mood=${m}`}>
            {m}
          </Link>
        ))}
      </div>
      <section className="stack" data-testid="feed">
        {ranked.map((vibe) => (
          <VibeCard
            key={vibe.id}
            vibe={vibe}
            authorHandle={handleFor(vibe.authorId)}
            ago={agoFor(vibe.createdAt)}
          />
        ))}
      </section>
    </main>
  );
}

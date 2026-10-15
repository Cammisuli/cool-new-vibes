import { indexVibes } from '@cool-new-vibes/search';
import { VibeCard } from '@cool-new-vibes/ui';
import { agoFor, handleFor, vibes } from '../../lib/data';

const index = indexVibes(vibes);

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const hits = q ? index.search(q, 10) : [];
  const hitIds = new Set(hits.map((h) => h.id));
  const results = vibes
    .filter((v) => hitIds.has(v.id))
    .sort((a, b) => hits.findIndex((h) => h.id === a.id) - hits.findIndex((h) => h.id === b.id));

  return (
    <main className="stack">
      <h1>Search vibes</h1>
      <form action="/search">
        <input name="q" defaultValue={q} placeholder="try: deploy, rain, #cozy" aria-label="query" />{' '}
        <button type="submit">Search</button>
      </form>
      {q && <p data-testid="result-count">{hits.length} results for &quot;{q}&quot;</p>}
      <section className="stack" data-testid="results">
        {results.map((vibe) => (
          <VibeCard key={vibe.id} vibe={vibe} authorHandle={handleFor(vibe.authorId)} ago={agoFor(vibe.createdAt)} />
        ))}
      </section>
    </main>
  );
}

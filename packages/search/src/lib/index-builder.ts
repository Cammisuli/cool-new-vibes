import type { Vibe } from '@cool-new-vibes/vibe-model';
import { levenshtein, tokenize } from './tokenize.js';

export interface SearchHit {
  id: string;
  score: number;
}

export class SearchIndex {
  private postings = new Map<string, Map<string, number>>();
  private docLengths = new Map<string, number>();

  add(id: string, text: string): void {
    const tokens = tokenize(text);
    this.docLengths.set(id, tokens.length);
    for (const token of tokens) {
      const posting = this.postings.get(token) ?? new Map<string, number>();
      posting.set(id, (posting.get(id) ?? 0) + 1);
      this.postings.set(token, posting);
    }
  }

  get size(): number {
    return this.docLengths.size;
  }

  /** TF-IDF search with typo tolerance (edit distance 1 for terms > 4 chars). */
  search(query: string, limit = 10): SearchHit[] {
    const scores = new Map<string, number>();
    const n = this.docLengths.size;
    for (const term of tokenize(query)) {
      for (const [token, posting] of this.expand(term)) {
        const idf = Math.log(1 + n / posting.size);
        const penalty = token === term ? 1 : 0.5;
        for (const [id, tf] of posting) {
          const norm = tf / (this.docLengths.get(id) || 1);
          scores.set(id, (scores.get(id) ?? 0) + norm * idf * penalty);
        }
      }
    }
    return [...scores.entries()]
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, limit);
  }

  private expand(term: string): [string, Map<string, number>][] {
    const exact = this.postings.get(term);
    if (exact) return [[term, exact]];
    if (term.length <= 4) return [];
    return [...this.postings.entries()].filter(([token]) => levenshtein(token, term) === 1);
  }
}

export function indexVibes(vibes: Vibe[]): SearchIndex {
  const index = new SearchIndex();
  for (const vibe of vibes) index.add(vibe.id, `${vibe.text} #${vibe.mood}`);
  return index;
}

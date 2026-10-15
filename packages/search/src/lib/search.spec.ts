import { makeVibes } from '@cool-new-vibes/vibe-model';
import { SearchIndex, indexVibes } from './index-builder.js';
import { levenshtein, tokenize } from './tokenize.js';

describe('tokenize', () => {
  it('lowercases, strips accents and stop words', () => {
    expect(tokenize('The Café is ON fire!')).toEqual(['cafe', 'fire']);
  });
  it('keeps hashtags', () => {
    expect(tokenize('so #cozy')).toEqual(['#cozy']);
  });
});

describe('levenshtein', () => {
  it.each([
    ['kitten', 'sitting', 3],
    ['flow', 'flow', 0],
    ['', 'abc', 3],
    ['deploy', 'deplpy', 1],
  ])('%s vs %s = %d', (a, b, d) => {
    expect(levenshtein(a, b)).toBe(d);
  });
});

describe('SearchIndex', () => {
  const index = new SearchIndex();
  index.add('a', 'rain on the window, tea in hand');
  index.add('b', 'rain rain rain everywhere');
  index.add('c', 'sunshine and new sneakers');

  it('ranks higher term frequency first', () => {
    expect(index.search('rain').map((h) => h.id)).toEqual(['b', 'a']);
  });

  it('tolerates single typos on longer words', () => {
    expect(index.search('sunshne').map((h) => h.id)).toEqual(['c']);
  });

  it('returns nothing for unknown short terms', () => {
    expect(index.search('xyz')).toEqual([]);
  });

  it('indexes vibes with their mood tag', () => {
    const vibeIndex = indexVibes(makeVibes(12));
    expect(vibeIndex.size).toBe(12);
    const hits = vibeIndex.search('#cozy');
    expect(hits).toHaveLength(2);
  });

  it('respects the limit', () => {
    const vibeIndex = indexVibes(makeVibes(40));
    expect(vibeIndex.search('deploys rollbacks coffee', 3)).toHaveLength(3);
  });
});

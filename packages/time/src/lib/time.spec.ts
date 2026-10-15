import {
  DAY,
  HOUR,
  bucketByDay,
  decay,
  isSameUtcDay,
  partOfDay,
  relativeTime,
} from './time.js';

const t0 = new Date('2026-03-10T12:00:00Z');

describe('relativeTime', () => {
  it.each([
    [10_000, 'just now'],
    [5 * 60_000, '5m ago'],
    [3 * HOUR, '3h ago'],
    [2 * DAY, '2d ago'],
    [15 * DAY, '2w ago'],
    [-2 * HOUR, '2h from now'],
  ])('%d ms -> %s', (offset, expected) => {
    expect(relativeTime(t0, new Date(t0.getTime() + offset))).toBe(expected);
  });
});

describe('partOfDay', () => {
  it.each([
    ['2026-03-10T03:00:00Z', 'night'],
    ['2026-03-10T08:00:00Z', 'morning'],
    ['2026-03-10T13:00:00Z', 'afternoon'],
    ['2026-03-10T19:00:00Z', 'evening'],
    ['2026-03-10T23:30:00Z', 'night'],
  ])('%s is %s', (iso, expected) => {
    expect(partOfDay(new Date(iso))).toBe(expected);
  });
});

describe('decay', () => {
  it('halves at the half-life', () => {
    expect(decay(HOUR, HOUR)).toBeCloseTo(0.5);
    expect(decay(2 * HOUR, HOUR)).toBeCloseTo(0.25);
  });
  it('is 1 for future or zero ages', () => {
    expect(decay(-5, HOUR)).toBe(1);
  });
});

describe('day helpers', () => {
  it('compares utc days', () => {
    expect(isSameUtcDay(t0, new Date('2026-03-10T23:59:59Z'))).toBe(true);
    expect(isSameUtcDay(t0, new Date('2026-03-11T00:00:00Z'))).toBe(false);
  });

  it('buckets items by utc day', () => {
    const items = ['2026-03-10T01:00:00Z', '2026-03-10T22:00:00Z', '2026-03-12T05:00:00Z'];
    const buckets = bucketByDay(items, (s) => new Date(s));
    expect([...buckets.keys()]).toEqual(['2026-03-10', '2026-03-12']);
    expect(buckets.get('2026-03-10')).toHaveLength(2);
  });
});

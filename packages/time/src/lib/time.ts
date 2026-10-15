export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

export function relativeTime(from: Date, to: Date): string {
  const diff = to.getTime() - from.getTime();
  const abs = Math.abs(diff);
  const suffix = diff >= 0 ? 'ago' : 'from now';
  if (abs < MINUTE) return 'just now';
  const units: [number, string][] = [
    [WEEK, 'w'],
    [DAY, 'd'],
    [HOUR, 'h'],
    [MINUTE, 'm'],
  ];
  for (const [size, label] of units) {
    if (abs >= size) return `${Math.floor(abs / size)}${label} ${suffix}`;
  }
  return 'just now';
}

export function startOfDayUtc(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function isSameUtcDay(a: Date, b: Date): boolean {
  return startOfDayUtc(a).getTime() === startOfDayUtc(b).getTime();
}

export type PartOfDay = 'night' | 'morning' | 'afternoon' | 'evening';

export function partOfDay(date: Date): PartOfDay {
  const h = date.getUTCHours();
  if (h < 5) return 'night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 22) return 'evening';
  return 'night';
}

/** Exponential decay weight with the given half-life. */
export function decay(ageMs: number, halfLifeMs: number): number {
  if (ageMs <= 0) return 1;
  return Math.pow(0.5, ageMs / halfLifeMs);
}

export function bucketByDay<T>(items: T[], getDate: (item: T) => Date) {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const key = startOfDayUtc(getDate(item)).toISOString().slice(0, 10);
    const bucket = buckets.get(key) ?? [];
    bucket.push(item);
    buckets.set(key, bucket);
  }
  return buckets;
}

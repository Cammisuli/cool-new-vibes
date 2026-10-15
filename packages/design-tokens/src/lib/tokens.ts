export const moodPalette = {
  euphoric: '#ff3cac',
  chill: '#2bd2ff',
  melancholy: '#5f6caf',
  focused: '#2ecc71',
  chaotic: '#ff8c00',
  cozy: '#c49a6c',
} as const;

export type Mood = keyof typeof moodPalette;

export const spacing = [0, 4, 8, 12, 16, 24, 32, 48, 64] as const;

export const radii = { sm: 4, md: 8, lg: 16, pill: 999 } as const;

export const fontSizes = { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 40 } as const;

export function space(step: number): string {
  const value = spacing[step];
  if (value === undefined) {
    throw new RangeError(`spacing step ${step} is out of range 0..${spacing.length - 1}`);
  }
  return `${value}px`;
}

export function toCssVariables(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [mood, color] of Object.entries(moodPalette)) {
    vars[`--vibes-mood-${mood}`] = color;
  }
  spacing.forEach((value, i) => {
    vars[`--vibes-space-${i}`] = `${value}px`;
  });
  for (const [name, value] of Object.entries(radii)) {
    vars[`--vibes-radius-${name}`] = `${value}px`;
  }
  for (const [name, value] of Object.entries(fontSizes)) {
    vars[`--vibes-font-${name}`] = `${value}px`;
  }
  return vars;
}

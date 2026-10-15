import { moodPalette, space, toCssVariables } from './tokens.js';
import { contrastRatio, hexToRgb, mix, readableTextColor, rgbToHex } from './color.js';

describe('tokens', () => {
  it('maps spacing steps to px', () => {
    expect(space(0)).toBe('0px');
    expect(space(4)).toBe('16px');
    expect(() => space(99)).toThrow(RangeError);
  });

  it('emits css variables for every mood', () => {
    const vars = toCssVariables();
    for (const mood of Object.keys(moodPalette)) {
      expect(vars[`--vibes-mood-${mood}`]).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(vars['--vibes-radius-pill']).toBe('999px');
  });
});

describe('color', () => {
  it('round-trips hex and rgb', () => {
    expect(hexToRgb('#ff3cac')).toEqual({ r: 255, g: 60, b: 172 });
    expect(rgbToHex({ r: 255, g: 60, b: 172 })).toBe('#ff3cac');
    expect(() => hexToRgb('red')).toThrow();
  });

  it('computes WCAG contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1);
  });

  it('picks readable text for every mood color', () => {
    for (const color of Object.values(moodPalette)) {
      const text = readableTextColor(color);
      expect(contrastRatio(color, text)).toBeGreaterThan(4);
    }
  });

  it('mixes colors', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});

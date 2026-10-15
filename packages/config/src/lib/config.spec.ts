import { ConfigError, loadConfig, parseFlagOverrides } from './config.js';

const base = { VIBES_ENV: 'staging', VIBES_API_URL: 'https://api.vibes.dev/' };

describe('loadConfig', () => {
  it('applies defaults and normalizes the api url', () => {
    expect(loadConfig(base)).toEqual({
      environment: 'staging',
      apiBaseUrl: 'https://api.vibes.dev',
      sessionTtlSeconds: 3600,
      featureFlagOverrides: {},
      analyticsSampleRate: 1,
    });
  });

  it('rejects unknown environments', () => {
    expect(() => loadConfig({ ...base, VIBES_ENV: 'qa' })).toThrow(ConfigError);
  });

  it('rejects missing required keys', () => {
    expect(() => loadConfig({ VIBES_ENV: 'production' })).toThrow(
      'Invalid config "VIBES_API_URL": is required',
    );
  });

  it('rejects malformed urls', () => {
    expect(() => loadConfig({ ...base, VIBES_API_URL: 'nope' })).toThrow(/not a valid URL/);
  });

  it('rejects out-of-range numbers', () => {
    expect(() => loadConfig({ ...base, VIBES_SESSION_TTL: '5' })).toThrow(/VIBES_SESSION_TTL/);
    expect(() =>
      loadConfig({ ...base, VIBES_ANALYTICS_SAMPLE_RATE: '1.5' }),
    ).toThrow(/VIBES_ANALYTICS_SAMPLE_RATE/);
  });
});

describe('parseFlagOverrides', () => {
  it('parses on/off pairs', () => {
    expect(parseFlagOverrides('dark-mode=on, beta-feed=off')).toEqual({
      'dark-mode': true,
      'beta-feed': false,
    });
  });

  it('rejects other values', () => {
    expect(() => parseFlagOverrides('x=yes')).toThrow(/must be "on" or "off"/);
  });
});

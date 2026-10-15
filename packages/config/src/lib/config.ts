export type Environment = 'development' | 'staging' | 'production';

export interface AppConfig {
  environment: Environment;
  apiBaseUrl: string;
  sessionTtlSeconds: number;
  featureFlagOverrides: Record<string, boolean>;
  analyticsSampleRate: number;
}

export class ConfigError extends Error {
  constructor(
    public readonly key: string,
    message: string,
  ) {
    super(`Invalid config "${key}": ${message}`);
    this.name = 'ConfigError';
  }
}

const ENVIRONMENTS: Environment[] = ['development', 'staging', 'production'];

function required(env: Record<string, string | undefined>, key: string) {
  const value = env[key];
  if (value === undefined || value === '') {
    throw new ConfigError(key, 'is required');
  }
  return value;
}

function parseNumber(key: string, raw: string, min: number, max: number) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new ConfigError(key, `expected a number in [${min}, ${max}], got "${raw}"`);
  }
  return value;
}

export function parseFlagOverrides(raw: string | undefined) {
  const overrides: Record<string, boolean> = {};
  if (!raw) return overrides;
  for (const entry of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
    const [name, value] = entry.split('=');
    if (value !== 'on' && value !== 'off') {
      throw new ConfigError('VIBES_FLAGS', `flag "${name}" must be "on" or "off"`);
    }
    overrides[name] = value === 'on';
  }
  return overrides;
}

export function loadConfig(env: Record<string, string | undefined>): AppConfig {
  const environment = required(env, 'VIBES_ENV') as Environment;
  if (!ENVIRONMENTS.includes(environment)) {
    throw new ConfigError('VIBES_ENV', `must be one of ${ENVIRONMENTS.join(', ')}`);
  }
  const apiBaseUrl = required(env, 'VIBES_API_URL');
  try {
    new URL(apiBaseUrl);
  } catch {
    throw new ConfigError('VIBES_API_URL', `"${apiBaseUrl}" is not a valid URL`);
  }
  return {
    environment,
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    sessionTtlSeconds: parseNumber(
      'VIBES_SESSION_TTL',
      env['VIBES_SESSION_TTL'] ?? '3600',
      60,
      60 * 60 * 24 * 30,
    ),
    featureFlagOverrides: parseFlagOverrides(env['VIBES_FLAGS']),
    analyticsSampleRate: parseNumber(
      'VIBES_ANALYTICS_SAMPLE_RATE',
      env['VIBES_ANALYTICS_SAMPLE_RATE'] ?? '1',
      0,
      1,
    ),
  };
}

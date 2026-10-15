import { createLogger, createMemorySink, shouldLog } from './logger.js';

const fixedNow = () => new Date('2026-01-01T00:00:00.000Z');

describe('logger', () => {
  it('filters records below the minimum level', () => {
    const sink = createMemorySink();
    const log = createLogger({ scope: 'app', minLevel: 'warn', sink });
    log.info('ignored');
    log.warn('kept');
    expect(sink.records.map((r) => r.message)).toEqual(['kept']);
  });

  it('merges base and call context', () => {
    const sink = createMemorySink();
    const log = createLogger({
      scope: 'app',
      sink,
      now: fixedNow,
      context: { region: 'ca' },
    });
    log.error('boom', { code: 42 });
    expect(sink.records[0]).toEqual({
      level: 'error',
      scope: 'app',
      message: 'boom',
      context: { region: 'ca', code: 42 },
      timestamp: '2026-01-01T00:00:00.000Z',
    });
  });

  it('creates nested child scopes that inherit context', () => {
    const sink = createMemorySink();
    const log = createLogger({ scope: 'app', sink, context: { a: 1 } });
    log.child('db', { b: 2 }).child('pool').info('ready');
    expect(sink.records[0].scope).toBe('app:db:pool');
    expect(sink.records[0].context).toEqual({ a: 1, b: 2 });
  });

  it.each([
    ['debug', 'info', false],
    ['info', 'info', true],
    ['error', 'warn', true],
    ['warn', 'error', false],
  ] as const)('shouldLog(%s, %s) is %s', (level, min, expected) => {
    expect(shouldLog(level, min)).toBe(expected);
  });
});

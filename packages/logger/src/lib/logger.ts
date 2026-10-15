export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface LogRecord {
  level: LogLevel;
  scope: string;
  message: string;
  context: Record<string, unknown>;
  timestamp: string;
}

export type LogSink = (record: LogRecord) => void;

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  child(scope: string, context?: Record<string, unknown>): Logger;
}

export interface LoggerOptions {
  scope: string;
  minLevel?: LogLevel;
  sink?: LogSink;
  context?: Record<string, unknown>;
  now?: () => Date;
}

export const consoleSink: LogSink = (record) => {
  const line = `[${record.timestamp}] ${record.level.toUpperCase()} ${record.scope}: ${record.message}`;
  const method = record.level === 'debug' ? 'log' : record.level;
  console[method](line, record.context);
};

export function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

export function createLogger(options: LoggerOptions): Logger {
  const {
    scope,
    minLevel = 'info',
    sink = consoleSink,
    context: baseContext = {},
    now = () => new Date(),
  } = options;

  const emit = (
    level: LogLevel,
    message: string,
    context: Record<string, unknown> = {},
  ) => {
    if (!shouldLog(level, minLevel)) return;
    sink({
      level,
      scope,
      message,
      context: { ...baseContext, ...context },
      timestamp: now().toISOString(),
    });
  };

  return {
    debug: (m, c) => emit('debug', m, c),
    info: (m, c) => emit('info', m, c),
    warn: (m, c) => emit('warn', m, c),
    error: (m, c) => emit('error', m, c),
    child: (childScope, childContext = {}) =>
      createLogger({
        scope: `${scope}:${childScope}`,
        minLevel,
        sink,
        now,
        context: { ...baseContext, ...childContext },
      }),
  };
}

export function createMemorySink(): LogSink & { records: LogRecord[] } {
  const records: LogRecord[] = [];
  const sink = ((record: LogRecord) => {
    records.push(record);
  }) as LogSink & { records: LogRecord[] };
  sink.records = records;
  return sink;
}

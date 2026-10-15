import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AppConfig } from '@cool-new-vibes/config';
import type { Logger } from '@cool-new-vibes/logger';

export interface Session {
  userId: string;
  role: 'member' | 'moderator' | 'admin';
  issuedAt: number; // epoch seconds
  expiresAt: number;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

const b64 = (s: string) => Buffer.from(s).toString('base64url');
const unb64 = (s: string) => Buffer.from(s, 'base64url').toString('utf8');

export function createSessionManager(
  secret: string,
  config: Pick<AppConfig, 'sessionTtlSeconds'>,
  logger: Logger,
  now: () => number = () => Math.floor(Date.now() / 1000),
) {
  if (secret.length < 16) throw new AuthError('session secret must be at least 16 characters');
  const log = logger.child('auth');
  const sign = (payload: string) => createHmac('sha256', secret).update(payload).digest('base64url');

  return {
    issue(userId: string, role: Session['role']): string {
      const issuedAt = now();
      const session: Session = { userId, role, issuedAt, expiresAt: issuedAt + config.sessionTtlSeconds };
      const payload = b64(JSON.stringify(session));
      log.debug('issued session', { userId });
      return `${payload}.${sign(payload)}`;
    },

    verify(token: string): Session {
      const [payload, signature] = token.split('.');
      if (!payload || !signature) throw new AuthError('malformed token');
      const expected = Buffer.from(sign(payload));
      const actual = Buffer.from(signature);
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
        log.warn('rejected token with bad signature');
        throw new AuthError('invalid signature');
      }
      const session = JSON.parse(unb64(payload)) as Session;
      if (session.expiresAt <= now()) throw new AuthError('session expired');
      return session;
    },
  };
}

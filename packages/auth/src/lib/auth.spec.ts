import { createLogger, createMemorySink } from '@cool-new-vibes/logger';
import { AuthError, createSessionManager } from './session.js';
import { can, canDeleteVibe } from './permissions.js';

const logger = createLogger({ scope: 'test', sink: createMemorySink() });
const SECRET = 'super-secret-signing-key';

describe('session manager', () => {
  let clock = 1_000_000;
  const sessions = createSessionManager(SECRET, { sessionTtlSeconds: 60 }, logger, () => clock);

  it('round-trips a session', () => {
    const token = sessions.issue('u1', 'member');
    expect(sessions.verify(token)).toEqual({
      userId: 'u1',
      role: 'member',
      issuedAt: clock,
      expiresAt: clock + 60,
    });
  });

  it('rejects tampered payloads', () => {
    const token = sessions.issue('u1', 'member');
    const [, sig] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ userId: 'u1', role: 'admin', issuedAt: 0, expiresAt: 9e9 })).toString('base64url');
    expect(() => sessions.verify(`${forged}.${sig}`)).toThrow('invalid signature');
  });

  it('rejects expired sessions', () => {
    const token = sessions.issue('u1', 'member');
    clock += 61;
    expect(() => sessions.verify(token)).toThrow('session expired');
  });

  it('rejects malformed tokens', () => {
    expect(() => sessions.verify('garbage')).toThrow(AuthError);
  });

  it('requires a strong secret', () => {
    expect(() => createSessionManager('short', { sessionTtlSeconds: 60 }, logger)).toThrow(AuthError);
  });
});

describe('permissions', () => {
  const member = { userId: 'u3', role: 'member' as const, issuedAt: 0, expiresAt: 1 };
  const mod = { ...member, userId: 'u2', role: 'moderator' as const };

  it('members only delete their own vibes', () => {
    expect(canDeleteVibe(member, 'u3')).toBe(true);
    expect(canDeleteVibe(member, 'u1')).toBe(false);
  });

  it('moderators delete anything but cannot manage flags', () => {
    expect(canDeleteVibe(mod, 'u1')).toBe(true);
    expect(can(mod, 'flags:manage')).toBe(false);
    expect(can({ role: 'admin' }, 'flags:manage')).toBe(true);
  });
});

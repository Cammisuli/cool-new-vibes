import type { Session } from './session.js';

export type Permission =
  | 'vibe:create'
  | 'vibe:delete:own'
  | 'vibe:delete:any'
  | 'moderation:review'
  | 'flags:manage'
  | 'users:ban';

const ROLE_PERMISSIONS: Record<Session['role'], Permission[]> = {
  member: ['vibe:create', 'vibe:delete:own'],
  moderator: ['vibe:create', 'vibe:delete:own', 'vibe:delete:any', 'moderation:review'],
  admin: [
    'vibe:create',
    'vibe:delete:own',
    'vibe:delete:any',
    'moderation:review',
    'flags:manage',
    'users:ban',
  ],
};

export function can(session: Pick<Session, 'role'>, permission: Permission): boolean {
  return ROLE_PERMISSIONS[session.role].includes(permission);
}

export function canDeleteVibe(session: Session, authorId: string): boolean {
  return can(session, 'vibe:delete:any') || (can(session, 'vibe:delete:own') && session.userId === authorId);
}

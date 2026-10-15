import { buildQueue } from '@cool-new-vibes/moderation';
import { vibes } from '../../../lib/data';

export async function GET() {
  return Response.json({ queue: buildQueue(vibes) });
}

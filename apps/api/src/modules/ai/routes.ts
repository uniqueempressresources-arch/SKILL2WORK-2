import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { runAi } from './service.js';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../../auth/auth.js';

const bodySchema = z.object({
  feature: z.enum(['career_coach', 'cv_improvement', 'skill_gap']),
  input: z.string().min(1).max(4000),
});

export async function registerAiRoutes(app: FastifyInstance) {
  app.post('/api/ai/respond', async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid AI request.' });

    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) return reply.status(401).send({ error: 'Sign in required.' });
    // Quota, feature-flag and cost checks belong here before the provider is called.
    const result = await runAi({ userId: session.user.id, ...parsed.data });
    return reply.send(result);
  });
}

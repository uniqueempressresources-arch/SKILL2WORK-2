import type { FastifyInstance } from 'fastify';
import { checkDatabase } from '../../db/pool.js';

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    try {
      await checkDatabase();
      return reply.send({ status: 'ok', service: 'skill2work-api', timestamp: new Date().toISOString(), database: 'ok' });
    } catch {
      return reply.status(503).send({ status: 'ok', service: 'skill2work-api', timestamp: new Date().toISOString(), database: 'error' });
    }
  });
}

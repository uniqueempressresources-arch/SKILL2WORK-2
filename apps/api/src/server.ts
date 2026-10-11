import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import rawBody from 'fastify-raw-body';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth/auth.js';
import { registerHealthRoutes } from './modules/health/routes.js';
import { registerPaymentRoutes } from './modules/payments/routes.js';
import { registerAiRoutes } from './modules/ai/routes.js';
import { registerProfileRoutes } from './modules/profile/routes.js';

const app = Fastify({ logger: true, bodyLimit: 512 * 1024 });
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

await app.register(helmet);
await app.register(cors, {
  origin: clientOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});
await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
await app.register(rawBody, { field: 'rawBody', global: false, encoding: 'utf8', runFirst: true });

await app.register(registerHealthRoutes);
await app.register(registerPaymentRoutes);
await app.register(registerAiRoutes);
await app.register(registerProfileRoutes);

app.route({
  method: ['GET', 'POST'],
  url: '/api/auth/*',
  async handler(request, reply) {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = fromNodeHeaders(request.headers);
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      const response = await auth.handler(req);
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body ? await response.text() : null);
    } catch (error) {
      request.log.error(error, 'Authentication error');
      return reply.status(500).send({ error: 'Internal authentication error', code: 'AUTH_FAILURE' });
    }
  },
});

app.get('/api/me', async (request, reply) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
  if (!session) return reply.status(401).send({ error: 'Unauthorized' });
  return reply.send(session);
});

const port = Number(process.env.API_PORT ?? 4000);
await app.listen({ port, host: '0.0.0.0' });

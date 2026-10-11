import crypto from 'node:crypto';
import type { FastifyInstance } from 'fastify';

function timingSafeEqualHex(a: string, b: string) {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function registerPaymentRoutes(app: FastifyInstance) {
  app.post('/api/payments/initialize', async (_request, reply) => {
    // Phase 10: create the internal pending payment record first, then call Paystack server-to-server.
    // Never put PAYSTACK_SECRET_KEY in the browser.
    return reply.status(501).send({ error: 'Payments are scaffolded but not enabled yet.' });
  });

  app.post('/api/payments/webhook', { config: { rawBody: true } }, async (request, reply) => {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
    const signature = request.headers['x-paystack-signature'];

    if (!secret || typeof signature !== 'string') {
      return reply.status(401).send({ error: 'Webhook verification is not configured.' });
    }

    const rawBody = String((request as any).rawBody ?? '');
    if (!rawBody) return reply.status(400).send({ error: 'Missing raw webhook body.' });
    const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

    if (!timingSafeEqualHex(expected, signature)) {
      return reply.status(401).send({ error: 'Invalid webhook signature.' });
    }

    // Acknowledge quickly. Actual fulfilment belongs in an idempotent background job.
    return reply.status(200).send({ received: true });
  });
}

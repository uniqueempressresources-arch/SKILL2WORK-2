import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../../auth/auth.js';
import { pool } from '../../db/pool.js';

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  userType: z.enum(['job_seeker', 'student', 'career_changer', 'freelancer', 'artisan', 'employer']),
  headline: z.string().trim().max(160).default(''),
  bio: z.string().trim().max(1200).default(''),
  location: z.string().trim().max(160).default(''),
  skills: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
});

export async function registerProfileRoutes(app: FastifyInstance) {
  app.get('/api/profile', async (request, reply) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) return reply.status(401).send({ error: 'Sign in required.' });

    const result = await pool.query(
      `select user_id, full_name, user_type, headline, bio, location, skills, created_at, updated_at
       from app_profile where user_id = $1`,
      [session.user.id],
    );

    if (result.rowCount === 0) return reply.status(404).send({ error: 'Profile not created yet.' });
    return reply.send({ profile: result.rows[0] });
  });

  app.put('/api/profile', async (request, reply) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) return reply.status(401).send({ error: 'Sign in required.' });

    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid profile data.', details: parsed.error.flatten() });
    }

    const { fullName, userType, headline, bio, location, skills } = parsed.data;
    const result = await pool.query(
      `insert into app_profile (user_id, full_name, user_type, headline, bio, location, skills)
       values ($1, $2, $3, $4, $5, $6, $7::jsonb)
       on conflict (user_id) do update set
         full_name = excluded.full_name,
         user_type = excluded.user_type,
         headline = excluded.headline,
         bio = excluded.bio,
         location = excluded.location,
         skills = excluded.skills,
         updated_at = now()
       returning user_id, full_name, user_type, headline, bio, location, skills, created_at, updated_at`,
      [session.user.id, fullName, userType, headline, bio, location, JSON.stringify(skills)],
    );

    return reply.send({ profile: result.rows[0] });
  });
}

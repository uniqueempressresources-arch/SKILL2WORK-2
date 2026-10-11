import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
const authSecret = process.env.BETTER_AUTH_SECRET;

if (!databaseUrl) throw new Error('DATABASE_URL is required');
if (!authSecret) throw new Error('BETTER_AUTH_SECRET is required');

export const auth = betterAuth({
  secret: authSecret,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'],
  database: new Pool({ connectionString: databaseUrl }),
  emailAndPassword: {
    enabled: true,
  },
});

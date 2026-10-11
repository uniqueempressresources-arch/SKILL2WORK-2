import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
});

export async function checkDatabase() {
  const client = await pool.connect();
  try {
    await client.query('select 1');
    return true;
  } finally {
    client.release();
  }
}

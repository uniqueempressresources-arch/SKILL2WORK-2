import { pool } from '../../db/pool.js';

const pollMs = Number(process.env.WORKER_POLL_MS ?? 5000);

async function ensureJobsTable() {
  await pool.query(`
    create extension if not exists pgcrypto;
    create table if not exists background_job (
      id uuid primary key default gen_random_uuid(),
      type text not null,
      payload jsonb not null default '{}'::jsonb,
      status text not null default 'pending',
      attempts integer not null default 0,
      run_after timestamptz not null default now(),
      locked_at timestamptz,
      last_error text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index if not exists background_job_ready_idx on background_job(status, run_after);
  `);
}

async function tick() {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await client.query(`
      select id, type, payload, attempts
      from background_job
      where status = 'pending' and run_after <= now()
      order by created_at
      for update skip locked
      limit 1
    `);
    const job = result.rows[0];
    if (!job) {
      await client.query('commit');
      return;
    }
    await client.query(`update background_job set status='running', locked_at=now(), attempts=attempts+1, updated_at=now() where id=$1`, [job.id]);
    await client.query('commit');

    // TODO: dispatch job.type to idempotent handlers (opportunity refresh, payment reconciliation, notifications, maintenance).
    await pool.query(`update background_job set status='completed', updated_at=now() where id=$1`, [job.id]);
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    console.error('Worker tick failed', error);
  } finally {
    client.release();
  }
}

await ensureJobsTable();
console.log(`Skill2Work worker running; poll interval ${pollMs}ms`);
setInterval(() => void tick(), pollMs);
await tick();

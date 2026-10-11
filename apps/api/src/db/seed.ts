import { pool } from './pool.js';

await pool.query(`
  create table if not exists app_setting (
    key text primary key,
    value text not null,
    updated_at timestamptz not null default now()
  );
`);

await pool.query(`
  insert into app_setting(key, value)
  values ('ai.enabled', coalesce(current_setting('app.ai_enabled', true), 'false'))
  on conflict (key) do nothing;
`);

console.log('Skill2Work application seed complete.');
await pool.end();

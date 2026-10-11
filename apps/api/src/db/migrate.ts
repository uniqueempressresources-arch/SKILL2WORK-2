import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from './pool.js';

const here = dirname(fileURLToPath(import.meta.url));
const migration = await readFile(join(here, 'migrations/001_profile.sql'), 'utf8');

await pool.query(migration);
console.log('Skill2Work application schema migration complete.');
await pool.end();

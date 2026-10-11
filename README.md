# Skill2Work — Online Deployment & First E2E System

Skill2Work is an AI-powered skills, career and opportunity platform built around:

**DISCOVER → DEVELOP → PROVE → MATCH → EARN**

This repository is the first full-stack implementation foundation. It now includes the first real authenticated user slice: account creation/sign-in plus a PostgreSQL-backed Skill2Work profile.

## Stack

- Web: React + TypeScript + Vite
- API: Node.js + TypeScript + Fastify
- Database: PostgreSQL
- Authentication: Better Auth with email/password
- Payments: Paystack server-side boundary, disabled until Phase 10 verification
- AI: optional server-side adapter, disabled by default
- Jobs: PostgreSQL-backed worker foundation
- Local development: PostgreSQL via Docker Compose or a local PostgreSQL installation
- Production target: Render Blueprint

Better Auth supports PostgreSQL through a `pg.Pool` and provides a Fastify catch-all auth handler plus `auth.api.getSession` for server-side session checks. citeturn0search0turn0search1

## First end-to-end flow

```text
Browser
  ↓
Better Auth / Fastify API
  ↓
PostgreSQL user + session tables
  ↓
Authenticated Profile API
  ↓
app_profile table
  ↓
Profile retrieved back into React
```

## Local setup

### 1. Requirements

Install:
- Node.js 20+
- npm
- PostgreSQL 15+ OR Docker Desktop/Engine

### 2. Configure environment

```bash
cp .env.example .env
```

Set a long random value for `BETTER_AUTH_SECRET`.

### 3. Start PostgreSQL with Docker

```bash
docker compose -f infra/docker-compose.yml up -d db
```

Or use an existing local PostgreSQL instance and keep the `DATABASE_URL` in `.env` aligned with it.

### 4. Install dependencies

```bash
npm install
```

### 5. Create Better Auth tables

```bash
npm run auth:migrate
```

Better Auth's PostgreSQL documentation supports `npx auth@latest migrate` for its built-in database adapter. citeturn0search0turn0search7

### 6. Create Skill2Work application tables

```bash
npm run db:setup
```

This creates the `app_profile` table and the initial application setting.

### 7. Build everything

```bash
npm run build
```

### 8. Start the API and web app

In one terminal:

```bash
npm run dev:api
```

In another:

```bash
npm run dev:web
```

Open:

`http://localhost:5173`

## Test the first genuine user journey

1. Click **Create account**.
2. Enter a name, email and password.
3. Confirm the account is created and you become signed in.
4. Fill in your Skill2Work profile.
5. Click **Save profile**.
6. Confirm the page says the profile was saved to PostgreSQL.
7. Refresh the browser.
8. The API session is restored and the profile is fetched again from `/api/profile`.
9. Confirm the updated timestamp appears.
10. Click **Sign out**, then sign in again and confirm the profile is retrieved again.

The browser does not connect directly to PostgreSQL; all private profile operations pass through the authenticated Fastify API.

## Security boundaries

- Never place database, Better Auth, Paystack or AI secrets in browser `VITE_*` variables.
- Keep payment initialization and verification server-side.
- Restrict production CORS origins.
- Use HTTPS in production.
- Require authentication for private profile routes.
- Validate profile input with Zod.
- Keep AI disabled until quotas, cost controls and provider handling are implemented.

Vite documents that `VITE_*` variables are exposed to client-side code, so secrets must never use that prefix.

## Current limitation of this delivery environment

The implementation was prepared and the dependency installation was attempted. The current execution environment could not resolve `registry.npmjs.org`, so npm packages could not be downloaded and a real compile/runtime test could not be truthfully completed here. No claim of successful local execution is being made until dependencies are installed in a network-enabled environment.

## Next phase

After the first end-to-end authentication/profile test passes:

**Phase 9B → production deployment of web + API + PostgreSQL**

Then:

**Phase 10 → Paystack test-mode verified payments**

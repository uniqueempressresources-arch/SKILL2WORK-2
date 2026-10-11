# Skill2Work Phase 9–13 Deployment Checklist

## Phase 9 — Production Foundation
- [ ] Push repository to GitHub.
- [ ] Create Render PostgreSQL.
- [ ] Deploy API as a Render Web Service.
- [ ] Deploy web as a Render Static Site.
- [ ] Deploy worker only after the database job table is stable.
- [ ] Set `CLIENT_ORIGIN`, `BETTER_AUTH_URL`, `DATABASE_URL`, `BETTER_AUTH_SECRET` in Render.
- [ ] Add custom domain + HTTPS.
- [ ] Run Better Auth migration against production DB.
- [ ] Verify `/health` and `/api/me`.
- [ ] Confirm CORS is restricted to the production web origin.

## Phase 10 — Verified Payments
- [ ] Create products/plans in Paystack.
- [ ] Backend creates internal pending payment record.
- [ ] Backend initializes Paystack transaction.
- [ ] Browser receives only checkout data.
- [ ] Webhook signature verified.
- [ ] Transaction reference, user, product, amount and currency verified.
- [ ] Payment verified with Paystack API.
- [ ] Fulfilment is idempotent.
- [ ] Repeated webhook test passes.
- [ ] Failed/reversed/refunded states handled.
- [ ] Live keys added only after test-mode sign-off.

## Phase 11 — Selective AI
- [ ] AI feature flags exist.
- [ ] User quotas exist.
- [ ] Input/output limits exist.
- [ ] Cost tracking exists.
- [ ] Model routing exists.
- [ ] AI fallback works.
- [ ] Global AI kill switch tested.
- [ ] Sensitive profile data is minimized before provider calls.

## Phase 12 — Background Automation
- [ ] DB-backed job queue tested.
- [ ] Worker retry policy implemented.
- [ ] Jobs have idempotency keys.
- [ ] Failed jobs are inspectable.
- [ ] Payment reconciliation job tested.
- [ ] Opportunity refresh job tested.
- [ ] Notifications require consent.
- [ ] Monitoring/alerts enabled.

## Phase 13 — Controlled Public Beta
- [ ] Invite-only access.
- [ ] Small payment test cohort.
- [ ] Small AI quota.
- [ ] Error and cost alerts.
- [ ] Weekly reliability review.
- [ ] Security review.
- [ ] Increase capacity only from observed demand.

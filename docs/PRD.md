# Product Requirements Document: Skill2Work

## 1. Overview

**Product Name:** Skill2Work  
**Version:** 1.0 MVP  
**Platform:** Mobile-first web app / PWA  
**Initial Market:** Nigeria  
**Product Type:** AI-powered skills, career and opportunity platform

### 1.1 Purpose

Skill2Work helps people discover their strengths, identify suitable career and income paths, develop relevant skills, improve their professional profile, and find relevant opportunities.

Core journey:

**DISCOVER → DEVELOP → PROVE → MATCH → EARN**

### 1.2 Target Audience

- Job seekers
- Students and graduates
- Underemployed professionals
- Career changers
- Freelancers
- Skilled people seeking to monetize their abilities
- Artisans and skilled-trade professionals seeking clients, gigs, contracts, or employment
- Employers, recruiters, and service clients (Phase 2)

### 1.3 Design Principles

1. Mobile-first — primary experience must work well on small screens.
2. Action-oriented — every recommendation should lead to a practical next step.
3. Simple — users should understand their next action without training.
4. Trust-first — opportunities must show verification status.
5. Explainable AI — recommendations must include reasons and gaps.
6. Privacy by default — personal career data must not be exposed without consent.
7. Accessible — target WCAG 2.1 AA for core interactions.

### 1.4 MVP Architecture

The MVP moves from a browser-only prototype to a small full-stack application while remaining completely local during development.

- **Frontend framework:** React + TypeScript + Vite.
- **Backend framework:** Node.js + TypeScript + Fastify.
- **Database:** PostgreSQL running locally.
- **Authentication:** Better Auth connected to the local PostgreSQL database. Better Auth supports PostgreSQL connections and database migrations.
- **File storage:** Local filesystem during development, using a project `storage/uploads/` directory for CVs and other user files.
- **AI:** Server-side service layer; API keys must remain in backend environment variables and must never be exposed to the browser.
- **App runtime:** Frontend and backend run locally on the developer machine.
- **Database runtime:** PostgreSQL runs locally on the developer machine (or a local Docker container).
- **Prototype data:** Existing LocalStorage demo data may remain temporarily for UI prototyping, but persistent product data must move to PostgreSQL as each feature is implemented.
- **Future deployment:** Cloud hosting, managed PostgreSQL, object storage and production authentication configuration are deferred until the local MVP is validated.

This architecture is intentionally modular so the local file-storage layer can later be replaced by S3-compatible object storage without changing the user-facing CV/profile workflow.

### 1.5 Implementation Tool Decisions

| Area | Decision | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast mobile-first web development, strong component model, and easy local setup. |
| Backend | Node.js + TypeScript + Fastify | Keeps the API lightweight and uses the same language as the frontend. |
| Database | PostgreSQL | Relational structure fits users, skills, assessments, CVs, opportunities and applications. |
| Authentication | Better Auth | Provides application authentication/session management while connecting directly to the local PostgreSQL database. |
| File storage | Local filesystem | Simplest option for local MVP testing; avoids introducing cloud storage before the workflow is validated. |
| AI integration | Backend service adapter | Protects secrets and allows the LLM provider to be changed later. |

**Local development requirement:** The Skill2Work app and PostgreSQL database must run locally for the MVP. No cloud database or cloud file-storage dependency is required to start development.

### 1.6 Decision Note — Supabase vs Local Stack

**Decision:** Use the local stack above instead of making Supabase the required backend for the first implementation.

**Reason:** The PRD previously listed “Supabase or equivalent managed backend” as an option. For this implementation, the requirement is to explicitly run both the application and database locally. PostgreSQL + Better Auth gives Skill2Work a real relational database and authentication foundation without making the MVP dependent on a hosted service. Better Auth documents direct PostgreSQL support and local connection configuration.

**Revisit later:** Supabase may be evaluated for hosted PostgreSQL, authentication, storage and deployment after the local MVP passes beta validation. This is a future infrastructure decision, not an MVP dependency.


### 1.7 Core Data Model

```js
// User profile
{
  id: "uuid",
  name: "Amina Yusuf",
  email: "amina@example.com",
  location: "Lagos, Nigeria",
  goal: "Find remote work",
  education: "BA",
  experienceYears: 3,
  skills: ["communication", "teaching", "customer-service"],
  languages: ["English", "French"],
  preferences: {
    workMode: "remote",
    employment: "full-time"
  }
}

// Skill assessment result
{
  skill: "Communication",
  score: 88,
  evidence: ["scenario-03", "task-01"],
  level: "strong"
}

// Opportunity
{
  id: "job-001",
  title: "Customer Support Specialist",
  organisation: "Example Company",
  location: "Remote",
  type: "Job",
  requiredSkills: ["communication", "customer-service"],
  match: 87,
  verification: "verified",
  deadline: "2026-10-15"
}
```

### 1.8 Storage Keys

- `skill2work_profile`
- `skill2work_assessment`
- `skill2work_opportunities`
- `skill2work_saved`
- `skill2work_settings`
- `skill2work_version`

### 1.9 Browser Support

Target current Chrome, Edge, Firefox and Safari on mobile and desktop.

---

# 2. Phase 1 — MVP

## 2.1 Features

| Feature | Description | Priority |
|---|---|---|
| Onboarding | Capture user goal and basic profile | P0 |
| Skills Assessment | Scenario-based assessment | P0 |
| Skills DNA | Show strongest skill areas | P0 |
| Career Recommendations | Map skills to career directions | P0 |
| AI Career Coach | Guided career/income questions | P0 |
| CV Builder | Generate/improve CV content | P0 |
| Opportunity Hub | Search and filter opportunities | P0 |
| Opportunity Matching | Show explainable match score | P0 |
| User Profile | Skills, experience, CV and preferences | P0 |
| Artisan & Skilled Trade Profile | Capture trade, services, work area, availability, experience and portfolio evidence | P0 |
| Artisan Opportunity Matching | Match artisans to local gigs, service requests, contracts and relevant jobs | P0 |
| Saved Opportunities | Bookmark opportunities | P1 |
| Interview Coach | Practice interview questions | P1 |
| Learning Paths | Recommend skill-gap learning | P1 |

## 2.2 User Experience

### User Flow 1: First-Time Setup

1. User opens Skill2Work.
2. User selects a primary goal.
3. User enters basic education, experience and skills.
4. User completes the Skills DNA assessment.
5. System calculates an initial skill profile.
6. Dashboard displays strengths, career directions and next actions.

### User Flow 2: Discover Career Direction

1. User opens Skills DNA.
2. User sees top skill areas.
3. User selects a recommended career.
4. App shows why the career fits.
5. App shows existing strengths and skill gaps.
6. User chooses a next action: learn, improve CV, practise interview or find opportunities.

### User Flow 3: Find an Opportunity

1. User opens Opportunities.
2. App displays personalised opportunities.
3. User filters by job type, work mode or category.
4. User opens an opportunity.
5. App displays match reasons and gaps.
6. User saves or applies through the supplied application route.

### User Flow 4: Ask AI Career Coach

1. User opens AI Coach.
2. User selects a suggested question or types their own.
3. AI receives relevant profile context.
4. AI returns concise advice.
5. Response includes a practical next action.

### User Flow 5: Artisan Finds Work or Clients

1. Artisan selects **Artisan / Skilled Trade** during onboarding.
2. User selects a trade and the specific services they provide.
3. User adds experience, service area, availability, tools/equipment and portfolio photos where relevant.
4. Skills DNA combines transferable skills with practical/trade skills.
5. Skill2Work recommends suitable jobs, gigs, service requests and contracts.
6. The artisan can create a service profile, respond to opportunities, or share a professional profile with a client.
7. After completed work, the user can request a review or verified work evidence.

## 2.3 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px–1024px
- Desktop: > 1024px

---

# 3. Skills DNA Assessment

## 3.1 Initial Skill Categories

- Communication
- Teaching
- Leadership
- Sales
- Customer Service
- Organisation
- Creativity
- Problem Solving
- Digital Skills
- People Skills
- Language Skills
- Entrepreneurship
- Skilled Trades / Artisan Skills
- Technical / Practical Skills

## 3.2 Assessment Layers

### Layer A — Self Assessment

User rates confidence in a skill.

### Layer B — Situational Questions

User responds to realistic work scenarios.

### Layer C — Practical Mini Tasks

Short tasks can test writing, prioritisation, communication or problem solving.

## 3.3 Scoring

MVP scoring combines:

- Self-report: 30%
- Scenario performance: 50%
- Practical task: 20%

Scores should be displayed as **assessment indicators**, not objective claims about a person's worth or ability.

## 3.4 Output

Example:

```text
YOUR SKILLS DNA

Communication      88%
Teaching           91%
Organisation       84%
Customer Service   79%
Digital Skills     63%

Strongest career areas:
Education & Training
Customer Success
Recruitment
Language Services
Sales
```

---

# 4. Career Matching

## 4.1 Initial Career Categories

- Customer Service
- Sales
- Teaching & Training
- Recruitment
- Virtual Assistance
- Digital Marketing
- Content Creation
- Translation & Language Services
- Administration
- Freelancing

## 4.2 Matching Inputs

Initial weighting:

| Factor | Weight |
|---|---:|
| Skills | 35% |
| Experience | 20% |
| Education | 10% |
| Language | 10% |
| Work preference/location | 10% |
| User goal | 10% |
| Availability | 5% |

Weights must be configurable in future versions.

## 4.3 Explainability

Every match should show:

- Why you match
- Skills you already have
- Missing or weaker skills
- Recommended next action

Do not present a match score as a guarantee of employment.

---

# 5. AI Career Coach

## 5.1 Supported Questions

- What jobs fit my skills?
- How can I make money from my skills?
- What should I learn next?
- How can I change careers?
- How can I prepare for this job?
- How can I improve my CV?
- What can I do remotely?

## 5.2 Response Contract

AI responses should contain:

1. Direct answer
2. Reasoning based on profile
3. Practical options
4. Skill gaps where relevant
5. One clear next action

## 5.3 AI Safety / Accuracy

- Do not invent job vacancies.
- Clearly distinguish recommendations from verified facts.
- Avoid guaranteed income claims.
- Do not make hiring decisions automatically.
- Do not infer sensitive personal characteristics.
- Do not expose private profile information.

---

# 6. CV Builder

## 6.1 Inputs

- Existing CV
- Work experience
- Education
- Skills
- Target job

## 6.2 Outputs

- Professional summary
- Skills section
- Achievement-focused experience bullets
- Job-specific CV
- Cover letter (future)
- Improvement suggestions

## 6.3 Acceptance Criteria

- User can edit generated text.
- User can regenerate individual sections.
- User can save multiple CV versions.
- User can copy or export the final CV.

---

# 7. Artisan & Skilled Trade Hub

## 7.1 Purpose

Skill2Work must serve people whose skills are practical, technical, craft-based, or service-based—not only people pursuing conventional office jobs. Artisans should be able to use the same platform to **discover their strengths, build credibility, find work, get clients, and earn from their skills**.

## 7.2 Example Artisan Categories

The MVP can support categories such as:

- Electricians
- Plumbers
- Carpenters
- Welders / Metal fabricators
- Painters / Decorators
- Mechanics / Auto technicians
- Tailors / Fashion makers
- Hairdressers / Barbers / Beauty professionals
- Shoemakers / Leather workers
- Appliance / AC / Refrigeration technicians
- Phone / Computer repair technicians
- Caterers / Bakers
- Cleaners and home-service professionals
- Other verified practical or craft-based skills

The category list should be extensible rather than hard-coded to a small set of trades.

## 7.3 Artisan Profile

An artisan profile should include:

- Trade / occupation
- Services offered
- Years of experience
- Skills and specialisations
- Service area / preferred location
- Availability
- Job type preference (job, contract, gig, service request)
- Tools / equipment (optional)
- Certifications or licences where applicable
- Portfolio photos / project evidence
- Short business or service description
- Contact / application method
- Reviews and completed-work evidence when available
- Verification status

## 7.4 Artisan Skills DNA

The assessment should be able to recognise both transferable skills and practical strengths. Examples include:

- Precision
- Troubleshooting
- Safety awareness
- Manual / technical execution
- Customer service
- Reliability
- Estimation / costing
- Time management
- Creativity / design
- Communication

Scores remain assessment indicators, not definitive judgments of professional ability.

## 7.5 Artisan Opportunities

In addition to conventional jobs, the Opportunity Hub should support:

- Local service requests
- Short-term gigs
- Building / construction contracts
- Maintenance jobs
- Installation jobs
- Repair requests
- Event / production work
- Apprenticeships
- Trade-focused training
- Employment opportunities

Each opportunity should show location, required trade/skills, scope, timing, application/contact route, and verification status where available.

## 7.6 Artisan Matching

Artisan matching should consider:

- Trade and specific service match
- Practical skills
- Experience
- Service area / travel radius
- Availability
- Job type
- Certifications where required
- Portfolio evidence

For local service requests, location fit should carry more weight than generic employment preferences.

## 7.7 Trust & Safety

Because service clients may hire artisans directly, the product should progressively support:

- Identity/profile verification
- Skill or credential verification
- Completed-work evidence
- Client reviews
- Report / flag functionality
- Clear distinction between **verified information** and user-submitted claims

No verification badge should imply a guarantee of workmanship.

---

# 7. Opportunity Hub

## 7.1 Categories

- Jobs
- Remote Jobs
- Freelance
- Gigs
- Internships
- Training
- Scholarships
- Service Requests
- Artisan Gigs / Contracts

## 7.2 Opportunity Fields

- Title
- Organisation
- Description
- Required skills
- Experience
- Location
- Work mode
- Deadline
- Application route
- Verification status

## 7.3 Verification

Status values:

- `verified`
- `unverified`
- `flagged`

The MVP must make verification status visible.

---

# 8. User Profile

Profile contains:

- Name
- Professional headline
- Skills
- Skills DNA
- Experience
- Education
- Languages
- Certifications
- CV
- Portfolio items
- Work preferences
- Career goals
- User type / work identity (job seeker, professional, artisan, freelancer, employer/client)
- Trade / services offered, where applicable
- Service area and availability, where applicable
- Portfolio / work evidence

Future: Skill2Work Verified Skills.

---

# 9. Dashboard

Dashboard must show:

- Greeting
- Current goal
- Skills DNA summary
- Recommended career directions
- Recommended opportunities
- Recommended next action
- AI Coach entry point
- Profile completion
- Artisan/service opportunities when the user is an artisan or skilled-trade professional

Primary navigation:

**Home | Skills | Opportunities | AI Coach | Profile**

---

# 10. Design System

## 10.1 Visual Direction

Skill2Work should feel:

- Modern
- Trustworthy
- Energetic
- Professional
- Mobile-friendly
- African/global without relying on stereotypes

Suggested palette:

- Primary: deep indigo
- Accent: warm amber
- Success: green
- Background: soft neutral
- Text: dark slate

## 10.2 Typography

Use a clean sans-serif system stack.

- H1: 32–40px
- H2: 24–28px
- H3: 18–22px
- Body: 16px
- Small: 13–14px

## 10.3 Components

- Bottom navigation
- Cards
- Skill chips
- Progress bars
- Match badges
- Assessment options
- Modals
- Toasts
- Search
- Filter controls
- Empty states
- Loading states

---

# 11. Accessibility

Core MVP target:

- Keyboard accessibility on desktop
- Visible focus states
- Screen-reader labels
- Sufficient color contrast
- Reduced-motion support
- Semantic HTML
- Accessible form validation
- Do not rely on colour alone for status

---

# 12. Performance

Targets:

- Initial load < 2.5 seconds on a reasonable mobile connection
- Main interaction response < 100ms where local
- Assessment navigation feels instant
- Opportunity search < 500ms for local/demo data
- Avoid unnecessarily large dependencies

---

# 13. Security & Privacy

- Secure authentication when backend is introduced.
- Do not store API keys in frontend code.
- Private profile information must require consent before employer sharing.
- Users must be able to edit/delete their information.
- Opportunity data must be separated from private user data.
- AI requests should send only the minimum profile context required.

---

# 14. Phase 2 — Develop

Add:

- Learning Hub
- Skill-gap pathways
- Courses
- Quizzes
- Certificates
- Portfolio projects
- Interview Coach
- Progress tracking

Goal:

**Help users close the gap between current skills and target opportunities.**

---

# 15. Phase 3 — Prove

Add:

- Practical assessments
- Verified Skills
- Portfolio evidence
- References
- Credential verification
- Skill verification badges

Goal:

**Give users evidence they can show employers.**

---

# 16. Phase 4 — Match

Add:

- Employer accounts
- Job posting
- Candidate search
- Candidate matching
- Recruiter dashboard
- Interview workflows

Goal:

**Connect verified talent with employers.**

---

# 17. Phase 5 — Earn

Add:

- Freelance marketplace
- Service listings
- Client requests
- Payments
- Reviews
- International opportunities

Goal:

**Help users turn verified skills into income.**

---

# 18. Business Model

### Free

- Basic profile
- Basic Skills DNA
- Limited AI Coach
- Limited opportunities

### Pro

Indicative: ₦2,500–₦5,000/month.

- Advanced AI Coach
- CV tools
- Interview preparation
- Skill-gap analysis
- Career roadmaps
- Premium resources

### Employer

- Job posting
- Candidate search
- AI matching
- Recruitment packages

Future:

- Marketplace transaction fee
- Corporate training
- Premium verification

---

# 19. Success Metrics

Primary:

**Meaningful Career Action Rate**

Percentage of users who complete at least one meaningful action after assessment:

- CV created
- Opportunity saved
- Opportunity applied to
- Learning path started
- Portfolio item created
- Interview practice completed

Secondary:

- Registration completion
- Skills assessment completion
- 7-day retention
- 30-day retention
- AI Coach usage
- Opportunity application rate
- Paid conversion
- Employer successful-match rate

---

# 20. MVP Acceptance Criteria

- User can register or create a local demo profile.
- User can complete the Skills DNA assessment.
- Assessment produces consistent scores from defined rules.
- Dashboard displays personalised results.
- User can view recommended careers.
- User can see why a career is recommended.
- User can identify skill gaps.
- User can use the AI Coach interface.
- User can create/edit a CV profile.
- User can browse and filter opportunities.
- Opportunities display match and verification status.
- User can save opportunities.
- Profile persists between sessions.
- Mobile layout is usable on a narrow screen.
- Core interactions are keyboard accessible.
- No API secrets are exposed in frontend code.

---

# 21. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AI gives poor career advice | Structured prompts + profile context + clear limitations |
| Fake opportunities | Verification status + reporting + moderation |
| Users abandon assessment | Keep MVP assessment short and progressive |
| Match scores mislead users | Explain factors; never guarantee outcomes |
| Privacy concerns | Consent and minimum-data design |
| Scope becomes too large | Maintain strict MVP/phase boundaries |
| Low willingness to pay | Validate premium features before expanding |
| Poor opportunity supply | Start with curated opportunities and employer submissions |

---

# 22. Ordered Implementation Plan

The implementation follows the product journey while keeping dependencies in the correct technical order. Each phase has concrete outputs and a completion gate.

### Phase 0 — Project Setup & Local Environment

**Goal:** Make the application and database runnable locally before feature work begins.

Build:
- React + TypeScript + Vite frontend.
- Node.js + TypeScript + Fastify backend.
- PostgreSQL local database.
- Better Auth configuration.
- Environment-variable configuration.
- Git repository and `.gitignore`.
- Local `storage/uploads/` directory.
- Basic API health endpoint.
- Database connection check.

**Concrete outputs:**
- `frontend/` runs locally.
- `backend/` runs locally.
- PostgreSQL database is created and reachable.
- Authentication service can start.
- `/health` confirms backend availability.
- No secrets are committed to Git.

**Completion gate:** A developer can start the frontend, backend and database locally and verify all three are connected.

### Phase 1 — Foundation, Authentication & Profile

**Goal:** Establish real users and persistent professional profiles.

Build:
- Registration.
- Login/logout.
- Session handling.
- Protected routes.
- User profile.
- Career goal and work preferences.
- Education.
- Experience.
- Languages.
- Skills.

**Concrete outputs:**
- Auth pages and flows.
- User/profile database tables.
- Profile API endpoints.
- Profile form connected to PostgreSQL.
- Basic dashboard shell.

**Completion gate:** A user can register, log in, update a profile, log out and log back in with data preserved.

### Phase 2 — Skills DNA Assessment

**Goal:** Turn user responses into an explainable skills profile.

Build:
- Skills taxonomy.
- Assessment question model.
- Self-assessment questions.
- Scenario questions.
- Practical mini-task responses.
- Deterministic scoring rules for MVP.
- Skills DNA results.
- Strengths and development areas.

**Concrete outputs:**
- Skills and assessment database tables.
- Assessment UI.
- Scoring service.
- Skills DNA results page.
- Explanation of why each major skill was identified.

**Completion gate:** A user can complete an assessment and receive repeatable results stored in PostgreSQL.

### Phase 3 — Career Recommendations & AI Coach

**Goal:** Convert Skills DNA into practical career guidance.

Build:
- Career taxonomy.
- Career-to-skill relationships.
- Rule-based baseline recommendations.
- Skill-gap analysis.
- AI Career Coach API.
- AI response structure: recommendation → why it fits → existing skills → gaps → next action.
- AI safety and verification rules.

**Concrete outputs:**
- Career recommendation service.
- Skill-gap service.
- Secure AI service adapter.
- AI Coach chat interface.
- Prompt templates stored outside UI code.
- Logging that excludes sensitive data where possible.

**Completion gate:** The system can explain at least three career directions from a user's stored profile and the AI Coach can answer profile-aware questions without exposing an API key.

### Phase 4 — CV Builder & File Handling

**Goal:** Help users turn their profile into a usable professional CV.

Build:
- CV profile sections.
- CV generation/editing workflow.
- Target-role selection.
- CV improvement suggestions.
- CV versions.
- PDF export.
- Existing CV upload.
- Local file-storage service.

**Concrete outputs:**
- CV database tables.
- CV editor.
- CV generation service.
- Upload endpoint.
- Local file metadata records.
- Download/delete controls with ownership checks.

**Completion gate:** A user can create a CV, save versions, upload a CV and retrieve only their own files.

### Phase 5 — Opportunity Hub & Matching

**Goal:** Connect users to trustworthy opportunities.

Build:
- Opportunity database.
- Opportunity creation/admin workflow.
- Verification status.
- Search.
- Filters.
- Opportunity details.
- Save opportunity.
- Application tracking.
- Matching service using the PRD's configurable weights.
- Match explanation and skill gaps.

**Concrete outputs:**
- Opportunity and application tables.
- Opportunity API.
- Opportunity Hub UI.
- Matching service.
- Saved opportunities.
- Verification labels and warning states.

**Completion gate:** A user can search opportunities, understand why an opportunity matches, save it and record an application action.

### Phase 6 — Integration, Security & Quality

**Goal:** Make the MVP reliable enough for controlled beta testing.

Build:
- End-to-end user journey.
- Authorization checks.
- File ownership checks.
- Input validation.
- Error handling.
- Rate limits for sensitive endpoints.
- Accessibility checks.
- Responsive/mobile testing.
- Database backup/restore procedure for local development.
- Test data and seed scripts.

**Concrete outputs:**
- Automated unit/integration tests for core services.
- Manual acceptance-test checklist.
- Security checklist.
- Seed data.
- Local backup instructions.
- Updated README with exact setup commands.

**Completion gate:** Core MVP acceptance criteria pass without critical authentication, privacy, data-loss or navigation defects.

### Phase 7 — Closed Beta

**Goal:** Validate the complete journey with real users before public launch.

Target:
- Approximately 50–100 beta users.

Measure:
- Registration completion.
- Skills assessment completion.
- AI Coach usage.
- CV creation.
- Opportunity views.
- Opportunity saves/applications.
- Meaningful Career Action Rate.
- User feedback and drop-off points.

**Concrete outputs:**
- Beta feedback report.
- Prioritised bug list.
- Prioritised product improvements.
- MVP readiness decision.

**Completion gate:** The team can identify the highest-value product improvements from actual user behaviour and feedback.

### Phase 8 — Public MVP Preparation

**Goal:** Prepare for eventual hosted deployment without changing the validated product unnecessarily.

Only after local/beta validation:
- Evaluate managed PostgreSQL.
- Evaluate object/file storage such as S3-compatible storage.
- Evaluate hosted authentication configuration.
- Configure production domains and HTTPS.
- Add production monitoring and backups.
- Review privacy, data retention and consent requirements.

**Concrete output:**
- Separate production deployment plan.

**Important:** Cloud deployment is deliberately outside the initial local implementation.

### Implementation Dependency Order

`LOCAL SETUP → AUTH/PROFILE → SKILLS DNA → CAREER/AI → CV/FILES → OPPORTUNITIES/MATCHING → SECURITY/QA → BETA → PRODUCTION`

Do not begin advanced marketplace, employer automation, payments or international opportunity features until the core user journey has been validated.

---

# 23. Product Principle

Skill2Work must not merely tell users what they *could* do.

Every major recommendation should lead to a practical next step:

**IMPROVE YOUR CV →**

**LEARN THIS SKILL →**

**PRACTISE THIS INTERVIEW →**

**CREATE THIS PORTFOLIO ITEM →**

**APPLY FOR THIS OPPORTUNITY →**

**START THIS INCOME PLAN →**

---

# 24. One-Sentence Definition

> Skill2Work is an AI-powered platform that helps people discover their skills, identify career and income pathways, develop missing skills, prove their abilities, and connect with relevant opportunities.


---

# 30. DESIGN REFINEMENT NOTE — 2026-09-27

The visual design was refined before the initial working prototype to improve readability and reduce visual ambiguity on mobile screens.

### Changes made

- Replaced the less predictable `Inter`-only font declaration with a clearer system-first font stack: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- Increased text contrast between primary text and muted/supporting text.
- Added a consistent light/dark theme-aware colour system using CSS `light-dark()`.
- Kept deep indigo as the primary brand colour and amber as the supporting accent so important actions remain visually distinct.
- Increased button contrast and added visible keyboard/focus states.
- Strengthened borders and surface separation so cards and form fields remain distinguishable without relying on shadows alone.
- Increased spacing and simplified card layouts to make the interface easier to scan on a Samsung-sized mobile screen.
- Added a clear sample input to the design preview so form styling can be reviewed before feature implementation.
- Kept `design.html` as a visual/design reference only. The working application is implemented separately in `index.html`.

### Design decision

The priority is **clarity before decoration**. Skill2Work should make the user's next action obvious without requiring the user to interpret low-contrast text, crowded cards, or decorative UI.


# 31. PRODUCT REFINEMENT NOTE — ARTISAN INCLUSION — 2026-10-04

Skill2Work has been expanded to intentionally include **artisans and skilled-trade professionals as first-class users**. The product must not assume that career success means getting an office or remote job. A plumber, electrician, tailor, welder, mechanic, beauty professional, repair technician, caterer, or other skilled worker should be able to discover strengths, prove skills, find gigs/contracts/service requests, connect with clients, and build an income pathway.

### Design and product changes

- Added **Artisan / Skilled Trade** as an explicit user type.
- Added an **Artisan & Skilled Trade Hub** to the product requirements.
- Expanded Skills DNA to include practical, technical, safety, precision, troubleshooting, estimating and other trade-relevant capabilities.
- Added service-focused profiles containing trade, services, service area, availability and portfolio evidence.
- Expanded opportunities to include service requests, local gigs, contracts, maintenance and repair work.
- Added artisan-specific matching factors, especially trade fit and location/service area.
- Added progressive trust features such as reviews, work evidence and verification status.
- Kept privacy and verification safeguards: user claims must not be presented as verified facts.

### Product principle

Skill2Work should help every user move from **"What can I do?"** to **"Here is what I can do, here is proof of my skill, and here is a relevant opportunity or client."**

# 31. ONLINE DEPLOYMENT, PAYMENTS, AI & AUTOMATION PLAN — 2026-10-04

## 31.1 Production Direction

Skill2Work now moves from local MVP validation toward a controlled online beta. Online deployment must not mean enabling every capability at once. Each external service must earn its place by improving a core product outcome.

**Production principle:** Secure first → reliable second → useful capability third → optimise cost continuously.

The production stack will use:

- **Frontend:** React + TypeScript + Vite deployed as a public web application.
- **Backend:** Node.js + TypeScript + Fastify deployed as the protected API layer.
- **Database:** Managed PostgreSQL in production; local PostgreSQL remains the development database.
- **Authentication:** Better Auth with production HTTPS, secure cookies, appropriate session expiry and database-backed sessions.
- **File storage:** Production object storage for CVs and portfolio evidence; never rely on an ephemeral application filesystem for permanent user files.
- **Payments:** Paystack, initially for Skill2Work subscriptions and other approved digital purchases.
- **AI:** Optional server-side AI adapter with feature flags, quotas and provider/model controls.
- **Background automation:** Queue/worker architecture plus scheduled jobs for non-interactive tasks.

For the first online deployment, using one infrastructure provider for the application services, managed PostgreSQL, workers and cron jobs is preferred to reduce operational complexity. Render is a suitable candidate because it supports web services, static sites, Postgres, background workers and cron jobs. citeturn0search5turn0search4turn0search0turn0search2

**Deployment decision:** Start with a small Render-based production stack, subject to final pricing and availability checks before launch. Keep the application portable so another provider can be introduced later without redesigning the product.

## 31.2 Secure Integration Rules

1. No payment secret keys, AI API keys, database credentials or authentication secrets in frontend code.
2. All external API calls that require secrets must go through the backend.
3. Production secrets must be stored as environment/secret values, not committed to Git.
4. Separate development, staging/test and production credentials.
5. HTTPS is required for production authentication and payment flows.
6. Validate all incoming webhook signatures before processing events.
7. Use idempotency/unique references so retries cannot create duplicate payments, credits, subscriptions or fulfilments.
8. Apply authentication and authorisation to every private API route.
9. Validate and sanitise uploaded files; restrict size, type and access.
10. Log security-relevant events without logging passwords, secret keys or unnecessary personal data.
11. Apply rate limits to authentication, AI, payment and public search endpoints.
12. Keep third-party integrations behind service adapters so they can be replaced without changing product logic.

## 31.3 Verified Payments — Paystack

Paystack is the initial payment provider because Skill2Work's first market is Nigeria and the product needs a reliable server-side payment flow.

### Required payment flow

1. User selects a paid Skill2Work product/plan.
2. Frontend requests payment initialisation from the Skill2Work backend.
3. Backend creates the transaction and stores a pending payment record with a unique internal reference.
4. Frontend receives only the checkout information needed to complete payment.
5. Paystack processes the payment.
6. Skill2Work receives the Paystack webhook.
7. Backend verifies the webhook signature before processing it.
8. Backend checks the transaction reference, expected user, product and amount.
9. Backend verifies the transaction status with Paystack before delivering paid value when appropriate.
10. Backend records the final payment state and fulfils the subscription/entitlement exactly once.
11. Repeated webhook events must be safe and must not duplicate fulfilment.

Paystack recommends webhooks for payment updates, requires verification of webhook origin, and documents server-side transaction verification. It also explicitly recommends checking the transaction amount before delivering value. citeturn0search1turn0search3turn0search16

### Payment records

Store at minimum:

- Internal payment ID
- User ID
- Product/plan ID
- Currency
- Expected amount
- Paystack reference
- Provider transaction ID
- Status
- Created/updated timestamps
- Verified timestamp
- Fulfilment status

### Payment states

`initiated → pending → successful → fulfilled`

Alternative terminal states:

`failed`, `abandoned`, `reversed`, `refunded`

**Never grant paid access solely because a browser returned to a callback page.** The backend must establish payment success independently. citeturn0search16

## 31.4 Optional AI Capability

AI is an enhancement, not the foundation of Skill2Work. Core workflows must remain usable when AI is unavailable, over quota, too expensive, or temporarily disabled.

### AI features to enable selectively

**P0 — useful and controlled**

- AI Career Coach
- CV improvement
- Skill-gap explanation

**P1 — enable after usage evidence**

- Interview Coach
- Personalised learning-plan generation
- Artisan service-description assistance
- Portfolio/project feedback

**Do not enable by default:** open-ended autonomous agents, continuous AI monitoring, expensive media generation, or AI actions that can make irreversible account/payment decisions.

### AI gateway rules

All AI requests pass through a backend AI service adapter that controls:

- User eligibility
- Feature flag
- Monthly/daily quota
- Model selection
- Maximum input/output tokens
- Request timeout
- Retry policy
- Estimated cost
- Logging/analytics
- Fallback response

The browser must never call a paid AI provider directly with a secret API key.

### AI cost controls

- Use cheaper/smaller models for classification, extraction and simple rewriting.
- Reserve stronger models for tasks where quality materially matters.
- Limit request length and output length.
- Cache repeatable/non-personalised results where safe.
- Prefer structured prompts and JSON outputs for predictable workflows.
- Move long-running AI jobs to background workers.
- Give users clear quotas rather than unlimited AI usage.
- Track AI cost per user, feature and day.
- Add a global emergency kill switch for AI features.
- Do not generate AI content merely because it is technically possible.

## 31.5 Background Automation

Automation should remove repetitive operational work without creating hidden complexity.

### Initial automated jobs

1. **Opportunity refresh:** update, expire and flag stale opportunities.
2. **Payment reconciliation:** check unresolved payment records and reconcile provider status.
3. **Subscription maintenance:** activate, renew, expire or suspend entitlements according to verified payment state.
4. **AI job processing:** process queued CV, career or learning tasks outside the request path.
5. **Notifications:** send selected reminders and opportunity alerts only when useful and consented to.
6. **Data maintenance:** clean temporary files, expired sessions and old job records according to retention rules.
7. **Monitoring:** produce health and failed-job summaries for administrators.

Background workers are appropriate for long-running asynchronous tasks, while cron jobs are appropriate for scheduled work. Render documents both patterns and supports queue-backed workers and scheduled cron jobs. citeturn0search0turn0search2

### Automation reliability rules

- Every job has a unique job ID.
- Jobs must be retry-safe/idempotent.
- Use exponential backoff for transient failures.
- Set maximum retry counts.
- Record failed jobs for inspection/replay.
- Never allow one failed job to block unrelated jobs.
- Long-running webhook work must be acknowledged quickly and moved to background processing where appropriate. citeturn0search1

## 31.6 Online Deployment Phases

### Phase 9 — Production Foundation

**Goal:** Put the validated app online safely.

Build:

- Production React frontend
- Fastify API deployment
- Managed PostgreSQL
- Production authentication
- HTTPS/domain configuration
- Environment/secrets management
- Database migration process
- Error logging and health checks
- Basic backups/recovery procedure

**Completion gate:** A test user can securely register, sign in, use the core profile flow and persist data online.

### Phase 10 — Verified Payments

**Goal:** Introduce real-money transactions safely.

Build:

- Products/plans table
- Payment records
- Paystack test integration
- Server-side transaction initialisation
- Webhook endpoint
- Signature verification
- Transaction verification
- Amount/currency checks
- Idempotent fulfilment
- Payment history
- Refund/reversal handling path

**Completion gate:** Test-mode payments can be verified end-to-end without duplicate fulfilment. Only then enable live mode.

### Phase 11 — Selective AI

**Goal:** Add AI where it measurably improves user outcomes.

Build:

- Backend AI adapter
- Feature flags
- User quotas
- Usage/cost tracking
- Model routing
- Prompt/version management
- Safe fallback behaviour
- AI privacy controls

**Completion gate:** AI features can be disabled globally or per feature without breaking core Skill2Work workflows.

### Phase 12 — Background Automation

**Goal:** Make repetitive operations reliable and inexpensive.

Build:

- Job queue
- Worker service
- Scheduled jobs
- Retry/backoff policy
- Job status dashboard
- Dead-letter/failed-job handling
- Notification controls
- Payment reconciliation jobs

**Completion gate:** A failed third-party request can retry safely without creating duplicate user value or corrupting product state.

### Phase 13 — Controlled Public Beta

**Goal:** Validate real usage before scaling costs.

Release gradually:

- Invite-only beta
- Payment test group
- Small AI quota
- Monitoring and cost alerts
- Weekly reliability review
- User feedback loop
- Security review

Only increase capacity, AI limits, automation frequency or paid features when usage data demonstrates the need.

## 31.7 Production Cost Guardrails

Skill2Work must operate within explicit cost ceilings.

### Infrastructure

- Start with the smallest reliable production services.
- Avoid multiple always-on services until usage requires them.
- Prefer scheduled jobs over continuously running processes when appropriate.
- Monitor database storage, compute and bandwidth.
- Set alerts before spending becomes material.

### AI

- Per-user quotas
- Per-feature quotas
- Daily global budget
- Maximum tokens per request
- Model tiers
- Cost-per-feature reporting
- Automatic degradation to non-AI workflows when limits are reached

### Payments

- Never retry payment creation blindly.
- Use unique references.
- Verify before fulfilment.
- Reconcile unresolved transactions.
- Keep payment state in the database rather than trusting the browser.

## 31.8 Reliability & Observability

Production must expose enough information to answer:

- Is the app online?
- Are users able to authenticate?
- Is the database healthy?
- Are payments being verified?
- Are webhooks arriving and being processed?
- Are AI requests failing or becoming expensive?
- Are background jobs stuck?
- Are opportunity feeds stale?

Minimum monitoring:

- API health endpoint
- Database connectivity check
- Authentication error rate
- Payment success/failure/reversal counts
- Webhook processing failures
- AI usage and estimated cost
- Background job success/failure/retry counts
- Application error rate
- Response latency

## 31.9 Product Capability Principle

Skill2Work should **not** become an AI-powered collection of features simply because AI is available.

Every integration must answer:

1. What user problem does it solve?
2. Does it improve a measurable product outcome?
3. Can the feature fail safely?
4. Can its cost be controlled?
5. Can we disable or replace it without breaking the core product?

If the answer is no, the capability stays disabled until the case is proven.

**Core product remains:**

**DISCOVER → DEVELOP → PROVE → MATCH → EARN**

Online infrastructure, payments, AI and automation exist to make that journey more secure, reliable and useful—not to become the product themselves.

# 32. IMPLEMENTATION STRUCTURE CREATED — 2026-10-04

Phase 9 is now represented by an actual deployment-oriented repository structure rather than a browser-only prototype.

### Repository structure

```text
skill2work/
├── apps/
│   ├── web/                 # React + Vite frontend
│   └── api/                 # Fastify backend, auth, payments, AI, worker
├── packages/
│   └── shared/              # Shared TypeScript contracts
├── infra/
│   └── docker-compose.yml   # Local PostgreSQL
├── storage/
│   └── uploads/             # Local development file storage
├── docs/
│   ├── DEPLOYMENT-CHECKLIST.md
│   ├── IMPLEMENTATION-STATUS.md
│   └── design-reference.html
├── render.yaml              # Online deployment blueprint
├── .env.example
└── README.md
```

### Security boundary

Browser → Fastify API → PostgreSQL / Paystack / AI provider / file storage.

The browser never receives database credentials, Better Auth secrets, Paystack secret keys or AI provider keys. Vite client variables are restricted to public configuration such as the API URL.

### Current implementation status

- Phase 9 structure: **created**
- Local PostgreSQL configuration: **created**
- Fastify API: **created**
- Better Auth integration boundary: **created**
- Health endpoint: **created**
- Payment webhook verification boundary: **created; fulfilment remains gated**
- Optional AI service adapter: **created; disabled by default**
- Background worker foundation: **created; production handlers remain gated**
- Render deployment blueprint: **created**
- Production secrets: **not supplied and must be configured in the deployment platform**
- Live deployment: **not yet performed**

### Phase 9 exit gate

Do not move to live payments until the production database, authentication, HTTPS, health checks, environment secrets, CORS policy, backup/recovery plan and monitoring have been tested successfully.

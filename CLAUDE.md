# RevenOS — Codebase Context for AI Agents

> **Read this first.** This file contains everything you need to understand the RevenOS codebase before touching any file. Do not scan the full tree — use this as your source of truth.

---

## 1. What is RevenOS?

RevenOS is a **B2B AI-powered outbound sales automation platform**. It allows businesses ("workspaces") to run automated outreach campaigns where AI agents:
1. Find and qualify leads against an Ideal Customer Profile (ICP)
2. Send personalized outreach emails
3. Classify replies (interested / not interested / follow-up needed)
4. Book meetings on the user's calendar via Nylas

---

## 2. Monorepo Structure

```
revenos/
├── apps/
│   ├── api/          # Express REST API (Node.js + TypeScript)
│   ├── web/          # React SPA (Vite + React Router + Zustand)
│   ├── workers/      # BullMQ background job workers
│   └── docs/         # Documentation site (Next.js)
├── packages/
│   ├── db/           # Mongoose models (single source of truth for all DB types)
│   ├── agents/       # AI Agent classes (Prospector, Qualifier, Booker)
│   ├── queue/        # BullMQ queue definitions (shared by api + workers)
│   ├── billing/      # Credit engine and billing business logic
│   ├── email/        # Email sending via Resend (sendEmail helper)
│   ├── ai-sdk/       # Anthropic Claude wrapper (getModel, generateWithRetry)
│   ├── shared/       # Shared TypeScript types (mirrored from DB models — keep in sync)
│   ├── communication/
│   ├── ui/           # Shared UI component library
│   ├── eslint-config/
│   └── typescript-config/
├── .env              # Root env file (read by ALL apps — path resolved via ../../.env)
├── turbo.json        # Turborepo pipeline config
└── package.json      # Root workspace (npm workspaces)
```

**Package manager**: npm  
**Build orchestrator**: Turborepo (`npm run build`, `npm run dev`)  
**Node requirement**: >=18

---

## 3. Technology Stack

| Layer | Technology |
|-------|-----------|
| API Framework | Express.js (TypeScript, tsup bundler) |
| Frontend | React 18, Vite, React Router v6, Zustand, TailwindCSS |
| Database | MongoDB (Mongoose) |
| Cache / Queue broker | Redis (Upstash in prod, local Redis in dev) |
| Job queue | BullMQ |
| AI Model | Anthropic Claude (via `@revenos/ai-sdk`) |
| Auth | Clerk (`@clerk/express` on API, `@clerk/react` on web) |
| Email sending | Resend (`@revenos/email` package) |
| Calendar / Email read | Nylas v3 SDK |
| Payments | Razorpay (India-based — NOT Stripe. `RAZORPAY_*` env vars) |
| Error monitoring | Sentry |
| Admin queue UI | Bull Board at `/admin/queues` |

---

## 4. Environment Variables

All apps load from the **root `.env`** file (`path.join(process.cwd(), '../../.env')`).

### Required Variables

```env
# Auth
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=mongodb+srv://...     # NOTE: NOT MONGODB_URI — this is DATABASE_URL

# Redis
REDIS_URL=redis://...

# AI
ANTHROPIC_API_KEY=

# Email sending (via Resend)
RESEND_API_KEY=
FROM_EMAIL=
FROM_NAME=

# Nylas (calendar + mailbox read)
NYLAS_API_KEY=
NYLAS_CLIENT_ID=
CALENDAR_EMAIL=     # The mailbox email used for calendar free/busy checks

# Razorpay (payments — NOT Stripe)
RAZORPAY_API_TEST_KEY=
RAZORPAY_KEY_TEST_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_STARTER_ID=
RAZORPAY_PLAN_GROWTH_ID=
RAZORPAY_PLAN_SCALE_ID=

# Lead sourcing
SERP_API_KEY=       # serpapi.com
HUNTER_API_KEY=     # hunter.io
APOLLO_API_KEY=     # optional

# App
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
```

---

## 5. Authentication & Multi-Tenancy (CRITICAL)

### Auth Flow
1. **Clerk** handles all user authentication (JWT-based sessions).
2. `clerkMiddleware()` is registered globally in `app.ts` — it populates Clerk context without enforcing auth.
3. `requireAuthGuard` middleware enforces auth on protected routes. Attaches `req.user` (Clerk `AuthObject`).
4. `tenantGuard` middleware resolves the workspace for the request. Attaches `req.tenant`.

### ⚠️ Critical Rule for Controllers
**Never use `req.user?.workspaceId`** — this property does NOT exist on Clerk's `AuthObject`.  
**Always use `req.tenant!.id`** to get the workspace ID in controllers.

```typescript
// ❌ WRONG — will cause TypeScript error
const workspaceId = req.user?.workspaceId;

// ✅ CORRECT
const workspaceId = req.tenant!.id;
```

### Tenant Resolution (`tenantGuard`)
- Reads the `X-Tenant-ID` header from the request (optional).
- Looks up `WorkspaceMember` in MongoDB to verify membership.
- Caches the resolved `workspaceId` in Redis for 5 minutes (`workspace:member:{clerkId}:{workspaceId}`).
- Sets `req.tenant = { id: workspaceId, slug: workspaceId }`.

### Dev Bypass
In `NODE_ENV=development`, if there's no Clerk session, `requireAuthGuard` creates a fake `dev-user` and continues. **Do not rely on this in production code.**

---

## 6. API — Routes Map (`apps/api`)

All routes are prefixed with `/api/v1`. Protected routes require `requireAuthGuard`. Routes with data isolation require `tenantGuard` as well.

| Route | Auth | Description |
|-------|------|-------------|
| `GET /health` | Public | Health check |
| `POST /auth/*` | Public | Clerk webhook handlers |
| `POST /webhooks/*` | Signature-verified | Resend inbound email, Razorpay, Clerk |
| `GET/POST /workspaces` | requireAuth | Workspace CRUD |
| `GET/POST /leads` | requireAuth + tenantGuard | Lead management |
| `GET/POST /campaigns` | requireAuth + tenantGuard | Campaign management |
| `GET/POST /agents` | requireAuth + tenantGuard | Agent management |
| `GET /analytics` | requireAuth + tenantGuard | Analytics |
| `GET /meetings` | requireAuth + tenantGuard | Meeting list |
| `GET/POST /workflows` | requireAuth + tenantGuard | Visual workflow builder |
| `GET/PATCH /integrations` | requireAuth + tenantGuard | Nylas / Slack integrations |
| `GET/POST /billing` | requireAuth | Razorpay billing |
| `GET /admin/queues` | Admin-only | Bull Board UI |

**Key Controllers:**
- `campaigns.controller.ts` — campaign CRUD, start/pause/resume, lead upload via CSV, ICP sourcing
- `leads.controller.ts` — list leads, get lead, takeover (human control), handback to AI
- `integrations.controller.ts` — get integration status, PATCH email/calendar/slack
- `workflows.controller.ts` — visual workflow builder CRUD
- `billing.controller.ts` — Razorpay subscription, webhook handling, credit management

---

## 7. Database Models (`packages/db`)

All models are exported from `packages/db/src/index.ts`.

### `Workspace`
Multi-tenant root. Every data record is scoped to a `workspaceId`.
```typescript
{
  clerkOwnerId: string;   // Clerk user ID of the workspace owner
  name: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  integrations: {
    email?:    { provider, email, nylasGrantId, connectedAt }
    calendar?: { provider, calendarId, nylasGrantId, connectedAt }
    slack?:    { webhookUrl, channel, connectedAt }
  };
  settings: { timezone, emailDomain?, slackWebhookUrl? };
}
```

### `WorkspaceMember`
Links Clerk users to workspaces. Used by `tenantGuard` to verify workspace access.

### `Campaign`
```typescript
{
  workspaceId: string;
  status: "draft" | "running" | "paused" | "completed";
  settings: { icpDescription, industry, companySize, jobTitles, dailyEmailLimit, ... };
  agentIds: ObjectId[];  // References to Agent documents
  workflowId?: string;   // Optional link to a Workflow template
}
```

### `Lead`
**LeadStatus** is a union type. **Both sets of statuses below are valid and must all appear in the enum:**

**AI pipeline statuses** (agent-driven):
`pending` → `qualifying` → `qualified` → `outreach_sent` → `reply_received` → `interested` → `meeting_booked`

Also: `disqualified`, `not_interested`, `follow_up_scheduled`, `follow_up_sent`, `max_followups_reached`

**Frontend/manual statuses** (kanban/human-driven):
`prospecting`, `contacted`, `opened`, `closed`

### `EmailThread`
Tracks the full conversation thread for outreach. Has a `status` field:
`active` | `replied` | `bounced` | `unsubscribed` | `awaiting_slot_reply` | `meeting_booked` | `closed`

Also has `openedAt?: Date` (set when tracking pixel fires) and `proposedSlots[]` / `bookerMeta` / `meetingDetails` for the booking flow.

### `Meeting`
Created when a meeting is booked. Stores `scheduledAt`, `nylasEventId`, linked `leadId`, `campaignId`.

### `Agent`
Configuration for an AI agent (type, model, settings). Referenced by `Campaign.agentIds`.

### `AgentLog`
Low-level event log emitted by agent jobs (e.g., `booker.started`, `email.opened`).

### `Workflow`
Visual workflow builder nodes/edges. Has a `workflowId` (UUID) used in routes.

### Billing Models
- `CreditWallet` — per-workspace credit balance
- `CreditTransaction` — credit debit/credit history
- `CreditPackage` — available packages for purchase
- billing.model.ts — subscription state, Razorpay subscription ID

### Tenancy Plugin
All models **except Workspace and WorkspaceMember** use `tenancyPlugin`. This plugin automatically scopes all queries to `workspaceId`. Be careful when bypassing it (use `.collection.findOne()` to bypass when needed, as done in `webhook.service.ts`).

---

## 8. BullMQ Queues (`packages/queue`)

All queues connect to the same Redis instance. Workers **must** use `createWorkerConnection()` for their own connection.

| Queue Name | Purpose |
|------------|---------|
| `prospector` | Enriches leads against ICP, scores them, saves to DB |
| `qualifier` | Sends first outreach email AND classifies replies |
| `booker` | Phase 1: finds calendar slots, proposes them to lead |
| `booker-confirm` | Phase 2: classifies lead's slot reply, books Nylas calendar event |
| `outreach` | Sends follow-up emails |
| `followup` | Delayed scheduler — checks if a lead needs a follow-up |
| `feeder` | Batches pending leads and pushes them into the `prospector` queue |
| `credit-reset` | Resets monthly credits on subscription renewal |
| `credit-alert` | Sends low-credit warning notifications |

**Standard retry policy**: 3 attempts, exponential backoff starting at 2s.

---

## 9. AI Agents (`packages/agents`)

### Agent Pipeline Flow

```
Campaign starts
     │
     ▼
[feeder queue] batches pending leads (10 at a time)
     │
     ▼
[prospector queue] → ProspectorAgent → scores lead, saves icpScore, sets status=qualified
     │
     ▼
[qualifier queue "send-outreach"] → QualifierAgent → sends outreach email via Resend, sets status=outreach_sent
     │
     ▼ (lead replies — Resend webhook fires)
[qualifier queue "classify-reply"] → QualifierAgent → classifies reply (interested/not/followup)
     │
     ├── interested → [booker queue]
     │                     │
     │                     ▼
     │               BookerAgent Phase 1 → checks Nylas free/busy, proposes 3 slots, emails lead
     │                     │
     │                     ▼ (lead replies to slot email — webhook fires again)
     │               [booker-confirm queue]
     │                     │
     │                     ▼
     │               BookerAgent Phase 2 → AI classifies chosen slot, creates Nylas calendar event
     │                     │
     │                     ▼
     │               Meeting saved to DB, status=meeting_booked
     │
     └── follow-up needed → [followup queue] → delayed retry
```

### Lead State Machine
Located at `packages/agents/src/orchestrator/lead.statemachine.ts`.

`transitionLead()` enforces valid status transitions. Always use it when changing lead status programmatically in the agent layer. **Do not use it for manual/human-controlled status changes** (those bypass the machine and write directly).

### Nylas Integration (Current Status: Partial)
- The Booker agent reads `input.calendar.grantId` from the job payload.
- This `grantId` is currently read from `process.env.NYLAS_GRANT_ID` (hardcoded to dev env).
- **Planned**: Read `grantId` from `workspace.integrations.calendar.nylasGrantId` in DB.
- Nylas API key and client ID are in env. The full OAuth flow for user onboarding is **not yet implemented**.

---

## 10. Frontend (`apps/web`)

**Framework**: React 18 + Vite (not Next.js)  
**Routing**: React Router v6  
**State**: Zustand stores (one per domain)  
**Styling**: TailwindCSS + Google Material Symbols icons  
**HTTP**: Custom `useApi()` hook (thin wrapper around fetch with auth headers)

### Frontend Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | Home | Public landing page |
| `/login`, `/signup` | Auth pages | Kick logged-in users to dashboard |
| `/dashboard` | DashboardPage | Main overview |
| `/pipeline` | PipelinePage | Kanban board (4 columns: prospecting, contacted, qualified, meeting_booked) |
| `/campaigns` | CampaignsPage | Campaign list |
| `/campaigns/:id` | CampaignDetailsPage | Campaign details + lead list |
| `/campaigns/create` | CreateCampaignPage | Wizard to create campaign + upload CSV |
| `/leads` | LeadsPage | All leads table |
| `/leads/:id` | LeadDetailsPage | Lead detail + thread history |
| `/meetings` | MeetingsPage | Booked meetings list |
| `/analytics` | AnalyticsPage | Funnel + metrics |
| `/settings` | SettingsPage | Profile, integrations, billing tabs |
| `/agents` | AgentsPage | Agent list |
| `/agents/:id` | AgentDetailPage | Agent detail |
| `/agents/builder/:workflowId` | WorkflowBuilderPage | Visual workflow builder (fullscreen, no DashboardLayout) |

### Key Zustand Stores
- `useLeadStore` — lead list, activeLead, loading
- `useLeadStore > Lead.status` — uses the simplified kanban statuses (prospecting, contacted, qualified, meeting_booked, closed, disqualified)
- `useCampaignStore` — campaigns list
- `useMeetingStore` — meetings list
- `useBillingStore` — subscription + credit state
- `useAuthStore` — current user + workspace

### API Communication
The frontend sends the `x-tenant-id` header on every request to identify the active workspace.  
All API calls go through the `useApi()` hook which auto-attaches Clerk auth tokens.

---

## 11. Webhook Flow (`apps/api/src/services/webhook.service.ts`)

### Inbound Email (Resend)
1. Lead replies to outreach email at `contact+{threadId}@contact.leadxai.in`
2. Resend fires `email.received` webhook to `/api/v1/webhooks/resend`
3. `handleEmailReply` extracts `threadId` from the tracking address
4. Routes based on `thread.status`:
   - `active` / `replied` → queue `classifier-reply` job to qualifier queue
   - `awaiting_slot_reply` → queue `confirm-booking` to booker-confirm queue
   - `meeting_booked` / `closed` → ignore

### Email Open Tracking
- Open pixel fires `handleEmailOpen`
- Updates `EmailThread.openedAt`
- Updates `lead.status` to `"opened"` if currently `"contacted"`

---

## 12. Billing (`packages/billing`)

- **Payment provider**: Razorpay (India). Variables: `RAZORPAY_*`. **Not Stripe.**
- Billing is credit-based. Each email sent, lead scored, or meeting booked debits credits.
- Credit engine is in `packages/billing/src/creditEngin.service.ts`
- Subscription plans: `starter` | `growth` | `scale` (IDs in env as `RAZORPAY_PLAN_*_ID`)
- Razorpay webhook at `/api/v1/webhooks/razorpay`

---

## 13. Known Patterns & Conventions

### Workspace ID Access
```typescript
// In controllers (has req.tenant from tenantGuard middleware):
const workspaceId = req.tenant!.id;

// In services/agents (passed as parameter):
async function myService(workspaceId: string) { ... }

// Bypassing tenancy plugin in Mongoose (webhook service pattern):
await (EmailThread as any).collection.findOne({ externalThreadId: threadId });
```

### Error Handling
Custom error classes in `apps/api/src/errors/AppError.ts`:
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `BadRequestError` (400)

All thrown errors are caught by `errorHandler` middleware (last in chain). Routes use `asyncHandler()` wrapper to forward async errors.

### Path Aliases (API)
The API uses `@/` alias for `src/` defined in tsconfig.
```typescript
import { requireAuthGuard } from '@/middleware/auth.middleware';
```

### Package Imports
Internal packages are imported by their workspace package name:
```typescript
import { Lead, Campaign } from '@revenos/db';
import { sendEmail } from '@revenos/email';
import { qualifierQueue } from '@revenos/queue';
import { getModel } from '@revenos/ai-sdk';
```

---

## 14. What's Incomplete / Planned

| Feature | Status | Notes |
|---------|--------|-------|
| Nylas OAuth for user onboarding | ❌ Not implemented | Currently hardcoded to `.env` grant ID. Need backend auth-url + callback routes, frontend callback page |
| Slack integration connect | ❌ Placeholder | Shows toast, no real flow |
| Per-user Nylas grant ID | ❌ Not wired | Booker reads from env — should read from `workspace.integrations.calendar.nylasGrantId` |
| Workflow builder execution | ⚠️ Partial | Builder UI exists, execution via `workflowId` on Campaign is not fully connected |
| Apollo lead sourcing | ⚠️ Stub | `APOLLO_API_KEY` is optional; SerpAPI is the fallback |

---

## 15. Running Locally

```bash
# From repo root
npm install
npm run dev         # starts all apps in parallel via Turborepo

# Or individually
cd apps/api && npm run dev      # API on PORT from .env (default 5000)
cd apps/web && npm run dev      # Web on http://localhost:5173
cd apps/workers && npm run dev  # Background workers

# Build all
npm run build

# Type check
npm run check-types
```

> Make sure Redis is running locally before starting workers and API.

---

## 16. File Index (Key Files)

| File | Purpose |
|------|---------|
| `packages/db/src/models/lead.model.ts` | Lead schema + **all valid LeadStatus values** |
| `packages/db/src/models/workspace.model.ts` | Workspace schema including integrations sub-document |
| `packages/agents/src/orchestrator/lead.statemachine.ts` | Lead status transition rules (must be updated when adding statuses) |
| `packages/queue/src/queues.ts` | All BullMQ queue definitions |
| `apps/api/src/app.ts` | Express app factory — middleware order is critical |
| `apps/api/src/routes/index.ts` | All route registrations with their middleware chains |
| `apps/api/src/middleware/auth.middleware.ts` | Clerk auth guards |
| `apps/api/src/middleware/tenant.middleware.ts` | Workspace resolution from Clerk user ID |
| `apps/api/src/config/env.ts` | Zod-validated env schema — check here for all required vars |
| `apps/api/src/services/webhook.service.ts` | Resend inbound email + open tracking handler |
| `packages/agents/src/booker/BookerAgent.ts` | Two-phase meeting booking via Nylas |
| `apps/web/src/App.tsx` | All frontend routes |
| `apps/web/src/stores/lead.store.ts` | Frontend Lead type (uses simplified kanban statuses) |

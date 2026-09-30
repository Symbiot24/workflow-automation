# Workflow Automation Tool

> A lightweight, self-hosted Zapier / Make alternative — connect triggers to actions, automate anything.

---

## Current Progress

Track where you are at a glance. Update this section as you complete each phase.

| Phase | Name | Status |
|-------|------|--------|
| 0 | Project Setup & Tooling | ⬜ Not Started |
| 1 | Backend Foundation | ⬜ Not Started |
| 2 | Database Design & Migrations | ⬜ Not Started |
| 3 | Authentication & Users | ⬜ Not Started |
| 4 | Workflow CRUD (Core Domain) | ⬜ Not Started |
| 5 | Trigger & Action System (MVP Integrations) | ⬜ Not Started |
| 6 | Queue System (Redis + BullMQ) | ⬜ Not Started |
| 7 | Workflow Execution Engine | ⬜ Not Started |
| 8 | Frontend Foundation | ⬜ Not Started |
| 9 | Workflow Builder UI | ⬜ Not Started |
| 10 | Execution History & Monitoring | ⬜ Not Started |
| 11 | Retry, Error Handling & Dead-Letter Queue | ⬜ Not Started |
| 12 | Advanced Features & Polish | ⬜ Not Started |
| 13 | Testing & Hardening | ⬜ Not Started |
| 14 | Docker & Deployment | ⬜ Not Started |

**Legend:** ⬜ Not Started · 🟡 In Progress · ✅ Done

> **How to use this README:** Work through the phases top-to-bottom. Each phase has a definition of done — do not move on until every checkbox in that phase is ticked. Every checkbox uses `[ ]` so you can track progress directly in GitHub or any Markdown previewer.

---

## Table of Contents

- [1. Project Goal & Problem Statement](#1-project-goal--problem-statement)
- [2. Final Architecture Overview](#2-final-architecture-overview)
- [3. MVP Scope](#3-mvp-scope)
- [4. Development Roadmap](#4-development-roadmap)
  - [Phase 0 — Project Setup & Tooling](#phase-0--project-setup--tooling)
  - [Phase 1 — Backend Foundation](#phase-1--backend-foundation)
  - [Phase 2 — Database Design & Migrations](#phase-2--database-design--migrations)
  - [Phase 3 — Authentication & Users](#phase-3--authentication--users)
  - [Phase 4 — Workflow CRUD (Core Domain)](#phase-4--workflow-crud-core-domain)
  - [Phase 5 — Trigger & Action System (MVP Integrations)](#phase-5--trigger--action-system-mvp-integrations)
  - [Phase 6 — Queue System (Redis + BullMQ)](#phase-6--queue-system-redis--bullmq)
  - [Phase 7 — Workflow Execution Engine](#phase-7--workflow-execution-engine)
  - [Phase 8 — Frontend Foundation](#phase-8--frontend-foundation)
  - [Phase 9 — Workflow Builder UI](#phase-9--workflow-builder-ui)
  - [Phase 10 — Execution History & Monitoring](#phase-10--execution-history--monitoring)
  - [Phase 11 — Retry, Error Handling & Dead-Letter Queue](#phase-11--retry-error-handling--dead-letter-queue)
  - [Phase 12 — Advanced Features & Polish](#phase-12--advanced-features--polish)
  - [Phase 13 — Testing & Hardening](#phase-13--testing--hardening)
  - [Phase 14 — Docker & Deployment](#phase-14--docker--deployment)
- [5. Database Entities & Relationships](#5-database-entities--relationships)
- [6. API Endpoints](#6-api-endpoints)
- [7. Workflow Execution Flow](#7-workflow-execution-flow)
- [8. Queue / Retry / Dead-Letter Architecture](#8-queue--retry--dead-letter-architecture)
- [9. Integration / Plugin Architecture](#9-integration--plugin-architecture)
- [10. Frontend Pages & Features](#10-frontend-pages--features)
- [11. Testing Checklist](#11-testing-checklist)
- [12. Deployment Checklist](#12-deployment-checklist)
- [13. Final Project Checklist](#13-final-project-checklist)

---

## 1. Project Goal & Problem Statement

### The Problem

- Existing automation tools (Zapier, Make, n8n) are either **expensive at scale**, **closed-source**, or **overly complex** to self-host.
- Small teams and solo developers need a simple way to automate repetitive tasks — "when X happens, do Y" — without paying per-task fees or learning a heavyweight platform.
- Most tutorials build toy integrations; few show how to architect a **production-grade workflow engine** with queues, retries, and observability.

### The Goal

Build a **self-hosted workflow automation platform** where users can:

1. Create **workflows** — a trigger followed by one or more sequential actions.
2. Configure each trigger/action through a visual builder in the browser.
3. Execute workflows reliably via a background queue with retries and error handling.
4. Monitor every execution — status, logs, duration, and payload.

### Who Is This For?

- **You, the builder** — a developer who wants to deeply understand backend architecture, queue systems, and full-stack integration by building a real product end-to-end, manually, without AI-generated code.
- **End users** (future) — anyone who wants a simple, open, self-hosted Zapier alternative.

### Success Criteria

- [ ] A user can sign up, create a workflow, and activate it without touching code.
- [ ] Workflows execute reliably even when external services are temporarily down (retries).
- [ ] Every execution is recorded and inspectable.
- [ ] The system runs in Docker with a single `docker compose up`.

---

## 2. Final Architecture Overview

```
                         ┌─────────────────────────────────┐
                         │          Browser (React)         │
                         │   Workflow Builder · Dashboard   │
                         │   Execution History · Settings   │
                         └──────────────┬──────────────────┘
                                        │  REST API (JSON)
                                        ▼
                         ┌─────────────────────────────────┐
                         │     Fastify API Server (Node)    │
                         │  ┌───────────────────────────┐  │
                         │  │  Routes / Controllers     │  │
                         │  │  Services / Business Logic│  │
                         │  │  Plugins / Integrations   │  │
                         │  │  Auth (JWT) + Validation  │  │
                         │  └─────────────┬─────────────┘  │
                         └────────────────┼─────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
           ┌────────────────┐   ┌─────────────────┐   ┌──────────────────┐
           │   PostgreSQL   │   │  Redis + BullMQ │   │  External APIs   │
           │                │   │                 │   │                  │
           │  Users         │   │  workflow-queue │   │  Webhooks        │
           │  Workflows     │   │  retry-queue    │   │  Email (SMTP)    │
           │  Executions    │   │  dead-letter    │   │  HTTP endpoints  │
           │  Credentials   │   │  scheduled-jobs │   │  (extensible)    │
           └────────────────┘   └────────┬────────┘   └──────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  Worker Process   │
                              │  (BullMQ Worker)  │
                              │  Execution Engine │
                              │  Retry / DLQ      │
                              └──────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **React + Vite (Frontend)** | Visual workflow builder, dashboard, execution logs, auth pages |
| **Fastify API (Backend)** | REST API, auth, workflow CRUD, trigger registration, enqueue jobs |
| **PostgreSQL** | Durable storage — users, workflows, executions, credentials |
| **Redis + BullMQ** | Job queue — decouples trigger events from execution, handles retries & scheduling |
| **Worker Process** | Picks jobs off the queue, runs the execution engine step-by-step |
| **External Services** | Whatever the workflow actions call (HTTP APIs, email, etc.) |

### Key Architectural Decisions

- **API and Worker are separate processes** (same codebase, different entry points) — the API never executes workflows directly; it only enqueues jobs.
- **PostgreSQL is the source of truth** for workflow definitions and execution records; **Redis is ephemeral** queue state.
- **BullMQ** provides delayed jobs (for scheduled triggers and retry back-off), concurrency control, and dead-letter handling out of the box.
- **Docker Compose** (Phase 14) ties everything together: `api`, `worker`, `postgres`, `redis`, `frontend`.

---

## 3. MVP Scope

The MVP is intentionally small. Ship this first, then expand.

### MVP Triggers (3 only)

| # | Trigger | Description |
|---|---------|-------------|
| 1 | **Webhook** | A unique URL per workflow — any HTTP POST to it fires the workflow |
| 2 | **Schedule (Cron)** | Runs the workflow on a cron expression (e.g., every hour) |
| 3 | **Manual** | A button in the UI that fires the workflow on demand |

### MVP Actions (3 only)

| # | Action | Description |
|---|--------|-------------|
| 1 | **HTTP Request** | Make an HTTP call (GET/POST/PUT/DELETE) with configurable URL, headers, and body — supports templating from trigger data |
| 2 | **Send Email** | Send an email via SMTP with configurable to/subject/body — supports templating |
| 3 | **Delay** | Pause execution for a configurable duration (seconds/minutes) before the next action |

### MVP User Flows

- [ ] User signs up / logs in
- [ ] User creates a workflow: picks one trigger + one or more actions in sequence
- [ ] User activates / deactivates a workflow
- [ ] Trigger fires → workflow executes through all actions in order
- [ ] User views execution history (status, duration, per-step input/output)
- [ ] Failed executions are retried automatically; permanently failed ones go to a dead-letter view

### Explicitly Out of MVP

- Conditional branching / if-else logic
- Loops / iterators
- Third-party OAuth integrations (Slack, Notion, etc.)
- Team / multi-user workspaces
- Workflow versioning / rollback
- Real-time WebSocket updates (polling is fine for MVP)

---

## 4. Development Roadmap

> **Ground rules for every phase:**
> - Read the "Concepts to Learn" before writing code — understand *why*, not just *how*.
> - Complete tasks in order — they are sequenced so later tasks build on earlier ones.
> - Check the "Definition of Done" before moving to the next phase.
> - Commit after each phase with a meaningful message.

---

### Phase 0 — Project Setup & Tooling

#### Objective

Create a clean, reproducible project skeleton with proper tooling so every subsequent phase starts from a solid base.

#### Concepts to Learn

- [ ] Monorepo vs. polyrepo — why a monorepo suits this project (shared types, single Docker Compose)
- [ ] Node.js project structure conventions (what goes where and why)
- [ ] JavaScript best practices — using ESLint for code quality and consistency
- [ ] ESLint + Prettier — linting vs. formatting, how they complement each other
- [ ] Environment variables & `.env` files — the 12-factor app config principle
- [ ] Git branching basics — `main` vs. feature branches, meaningful commit messages
- [ ] EditorConfig — consistent whitespace across editors

#### Tasks

- [ ] Initialize the monorepo root (`package.json` with workspaces or `pnpm-workspace.yaml`)
- [ ] Create the folder structure: `backend/`, `frontend/`, `docker/` (empty for now)
- [ ] Set up JavaScript at the root with `jsconfig.json` (path aliases)
- [ ] Configure ESLint + Prettier at the root
- [ ] Create `.env.example` documenting every env var the project will need (DB URL, Redis URL, JWT secret, etc.)
- [ ] Create `.gitignore` (covers `node_modules/`, `dist/`, `.env`, logs, OS files)
- [ ] Initialize Git, make the first commit
- [ ] Write a one-paragraph project description in this README's header (done — but verify it still fits)

#### Expected Folders / Files

```
workflow-automation/
├── backend/
│   └── package.json
├── frontend/
│   └── package.json
├── docker/                          # placeholder — filled in Phase 14
├── .env.example
├── .gitignore
├── package.json                     # root workspace manifest
├── jsconfig.json
├── .eslintrc / eslint.config.js
├── .prettierrc
├── .editorconfig
└── README.md
```

#### Definition of Done

- [ ] `npm install` (or `pnpm install`) succeeds from the root with zero errors
- [ ] `npx eslint .` passes with no errors
- [ ] `.env.example` lists every variable needed for local dev
- [ ] A fresh clone + `npm install` gets a new contributor to a running state (no hidden steps)

---

### Phase 1 — Backend Foundation

#### Objective

Stand up a minimal Fastify server in JavaScript that boots, handles a health check, and has the plugin/middleware structure needed for everything that follows.

#### Concepts to Learn

- [ ] Fastify vs. Express — why Fastify (schema validation, performance, plugin system)
- [ ] Fastify plugin system (`fastify.register`) and encapsulation
- [ ] Fastify lifecycle hooks (`onRequest`, `preHandler`, `onResponse`, `onError`)
- [ ] Schema-based validation with JSON Schema / TypeBox / Zod (pick one and stick with it)
- [ ] Structured logging with Pino (Fastify's default logger)
- [ ] Graceful shutdown — handling `SIGTERM`/`SIGINT` to close connections cleanly
- [ ] Configuration management — loading and validating env vars at boot, failing fast on bad config

#### Tasks

- [ ] Install Fastify and supporting packages in `backend/`
- [ ] Create the Fastify app entry point (`backend/src/app.ts` or `backend/src/server.ts`)
- [ ] Register core plugins: logger (Pino), CORS, sensible/helmet (error helpers + security headers)
- [ ] Implement `GET /health` — returns `{ status: "ok", uptime, version }`
- [ ] Implement `GET /api/health` — same but under the versioned API prefix
- [ ] Add centralized error handling (consistent `{ error, message, statusCode }` shape)
- [ ] Add request validation scaffolding (schema validation for one dummy endpoint to prove it works)
- [ ] Add graceful shutdown logic (close Fastify, drain connections on `SIGTERM`)
- [ ] Add `npm run dev` (watch mode with `tsx` or `ts-node-dev`) and `npm run build` scripts
- [ ] Write a short `backend/README.md` explaining how to run the server locally

#### Expected Folders / Files

```
backend/
├── src/
│   ├── app.ts                       # Fastify instance creation + plugin registration
│   ├── server.ts                    # Bootstraps app.listen()
│   ├── config/
│   │   └── env.ts                   # Env var loading + validation
│   ├── plugins/
│   │   ├── logger.ts
│   │   ├── cors.ts
│   │   └── error-handler.ts
│   ├── routes/
│   │   └── health.route.ts
│   └── utils/
│       └── logger.ts
├── jsconfig.json
└── package.json
```

#### Definition of Done

- [ ] `npm run dev` starts the server on the configured port
- [ ] `curl http://localhost:<PORT>/health` returns 200 with the expected JSON
- [ ] Invalid request bodies are rejected with 400 and a useful error message
- [ ] Logs are structured JSON (Pino) and include request ID
- [ ] `Ctrl+C` shuts down gracefully (no dangling handles — process exits cleanly)
- [ ] `npm run build` produces a `dist/` that runs with `node dist/server.js`

---

### Phase 2 — Database Design & Migrations

#### Objective

Set up PostgreSQL, design the full data model, and create versioned migrations so the schema is reproducible from scratch.

#### Concepts to Learn

- [ ] Relational modeling — entities, relationships, cardinalities (1:1, 1:N, M:N)
- [ ] Primary keys (UUID vs. auto-increment) — trade-offs for distributed systems
- [ ] Foreign keys, `ON DELETE` behavior (`CASCADE` vs. `SET NULL` vs. `RESTRICT`)
- [ ] Indexes — when to add them, B-tree vs. GIN, covering indexes
- [ ] Database migrations — why they must be forward-only and versioned
- [ ] Connection pooling — what `pg` / `postgres` pool settings mean
- [ ] Timestamps (`created_at`, `updated_at`) — UTC everywhere, app vs. DB defaults
- [ ] Soft delete vs. hard delete — when to use each
- [ ] JSONB columns in Postgres — when structured JSON is appropriate (action config, trigger config)

#### Tasks

- [ ] Install a Postgres client library (`pg` + `pg` types, or `postgres`, or an ORM/query builder — decide now)
- [ ] Decide: raw SQL + migration tool (`node-pg-migrate`, `knex`, `drizzle-kit`) vs. ORM (`Prisma`, `Drizzle ORM`, `TypeORM`) — document the choice
- [ ] Design the full ER diagram on paper or with a tool (dbdiagram.io, draw.io) before writing any migration
- [ ] Create migration 001: `users` table
- [ ] Create migration 002: `workflows` table
- [ ] Create migration 003: `workflow_nodes` (or `steps`) table — stores trigger + action definitions per workflow
- [ ] Create migration 004: `executions` table
- [ ] Create migration 005: `execution_steps` table (per-action result within an execution)
- [ ] Create migration 006: `credentials` table (encrypted secrets for integrations)
- [ ] Add seed data for local development (one test user, one sample workflow)
- [ ] Verify `migrate:up` and `migrate:down` (or reset) work from a clean database
- [ ] Add DB connection health check to `GET /health` (reports DB reachability)

#### Expected Folders / Files

```
backend/
├── src/
│   ├── db/
│   │   ├── connection.ts            # Pool / client setup
│   │   ├── migrate.ts               # Migration runner (if custom)
│   │   └── seed.ts                  # Dev seed data
│   └── modules/
│       └── (empty — filled in later phases)
├── migrations/
│   ├── 001_create_users.sql (or .js)
│   ├── 002_create_workflows.sql
│   ├── 003_create_workflow_nodes.sql
│   ├── 004_create_executions.sql
│   ├── 005_create_execution_steps.sql
│   └── 006_create_credentials.sql
└── (ORM config if applicable: drizzle.config.js / prisma/schema.prisma)
```

#### Definition of Done

- [ ] PostgreSQL is running locally (native install or Docker — either is fine for now)
- [ ] All migrations run forward on a fresh database with zero errors
- [ ] Rolling back and re-running migrations produces the same schema
- [ ] `GET /health` reports database connectivity
- [ ] Seed script creates deterministic test data
- [ ] No migration contains destructive operations without a clear comment explaining why

> **Reference:** See [Section 5 — Database Entities & Relationships](#5-database-entities--relationships) for the full entity spec.

---

### Phase 3 — Authentication & Users

#### Objective

Implement user registration, login, JWT authentication, and protected routes so every workflow and execution is scoped to its owner.

#### Concepts to Learn

- [ ] Password hashing with bcrypt / argon2 — why you never store plain-text passwords
- [ ] JWT — structure (header/payload/signature), access vs. refresh tokens, expiration strategy
- [ ] Stateless auth vs. session auth — trade-offs
- [ ] Auth middleware / guards in Fastify (`preHandler` hook, `fastify-jwt` or custom)
- [ ] Input validation for auth payloads (email format, password strength rules)
- [ ] HTTP-only cookies vs. `Authorization: Bearer` header — pros/cons for SPAs
- [ ] Rate limiting on auth endpoints (prevent brute-force)

#### Tasks

- [ ] Implement `POST /api/auth/register` — validate input, hash password, create user, return tokens
- [ ] Implement `POST /api/auth/login` — verify credentials, return tokens
- [ ] Implement `POST /api/auth/refresh` — issue new access token from a valid refresh token
- [ ] Implement `POST /api/auth/logout` — invalidate refresh token
- [ ] Create auth middleware that verifies JWT and attaches `request.user`
- [ ] Implement `GET /api/users/me` — return the authenticated user's profile
- [ ] Implement `PATCH /api/users/me` — update profile (name, etc.)
- [ ] Add rate limiting to `/api/auth/*` routes
- [ ] Protect all future `/api/workflows/*` and `/api/executions/*` routes with the auth guard (scaffold now, even if those routes are empty)

#### Expected Folders / Files

```
backend/src/
├── modules/
│   ├── auth/
│   │   ├── auth.route.ts
│   │   ├── auth.service.ts
│   │   ├── auth.schema.ts           # Validation schemas (register, login, refresh)
│   │   └── auth.middleware.ts       # JWT verification hook
│   └── users/
│       ├── users.route.ts
│       ├── users.service.ts
│       └── users.schema.ts
├── plugins/
│   └── jwt.ts                       # fastify-jwt registration or custom JWT plugin
└── utils/
    ├── hash.ts                      # bcrypt/argon2 helpers
    └── tokens.ts                    # JWT sign/verify helpers
```

#### Definition of Done

- [ ] A new user can register, log in, and receive valid tokens
- [ ] Protected routes return 401 without a token and 200 with a valid token
- [ ] Expired access tokens are rejected; refresh flow issues a new access token
- [ ] Passwords are hashed — plain text never appears in the DB or logs
- [ ] Auth endpoints are rate-limited (verify by rapid-firing requests)
- [ ] Manual test: register → login → `GET /api/users/me` → refresh → logout → verify old token is rejected

---

### Phase 4 — Workflow CRUD (Core Domain)

#### Objective

Build the core workflow data model — create, read, update, delete, and activate/deactivate workflows. No execution yet; just the data layer.

#### Concepts to Learn

- [ ] RESTful resource design — nouns, HTTP verbs, status codes (201 for create, 204 for delete, etc.)
- [ ] Pagination (cursor vs. offset) — why cursor pagination scales better
- [ ] Filtering and sorting query params
- [ ] Ownership checks — every query must be scoped to `user_id` from the JWT
- [ ] Soft delete vs. hard delete for workflows (consider keeping execution history even after workflow deletion)
- [ ] JSONB querying in Postgres (if storing node config as JSONB)
- [ ] Request/response DTOs — separating DB models from API shapes

#### Tasks

- [ ] Implement `POST /api/workflows` — create a workflow (name, description, trigger config, actions array)
- [ ] Implement `GET /api/workflows` — list workflows for the authenticated user (paginated, filterable by status)
- [ ] Implement `GET /api/workflows/:id` — get a single workflow with its nodes/steps
- [ ] Implement `PUT /api/workflows/:id` — update workflow definition (only when inactive, or allow draft concept)
- [ ] Implement `DELETE /api/workflows/:id` — delete a workflow (soft delete if you chose that strategy)
- [ ] Implement `POST /api/workflows/:/id/activate` — mark workflow as active (validates trigger + actions are configured)
- [ ] Implement `POST /api/workflows/:id/deactivate` — mark workflow as inactive
- [ ] Add validation: a workflow must have exactly one trigger and at least one action
- [ ] Add ownership guard: users can only access their own workflows (return 404, not 403, to avoid leaking existence)

#### Expected Folders / Files

```
backend/src/
├── modules/
│   └── workflows/
│       ├── workflows.route.ts
│       ├── workflows.service.ts
│       ├── workflows.schema.ts      # Validation schemas for create/update
│       ├── workflows.repository.ts  # DB queries (if using repository pattern)
│       └── workflows.types.ts       # DTOs and domain types
```

#### Definition of Done

- [ ] CRUD operations work end-to-end via `curl` or a REST client (Postman / Insomnia / Bruno)
- [ ] Listing is paginated and scoped to the authenticated user — user A cannot see user B's workflows
- [ ] Creating a workflow without a trigger or without actions returns 400 with a clear message
- [ ] Activating a workflow with incomplete config returns 400
- [ ] Updating an active workflow either (a) is rejected or (b) creates a new draft — document whichever you chose
- [ ] All endpoints return consistent pagination and error shapes

---

### Phase 5 — Trigger & Action System (MVP Integrations)

#### Objective

Design the extensible trigger/action registry and implement the 3 MVP triggers and 3 MVP actions with real functionality (no queue yet — direct execution for now to validate each integration).

#### Concepts to Learn

- [ ] Registry / strategy pattern — how to register trigger and action handlers by type string
- [ ] Webhook triggers — generating unique URLs, verifying incoming payloads, idempotency
- [ ] Cron scheduling — cron expression syntax, libraries (`cron`, `node-cron`, `cron-parser`), timezone handling
- [ ] HTTP action — `fetch` / `axios` / `undici`, timeout handling, retry on transient failures
- [ ] Email action — SMTP basics, `nodemailer`, templating with handlebars/mustache or simple `{{variable}}` interpolation
- [ ] Delay action — `setTimeout` vs. queue-based delay (use simple timeout for now; queue delay comes in Phase 6)
- [ ] Template interpolation — replacing `{{trigger.body.email}}` or `{{step1.output.url}}` with real values at runtime
- [ ] Input/output contracts — every trigger produces an output object; every action receives input and produces output

#### Tasks

- [ ] Design the `TriggerRegistry` and `ActionRegistry` — maps `type` string → handler object with `validate`, `execute` methods
- [ ] Define the `TriggerHandler` and `ActionHandler` interfaces (JavaScript)
- [ ] Implement **Webhook trigger**: `POST /api/webhooks/:workflowId/:secret` — validates the secret, captures the payload, fires the workflow
- [ ] Implement **Schedule trigger**: accepts a cron expression, registers a cron job that fires the workflow on schedule
- [ ] Implement **Manual trigger**: `POST /api/workflows/:id/trigger` — fires the workflow immediately with optional input payload
- [ ] Implement **HTTP Request action**: configurable method/URL/headers/body, interpolates template variables, returns response
- [ ] Implement **Send Email action**: configurable to/subject/body via SMTP, interpolates templates
- [ ] Implement **Delay action**: pauses for N seconds/minutes before the next action
- [ ] Implement template interpolation utility (`{{trigger.field}}`, `{{steps.stepName.output.field}}`)
- [ ] Add per-trigger and per-action validation schemas (each type validates its own config shape)
- [ ] Test each trigger and action in isolation (direct call, no queue)

#### Expected Folders / Files

```
backend/src/
├── modules/
│   ├── triggers/
│   │   ├── trigger.registry.ts
│   │   ├── trigger.types.ts
│   │   ├── webhook.trigger.ts
│   │   ├── schedule.trigger.ts
│   │   └── manual.trigger.ts
│   └── actions/
│       ├── action.registry.ts
│       ├── action.types.ts
│       ├── http-request.action.ts
│       ├── send-email.action.ts
│       └── delay.action.ts
├── engine/
│   ├── template.ts                  # {{variable}} interpolation engine
│   └── (execution engine comes in Phase 7)
└── utils/
    └── cron.ts                      # Cron helpers if needed
```

#### Definition of Done

- [ ] Each trigger type fires correctly when its condition is met (webhook POST, cron tick, manual call)
- [ ] Each action type executes correctly with valid config and returns its output
- [ ] Template interpolation works — `{{trigger.body.name}}` in an email body is replaced with the real value
- [ ] Invalid trigger/action configs are rejected at workflow creation time with descriptive errors
- [ ] Webhook URLs are unique and unguessable (UUID or random token, not sequential IDs)
- [ ] Manual trigger returns the execution ID immediately (even though execution is still synchronous at this stage)

> **Remember:** Keep it to exactly 3 triggers and 3 actions for the MVP. Resist adding more until the MVP is fully working.

---

### Phase 6 — Queue System (Redis + BullMQ)

#### Objective

Decouple trigger events from execution by introducing Redis and BullMQ — triggers enqueue jobs, workers dequeue and execute them.

#### Concepts to Learn

- [ ] Redis — what it is, data structures, why it's used as a queue backend
- [ ] BullMQ — queues, jobs, workers, processors, concurrency, events
- [ ] Why queues matter — durability, backpressure, retry, horizontal scaling
- [ ] Job options in BullMQ — `attempts`, `backoff`, `delay`, `jobId` (deduplication), `removeOnComplete`
- [ ] Redis connection handling — reconnection, error events, graceful shutdown
- [ ] BullMQ Board / Arena — optional UI for inspecting queues during development

#### Tasks

- [ ] Install and run Redis locally (Docker is the easiest: `docker run redis`)
- [ ] Install BullMQ and `ioredis` in `backend/`
- [ ] Create the Redis connection module (`src/queue/connection.ts`)
- [ ] Create the main queue: `workflow-execution` queue
- [ ] Refactor triggers so they **enqueue** a job instead of executing directly
- [ ] Create the worker process entry point (`src/worker.ts`) — separate from `server.ts`
- [ ] Implement the worker processor — picks up jobs and calls the execution engine (stub for now, real logic in Phase 7)
- [ ] Add queue health to `GET /health` (Redis connectivity check)
- [ ] Configure BullMQ job options: sensible defaults for `attempts`, `backoff`, `removeOnComplete`
- [ ] Add `npm run worker` script to start the worker process
- [ ] Verify that `api` and `worker` can run as separate processes sharing the same queue

#### Expected Folders / Files

```
backend/src/
├── queue/
│   ├── connection.ts                # Redis / ioredis setup
│   ├── queues.ts                    # Queue definitions (workflow-execution)
│   └── worker.ts                    # Worker process entry point (or src/worker.ts at top level)
├── worker.ts                        # Alternative location for worker entry
└── config/
    └── redis.ts                     # Redis env config
```

#### Definition of Done

- [ ] Redis is running and reachable
- [ ] Firing any trigger enqueues a job in Redis (verify with `redis-cli` or BullMQ Board)
- [ ] The worker process picks up the job and logs that it received it
- [ ] `api` and `worker` run as two separate processes (`npm run dev` + `npm run worker` in two terminals)
- [ ] Killing and restarting the worker does not lose queued jobs — they are picked up on restart
- [ ] `GET /health` reports Redis status

---

### Phase 7 — Workflow Execution Engine

#### Objective

Build the engine that takes a workflow definition and executes its actions sequentially, recording the result of every step.

#### Concepts to Learn

- [ ] Sequential execution — running actions one after another, passing output forward
- [ ] Execution context — the object that accumulates trigger data + each step's output as the workflow runs
- [ ] Error boundaries — what happens when one action fails (stop, skip, or continue?)
- [ ] Idempotency — ensuring re-execution of the same job doesn't cause duplicate side effects
- [ ] Timeouts per action — preventing a hung HTTP call from blocking the worker forever
- [ ] Execution status lifecycle: `pending` → `running` → `success` / `failed` / `partial`
- [ ] How BullMQ job data maps to execution records in Postgres

#### Tasks

- [ ] Design the `ExecutionContext` type — holds `trigger`, `steps` outputs, `workflow`, `execution` metadata
- [ ] Implement `ExecutionEngine` class/service with a `run(workflowId, triggerData)` method
- [ ] Engine loads the workflow + its nodes from Postgres
- [ ] Engine creates an `executions` row with status `running`
- [ ] Engine iterates through actions sequentially:
  - [ ] Interpolates templates using data from trigger + prior steps
  - [ ] Calls the appropriate `ActionHandler.execute()`
  - [ ] Records each step result in `execution_steps` (input, output, status, duration, error)
  - [ ] On failure: marks execution as `failed`, stops remaining actions
- [ ] Engine updates the `executions` row to `success` or `failed` when done
- [ ] Wire the engine into the BullMQ worker processor (Phase 6 stub → real execution)
- [ ] Add per-action timeout (e - g., 30 s for HTTP Request, configurable)
- [ ] Handle edge case: workflow was deactivated or deleted between enqueue and execution

#### Expected Folders / Files

```
backend/src/
├── engine/
│   ├── execution.engine.ts          # Core sequential execution logic
│   ├── execution.context.ts         # ExecutionContext type + helpers
│   ├── template.ts                  # (from Phase 5 — now used by the engine)
│   └── index.ts
├── modules/
│   └── executions/
│       ├── executions.service.ts    # CRUD for execution records
│       └── executions.repository.ts
```

#### Definition of Done

- [ ] Triggering a workflow creates an `executions` row and runs all actions in order
- [ ] Each `execution_steps` row accurately records input, output, status, and timing
- [ ] Template variables referencing prior steps resolve correctly (e.g., `{{steps.http1.output.body.id}}`)
- [ ] A failing action stops the workflow and marks the execution as `failed`
- [ ] The engine handles the "workflow deleted before execution" case gracefully
- [ ] Execution via the queue produces the same result as the direct execution tested in Phase 5

---

### Phase 8 — Frontend Foundation

#### Objective

Set up the React + Vite frontend with routing, API client, auth flow, and a layout shell so feature pages have a place to live.

#### Concepts to Learn

- [ ] Vite — what it does, dev server, HMR, build output
- [ ] React Router (or TanStack Router) — client-side routing, protected routes, nested layouts
- [ ] State management — when to use local state vs. context vs. a library (Zustand, Jotai, Redux Toolkit)
- [ ] API client — `fetch` wrapper vs. `axios` vs. `ky`, interceptors for auth headers and token refresh
- [ ] Auth flow in an SPA — storing tokens, attaching them to requests, handling 401 + refresh, redirecting to login
- [ ] Component structure — pages vs. components vs. layouts vs. hooks
- [ ] Tailwind CSS (or your chosen styling approach) — utility-first styling
- [ ] Environment variables in Vite (`VITE_API_URL`, etc.)

#### Tasks

- [ ] Scaffold the frontend with Vite (`npm create vite@latest frontend -- --template react-ts`)
- [ ] Install and configure React Router with routes: `/login`, `/register`, `/dashboard`, `/workflows`, `/workflows/:id`, `/executions`
- [ ] Set up the API client (`src/lib/api.ts`) with base URL, auth header injection, and 401 handling
- [ ] Implement auth pages: Login and Register forms with validation and error display
- [ ] Implement protected route wrapper — redirects to `/login` if not authenticated
- [ ] Create the app layout: sidebar/nav + header + main content area
- [ ] Implement auth state (context or store) — holds user, tokens, login/logout actions
- [ ] Style the shell to be clean and usable (does not need to be pixel-perfect yet)
- [ ] Configure Vite proxy for local dev (frontend `5173` → backend `3000`)

#### Expected Folders / Files

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx                      # Router setup
│   ├── lib/
│   │   └── api.ts                   # API client
│   ├── stores/ or contexts/
│   │   └── auth.store.ts            # Auth state
│   ├── routes/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── dashboard.tsx
│   │   └── workflows.tsx            # Placeholder — built in Phase 9
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ui/                      # Reusable UI primitives (Button, Input, Card, etc.)
│   ├── hooks/
│   │   └── useAuth.ts
│   └── styles/
│       └── index.css
├── vite.config.ts
├── tsconfig.json
└── package.json
```

#### Definition of Done

- [ ] `npm run dev` in `frontend/` starts the Vite dev server
- [ ] Login and Register pages work against the real backend API
- [ ] Authenticated users are redirected to the dashboard; unauthenticated users to login
- [ ] Tokens are stored and attached to every API request automatically
- [ ] Expired tokens trigger a refresh or redirect to login
- [ ] The layout shell renders on every authenticated page

---

### Phase 9 — Workflow Builder UI

#### Objective

Build the visual workflow editor where users assemble triggers and actions, configure each step, and manage workflow lifecycle.

#### Concepts to Learn

- [ ] Form handling in React — controlled vs. uncontrolled, libraries (`react-hook-form`, `formik`)
- [ ] Dynamic forms — rendering different fields based on the selected trigger/action type
- [ ] Drag-and-drop (optional) — `dnd-kit`, `react-beautiful-dnd`, or simple ordered list with move buttons
- [ ] Optimistic updates vs. pessimistic updates for CRUD operations
- [ ] Confirmation dialogs for destructive actions (delete workflow)
- [ ] Empty states and loading states — what to show when there are no workflows yet

#### Tasks

- [ ] Build the **Workflow List page** (`/workflows`) — table/cards showing name, status (active/inactive), trigger type, last execution, actions (edit, delete, activate/deactivate)
- [ ] Build the **Workflow Editor page** (`/workflows/:id` and `/workflows/new`):
  - [ ] Trigger selector — pick one of the 3 trigger types, show its config form
  - [ ] Action list — add/remove/reorder actions, each with its type-specific config form
  - [ ] Template variable helper — shows available `{{variables}}` from trigger + prior steps
  - [ ] Save button — validates and persists the workflow
  - [ ] Activate/Deactivate toggle
- [ ] Build per-type config forms:
  - [ ] Webhook trigger: display the generated webhook URL (copy button)
  - [ ] Schedule trigger: cron expression input with human-readable preview ("Every hour at minute 0")
  - [ ] Manual trigger: no extra config, just a "Test Run" button
  - [ ] HTTP Request action: method, URL, headers (key-value), body (JSON/text) — all templatable
  - [ ] Send Email action: to, subject, body — templatable
  - [ ] Delay action: duration + unit (seconds/minutes/hours)
- [ ] Add workflow activation validation feedback (highlight missing fields)
- [ ] Add delete confirmation dialog

#### Expected Folders / Files

```
frontend/src/
├── routes/
│   ├── workflows/
│   │   ├── list.tsx
│   │   ├── editor.tsx
│   │   └── components/
│   │       ├── TriggerSelector.tsx
│   │       ├── TriggerConfigForm.tsx
│   │       ├── ActionList.tsx
│   │       ├── ActionConfigForm.tsx
│   │       ├── VariableHelper.tsx
│   │       └── WebhookUrlDisplay.tsx
├── components/
│   └── ui/                          # Additional primitives as needed
└── hooks/
    ├── useWorkflows.ts
    └── useWorkflow.ts
```

#### Definition of Done

- [ ] A user can create a new workflow entirely through the UI (no `curl` needed)
- [ ] A user can edit, activate, deactivate, and delete workflows
- [ ] Each trigger/action type shows the correct config fields
- [ ] Template variables are discoverable (helper or autocomplete)
- [ ] Validation errors are shown inline before save
- [ ] Webhook URL is displayed and copyable after creation

---

### Phase 10 — Execution History & Monitoring

#### Objective

Give users full visibility into what happened when a workflow ran — per-execution detail, per-step input/output, status, and timing.

#### Concepts to Learn

- [ ] Pagination in the UI — infinite scroll vs. page numbers vs. "load more"
- [ ] Polling vs. WebSocket for live updates — polling is sufficient for MVP
- [ ] Data visualization basics — status badges, timelines, duration formatting
- [ ] Filtering and searching execution history
- [ ] Log levels and structured execution logs

#### Tasks

- [ ] Implement `GET /api/executions` — list executions for the authenticated user (paginated, filterable by workflow, status, date range)
- [ ] Implement `GET /api/executions/:id` — single execution with all `execution_steps`
- [ ] Implement `GET /api/workflows/:id/executions` — executions for a specific workflow
- [ ] Build the **Execution List page** (`/executions` or `/workflows/:id/executions`) — table with workflow name, trigger type, status, duration, timestamp
- [ ] Build the **Execution Detail page** (`/executions/:id`) — shows:
  - [ ] Overall status, duration, trigger payload
  - [ ] Per-step breakdown: step name, status, input, output, duration, error (if any)
  - [ ] Collapsible JSON viewer for payloads
- [ ] Add status badges with colors (success = green, failed = red, running = yellow/blue)
- [ ] Add auto-refresh / polling on the execution list (e.g., every 10 s when on the page)
- [ ] Add a **Dashboard page** (`/dashboard`) — summary stats: total workflows, active workflows, executions today, success/failure counts

#### Expected Folders / Files

```
backend/src/modules/executions/
├── executions.route.ts
├── executions.service.ts
├── executions.schema.ts
└── executions.repository.ts

frontend/src/
├── routes/
│   ├── executions/
│   │   ├── list.tsx
│   │   └── detail.tsx
│   └── dashboard.tsx
├── components/
│   ├── ExecutionTimeline.tsx
│   ├── StatusBadge.tsx
│   └── JsonViewer.tsx
└── hooks/
    └── useExecutions.ts
```

#### Definition of Done

- [ ] Every workflow execution appears in the execution list within seconds of completing
- [ ] Clicking an execution shows the full per-step breakdown with real input/output data
- [ ] Filtering by workflow and status works
- [ ] The dashboard shows accurate summary numbers
- [ ] A failed execution clearly shows which step failed and why

---

### Phase 11 — Retry, Error Handling & Dead-Letter Queue

#### Objective

Make the system resilient — transient failures are retried with back-off, permanent failures are quarantined for inspection and manual replay.

#### Concepts to Learn

- [ ] Retry strategies — fixed delay vs. exponential back-off vs. jitter
- [ ] When to retry vs. when to fail fast (idempotent vs. non-idempotent actions, 4xx vs. 5xx)
- [ ] Dead-letter queue (DLQ) pattern — what it is and why it exists
- [ ] BullMQ retry config — `attempts`, `backoff: { type, delay }`, `attemptsMade`
- [ ] Manual replay — re-enqueueing a DLQ job from the UI or API
- [ ] Alerting basics — when to notify the user that a workflow is failing repeatedly

#### Tasks

- [ ] Configure BullMQ retry on the `workflow-execution` queue — exponential back-off (e.g., 3 attempts: 5 s, 25 s, 125 s)
- [ ] Classify errors as retryable vs. non-retryable in each action handler (e.g., HTTP 429/5xx = retryable, 400 = not)
- [ ] Implement the **dead-letter queue** — jobs that exhaust all retries are moved to a `dead-letter` queue/collection
- [ ] Create `dead_letter_jobs` table (or use BullMQ's built-in failed job storage + a Postgres mirror for querying)
- [ ] Implement `GET /api/dead-letters` — list dead-letter jobs for the authenticated user
- [ ] Implement `POST /api/dead-letters/:id/replay` — re-enqueue a dead-letter job
- [ ] Implement `DELETE /api/dead-letters/:id` — discard a dead-letter job
- [ ] Add execution status `retrying` — visible in the execution history while retries are in progress
- [ ] Build the **Dead-Letter page** in the frontend (`/dead-letters` or within `/executions` filtered by `failed`)
- [ ] Log every retry attempt with attempt number and next retry time

#### Expected Folders / Files

```
backend/src/
├── queue/
│   ├── dead-letter.ts               # DLQ handling
│   └── retry.ts                     # Retry classification helpers
├── modules/
│   └── dead-letters/
│       ├── dead-letters.route.ts
│       ├── dead-letters.service.ts
│       └── dead-letters.schema.ts
└── engine/
    └── errors.ts                    # RetryableError vs. PermanentError classes

frontend/src/
├── routes/
│   └── dead-letters.tsx
└── components/
    └── DeadLetterCard.tsx
```

#### Definition of Done

- [ ] A transient failure (e.g., HTTP 500 from an external API) is retried automatically with increasing delay
- [ ] A permanent failure (e.g., HTTP 400) fails immediately without retries
- [ ] After exhausting retries, the job appears in the dead-letter list
- [ ] Replaying a dead-letter job re-executes the workflow
- [ ] Execution history shows retry attempts and their outcomes
- [ ] No job is retried infinitely — there is a clear max attempts limit

---

### Phase 12 — Advanced Features & Polish

#### Objective

Add quality-of-life features that make the product feel complete, without expanding the MVP trigger/action set.

#### Concepts to Learn

- [ ] Input sanitization and output escaping — preventing template injection
- [ ] Rate limiting per workflow (prevent a noisy webhook from flooding the queue)
- [ ] Workflow run history limits / retention policy (auto-cleanup of old executions)
- [ ] API key authentication for webhook triggers (alternative to URL secret)
- [ ] Execution payload size limits
- [ ] UX polish — loading skeletons, optimistic UI, toast notifications, keyboard shortcuts

#### Tasks

- [ ] Add per-workflow rate limiting (e.g., max 60 executions per minute per workflow)
- [ ] Add execution retention — auto-delete executions older than N days (configurable, default 30)
- [ ] Add payload size limits on webhook triggers and execution records
- [ ] Add search/filter on the workflow list (by name, trigger type, status)
- [ ] Add toast notifications for all user actions (created, saved, deleted, activated)
- [ ] Add loading skeletons and empty states for every list page
- [ ] Add keyboard shortcut: `Cmd/Ctrl + Enter` to save in the workflow editor
- [ ] Add webhook execution log — show incoming webhook payloads even for failed/rate-limited requests
- [ ] Add basic input sanitization for template variables (prevent prototype pollution, limit nesting depth)
- [ ] Review and polish all error messages — every error should tell the user what went wrong and what to do

#### Expected Folders / Files

```
backend/src/
├── plugins/
│   └── rate-limit.ts                # Per-workflow rate limiting
├── jobs/
│   └── retention.job.ts             # Cron job to clean old executions
└── utils/
    └── sanitize.ts

frontend/src/
├── components/
│   ├── Toast.tsx
│   ├── Skeleton.tsx
│   └── EmptyState.tsx
└── hooks/
    └── useToast.ts
```

#### Definition of Done

- [ ] Rate limiting works — rapid webhook calls beyond the limit return 429
- [ ] Old executions are cleaned up on schedule
- [ ] Every page has proper loading, empty, and error states
- [ ] No raw stack traces are ever shown to the user — all errors are human-readable
- [ ] A full end-to-end walkthrough (create → activate → trigger → verify execution) feels smooth

---

### Phase 13 — Testing & Hardening

#### Objective

Achieve confidence that the system works correctly through automated tests and manual hardening.

#### Concepts to Learn

- [ ] Testing pyramid — unit vs. integration vs. end-to-end, and how much of each
- [ ] Mocking — when to mock (external APIs, Redis) and when not to (database in integration tests)
- [ ] Test database setup — isolated test DB, transaction rollback per test
- [ ] Supertest / `fastify.inject()` — testing Fastify routes without starting a real server
- [ ] BullMQ testing — using a real Redis vs. mocked queue
- [ ] Frontend testing — Vitest + React Testing Library + MSW (Mock Service Worker)
- [ ] Load testing basics — `k6` or `autocannon` for basic throughput measurement

#### Tasks

- [ ] Set up the test framework (`vitest` recommended — works for both backend and frontend)
- [ ] Write unit tests for:
  - [ ] Template interpolation utility
  - [ ] Each trigger handler's validation logic
  - [ ] Each action handler's validation + execution logic (mock external calls)
  - [ ] Retry classification (retryable vs. permanent errors)
  - [ ] Auth helpers (hash, token sign/verify)
- [ ] Write integration tests for:
  - [ ] Auth flow (register → login → refresh → access protected route)
  - [ ] Workflow CRUD (create → read → update → delete → ownership checks)
  - [ ] Trigger → enqueue → execute → execution record (full happy path through the queue)
  - [ ] Retry and dead-letter flow
- [ ] Write frontend tests for:
  - [ ] Auth pages (form validation, error display)
  - [ ] Workflow editor (renders correct fields per type, validates before save)
  - [ ] Execution detail (renders step breakdown correctly)
- [ ] Add test coverage reporting and set a minimum threshold (aim for 70%+ on backend)
- [ ] Run a basic load test — 100 concurrent webhook triggers, verify no data loss or corruption
- [ ] Fix every bug found during testing before marking this phase done

#### Expected Folders / Files

```
backend/
├── tests/
│   ├── unit/
│   │   ├── template.test.ts
│   │   ├── triggers.test.ts
│   │   ├── actions.test.ts
│   │   └── retry.test.ts
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── workflows.test.ts
│   │   └── executions.test.ts
│   ├── helpers/
│   │   ├── setup.ts                 # Test DB + app setup
│   │   └── fixtures.ts              # Shared test data
│   └── vitest.config.ts
├── vitest.config.ts
└── package.json                     # test scripts

frontend/
├── tests/
│   ├── components/
│   └── routes/
├── vitest.config.ts
└── src/test/
    └── setup.ts                     # MSW + Testing Library setup
```

#### Definition of Done

- [ ] `npm test` passes with zero failures in both `backend/` and `frontend/`
- [ ] Coverage report meets the threshold you set
- [ ] No test depends on execution order or shared mutable state
- [ ] Load test completes without errors or data inconsistency
- [ ] CI would pass (even if you haven't set up CI yet — the tests are CI-ready)

> **Reference:** See [Section 11 — Testing Checklist](#11-testing-checklist) for the full checklist.

---

### Phase 14 — Docker & Deployment

#### Objective

Containerize every service and make the entire stack runnable with a single `docker compose up`, ready for deployment to any VPS or cloud.

#### Concepts to Learn

- [ ] Dockerfile — multi-stage builds, layer caching, minimal base images (`node:20-alpine`)
- [ ] Docker Compose — services, networks, volumes, health checks, `depends_on`
- [ ] Environment variable injection in Docker — `.env` file vs. compose `environment` block
- [ ] Database persistence with Docker volumes
- [ ] Reverse proxy basics — Nginx or Caddy in front of the API + frontend (optional for MVP)
- [ ] Deployment targets — VPS (Hetzner, DigitalOcean), PaaS (Railway, Render, Fly.io), or bare Docker host
- [ ] Health checks and restart policies (`restart: unless-stopped`)
- [ ] Backup strategy for PostgreSQL data

#### Tasks

- [ ] Write `backend/Dockerfile` — multi-stage build (install → build → run with minimal image)
- [ ] Write `frontend/Dockerfile` — build with Vite, serve with `nginx` or `serve`
- [ ] Write `docker-compose.yml` at the project root with services: `postgres`, `redis`, `api`, `worker`, `frontend`
- [ ] Add named volumes for `postgres_data` and `redis_data`
- [ ] Add health checks for `postgres` and `redis` services
- [ ] Make `api` and `worker` wait for `postgres` and `redis` to be healthy before starting
- [ ] Test `docker compose up --build` from a clean state — all services start, migrations run, app is accessible
- [ ] Test `docker compose down -v` + `docker compose up --build` — full reset works
- [ ] Document deployment steps in `DEPLOY.md` or in this README's deployment section
- [ ] (Optional) Set up a production deployment on a VPS or PaaS and verify it works
- [ ] Add `docker-compose.prod.yml` override if production config differs from local

#### Expected Folders / Files

```
workflow-automation/
├── backend/
│   └── Dockerfile
├── frontend/
│   ├── Dockerfile
│   └── nginx.conf                   # If serving built frontend via nginx
├── docker-compose.yml
├── docker-compose.prod.yml          # Optional production overrides
├── .dockerignore
└── DEPLOY.md                        # Optional detailed deploy guide
```

#### Definition of Done

- [ ] `docker compose up --build` brings up the entire stack with zero manual steps
- [ ] The frontend is accessible at `http://localhost:5173` (or your configured port)
- [ ] The API is accessible at `http://localhost:3000` and `GET /health` returns 200
- [ ] Creating and executing a workflow works identically in Docker as it does natively
- [ ] Data persists across `docker compose down` + `docker compose up` (volumes work)
- [ ] A `docker compose down -v` fully resets everything for a clean slate
- [ ] Deployment docs are accurate — a new person can deploy by following them

> **Reference:** See [Section 12 — Deployment Checklist](#12-deployment-checklist) for the full checklist.

---

## 5. Database Entities & Relationships

### Entity-Relationship Diagram (Text)

```
users ──< workflows ──< workflow_nodes
  │              │              │
  │              │              └── execution_steps (via executions)
  │              │
  │              └──< executions ──< execution_steps
  │                       │
  │                       └── dead_letter_jobs (optional separate table)
  │
  └──< credentials
  └──< refresh_tokens (if not stored in credentials)
```

### Table Specifications

#### `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK, default `gen_random_uuid()` | |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Lowercase, validated |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt/argon2 hash |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `created_at` | TIMESTAMPTZ | NOT NULL, default `now()` | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default `now()` | Auto-updated on change |

#### `workflows`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → `users.id` ON DELETE CASCADE, NOT NULL | Owner |
| `name` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | nullable | |
| `status` | VARCHAR(20) | NOT NULL, default `'inactive'` | `active` / `inactive` / `draft` |
| `trigger_type` | VARCHAR(50) | NOT NULL | `webhook` / `schedule` / `manual` |
| `trigger_config` | JSONB | NOT NULL, default `'{}'` | Type-specific config (cron expr, webhook secret, etc.) |
| `is_deleted` | BOOLEAN | NOT NULL, default `false` | Soft delete |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

- Index: `(user_id, status)` for listing active workflows
- Index: `(user_id, is_deleted)` for filtering

#### `workflow_nodes` (also called `workflow_steps` or `actions`)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `workflow_id` | UUID | FK → `workflows.id` ON DELETE CASCADE, NOT NULL | |
| `type` | VARCHAR(50) | NOT NULL | `http_request` / `send_email` / `delay` |
| `name` | VARCHAR(255) | NOT NULL | Human label, e.g., "Send welcome email" |
| `config` | JSONB | NOT NULL, default `'{}'` | Type-specific config (URL, headers, email fields, delay duration) |
| `position` | INTEGER | NOT NULL | Order in the sequence (0, 1, 2, ...) |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

- Index: `(workflow_id, position)` — always query in order
- Constraint: `UNIQUE(workflow_id, position)`

#### `executions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `workflow_id` | UUID | FK → `workflows.id` ON DELETE SET NULL | Keep history even if workflow deleted |
| `user_id` | UUID | FK → `users.id` ON DELETE CASCADE, NOT NULL | Denormalized for fast user-scoped queries |
| `trigger_type` | VARCHAR(50) | NOT NULL | Snapshot of trigger type at execution time |
| `trigger_data` | JSONB | nullable | The payload that fired the workflow |
| `status` | VARCHAR(20) | NOT NULL | `pending` / `running` / `success` / `failed` / `retrying` |
| `started_at` | TIMESTAMPTZ | nullable | When execution began |
| `finished_at` | TIMESTAMPTZ | nullable | When execution completed |
| `error` | TEXT | nullable | Top-level error if the execution failed |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

- Index: `(user_id, created_at DESC)` for user execution history
- Index: `(workflow_id, created_at DESC)` for per-workflow history
- Index: `(status)` for filtering

#### `execution_steps`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `execution_id` | UUID | FK → `executions.id` ON DELETE CASCADE, NOT NULL | |
| `node_id` | UUID | FK → `workflow_nodes.id` ON DELETE SET NULL | Which action this step corresponds to |
| `type` | VARCHAR(50) | NOT NULL | Snapshot of action type |
| `name` | VARCHAR(255) | NOT NULL | Snapshot of action name |
| `status` | VARCHAR(20) | NOT NULL | `pending` / `running` / `success` / `failed` / `skipped` |
| `input` | JSONB | nullable | Resolved input after template interpolation |
| `output` | JSONB | nullable | Action's return value |
| `error` | TEXT | nullable | Error message if failed |
| `started_at` | TIMESTAMPTZ | nullable | |
| `finished_at` | TIMESTAMPTZ | nullable | |
| `duration_ms` | INTEGER | nullable | Computed: `finished_at - started_at` |
| `position` | INTEGER | NOT NULL | Order within the execution |

- Index: `(execution_id, position)`

#### `credentials` (for future extensibility — SMTP creds, API keys, etc.)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → `users.id` ON DELETE CASCADE, NOT NULL | |
| `name` | VARCHAR(255) | NOT NULL | e.g., "My Gmail SMTP" |
| `type` | VARCHAR(50) | NOT NULL | `smtp` / `api_key` / `oauth` (extensible) |
| `data` | JSONB | NOT NULL | Encrypted secret data |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

- Index: `(user_id, type)`

#### `refresh_tokens` (if not handled purely via JWT)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → `users.id` ON DELETE CASCADE, NOT NULL | |
| `token_hash` | VARCHAR(255) | NOT NULL, UNIQUE | Hash of the refresh token |
| `expires_at` | TIMESTAMPTZ | NOT NULL | |
| `created_at` | TIMESTAMPTZ | NOT NULL | |

#### `dead_letter_jobs` (optional — alternative to relying solely on BullMQ's failed set)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `execution_id` | UUID | FK → `executions.id` ON DELETE SET NULL | |
| `workflow_id` | UUID | FK → `workflows.id` ON DELETE SET NULL | |
| `user_id` | UUID | FK → `users.id` ON DELETE CASCADE, NOT NULL | |
| `job_data` | JSONB | NOT NULL | Original BullMQ job payload |
| `error` | TEXT | NOT NULL | Final error after all retries |
| `attempts_made` | INTEGER | NOT NULL | How many attempts were made |
| `failed_at` | TIMESTAMPTZ | NOT NULL | |
| `replayed` | BOOLEAN | NOT NULL, default `false` | Whether it was manually replayed |

### Relationships Summary

| Relationship | Cardinality | Notes |
|-------------|-------------|-------|
| User → Workflows | 1 : N | A user owns many workflows |
| Workflow → Workflow Nodes | 1 : N | Ordered list of actions |
| Workflow → Executions | 1 : N | Every trigger firing creates an execution |
| Execution → Execution Steps | 1 : N | One step per action, in order |
| Workflow Node → Execution Steps | 1 : N | A node definition maps to many historical step records |
| User → Credentials | 1 : N | A user has many stored credentials |
| User → Refresh Tokens | 1 : N | A user may have multiple active sessions |
| Execution → Dead Letter Job | 1 : 0..1 | Only failed-after-retries executions become DLQ entries |

---

## 6. API Endpoints

All endpoints except health and auth are protected (require `Authorization: Bearer <token>`).

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Basic liveness check |
| GET | `/api/health` | No | Detailed check (DB + Redis status) |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in, receive access + refresh tokens |
| POST | `/api/auth/refresh` | No (refresh token) | Issue new access token |
| POST | `/api/auth/logout` | Yes | Invalidate refresh token |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/me` | Yes | Get current user profile |
| PATCH | `/api/users/me` | Yes | Update current user profile |

### Workflows

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/workflows` | Yes | Create a workflow |
| GET | `/api/workflows` | Yes | List workflows (paginated, filterable) |
| GET | `/api/workflows/:id` | Yes | Get single workflow with nodes |
| PUT | `/api/workflows/:id` | Yes | Update workflow |
| DELETE | `/api/workflows/:id` | Yes | Delete workflow (soft delete) |
| POST | `/api/workflows/:id/activate` | Yes | Activate workflow |
| POST | `/api/workflows/:id/deactivate` | Yes | Deactivate workflow |
| POST | `/api/workflows/:id/trigger` | Yes | Manually trigger a workflow |

### Webhooks (Trigger Entry Point)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/webhooks/:workflowId/:secret` | Secret in URL | Fire a webhook-triggered workflow |

### Executions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/executions` | Yes | List executions (paginated, filterable) |
| GET | `/api/executions/:id` | Yes | Get execution with steps |
| GET | `/api/workflows/:id/executions` | Yes | List executions for a workflow |

### Dead Letters

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dead-letters` | Yes | List dead-letter jobs |
| POST | `/api/dead-letters/:id/replay` | Yes | Replay a dead-letter job |
| DELETE | `/api/dead-letters/:id` | Yes | Discard a dead-letter job |

### Credentials (Future / Optional for MVP)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/credentials` | Yes | Store a credential |
| GET | `/api/credentials` | Yes | List credentials (without secret values) |
| DELETE | `/api/credentials/:id` | Yes | Delete a credential |

### Common Query Parameters

| Param | Used On | Description |
|-------|---------|-------------|
| `page` | List endpoints | Page number (1-indexed) |
| `limit` | List endpoints | Items per page (default 20, max 100) |
| `status` | Workflows, Executions | Filter by status |
| `workflowId` | Executions | Filter by workflow |
| `sort` | List endpoints | Sort field and direction (e.g., `created_at:desc`) |

### Standard Response Shapes

```json
// Success — single resource
{ "data": { "id": "...", "...": "..." } }

// Success — paginated list
{
  "data": [ { "...": "..." } ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}

// Error
{
  "error": "ValidationError",
  "message": "trigger_type is required",
  "statusCode": 400,
  "details": [ { "field": "trigger_type", "message": "is required" } ]
}
```

---

## 7. Workflow Execution Flow

### End-to-End Sequence

```
  Trigger Event                    API Server                  Redis/BullMQ              Worker / Engine              PostgreSQL
      │                               │                            │                          │                          │
      │  POST /webhooks/:id/:secret   │                            │                          │                          │
      ├──────────────────────────────►│                            │                          │                          │
      │                               │  Validate workflow active  │                          │                          │
      │                               ├───────────────────────────────────────────────────────►│                          │
      │                               │  (check workflows table)   │                          │                          │
      │                               │◄───────────────────────────────────────────────────────┤                          │
      │                               │                            │                          │                          │
      │                               │  Create execution          │                          │                          │
      │                               │  (status: pending)         │                          │                          │
      │                               ├───────────────────────────────────────────────────────►│                          │
      │                               │                            │                          │                          │
      │                               │  Enqueue job               │                          │                          │
      │                               ├───────────────────────────►│                          │                          │
      │                               │                            │                          │                          │
      │  202 Accepted                 │                            │  Job picked up           │                          │
      │◄──────────────────────────────┤                            ├─────────────────────────►│                          │
      │  { executionId }              │                            │  { workflowId,           │                          │
      │                               │                            │    executionId,           │                          │
      │                               │                            │    triggerData }          │                          │
      │                               │                            │                          │  Load workflow + nodes   │
      │                               │                            │                          ├─────────────────────────►│
      │                               │                            │                          │◄─────────────────────────┤
      │                               │                            │                          │                          │
      │                               │                            │                          │  Update execution        │
      │                               │                            │                          │  (status: running)       │
      │                               │                            │                          ├─────────────────────────►│
      │                               │                            │                          │                          │
      │                               │                            │                          │  For each action:        │
      │                               │                            │                          │  ┌─────────────────────┐ │
      │                               │                            │                          │  │ 1. Interpolate      │ │
      │                               │                            │                          │  │    templates          │ │
      │                               │                            │                          │  │ 2. execute(action)  │ │
      │                               │                            │                          │  │ 3. Record step in   │ │
      │                               │                            │                          │  │    execution_steps  │ │
      │                               │                            │                          │  │ 4. On failure:      │ │
      │                               │                            │                          │  │    stop + mark      │ │
      │                               │                            │                          │  │    execution failed │ │
      │                               │                            │                          │  └─────────────────────┘ │
      │                               │                            │                          │                          │
      │                               │                            │                          │  Update execution        │
      │                               │                            │                          │  (status: success/      │
      │                               │                            │                          │   failed, finished_at) │
      │                               │                            │                          ├─────────────────────────►│
      │                               │                            │                          │                          │
      │                               │                            │  Job completed / failed  │                          │
      │                               │                            │◄─────────────────────────┤                          │
```

### Execution Engine Pseudocode (Conceptual — Not Implementation Code)

> Read this to understand the logic before you code it yourself.

```
function runExecution(workflowId, triggerData):
    workflow = loadWorkflowWithNodes(workflowId)
    if workflow is null or workflow.status != "active":
        return  // workflow was deleted or deactivated — nothing to do

    execution = createExecution(workflow, triggerData, status="running")
    context = { trigger: triggerData, steps: {} }

    for each node in workflow.nodes ordered by position:
        stepRecord = createExecutionStep(execution.id, node, status="running")

        try:
            resolvedConfig = interpolateTemplates(node.config, context)
            output = executeAction(node.type, resolvedConfig)  // with timeout
            updateStep(stepRecord, status="success", output=output)
            context.steps[node.name] = { output }
        catch error:
            updateStep(stepRecord, status="failed", error=error.message)
            updateExecution(execution, status="failed", error=error.message)
            return  // stop — do not run remaining actions

    updateExecution(execution, status="success")
```

### Status Lifecycle

```
                    ┌─────────┐
                    │ pending │  (job enqueued, not yet picked up)
                    └────┬────┘
                         │  worker picks up job
                         ▼
                    ┌─────────┐
                    │ running │  (engine is iterating through actions)
                    └──┬───┬──┘
                       │   │
              ┌────────┘   └────────┐
              ▼                     ▼
       ┌─────────┐            ┌────────┐
       │ success │            │ failed │  (an action threw an error)
       └─────────┘            └────┬───┘
                                   │  retries configured?
                              ┌────┴────┐
                              │ retrying│  (BullMQ will retry)
                              └────┬────┘
                                   │  retries exhausted
                                   ▼
                              ┌────────────┐
                              │ dead-letter│  (moved to DLQ)
                              └────────────┘
```

---

## 8. Queue / Retry / Dead-Letter Architecture

### Queue Topology

```
                         ┌──────────────────────────────────┐
                         │         Redis (BullMQ)            │
                         │                                   │
  Triggers               │  ┌──────────────────────────┐     │
  ────────  enqueue  ──► │  │  workflow-execution      │     │
                         │  │  ┌────────────────────┐  │     │
                         │  │  │ Job: {             │  │     │
                         │  │  │   workflowId,      │  │     │
                         │  │  │   executionId,     │  │     │
                         │  │  │   triggerData      │  │     │
                         │  │  │ }                  │  │     │
                         │  │  │ attempts: 3        │  │     │
                         │  │  │ backoff: expon.    │  │     │
                         │  │  └────────────────────┘  │     │
                         │  └────────────┬─────────────┘     │
                         │               │                    │
                         │               │ on max retries     │
                         │               ▼                    │
                         │  ┌──────────────────────────┐     │
                         │  │  dead-letter             │     │
                         │  │  (failed jobs moved here)│     │
                         │  └──────────────────────────┘     │
                         │                                   │
                         │  ┌──────────────────────────┐     │
                         │  │  scheduled (delayed)     │     │
                         │  │  (cron triggers + Delay  │     │
                         │  │   actions use delayed     │     │
                         │  │   jobs)                   │     │
                         │  └──────────────────────────┘     │
                         └──────────────────────────────────┘
                                   │            ▲
                          dequeue  │            │  replay
                                   ▼            │
                         ┌──────────────────┐   │
                         │  Worker Process  │───┘
                         │  (BullMQ Worker) │
                         │  concurrency: N  │
                         └──────────────────┘
```

### Retry Strategy

| Attempt | Delay (Exponential) | Example (base 5 s, factor 5) |
|---------|---------------------|------------------------------|
| 1 (initial) | — | Immediate |
| 2 | `5 s` | 5 seconds after failure |
| 3 | `25 s` | 25 seconds after 2nd failure |
| 4 (dead-letter) | — | No more retries → moved to DLQ |

- **Retryable errors:** HTTP 429, 5xx, network timeouts, connection failures
- **Non-retryable errors:** HTTP 400, 401, 403, 404, validation errors, template errors
- Each action handler classifies its own errors — the engine checks `error.retryable` before deciding

### BullMQ Job Options (Recommended Defaults)

| Option | Value | Why |
|--------|-------|-----|
| `attempts` | `3` | Enough to handle transient blips without endless retries |
| `backoff.type` | `exponential` | Increasing delay avoids hammering a recovering service |
| `backoff.delay` | `5000` (5 s base) | Starting delay before first retry |
| `removeOnComplete` | `100` (keep last 100) | Prevent Redis from growing unbounded |
| `removeOnFail` | `false` | Keep failed jobs for DLQ inspection |
| `jobId` | `executionId` | Deduplication — same execution is never enqueued twice |

### Dead-Letter Flow

```
  Job fails (attempt 3/3)
        │
        ▼
  BullMQ marks job as "failed"
        │
        ▼
  Worker's failure handler:
  1. Update executions row → status = "failed"
  2. Insert into dead_letter_jobs table (for queryable UI)
  3. Optionally: emit event / log for alerting
        │
        ▼
  User sees it in Dead-Letter page
        │
   ┌────┴────┐
   │         │
 Replay   Discard
   │         │
   ▼         ▼
 Re-enqueue  Delete from
 as new job  dead_letter_jobs
```

---

## 9. Integration / Plugin Architecture

### Design Goal

Adding a new trigger or action should require **only** creating one new file and registering it — no changes to the engine, queue, or API routes.

### Registry Pattern

```
  ┌─────────────────────────────────────────────────┐
  │              TriggerRegistry                     │
  │  Map<string, TriggerHandler>                     │
  │  "webhook"  → WebhookTrigger                    │
  │  "schedule" → ScheduleTrigger                   │
  │  "manual"   → ManualTrigger                     │
  │  "slack:new_message" → SlackTrigger  (future)   │
  └─────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────┐
  │              ActionRegistry                      │
  │  Map<string, ActionHandler>                      │
  │  "http_request" → HttpRequestAction             │
  │  "send_email"   → SendEmailAction               │
  │  "delay"        → DelayAction                   │
  │  "slack:send"   → SlackSendAction    (future)   │
  └─────────────────────────────────────────────────┘
```

### Handler Interfaces (Conceptual)

```
TriggerHandler:
  - type: string                    // unique identifier, e.g., "webhook"
  - label: string                   // human name, e.g., "Webhook"
  - description: string
  - configSchema: JSONSchema        // validates trigger_config
  - validate(config): Result        // validate config before saving workflow
  - activate(workflow): void        // called when workflow is activated (register cron, etc.)
  - deactivate(workflow): void      // called when workflow is deactivated (unregister cron, etc.)

ActionHandler:
  - type: string                    // e.g., "http_request"
  - label: string                   // e.g., "HTTP Request"
  - description: string
  - configSchema: JSONSchema        // validates node config
  - validate(config): Result        // validate before saving
  - execute(input, config): Output  // run the action, return output or throw
  - isRetryable(error): boolean     // classify errors for retry logic
```

### Adding a New Integration (Future — After MVP)

To add, for example, a **Slack "Send Message" action** after the MVP:

- [ ] Create `backend/src/modules/actions/slack-send.action.ts` implementing `ActionHandler`
- [ ] Define its `configSchema` (channel, message, bot token credential reference)
- [ ] Implement `execute()` — calls the Slack API
- [ ] Implement `isRetryable()` — 429/5xx are retryable
- [ ] Register it in `action.registry.ts`: `registry.register("slack:send", new SlackSendAction())`
- [ ] Add a config form in the frontend: `frontend/src/routes/workflows/components/SlackSendForm.tsx`
- [ ] No changes needed to the engine, queue, or execution flow

### Future Integration Ideas (Post-MVP — Pick Based on Need)

| Integration | Type | Description |
|-------------|------|-------------|
| Slack | Action + Trigger | Send message / trigger on new message |
| Notion | Action | Create / update database entries |
| Google Sheets | Action | Append rows |
| Discord | Action | Send webhook message |
| GitHub | Trigger + Action | Trigger on push / create issue |
| OpenAI | Action | Generate text / classify |
| Conditional | Logic | If/else branching between actions |
| Loop | Logic | Iterate over an array output |

---

## 10. Frontend Pages & Features

### Route Map

```
/login                        → Login page
/register                     → Registration page
/dashboard                    → Overview stats + recent executions
/workflows                    → Workflow list (table/cards)
/workflows/new                → Create workflow (editor)
/workflows/:id                → Edit workflow (editor)
/workflows/:id/executions     → Executions for a single workflow
/executions                   → All executions (filterable list)
/executions/:id               → Execution detail (per-step breakdown)
/dead-letters                 → Dead-letter queue (if standalone page)
/settings                     → User profile + credentials (future)
```

### Page Details

#### Login / Register

- [ ] Email + password form with client-side validation
- [ ] Show/hide password toggle
- [ ] Error display (invalid credentials, email already taken)
- [ ] Link between login and register pages
- [ ] Redirect to dashboard on success

#### Dashboard

- [ ] Stat cards: total workflows, active workflows, executions today, success rate
- [ ] Recent executions table (last 10, with status badges)
- [ ] Quick action: "Create Workflow" button
- [ ] Failed executions alert if any in the last 24 h

#### Workflow List

- [ ] Table or card grid: name, trigger type badge, status toggle, last execution time, execution count
- [ ] Search by name
- [ ] Filter by status (active/inactive) and trigger type
- [ ] Actions per row: edit, duplicate (optional), delete, activate/deactivate
- [ ] Empty state: illustration + "Create your first workflow" CTA

#### Workflow Editor

- [ ] Workflow metadata: name (required), description (optional)
- [ ] Trigger section: type selector → type-specific config form
- [ ] Actions section: ordered list, each with type selector → config form, add/remove/reorder controls
- [ ] Variable helper: shows available `{{trigger.*}}` and `{{steps.*.output.*}}` for copy-paste
- [ ] Validation: inline errors, save button disabled until valid
- [ ] Save → shows success toast, stays on page
- [ ] Activate toggle (only enabled when config is valid)
- [ ] Webhook URL display (when trigger is webhook, after save)

#### Execution List

- [ ] Table: workflow name, trigger type, status badge, duration, timestamp
- [ ] Filter by workflow, status, date range
- [ ] Pagination
- [ ] Auto-refresh toggle (poll every 10 s)
- [ ] Click row → execution detail

#### Execution Detail

- [ ] Header: workflow name, overall status, duration, trigger payload (collapsible JSON)
- [ ] Timeline/step list: each step shows name, type, status badge, duration, input/output (collapsible JSON), error if failed
- [ ] Color-coded status per step (green/red/yellow)
- [ ] "Replay" button for failed executions (re-enqueues the workflow)

#### Dead-Letter Page

- [ ] Table: workflow name, error summary, failed at, attempts made
- [ ] Actions: replay, discard
- [ ] Empty state when no dead letters

### Shared Components

| Component | Purpose |
|-----------|---------|
| `Button` | Primary/secondary/ghost variants, loading state |
| `Input` / `Textarea` / `Select` | Form primitives with label + error display |
| `Card` | Container for workflow cards, stat cards |
| `Badge` / `StatusBadge` | Colored status indicators |
| `Modal` / `Dialog` | Confirmation dialogs, forms |
| `JsonViewer` | Collapsible, syntax-highlighted JSON display |
| `Toast` | Success/error/info notifications |
| `Skeleton` | Loading placeholders |
| `EmptyState` | Illustration + message + CTA for empty lists |

---

## 11. Testing Checklist

### Unit Tests

- [ ] Template interpolation — simple variables, nested paths, missing variables, escaping
- [ ] Each trigger handler — `validate()` with valid and invalid configs
- [ ] Each action handler — `validate()` and `execute()` (mock external calls)
- [ ] Retry classification — retryable vs. non-retryable errors per action type
- [ ] Auth utilities — password hashing, JWT sign/verify, token expiration
- [ ] Workflow validation — missing trigger, missing actions, invalid trigger/action type
- [ ] Cron expression validation — valid and invalid expressions

### Integration Tests (Backend)

- [ ] Auth flow — register → login → access protected route → refresh → logout → verify rejection
- [ ] Auth edge cases — duplicate email, wrong password, expired token, missing token
- [ ] Workflow CRUD — create → list → get → update → activate → deactivate → delete
- [ ] Ownership isolation — user A cannot read/update/delete user B's workflows
- [ ] Workflow validation — creating with invalid trigger/action config returns 400
- [ ] Webhook trigger — POST to webhook URL enqueues a job and creates an execution
- [ ] Manual trigger — POST to trigger endpoint enqueues a job
- [ ] Schedule trigger — cron job fires and enqueues on schedule (may need time mocking)
- [ ] Full execution path — trigger → queue → engine → all actions succeed → execution marked success
- [ ] Execution failure — an action fails → execution marked failed, remaining actions skipped
- [ ] Retry flow — retryable failure → job retried → eventually succeeds or goes to DLQ
- [ ] Dead-letter replay — replaying a DLQ job re-executes the workflow

### Frontend Tests

- [ ] Auth pages — form validation, error display, successful login/register flow
- [ ] Protected routes — redirect to login when unauthenticated
- [ ] Workflow list — renders workflows, handles empty state, search/filter
- [ ] Workflow editor — renders correct fields per trigger/action type, validates before save
- [ ] Execution list — renders executions with correct status badges, pagination
- [ ] Execution detail — renders per-step breakdown, handles failed step display
- [ ] API client — attaches auth header, handles 401, retries with refresh token

### Manual / Exploratory Testing

- [ ] End-to-end: create a webhook workflow with HTTP Request action → fire webhook → verify execution
- [ ] End-to-end: create a schedule workflow → wait for cron tick → verify execution
- [ ] End-to-end: create a manual workflow with all 3 action types → trigger manually → verify each step
- [ ] Test with an external API that returns errors — verify retry and DLQ behavior
- [ ] Test deactivating a workflow mid-queue — queued job should handle it gracefully
- [ ] Test deleting a workflow that has execution history — history should remain or be handled per your soft-delete decision
- [ ] Test with 50+ workflows and 1000+ executions — verify pagination and performance

### Load Testing (Basic)

- [ ] 100 concurrent webhook triggers — all executions recorded, no data loss
- [ ] Measure: average execution time, queue throughput (jobs/second), error rate under load
- [ ] Identify bottleneck (DB, Redis, worker concurrency) and note it

---

## 12. Deployment Checklist

### Docker

- [ ] `backend/Dockerfile` — multi-stage build, minimal final image, non-root user
- [ ] `frontend/Dockerfile` — builds static assets, serves via nginx or `serve`
- [ ] `docker-compose.yml` — all services defined with correct dependencies and health checks
- [ ] Named volumes for `postgres_data` and `redis_data`
- [ ] Environment variables injected correctly (no secrets hardcoded in Dockerfiles or compose file)
- [ ] `.dockerignore` excludes `node_modules`, `dist`, `.env`, `.git`
- [ ] `docker compose up --build` works from a clean clone with only `.env` setup
- [ ] `docker compose down -v` + `docker compose up --build` gives a clean reset

### Environment & Config

- [ ] `.env.example` is complete and documented (every variable has a comment explaining it)
- [ ] Production env vars are set correctly on the deployment target (no defaults leaking)
- [ ] `JWT_SECRET` is strong and unique per environment (not the same as dev)
- [ ] Database URL, Redis URL point to the correct hosts in production
- [ ] `NODE_ENV=production` is set in production containers

### Pre-Deploy Verification

- [ ] `npm run build` succeeds for both `backend/` and `frontend/` with no errors
- [ ] `npm test` passes (all tests green)
- [ ] `npx tsc --noEmit` passes (no type errors)
- [ ] `npx eslint .` passes (no lint errors)
- [ ] Migrations run cleanly on a fresh database
- [ ] Health endpoint returns 200 in the Docker setup

### Production Readiness

- [ ] Reverse proxy configured (Nginx/Caddy) if exposing to the internet — handles TLS, forwards to API + frontend
- [ ] HTTPS enabled (Let's Encrypt or cloud provider TLS)
- [ ] Database backups configured (automated `pg_dump` or cloud snapshots)
- [ ] Log aggregation considered (even if just `docker compose logs` for MVP)
- [ ] Restart policies set (`restart: unless-stopped` on all services)
- [ ] Resource limits set on containers if on a small VPS (prevent OOM)
- [ ] A `DEPLOY.md` or deployment section documents every step to go from zero to running

### Post-Deploy Smoke Test

- [ ] Register a new user via the deployed frontend
- [ ] Create and activate a workflow
- [ ] Trigger it and verify execution appears in history
- [ ] Check `GET /health` and `GET /api/health` on the deployed URL
- [ ] Verify logs are accessible (`docker compose logs` or cloud log viewer)

---

## 13. Final Project Checklist

Before calling the project done, verify every item below.

### Functionality

- [ ] User can register, log in, and stay authenticated (including token refresh)
- [ ] User can create, edit, activate, deactivate, and delete workflows
- [ ] All 3 MVP triggers work (webhook, schedule, manual)
- [ ] All 3 MVP actions work (HTTP Request, Send Email, Delay)
- [ ] Template interpolation works across trigger data and prior step outputs
- [ ] Workflow execution is sequential and records every step
- [ ] Failed actions stop the workflow and mark the execution as failed
- [ ] Execution history is complete and browsable (list + detail)
- [ ] Dashboard shows accurate summary stats

### Reliability

- [ ] Triggers enqueue jobs — they never execute workflows directly
- [ ] Worker picks up jobs and executes them reliably
- [ ] Transient failures are retried with exponential back-off
- [ ] Permanent failures go to the dead-letter queue without infinite retries
- [ ] Dead-letter jobs can be replayed or discarded
- [ ] Deactivating/deleting a workflow while jobs are queued is handled gracefully
- [ ] Rate limiting prevents runaway webhook floods

### Frontend

- [ ] Every page listed in [Section 10](#10-frontend-pages--features) is implemented
- [ ] All pages handle loading, empty, and error states
- [ ] Forms validate inline and show clear error messages
- [ ] Navigation works — no dead links, no missing routes
- [ ] The app is usable on desktop (mobile responsive is a bonus, not required for MVP)

### Code Quality

- [ ] JavaScript best practices with no `any` escapes (or every `any` is justified with a comment)
- [ ] No secrets or credentials committed to Git
- [ ] Consistent code style (ESLint + Prettier pass with zero errors)
- [ ] Meaningful commit history (not one giant commit)
- [ ] README progress section is fully ticked to ✅

### Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Frontend tests pass
- [ ] Manual end-to-end walkthrough succeeds for every MVP user flow
- [ ] Basic load test shows no data loss

### Deployment

- [ ] `docker compose up --build` brings up the full stack from scratch
- [ ] Data persists correctly across restarts
- [ ] Deployment is documented and reproducible
- [ ] (Optional) Production deployment is live and smoke-tested

---

## Appendix: Suggested Build Order Summary

```
Phase  0  ── Project Setup & Tooling
Phase  1  ── Backend Foundation (Fastify)
Phase  2  ── Database Design & Migrations
Phase  3  ── Authentication & Users
Phase  4  ── Workflow CRUD
Phase  5  ── Trigger & Action System (3 + 3)
Phase  6  ── Queue System (Redis + BullMQ)
Phase  7  ── Execution Engine
Phase  8  ── Frontend Foundation (React + Vite)
Phase  9  ── Workflow Builder UI
Phase 10  ── Execution History & Monitoring
Phase 11  ── Retry & Dead-Letter Queue
Phase 12  ── Advanced Features & Polish
Phase 13  ── Testing & Hardening
Phase 14  ── Docker & Deployment
              ── Done ──
```

> Work through these in order. Each phase unlocks the next. Do not skip ahead — the architecture is layered so that later phases depend on the contracts established earlier.

---

## Appendix: Tech Stack Reference

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js (LTS) | JavaScript runtime |
| Language | JavaScript (standard) | Type safety |
| Backend Framework | Fastify | HTTP server, validation, plugins |
| Database | PostgreSQL | Durable storage |
| Queue | Redis + BullMQ | Job queue, retries, scheduling |
| Frontend | React + Vite | SPA, build tool |
| Styling | Tailwind CSS (recommended) | Utility-first CSS |
| Auth | JWT (access + refresh) | Stateless authentication |
| Validation | TypeBox / Zod / JSON Schema | Request/response validation |
| Email | Nodemailer + SMTP | Send Email action |
| Testing | Vitest + Supertest + MSW | Unit + integration + frontend tests |
| Containerization | Docker + Docker Compose | Local dev parity + deployment |
| Linting | ESLint + Prettier | Code quality + formatting |

---

## Appendix: Glossary

| Term | Meaning |
|------|---------|
| **Workflow** | A user-defined automation: one trigger + one or more sequential actions |
| **Trigger** | The event that starts a workflow (webhook, schedule, manual) |
| **Action** | A single step in a workflow (HTTP request, send email, delay) |
| **Execution** | One run of a workflow — created when a trigger fires |
| **Execution Step** | The recorded result of a single action within an execution |
| **Queue** | Redis + BullMQ — holds jobs until a worker picks them up |
| **Worker** | A separate Node process that dequeues jobs and runs the execution engine |
| **Dead Letter** | A job that failed all retries — quarantined for manual inspection |
| **Template** | A `{{variable}}` placeholder in action config that is resolved at execution time |
| **Registry** | The map of trigger/action type strings to their handler implementations |

---

<p align="center"><em>Build it step by step. Check every box. Ship it.</em></p>

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview
Fullstack platform (Bilibili-inspired) — monorepo with Next.js 15 frontend and NestJS backend. Users can upload/watch videos, post danmaku (bullet comments), follow creators, and purchase membership.

## Monorepo structure
```
/
├── apps/
│   ├── web/          # Next.js 15 (App Router)
│   └── api/          # NestJS backend
├── packages/
│   ├── shared-types/ # Shared TypeScript types (consumed by both web and api)
│   └── api-client/   # Auto-generated Axios client from OpenAPI spec
├── infra/
│   └── docker-compose.yml
└── CLAUDE.md
```

## Commands

### Development
- `pnpm dev` — run web + api concurrently (Turborepo)
- `pnpm dev:web` — Next.js only
- `pnpm dev:api` — NestJS only

### Build & check
- `pnpm build` — build entire monorepo
- `pnpm lint` — ESLint + Prettier across repo
- `pnpm typecheck` — `tsc --noEmit` across repo

### Testing
- `pnpm test` — all tests
- `pnpm test:e2e` — end-to-end tests (run before PR)
- `pnpm --filter api test -- --testPathPattern=<module>` — single NestJS test file
- `pnpm --filter web test -- --testPathPattern=<component>` — single web test file

### Database
- `pnpm --filter api migration:generate -- src/migrations/<Name>` — generate migration
- `pnpm --filter api migration:run` — apply migrations

## Architecture

### Request flow (backend)
`Controller` → `Service` → `Repository` (TypeORM custom repo for complex logic) → `Entity`

All responses go through `ResponseInterceptor` → `{ data, meta, error }`.

Auth uses `JwtAuthGuard` applied globally; public routes are whitelisted with a decorator.

### Data flow (frontend)
Server Components fetch data directly (RSC). Client Components use TanStack Query hooks for server state and Zustand stores for client state. Mutations happen via Server Actions (not Route Handlers, except webhooks/file upload).

### Real-time
Socket.io gateway on the API side; `socket.io-client` on web. Danmaku (bullet comments) flow over WebSocket.

### Video pipeline
Upload → Bull queue job → FFmpeg processing → HLS segments → Vidstack + HLS.js playback.

### Packages
- `packages/shared-types`: Any change here must be reflected in both `apps/web` and `apps/api`.
- `packages/api-client`: Regenerate from OpenAPI spec when backend routes change.

## Tech stack

### Frontend (`apps/web`)
- Next.js 15 (App Router, RSC, Server Actions), TypeScript 5 strict
- Tailwind CSS + shadcn/ui
- Zustand (client state) + TanStack Query v5 (server state)
- Vidstack + HLS.js (video player)
- Socket.io-client (danmaku real-time)
- Motion (animations), React Hook Form + Zod (forms)

### Backend (`apps/api`)
- NestJS 10 + TypeScript strict, Fastify adapter (not Express)
- TypeORM + PostgreSQL 16
- Redis 7 (cache, session, rate limiting)
- Socket.io gateway (danmaku WebSocket)
- Bull + Redis (video processing job queue)
- Passport.js (JWT auth)
- Swagger/OpenAPI auto-gen — check at `/api/docs`

## Code conventions

### General
- Named exports only — no default exports except Next.js pages/layouts
- No `any` — use `unknown` when type is truly unknown
- No `console.log` — use NestJS `Logger` in api, `pino` in web
- Handle errors explicitly; never leave `catch` blocks empty
- Hardcoded strings → constants file

### Frontend
- Data fetching in Server Components; mutations in Client Components
- Use `"use client"` only when browser API or state is needed
- Component names: PascalCase; file names: kebab-case
- No direct API calls in components — always through TanStack Query hooks
- One Zustand store per domain: `useUserStore`, `usePlayerStore`, etc.

### Backend
- One NestJS module per feature: `module`, `controller`, `service`, `dto`, `entity`
- All DTOs must use `class-validator` decorators
- No direct DB queries in controllers — always through service layer
- Use TypeORM custom repositories for complex query logic

### Database
- Migrations required — `synchronize: true` only for local dev
- Table names: `snake_case`, plural (`users`, `videos`, `comments`)
- Column names: `snake_case`
- Every entity needs `created_at`, `updated_at`
- Soft deletes via `@DeleteDateColumn()` — never hard-delete

## Feature development workflow
1. Create branch `feature/<name>`
2. Define DTOs and Entities first, then Service, then Controller
3. Run `pnpm typecheck` after each significant batch of changes
4. Run `pnpm test:e2e` before opening PR
5. Verify Swagger reflects changes at `/api/docs`

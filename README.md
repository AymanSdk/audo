# Audo

<div align="center">

Audio generation platform foundation built with modern TypeScript tooling, organization-aware auth, and a PostgreSQL-backed data layer.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF)](https://clerk.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ESLint](https://img.shields.io/badge/Lint-ESLint-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh/)

</div>

---

## Table of contents

- [Overview](#overview)
- [Current features](#current-features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Database schema](#database-schema)
- [Authentication and organization flow](#authentication-and-organization-flow)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Getting started](#getting-started)
- [Available commands](#available-commands)
- [Development workflow](#development-workflow)
- [Code quality and formatting](#code-quality-and-formatting)
- [Deployment notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap ideas](#roadmap-ideas)

## Overview

**Audo** is a Next.js App Router application that combines:

- Organization-based authentication and routing with Clerk
- PostgreSQL persistence through Prisma ORM
- A typed environment boundary (`src/lib/env.ts`) for safe runtime configuration
- A shared UI component system based on shadcn/ui and Tailwind CSS v4

The repository currently provides the app foundation (auth, org context enforcement, data models, and UI primitives) ready for deeper audio-generation product features.

## Current features

- ✅ **Clerk auth pages** at `/sign-in` and `/sign-up`
- ✅ **Organization picker flow** at `/org-selection`
- ✅ **Protected app routing** using middleware-like proxy logic
- ✅ **Organization requirement guard** (redirects authenticated users without selected org)
- ✅ **Prisma + PostgreSQL integration** with generated client in `src/generated/prisma`
- ✅ **Initial domain models** for voices and generations
- ✅ **Typed design system** with extensive UI components in `src/components/ui`
- ✅ **Global formatting baseline** with Prettier (`.prettierrc.json`)

## Tech stack

| Layer       | Technology                                   |
| ----------- | -------------------------------------------- |
| Framework   | Next.js 16 (App Router)                      |
| Frontend    | React 19 + TypeScript                        |
| Styling     | Tailwind CSS v4 + shadcn/ui + tw-animate-css |
| Auth & orgs | Clerk (`@clerk/nextjs`)                      |
| Database    | PostgreSQL                                   |
| ORM         | Prisma 7 + `@prisma/adapter-pg`              |
| Validation  | Zod + `@t3-oss/env-nextjs`                   |
| Tooling     | ESLint 9, Prettier, Bun                      |

## Architecture

```mermaid
flowchart TD
	U[User Browser] --> N[Next.js App Router]
	N --> P[Proxy / Auth Guard]
	P -->|public routes| A[Sign-in / Sign-up]
	P -->|protected routes + org selected| H[App Pages]
	P -->|no org selected| O[Org Selection Page]
	H --> D[Prisma Client]
	D --> PG[(PostgreSQL)]
```

### Key architectural points

- `src/proxy.ts` centralizes route protection and org enforcement.
- `src/lib/db.ts` creates a singleton Prisma client (avoids dev hot-reload connection explosions).
- `prisma/schema.prisma` models `Voice` and `Generation` with useful indexes on org and relation fields.
- `src/app/layout.tsx` wraps the app with `ClerkProvider` and mounts global UI primitives (`Toaster`).

## Project structure

```text
audo/
├─ prisma/
│  ├─ migrations/
│  └─ schema.prisma
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ org-selection/page.tsx
│  │  ├─ sign-in/[[...sign-in]]/page.tsx
│  │  ├─ sign-up/[[...sign-up]]/page.tsx
│  │  └─ test/page.tsx
│  ├─ components/ui/
│  ├─ generated/prisma/
│  ├─ lib/
│  │  ├─ db.ts
│  │  └─ env.ts
│  └─ proxy.ts
├─ .prettierrc.json
├─ eslint.config.mjs
├─ next.config.ts
├─ prisma.config.ts
└─ package.json
```

## Database schema

The data model currently contains two core entities:

### `Voice`

- Represents either system-provided or custom voice presets.
- Contains metadata such as `name`, `category`, `language`, and optional `r2ObjectKey`.
- Includes org scoping with optional `orgId` and indexing for query efficiency.

### `Generation`

- Represents text-to-audio generation records.
- Stores generation inputs (`text`, `temperature`, `topP`, `topK`, `repetitionPenalty`) and output reference (`r2ObjectKey`).
- Links optionally to a voice (`voiceId`) with `onDelete: SetNull`.
- Enforces organization ownership via required `orgId`.

### Enums

- `VoiceVariant`: `SYSTEM`, `CUSTOM`
- `VoiceCategory`: audiobook/conversational/customer-service/general/narrative/characters/meditation/motivational/podcast/advertising/voiceover/corporate

## Authentication and organization flow

Route behavior from `src/proxy.ts`:

1. Public routes are allowed: `/sign-in(.*)` and `/sign-up(.*)`.
2. All other routes require authentication.
3. `/org-selection(.*)` is allowed for authenticated users.
4. If user is authenticated but has no selected organization, they are redirected to `/org-selection`.
5. API routes are also covered by matcher rules.

This makes organization context a first-class requirement for protected product areas.

## Prerequisites

- **Node.js** 20+ (recommended if using npm)
- **Bun** latest (recommended, lockfile present: `bun.lock`)
- **PostgreSQL** database accessible via `DATABASE_URL`
- **Clerk** application keys configured for auth flows

## Environment variables

Create a `.env` file in the project root.

### Required by code

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
```

### Required in practice for Clerk runtime

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

### Optional

```bash
SKIP_ENV_VALIDATION="true"
```

> `SKIP_ENV_VALIDATION` is useful in constrained environments, but keep validation enabled in normal development to catch config issues early.

## Getting started

### 1) Install dependencies

```bash
bun install
```

Or use npm:

```bash
npm install
```

### 2) Configure environment

Create `.env` using the variables above.

### 3) Run Prisma migrations

```bash
bunx prisma migrate dev --name init
```

If schema changes later, create a descriptive migration name each time.

### 4) Start the app

```bash
bun run dev
```

Open http://localhost:3000.

## Available commands

From `package.json`:

| Command         | Description                    |
| --------------- | ------------------------------ |
| `bun run dev`   | Start local Next.js dev server |
| `bun run build` | Build production assets        |
| `bun run start` | Start production server        |
| `bun run lint`  | Run ESLint checks              |

Useful Prisma commands:

| Command                                 | Description                              |
| --------------------------------------- | ---------------------------------------- |
| `bunx prisma migrate dev --name <name>` | Create/apply a new development migration |
| `bunx prisma generate`                  | Regenerate Prisma client                 |
| `bunx prisma studio`                    | Open database browser UI                 |

## Development workflow

1. Pull latest main branch changes.
2. Update schema in `prisma/schema.prisma` when needed.
3. Run `bunx prisma migrate dev --name <change-name>`.
4. Implement feature pages/components.
5. Run linting and formatting.
6. Build before opening a PR.

## Code quality and formatting

- ESLint config: `eslint.config.mjs` (Next.js core-web-vitals + TypeScript presets)
- Prettier config: `.prettierrc.json`
- TypeScript path alias: `@/*` -> `src/*`

Suggested local checks:

```bash
bun run lint
bun run build
```

## Deployment notes

- Ensure all production env vars are configured (`DATABASE_URL`, Clerk keys).
- Run migrations against your target database before or during deployment.
- Validate middleware/proxy route behavior in production domains.

Common deployment targets for this stack include Vercel, Fly.io, and container platforms.

## Troubleshooting

### Prisma cannot connect

- Confirm `DATABASE_URL` format and credentials.
- Verify DB network accessibility from your runtime environment.

### Auth redirects loop or fail

- Check Clerk publishable/secret keys.
- Ensure allowed redirect URLs are configured in Clerk dashboard.
- Confirm org selection route is reachable.

### Type errors around Prisma client

- Regenerate the client: `bunx prisma generate`.
- Ensure generated output remains at `src/generated/prisma`.

## Roadmap ideas

- Add API endpoints for generation creation and listing.
- Add object storage integration for generated audio files.
- Add queue/worker processing for generation jobs.
- Add role-based organization permissions.
- Add tests for proxy auth flow and data access boundaries.

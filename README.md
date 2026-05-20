# Kalpak Design Studio

Full-stack monorepo for an interior design and architecture firm. Includes a public marketing website, an internal admin console, and a REST API — all sharing a single TypeScript codebase.

---

## Architecture

```
kalpak_d_s/
├── apps/
│   ├── web/          # Public website            → localhost:3000
│   └── admin/        # Internal admin console    → localhost:3001
└── packages/
    ├── api/          # Express REST API           → localhost:4000
    ├── shared/       # Types, schemas, utilities  (imported by all)
    └── db/           # Supabase client + DB types + migrations
```

Managed with **Turborepo** and **pnpm workspaces**. TypeScript throughout.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo, pnpm workspaces |
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Radix UI |
| State / Data | TanStack Query v5, React Hook Form, Zod |
| Charts | Recharts (dynamic import, SSR disabled) |
| PDF | @react-pdf/renderer (client-side only) |
| Animation | Framer Motion |
| API | Express 4, Helmet, express-rate-limit, Morgan |
| Database | Supabase (Postgres), Row Level Security |
| Auth | Supabase Auth (JWT), role-based middleware |
| File Storage | Supabase Storage (signed URLs, generated on demand) |
| Validation | Zod schemas in `@kalpak/shared`, validated in API middleware |
| Language | TypeScript 5.7 |

---

## Prerequisites

- Node.js >= 18
- pnpm >= 9 (`npm install -g pnpm`)
- A Supabase project

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

**`packages/api/.env`**
```env
PORT=4000
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
REVALIDATE_SECRET=<random-secret>
```

**`apps/admin/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=http://localhost:4000
REVALIDATE_SECRET=<same-secret-as-api>
```

### 3. Apply database migrations

Run these in order in the Supabase SQL editor (or via CLI):

```
packages/db/migrations/001_initial_schema.sql
packages/db/migrations/002_triggers.sql
packages/db/migrations/003_rls_policies.sql
packages/db/migrations/004_storage_policies.sql
packages/db/migrations/005_blog.sql
```

`packages/db/migrations/APPLY_ALL.sql` runs all five in sequence.

### 4. Create the first partner account

In the Supabase dashboard → Authentication → Users, invite a user, then manually set their `role` to `'partner'` in the `public.profiles` table.

### 5. Start development

```bash
# All three services in parallel
pnpm dev

# Or individually
pnpm dev:api      # API only
pnpm dev:web      # Public website only
pnpm dev:admin    # Admin console only
```

---

## Project Structure

### `apps/web` — Public Website

| Route | Description |
|---|---|
| `/` | Home — hero, services overview, estimator teaser, insights preview |
| `/about` | About the studio |
| `/services` | Services overview |
| `/services/interior-design` | Interior design service page |
| `/services/architecture` | Architecture service page |
| `/services/space-planning` | Space planning service page |
| `/services/turnkey` | Turnkey projects service page |
| `/portfolio` | Project portfolio grid |
| `/portfolio/[slug]` | Individual project detail |
| `/insights` | Blog listing |
| `/insights/[slug]` | Blog post (Markdown rendered via marked + sanitize-html) |
| `/estimator` | Cost estimator (display only — includes disclaimer) |
| `/contact` | Contact / lead capture form |

### `apps/admin` — Admin Console

Role-based access: **partner** sees everything; **employee** sees only project-scoped pages.

| Route | Access | Description |
|---|---|---|
| `/dashboard` | Partner | KPI cards + spend trend charts |
| `/projects` | All | Project list with filters |
| `/projects/new` | All | Create project |
| `/projects/[id]` | All | Project overview + assignment |
| `/projects/[id]/workers` | All | Field workers on-site |
| `/projects/[id]/updates` | All | Daily site updates + photos |
| `/projects/[id]/financials` | All | Worker & vendor payments + PDF export |
| `/projects/[id]/documents` | All | File upload / download (signed URLs) |
| `/workers` | All | Worker directory |
| `/clients` | All | Client management |
| `/leads` | Partner | Incoming leads from website |
| `/team` | Partner | Employee accounts — invite / deactivate |
| `/reports` | Partner | Cross-project financial overview |
| `/blog` | Partner | Blog CMS — create / edit / publish posts |

### `packages/api` — REST API

All routes under `/api/*`. Protected by JWT auth middleware; sensitive routes require `requireRole('partner')`.

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/auth/profiles` |
| Projects | CRUD `/api/projects`, `/api/projects/:id` |
| Workers (project) | `GET/POST/DELETE /api/projects/:id/workers` |
| Site Updates | `GET/POST /api/projects/:id/updates` |
| Payments | `GET/POST /api/projects/:id/payments/workers`, `/vendors`; `DELETE /api/payments/workers/:id`, `/vendors/:id` |
| Documents | `GET/POST /api/projects/:id/documents`, `DELETE /api/documents/:id` |
| Workers | CRUD `/api/workers` |
| Clients | CRUD `/api/clients` |
| Leads | `GET/POST/PATCH /api/leads` |
| Team | `GET /api/team`, `POST /api/team/invite`, `PATCH /api/team/:userId/status` |
| Dashboard | `GET /api/dashboard` (partner only) |
| Reports | `GET /api/reports/overview` (partner only) |
| Blog | CRUD `/api/blog`, `/api/blog/:id` |

### `packages/shared`

Shared across `api`, `admin`, and `web`:

- **Types** — `Project`, `Worker`, `Client`, `Lead`, `TeamMember`, `BlogPost`, etc.
- **Schemas** — Zod schemas for every write operation
- **Utils** — `formatCurrency` (all monetary display uses this — never inline)

### `packages/db`

- Supabase browser and server clients
- `database.types.ts` — generated from Supabase schema
- SQL migrations

---

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users`; role: `partner` \| `employee`; `is_active` lockout |
| `clients` | Client records with lead status pipeline |
| `projects` | Core project entity; `is_published` gates public portfolio |
| `project_assignments` | Many-to-many: profiles ↔ projects (with role in project) |
| `workers` | Field workers directory (trades-typed) |
| `project_workers` | Many-to-many: workers ↔ projects |
| `site_updates` | Daily site diary entries with photos |
| `worker_payments` | Per-worker payments; amount stored as `numeric(10,2)` |
| `vendor_payments` | Vendor/material payments; amount stored as `numeric(10,2)` |
| `project_documents` | File metadata; actual files in Supabase Storage |
| `leads` | Inbound leads from the public contact form |
| `blog_posts` | Blog content; `is_published` gates public display |

All monetary values are `numeric(10,2)` — never floats or strings.

---

## Available Scripts

```bash
# From repo root
pnpm dev              # Start all services
pnpm build            # Build all packages and apps
pnpm type-check       # TypeScript check across entire monorepo
pnpm lint             # ESLint across entire monorepo

# Target a single workspace
pnpm --filter admin type-check
pnpm --filter @kalpak/api type-check
pnpm --filter @kalpak/shared build
```

---

## Regenerating Database Types

After applying new migrations, regenerate `packages/db/src/types/database.types.ts`:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "your-access-token"
pnpm dlx supabase gen types typescript --project-id <project-ref> > packages/db/src/types/database.types.ts
```

Then rebuild the `db` package so downstream consumers pick up the new types:

```bash
pnpm --filter @kalpak/db build
pnpm --filter @kalpak/shared build
```

---

## Security Notes

- All monetary display goes through `formatCurrency` from `@kalpak/shared`
- PDF generation is client-side only — payment data never leaves the browser to a third-party service
- Blog markdown is sanitized with `sanitize-html` before rendering as HTML
- Supabase Storage URLs are signed on demand and never persisted to the database
- The `/api/dashboard` endpoint uses `Promise.all` for parallel queries
- The on-demand revalidation endpoint validates `REVALIDATE_SECRET` before revalidating
- The cost estimator is display-only and includes a clear disclaimer
- Deactivated employees (`is_active = false`) are blocked at the API middleware layer on every request

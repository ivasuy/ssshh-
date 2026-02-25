# Architecture

SSH is a single Next.js 15 application. No microservices, no Redis, no external job queues. Everything runs in one process deployed as a Docker container on a VPS.

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Application                     │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Pages    │  │  API Routes  │  │  Instrumentation      │  │
│  │  (React)  │  │  (REST)      │  │  (node-cron scheduler)│  │
│  └─────┬────┘  └──────┬───────┘  └───────────┬───────────┘  │
│        │               │                      │              │
│        │        ┌──────┴───────┐       ┌──────┴──────┐       │
│        │        │  Auth        │       │  Cron Jobs  │       │
│        │        │  Middleware   │       │  (internal  │       │
│        │        │  (Firebase)  │       │   HTTP)     │       │
│        │        └──────────────┘       └─────────────┘       │
│        │                                                     │
│  ┌─────┴────────────────────────────────────────────────┐    │
│  │                    Service Layer                       │    │
│  │  api.ts · ai-service.ts · connectors/*                │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                    │
│  ┌──────────────────────┴───────────────────────────────┐    │
│  │                   Mongoose Models                      │    │
│  │  User · Post · Resource · Signal · TechCard           │    │
│  │  Collection · ContributionOpportunity · PostLink · Tag │    │
│  └──────────────────────┬───────────────────────────────┘    │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │      MongoDB          │
              │  (Atlas or local)     │
              └───────────────────────┘

External Services:
  ├── Firebase Auth (Google OAuth)
  ├── GitHub REST API (connectors)
  ├── RSS Feeds (Cloudflare, GitHub, Vercel, Node.js, React)
  ├── Vertex AI / Gemini (card generation)
  └── Cloudinary (image uploads)
```

---

## Data Flow

### Signal Ingestion (Cron — every 6 hours)

```
RSS Feeds ──→ rss-connector.ts ──→ signal-builder.ts ──→ MongoDB (signals)
  │ Cloudflare changelog               │ normalize
  │ GitHub changelog                    │ deduplicate
  │ Vercel blog                         │ score
  │ Node.js blog
  │ React blog
```

### Opportunity Ingestion (Cron — daily)

```
GitHub Search API ──→ github-connector.ts ──→ MongoDB (contribution_opportunities)
  │ good-first-issue                         │ extract repo
  │ help-wanted                              │ classify difficulty
  │ (TS, JS, Python, Rust, Go)              │ score
```

### User-Facing Read Path

```
Browser ──→ Next.js Page ──→ Client fetch() ──→ API Route ──→ Mongoose ──→ MongoDB
                                                    │
                                              Auth middleware
                                              (for write ops)
```

### AI Card Generation

```
User request ──→ /api/ai/generate-card ──→ ai-service.ts ──→ Vertex AI (Gemini)
                                                │
                                          Parse JSON response
                                                │
                                          Save to tech_cards
```

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home — Radar feed
│   ├── layout.tsx                # Root layout (fonts, AuthProvider, Navbar)
│   ├── globals.css               # Tailwind + CRT theme styles
│   ├── cards/
│   │   ├── page.tsx              # Cards glossary grid
│   │   └── [slug]/page.tsx       # Card detail
│   ├── library/
│   │   ├── page.tsx              # Resource library grid
│   │   └── [id]/page.tsx         # Resource detail
│   ├── lounge/page.tsx           # Community lounge
│   ├── opportunities/page.tsx    # Contribution opportunities
│   ├── content/page.tsx          # Content policy
│   ├── privacy/page.tsx          # Privacy policy
│   ├── terms/page.tsx            # Terms of service
│   └── api/
│       ├── auth/me/              # User profile create/fetch
│       ├── posts/                # Lounge CRUD + reactions + comments
│       ├── resources/            # Library browse + detail
│       ├── cards/                # Tech cards + detail by slug
│       ├── signals/              # Radar signal feed
│       ├── opportunities/        # Contribution opportunities
│       ├── collections/          # User collections CRUD + items
│       ├── ai/generate-card/     # Vertex AI card generation
│       └── cron/
│           ├── ingest-signals/   # RSS → signals (every 6h)
│           ├── ingest-opportunities/ # GitHub issues → opportunities (daily)
│           ├── seed-resources/   # One-time resource seed
│           └── seed-cards/       # One-time tech card seed
│
├── components/
│   ├── nav/navbar.tsx            # Top navigation bar
│   ├── radar/radar-feed.tsx      # Signal feed with type filters
│   ├── library/                  # Library grid + filters
│   ├── cards/                    # Cards grid + search
│   ├── opportunities/            # Opportunities list + filters
│   ├── lounge/                   # Lounge grid + note form
│   └── ui/                       # Radix primitives, motion effects, CRT cursor
│
├── models/                       # Mongoose schemas (10 models)
│   ├── user.ts
│   ├── post.ts
│   ├── resource.ts
│   ├── resource-snapshot.ts
│   ├── signal.ts
│   ├── tech-card.ts
│   ├── collection.ts
│   ├── contribution-opportunity.ts
│   ├── post-link.ts
│   ├── tag.ts
│   └── index.ts                  # Barrel exports
│
├── service/
│   ├── api.ts                    # Client-side API helper (axios)
│   ├── ai-service.ts             # Vertex AI prompts (card gen, summarize, categorize)
│   └── connectors/
│       ├── github-connector.ts   # GitHub REST API wrapper
│       ├── rss-connector.ts      # RSS feed parser + feed URLs
│       ├── signal-builder.ts     # Normalize, deduplicate, score signals
│       └── index.ts
│
├── context/
│   └── AuthContext.tsx            # Firebase auth state + user profile
│
├── lib/
│   ├── firebase.ts               # Firebase client SDK init (guarded)
│   ├── firebase-admin.ts         # Firebase Admin SDK (token verification)
│   ├── mongodb.ts                # Mongoose connection singleton
│   ├── vertex-ai.ts              # Vertex AI client singleton
│   ├── auth-middleware.ts        # Bearer token verification for API routes
│   ├── cron-auth.ts              # CRON_SECRET verification for cron routes
│   ├── env.ts                    # Environment variable validation
│   └── utils.ts                  # Tailwind cn() helper
│
├── types/
│   └── types.ts                  # Shared TypeScript interfaces
│
└── instrumentation.ts            # node-cron scheduler (runs on server start)
```

---

## Models (Entity Relationship)

```
User ─────────┬──→ Post (userId)
              │      ├──→ PostLink ──→ Resource | TechCard | Signal
              │      ├──→ Reactions (embedded)
              │      └──→ Comments (embedded)
              │
              └──→ Collection
                     └──→ Items [ { entityType, entityId } ]
                              ──→ Resource | TechCard

Resource ──→ ResourceSnapshot (resourceId, snapshotType)

Signal (standalone, populated by cron)

ContributionOpportunity (standalone, populated by cron)

TechCard (standalone, populated by seed or AI generation)

Tag (standalone, for future autocomplete)
```

---

## Authentication Flow

1. User clicks "Sign In" → Firebase Google OAuth popup
2. Firebase returns `FirebaseUser` with ID token
3. Client calls `POST /api/auth/me` with `Authorization: Bearer <idToken>`
4. Server verifies token via `firebase-admin` → `verifyIdToken()`
5. Server finds or creates `User` document in MongoDB
6. `AuthContext` stores user profile for client-side use
7. Subsequent authenticated requests include the Firebase ID token header

---

## Cron Scheduling (Docker/VPS)

Instead of Vercel Cron or an external scheduler, cron jobs run inside the Next.js process using `node-cron` via the `instrumentation.ts` hook:

1. On server start, `register()` in `instrumentation.ts` is called
2. It schedules `node-cron` tasks that call internal API routes via `fetch()`
3. Each cron route verifies the `CRON_SECRET` bearer token
4. The routes perform their work (fetch RSS, query GitHub, upsert to MongoDB)

| Job | Schedule | Route |
|-----|----------|-------|
| Signal ingestion | Every 6 hours | `POST /api/cron/ingest-signals` |
| Opportunity ingestion | Daily at midnight | `POST /api/cron/ingest-opportunities` |

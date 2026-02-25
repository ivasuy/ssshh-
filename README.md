# SSH — Developer Handbook + Stack Radar

**SSH** is a developer-first platform that combines a curated resource library, real-time tech signal radar, micro learning cards, contribution opportunities, and a community lounge — all in a retro CRT terminal aesthetic.

It tracks what's changing in the ecosystem (releases, changelogs, vulnerabilities), surfaces open-source contribution opportunities, and provides a glossary of concepts developers actually need to look up during work and interviews.

## Modules

| Module | Route | What it does |
|--------|-------|--------------|
| **Radar** | `/` | Real-time feed of tech signals — releases, changelogs, vulnerabilities — pulled from RSS feeds (Cloudflare, GitHub, Vercel, Node.js, React) |
| **Library** | `/library` | Browse curated open-source repos, templates, and building blocks. Filter by language, topic, license, stars |
| **Cards** | `/cards` | Tech glossary and interview prep cards. Definitions, use cases, "where used", and interview Q&As for concepts like SSR, Docker, JWT |
| **Opportunities** | `/opportunities` | Good-first-issue and help-wanted GitHub issues across TypeScript, JavaScript, Python, Rust, and Go |
| **Lounge** | `/lounge` | Community notes, insights, and hot takes. Triage reactions (Works, Used, Saved, Outdated, Breaking) and comments |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Database | MongoDB (Mongoose ODM) |
| Auth | Firebase Google OAuth (client + admin SDK) |
| AI | Google Vertex AI (Gemini 1.5 Flash) for card generation |
| Styling | Tailwind CSS, Radix UI primitives, Framer Motion |
| Scheduling | `node-cron` via Next.js instrumentation (Docker/VPS) |
| Connectors | RSS parser, GitHub REST API (Octokit-free) |

## Quick Start

```bash
git clone <repo-url> && cd ssshh-
cp .env.example .env.local   # fill in your credentials
npm install
npm run dev                   # http://localhost:3000
```

See [SETUP.md](./SETUP.md) for full environment configuration and Docker deployment.

## Documentation

| File | Contents |
|------|----------|
| [SETUP.md](./SETUP.md) | Environment variables, local dev, Docker deployment, seed scripts |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, directory structure, models |
| [SERVICES.md](./SERVICES.md) | Every implemented service, API route, connector, and cron job |
| [TODO.md](./TODO.md) | Remaining tasks and what's been completed |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server (cron jobs activate) |
| `npm run lint` | Run ESLint |

## License

Private project.

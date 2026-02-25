# Services Reference

Complete reference of all implemented services, API routes, connectors, and background jobs in SSH.

---

## API Routes

### Authentication

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/me` | Bearer token | Create or fetch user profile. Accepts `{ email, displayName, photoUrl }`. Returns `{ user }` |
| `PATCH` | `/api/auth/me` | Bearer token | Update user profile (`displayName`, `stacks`) |

### Posts (Lounge)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/posts` | Public | List posts. Query: `page`, `limit`, `postType`, `tag` |
| `POST` | `/api/posts` | Bearer token | Create post. Body: `{ title, content, postType?, tags?, imageUrl? }` |
| `GET` | `/api/posts/[id]` | Public | Get single post by ID |
| `PATCH` | `/api/posts/[id]` | Bearer token | Update post (`title`, `content`, `tags`) |
| `DELETE` | `/api/posts/[id]` | Bearer token | Delete post (owner only) |
| `POST` | `/api/posts/[id]/react` | Bearer token | Toggle reaction. Body: `{ reaction }` where reaction is one of `✅` (Works), `🔥` (Used), `🔖` (Saved), `⚠️` (Outdated), `💀` (Breaking) |
| `POST` | `/api/posts/[id]/comment` | Bearer token | Add comment. Body: `{ comment }` |

### Resources (Library)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/resources` | Public | List resources. Query: `page`, `limit`, `language`, `topic`, `license`, `isTemplate`, `minStars`, `search` |
| `GET` | `/api/resources/[id]` | Public | Get resource detail with snapshots and related posts |

### Tech Cards

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/cards` | Public | List cards. Query: `page`, `limit`, `domain`, `search` |
| `GET` | `/api/cards/[slug]` | Public | Get card by slug with related posts |

### Signals (Radar)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/signals` | Public | List signals. Query: `page`, `limit`, `signalType`, `source`, `minScore`, `fromDate`, `toDate` |

### Opportunities

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/opportunities` | Public | List opportunities. Query: `page`, `limit`, `difficulty`, `labels`, `hasBounty`, `minScore`, `search` |

### Collections

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/collections` | Bearer token | List user's collections |
| `POST` | `/api/collections` | Bearer token | Create collection. Body: `{ name, description? }` |
| `GET` | `/api/collections/[id]` | Bearer token | Get collection by ID |
| `PATCH` | `/api/collections/[id]` | Bearer token | Update collection (`name`, `description`) |
| `DELETE` | `/api/collections/[id]` | Bearer token | Delete collection |
| `POST` | `/api/collections/[id]/items` | Bearer token | Add item. Body: `{ entityType: "resource"|"card", entityId }` |
| `DELETE` | `/api/collections/[id]/items` | Bearer token | Remove item. Body: `{ entityId }` |

### AI

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/ai/generate-card` | Bearer token | Generate tech card with Vertex AI. Body: `{ term, domain? }`. Returns `{ card }` |

### Cron (Internal)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/cron/ingest-signals` | CRON_SECRET | Fetch RSS feeds, normalize, deduplicate, upsert signals |
| `POST` | `/api/cron/ingest-opportunities` | CRON_SECRET | Fetch GitHub issues (good-first-issue, help-wanted), upsert opportunities |
| `POST` | `/api/cron/seed-resources` | CRON_SECRET | Seed 25 curated OSS resources (idempotent) |
| `POST` | `/api/cron/seed-cards` | CRON_SECRET | Seed 25 curated tech cards (idempotent) |

---

## Connectors

### GitHub Connector (`src/service/connectors/github-connector.ts`)

Wraps the GitHub REST API with optional `GITHUB_TOKEN` for higher rate limits.

| Function | Description |
|----------|-------------|
| `searchRepositories(query, options)` | Search repos by query string, sort by stars/forks/updated |
| `getRepository(owner, repo)` | Fetch single repo metadata |
| `getRepositoryReleases(owner, repo)` | Fetch latest releases |
| `getRepositoryReadme(owner, repo)` | Fetch raw README content |
| `getRepositoryLicense(owner, repo)` | Fetch SPDX license identifier |
| `searchIssues(query, options)` | Search issues with label filters |
| `getGoodFirstIssues(language?)` | Shortcut: open issues labeled "good first issue" |
| `getHelpWantedIssues(language?)` | Shortcut: open issues labeled "help wanted" |
| `discoverTemplateRepos(topic, minStars)` | Find template repos by topic |
| `discoverTrendingRepos(language?, createdAfter?)` | Find trending repos from the past week |

### RSS Connector (`src/service/connectors/rss-connector.ts`)

Parses RSS/Atom feeds into normalized items.

| Function | Description |
|----------|-------------|
| `fetchRSSFeed(url)` | Parse any RSS/Atom feed URL |
| `fetchCloudflareChangelog()` | Fetch Cloudflare developer changelog |
| `fetchGitHubChangelog()` | Fetch GitHub blog changelog |
| `fetchMultipleFeeds(urls)` | Fetch multiple feeds in parallel |
| `parseRSSDate(dateString)` | Parse date string to Date |
| `extractKeywordsFromRSSItem(item)` | Extract categories + breaking/security terms |

Preconfigured feed URLs:

| Source | Feed |
|--------|------|
| Cloudflare | Blog, Developer changelog |
| GitHub | Blog, Changelog |
| Vercel | Blog |
| Node.js | Blog |
| React | Blog |

### Signal Builder (`src/service/connectors/signal-builder.ts`)

Transforms raw data into normalized, scored, deduplicated signals.

| Function | Description |
|----------|-------------|
| `normalizeRSSItemToSignal(item, source)` | RSS item → NormalizedSignal with type/score |
| `normalizeGitHubReleaseToSignal(release, repo)` | GitHub release → signal |
| `normalizeGitHubIssueToSignal(issue, repo)` | GitHub issue → signal |
| `normalizeNewRepoToSignal(repo)` | New repo → signal |
| `deduplicateSignals(signals)` | Remove duplicates by entityRef, keep highest score |
| `sortSignalsByRelevance(signals)` | Sort by score then date |
| `enrichSignalWithAI(signal)` | (Optional) AI-based scoring via Vertex AI |

---

## AI Service (`src/service/ai-service.ts`)

Uses Google Vertex AI (Gemini 1.5 Flash) for content intelligence.

| Function | Description |
|----------|-------------|
| `generateTechCard(term, domain?)` | Generate full card: definition, use cases, where used, interview Q&As, refs |
| `summarizeContent(content)` | Summarize technical content in 2-3 sentences |
| `categorizeSignal(title, content)` | Classify signal type and importance score (0-100) |
| `scoreResource(name, description, stars, lastPushed)` | Compute resource health score based on stars + freshness |

---

## Client-Side API Service (`src/service/api.ts`)

Axios-based client that calls API routes from React components. Handles Firebase auth token injection.

| Function | Returns |
|----------|---------|
| `fetchPosts(options)` | `PaginatedResponse<PostType>` |
| `fetchPostById(id)` | `PostType | null` |
| `createPost(data)` | `PostType` |
| `updatePost(id, data)` | `PostType` |
| `deletePost(id)` | `void` |
| `addReaction(postId, reaction)` | Reactions map |
| `addComment(postId, comment)` | `void` |
| `fetchResources(filters, pagination)` | `PaginatedResponse<ResourceType>` |
| `fetchResourceById(id)` | Resource + snapshots + related posts |
| `fetchSignals(filters, pagination)` | `PaginatedResponse<SignalType>` |
| `fetchCards(filters, pagination)` | `PaginatedResponse<TechCardType>` |
| `fetchCardBySlug(slug)` | Card + related posts |
| `generateCard(term, domain?)` | `TechCardType` |
| `fetchOpportunities(filters, pagination)` | `PaginatedResponse<ContributionOpportunityType>` |
| `fetchCollections()` | `CollectionType[]` |
| `createCollection(name, description?)` | `CollectionType` |
| `fetchCollectionById(id)` | `CollectionType | null` |
| `updateCollection(id, data)` | `CollectionType` |
| `deleteCollection(id)` | `void` |
| `addToCollection(collectionId, entityType, entityId)` | `CollectionType` |
| `removeFromCollection(collectionId, entityId)` | `CollectionType` |
| `getCurrentUser()` | User profile |
| `updateUserProfile(data)` | User profile |
| `uploadToCloudinary(mediaFile)` | Image URL string |

---

## Background Jobs (Cron)

Scheduled via `node-cron` in `src/instrumentation.ts`. Runs inside the Next.js server process — no external scheduler.

### Signal Ingestion

- **Schedule**: Every 6 hours (`0 */6 * * *`)
- **Route**: `POST /api/cron/ingest-signals`
- **Sources**: 5 RSS feeds (Cloudflare, GitHub, Vercel, Node.js, React)
- **Process**: Fetch feeds → normalize to NormalizedSignal → deduplicate by entityRef → upsert into `signals` collection
- **Scoring**: Based on keywords (security=90, breaking=80, release=70, default=50)

### Opportunity Ingestion

- **Schedule**: Daily at midnight (`0 0 * * *`)
- **Route**: `POST /api/cron/ingest-opportunities`
- **Sources**: GitHub Search API (5 languages: TypeScript, JavaScript, Python, Rust, Go)
- **Process**: Search `good-first-issue` + `help-wanted` → extract repo/labels → classify difficulty → upsert into `contribution_opportunities`
- **Scoring**: Based on labels (bounty=80+, good-first-issue=60, help-wanted=55, base=50)

---

## Auth Middleware

### Firebase Auth (`src/lib/auth-middleware.ts`)

Used by protected API routes (posts, collections, user profile).

- Extracts `Authorization: Bearer <token>` header
- Verifies token via `firebase-admin` SDK → `verifyIdToken()`
- Returns decoded token with `uid`, `email`, etc.

### Cron Auth (`src/lib/cron-auth.ts`)

Used by cron API routes.

- Checks `Authorization: Bearer <CRON_SECRET>` header
- In development mode, allows requests if `CRON_SECRET` is not set
- In production, rejects all unauthenticated requests

---

## Data Models

| Model | Collection | Key Fields | Unique Index |
|-------|-----------|------------|--------------|
| User | `users` | firebaseUid, email, displayName, stacks, credit | firebaseUid, email |
| Post | `posts` | userId, title, content, postType, tags, reactions, comments | — |
| Resource | `resources` | owner, repo, url, language, topics, stars, licenseSpdx | owner+repo, url |
| ResourceSnapshot | `resource_snapshots` | resourceId, snapshotType, contentHash, content | — |
| Signal | `signals` | signalType, source, title, summary, entityRef, score, publishedAt | source+entityRef |
| TechCard | `tech_cards` | term, slug, domain, shortDefinition, useCases, whereUsed, interviewQAs | slug |
| Collection | `collections` | userId, name, description, items[] | userId+name |
| ContributionOpportunity | `contribution_opportunities` | provider, repo, issueNumber, title, labels, difficulty, score | provider+repo+issueNumber |
| PostLink | `post_links` | postId, entityType, entityId | postId+entityType+entityId |
| Tag | `tags` | name, slug, category, usageCount | slug |

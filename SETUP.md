# Setup Guide

## Prerequisites

- Node.js 18+
- MongoDB instance (Atlas or local)
- Firebase project with Google Auth enabled
- (Optional) Google Cloud project with Vertex AI API enabled
- (Optional) GitHub personal access token

---

## 1. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

### Required

| Variable | Where to get it |
|----------|----------------|
| `MONGODB_URI` | MongoDB Atlas dashboard → Connect → Connection string |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → General → Web app |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same as above |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same as above |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same as above |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same as above |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same as above |

### Required for Auth-Protected API Routes

| Variable | Where to get it |
|----------|----------------|
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase Console → Project Settings → Service accounts |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Same → Generate new private key → JSON file |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Same → paste the full key including `-----BEGIN/END-----` |

### Required for Cron Jobs (Docker/VPS)

| Variable | Purpose |
|----------|---------|
| `CRON_SECRET` | Any random secret string used to authenticate cron API calls |
| `NEXT_PUBLIC_BASE_URL` | The URL the app calls itself from (e.g. `http://localhost:3000`) |

### Optional

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | GitHub personal access token — increases API rate limits for connectors |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID for Vertex AI card generation |
| `GOOGLE_CLOUD_LOCATION` | GCP region (defaults to `us-central1`) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | For image uploads in Lounge posts |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary account name |

---

## 2. Local Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`. Cron jobs activate automatically via `node-cron` in the Next.js process when the server starts.

---

## 3. Seed Data

After starting the server, seed initial data by calling the cron API routes. Use `curl` or any HTTP client:

```bash
# Set your secret (must match CRON_SECRET in .env.local)
SECRET="your_cron_secret_here"

# Seed 25 curated resources
curl -X POST http://localhost:3000/api/cron/seed-resources \
  -H "Authorization: Bearer $SECRET"

# Seed 25 tech cards
curl -X POST http://localhost:3000/api/cron/seed-cards \
  -H "Authorization: Bearer $SECRET"

# Run signal ingestion (RSS feeds)
curl -X POST http://localhost:3000/api/cron/ingest-signals \
  -H "Authorization: Bearer $SECRET"

# Run opportunity ingestion (GitHub issues)
curl -X POST http://localhost:3000/api/cron/ingest-opportunities \
  -H "Authorization: Bearer $SECRET"
```

Seed routes are idempotent — running them again won't create duplicates.

---

## 4. Docker Deployment (VPS)

### Dockerfile

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_BASE_URL=http://localhost:3000
    restart: unless-stopped
```

### Deploy

```bash
docker compose up -d --build
```

Cron jobs run inside the Next.js process automatically — no external scheduler needed.

---

## 5. MongoDB Indexes

Most indexes are defined in the Mongoose schemas and created automatically on first connection. For production, verify these exist in Atlas:

- `signals`: `{ signalType: 1, publishedAt: -1 }`, `{ source: 1, entityRef: 1 }` (unique)
- `resources`: `{ owner: 1, repo: 1 }` (unique), `{ stars: -1 }`
- `contribution_opportunities`: `{ provider: 1, repo: 1, issueNumber: 1 }` (unique), `{ score: -1 }`
- `tech_cards`: `{ slug: 1 }` (unique), `{ term: "text", shortDefinition: "text" }`
- `posts`: `{ createdAt: -1 }`, `{ postType: 1, createdAt: -1 }`
- `post_links`: `{ postId: 1, entityType: 1, entityId: 1 }` (unique)
- `collections`: `{ userId: 1, name: 1 }` (unique)

---

## 6. Troubleshooting

| Problem | Solution |
|---------|----------|
| Firebase auth not working | Ensure all 6 `NEXT_PUBLIC_FIREBASE_*` vars are set. Enable Google provider in Firebase Console → Authentication → Sign-in method |
| Build fails on static pages | Firebase client SDK is guarded — check that `NEXT_PUBLIC_FIREBASE_API_KEY` is set |
| Cron jobs not running | Ensure `CRON_SECRET` and `NEXT_PUBLIC_BASE_URL` are set. Check server logs for `[CRON] Scheduled:` message on startup |
| GitHub connector rate limited | Set `GITHUB_TOKEN` for 5,000 req/hr instead of 60 |
| Vertex AI errors | Enable Vertex AI API in GCP console. Set `GOOGLE_CLOUD_PROJECT` |

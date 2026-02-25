# SSH — Remaining Tasks

Items still pending after the MVP Phase 1 implementation.

---

## 1. Run Seed Scripts (One-Time)

- [ ] Run `POST /api/cron/seed-resources` to populate the `resources` collection
- [ ] Run `POST /api/cron/seed-cards` to populate the `tech_cards` collection
- [ ] Run `POST /api/cron/ingest-signals` manually once to confirm signals flow
- [ ] Run `POST /api/cron/ingest-opportunities` manually once to confirm opportunities flow

---

## 2. Library Module

- [ ] Add "Save to collection" button on resource detail page (`/library/[id]`)
- [ ] Wire collection item add/remove UI to existing `POST /api/collections/[id]/items`
- [ ] Add license filter to `library-filters.tsx`
- [ ] Resource detail: "Integration quickstart" excerpt from README (post-MVP)
- [ ] Resource detail: "Notes" tab showing posts linked via PostLink (post-MVP)
- [ ] Full-text search for resources — MongoDB text index (post-MVP)

---

## 3. Cards Module

- [ ] "Add experience" flow — create post linked to card via PostLink (reuse note form with card ref)
- [ ] Card detail: show related posts/notes (query PostLink by card slug)
- [ ] Improve Vertex AI card generation prompt and output parsing
- [ ] Add card contribution/editing — user-suggested improvements (post-MVP)
- [ ] Domain-based filtering and search on cards page

---

## 4. Radar Module

- [ ] Verify signal feed displays ingested data correctly
- [ ] Implement watchlists / topic-scoped radar (post-MVP, paid feature)
- [ ] Add "Save signal" or link post to signal
- [ ] Notifications for high-score signals — email/webhook (post-MVP)

---

## 5. Opportunities Module

- [ ] Verify opportunity list displays ingested data correctly
- [ ] Add repo health/score display
- [ ] Bounty badge styling and filtering (post-MVP)
- [ ] Matching engine — stack/tags for paid tier (post-MVP)
- [ ] Algora integration for bounty data (post-MVP)

---

## 6. Lounge Module

- [ ] Post linking: extend note form to optionally attach resource/card/signal (PostLink)
- [ ] Tag autocomplete from unified Tag collection (post-MVP)
- [ ] Report/flag flow for moderation (post-MVP)

---

## 7. Security & Compliance (Post-MVP)

- [ ] OSV API integration for vulnerability checking
- [ ] deps.dev / Open Source Insights for dependency intelligence
- [ ] OpenSSF Scorecard API for repo health
- [ ] Store and display license metadata (SPDX) for all resources
- [ ] Enforce "link out, don't copy" for roadmap.sh and similar
- [ ] Content policy update (replace gossip-era policy with tech handbook policy)

---

## 8. Legal & Policy Pages

- [ ] Update `/content` page — Content Policy for tech handbook
- [ ] Update `/privacy` page — align with Firebase + MongoDB + Vertex AI
- [ ] Update `/terms` page — terms of service for SSH product
- [ ] Add footer links to policy pages

---

## 9. Monetization & Paid Features (Post-MVP)

- [ ] Implement plan limits (collections, watchlists, saved searches)
- [ ] Polar.sh or Stripe billing integration
- [ ] Paid tier: deep filters, stack lens, saved searches, alerts
- [ ] Paid tier: opportunity matching, bounty connectors
- [ ] Paid tier: OSV/Scorecard/deps.dev insights

---

## 10. DevOps & Infrastructure

- [ ] Set up MongoDB Atlas indexes for performance (most already defined in schemas)
- [ ] Error tracking — Sentry or similar
- [ ] Dockerfile for production deployment
- [ ] Docker Compose for local dev (app + MongoDB)
- [ ] Remove or repurpose `postcss.config.js` if duplicate of `postcss.config.mjs`

---

## 11. UX Polish

- [ ] Loading states and error boundaries on all main pages
- [ ] Empty states with helpful CTAs
- [ ] Mobile responsive improvements
- [ ] Accessibility (a11y) audit

---

## Completed (Phase 1 MVP)

- [x] Cron infrastructure — `node-cron` via Next.js `instrumentation.ts` (Docker/VPS)
- [x] Signal ingestion cron — RSS feeds (Cloudflare, GitHub, Vercel, Node.js, React) → `signals`
- [x] Opportunity ingestion cron — GitHub issues (good-first-issue, help-wanted) → `contribution_opportunities`
- [x] Resource seed script — 25 curated OSS resources
- [x] Tech card seed script — 25 curated terms across web, react, devops, security, etc.
- [x] Cron auth middleware (`CRON_SECRET` header check)
- [x] Environment validation (`src/lib/env.ts`)
- [x] Reaction emoji update — "Works", "Used", "Saved", "Outdated", "Breaking"
- [x] Post type filter on Lounge page (NOTE / INSIGHT / HOT_TAKE)
- [x] Next.js instrumentation hook enabled for cron scheduling
- [x] `.env.example` updated with `CRON_SECRET` and `NEXT_PUBLIC_BASE_URL`

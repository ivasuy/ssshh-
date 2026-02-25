import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import TechCard from "@/models/tech-card";
import { verifyCronRequest, cronUnauthorized } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const SEED_CARDS = [
  { term: "SSR", domain: "web", shortDefinition: "Server-Side Rendering generates HTML on the server for each request, improving initial load time and SEO.", useCases: ["SEO-critical pages", "Dynamic content that changes per-request", "Personalized dashboards"], whereUsed: ["Next.js", "Nuxt.js", "SvelteKit"], refs: ["https://nextjs.org/docs/app/building-your-application/rendering/server-components"] },
  { term: "SSG", domain: "web", shortDefinition: "Static Site Generation pre-renders pages at build time, producing fast static HTML files.", useCases: ["Marketing sites", "Documentation", "Blogs"], whereUsed: ["Next.js", "Astro", "Hugo"], refs: ["https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation"] },
  { term: "ISR", domain: "web", shortDefinition: "Incremental Static Regeneration lets you update static pages after build time without rebuilding the entire site.", useCases: ["E-commerce product pages", "News articles", "CMS-driven content"], whereUsed: ["Next.js", "Vercel"], refs: ["https://nextjs.org/docs/pages/building-your-application/rendering/incremental-static-regeneration"] },
  { term: "RSC", domain: "react", shortDefinition: "React Server Components run exclusively on the server, reducing client-side JavaScript and enabling direct data access.", useCases: ["Data fetching without client waterfalls", "Large dependency usage server-side only", "Streaming UI"], whereUsed: ["Next.js App Router", "React 19"], refs: ["https://react.dev/reference/rsc/server-components"] },
  { term: "Edge Computing", domain: "infrastructure", shortDefinition: "Running compute at CDN edge locations close to users, reducing latency for serverless functions.", useCases: ["A/B testing at the edge", "Geolocation-based routing", "Auth token validation"], whereUsed: ["Cloudflare Workers", "Vercel Edge Functions", "Deno Deploy"], refs: ["https://developers.cloudflare.com/workers/"] },
  { term: "WebSocket", domain: "networking", shortDefinition: "A protocol providing full-duplex communication channels over a single TCP connection for real-time data.", useCases: ["Chat applications", "Live dashboards", "Multiplayer games", "Collaborative editing"], whereUsed: ["Socket.io", "ws (Node.js)", "Ably"], refs: ["https://developer.mozilla.org/en-US/docs/Web/API/WebSocket"] },
  { term: "GraphQL", domain: "api", shortDefinition: "A query language for APIs that lets clients request exactly the data they need, no more and no less.", useCases: ["Mobile apps with bandwidth constraints", "Aggregating multiple microservices", "Complex relational data"], whereUsed: ["GitHub API v4", "Shopify", "Apollo"], refs: ["https://graphql.org/learn/"] },
  { term: "REST", domain: "api", shortDefinition: "Representational State Transfer — an architectural style for designing networked APIs using standard HTTP methods.", useCases: ["CRUD APIs", "Public APIs", "Microservice communication"], whereUsed: ["Almost every web service", "Stripe API", "GitHub API v3"], refs: ["https://restfulapi.net/"] },
  { term: "Docker", domain: "devops", shortDefinition: "A platform for building, shipping, and running applications in lightweight, portable containers.", useCases: ["Consistent dev environments", "CI/CD pipelines", "Microservice deployment"], whereUsed: ["Docker Hub", "Kubernetes", "GitHub Actions"], refs: ["https://docs.docker.com/get-started/"] },
  { term: "Kubernetes", domain: "devops", shortDefinition: "An open-source container orchestration system for automating deployment, scaling, and management of containerized applications.", useCases: ["Auto-scaling workloads", "Rolling deployments", "Service discovery"], whereUsed: ["GKE", "EKS", "AKS"], refs: ["https://kubernetes.io/docs/home/"] },
  { term: "CI/CD", domain: "devops", shortDefinition: "Continuous Integration and Continuous Delivery — automating code testing, building, and deployment on every change.", useCases: ["Automated test suites", "Zero-downtime deployments", "Release automation"], whereUsed: ["GitHub Actions", "GitLab CI", "Jenkins"], refs: ["https://docs.github.com/en/actions"] },
  { term: "ORM", domain: "database", shortDefinition: "Object-Relational Mapping maps database tables to programming language objects, abstracting SQL queries.", useCases: ["Type-safe database queries", "Schema migrations", "Multi-database support"], whereUsed: ["Prisma", "Drizzle", "TypeORM", "SQLAlchemy"], refs: ["https://www.prisma.io/docs/concepts/overview/what-is-prisma"] },
  { term: "JWT", domain: "security", shortDefinition: "JSON Web Token — a compact, URL-safe token format for securely transmitting claims between parties.", useCases: ["Stateless authentication", "API authorization", "Single sign-on"], whereUsed: ["Auth0", "Firebase Auth", "Next-Auth"], refs: ["https://jwt.io/introduction"] },
  { term: "OAuth 2.0", domain: "security", shortDefinition: "An authorization framework that enables third-party apps to obtain limited access to user accounts on an HTTP service.", useCases: ["Social login (Google, GitHub)", "API access delegation", "Third-party integrations"], whereUsed: ["Google APIs", "GitHub", "Spotify"], refs: ["https://oauth.net/2/"] },
  { term: "WebAssembly", domain: "web", shortDefinition: "A binary instruction format that runs near-native-speed code in web browsers alongside JavaScript.", useCases: ["Image/video processing in browser", "Game engines on the web", "Porting C/C++/Rust to web"], whereUsed: ["Figma", "Google Earth", "AutoCAD Web"], refs: ["https://webassembly.org/"] },
  { term: "Monorepo", domain: "tooling", shortDefinition: "A single repository containing multiple projects or packages, enabling shared code and unified tooling.", useCases: ["Shared component libraries", "Coordinated releases", "Unified CI/CD"], whereUsed: ["Turborepo", "Nx", "pnpm workspaces"], refs: ["https://turbo.build/repo/docs"] },
  { term: "Middleware", domain: "web", shortDefinition: "Code that runs between a request and response, used to intercept, transform, or redirect HTTP traffic.", useCases: ["Authentication checks", "Rate limiting", "Logging and analytics", "Geolocation redirects"], whereUsed: ["Express.js", "Next.js Middleware", "Hono"], refs: ["https://nextjs.org/docs/app/building-your-application/routing/middleware"] },
  { term: "Serverless", domain: "infrastructure", shortDefinition: "A cloud execution model where the provider manages server infrastructure and you only pay per invocation.", useCases: ["API endpoints", "Scheduled jobs", "Event-driven processing"], whereUsed: ["AWS Lambda", "Vercel Functions", "Cloudflare Workers"], refs: ["https://aws.amazon.com/lambda/"] },
  { term: "Tree Shaking", domain: "tooling", shortDefinition: "A dead-code elimination technique that removes unused exports from JavaScript bundles during build.", useCases: ["Reducing bundle size", "Optimizing library imports", "Production builds"], whereUsed: ["Webpack", "Vite/Rollup", "esbuild"], refs: ["https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking"] },
  { term: "Hydration", domain: "react", shortDefinition: "The process of attaching event listeners and state to server-rendered HTML on the client, making it interactive.", useCases: ["SSR + client interactivity", "Streaming SSR", "Progressive enhancement"], whereUsed: ["React", "Vue", "Svelte", "Solid"], refs: ["https://react.dev/reference/react-dom/client/hydrateRoot"] },
  { term: "CORS", domain: "security", shortDefinition: "Cross-Origin Resource Sharing — a mechanism that allows restricted resources on a web page to be requested from another domain.", useCases: ["API access from different domains", "CDN asset loading", "Microservice communication"], whereUsed: ["Every web API", "Express cors middleware", "Next.js headers"], refs: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"] },
  { term: "Rate Limiting", domain: "security", shortDefinition: "Controlling the number of requests a client can make to an API within a given time window to prevent abuse.", useCases: ["API abuse prevention", "DDoS mitigation", "Fair usage enforcement"], whereUsed: ["Cloudflare", "Nginx", "Express rate-limit"], refs: ["https://cloud.google.com/architecture/rate-limiting-strategies-techniques"] },
  { term: "Streaming", domain: "web", shortDefinition: "Sending data in chunks as it becomes available, rather than waiting for the entire response to be ready.", useCases: ["LLM token-by-token output", "Large file downloads", "SSR streaming with Suspense"], whereUsed: ["React Suspense", "OpenAI API", "Node.js Streams"], refs: ["https://developer.mozilla.org/en-US/docs/Web/API/Streams_API"] },
  { term: "Service Worker", domain: "web", shortDefinition: "A script that runs in the background of a browser, enabling offline caching, push notifications, and background sync.", useCases: ["Offline-first apps", "Push notifications", "Background data sync"], whereUsed: ["PWAs", "Workbox", "next-pwa"], refs: ["https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API"] },
  { term: "Microservices", domain: "architecture", shortDefinition: "An architectural style that structures an application as a collection of small, independently deployable services.", useCases: ["Independent scaling", "Technology diversity", "Team autonomy"], whereUsed: ["Netflix", "Amazon", "Uber"], refs: ["https://microservices.io/"] },
];

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return cronUnauthorized();
  }

  try {
    await connectDB();

    let inserted = 0;
    let skipped = 0;

    for (const card of SEED_CARDS) {
      const slug = slugify(card.term);

      try {
        await TechCard.updateOne(
          { slug },
          {
            $setOnInsert: {
              term: card.term,
              slug,
              domain: card.domain,
              shortDefinition: card.shortDefinition,
              useCases: card.useCases,
              whereUsed: card.whereUsed,
              interviewQAs: [],
              refs: card.refs,
              qualityScore: 70,
            },
          },
          { upsert: true }
        );
        inserted++;
      } catch {
        skipped++;
      }
    }

    return Response.json({ ok: true, inserted, skipped });
  } catch (error) {
    console.error("Card seeding failed:", error);
    return Response.json({ error: "Card seeding failed" }, { status: 500 });
  }
}

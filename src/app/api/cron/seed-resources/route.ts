import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Resource from "@/models/resource";
import { verifyCronRequest, cronUnauthorized } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

const SEED_RESOURCES = [
  { owner: "vercel", repo: "next.js", language: "TypeScript", stars: 120000, topics: ["react", "framework", "ssr"], licenseSpdx: "MIT", description: "The React Framework" },
  { owner: "facebook", repo: "react", language: "JavaScript", stars: 220000, topics: ["ui", "library", "frontend"], licenseSpdx: "MIT", description: "The library for web and native user interfaces" },
  { owner: "microsoft", repo: "TypeScript", language: "TypeScript", stars: 97000, topics: ["typescript", "compiler", "language"], licenseSpdx: "Apache-2.0", description: "TypeScript is a superset of JavaScript that compiles to clean JavaScript output" },
  { owner: "denoland", repo: "deno", language: "Rust", stars: 93000, topics: ["runtime", "typescript", "javascript"], licenseSpdx: "MIT", description: "A modern runtime for JavaScript and TypeScript" },
  { owner: "nodejs", repo: "node", language: "JavaScript", stars: 104000, topics: ["nodejs", "runtime", "javascript"], licenseSpdx: "MIT", description: "Node.js JavaScript runtime" },
  { owner: "tailwindlabs", repo: "tailwindcss", language: "TypeScript", stars: 78000, topics: ["css", "utility", "framework"], licenseSpdx: "MIT", description: "A utility-first CSS framework for rapid UI development" },
  { owner: "prisma", repo: "prisma", language: "TypeScript", stars: 37000, topics: ["database", "orm", "typescript"], licenseSpdx: "Apache-2.0", description: "Next-generation ORM for Node.js & TypeScript" },
  { owner: "drizzle-team", repo: "drizzle-orm", language: "TypeScript", stars: 22000, topics: ["database", "orm", "typescript"], licenseSpdx: "Apache-2.0", description: "Headless TypeScript ORM" },
  { owner: "trpc", repo: "trpc", language: "TypeScript", stars: 33000, topics: ["api", "rpc", "typescript"], licenseSpdx: "MIT", description: "End-to-end typesafe APIs made easy" },
  { owner: "honojs", repo: "hono", language: "TypeScript", stars: 16000, topics: ["web", "framework", "edge"], licenseSpdx: "MIT", description: "Ultrafast web framework for the Edges" },
  { owner: "sveltejs", repo: "svelte", language: "JavaScript", stars: 77000, topics: ["ui", "compiler", "framework"], licenseSpdx: "MIT", description: "Cybernetically enhanced web apps" },
  { owner: "vuejs", repo: "core", language: "TypeScript", stars: 45000, topics: ["vue", "framework", "frontend"], licenseSpdx: "MIT", description: "Vue.js is a progressive, incrementally-adoptable JavaScript framework" },
  { owner: "astro-community", repo: "astro", language: "TypeScript", stars: 42000, topics: ["static", "framework", "islands"], licenseSpdx: "MIT", description: "The web framework for content-driven websites" },
  { owner: "rust-lang", repo: "rust", language: "Rust", stars: 93000, topics: ["rust", "language", "systems"], licenseSpdx: "Apache-2.0", description: "Empowering everyone to build reliable and efficient software" },
  { owner: "golang", repo: "go", language: "Go", stars: 120000, topics: ["go", "language", "systems"], licenseSpdx: "BSD-3-Clause", description: "The Go programming language" },
  { owner: "docker", repo: "compose", language: "Go", stars: 32000, topics: ["docker", "containers", "devops"], licenseSpdx: "Apache-2.0", description: "Define and run multi-container applications with Docker" },
  { owner: "kubernetes", repo: "kubernetes", language: "Go", stars: 107000, topics: ["kubernetes", "containers", "orchestration"], licenseSpdx: "Apache-2.0", description: "Production-Grade Container Orchestration" },
  { owner: "vitejs", repo: "vite", language: "TypeScript", stars: 65000, topics: ["build", "bundler", "frontend"], licenseSpdx: "MIT", description: "Next Generation Frontend Tooling" },
  { owner: "biomejs", repo: "biome", language: "Rust", stars: 12000, topics: ["linter", "formatter", "toolchain"], licenseSpdx: "MIT", description: "A toolchain for web projects" },
  { owner: "shadcn-ui", repo: "ui", language: "TypeScript", stars: 60000, topics: ["ui", "components", "react"], licenseSpdx: "MIT", description: "Beautifully designed components built with Radix UI and Tailwind CSS" },
  { owner: "supabase", repo: "supabase", language: "TypeScript", stars: 67000, topics: ["database", "auth", "baas"], licenseSpdx: "Apache-2.0", description: "The open source Firebase alternative" },
  { owner: "pocketbase", repo: "pocketbase", language: "Go", stars: 35000, topics: ["database", "backend", "baas"], licenseSpdx: "MIT", description: "Open Source realtime backend in 1 file" },
  { owner: "cloudflare", repo: "workers-sdk", language: "TypeScript", stars: 2400, topics: ["edge", "serverless", "cloudflare"], licenseSpdx: "Apache-2.0", description: "Wrangler, the CLI for Cloudflare Workers" },
  { owner: "redis", repo: "redis", language: "C", stars: 65000, topics: ["database", "cache", "in-memory"], licenseSpdx: "BSD-3-Clause", description: "Redis is an in-memory database that persists on disk" },
  { owner: "turborepo", repo: "turborepo", language: "Rust", stars: 25000, topics: ["monorepo", "build", "tooling"], licenseSpdx: "MIT", description: "Incremental bundler and build system optimized for JavaScript and TypeScript" },
];

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return cronUnauthorized();
  }

  try {
    await connectDB();

    let inserted = 0;
    let skipped = 0;

    for (const seed of SEED_RESOURCES) {
      try {
        await Resource.updateOne(
          { owner: seed.owner, repo: seed.repo },
          {
            $setOnInsert: {
              provider: "github",
              owner: seed.owner,
              repo: seed.repo,
              url: `https://github.com/${seed.owner}/${seed.repo}`,
              description: seed.description,
              topics: seed.topics,
              language: seed.language,
              stars: seed.stars,
              forks: 0,
              licenseSpdx: seed.licenseSpdx,
              isTemplate: false,
              pushedAt: new Date(),
              healthScore: 70,
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
    console.error("Resource seeding failed:", error);
    return Response.json({ error: "Resource seeding failed" }, { status: 500 });
  }
}

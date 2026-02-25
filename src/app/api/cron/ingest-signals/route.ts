import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Signal from "@/models/signal";
import { verifyCronRequest, cronUnauthorized } from "@/lib/cron-auth";
import {
  fetchCloudflareChangelog,
  fetchGitHubChangelog,
  fetchRSSFeed,
  RSS_FEEDS,
} from "@/service/connectors/rss-connector";
import {
  normalizeRSSItemToSignal,
  deduplicateSignals,
  NormalizedSignal,
} from "@/service/connectors/signal-builder";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return cronUnauthorized();
  }

  try {
    await connectDB();

    const allSignals: NormalizedSignal[] = [];

    const [cfItems, ghItems, vercelItems, nodeItems, reactItems] =
      await Promise.allSettled([
        fetchCloudflareChangelog(),
        fetchGitHubChangelog(),
        fetchRSSFeed(RSS_FEEDS.vercel.blog).then((f) => f?.items ?? []),
        fetchRSSFeed(RSS_FEEDS.nodejs.blog).then((f) => f?.items ?? []),
        fetchRSSFeed(RSS_FEEDS.react.blog).then((f) => f?.items ?? []),
      ]);

    const feeds: { items: typeof cfItems; source: string }[] = [
      { items: cfItems, source: "cloudflare" },
      { items: ghItems, source: "github_changelog" },
      { items: vercelItems, source: "vercel" },
      { items: nodeItems, source: "nodejs" },
      { items: reactItems, source: "react" },
    ];

    for (const feed of feeds) {
      if (feed.items.status === "fulfilled") {
        for (const item of feed.items.value) {
          allSignals.push(normalizeRSSItemToSignal(item, feed.source));
        }
      }
    }

    const unique = deduplicateSignals(allSignals);

    let inserted = 0;
    let skipped = 0;

    for (const signal of unique) {
      try {
        await Signal.updateOne(
          { entityRef: signal.entityRef },
          { $setOnInsert: signal },
          { upsert: true }
        );
        inserted++;
      } catch {
        skipped++;
      }
    }

    return Response.json({
      ok: true,
      fetched: allSignals.length,
      unique: unique.length,
      inserted,
      skipped,
    });
  } catch (error) {
    console.error("Signal ingestion failed:", error);
    return Response.json(
      { error: "Signal ingestion failed" },
      { status: 500 }
    );
  }
}

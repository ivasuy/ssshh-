import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import ContributionOpportunity from "@/models/contribution-opportunity";
import { verifyCronRequest, cronUnauthorized } from "@/lib/cron-auth";
import {
  getGoodFirstIssues,
  getHelpWantedIssues,
} from "@/service/connectors/github-connector";

export const dynamic = "force-dynamic";

const CURATED_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
];

function difficultyFromLabels(
  labels: string[]
): "beginner" | "intermediate" | "advanced" {
  const lower = labels.map((l) => l.toLowerCase());
  if (lower.includes("good first issue") || lower.includes("beginner"))
    return "beginner";
  if (lower.includes("advanced") || lower.includes("expert"))
    return "advanced";
  return "intermediate";
}

function scoreIssue(labels: string[], stars?: number): number {
  let score = 50;
  const lower = labels.map((l) => l.toLowerCase());
  if (lower.includes("good first issue")) score += 10;
  if (lower.includes("help wanted")) score += 5;
  if (lower.includes("bounty")) score += 20;
  if (stars && stars > 1000) score += 10;
  return Math.min(100, score);
}

function extractRepo(htmlUrl: string): string {
  const match = htmlUrl.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1] : "";
}

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return cronUnauthorized();
  }

  try {
    await connectDB();

    let inserted = 0;
    let skipped = 0;

    for (const lang of CURATED_LANGUAGES) {
      const [goodFirst, helpWanted] = await Promise.allSettled([
        getGoodFirstIssues(lang, 15),
        getHelpWantedIssues(lang, 15),
      ]);

      const issues = [
        ...(goodFirst.status === "fulfilled" ? goodFirst.value : []),
        ...(helpWanted.status === "fulfilled" ? helpWanted.value : []),
      ];

      const seen = new Set<number>();

      for (const issue of issues) {
        if (seen.has(issue.id)) continue;
        seen.add(issue.id);

        const repo = extractRepo(issue.html_url);
        if (!repo) continue;

        const labels = issue.labels.map((l) => l.name);

        try {
          await ContributionOpportunity.updateOne(
            { provider: "github", repo, issueNumber: issue.number },
            {
              $setOnInsert: {
                provider: "github",
                repo,
                issueNumber: issue.number,
                title: issue.title,
                labels,
                difficulty: difficultyFromLabels(labels),
                bountyAmount: 0,
                currency: "USD",
                url: issue.html_url,
                score: scoreIssue(labels),
              },
            },
            { upsert: true }
          );
          inserted++;
        } catch {
          skipped++;
        }
      }
    }

    return Response.json({ ok: true, inserted, skipped });
  } catch (error) {
    console.error("Opportunity ingestion failed:", error);
    return Response.json(
      { error: "Opportunity ingestion failed" },
      { status: 500 }
    );
  }
}

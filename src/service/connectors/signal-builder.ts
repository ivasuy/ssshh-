import crypto from "crypto";
import { SignalType } from "@/models/signal";
import { RSSItem, parseRSSDate, extractKeywordsFromRSSItem } from "./rss-connector";
import { GitHubRelease, GitHubIssue, GitHubRepo } from "./github-connector";
import { categorizeSignal } from "../ai-service";

export interface NormalizedSignal {
  signalType: SignalType;
  source: string;
  title: string;
  summary: string;
  entityRef: string;
  score: number;
  publishedAt: Date;
  rawPayload: Record<string, unknown>;
}

function generateEntityRef(source: string, identifier: string): string {
  return `${source}:${identifier}`;
}

function computeContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").substring(0, 16);
}

export function normalizeRSSItemToSignal(
  item: RSSItem,
  source: string
): NormalizedSignal {
  const keywords = extractKeywordsFromRSSItem(item);

  let signalType: SignalType = "changelog";
  let score = 50;

  if (keywords.includes("security") || keywords.includes("critical")) {
    signalType = "vulnerability";
    score = 90;
  } else if (keywords.includes("breaking") || keywords.includes("deprecat")) {
    signalType = "changelog";
    score = 80;
  } else if (keywords.includes("release")) {
    signalType = "release";
    score = 70;
  }

  const contentHash = computeContentHash(item.link || item.title);

  return {
    signalType,
    source,
    title: item.title,
    summary: item.contentSnippet || item.content?.substring(0, 300) || "",
    entityRef: generateEntityRef(source, contentHash),
    score,
    publishedAt: parseRSSDate(item.pubDate),
    rawPayload: {
      link: item.link,
      categories: item.categories,
      creator: item.creator,
      guid: item.guid,
    },
  };
}

export function normalizeGitHubReleaseToSignal(
  release: GitHubRelease,
  repoFullName: string
): NormalizedSignal {
  let score = 70;

  if (release.prerelease) {
    score = 50;
  }

  const bodyLower = (release.body || "").toLowerCase();
  if (bodyLower.includes("breaking") || bodyLower.includes("security")) {
    score = 90;
  }

  return {
    signalType: "release",
    source: "github",
    title: `${repoFullName} ${release.tag_name}: ${release.name || "New Release"}`,
    summary: release.body?.substring(0, 500) || "",
    entityRef: generateEntityRef("github_release", `${repoFullName}:${release.tag_name}`),
    score,
    publishedAt: new Date(release.published_at),
    rawPayload: {
      repo: repoFullName,
      tagName: release.tag_name,
      htmlUrl: release.html_url,
      prerelease: release.prerelease,
    },
  };
}

export function normalizeGitHubIssueToSignal(
  issue: GitHubIssue,
  repoFullName: string,
  hasBounty = false,
  bountyAmount = 0
): NormalizedSignal {
  const labels = issue.labels.map((l) => l.name.toLowerCase());

  let signalType: SignalType = "issue";
  let score = 50;

  if (hasBounty || labels.includes("bounty")) {
    signalType = "bounty";
    score = 80 + Math.min(20, bountyAmount / 100);
  } else if (labels.includes("good first issue")) {
    score = 60;
  } else if (labels.includes("help wanted")) {
    score = 55;
  }

  return {
    signalType,
    source: "github",
    title: `[${repoFullName}] ${issue.title}`,
    summary: `Issue #${issue.number} - Labels: ${labels.join(", ")}`,
    entityRef: generateEntityRef("github_issue", `${repoFullName}#${issue.number}`),
    score,
    publishedAt: new Date(issue.created_at),
    rawPayload: {
      repo: repoFullName,
      issueNumber: issue.number,
      htmlUrl: issue.html_url,
      labels: issue.labels,
      hasBounty,
      bountyAmount,
    },
  };
}

export function normalizeNewRepoToSignal(repo: GitHubRepo): NormalizedSignal {
  let score = 40;

  if (repo.stargazers_count > 1000) score = 80;
  else if (repo.stargazers_count > 100) score = 65;
  else if (repo.stargazers_count > 10) score = 50;

  if (repo.is_template) score += 10;

  return {
    signalType: "new_repo",
    source: "github",
    title: `New repo: ${repo.full_name}`,
    summary: repo.description || "No description provided",
    entityRef: generateEntityRef("github_repo", repo.full_name),
    score: Math.min(100, score),
    publishedAt: new Date(repo.created_at),
    rawPayload: {
      owner: repo.owner.login,
      repo: repo.name,
      htmlUrl: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      topics: repo.topics,
      isTemplate: repo.is_template,
    },
  };
}

export function deduplicateSignals(signals: NormalizedSignal[]): NormalizedSignal[] {
  const seen = new Map<string, NormalizedSignal>();

  for (const signal of signals) {
    const existing = seen.get(signal.entityRef);
    if (!existing || signal.score > existing.score) {
      seen.set(signal.entityRef, signal);
    }
  }

  return Array.from(seen.values());
}

export function sortSignalsByRelevance(signals: NormalizedSignal[]): NormalizedSignal[] {
  return [...signals].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });
}

export async function enrichSignalWithAI(
  signal: NormalizedSignal
): Promise<NormalizedSignal> {
  try {
    const result = await categorizeSignal(signal.title, signal.summary);
    return {
      ...signal,
      score: Math.round((signal.score + result.score) / 2),
    };
  } catch (error) {
    console.error("Error enriching signal with AI:", error);
    return signal;
  }
}

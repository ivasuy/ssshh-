import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["category", "categories", { keepArray: true }],
      ["dc:creator", "creator"],
    ],
  },
});

export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet?: string;
  categories?: string[];
  creator?: string;
  guid?: string;
}

export interface RSSFeed {
  title: string;
  description?: string;
  link?: string;
  items: RSSItem[];
}

export async function fetchRSSFeed(url: string): Promise<RSSFeed | null> {
  try {
    const feed = await parser.parseURL(url);

    return {
      title: feed.title || "",
      description: feed.description,
      link: feed.link,
      items: feed.items.map((item) => ({
        title: item.title || "",
        link: item.link || "",
        pubDate: item.pubDate || item.isoDate || "",
        content: item.content || (item as unknown as Record<string, string>)["content:encoded"] || "",
        contentSnippet: item.contentSnippet,
        categories: (item as unknown as { categories?: string[] }).categories,
        creator: (item as unknown as { creator?: string }).creator,
        guid: item.guid,
      })),
    };
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error);
    return null;
  }
}

export const RSS_FEEDS = {
  cloudflare: {
    blog: "https://blog.cloudflare.com/rss/",
    changelog: "https://developers.cloudflare.com/changelog/index.xml",
  },
  github: {
    changelog: "https://github.blog/changelog/feed/",
    blog: "https://github.blog/feed/",
  },
  vercel: {
    blog: "https://vercel.com/atom",
  },
  nodejs: {
    blog: "https://nodejs.org/en/feed/blog.xml",
  },
  react: {
    blog: "https://react.dev/rss.xml",
  },
};

export async function fetchCloudflareChangelog(): Promise<RSSItem[]> {
  const feed = await fetchRSSFeed(RSS_FEEDS.cloudflare.changelog);
  return feed?.items || [];
}

export async function fetchGitHubChangelog(): Promise<RSSItem[]> {
  const feed = await fetchRSSFeed(RSS_FEEDS.github.changelog);
  return feed?.items || [];
}

export async function fetchMultipleFeeds(
  urls: string[]
): Promise<Map<string, RSSItem[]>> {
  const results = new Map<string, RSSItem[]>();

  await Promise.all(
    urls.map(async (url) => {
      const feed = await fetchRSSFeed(url);
      if (feed) {
        results.set(url, feed.items);
      }
    })
  );

  return results;
}

export function parseRSSDate(dateString: string): Date {
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function extractKeywordsFromRSSItem(item: RSSItem): string[] {
  const keywords: Set<string> = new Set();

  if (item.categories) {
    item.categories.forEach((cat) => keywords.add(cat.toLowerCase()));
  }

  const breakingTerms = ["breaking", "deprecat", "security", "critical", "urgent"];
  const content = `${item.title} ${item.contentSnippet || ""}`.toLowerCase();

  breakingTerms.forEach((term) => {
    if (content.includes(term)) {
      keywords.add(term);
    }
  });

  return Array.from(keywords);
}

import axios from "axios";

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string };
  html_url: string;
  description: string | null;
  topics: string[];
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  license: { spdx_id: string } | null;
  is_template: boolean;
  pushed_at: string;
  created_at: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  labels: { name: string }[];
  state: string;
  created_at: string;
}

export async function searchRepositories(
  query: string,
  options: {
    sort?: "stars" | "forks" | "updated";
    order?: "asc" | "desc";
    perPage?: number;
    page?: number;
  } = {}
): Promise<{ items: GitHubRepo[]; total_count: number }> {
  const { sort = "stars", order = "desc", perPage = 30, page = 1 } = options;

  try {
    const response = await axios.get(`${GITHUB_API_BASE}/search/repositories`, {
      headers: getHeaders(),
      params: {
        q: query,
        sort,
        order,
        per_page: perPage,
        page,
      },
    });

    return {
      items: response.data.items,
      total_count: response.data.total_count,
    };
  } catch (error) {
    console.error("Error searching GitHub repositories:", error);
    return { items: [], total_count: 0 };
  }
}

export async function getRepository(
  owner: string,
  repo: string
): Promise<GitHubRepo | null> {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching repo ${owner}/${repo}:`, error);
    return null;
  }
}

export async function getRepositoryReleases(
  owner: string,
  repo: string,
  perPage = 10
): Promise<GitHubRelease[]> {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases`,
      {
        headers: getHeaders(),
        params: { per_page: perPage },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching releases for ${owner}/${repo}:`, error);
    return [];
  }
}

export async function getRepositoryReadme(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
      {
        headers: {
          ...getHeaders(),
          Accept: "application/vnd.github.raw+json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching README for ${owner}/${repo}:`, error);
    return null;
  }
}

export async function getRepositoryLicense(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/license`,
      { headers: getHeaders() }
    );
    return response.data?.license?.spdx_id || null;
  } catch {
    return null;
  }
}

export async function searchIssues(
  query: string,
  options: {
    labels?: string[];
    sort?: "created" | "updated" | "comments";
    order?: "asc" | "desc";
    perPage?: number;
    page?: number;
  } = {}
): Promise<{ items: GitHubIssue[]; total_count: number }> {
  const { labels, sort = "created", order = "desc", perPage = 30, page = 1 } = options;

  let fullQuery = query;
  if (labels && labels.length > 0) {
    fullQuery += " " + labels.map((l) => `label:"${l}"`).join(" ");
  }

  try {
    const response = await axios.get(`${GITHUB_API_BASE}/search/issues`, {
      headers: getHeaders(),
      params: {
        q: fullQuery,
        sort,
        order,
        per_page: perPage,
        page,
      },
    });

    return {
      items: response.data.items,
      total_count: response.data.total_count,
    };
  } catch (error) {
    console.error("Error searching GitHub issues:", error);
    return { items: [], total_count: 0 };
  }
}

export async function getGoodFirstIssues(
  language?: string,
  perPage = 30
): Promise<GitHubIssue[]> {
  const languageFilter = language ? `language:${language}` : "";
  const query = `is:issue is:open label:"good first issue" ${languageFilter}`;

  const result = await searchIssues(query, {
    sort: "created",
    order: "desc",
    perPage,
  });

  return result.items;
}

export async function getHelpWantedIssues(
  language?: string,
  perPage = 30
): Promise<GitHubIssue[]> {
  const languageFilter = language ? `language:${language}` : "";
  const query = `is:issue is:open label:"help wanted" ${languageFilter}`;

  const result = await searchIssues(query, {
    sort: "created",
    order: "desc",
    perPage,
  });

  return result.items;
}

export async function discoverTemplateRepos(
  topic: string,
  minStars = 100
): Promise<GitHubRepo[]> {
  const query = `topic:${topic} is:template stars:>=${minStars}`;

  const result = await searchRepositories(query, {
    sort: "stars",
    order: "desc",
    perPage: 30,
  });

  return result.items;
}

export async function discoverTrendingRepos(
  language?: string,
  createdAfter?: Date
): Promise<GitHubRepo[]> {
  const dateFilter = createdAfter
    ? `created:>=${createdAfter.toISOString().split("T")[0]}`
    : `created:>=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}`;

  const languageFilter = language ? `language:${language}` : "";
  const query = `${dateFilter} ${languageFilter} stars:>=10`;

  const result = await searchRepositories(query, {
    sort: "stars",
    order: "desc",
    perPage: 50,
  });

  return result.items;
}

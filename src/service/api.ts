import axios from "axios";
import {
  PostType,
  ResourceType,
  SignalType,
  TechCardType,
  ContributionOpportunityType,
  CollectionType,
  PaginatedResponse,
  ResourceFilters,
  SignalFilters,
  OpportunityFilters,
  CardFilters,
} from "@/types/types";

const API_BASE = "/api";

async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const { auth } = await import("@/lib/firebase");
  if (!auth) return null;

  const user = auth.currentUser;
  if (!user) return null;

  return user.getIdToken();
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Media upload to Cloudinary
export const uploadToCloudinary = async (mediaFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", mediaFile);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );
    formData.append(
      "cloud_name",
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
    );
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Cloudinary Error Response:", errorResponse);
      throw new Error("Failed to upload media to Cloudinary");
    }

    const cloudinaryData = await response.json();
    return cloudinaryData.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

// Posts API
export async function fetchPosts(
  options: {
    page?: number;
    limit?: number;
    postType?: string;
    tag?: string;
  } = {}
): Promise<PaginatedResponse<PostType>> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", options.page.toString());
  if (options.limit) params.set("limit", options.limit.toString());
  if (options.postType) params.set("postType", options.postType);
  if (options.tag) params.set("tag", options.tag);

  const response = await axios.get(`${API_BASE}/posts?${params.toString()}`);
  return response.data;
}

export async function fetchPostById(id: string): Promise<PostType | null> {
  try {
    const response = await axios.get(`${API_BASE}/posts/${id}`);
    return response.data.post;
  } catch {
    return null;
  }
}

export async function createPost(data: {
  title: string;
  content: string;
  postType?: string;
  tags?: string[];
  imageUrl?: string;
}): Promise<PostType> {
  const headers = await authHeaders();
  const response = await axios.post(`${API_BASE}/posts`, data, { headers });
  return response.data.post;
}

export async function updatePost(
  id: string,
  data: { title?: string; content?: string; tags?: string[] }
): Promise<PostType> {
  const headers = await authHeaders();
  const response = await axios.patch(`${API_BASE}/posts/${id}`, data, { headers });
  return response.data.post;
}

export async function deletePost(id: string): Promise<void> {
  const headers = await authHeaders();
  await axios.delete(`${API_BASE}/posts/${id}`, { headers });
}

export async function addReaction(
  postId: string,
  reaction: "✅" | "🔥" | "🔖" | "⚠️" | "💀"
): Promise<Record<string, string[]>> {
  const headers = await authHeaders();
  const response = await axios.post(
    `${API_BASE}/posts/${postId}/react`,
    { reaction },
    { headers }
  );
  return response.data.reactions;
}

export async function addComment(
  postId: string,
  comment: string
): Promise<void> {
  const headers = await authHeaders();
  await axios.post(`${API_BASE}/posts/${postId}/comment`, { comment }, { headers });
}

// Resources API
export async function fetchResources(
  filters: ResourceFilters = {},
  pagination: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ResourceType>> {
  const params = new URLSearchParams();
  if (pagination.page) params.set("page", pagination.page.toString());
  if (pagination.limit) params.set("limit", pagination.limit.toString());
  if (filters.language) params.set("language", filters.language);
  if (filters.topic) params.set("topic", filters.topic);
  if (filters.license) params.set("license", filters.license);
  if (filters.isTemplate !== undefined)
    params.set("isTemplate", filters.isTemplate.toString());
  if (filters.minStars) params.set("minStars", filters.minStars.toString());
  if (filters.search) params.set("search", filters.search);

  const response = await axios.get(`${API_BASE}/resources?${params.toString()}`);
  return response.data;
}

export async function fetchResourceById(id: string): Promise<{
  resource: ResourceType;
  snapshots: unknown[];
  relatedPosts: PostType[];
} | null> {
  try {
    const response = await axios.get(`${API_BASE}/resources/${id}`);
    return response.data;
  } catch {
    return null;
  }
}

// Signals API
export async function fetchSignals(
  filters: SignalFilters = {},
  pagination: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<SignalType>> {
  const params = new URLSearchParams();
  if (pagination.page) params.set("page", pagination.page.toString());
  if (pagination.limit) params.set("limit", pagination.limit.toString());
  if (filters.signalType) params.set("signalType", filters.signalType);
  if (filters.source) params.set("source", filters.source);
  if (filters.minScore) params.set("minScore", filters.minScore.toString());
  if (filters.fromDate) params.set("fromDate", filters.fromDate.toISOString());
  if (filters.toDate) params.set("toDate", filters.toDate.toISOString());

  const response = await axios.get(`${API_BASE}/signals?${params.toString()}`);
  return response.data;
}

// Tech Cards API
export async function fetchCards(
  filters: CardFilters = {},
  pagination: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<TechCardType>> {
  const params = new URLSearchParams();
  if (pagination.page) params.set("page", pagination.page.toString());
  if (pagination.limit) params.set("limit", pagination.limit.toString());
  if (filters.domain) params.set("domain", filters.domain);
  if (filters.search) params.set("search", filters.search);

  const response = await axios.get(`${API_BASE}/cards?${params.toString()}`);
  return response.data;
}

export async function fetchCardBySlug(slug: string): Promise<{
  card: TechCardType;
  relatedPosts: PostType[];
} | null> {
  try {
    const response = await axios.get(`${API_BASE}/cards/${slug}`);
    return response.data;
  } catch {
    return null;
  }
}

export async function generateCard(
  term: string,
  domain?: string
): Promise<TechCardType> {
  const headers = await authHeaders();
  const response = await axios.post(
    `${API_BASE}/ai/generate-card`,
    { term, domain },
    { headers }
  );
  return response.data.card;
}

// Opportunities API
export async function fetchOpportunities(
  filters: OpportunityFilters = {},
  pagination: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ContributionOpportunityType>> {
  const params = new URLSearchParams();
  if (pagination.page) params.set("page", pagination.page.toString());
  if (pagination.limit) params.set("limit", pagination.limit.toString());
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.labels) params.set("labels", filters.labels.join(","));
  if (filters.hasBounty !== undefined)
    params.set("hasBounty", filters.hasBounty.toString());
  if (filters.minScore) params.set("minScore", filters.minScore.toString());

  const response = await axios.get(`${API_BASE}/opportunities?${params.toString()}`);
  return response.data;
}

// Collections API
export async function fetchCollections(): Promise<CollectionType[]> {
  const headers = await authHeaders();
  const response = await axios.get(`${API_BASE}/collections`, { headers });
  return response.data.collections;
}

export async function createCollection(
  name: string,
  description?: string
): Promise<CollectionType> {
  const headers = await authHeaders();
  const response = await axios.post(
    `${API_BASE}/collections`,
    { name, description },
    { headers }
  );
  return response.data.collection;
}

export async function fetchCollectionById(id: string): Promise<CollectionType | null> {
  try {
    const headers = await authHeaders();
    const response = await axios.get(`${API_BASE}/collections/${id}`, { headers });
    return response.data.collection;
  } catch {
    return null;
  }
}

export async function updateCollection(
  id: string,
  data: { name?: string; description?: string }
): Promise<CollectionType> {
  const headers = await authHeaders();
  const response = await axios.patch(`${API_BASE}/collections/${id}`, data, { headers });
  return response.data.collection;
}

export async function deleteCollection(id: string): Promise<void> {
  const headers = await authHeaders();
  await axios.delete(`${API_BASE}/collections/${id}`, { headers });
}

export async function addToCollection(
  collectionId: string,
  entityType: "resource" | "card",
  entityId: string
): Promise<CollectionType> {
  const headers = await authHeaders();
  const response = await axios.post(
    `${API_BASE}/collections/${collectionId}/items`,
    { entityType, entityId },
    { headers }
  );
  return response.data.collection;
}

export async function removeFromCollection(
  collectionId: string,
  entityId: string
): Promise<CollectionType> {
  const headers = await authHeaders();
  const response = await axios.delete(`${API_BASE}/collections/${collectionId}/items`, {
    headers,
    data: { entityId },
  });
  return response.data.collection;
}

// User API
export async function getCurrentUser(): Promise<unknown> {
  const headers = await authHeaders();
  const response = await axios.get(`${API_BASE}/auth/me`, { headers });
  return response.data.user;
}

export async function updateUserProfile(data: {
  displayName?: string;
  stacks?: string[];
}): Promise<unknown> {
  const headers = await authHeaders();
  const response = await axios.patch(`${API_BASE}/auth/me`, data, { headers });
  return response.data.user;
}

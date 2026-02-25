// User types
export interface UserType {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoUrl: string;
  stacks: string[];
  credit: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Post/Lounge types
export type PostTypeEnum = "NOTE" | "INSIGHT" | "HOT_TAKE";

export interface CommentType {
  userId: string;
  username: string;
  comment: string;
  createdAt: Date;
}

export interface ReactionType {
  "✅": string[];
  "🔥": string[];
  "🔖": string[];
  "⚠️": string[];
  "💀": string[];
}

export interface PostType {
  _id: string;
  userId: string;
  title: string;
  content: string;
  postType: PostTypeEnum;
  tags: string[];
  imageUrl: string;
  reactions: ReactionType;
  comments: CommentType[];
  createdAt: Date;
  updatedAt?: Date;
}

// Resource/Library types
export interface ResourceType {
  _id: string;
  provider: string;
  owner: string;
  repo: string;
  url: string;
  description: string;
  topics: string[];
  language: string;
  stars: number;
  forks: number;
  licenseSpdx: string;
  isTemplate: boolean;
  pushedAt: Date;
  healthScore: number;
  createdAt: Date;
  updatedAt?: Date;
}

export type SnapshotTypeEnum = "readme" | "releases" | "metrics" | "issues" | "license";

export interface ResourceSnapshotType {
  _id: string;
  resourceId: string;
  snapshotType: SnapshotTypeEnum;
  contentHash: string;
  content: string;
  fetchedAt: Date;
}

// Signal/Radar types
export type SignalTypeEnum =
  | "release"
  | "vulnerability"
  | "changelog"
  | "issue"
  | "bounty"
  | "new_repo";

export interface SignalType {
  _id: string;
  signalType: SignalTypeEnum;
  source: string;
  title: string;
  summary: string;
  entityRef: string;
  score: number;
  publishedAt: Date;
  rawPayload: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date;
}

// Tech Card types
export interface InterviewQAType {
  question: string;
  answer: string;
}

export interface TechCardType {
  _id: string;
  term: string;
  slug: string;
  domain: string;
  shortDefinition: string;
  useCases: string[];
  whereUsed: string[];
  interviewQAs: InterviewQAType[];
  refs: string[];
  qualityScore: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Collection types
export type CollectionItemTypeEnum = "resource" | "card";

export interface CollectionItemType {
  entityType: CollectionItemTypeEnum;
  entityId: string;
}

export interface CollectionType {
  _id: string;
  userId: string;
  name: string;
  description: string;
  items: CollectionItemType[];
  createdAt: Date;
  updatedAt?: Date;
}

// Contribution Opportunity types
export type DifficultyLevelEnum = "beginner" | "intermediate" | "advanced";

export interface ContributionOpportunityType {
  _id: string;
  provider: string;
  repo: string;
  issueNumber: number;
  title: string;
  labels: string[];
  difficulty: DifficultyLevelEnum;
  bountyAmount: number;
  currency: string;
  url: string;
  score: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Post Link types
export type LinkEntityTypeEnum = "resource" | "card" | "signal";

export interface PostLinkType {
  _id: string;
  postId: string;
  entityType: LinkEntityTypeEnum;
  entityId: string;
  createdAt: Date;
}

// Tag types
export interface TagType {
  _id: string;
  name: string;
  slug: string;
  category: string;
  usageCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter types for various modules
export interface ResourceFilters {
  language?: string;
  topic?: string;
  license?: string;
  isTemplate?: boolean;
  minStars?: number;
  search?: string;
}

export interface SignalFilters {
  signalType?: SignalTypeEnum;
  source?: string;
  minScore?: number;
  fromDate?: Date;
  toDate?: Date;
}

export interface OpportunityFilters {
  difficulty?: DifficultyLevelEnum;
  labels?: string[];
  hasBounty?: boolean;
  minScore?: number;
}

export interface CardFilters {
  domain?: string;
  search?: string;
}

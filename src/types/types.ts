export type GossipType = {
  id: string;
  title: string;
  content: string;
  isSensitive: boolean;
  visibility: string;
  imageUrl: string;
  createdAt: Date;
  expireAt: Date;
  paymentId: string;
  userId: string;
  username: string;
  location: { city: string; state: string; country: string };
  reactions: ReactionType;
  comments: CommentType[];
};

export type UserType = {
  username: string;
  ip: string;
  location: { city: string; state: string; country: string };
  credit: number;
  blackCard: boolean;
  gossips: GossipType[];
};

export type ReactionType = {
  "😂": string[];
  "🔥": string[];
  "🤯": string[];
  "💦": string[];
};

export type CommentType = {
  userId: string;
  username: string;
  comment: string;
  createdAt: Date;
};

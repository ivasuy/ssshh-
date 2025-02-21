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
  reactions: {
    "😂": string[];
    "🔥": string[];
    "🤯": string[];
    "💦": string[];
  };
  comments: {
    userId: string;
    username: string;
    comment: string;
    createdAt: Date;
  }[];
};

export type UserType = {
  username: string;
  ip: string;
  location: { city: string; state: string; country: string };
  credit: number;
  blackCard: boolean;
  gossips: GossipType[];
};

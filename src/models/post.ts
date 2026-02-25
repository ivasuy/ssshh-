import mongoose, { Schema, Document, Model } from "mongoose";

export type PostType = "NOTE" | "INSIGHT" | "HOT_TAKE";

export interface IComment {
  userId: mongoose.Types.ObjectId;
  username: string;
  comment: string;
  createdAt: Date;
}

export interface IReactions {
  "✅": string[];
  "🔥": string[];
  "🔖": string[];
  "⚠️": string[];
  "💀": string[];
}

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  postType: PostType;
  tags: string[];
  imageUrl: string;
  reactions: IReactions;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    postType: {
      type: String,
      enum: ["NOTE", "INSIGHT", "HOT_TAKE"],
      default: "NOTE",
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    reactions: {
      type: {
        "✅": [String],
        "🔥": [String],
        "🔖": [String],
        "⚠️": [String],
        "💀": [String],
      },
      default: {
        "✅": [],
        "🔥": [],
        "🔖": [],
        "⚠️": [],
        "💀": [],
      },
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ postType: 1, createdAt: -1 });

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;

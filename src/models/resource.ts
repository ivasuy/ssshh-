import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResource extends Document {
  _id: mongoose.Types.ObjectId;
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
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    provider: {
      type: String,
      required: true,
      default: "github",
    },
    owner: {
      type: String,
      required: true,
      index: true,
    },
    repo: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    topics: {
      type: [String],
      default: [],
      index: true,
    },
    language: {
      type: String,
      default: "",
      index: true,
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    licenseSpdx: {
      type: String,
      default: "",
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    pushedAt: {
      type: Date,
    },
    healthScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

ResourceSchema.index({ owner: 1, repo: 1 }, { unique: true });
ResourceSchema.index({ stars: -1 });
ResourceSchema.index({ healthScore: -1 });

const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema);

export default Resource;

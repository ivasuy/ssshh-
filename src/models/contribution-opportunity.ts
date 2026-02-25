import mongoose, { Schema, Document, Model } from "mongoose";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface IContributionOpportunity extends Document {
  _id: mongoose.Types.ObjectId;
  provider: string;
  repo: string;
  issueNumber: number;
  title: string;
  labels: string[];
  difficulty: DifficultyLevel;
  bountyAmount: number;
  currency: string;
  url: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContributionOpportunitySchema = new Schema<IContributionOpportunity>(
  {
    provider: {
      type: String,
      required: true,
      default: "github",
      index: true,
    },
    repo: {
      type: String,
      required: true,
      index: true,
    },
    issueNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    labels: {
      type: [String],
      default: [],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    bountyAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    url: {
      type: String,
      required: true,
    },
    score: {
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

ContributionOpportunitySchema.index(
  { provider: 1, repo: 1, issueNumber: 1 },
  { unique: true }
);
ContributionOpportunitySchema.index({ score: -1 });
ContributionOpportunitySchema.index({ difficulty: 1 });

const ContributionOpportunity: Model<IContributionOpportunity> =
  mongoose.models.ContributionOpportunity ||
  mongoose.model<IContributionOpportunity>(
    "ContributionOpportunity",
    ContributionOpportunitySchema
  );

export default ContributionOpportunity;

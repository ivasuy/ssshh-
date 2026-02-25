import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterviewQA {
  question: string;
  answer: string;
}

export interface ITechCard extends Document {
  _id: mongoose.Types.ObjectId;
  term: string;
  slug: string;
  domain: string;
  shortDefinition: string;
  useCases: string[];
  whereUsed: string[];
  interviewQAs: IInterviewQA[];
  refs: string[];
  qualityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewQASchema = new Schema<IInterviewQA>(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const TechCardSchema = new Schema<ITechCard>(
  {
    term: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    domain: {
      type: String,
      default: "general",
      index: true,
    },
    shortDefinition: {
      type: String,
      required: true,
    },
    useCases: {
      type: [String],
      default: [],
    },
    whereUsed: {
      type: [String],
      default: [],
    },
    interviewQAs: {
      type: [InterviewQASchema],
      default: [],
    },
    refs: {
      type: [String],
      default: [],
    },
    qualityScore: {
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

TechCardSchema.index({ term: "text", shortDefinition: "text" });

const TechCard: Model<ITechCard> =
  mongoose.models.TechCard || mongoose.model<ITechCard>("TechCard", TechCardSchema);

export default TechCard;

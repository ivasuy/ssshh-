import mongoose, { Schema, Document, Model } from "mongoose";

export type SignalType =
  | "release"
  | "vulnerability"
  | "changelog"
  | "issue"
  | "bounty"
  | "new_repo";

export interface ISignal extends Document {
  _id: mongoose.Types.ObjectId;
  signalType: SignalType;
  source: string;
  title: string;
  summary: string;
  entityRef: string;
  score: number;
  publishedAt: Date;
  rawPayload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const SignalSchema = new Schema<ISignal>(
  {
    signalType: {
      type: String,
      enum: ["release", "vulnerability", "changelog", "issue", "bounty", "new_repo"],
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: "",
    },
    entityRef: {
      type: String,
      default: "",
      index: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    publishedAt: {
      type: Date,
      required: true,
      index: true,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

SignalSchema.index({ signalType: 1, publishedAt: -1 });
SignalSchema.index({ source: 1, entityRef: 1 }, { unique: true });

const Signal: Model<ISignal> =
  mongoose.models.Signal || mongoose.model<ISignal>("Signal", SignalSchema);

export default Signal;

import mongoose, { Schema, Document, Model } from "mongoose";

export type SnapshotType = "readme" | "releases" | "metrics" | "issues" | "license";

export interface IResourceSnapshot extends Document {
  _id: mongoose.Types.ObjectId;
  resourceId: mongoose.Types.ObjectId;
  snapshotType: SnapshotType;
  contentHash: string;
  content: string;
  fetchedAt: Date;
}

const ResourceSnapshotSchema = new Schema<IResourceSnapshot>({
  resourceId: {
    type: Schema.Types.ObjectId,
    ref: "Resource",
    required: true,
    index: true,
  },
  snapshotType: {
    type: String,
    enum: ["readme", "releases", "metrics", "issues", "license"],
    required: true,
  },
  contentHash: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
});

ResourceSnapshotSchema.index({ resourceId: 1, snapshotType: 1 });
ResourceSnapshotSchema.index({ fetchedAt: -1 });

const ResourceSnapshot: Model<IResourceSnapshot> =
  mongoose.models.ResourceSnapshot ||
  mongoose.model<IResourceSnapshot>("ResourceSnapshot", ResourceSnapshotSchema);

export default ResourceSnapshot;

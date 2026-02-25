import mongoose, { Schema, Document, Model } from "mongoose";

export type LinkEntityType = "resource" | "card" | "signal";

export interface IPostLink extends Document {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  entityType: LinkEntityType;
  entityId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PostLinkSchema = new Schema<IPostLink>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,
  },
  entityType: {
    type: String,
    enum: ["resource", "card", "signal"],
    required: true,
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "entityType",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PostLinkSchema.index({ postId: 1, entityType: 1, entityId: 1 }, { unique: true });
PostLinkSchema.index({ entityType: 1, entityId: 1 });

const PostLink: Model<IPostLink> =
  mongoose.models.PostLink || mongoose.model<IPostLink>("PostLink", PostLinkSchema);

export default PostLink;

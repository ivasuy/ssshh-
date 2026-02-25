import mongoose, { Schema, Document, Model } from "mongoose";

export type CollectionItemType = "resource" | "card";

export interface ICollectionItem {
  entityType: CollectionItemType;
  entityId: mongoose.Types.ObjectId;
}

export interface ICollection extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  items: ICollectionItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CollectionItemSchema = new Schema<ICollectionItem>(
  {
    entityType: {
      type: String,
      enum: ["resource", "card"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "items.entityType",
    },
  },
  { _id: false }
);

const CollectionSchema = new Schema<ICollection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    items: {
      type: [CollectionItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

CollectionSchema.index({ userId: 1, name: 1 }, { unique: true });

const Collection: Model<ICollection> =
  mongoose.models.Collection ||
  mongoose.model<ICollection>("Collection", CollectionSchema);

export default Collection;

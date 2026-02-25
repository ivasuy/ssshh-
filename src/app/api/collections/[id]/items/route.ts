import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { Collection, User } from "@/models";
import {
  authenticateRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth-middleware";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    await connectDB();

    const user = await User.findOne({ firebaseUid: auth.user.uid });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const collection = await Collection.findById(id);

    if (!collection) {
      return Response.json({ error: "Collection not found" }, { status: 404 });
    }

    if (collection.userId.toString() !== user._id.toString()) {
      return forbiddenResponse("You can only modify your own collections");
    }

    const body = await request.json();
    const { entityType, entityId } = body;

    if (!entityType || !entityId) {
      return Response.json(
        { error: "entityType and entityId are required" },
        { status: 400 }
      );
    }

    if (!["resource", "card"].includes(entityType)) {
      return Response.json({ error: "Invalid entityType" }, { status: 400 });
    }

    const itemExists = collection.items.some(
      (item) =>
        item.entityType === entityType &&
        item.entityId.toString() === entityId
    );

    if (itemExists) {
      return Response.json(
        { error: "Item already exists in collection" },
        { status: 400 }
      );
    }

    collection.items.push({
      entityType,
      entityId: new mongoose.Types.ObjectId(entityId),
    });

    await collection.save();

    return Response.json({ collection });
  } catch (error) {
    console.error("Error adding item to collection:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    await connectDB();

    const user = await User.findOne({ firebaseUid: auth.user.uid });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const collection = await Collection.findById(id);

    if (!collection) {
      return Response.json({ error: "Collection not found" }, { status: 404 });
    }

    if (collection.userId.toString() !== user._id.toString()) {
      return forbiddenResponse("You can only modify your own collections");
    }

    const body = await request.json();
    const { entityId } = body;

    if (!entityId) {
      return Response.json({ error: "entityId is required" }, { status: 400 });
    }

    collection.items = collection.items.filter(
      (item) => item.entityId.toString() !== entityId
    );

    await collection.save();

    return Response.json({ collection });
  } catch (error) {
    console.error("Error removing item from collection:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

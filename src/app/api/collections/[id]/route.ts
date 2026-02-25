import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { Collection, User, Resource, TechCard } from "@/models";
import {
  authenticateRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth-middleware";

export async function GET(
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
      return forbiddenResponse("You can only view your own collections");
    }

    const populatedItems = await Promise.all(
      collection.items.map(async (item) => {
        if (item.entityType === "resource") {
          const resource = await Resource.findById(item.entityId);
          return { entityType: item.entityType, entityId: item.entityId, entity: resource };
        } else if (item.entityType === "card") {
          const card = await TechCard.findById(item.entityId);
          return { entityType: item.entityType, entityId: item.entityId, entity: card };
        }
        return { entityType: item.entityType, entityId: item.entityId };
      })
    );

    return Response.json({
      collection: {
        ...collection.toObject(),
        items: populatedItems,
      },
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
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
      return forbiddenResponse("You can only edit your own collections");
    }

    const body = await request.json();
    const { name, description } = body;

    if (name) collection.name = name.substring(0, 100);
    if (description !== undefined)
      collection.description = description.substring(0, 500);

    await collection.save();

    return Response.json({ collection });
  } catch (error) {
    console.error("Error updating collection:", error);
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
      return forbiddenResponse("You can only delete your own collections");
    }

    await collection.deleteOne();

    return Response.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

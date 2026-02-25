import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { Collection, User } from "@/models";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
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

    const collections = await Collection.find({ userId: user._id }).sort({
      updatedAt: -1,
    });

    return Response.json({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const existingCollection = await Collection.findOne({
      userId: user._id,
      name,
    });

    if (existingCollection) {
      return Response.json(
        { error: "Collection with this name already exists" },
        { status: 400 }
      );
    }

    const collection = await Collection.create({
      userId: user._id,
      name: name.substring(0, 100),
      description: (description || "").substring(0, 500),
      items: [],
    });

    return Response.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

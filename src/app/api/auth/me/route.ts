import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models";
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

    return Response.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
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

    const body = await request.json();
    const { email, displayName, photoUrl } = body;

    let user = await User.findOne({ firebaseUid: auth.user.uid });

    if (user) {
      user.email = email || user.email;
      user.displayName = displayName || user.displayName;
      user.photoUrl = photoUrl || user.photoUrl;
      await user.save();
    } else {
      user = await User.create({
        firebaseUid: auth.user.uid,
        email: email || auth.user.email,
        displayName: displayName || email?.split("@")[0] || "Anonymous",
        photoUrl: photoUrl || "",
        stacks: [],
        credit: 0,
      });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    await connectDB();

    const body = await request.json();
    const { displayName, stacks } = body;

    const user = await User.findOneAndUpdate(
      { firebaseUid: auth.user.uid },
      {
        ...(displayName && { displayName }),
        ...(stacks && { stacks }),
      },
      { new: true }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

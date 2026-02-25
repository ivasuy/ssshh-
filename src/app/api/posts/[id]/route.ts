import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { Post, User } from "@/models";
import {
  authenticateRequest,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const post = await Post.findById(id).populate(
      "userId",
      "displayName photoUrl"
    );

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    return Response.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
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
    const post = await Post.findById(id);

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return forbiddenResponse("You can only edit your own posts");
    }

    const body = await request.json();
    const { title, content, tags } = body;

    if (title) post.title = title.substring(0, 100);
    if (content) post.content = content.substring(0, 1000);
    if (tags) post.tags = tags;

    await post.save();

    return Response.json({ post });
  } catch (error) {
    console.error("Error updating post:", error);
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
    const post = await Post.findById(id);

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return forbiddenResponse("You can only delete your own posts");
    }

    await post.deleteOne();

    return Response.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

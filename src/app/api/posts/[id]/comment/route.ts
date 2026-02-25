import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { Post, User } from "@/models";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";

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

    const body = await request.json();
    const { comment } = body;

    if (!comment || !comment.trim()) {
      return Response.json({ error: "Comment is required" }, { status: 400 });
    }

    const { id } = await params;
    const post = await Post.findById(id);

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const hasCommented = post.comments.some(
      (c) => c.userId.toString() === user._id.toString()
    );

    if (hasCommented) {
      return Response.json(
        { error: "You can only comment once per post" },
        { status: 400 }
      );
    }

    post.comments.push({
      userId: user._id,
      username: user.displayName,
      comment: comment.substring(0, 500),
      createdAt: new Date(),
    });

    await post.save();

    user.credit += 0.5;
    await user.save();

    return Response.json({ comments: post.comments });
  } catch (error) {
    console.error("Error adding comment:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

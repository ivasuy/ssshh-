import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { Post, User } from "@/models";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";

type ReactionEmoji = "✅" | "🔥" | "🔖" | "⚠️" | "💀";

const VALID_REACTIONS: ReactionEmoji[] = ["✅", "🔥", "🔖", "⚠️", "💀"];

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
    const { reaction } = body as { reaction: ReactionEmoji };

    if (!VALID_REACTIONS.includes(reaction)) {
      return Response.json({ error: "Invalid reaction" }, { status: 400 });
    }

    const { id } = await params;
    const post = await Post.findById(id);

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const userId = user._id.toString();
    let alreadyReacted = false;

    for (const emoji of VALID_REACTIONS) {
      const index = post.reactions[emoji].indexOf(userId);
      if (index > -1) {
        post.reactions[emoji].splice(index, 1);
        alreadyReacted = true;
      }
    }

    post.reactions[reaction].push(userId);
    await post.save();

    if (!alreadyReacted) {
      user.credit += 0.1;
      await user.save();
    }

    return Response.json({ reactions: post.reactions });
  } catch (error) {
    console.error("Error updating reaction:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

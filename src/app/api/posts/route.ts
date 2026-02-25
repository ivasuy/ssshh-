import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { Post, User } from "@/models";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const postType = searchParams.get("postType");
    const tag = searchParams.get("tag");

    const query: Record<string, unknown> = {};
    if (postType) query.postType = postType;
    if (tag) query.tags = tag;

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "displayName photoUrl"),
      Post.countDocuments(query),
    ]);

    return Response.json({
      items: posts,
      total,
      page,
      limit,
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
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
    const { title, content, postType, tags, imageUrl } = body;

    if (!title || !content) {
      return Response.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const post = await Post.create({
      userId: user._id,
      title: title.substring(0, 100),
      content: content.substring(0, 1000),
      postType: postType || "NOTE",
      tags: tags || [],
      imageUrl: imageUrl || "",
      reactions: { "✅": [], "🔥": [], "🔖": [], "⚠️": [], "💀": [] },
      comments: [],
    });

    user.credit += 5;
    await user.save();

    return Response.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

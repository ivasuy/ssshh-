import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { TechCard, PostLink } from "@/models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    const card = await TechCard.findOne({ slug });

    if (!card) {
      return Response.json({ error: "Tech card not found" }, { status: 404 });
    }

    const linkedPosts = await PostLink.find({
      entityType: "card",
      entityId: card._id,
    })
      .populate({
        path: "postId",
        populate: { path: "userId", select: "displayName photoUrl" },
      })
      .limit(10);

    const posts = linkedPosts
      .map((link) => link.postId)
      .filter((post) => post !== null);

    return Response.json({
      card,
      relatedPosts: posts,
    });
  } catch (error) {
    console.error("Error fetching tech card:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

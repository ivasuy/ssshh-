import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { Resource, ResourceSnapshot, PostLink } from "@/models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return Response.json({ error: "Resource not found" }, { status: 404 });
    }

    const [snapshots, linkedPosts] = await Promise.all([
      ResourceSnapshot.find({ resourceId: id })
        .sort({ fetchedAt: -1 })
        .limit(5),
      PostLink.find({ entityType: "resource", entityId: id })
        .populate({
          path: "postId",
          populate: { path: "userId", select: "displayName photoUrl" },
        })
        .limit(10),
    ]);

    const posts = linkedPosts
      .map((link) => link.postId)
      .filter((post) => post !== null);

    return Response.json({
      resource,
      snapshots,
      relatedPosts: posts,
    });
  } catch (error) {
    console.error("Error fetching resource:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

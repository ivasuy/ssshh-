import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { Resource } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const language = searchParams.get("language");
    const topic = searchParams.get("topic");
    const license = searchParams.get("license");
    const isTemplate = searchParams.get("isTemplate");
    const minStars = searchParams.get("minStars");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (language) query.language = language;
    if (topic) query.topics = topic;
    if (license) query.licenseSpdx = license;
    if (isTemplate === "true") query.isTemplate = true;
    if (minStars) query.stars = { $gte: parseInt(minStars) };
    if (search) {
      query.$or = [
        { repo: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { owner: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort({ healthScore: -1, stars: -1 })
        .skip(skip)
        .limit(limit),
      Resource.countDocuments(query),
    ]);

    return Response.json({
      items: resources,
      total,
      page,
      limit,
      hasMore: skip + resources.length < total,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

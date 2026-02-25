import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { ContributionOpportunity } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const difficulty = searchParams.get("difficulty");
    const labels = searchParams.get("labels");
    const hasBounty = searchParams.get("hasBounty");
    const minScore = searchParams.get("minScore");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (difficulty) query.difficulty = difficulty;
    if (labels) query.labels = { $in: labels.split(",") };
    if (hasBounty === "true") query.bountyAmount = { $gt: 0 };
    if (minScore) query.score = { $gte: parseInt(minScore) };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { repo: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [opportunities, total] = await Promise.all([
      ContributionOpportunity.find(query)
        .sort({ score: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ContributionOpportunity.countDocuments(query),
    ]);

    return Response.json({
      items: opportunities,
      total,
      page,
      limit,
      hasMore: skip + opportunities.length < total,
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

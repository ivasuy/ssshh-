import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { TechCard } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const domain = searchParams.get("domain");
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};

    if (domain) query.domain = domain;
    if (search) {
      query.$or = [
        { term: { $regex: search, $options: "i" } },
        { shortDefinition: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      TechCard.find(query)
        .sort({ qualityScore: -1, term: 1 })
        .skip(skip)
        .limit(limit),
      TechCard.countDocuments(query),
    ]);

    return Response.json({
      items: cards,
      total,
      page,
      limit,
      hasMore: skip + cards.length < total,
    });
  } catch (error) {
    console.error("Error fetching tech cards:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

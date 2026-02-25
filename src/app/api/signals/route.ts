import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { Signal } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const signalType = searchParams.get("signalType");
    const source = searchParams.get("source");
    const minScore = searchParams.get("minScore");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const query: Record<string, unknown> = {};

    if (signalType) query.signalType = signalType;
    if (source) query.source = source;
    if (minScore) query.score = { $gte: parseInt(minScore) };
    if (fromDate || toDate) {
      query.publishedAt = {};
      if (fromDate)
        (query.publishedAt as Record<string, Date>).$gte = new Date(fromDate);
      if (toDate)
        (query.publishedAt as Record<string, Date>).$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;

    const [signals, total] = await Promise.all([
      Signal.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit),
      Signal.countDocuments(query),
    ]);

    return Response.json({
      items: signals,
      total,
      page,
      limit,
      hasMore: skip + signals.length < total,
    });
  } catch (error) {
    console.error("Error fetching signals:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

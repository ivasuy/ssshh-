import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { TechCard, User } from "@/models";
import {
  authenticateRequest,
  unauthorizedResponse,
} from "@/lib/auth-middleware";
import { generateTechCard } from "@/service/ai-service";

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
    const { term, domain } = body;

    if (!term) {
      return Response.json({ error: "Term is required" }, { status: 400 });
    }

    const slug = term
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existingCard = await TechCard.findOne({ slug });
    if (existingCard) {
      return Response.json(
        { error: "Card for this term already exists", card: existingCard },
        { status: 400 }
      );
    }

    const generatedContent = await generateTechCard(term, domain);

    const card = await TechCard.create({
      term,
      slug,
      domain: domain || "general",
      shortDefinition: generatedContent.shortDefinition,
      useCases: generatedContent.useCases,
      whereUsed: generatedContent.whereUsed,
      interviewQAs: generatedContent.interviewQAs,
      refs: generatedContent.refs,
      qualityScore: 50,
    });

    return Response.json({ card }, { status: 201 });
  } catch (error) {
    console.error("Error generating tech card:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

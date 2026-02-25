import { getGenerativeModel } from "@/lib/vertex-ai";

export interface GeneratedTechCard {
  shortDefinition: string;
  useCases: string[];
  whereUsed: string[];
  interviewQAs: { question: string; answer: string }[];
  refs: string[];
}

export async function generateTechCard(
  term: string,
  domain?: string
): Promise<GeneratedTechCard> {
  const model = getGenerativeModel();

  const prompt = `You are a technical documentation expert. Generate a comprehensive tech card for the term "${term}"${domain ? ` in the ${domain} domain` : ""}.

Return a JSON object with the following structure:
{
  "shortDefinition": "A concise 1-2 sentence definition of the term",
  "useCases": ["Use case 1", "Use case 2", "Use case 3", "Use case 4", "Use case 5"],
  "whereUsed": ["Example project/company 1", "Example project/company 2", "Example project/company 3"],
  "interviewQAs": [
    {"question": "Common interview question 1?", "answer": "Concise answer 1"},
    {"question": "Common interview question 2?", "answer": "Concise answer 2"}
  ],
  "refs": ["https://official-docs-link.com", "https://tutorial-link.com"]
}

Important:
- Be accurate and technical
- Keep definitions concise but informative
- Provide real-world use cases
- Include 2 practical interview questions with answers
- Reference official documentation when possible
- Return ONLY valid JSON, no markdown code blocks`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]) as GeneratedTechCard;

    return {
      shortDefinition: parsed.shortDefinition || `Definition for ${term}`,
      useCases: parsed.useCases || [],
      whereUsed: parsed.whereUsed || [],
      interviewQAs: parsed.interviewQAs || [],
      refs: parsed.refs || [],
    };
  } catch (error) {
    console.error("Error generating tech card:", error);
    return {
      shortDefinition: `${term} is a technology concept that requires further documentation.`,
      useCases: [],
      whereUsed: [],
      interviewQAs: [],
      refs: [],
    };
  }
}

export async function summarizeContent(content: string): Promise<string> {
  const model = getGenerativeModel();

  const prompt = `Summarize the following technical content in 2-3 sentences, focusing on the key points for developers:

${content.substring(0, 4000)}

Return only the summary text, no additional formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return text.trim();
  } catch (error) {
    console.error("Error summarizing content:", error);
    return "";
  }
}

export async function categorizeSignal(
  title: string,
  content: string
): Promise<{ category: string; score: number }> {
  const model = getGenerativeModel();

  const prompt = `Analyze this tech signal and categorize it:

Title: ${title}
Content: ${content.substring(0, 1000)}

Return a JSON object with:
{
  "category": "one of: release, vulnerability, changelog, breaking_change, deprecation, new_feature",
  "score": "importance score 0-100 based on impact to developers"
}

Return ONLY valid JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { category: "changelog", score: 50 };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      category: parsed.category || "changelog",
      score: Math.min(100, Math.max(0, parseInt(parsed.score) || 50)),
    };
  } catch (error) {
    console.error("Error categorizing signal:", error);
    return { category: "changelog", score: 50 };
  }
}

export async function scoreResource(
  name: string,
  description: string,
  stars: number,
  lastPushed: Date
): Promise<number> {
  const daysSinceUpdate = Math.floor(
    (Date.now() - lastPushed.getTime()) / (1000 * 60 * 60 * 24)
  );

  let score = 50;

  if (stars > 10000) score += 25;
  else if (stars > 1000) score += 20;
  else if (stars > 100) score += 10;
  else if (stars > 10) score += 5;

  if (daysSinceUpdate < 7) score += 15;
  else if (daysSinceUpdate < 30) score += 10;
  else if (daysSinceUpdate < 90) score += 5;
  else if (daysSinceUpdate > 365) score -= 10;

  return Math.min(100, Math.max(0, score));
}

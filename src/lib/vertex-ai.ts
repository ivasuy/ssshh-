import { VertexAI } from "@google-cloud/vertexai";

let vertexAI: VertexAI | null = null;

export function getVertexAI(): VertexAI {
  if (vertexAI) {
    return vertexAI;
  }

  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

  if (!project) {
    throw new Error(
      "GOOGLE_CLOUD_PROJECT environment variable is required for Vertex AI"
    );
  }

  vertexAI = new VertexAI({ project, location });
  return vertexAI;
}

export function getGenerativeModel(modelName = "gemini-1.5-flash") {
  const vertexAI = getVertexAI();
  return vertexAI.getGenerativeModel({ model: modelName });
}

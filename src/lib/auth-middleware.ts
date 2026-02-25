import { NextRequest } from "next/server";
import { verifyIdToken } from "./firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

export interface AuthenticatedRequest {
  user: DecodedIdToken;
}

export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedRequest | null> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const decodedToken = await verifyIdToken(token);

  if (!decodedToken) {
    return null;
  }

  return { user: decodedToken };
}

export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}

import { NextRequest } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET;

export function verifyCronRequest(request: NextRequest): boolean {
  if (!CRON_SECRET) {
    console.warn("CRON_SECRET not set — allowing request in dev mode");
    return process.env.NODE_ENV === "development";
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${CRON_SECRET}`;
}

export function cronUnauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

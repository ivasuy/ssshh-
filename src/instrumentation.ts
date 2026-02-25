export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("@/lib/env");
    validateEnv();

    const cron = await import("node-cron");

    const CRON_SECRET = process.env.CRON_SECRET || "";
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    async function callCronRoute(path: string) {
      try {
        const res = await fetch(`${BASE_URL}${path}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CRON_SECRET}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        console.log(`[CRON] ${path} →`, data);
      } catch (err) {
        console.error(`[CRON] ${path} failed:`, err);
      }
    }

    // Signal ingestion — every 6 hours
    cron.default.schedule("0 */6 * * *", () => {
      callCronRoute("/api/cron/ingest-signals");
    });

    // Opportunity ingestion — daily at midnight
    cron.default.schedule("0 0 * * *", () => {
      callCronRoute("/api/cron/ingest-opportunities");
    });

    console.log("[CRON] Scheduled: ingest-signals (every 6h), ingest-opportunities (daily)");
  }
}

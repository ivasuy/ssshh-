import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const IP_API_URL = "https://ipapi.co";
const TIMEOUT = 5000;

export async function GET(request: NextRequest) {
  try {

    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIP = forwardedFor ? forwardedFor.split(',')[0] : null;

    if (!clientIP)  throw new Error("Could not determine client IP");
    
    const response = await axios.get(`${IP_API_URL}/${clientIP}/json/`, {
      timeout: TIMEOUT,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });
    const { ip, city, region, country } = response.data;
    if (!ip) throw new Error("Invalid response: IP address missing");

    return NextResponse.json({
      ip,
      location: {
        city: city || "Unknown",
        state: region || "Unknown",
        country: country || "Unknown",
      },
    });
  } catch (error) {
    console.error("error in getUserInfo");

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json({ error: "Request timeout" }, { status: 408 });
      }
      if (error.response?.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to retrieve IP data" },
      { status: 500 }
    );
  }
}

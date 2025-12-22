import { NextResponse } from "next/server";

import { backendBaseUrl } from "@/lib/env";

/**
 * Proxy for copilot cookie write.
 * Forwards body to backend: /api/v1/data/copilot/cookies (or /cookies alias)
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const response = await fetch(`${backendBaseUrl}/api/v1/data/copilot/cookies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(
      data,
      { status: response.status }
    );
  } catch (error) {
    console.error("Proxy copilot/cookies error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to forward copilot cookies request" },
      { status: 500 }
    );
  }
}

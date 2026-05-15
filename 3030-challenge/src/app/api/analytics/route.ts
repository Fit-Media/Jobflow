import { NextResponse } from "next/server";
import type { AnalyticsEvent } from "@/types";
import { hasPrivateAnalyticsLeak, sanitizeAnalyticsMetadata } from "@/lib/analytics/privacy";

export async function POST(request: Request) {
  const body = (await request.json()) as { events?: AnalyticsEvent[] };
  const events = body.events ?? [];
  const unsafe = events.some(hasPrivateAnalyticsLeak);
  if (unsafe) return NextResponse.json({ ok: false, message: "Private text fields are not accepted." }, { status: 400 });
  const sanitizedEvents = events.map((event) => ({ ...event, metadata: sanitizeAnalyticsMetadata(event.metadata) }));
  return NextResponse.json({ ok: true, accepted: sanitizedEvents.length });
}

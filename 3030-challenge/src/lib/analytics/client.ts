"use client";

import type { AnalyticsEvent, AnalyticsEventType, ParticipantProfile } from "@/types";
import { sanitizeAnalyticsMetadata } from "@/lib/analytics/privacy";

const queueKey = "3030:analyticsQueue";
const appVersion = "0.1.0-mvp";

function deviceType(): AnalyticsEvent["deviceType"] {
  const width = window.innerWidth;
  if (width < 720) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function getQueue(): AnalyticsEvent[] {
  const raw = localStorage.getItem(queueKey);
  return raw ? JSON.parse(raw) : [];
}

function setQueue(events: AnalyticsEvent[]) {
  localStorage.setItem(queueKey, JSON.stringify(events));
}

// Privacy guard: analytics metadata is intentionally high-level only.
// This client drops any metadata key outside the explicit safe list before queueing.
// Never send private notes, goals, reasons, workout text, nutrition text, or reflections.
export async function trackEvent(eventType: AnalyticsEventType, profile?: ParticipantProfile | null, metadata?: AnalyticsEvent["metadata"], fields?: Partial<AnalyticsEvent>) {
  const { metadata: fieldMetadata, ...safeFields } = fields ?? {};
  const event: AnalyticsEvent = {
    eventId: crypto.randomUUID(),
    participantId: profile?.participantId,
    clubId: profile?.clubId,
    timestamp: new Date().toISOString(),
    eventType,
    deviceType: deviceType(),
    appVersion,
    ...safeFields,
    metadata: sanitizeAnalyticsMetadata({ ...fieldMetadata, ...metadata }),
  };
  const queue = [...getQueue(), event];
  setQueue(queue);
  await flushAnalytics();
}

export async function flushAnalytics() {
  if (!navigator.onLine) return;
  const queue = getQueue();
  if (!queue.length) return;
  try {
    const response = await fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ events: queue }) });
    if (response.ok) setQueue([]);
  } catch {
    setQueue(queue);
  }
}

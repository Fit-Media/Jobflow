import type { AnalyticsEvent } from "@/types";

type SafeMetadataValue = string | number | boolean | undefined;

const safeMetadataKeys = new Set([
  "codeEntered",
  "workoutChecked",
  "habitChecked",
  "dayCompleted",
  "daysCompletedThisWeek",
  "choice",
  "completed",
  "action",
  "section",
  "fieldType",
  "workoutNumber",
  "sizeBucket",
  "videoAttached",
  "isIOS",
  "supportsIndexedDB",
  "supportsVideoCapture",
  "supportsVoiceInput",
  "isStandalonePWA",
  "isMobileLike",
]);

const forbiddenPrivateMarkers = [
  "privateNote",
  "notes",
  "journal",
  "goals",
  "reasons",
  "reflections",
  "workoutText",
  "nutritionText",
  "transcript",
  "fileName",
  "mimeType",
  "fileSize",
  "videoContent",
  "objectUrl",
  "medical",
  "injury",
  "weight",
  "measurement",
];

function isSafePrimitive(value: unknown): value is SafeMetadataValue {
  return ["string", "number", "boolean", "undefined"].includes(typeof value);
}

export function sanitizeAnalyticsMetadata(metadata?: AnalyticsEvent["metadata"]) {
  if (!metadata) return undefined;
  const safeEntries = Object.entries(metadata).filter(([key, value]) => safeMetadataKeys.has(key) && isSafePrimitive(value));
  if (!safeEntries.length) return undefined;
  return Object.fromEntries(safeEntries) as AnalyticsEvent["metadata"];
}

export function hasPrivateAnalyticsLeak(event: Pick<AnalyticsEvent, "metadata">) {
  const metadata = event.metadata ?? {};
  return Object.entries(metadata).some(([key, value]) => {
    const unsafeKey = forbiddenPrivateMarkers.some((marker) => key.toLowerCase().includes(marker.toLowerCase()));
    const unsafeSensitiveValue = ["medical", "injury", "weight", "measurement"].some((marker) => String(value ?? "").toLowerCase().includes(marker));
    return unsafeKey || unsafeSensitiveValue;
  });
}

export const analyticsPrivacyContract = {
  safeMetadataKeys,
  forbiddenPrivateMarkers,
};

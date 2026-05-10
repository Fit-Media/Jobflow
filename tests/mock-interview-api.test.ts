import { describe, expect, it, afterEach } from "vitest";

import { POST } from "../src/app/api/mock-interview/route";

const originalEnv = { ...process.env };

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/mock-interview", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const validStartBody = {
  mode: "text",
  jobId: "job-ops-coordinator",
  interviewType: "hiring_manager",
  difficulty: "standard",
  transcriptConsent: false,
  audioConsent: false,
  videoConsent: false,
};

describe("mock interview API validation", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns a clean 400 for invalid request bodies", async () => {
    const response = await POST(makeRequest({ ...validStartBody, mode: "unsupported" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Invalid mock interview request");
    expect(json.issues.length).toBeGreaterThan(0);
  });

  it("requires required boolean consent fields instead of coercing them", async () => {
    const response = await POST(makeRequest({ ...validStartBody, transcriptConsent: "yes" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.issues.some((issue: { path: string }) => issue.path.includes("transcriptConsent"))).toBe(true);
  });

  it("keeps demo fallback when database mode is disabled", async () => {
    process.env.JOBFLOW_DATABASE_MODE = "false";
    const response = await POST(makeRequest(validStartBody));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.provider).toBe("text");
    expect(json.persistence.persisted).toBe(false);
    expect(json.persistence.reason).toBe("database_mode_disabled");
  });

  it("does not report transcript saved unless saveTranscriptApproved is true and database mode persists it", async () => {
    process.env.JOBFLOW_DATABASE_MODE = "false";
    const response = await POST(
      makeRequest({
        ...validStartBody,
        transcript: "Andrew answered with a STAR example.",
        saveTranscriptApproved: false,
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.savedToCrm).toBe(false);
    expect(json.transcriptSaved).toBe(false);
  });
});

import { afterEach, describe, expect, it } from "vitest";

import {
  DIDVisualAvatarProvider,
  OpenAIRealtimeVoiceProvider,
  TextInterviewProvider,
  avatarLabelForInterviewType,
  getInterviewProvider,
} from "../src/lib/interview/providers";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("interview providers", () => {
  it("always supports text interviews", () => {
    const provider = new TextInterviewProvider();
    expect(provider.getStatus().available).toBe(true);
  });

  it("falls voice interviews back to text when realtime model is missing", async () => {
    delete process.env.OPENAI_REALTIME_MODEL;
    const provider = new OpenAIRealtimeVoiceProvider();
    expect(provider.getStatus().available).toBe(false);
    const session = await provider.start({
      jobId: "job-ops-coordinator",
      interviewType: "hiring_manager",
      difficulty: "standard",
      transcriptConsent: false,
      audioConsent: false,
      videoConsent: false,
    });
    expect(session.provider).toBe("text");
    expect(session.transport).toBe("text");
  });

  it("keeps D-ID optional and falls back when disabled", async () => {
    process.env.ENABLE_DID_AVATAR_INTERVIEWS = "false";
    process.env.DID_API_KEY = "test";
    process.env.DID_AGENT_ID = "agent";
    const provider = new DIDVisualAvatarProvider();
    expect(provider.getStatus().available).toBe(false);
    const session = await provider.start({
      jobId: "job-ops-coordinator",
      interviewType: "recruiter",
      difficulty: "standard",
      transcriptConsent: false,
      audioConsent: false,
      videoConsent: false,
    });
    expect(["voice", "text"]).toContain(session.provider);
  });

  it("starts visual avatar sessions only when enabled and configured", async () => {
    process.env.ENABLE_DID_AVATAR_INTERVIEWS = "true";
    process.env.DID_API_KEY = "test";
    process.env.DID_AGENT_ID = "agent-123";
    process.env.DID_DEFAULT_AVATAR_ID = "avatar-123";
    process.env.DID_DEFAULT_VOICE_ID = "voice-123";

    const provider = getInterviewProvider("visual_avatar");
    const session = await provider.start({
      jobId: "job-ops-coordinator",
      interviewType: "government_panel",
      difficulty: "challenging",
      transcriptConsent: true,
      audioConsent: false,
      videoConsent: false,
    });

    expect(session.provider).toBe("visual_avatar");
    expect(session.transport).toBe("did_webrtc");
    expect(session.avatar?.clearAiNotice).toContain("AI-generated");
    expect(session.avatar?.label).toBe(avatarLabelForInterviewType("government_panel"));
    expect(session.consent.audio).toBe(false);
    expect(session.consent.video).toBe(false);
  });
});

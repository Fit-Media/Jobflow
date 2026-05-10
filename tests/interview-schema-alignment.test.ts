import { InterviewDifficulty, MockInterviewMode } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  interviewDifficultySchema,
  interviewModeSchema,
} from "../src/lib/interview/request-schema";
import {
  isPrismaInterviewModeSupported,
  prismaSupportedDifficulties,
  prismaSupportedInterviewModes,
  shouldPersistMediaUrl,
  shouldPersistTranscript,
} from "../src/lib/interview/persistence";

describe("mock interview schema alignment", () => {
  it("persists visual_avatar as a supported Prisma mode", () => {
    expect(MockInterviewMode.visual_avatar).toBe("visual_avatar");
    expect(interviewModeSchema.options).toContain("visual_avatar");
    expect(prismaSupportedInterviewModes).toContain("visual_avatar");
    expect(isPrismaInterviewModeSupported("visual_avatar")).toBe(true);
  });

  it("aligns provider and Prisma difficulty values", () => {
    expect(InterviewDifficulty.tough_but_fair).toBe("tough_but_fair");
    expect(interviewDifficultySchema.options).toEqual([...prismaSupportedDifficulties]);
    expect(interviewDifficultySchema.safeParse("executive").success).toBe(false);
  });

  it("does not persist transcript, audio, or video without separate approvals", () => {
    expect(shouldPersistTranscript(false, "private transcript")).toBeNull();
    expect(shouldPersistTranscript(true, "approved transcript")).toBe("approved transcript");
    expect(shouldPersistMediaUrl(false, "https://example.com/audio.webm")).toBeNull();
    expect(shouldPersistMediaUrl(true, "https://example.com/audio.webm")).toBe("https://example.com/audio.webm");
    expect(shouldPersistMediaUrl(false, "https://example.com/video.webm")).toBeNull();
  });
});

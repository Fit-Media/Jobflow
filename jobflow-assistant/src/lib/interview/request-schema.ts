import { z } from "zod";

export const interviewModeSchema = z.enum(["text", "voice", "visual_avatar"]);
export const interviewTypeSchema = z.enum([
  "recruiter",
  "hiring_manager",
  "government_panel",
  "behavioural",
  "technical",
  "final_round",
  "friendly_coach",
  "tough_but_fair",
]);
export const interviewDifficultySchema = z.enum(["easy", "standard", "challenging", "tough_but_fair"]);

const baseMockInterviewRequestSchema = z.object({
  mode: interviewModeSchema,
  jobId: z.string().min(1, "jobId is required"),
  interviewType: interviewTypeSchema,
  difficulty: interviewDifficultySchema,
  transcriptConsent: z.boolean(),
  audioConsent: z.boolean(),
  videoConsent: z.boolean(),
});

export const startMockInterviewRequestSchema = baseMockInterviewRequestSchema.extend({
  transcript: z.undefined().optional(),
  saveTranscriptApproved: z.undefined().optional(),
});

export const finishMockInterviewRequestSchema = baseMockInterviewRequestSchema.extend({
  sessionId: z.string().min(1, "sessionId is required when finishing a persisted interview").optional(),
  transcript: z.string().min(1, "transcript is required"),
  saveTranscriptApproved: z.boolean(),
  audioRecordingUrl: z.string().url().optional(),
  videoRecordingUrl: z.string().url().optional(),
});

export const mockInterviewRequestSchema = z.union([
  finishMockInterviewRequestSchema,
  startMockInterviewRequestSchema,
]);

export type StartMockInterviewRequest = z.infer<typeof startMockInterviewRequestSchema>;
export type FinishMockInterviewRequest = z.infer<typeof finishMockInterviewRequestSchema>;
export type MockInterviewRequest = z.infer<typeof mockInterviewRequestSchema>;

export function parseMockInterviewRequest(body: unknown) {
  if (body && typeof body === "object" && "transcript" in body) {
    return finishMockInterviewRequestSchema.safeParse(body);
  }
  return startMockInterviewRequestSchema.safeParse(body);
}

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "body",
    message: issue.message,
  }));
}

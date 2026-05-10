import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { InterviewMode, InterviewSessionStart, InterviewType } from "@/lib/interview/providers";
import type { FinishMockInterviewRequest, StartMockInterviewRequest } from "@/lib/interview/request-schema";
import type { PostInterviewFeedbackResult } from "@/lib/ai/schemas";

export const prismaSupportedInterviewModes = ["text", "voice", "visual_avatar"] as const;
export const prismaSupportedDifficulties = ["easy", "standard", "challenging", "tough_but_fair"] as const;

export function isDatabaseModeEnabled() {
  return process.env.JOBFLOW_DATABASE_MODE === "true" && Boolean(process.env.DATABASE_URL);
}

export function isPrismaInterviewModeSupported(mode: InterviewMode) {
  return (prismaSupportedInterviewModes as readonly string[]).includes(mode);
}

export function shouldPersistMediaUrl(consentApproved: boolean, url?: string) {
  return consentApproved ? url ?? null : null;
}

export function shouldPersistTranscript(saveTranscriptApproved: boolean, transcript: string) {
  return saveTranscriptApproved ? transcript : null;
}

function mapInterviewTypeToStyle(type: InterviewType) {
  const styleByType: Record<InterviewType, "friendly" | "direct" | "behavioural" | "technical" | "recruiter" | "hiring_manager"> = {
    recruiter: "recruiter",
    hiring_manager: "hiring_manager",
    government_panel: "direct",
    behavioural: "behavioural",
    technical: "technical",
    final_round: "hiring_manager",
    friendly_coach: "friendly",
    tough_but_fair: "direct",
  };
  return styleByType[type];
}

async function resolveMockInterviewUser() {
  // TODO(auth): Replace this demo actor lookup with the authenticated Andrew user once Auth.js is wired.
  const email = process.env.JOBFLOW_DEMO_USER_EMAIL ?? "andrew@example.com";
  return prisma.user.findUnique({ where: { email } });
}

export async function saveStartedMockInterviewSession(
  request: StartMockInterviewRequest,
  session: InterviewSessionStart,
) {
  if (!isDatabaseModeEnabled()) {
    return { persisted: false as const, reason: "database_mode_disabled" };
  }

  if (!isPrismaInterviewModeSupported(session.provider)) {
    return { persisted: false as const, reason: "unsupported_prisma_mode" };
  }

  const user = await resolveMockInterviewUser();
  if (!user) {
    return { persisted: false as const, reason: "missing_authenticated_user" };
  }

  const job = await prisma.job.findFirst({ where: { id: request.jobId, userId: user.id } });
  if (!job) {
    return { persisted: false as const, reason: "job_not_found" };
  }

  const saved = await prisma.mockInterviewSession.create({
    data: {
      id: session.sessionId,
      userId: user.id,
      jobId: job.id,
      mode: session.provider,
      difficulty: request.difficulty,
      interviewerStyle: mapInterviewTypeToStyle(request.interviewType),
      status: "in_progress",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      jobId: job.id,
      action: "MOCK_INTERVIEW_STARTED",
      detail: `${session.provider} mock interview started for ${job.company} - ${job.title}.`,
      metadataJson: {
        requestedMode: request.mode,
        persistedMode: session.provider,
        transport: session.transport,
        interviewType: request.interviewType,
        difficulty: request.difficulty,
      } satisfies Prisma.InputJsonObject,
    },
  });

  return { persisted: true as const, sessionId: saved.id };
}

export async function saveFinishedMockInterviewSession(
  request: FinishMockInterviewRequest,
  feedback: PostInterviewFeedbackResult,
) {
  if (!isDatabaseModeEnabled()) {
    return { persisted: false as const, transcriptSaved: false, audioSaved: false, videoSaved: false, reason: "database_mode_disabled" };
  }

  const user = await resolveMockInterviewUser();
  if (!user) {
    return { persisted: false as const, transcriptSaved: false, audioSaved: false, videoSaved: false, reason: "missing_authenticated_user" };
  }

  if (!isPrismaInterviewModeSupported(request.mode)) {
    return { persisted: false as const, transcriptSaved: false, audioSaved: false, videoSaved: false, reason: "unsupported_prisma_mode" };
  }

  const job = await prisma.job.findFirst({ where: { id: request.jobId, userId: user.id } });
  if (!job) {
    return { persisted: false as const, transcriptSaved: false, audioSaved: false, videoSaved: false, reason: "job_not_found" };
  }

  const transcriptToSave = shouldPersistTranscript(request.saveTranscriptApproved, request.transcript);
  const audioRecordingUrl = shouldPersistMediaUrl(request.audioConsent, request.audioRecordingUrl);
  const videoRecordingUrl = shouldPersistMediaUrl(request.videoConsent, request.videoRecordingUrl);

  const existingSession = request.sessionId
    ? await prisma.mockInterviewSession.findFirst({ where: { id: request.sessionId, userId: user.id, jobId: job.id } })
    : null;

  const session = existingSession
    ? await prisma.mockInterviewSession.update({
        where: { id: existingSession.id },
        data: {
          status: "completed",
          transcriptText: transcriptToSave,
          audioRecordingUrl,
          audioRecordingConsent: request.audioConsent,
          overallScore: feedback.overallScore,
          feedbackSummary: feedback.summary,
        },
      })
    : await prisma.mockInterviewSession.create({
        data: {
          userId: user.id,
          jobId: job.id,
          mode: request.mode,
          difficulty: request.difficulty,
          interviewerStyle: mapInterviewTypeToStyle(request.interviewType),
          status: "completed",
          transcriptText: transcriptToSave,
          audioRecordingUrl,
          audioRecordingConsent: request.audioConsent,
          overallScore: feedback.overallScore,
          feedbackSummary: feedback.summary,
        },
      });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      jobId: job.id,
      action: "MOCK_INTERVIEW_COMPLETED",
      detail: `Mock interview completed with score ${feedback.overallScore}/100.`,
      metadataJson: {
        sessionId: session.id,
        transcriptSaved: Boolean(transcriptToSave),
        audioSaved: Boolean(audioRecordingUrl),
        videoSaved: Boolean(videoRecordingUrl),
        videoRecordingUrl,
      } satisfies Prisma.InputJsonObject,
    },
  });

  return {
    persisted: true as const,
    sessionId: session.id,
    transcriptSaved: Boolean(transcriptToSave),
    audioSaved: Boolean(audioRecordingUrl),
    videoSaved: Boolean(videoRecordingUrl),
  };
}

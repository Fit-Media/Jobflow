import { NextResponse } from "next/server";

import { getInterviewProvider, type InterviewMode } from "@/lib/interview/providers";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const provider = getInterviewProvider((body.mode ?? "text") as InterviewMode);

  if (body.transcript) {
    return NextResponse.json(await provider.finish(body.transcript, Boolean(body.saveTranscriptApproved)));
  }

  return NextResponse.json(
    await provider.start({
      jobId: body.jobId ?? "job-ops-coordinator",
      interviewType: body.interviewType ?? "hiring_manager",
      difficulty: body.difficulty ?? "standard",
      transcriptConsent: Boolean(body.transcriptConsent),
      audioConsent: Boolean(body.audioConsent),
      videoConsent: Boolean(body.videoConsent),
    }),
  );
}

import { NextResponse } from "next/server";

import { getInterviewProvider } from "@/lib/interview/providers";
import {
  finishMockInterviewRequestSchema,
  formatZodError,
  parseMockInterviewRequest,
  startMockInterviewRequestSchema,
} from "@/lib/interview/request-schema";
import {
  isPrismaInterviewModeSupported,
  saveFinishedMockInterviewSession,
  saveStartedMockInterviewSession,
} from "@/lib/interview/persistence";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseMockInterviewRequest(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid mock interview request", issues: formatZodError(parsed.error) },
      { status: 400 },
    );
  }

  // TODO(auth): Require an authenticated Andrew user before enabling production database persistence.
  const input = parsed.data;
  const provider = getInterviewProvider(input.mode);

  const finishParsed = finishMockInterviewRequestSchema.safeParse(input);
  if (finishParsed.success) {
    const finishInput = finishParsed.data;

    if (!isPrismaInterviewModeSupported(finishInput.mode)) {
      return NextResponse.json(
        { error: "Mock interview mode is not supported by the database schema." },
        { status: 400 },
      );
    }

    const result = await provider.finish(finishInput.transcript, finishInput.saveTranscriptApproved);
    const persistence = await saveFinishedMockInterviewSession(finishInput, result.feedback);

    return NextResponse.json({
      ...result,
      persistence,
      transcriptSaved: persistence.transcriptSaved,
      audioSaved: persistence.audioSaved,
      videoSaved: persistence.videoSaved,
    });
  }

  const startInput = startMockInterviewRequestSchema.parse(input);
  const session = await provider.start(startInput);
  const persistence = await saveStartedMockInterviewSession(startInput, session);

  return NextResponse.json({
    ...session,
    persistence,
  });
}

import { NextResponse } from "next/server";

import { getJobById } from "@/lib/data/demo-data";
import {
  checkForUnsupportedClaims,
  demoGenerateCoverEmail,
  demoGenerateCoverLetter,
  demoGenerateInterviewPrep,
  demoScoreJobMatch,
  demoTailorResume,
} from "@/lib/ai/service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const job = getJobById(body.jobId ?? "job-ops-coordinator");
  const tailoredResume = demoTailorResume(job);

  return NextResponse.json({
    job,
    match: demoScoreJobMatch(job),
    tailoredResume,
    coverLetter: demoGenerateCoverLetter(job),
    coverEmail: demoGenerateCoverEmail(job),
    interviewPrep: demoGenerateInterviewPrep(job),
    unsupportedClaims: checkForUnsupportedClaims(tailoredResume.tailoredResumeMarkdown),
    approvalsCreated: [
      "resume_changes",
      "cover_letter",
      "cover_email",
      "document_export",
      "mark_as_applied",
    ],
  });
}

import { describe, expect, it } from "vitest";

import {
  coverEmailSchema,
  coverLetterSchema,
  interviewPrepSchema,
  jobDescriptionSchema,
  jobEmailParseSchema,
  matchJobSchema,
  mockInterviewPlanSchema,
  postInterviewFeedbackSchema,
  tailoredResumeSchema,
  unsupportedClaimsSchema,
} from "../src/lib/ai/schemas";
import { checkForUnsupportedClaims, demoGenerateCoverEmail, demoGenerateCoverLetter, demoGenerateInterviewPrep, demoMockInterviewPlan, demoPostInterviewFeedback, demoScoreJobMatch, demoTailorResume } from "../src/lib/ai/service";
import { demoJobs } from "../src/lib/data/demo-data";

describe("AI structured schemas", () => {
  const job = demoJobs[0];

  it("validates job email parsing output", () => {
    expect(() =>
      jobEmailParseSchema.parse({
        isJobOpportunity: true,
        jobTitle: "Operations Coordinator",
        company: "Northstar Health",
        recruiterName: "Mia",
        recruiterEmail: "mia@example.com",
        location: "Sydney",
        salary: "",
        jobType: "Full-time",
        applicationUrl: "https://example.com",
        deadline: "",
        summary: "Coordinate operations",
        mustHaveCriteria: ["CRM"],
        desirableCriteria: [],
        keywords: ["operations"],
        sourcePlatform: "Gmail",
        confidence: 90,
        notes: "",
      }),
    ).not.toThrow();
  });

  it("validates job description parsing output", () => {
    expect(() =>
      jobDescriptionSchema.parse({
        jobTitle: "Operations Coordinator",
        company: "Northstar Health",
        location: "Sydney",
        salary: "",
        jobType: "",
        summary: "",
        responsibilities: [],
        mustHaveCriteria: [],
        desirableCriteria: [],
        keywords: [],
        selectionCriteria: [],
        applicationInstructions: [],
        deadline: "",
        confidence: 88,
      }),
    ).not.toThrow();
  });

  it("validates match, resume, cover letter, cover email, interview prep, plan, feedback, and claims outputs", () => {
    expect(matchJobSchema.parse(demoScoreJobMatch(job)).score).toBeGreaterThan(0);
    expect(tailoredResumeSchema.parse(demoTailorResume(job)).riskWarnings.length).toBeGreaterThan(0);
    expect(coverLetterSchema.parse(demoGenerateCoverLetter(job)).coverLetterMarkdown).toContain(job.company);
    expect(coverEmailSchema.parse(demoGenerateCoverEmail(job)).body).toContain("attached");
    expect(interviewPrepSchema.parse(demoGenerateInterviewPrep(job)).likelyQuestions.length).toBeGreaterThan(0);
    expect(mockInterviewPlanSchema.parse(demoMockInterviewPlan(job)).questionPlan.length).toBeGreaterThan(0);
    expect(postInterviewFeedbackSchema.parse(demoPostInterviewFeedback("long answer with examples")).overallScore).toBeGreaterThan(0);
    expect(unsupportedClaimsSchema.parse(checkForUnsupportedClaims("I am a certified healthcare expert")).safeToApprove).toBe(false);
  });
});

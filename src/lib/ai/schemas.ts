import { z } from "zod";

export const jobEmailParseSchema = z.object({
  isJobOpportunity: z.boolean(),
  jobTitle: z.string(),
  company: z.string(),
  recruiterName: z.string(),
  recruiterEmail: z.string(),
  location: z.string(),
  salary: z.string(),
  jobType: z.string(),
  applicationUrl: z.string(),
  deadline: z.string(),
  summary: z.string(),
  mustHaveCriteria: z.array(z.string()),
  desirableCriteria: z.array(z.string()),
  keywords: z.array(z.string()),
  sourcePlatform: z.string(),
  confidence: z.number().min(0).max(100),
  notes: z.string(),
});

export const jobDescriptionSchema = z.object({
  jobTitle: z.string(),
  company: z.string(),
  location: z.string(),
  salary: z.string(),
  jobType: z.string(),
  summary: z.string(),
  responsibilities: z.array(z.string()),
  mustHaveCriteria: z.array(z.string()),
  desirableCriteria: z.array(z.string()),
  keywords: z.array(z.string()),
  selectionCriteria: z.array(z.string()),
  applicationInstructions: z.array(z.string()),
  deadline: z.string(),
  confidence: z.number().min(0).max(100),
});

export const matchJobSchema = z.object({
  score: z.number().min(0).max(100),
  recommendation: z.enum(["Strong fit", "Good fit", "Maybe", "Low fit", "Not recommended"]),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  keywordsToEmphasize: z.array(z.string()),
  riskFlags: z.array(z.string()),
  summary: z.string(),
  applicationAdvice: z.string(),
});

export const tailoredResumeSchema = z.object({
  tailoredResumeMarkdown: z.string(),
  changeSummary: z.array(z.string()),
  keywordsEmphasized: z.array(z.string()),
  unsupportedClaimsCheck: z.array(z.string()),
  missingInfoQuestions: z.array(z.string()),
  riskWarnings: z.array(z.string()),
});

export const coverLetterSchema = z.object({
  coverLetterMarkdown: z.string(),
  personalizationNotes: z.array(z.string()),
  unsupportedClaimsCheck: z.array(z.string()),
  missingInfoQuestions: z.array(z.string()),
});

export const coverEmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
  personalizationNotes: z.array(z.string()),
  unsupportedClaimsCheck: z.array(z.string()),
});

export const screeningAnswerSchema = z.object({
  question: z.string(),
  suggestedAnswer: z.string(),
  confidence: z.number().min(0).max(100),
  sourceFactsUsed: z.array(z.string()),
  needsUserInput: z.boolean(),
  warning: z.string(),
});

export const followUpEmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

export const interviewPrepSchema = z.object({
  likelyQuestions: z.array(z.string()),
  suggestedTalkingPoints: z.array(z.string()),
  questionsAndrewCanAsk: z.array(z.string()),
  roleSpecificPrep: z.array(z.string()),
  resumePointsToEmphasize: z.array(z.string()),
  gapsToPrepareFor: z.array(z.string()),
  thirtySecondPitch: z.string(),
  twoMinutePitch: z.string(),
  salaryOrAvailabilityTalkingPoints: z.array(z.string()),
  redFlagsToPrepareFor: z.array(z.string()),
});

export const mockInterviewPlanSchema = z.object({
  interviewerStyle: z.string(),
  difficulty: z.string(),
  interviewLengthMinutes: z.number(),
  questionPlan: z.array(
    z.object({
      question: z.string(),
      questionType: z.string(),
      whyThisMatters: z.string(),
      idealAnswerGuidance: z.string(),
      resumePointsToUse: z.array(z.string()),
      commonMistakes: z.array(z.string()),
    }),
  ),
  jobWinningAdvice: z.array(z.string()),
  thingsToAvoidSaying: z.array(z.string()),
  questionsAndrewShouldAsk: z.array(z.string()),
});

export const mockInterviewTurnSchema = z.object({
  nextQuestion: z.string(),
  followUpReason: z.string(),
  interviewProgress: z.string(),
  shouldEndInterview: z.boolean(),
});

export const postInterviewFeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  bestAnswer: z.string(),
  weakestAnswer: z.string(),
  suggestedBetterAnswers: z.array(z.string()),
  missedOpportunities: z.array(z.string()),
  jobWinningAdvice: z.array(z.string()),
  specificPhrasesToUse: z.array(z.string()),
  thingsToAvoid: z.array(z.string()),
  followUpPracticeQuestions: z.array(z.string()),
  recommendedNextSteps: z.array(z.string()),
});

export const unsupportedClaimsSchema = z.object({
  hasUnsupportedClaims: z.boolean(),
  unsupportedClaims: z.array(z.string()),
  safeToApprove: z.boolean(),
  notes: z.array(z.string()),
});

export type MatchJobResult = z.infer<typeof matchJobSchema>;
export type TailoredResumeResult = z.infer<typeof tailoredResumeSchema>;
export type CoverLetterResult = z.infer<typeof coverLetterSchema>;
export type CoverEmailResult = z.infer<typeof coverEmailSchema>;
export type InterviewPrepResult = z.infer<typeof interviewPrepSchema>;
export type MockInterviewPlanResult = z.infer<typeof mockInterviewPlanSchema>;
export type PostInterviewFeedbackResult = z.infer<typeof postInterviewFeedbackSchema>;

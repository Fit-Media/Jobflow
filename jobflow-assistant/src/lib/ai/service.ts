import OpenAI from "openai";

import { andrewProfile, baseResumeMarkdown, type DemoJob } from "@/lib/data/demo-data";
import { aiPrompts, trustedSourceRule } from "@/lib/ai/prompts";
import {
  coverEmailSchema,
  coverLetterSchema,
  followUpEmailSchema,
  interviewPrepSchema,
  jobDescriptionSchema,
  jobEmailParseSchema,
  matchJobSchema,
  mockInterviewPlanSchema,
  mockInterviewTurnSchema,
  postInterviewFeedbackSchema,
  screeningAnswerSchema,
  tailoredResumeSchema,
  unsupportedClaimsSchema,
} from "@/lib/ai/schemas";
import { detectPromptInjection, wrapUntrustedContent } from "@/lib/security/prompt-injection";

type JsonSchemaName =
  | "job_email"
  | "job_description"
  | "match_job"
  | "tailor_resume"
  | "cover_letter"
  | "cover_email"
  | "screening_answer"
  | "follow_up_email"
  | "interview_prep"
  | "mock_interview_plan"
  | "mock_interview_turn"
  | "post_interview_feedback"
  | "unsupported_claims";

const schemas = {
  job_email: jobEmailParseSchema,
  job_description: jobDescriptionSchema,
  match_job: matchJobSchema,
  tailor_resume: tailoredResumeSchema,
  cover_letter: coverLetterSchema,
  cover_email: coverEmailSchema,
  screening_answer: screeningAnswerSchema,
  follow_up_email: followUpEmailSchema,
  interview_prep: interviewPrepSchema,
  mock_interview_plan: mockInterviewPlanSchema,
  mock_interview_turn: mockInterviewTurnSchema,
  post_interview_feedback: postInterviewFeedbackSchema,
  unsupported_claims: unsupportedClaimsSchema,
};

function requireModel(kind: "OPENAI_MODEL" | "OPENAI_INTERVIEW_MODEL" | "OPENAI_REALTIME_MODEL" = "OPENAI_MODEL") {
  const model = process.env[kind] ?? (kind === "OPENAI_INTERVIEW_MODEL" ? process.env.OPENAI_MODEL : undefined);
  if (!model) {
    throw new Error(`${kind} is not configured. Add it to .env.local before using live AI generation.`);
  }
  return model;
}

async function structuredGenerate<TName extends JsonSchemaName>({
  schemaName,
  system,
  user,
  modelKind = "OPENAI_MODEL",
}: {
  schemaName: TName;
  system: string;
  user: string;
  modelKind?: "OPENAI_MODEL" | "OPENAI_INTERVIEW_MODEL";
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured. The app can show demo outputs, but live generation needs a key.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: requireModel(modelKind),
    input: [
      { role: "system", content: `${system}\n\n${trustedSourceRule}\nReturn JSON only.` },
      { role: "user", content: user },
    ],
    text: { format: { type: "json_object" } },
  });

  const text = response.output_text;
  const parsed = JSON.parse(text);
  return schemas[schemaName].parse(parsed);
}

export async function parseJobEmail(input: { subject: string; sender: string; date: string; body: string; links: string[] }) {
  detectPromptInjection(input.body);
  return structuredGenerate({
    schemaName: "job_email",
    system: aiPrompts.parseJobEmail,
    user: JSON.stringify({ ...input, body: wrapUntrustedContent("email", input.body) }),
  });
}

export async function parseJobDescription(jobDescription: string) {
  return structuredGenerate({
    schemaName: "job_description",
    system: aiPrompts.parseJobDescription,
    user: wrapUntrustedContent("job_description", jobDescription),
  });
}

export function demoScoreJobMatch(job: DemoJob) {
  return matchJobSchema.parse({
    score: job.matchScore,
    recommendation: job.recommendation,
    strengths: ["CRM administration appears directly relevant.", "Andrew has verified customer communication experience."],
    gaps: job.desirableCriteria.filter((item) => /healthcare|SaaS|government/i.test(item)),
    keywordsToEmphasize: job.keywords.slice(0, 5),
    riskFlags: ["Do not claim industry-specific experience unless Andrew confirms it."],
    summary: `${job.company}'s ${job.title} role appears to align with Andrew's operations, support, and records experience.`,
    applicationAdvice: "Tailor the resume around verified CRM accuracy, handovers, stakeholder communication, and calm follow-up.",
  });
}

export async function scoreJobMatch(jobDescription: string, resumeMarkdown = baseResumeMarkdown) {
  return structuredGenerate({
    schemaName: "match_job",
    system: aiPrompts.matchJob,
    user: JSON.stringify({
      profile: andrewProfile,
      verifiedResume: resumeMarkdown,
      jobDescription: wrapUntrustedContent("job_description", jobDescription),
    }),
  });
}

export function demoTailorResume(job: DemoJob) {
  return tailoredResumeSchema.parse({
    tailoredResumeMarkdown: `${baseResumeMarkdown}\n\n## Targeted Fit for ${job.company}\n- Emphasise verified experience with ${job.keywords.slice(0, 3).join(", ")}.\n- Keep industry-specific claims out unless Andrew confirms them.`,
    changeSummary: [
      "Reordered summary to lead with operations coordination.",
      "Emphasised CRM accuracy and stakeholder follow-up.",
      "Added a risk warning for unverified industry experience.",
    ],
    keywordsEmphasized: job.keywords,
    unsupportedClaimsCheck: [],
    missingInfoQuestions: ["Can Andrew confirm any direct experience in this industry or adjacent environments?"],
    riskWarnings: ["Do not add new qualifications, licences, metrics, or employers."],
  });
}

export async function tailorResume(jobDescription: string, resumeMarkdown = baseResumeMarkdown) {
  return structuredGenerate({
    schemaName: "tailor_resume",
    system: aiPrompts.tailorResume,
    user: JSON.stringify({
      profile: andrewProfile,
      verifiedResume: resumeMarkdown,
      jobDescription: wrapUntrustedContent("job_description", jobDescription),
    }),
  });
}

export function demoGenerateCoverLetter(job: DemoJob) {
  return coverLetterSchema.parse({
    coverLetterMarkdown: `Dear Hiring Team,\n\nI am applying for the ${job.title} role with ${job.company}. My background in operations support, CRM administration, customer communication, and clear follow-up aligns well with the practical needs of this position.\n\nIn my recent work I have coordinated customer requests, maintained accurate records, and improved recurring administrative checklists so handovers are easier for teams to trust. I would welcome the opportunity to bring that organised, calm, and detail-focused approach to ${job.company}.\n\nKind regards,\nAndrew`,
    personalizationNotes: [`Specific to ${job.title} and ${job.company}.`, "Uses only verified resume themes."],
    unsupportedClaimsCheck: [],
    missingInfoQuestions: ["Add a stronger company-specific sentence after Andrew reviews company research."],
  });
}

export function demoGenerateCoverEmail(job: DemoJob) {
  const recipient = job.recruiterName ?? "Team";
  return coverEmailSchema.parse({
    subject: `Application for ${job.title} - Andrew Taylor`,
    body: `Hi ${recipient},\n\nPlease find attached my application for the ${job.title} role with ${job.company}.\n\nI have attached my resume and cover letter for your review. I would welcome the opportunity to discuss how my experience aligns with the role.\n\nKind regards,\nAndrew`,
    personalizationNotes: [`Uses ${recipient === "Team" ? "a generic team greeting" : `${recipient}'s name`}.`, "Keeps the email short and separate from the cover letter."],
    unsupportedClaimsCheck: [],
  });
}

export function demoGenerateInterviewPrep(job: DemoJob) {
  return interviewPrepSchema.parse({
    likelyQuestions: [
      `Why do you want the ${job.title} role at ${job.company}?`,
      "Tell me about a time you improved a process.",
      "How do you keep records accurate under pressure?",
      "What would your manager say is your strongest support skill?",
    ],
    suggestedTalkingPoints: ["CRM accuracy", "Calm escalation", "Clear handovers", "Customer follow-up"],
    questionsAndrewCanAsk: ["What would success look like in the first 90 days?", "Which systems does the team use most?"],
    roleSpecificPrep: job.mustHaveCriteria,
    resumePointsToEmphasize: ["Operations Assistant experience", "Support documentation", "Process checklist improvement"],
    gapsToPrepareFor: job.desirableCriteria,
    thirtySecondPitch: "I keep operations moving by making records accurate, follow-up visible, and communication clear.",
    twoMinutePitch: "I bring practical operations and customer support experience, with a focus on organised CRM records, calm stakeholder communication, and clearer handover processes.",
    salaryOrAvailabilityTalkingPoints: ["Use Andrew's confirmed salary expectations only.", "State notice period exactly as Andrew verifies it."],
    redFlagsToPrepareFor: ["Industry-specific experience should be framed honestly if it is limited."],
  });
}

export function demoMockInterviewPlan(job: DemoJob) {
  return mockInterviewPlanSchema.parse({
    interviewerStyle: "hiring_manager",
    difficulty: "standard",
    interviewLengthMinutes: 20,
    questionPlan: [
      {
        question: `Tell me about yourself and why this ${job.title} role interests you.`,
        questionType: "motivation",
        whyThisMatters: "Tests role motivation and concise positioning.",
        idealAnswerGuidance: "Connect operations support, CRM accuracy, and the role's must-have criteria.",
        resumePointsToUse: ["Operations Assistant", "CRM records", "Customer support"],
        commonMistakes: ["Giving a generic biography", "Claiming unverified industry experience"],
      },
      {
        question: "Describe a time you improved an administrative process.",
        questionType: "behavioural",
        whyThisMatters: "The job requires practical process improvement.",
        idealAnswerGuidance: "Use STAR and mention the checklist improvement from Andrew's resume.",
        resumePointsToUse: ["Improved recurring admin checklists", "Clearer handovers"],
        commonMistakes: ["No specific result", "Too much background"],
      },
    ],
    jobWinningAdvice: ["Prepare one crisp STAR story.", "Ask a systems/process question at the end."],
    thingsToAvoidSaying: ["I can do anything", "Unverified claims about industry tools"],
    questionsAndrewShouldAsk: ["What are the biggest handover or reporting pain points right now?"],
  });
}

export function demoPostInterviewFeedback(transcript: string) {
  return postInterviewFeedbackSchema.parse({
    overallScore: transcript.length > 120 ? 82 : 68,
    summary: "Strong structure and calm tone. The answers would be more persuasive with one specific result and a tighter closing statement.",
    strengths: ["Clear motivation", "Relevant CRM and support examples", "Professional tone"],
    improvementAreas: ["Add measurable detail where truthful", "Use STAR more explicitly", "Close answers with the role requirement"],
    bestAnswer: "The process improvement answer was strongest because it used a concrete work example.",
    weakestAnswer: "The company motivation answer needs more specific role context.",
    suggestedBetterAnswers: ["I improved recurring admin checklists so handovers were clearer and less error-prone."],
    missedOpportunities: ["Mention accurate CRM records when discussing stakeholder trust."],
    jobWinningAdvice: ["Prepare a 30-second closing line before the real interview."],
    specificPhrasesToUse: ["What I learned from that was...", "The practical impact was..."],
    thingsToAvoid: ["Overstating experience", "Long setup before the example"],
    followUpPracticeQuestions: ["Tell me about a time you handled competing priorities."],
    recommendedNextSteps: ["Practise again with a focus on STAR examples."],
  });
}

export function checkForUnsupportedClaims(generatedContent: string, verifiedContent = baseResumeMarkdown) {
  const riskyWords = ["certified", "licence", "degree", "managed a team of", "increased revenue", "healthcare expert", "SaaS expert"];
  const unsupportedClaims = riskyWords.filter(
    (word) => generatedContent.toLowerCase().includes(word) && !verifiedContent.toLowerCase().includes(word),
  );
  return unsupportedClaimsSchema.parse({
    hasUnsupportedClaims: unsupportedClaims.length > 0,
    unsupportedClaims,
    safeToApprove: unsupportedClaims.length === 0,
    notes: unsupportedClaims.length
      ? ["Remove or verify these claims before approval."]
      : ["No unsupported claims found by the local guard. Andrew should still review before approval."],
  });
}

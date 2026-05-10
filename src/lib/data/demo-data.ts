import { addBusinessDays, addDays, format } from "date-fns";

import { crmStatuses } from "@/lib/constants";

export type DemoJob = {
  id: string;
  title: string;
  company: string;
  recruiterName?: string;
  recruiterEmail?: string;
  source: string;
  location: string;
  salary?: string;
  status: (typeof crmStatuses)[number];
  matchScore: number;
  recommendation: string;
  dateFound: string;
  closingDate: string;
  appliedAt?: string;
  followUpDate?: string;
  originalJobUrl: string;
  jobDescriptionText: string;
  mustHaveCriteria: string[];
  desirableCriteria: string[];
  keywords: string[];
  resumePdf?: string;
  coverLetterPdf?: string;
  coverEmailPreview?: string;
  gmailDraftId?: string;
  mockInterviewScore?: number;
  notes: string;
};

export const andrewProfile = {
  fullName: "Andrew Taylor",
  email: "andrew@example.com",
  phone: "+61 400 000 000",
  location: "Sydney, NSW",
  workRights: "Australian work rights confirmed by Andrew",
  preferredJobTitles: ["Operations Coordinator", "Customer Success Specialist", "Business Support Officer"],
  preferredLocations: ["Sydney", "Remote", "Hybrid"],
  skills: [
    "Stakeholder communication",
    "Process improvement",
    "CRM administration",
    "Customer support",
    "Reporting",
    "Scheduling",
    "Microsoft 365",
  ],
  summary:
    "Andrew is a detail-oriented operations and customer support professional who wants job applications to stay truthful, targeted, and fast.",
};

export const baseResumeMarkdown = `# Andrew Taylor

Sydney, NSW | andrew@example.com | +61 400 000 000

## Professional Summary
Operations and customer support professional with experience coordinating stakeholders, improving administrative workflows, and keeping customer-facing processes organised.

## Core Skills
- Stakeholder communication
- CRM administration
- Customer support
- Process improvement
- Reporting and documentation
- Microsoft 365

## Experience
### Operations Assistant, Example Services
2022 - Present
- Coordinated daily customer support requests and escalated urgent issues to the right internal owners.
- Maintained CRM records, notes, follow-up tasks, and reporting fields with a strong attention to detail.
- Improved recurring admin checklists so handovers were clearer and less error-prone.

### Customer Support Representative, Sample Retail Group
2020 - 2022
- Responded to customer enquiries across email and phone in a calm, professional manner.
- Documented issues, resolutions, and follow-up actions in support systems.
- Worked with store and warehouse teams to resolve delivery and account questions.
`;

const today = new Date();

export const demoJobs: DemoJob[] = [
  {
    id: "job-ops-coordinator",
    title: "Operations Coordinator",
    company: "Northstar Health",
    recruiterName: "Mia Chen",
    recruiterEmail: "mia.chen@northstar.example",
    source: "Gmail alert",
    location: "Sydney, hybrid",
    salary: "$78k - $88k",
    status: "Ready to Apply",
    matchScore: 86,
    recommendation: "Strong fit",
    dateFound: format(today, "yyyy-MM-dd"),
    closingDate: format(addDays(today, 12), "yyyy-MM-dd"),
    followUpDate: format(addBusinessDays(today, 6), "yyyy-MM-dd"),
    originalJobUrl: "https://example.com/jobs/operations-coordinator",
    jobDescriptionText:
      "Coordinate operations workflows, maintain CRM records, prepare reports, support internal stakeholders, and improve handover processes.",
    mustHaveCriteria: ["CRM administration", "Stakeholder coordination", "Strong written communication"],
    desirableCriteria: ["Healthcare experience", "Reporting dashboards", "Hybrid team coordination"],
    keywords: ["operations", "CRM", "stakeholders", "reporting", "process improvement"],
    resumePdf: "/exports/Andrew Resume - Northstar Health - Operations Coordinator - v1.pdf",
    coverLetterPdf: "/exports/Andrew Cover Letter - Northstar Health - Operations Coordinator - v1.pdf",
    coverEmailPreview:
      "Please find attached my application for the Operations Coordinator role with Northstar Health.",
    gmailDraftId: "draft_pending_review",
    mockInterviewScore: 78,
    notes: "Strong alignment with CRM and process improvement. Prepare a clearer healthcare-adjacent example.",
  },
  {
    id: "job-cs-specialist",
    title: "Customer Success Specialist",
    company: "BrightDesk",
    source: "Manual",
    location: "Remote Australia",
    status: "Cover Letter Drafted",
    matchScore: 74,
    recommendation: "Good fit",
    dateFound: format(addDays(today, -1), "yyyy-MM-dd"),
    closingDate: format(addDays(today, 8), "yyyy-MM-dd"),
    originalJobUrl: "https://example.com/jobs/customer-success-specialist",
    jobDescriptionText:
      "Support business customers, manage onboarding checklists, write help content, and keep account records accurate.",
    mustHaveCriteria: ["Customer support", "Written communication", "Organised follow-up"],
    desirableCriteria: ["SaaS experience", "Knowledge base writing"],
    keywords: ["customer success", "onboarding", "support", "documentation"],
    coverLetterPdf: "/exports/Andrew Cover Letter - BrightDesk - Customer Success Specialist - v1.pdf",
    notes: "Needs Andrew to confirm whether he has SaaS-specific exposure before adding that language.",
  },
  {
    id: "job-business-support",
    title: "Business Support Officer",
    company: "NSW Community Programs",
    source: "SEEK",
    location: "Parramatta, NSW",
    status: "Interview Scheduled",
    matchScore: 81,
    recommendation: "Strong fit",
    dateFound: format(addDays(today, -5), "yyyy-MM-dd"),
    closingDate: format(addDays(today, 2), "yyyy-MM-dd"),
    appliedAt: format(addDays(today, -2), "yyyy-MM-dd"),
    followUpDate: format(addBusinessDays(today, 7), "yyyy-MM-dd"),
    originalJobUrl: "https://example.com/jobs/business-support-officer",
    jobDescriptionText:
      "Provide administrative support, coordinate records, respond to enquiries, and support program reporting.",
    mustHaveCriteria: ["Administration", "Records management", "Communication"],
    desirableCriteria: ["Government experience", "Selection criteria responses"],
    keywords: ["business support", "records", "administration", "programs"],
    resumePdf: "/exports/Andrew Resume - NSW Community Programs - Business Support Officer - v2.pdf",
    coverLetterPdf: "/exports/Andrew Cover Letter - NSW Community Programs - Business Support Officer - v2.pdf",
    mockInterviewScore: 84,
    notes: "Interview booked. Practise STAR story for records accuracy and stakeholder pressure.",
  },
];

export const generatedDocuments = [
  {
    id: "doc-resume-1",
    title: "Resume v1",
    job: "Northstar Health - Operations Coordinator",
    type: "resume",
    format: "pdf",
    approved: true,
    summary: "Emphasised CRM upkeep, stakeholder coordination, and handover improvements.",
  },
  {
    id: "doc-cover-1",
    title: "Cover Letter v1",
    job: "Northstar Health - Operations Coordinator",
    type: "cover_letter",
    format: "docx",
    approved: false,
    summary: "Drafted concise one-page letter; waiting on Andrew to confirm healthcare interest.",
  },
  {
    id: "doc-email-1",
    title: "Cover Email v1",
    job: "BrightDesk - Customer Success Specialist",
    type: "cover_email",
    format: "markdown",
    approved: false,
    summary: "Short recruiter email prepared; unsupported SaaS claim removed.",
  },
];

export const approvalItems = [
  {
    id: "approval-resume",
    title: "Approve tailored resume for Northstar Health",
    description: "Review the highlighted resume changes before this version can be attached to a draft.",
    riskLevel: "medium",
    status: "pending",
    type: "resume_changes",
  },
  {
    id: "approval-draft",
    title: "Create Gmail draft for Operations Coordinator",
    description: "Draft only. JobFlow Assistant will not send the email.",
    riskLevel: "high",
    status: "pending",
    type: "gmail_draft_creation",
  },
  {
    id: "approval-transcript",
    title: "Save mock interview transcript",
    description: "Transcript can be stored in the CRM only after Andrew approves.",
    riskLevel: "low",
    status: "pending",
    type: "transcript_consent",
  },
];

export const auditEvents = [
  "Job imported from Gmail alert",
  "Match score generated",
  "Resume draft created",
  "Unsupported claims check completed",
  "Cover email draft created",
  "Interview prep generated",
  "Mock interview feedback saved",
].map((detail, index) => ({
  id: `audit-${index + 1}`,
  action: detail.toUpperCase().replaceAll(" ", "_"),
  detail,
  createdAt: format(addDays(today, -index), "yyyy-MM-dd"),
}));

export const interviewPrep = {
  likelyQuestions: [
    "Tell me about your experience coordinating operational workflows.",
    "Describe a time you improved an administrative process.",
    "How do you keep CRM records accurate when work is busy?",
    "Why are you interested in this role and company?",
  ],
  talkingPoints: [
    "Use the CRM accuracy example from Example Services.",
    "Mention calm escalation and clear written handovers.",
    "Be honest that healthcare-specific exposure needs confirmation.",
  ],
  questionsAndrewCanAsk: [
    "What systems does the operations team use day to day?",
    "What would success look like in the first three months?",
    "Where are the biggest workflow bottlenecks today?",
  ],
  cheatSheet: {
    pitch: "I’m an operations and customer support professional who keeps teams organised, records accurate, and customer follow-up moving.",
    strengths: ["CRM discipline", "Calm stakeholder communication", "Process clarity"],
    avoid: ["Claiming healthcare experience without proof", "Overexplaining gaps", "Generic answers"],
    closing: "I’d be excited to bring that organised, practical support to this team.",
  },
};

export function getJobById(id: string) {
  return demoJobs.find((job) => job.id === id) ?? demoJobs[0];
}

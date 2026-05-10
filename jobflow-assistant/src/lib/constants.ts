export const crmStatuses = [
  "New",
  "Reviewed",
  "Shortlisted",
  "Resume Drafted",
  "Cover Letter Drafted",
  "Cover Email Drafted",
  "Ready to Apply",
  "Applied",
  "Follow-up Due",
  "Interview Scheduled",
  "Mock Interview Completed",
  "Offer",
  "Rejected",
  "Archived",
] as const;

export const approvalPrinciples = [
  "No email is ever sent automatically.",
  "No job application is ever submitted automatically.",
  "AI changes are shown before approval.",
  "Resume claims must be grounded in Andrew's verified profile or resume.",
  "Risky actions require explicit human approval and create an audit log.",
];

export const gmailDefaultQueries = [
  'newer_than:14d (job OR jobs OR application OR vacancy OR role OR opportunity)',
  'from:(seek.com.au OR linkedin.com OR indeed.com OR jora.com OR workforceaustralia.gov.au)',
  'subject:(job alert OR new jobs OR application OR opportunity OR vacancy)',
];

export const appRoutes = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs/kanban", label: "Kanban" },
  { href: "/jobs/table", label: "Table" },
  { href: "/jobs/calendar", label: "Calendar" },
  { href: "/resume-studio", label: "Resume Studio" },
  { href: "/cover-letter-studio", label: "Cover Letter" },
  { href: "/cover-email-studio", label: "Cover Email" },
  { href: "/documents", label: "Documents" },
  { href: "/approvals", label: "Approvals" },
  { href: "/interview-prep", label: "Interview Prep" },
  { href: "/mock-interview", label: "Mock Interview" },
  { href: "/guided-apply", label: "Guided Apply" },
  { href: "/gmail", label: "Gmail" },
  { href: "/follow-ups", label: "Follow-ups" },
  { href: "/settings", label: "Settings" },
  { href: "/audit-log", label: "Audit" },
];

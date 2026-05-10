import { gmailDefaultQueries } from "@/lib/constants";

export const gmailScopes = {
  ingestion: ["openid", "email", "profile", "https://www.googleapis.com/auth/gmail.readonly"],
  drafts: ["https://www.googleapis.com/auth/gmail.compose"],
};

export function explainGmailScopes(includeDrafts = false) {
  return [
    "Read job-alert emails matching Andrew's configured search queries.",
    "Detect confirmations, recruiter replies, interview invites, and rejections.",
    includeDrafts ? "Create Gmail drafts after Andrew approves every recipient, subject, body, and attachment." : "Draft creation scope is not requested until Andrew enables Gmail drafts.",
    "JobFlow Assistant never sends Gmail messages automatically.",
  ];
}

export function buildGmailSearchQuery(customQueries: string[] = []) {
  return [...gmailDefaultQueries, ...customQueries].join(" ");
}

export function createGmailDraftGuard(input: {
  resumeApproved: boolean;
  coverLetterApproved: boolean;
  coverEmailApproved: boolean;
  recipientApproved: boolean;
  attachmentsApproved: boolean;
}) {
  const missing = Object.entries(input)
    .filter(([, approved]) => !approved)
    .map(([key]) => key);

  return {
    allowed: missing.length === 0,
    missing,
    message:
      missing.length === 0
        ? "Draft creation is allowed. Sending is still blocked."
        : "Gmail draft creation is blocked until all approvals are complete.",
  };
}

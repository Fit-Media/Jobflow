import { addBusinessDays, isAfter, parseISO } from "date-fns";

import { crmStatuses } from "@/lib/constants";

export function suggestFollowUpDate(appliedAt: Date, closingDate?: Date | null) {
  const defaultDate = addBusinessDays(appliedAt, 6);
  if (closingDate && isAfter(closingDate, defaultDate)) {
    return addBusinessDays(closingDate, 1);
  }
  return defaultDate;
}

export function classifyFollowUp(dueDate: string, completedAt?: string | null) {
  if (completedAt) return "Completed";
  const due = parseISO(dueDate);
  const today = new Date();
  const diff = due.getTime() - today.getTime();
  if (diff < 0) return "Overdue";
  if (diff < 1000 * 60 * 60 * 24) return "Due today";
  if (diff < 1000 * 60 * 60 * 72) return "Due soon";
  return "Upcoming";
}

export function validateStatusTransition(fromStatus: string, toStatus: string) {
  const known = crmStatuses as readonly string[];
  return {
    valid: known.includes(fromStatus) && known.includes(toStatus),
    requiresApproval: ["Applied", "Rejected", "Offer", "Archived"].includes(toStatus),
    auditAction: `STATUS_${fromStatus.toUpperCase().replaceAll(" ", "_")}_TO_${toStatus.toUpperCase().replaceAll(" ", "_")}`,
  };
}

export function duplicateJobScore(input: {
  titleA: string;
  titleB: string;
  companyA: string;
  companyB: string;
  urlA?: string;
  urlB?: string;
}) {
  let score = 0;
  if (input.companyA.toLowerCase() === input.companyB.toLowerCase()) score += 40;
  if (input.titleA.toLowerCase() === input.titleB.toLowerCase()) score += 35;
  if (input.urlA && input.urlB && input.urlA === input.urlB) score += 25;
  return {
    score,
    possibleDuplicate: score >= 60,
  };
}

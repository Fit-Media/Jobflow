import { addDays } from "date-fns";
import { describe, expect, it } from "vitest";

import { classifyFollowUp, duplicateJobScore, suggestFollowUpDate, validateStatusTransition } from "../src/lib/crm/workflows";

describe("CRM workflows", () => {
  it("suggests follow-up after closing date when closing date is later", () => {
    const applied = new Date("2026-05-01");
    const closing = new Date("2026-05-20");
    expect(suggestFollowUpDate(applied, closing).getTime()).toBeGreaterThan(closing.getTime());
  });

  it("classifies overdue follow-ups", () => {
    expect(classifyFollowUp("2020-01-01")).toBe("Overdue");
    expect(classifyFollowUp("2020-01-01", "2020-01-02")).toBe("Completed");
  });

  it("requires approval for irreversible status transitions", () => {
    expect(validateStatusTransition("Ready to Apply", "Applied").requiresApproval).toBe(true);
  });

  it("detects likely duplicate jobs", () => {
    const score = duplicateJobScore({
      titleA: "Operations Coordinator",
      titleB: "Operations Coordinator",
      companyA: "Northstar Health",
      companyB: "Northstar Health",
      urlA: "https://example.com/job",
      urlB: "https://example.com/job",
    });
    expect(score.possibleDuplicate).toBe(true);
    expect(suggestFollowUpDate(addDays(new Date(), -1))).toBeInstanceOf(Date);
  });
});

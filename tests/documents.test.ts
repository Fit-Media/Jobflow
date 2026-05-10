import { describe, expect, it } from "vitest";

import { generateDocxFromMarkdown, generatePdfFromMarkdown } from "../src/lib/documents/generate";

describe("document exports", () => {
  it("creates DOCX and PDF buffers from markdown", async () => {
    const markdown = "# Andrew Taylor\n\n## Summary\nATS-friendly resume content.";
    const docx = await generateDocxFromMarkdown(markdown, "resume.docx");
    const pdf = await generatePdfFromMarkdown(markdown, "resume.pdf");

    expect(docx.mimeType).toContain("wordprocessingml");
    expect(docx.buffer.length).toBeGreaterThan(100);
    expect(pdf.mimeType).toBe("application/pdf");
    expect(pdf.buffer.length).toBeGreaterThan(100);
  });
});

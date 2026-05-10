import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type ExportedDocument = {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
};

function markdownToPlainLines(markdown: string) {
  return markdown
    .replace(/^### /gm, "")
    .replace(/^## /gm, "")
    .replace(/^# /gm, "")
    .replace(/^\- /gm, "• ")
    .split(/\r?\n/)
    .map((line) => line.trimEnd());
}

export async function generateDocxFromMarkdown(markdown: string, fileName: string): Promise<ExportedDocument> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: markdownToPlainLines(markdown).map(
          (line) =>
            new Paragraph({
              spacing: { after: line ? 120 : 80 },
              children: [new TextRun({ text: line || " ", bold: /^#/.test(line) })],
            }),
        ),
      },
    ],
  });

  return {
    fileName,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: Buffer.from(await Packer.toBuffer(doc)),
  };
}

export async function generatePdfFromMarkdown(markdown: string, fileName: string): Promise<ExportedDocument> {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const lines = markdownToPlainLines(markdown);
  let y = 800;

  for (const line of lines) {
    if (y < 60) {
      page = pdf.addPage([595.28, 841.89]);
      y = 800;
    }

    const isHeading = line.length > 0 && !line.startsWith("•") && lines.indexOf(line) < 8;
    page.drawText(line.slice(0, 100), {
      x: 50,
      y,
      size: isHeading ? 13 : 10,
      font: isHeading ? bold : font,
      color: rgb(0.08, 0.1, 0.16),
    });
    y -= line ? 18 : 10;
  }

  return {
    fileName,
    mimeType: "application/pdf",
    buffer: Buffer.from(await pdf.save()),
  };
}

export function createVersionName(kind: "Resume" | "Cover Letter" | "Cover Email", versionNumber: number) {
  return `${kind} v${versionNumber}`;
}

export function createExportFileName(kind: "Resume" | "Cover Letter", company: string, jobTitle: string, date: string, version: number, format: "pdf" | "docx") {
  const safe = `${company} - ${jobTitle}`.replace(/[\\/:*?"<>|]/g, "").trim();
  return `Andrew ${kind} - ${safe} - ${date} - v${version}.${format}`;
}

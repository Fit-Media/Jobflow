import { Download, FileCheck2, FilePlus2 } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { demoJobs } from "@/lib/data/demo-data";
import { demoGenerateCoverLetter } from "@/lib/ai/service";

export default function CoverLetterStudioPage() {
  const job = demoJobs[0];
  const result = demoGenerateCoverLetter(job);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Phase 1" title="Cover Letter Studio" description="Edit and approve a concise Australian English cover letter before it can be exported or attached." />
      <Card>
        <CardTitle>{job.company} · {job.title}</CardTitle>
        <CardDescription>{result.personalizationNotes.join(" ")}</CardDescription>
        <Textarea className="mt-4 min-h-[520px]" defaultValue={result.coverLetterMarkdown} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary"><FilePlus2 className="h-4 w-4" /> Save draft</Button>
          <Button variant="secondary">Create Google Doc</Button>
          <Button variant="secondary">Create Word document</Button>
          <Button variant="secondary"><Download className="h-4 w-4" /> Export DOCX</Button>
          <Button variant="secondary"><Download className="h-4 w-4" /> Export PDF</Button>
          <Button variant="approve"><FileCheck2 className="h-4 w-4" /> Approve version</Button>
        </div>
      </Card>
    </div>
  );
}

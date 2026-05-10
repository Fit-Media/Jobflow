import { CheckCircle2, Clipboard, MailPlus } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { demoJobs } from "@/lib/data/demo-data";
import { demoGenerateCoverEmail } from "@/lib/ai/service";

export default function CoverEmailStudioPage() {
  const job = demoJobs[0];
  const result = demoGenerateCoverEmail(job);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Phase 1" title="Cover Email Studio" description="Short email body, separate from the attached cover letter. Editable and approval-gated." />
      <Card>
        <CardTitle>{job.company} · {job.title}</CardTitle>
        <CardDescription>{result.personalizationNotes.join(" ")}</CardDescription>
        <div className="mt-5 space-y-4">
          <div><Label>Subject</Label><Input defaultValue={result.subject} /></div>
          <div><Label>Body</Label><Textarea defaultValue={result.body} className="min-h-[260px]" /></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary">Save draft</Button>
          <Button variant="approve"><CheckCircle2 className="h-4 w-4" /> Approve</Button>
          <Button variant="secondary"><MailPlus className="h-4 w-4" /> Use in Gmail draft</Button>
          <Button variant="secondary"><Clipboard className="h-4 w-4" /> Copy to clipboard</Button>
        </div>
      </Card>
    </div>
  );
}

import { Download, FileCheck2, FilePlus2, SplitSquareVertical } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { baseResumeMarkdown, demoJobs } from "@/lib/data/demo-data";
import { demoTailorResume } from "@/lib/ai/service";

export default function ResumeStudioPage() {
  const job = demoJobs[0];
  const result = demoTailorResume(job);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Phase 1" title="Resume Studio" description="Compare Andrew's original resume with a tailored draft. Approval locks a version for the selected application." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle>Original resume</CardTitle>
          <CardDescription>Verified source material.</CardDescription>
          <Textarea className="mt-4 min-h-[520px] font-mono text-xs" defaultValue={baseResumeMarkdown} />
        </Card>
        <Card>
          <CardTitle>Tailored resume for {job.company}</CardTitle>
          <CardDescription>No unsupported claims were added by the local guard.</CardDescription>
          <Textarea className="mt-4 min-h-[520px] font-mono text-xs" defaultValue={result.tailoredResumeMarkdown} />
        </Card>
      </div>
      <Card>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <CardTitle>Change summary</CardTitle>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {result.changeSummary.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
          <div>
            <CardTitle>Keywords emphasised</CardTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.keywordsEmphasized.map((keyword) => <Badge key={keyword} className="border-blue-200 bg-blue-50 text-blue-800">{keyword}</Badge>)}
            </div>
          </div>
          <div>
            <CardTitle>Actions</CardTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary"><SplitSquareVertical className="h-4 w-4" /> Accept all</Button>
              <Button variant="secondary">Reject all</Button>
              <Button variant="secondary"><FilePlus2 className="h-4 w-4" /> Save draft</Button>
              <Button variant="secondary"><Download className="h-4 w-4" /> Export DOCX</Button>
              <Button variant="secondary"><Download className="h-4 w-4" /> Export PDF</Button>
              <Button variant="approve"><FileCheck2 className="h-4 w-4" /> Approve version</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

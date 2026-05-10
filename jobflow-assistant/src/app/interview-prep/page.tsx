import { Lightbulb, MessageCircleQuestion } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { interviewPrep } from "@/lib/data/demo-data";

export default function InterviewPrepPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Phase 3" title="Interview prep pack" description="Job-specific interview intelligence grounded in Andrew's verified resume and the selected job ad." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Likely questions</CardTitle>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {interviewPrep.likelyQuestions.map((question) => (
              <div key={question} className="rounded-md border border-slate-200 p-3 text-sm"><MessageCircleQuestion className="mb-2 h-4 w-4" />{question}</div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Cheat sheet</CardTitle>
          <CardDescription className="mt-2">{interviewPrep.cheatSheet.pitch}</CardDescription>
          <div className="mt-4 space-y-3">
            <div><div className="text-sm font-medium">3 key strengths</div><div className="mt-2 flex flex-wrap gap-2">{interviewPrep.cheatSheet.strengths.map((x) => <Badge key={x} className="border-emerald-200 bg-emerald-50 text-emerald-800">{x}</Badge>)}</div></div>
            <div><div className="text-sm font-medium">Avoid</div><ul className="mt-2 space-y-1 text-sm text-slate-600">{interviewPrep.cheatSheet.avoid.map((x) => <li key={x}>• {x}</li>)}</ul></div>
            <div className="rounded-md bg-slate-50 p-3 text-sm"><Lightbulb className="mb-2 h-4 w-4" />{interviewPrep.cheatSheet.closing}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

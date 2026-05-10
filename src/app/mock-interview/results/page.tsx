import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { demoPostInterviewFeedback } from "@/lib/ai/service";

export default function MockInterviewResultsPage() {
  const feedback = demoPostInterviewFeedback("Andrew gave a structured answer about CRM accuracy and process improvement.");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Interview results" title="Mock interview feedback" description="Honest, encouraging coaching saved against the job after Andrew approves transcript storage." />
      <Card>
        <div className="text-5xl font-semibold">{feedback.overallScore}</div>
        <CardDescription className="mt-2">{feedback.summary}</CardDescription>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>Strengths</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">{feedback.strengths.map((item) => <Badge key={item} className="border-emerald-200 bg-emerald-50 text-emerald-800">{item}</Badge>)}</div>
        </Card>
        <Card>
          <CardTitle>Improve next</CardTitle>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">{feedback.improvementAreas.map((item) => <li key={item}>• {item}</li>)}</ul>
        </Card>
        <Card>
          <CardTitle>Ready / Needs more practice</CardTitle>
          <CardDescription className="mt-3">
            Needs more practice on specificity and STAR structure before a high-stakes interview. The core examples are relevant.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>Practise again</CardTitle>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {feedback.followUpPracticeQuestions.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </Card>
      </div>
    </div>
  );
}

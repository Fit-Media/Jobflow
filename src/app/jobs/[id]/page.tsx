import Link from "next/link";
import { Archive, FileText, MailPlus, MessageSquareText, Send, WandSparkles } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { auditEvents, getJobById } from "@/lib/data/demo-data";
import { demoGenerateCoverEmail, demoGenerateCoverLetter, demoGenerateInterviewPrep, demoScoreJobMatch, demoTailorResume } from "@/lib/ai/service";
import { statusTone } from "@/lib/utils";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJobById(id);
  const match = demoScoreJobMatch(job);
  const resume = demoTailorResume(job);
  const coverLetter = demoGenerateCoverLetter(job);
  const coverEmail = demoGenerateCoverEmail(job);
  const prep = demoGenerateInterviewPrep(job);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Job detail"
        title={`${job.title} at ${job.company}`}
        description={job.notes}
        actions={
          <>
            <Link href="/resume-studio" className={buttonClassName()}><WandSparkles className="h-4 w-4" /> Tailor resume</Link>
            <Link href="/mock-interview" className={buttonClassName({ variant: "secondary" })}><MessageSquareText className="h-4 w-4" /> Start mock interview</Link>
          </>
        }
      />
      <section className="grid gap-4 md:grid-cols-4">
        <Card><CardTitle>{job.matchScore}%</CardTitle><CardDescription>{match.recommendation}</CardDescription></Card>
        <Card><CardTitle>{job.source}</CardTitle><CardDescription>Source</CardDescription></Card>
        <Card><CardTitle>{job.closingDate}</CardTitle><CardDescription>Closing date</CardDescription></Card>
        <Card><Badge className={statusTone(job.status)}>{job.status}</Badge><CardDescription className="mt-3">Current status</CardDescription></Card>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardTitle>Original job ad</CardTitle>
            <CardDescription className="mt-3">{job.jobDescriptionText}</CardDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              {job.keywords.map((keyword) => <Badge key={keyword} className="border-slate-200 bg-slate-50 text-slate-700">{keyword}</Badge>)}
            </div>
          </Card>
          <Card>
            <CardTitle>Application documents</CardTitle>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-slate-200 p-3"><FileText className="mb-2 h-4 w-4" />Resume v1<br /><span className="text-sm text-slate-500">{resume.changeSummary[0]}</span></div>
              <div className="rounded-md border border-slate-200 p-3"><FileText className="mb-2 h-4 w-4" />Cover Letter v1<br /><span className="text-sm text-slate-500">{coverLetter.personalizationNotes[0]}</span></div>
              <div className="rounded-md border border-slate-200 p-3"><MailPlus className="mb-2 h-4 w-4" />Cover Email v1<br /><span className="text-sm text-slate-500">{coverEmail.subject}</span></div>
            </div>
          </Card>
          <Card>
            <CardTitle>Interview prep</CardTitle>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {prep.likelyQuestions.map((question) => <div key={question} className="rounded-md bg-slate-50 p-3 text-sm">{question}</div>)}
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardTitle>Quick actions</CardTitle>
            <div className="mt-4 grid gap-2">
              {["Generate Cover Letter", "Generate Cover Email", "Create Gmail Draft", "Guided Apply", "Generate Screening Answers", "Generate Follow-Up", "Mark Applied", "Archive"].map((action) => (
                <button key={action} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50">
                  {action.includes("Gmail") ? <Send className="h-4 w-4" /> : action === "Archive" ? <Archive className="h-4 w-4" /> : <WandSparkles className="h-4 w-4" />}
                  {action}
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <CardTitle>Timeline</CardTitle>
            <div className="mt-4 space-y-3">
              {auditEvents.map((event) => (
                <div key={event.id} className="border-l-2 border-slate-200 pl-3 text-sm">
                  <div className="font-medium">{event.detail}</div>
                  <div className="text-slate-500">{event.createdAt}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

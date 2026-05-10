import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole, Mic, SendHorizonal } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { SafetyStrip } from "@/components/jobflow/safety-strip";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { approvalPrinciples } from "@/lib/constants";

export default function Home() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Private assistant, not an autopilot"
        title="JobFlow Assistant"
        description="A full-stack workspace for Andrew to turn job alerts into reviewed applications, versioned documents, follow-ups, and job-specific interview practice."
        actions={
          <>
            <Link href="/onboarding" className={buttonClassName()}>
              Start onboarding <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className={buttonClassName({ variant: "secondary" })}>
              Open dashboard
            </Link>
          </>
        }
      />
      <SafetyStrip />
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: CheckCircle2,
            title: "Tailor honestly",
            text: "Generate match scores, resume drafts, cover letters, and cover emails while flagging unsupported claims.",
          },
          {
            icon: SendHorizonal,
            title: "Draft, never send",
            text: "Create Gmail drafts only after Andrew approves content, recipient, subject, attachments, and document versions.",
          },
          {
            icon: Mic,
            title: "Practise interviews",
            text: "Run text or voice mock interviews tied to a specific job, then save feedback only with consent.",
          },
        ].map((item) => (
          <Card key={item.title}>
            <item.icon className="mb-4 h-6 w-6 text-slate-700" />
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.text}</CardDescription>
          </Card>
        ))}
      </section>
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <LockKeyhole className="h-5 w-5" />
          <CardTitle>Human approval principles</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2">
          {approvalPrinciples.map((principle) => (
            <Badge key={principle} className="border-slate-200 bg-slate-50 text-slate-700">
              {principle}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}

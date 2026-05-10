import Link from "next/link";
import { Bell, BriefcaseBusiness, CalendarClock, FileCheck2, MessageSquareWarning, Trophy } from "lucide-react";

import { JobCard } from "@/components/jobflow/job-card";
import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { approvalItems, auditEvents, demoJobs } from "@/lib/data/demo-data";

export default function DashboardPage() {
  const metrics = [
    { title: "New jobs", value: "12", icon: BriefcaseBusiness, text: "from configured Gmail queries" },
    { title: "Best matches", value: "3", icon: Trophy, text: "above 80% match" },
    { title: "Ready for review", value: "5", icon: FileCheck2, text: "documents or cover emails waiting" },
    { title: "Follow-ups due", value: "2", icon: CalendarClock, text: "today or overdue" },
    { title: "Needs attention", value: "4", icon: MessageSquareWarning, text: "reply, approval, or missing info" },
    { title: "Interviews", value: "1", icon: Bell, text: "prep recommended" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Andrew's job command centre"
        description="A calm overview of what needs review, what is ready to apply, and where interview preparation will help most."
        actions={<Link href="/resume-studio" className={buttonClassName()}>Create application pack</Link>}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <metric.icon className="mb-4 h-5 w-5 text-slate-600" />
            <div className="text-3xl font-semibold">{metric.value}</div>
            <CardTitle className="mt-2">{metric.title}</CardTitle>
            <CardDescription>{metric.text}</CardDescription>
          </Card>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Priority opportunities</h2>
          {demoJobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
        <div className="space-y-4">
          <Card>
            <CardTitle>Approval queue</CardTitle>
            <CardDescription>Nothing risky moves forward until Andrew approves it.</CardDescription>
            <div className="mt-4 space-y-3">
              {approvalItems.map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 p-3">
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.description}</div>
                  <Badge className="mt-3 border-amber-200 bg-amber-50 text-amber-800">{item.riskLevel}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardTitle>Recent activity</CardTitle>
            <div className="mt-4 space-y-3">
              {auditEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="text-sm">
                  <div className="font-medium text-slate-900">{event.detail}</div>
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

import { CalendarDays } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { demoJobs } from "@/lib/data/demo-data";

export default function CalendarPage() {
  const events = demoJobs.flatMap((job) => [
    { job, date: job.closingDate, type: "Closing date" },
    ...(job.followUpDate ? [{ job, date: job.followUpDate, type: "Follow-up" }] : []),
    ...(job.status === "Interview Scheduled" ? [{ job, date: job.followUpDate ?? job.closingDate, type: "Interview" }] : []),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="CRM" title="Calendar" description="Follow-ups, closing dates, interviews, and mock interview reminders in one place." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <Card key={`${event.job.id}-${event.type}`}>
            <CalendarDays className="mb-4 h-5 w-5 text-slate-600" />
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">{event.type}</Badge>
            <CardTitle className="mt-3">{event.date}</CardTitle>
            <CardDescription>{event.job.company} · {event.job.title}</CardDescription>
          </Card>
        ))}
      </div>
    </div>
  );
}

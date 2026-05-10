import Link from "next/link";
import { CalendarDays, ExternalLink, FileText, Mail, MessageSquareText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DemoJob } from "@/lib/data/demo-data";
import { formatPercent, statusTone } from "@/lib/utils";

export function JobCard({ job }: { job: DemoJob }) {
  return (
    <Card className="space-y-4">
      <CardHeader className="mb-0">
        <div>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>{job.company} · {job.location}</CardDescription>
        </div>
        <Badge className={statusTone(job.status)}>{job.status}</Badge>
      </CardHeader>
      <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <span>Match: <strong className="text-slate-950">{formatPercent(job.matchScore)}</strong></span>
        <span>Source: {job.source}</span>
        <span>Closing: {job.closingDate}</span>
        <span>Mock score: {job.mockInterviewScore ? `${job.mockInterviewScore}/100` : "Not practised"}</span>
        <span>Follow-up: {job.followUpDate ?? "Not set"}</span>
      </div>
      <p className="line-clamp-3 text-sm leading-6 text-slate-600">{job.jobDescriptionText}</p>
      <div className="flex flex-wrap gap-2">
        <Link href={`/jobs/${job.id}`} className={buttonClassName({ variant: "secondary", className: "h-8 px-3 text-xs" })}>
          <FileText className="h-3.5 w-3.5" /> Detail
        </Link>
        <Button variant="ghost" size="sm"><ExternalLink className="h-3.5 w-3.5" /> Open link</Button>
        <Button variant="ghost" size="sm"><Mail className="h-3.5 w-3.5" /> Cover email</Button>
        <Button variant="ghost" size="sm"><MessageSquareText className="h-3.5 w-3.5" /> Mock interview</Button>
        <Button variant="ghost" size="sm"><CalendarDays className="h-3.5 w-3.5" /> Follow-up</Button>
      </div>
    </Card>
  );
}

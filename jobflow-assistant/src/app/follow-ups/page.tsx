import { MailPlus } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { demoJobs } from "@/lib/data/demo-data";
import { classifyFollowUp } from "@/lib/crm/workflows";
import { statusTone } from "@/lib/utils";

export default function FollowUpsPage() {
  const jobs = demoJobs.filter((job) => job.followUpDate);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="CRM" title="Follow-ups" description="Follow-ups are suggested 5-7 business days after application, or after the closing date when that makes more sense." />
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Badge className={statusTone(classifyFollowUp(job.followUpDate!))}>{classifyFollowUp(job.followUpDate!)}</Badge>
                <CardTitle className="mt-3">{job.company} · {job.title}</CardTitle>
                <CardDescription>Suggested follow-up: {job.followUpDate}</CardDescription>
              </div>
              <Button variant="secondary"><MailPlus className="h-4 w-4" /> Create follow-up draft</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

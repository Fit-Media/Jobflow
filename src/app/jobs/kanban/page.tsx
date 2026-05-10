import { JobCard } from "@/components/jobflow/job-card";
import { PageHeader } from "@/components/jobflow/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { crmStatuses } from "@/lib/constants";
import { demoJobs } from "@/lib/data/demo-data";

export default function KanbanPage() {
  const visibleStatuses = crmStatuses.filter((status) => demoJobs.some((job) => job.status === status));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Kanban board"
        description="Move opportunities through the workflow. Statuses like Applied, Rejected, Offer, and Archived require approval and audit logging."
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {visibleStatuses.map((status) => (
          <Card key={status} className="bg-slate-100/60">
            <CardTitle className="mb-4">{status}</CardTitle>
            <div className="space-y-3">
              {demoJobs.filter((job) => job.status === status).map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";

import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { demoJobs } from "@/lib/data/demo-data";
import { statusTone } from "@/lib/utils";

export default function JobTablePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Table view"
        description="Search, compare, and filter job applications by source, status, match score, dates, documents, and interview state."
      />
      <Card>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Input placeholder="Search company, title, recruiter, notes" />
          <Input placeholder="Status" />
          <Input placeholder="Source" />
          <Input placeholder="Minimum match score" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Company</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Match</th>
                <th className="py-3 pr-4">Closing</th>
                <th className="py-3 pr-4">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {demoJobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-medium"><Link href={`/jobs/${job.id}`}>{job.title}</Link></td>
                  <td className="py-3 pr-4">{job.company}</td>
                  <td className="py-3 pr-4"><Badge className={statusTone(job.status)}>{job.status}</Badge></td>
                  <td className="py-3 pr-4">{job.matchScore}%</td>
                  <td className="py-3 pr-4">{job.closingDate}</td>
                  <td className="py-3 pr-4">{job.followUpDate ?? "Not set"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

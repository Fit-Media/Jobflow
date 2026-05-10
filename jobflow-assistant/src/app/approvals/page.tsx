import { Check, Edit3, X } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { approvalItems } from "@/lib/data/demo-data";
import { riskTone } from "@/lib/utils";

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Approval Queue" title="Human approval before action" description="Risky actions stay pending until Andrew approves, edits, or rejects them. Every decision creates an audit log." />
      <div className="space-y-4">
        {approvalItems.map((item) => (
          <Card key={item.id}>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${riskTone(item.riskLevel)}`}>{item.riskLevel} risk</span>
                <CardTitle className="mt-3">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="approve"><Check className="h-4 w-4" /> Approve</Button>
                <Button variant="secondary"><Edit3 className="h-4 w-4" /> Edit</Button>
                <Button variant="danger"><X className="h-4 w-4" /> Reject</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

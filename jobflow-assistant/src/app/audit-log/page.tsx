import { PageHeader } from "@/components/jobflow/page-header";
import { Card } from "@/components/ui/card";
import { auditEvents } from "@/lib/data/demo-data";

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Audit" title="Complete activity history" description="Every approval decision, AI generation, export, draft creation, status suggestion, and sensitive action is recorded." />
      <Card>
        <div className="space-y-4">
          {auditEvents.map((event) => (
            <div key={event.id} className="grid gap-2 border-b border-slate-100 pb-4 text-sm md:grid-cols-[180px_1fr_180px]">
              <span className="font-mono text-xs text-slate-500">{event.action}</span>
              <span>{event.detail}</span>
              <span className="text-slate-500">{event.createdAt}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

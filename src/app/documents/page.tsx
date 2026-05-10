import { FileText } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { generatedDocuments } from "@/lib/data/demo-data";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Documents" title="Versioned application documents" description="Every resume, cover letter, cover email, and selection criteria file keeps its own version history. Submitted versions are never overwritten." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {generatedDocuments.map((doc) => (
          <Card key={doc.id}>
            <FileText className="mb-4 h-5 w-5 text-slate-600" />
            <CardTitle>{doc.title}</CardTitle>
            <CardDescription>{doc.job}</CardDescription>
            <p className="mt-3 text-sm leading-6 text-slate-600">{doc.summary}</p>
            <div className="mt-4 flex gap-2">
              <Badge className="border-slate-200 bg-slate-50 text-slate-700">{doc.format}</Badge>
              <Badge className={doc.approved ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}>
                {doc.approved ? "Approved" : "Draft"}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

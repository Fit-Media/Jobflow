import { AlertTriangle, CheckCircle2, MousePointerClick } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { guidedApplyFinalNotice } from "@/lib/integrations/browser-assistant";

export default function GuidedApplyPage() {
  const mappings = ["First name", "Last name", "Email", "Phone", "LinkedIn", "Resume upload", "Cover letter upload", "Work rights"];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Phase 8" title="Guided Apply" description="A visible Playwright browser assistant can suggest mappings, fill approved fields, upload approved files, and stop before final submission." />
      <Card className="border-amber-200 bg-amber-50">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <p className="text-sm font-medium text-amber-900">{guidedApplyFinalNotice()}</p>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Approved field mappings</CardTitle>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {mappings.map((mapping) => (
              <div key={mapping} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm">
                {mapping}
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
            ))}
          </div>
          <Button className="mt-4"><MousePointerClick className="h-4 w-4" /> Launch visible browser</Button>
        </Card>
        <Card>
          <CardTitle>Hard stops</CardTitle>
          <CardDescription className="mt-3">JobFlow stops on login, CAPTCHA, MFA, legal declarations, uncertainty, or any final Submit/Apply/Send/Confirm button.</CardDescription>
        </Card>
      </div>
    </div>
  );
}

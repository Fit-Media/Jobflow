import { KeyRound, Lock, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { gmailDefaultQueries } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="Model, privacy, and integrations" description="Model names are configurable. Missing OpenAI model variables produce setup errors instead of hidden fallbacks." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SlidersHorizontal className="mb-4 h-5 w-5 text-slate-600" />
          <CardTitle>AI models</CardTitle>
          <div className="mt-4 space-y-4">
            <div><Label>OPENAI_MODEL</Label><Input placeholder="Required for live generation" /></div>
            <div><Label>OPENAI_INTERVIEW_MODEL</Label><Input placeholder="Optional deeper interview feedback model" /></div>
            <div><Label>OPENAI_REALTIME_MODEL</Label><Input placeholder="Required for live voice mode" /></div>
          </div>
        </Card>
        <Card>
          <Lock className="mb-4 h-5 w-5 text-slate-600" />
          <CardTitle>Data and privacy</CardTitle>
          <CardDescription className="mt-2">Disconnect accounts, revoke tokens, delete local records, and optionally remove app-created Drive or OneDrive files.</CardDescription>
          <Button className="mt-4" variant="danger">Delete all my data</Button>
        </Card>
        <Card>
          <KeyRound className="mb-4 h-5 w-5 text-slate-600" />
          <CardTitle>Gmail filters</CardTitle>
          <div className="mt-4 space-y-3">{gmailDefaultQueries.map((query) => <Input key={query} defaultValue={query} />)}</div>
        </Card>
      </div>
    </div>
  );
}

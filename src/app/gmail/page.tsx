import { MailSearch } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { gmailDefaultQueries } from "@/lib/constants";
import { buildGmailSearchQuery, explainGmailScopes } from "@/lib/integrations/gmail";

export default function GmailPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Phase 5 / 7" title="Gmail job alerts" description="Read-only scanning is separated from Gmail draft creation. Drafts still never send automatically." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Search filters</CardTitle>
          <CardDescription>Default filters are intentionally scoped to job-search content.</CardDescription>
          <div className="mt-4 space-y-3">
            {gmailDefaultQueries.map((query) => <Input key={query} defaultValue={query} />)}
            <Input placeholder="Add custom Gmail query" />
          </div>
          <p className="mt-4 rounded-md bg-slate-50 p-3 font-mono text-xs text-slate-600">{buildGmailSearchQuery()}</p>
          <Button className="mt-4"><MailSearch className="h-4 w-4" /> Scan job alerts</Button>
        </Card>
        <Card>
          <CardTitle>Scopes explained</CardTitle>
          <div className="mt-4 space-y-3">
            {explainGmailScopes(false).map((scope) => (
              <div key={scope} className="rounded-md border border-slate-200 p-3 text-sm text-slate-600">{scope}</div>
            ))}
          </div>
          <Badge className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-800">OAuth only. No Gmail password.</Badge>
        </Card>
      </div>
    </div>
  );
}

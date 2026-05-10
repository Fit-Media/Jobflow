import { CheckCircle2, Cloud, Mail, UploadCloud } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { andrewProfile } from "@/lib/data/demo-data";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Onboarding"
        title="Set Andrew's source of truth"
        description="Profile and resume data become the boundary for every resume edit, cover letter, screening answer, and interview coaching suggestion."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Verified facts only. The AI can emphasise these, but cannot invent new ones.</CardDescription>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div><Label>Full name</Label><Input defaultValue={andrewProfile.fullName} /></div>
            <div><Label>Email</Label><Input defaultValue={andrewProfile.email} /></div>
            <div><Label>Phone</Label><Input defaultValue={andrewProfile.phone} /></div>
            <div><Label>Location</Label><Input defaultValue={andrewProfile.location} /></div>
            <div className="md:col-span-2"><Label>Work rights</Label><Input defaultValue={andrewProfile.workRights} /></div>
            <div className="md:col-span-2"><Label>Summary</Label><Textarea defaultValue={andrewProfile.summary} /></div>
          </div>
          <div className="mt-5 flex gap-2">
            <Button><CheckCircle2 className="h-4 w-4" /> Confirm source of truth</Button>
            <Button variant="secondary"><UploadCloud className="h-4 w-4" /> Upload resume</Button>
          </div>
        </Card>
        <Card>
          <CardTitle>Optional connections</CardTitle>
          <CardDescription>Connectors are staged so Andrew can grant only the scopes needed for each feature.</CardDescription>
          <div className="mt-5 space-y-3">
            <Button className="w-full" variant="secondary"><Mail className="h-4 w-4" /> Connect Gmail read-only</Button>
            <Button className="w-full" variant="secondary"><UploadCloud className="h-4 w-4" /> Connect Google Drive</Button>
            <Button className="w-full" variant="secondary"><Cloud className="h-4 w-4" /> Connect Microsoft</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Bot, Mic, Pause, RotateCcw, Square, UserRoundCheck, Video, Volume2 } from "lucide-react";

import { PageHeader } from "@/components/jobflow/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";
import { getDidAvatarSetupStatus, getRealtimeSetupStatus, voiceConsentChecklist } from "@/lib/integrations/realtime";
import { getInterviewProviderStatuses } from "@/lib/interview/providers";

export default function MockInterviewPage() {
  const realtime = getRealtimeSetupStatus();
  const did = getDidAvatarSetupStatus();
  const providers = getInterviewProviderStatuses();
  const consent = voiceConsentChecklist({
    microphoneApproved: false,
    saveTranscriptApproved: false,
    saveAudioApproved: false,
    saveVideoApproved: false,
  });
  const interviewTypes = ["Recruiter screen", "Hiring manager", "Government panel", "Behavioural", "Technical", "Final round"];
  const difficulties = ["Easy", "Standard", "Challenging", "Tough but fair"];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Phase 3 / 4 / optional avatar"
        title="Live Mock Interview Coach"
        description="Practise a role-specific interview by text, voice, or optional AI-generated avatar. Feedback is saved to CRM only when Andrew approves transcript storage."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>Choose interview mode</CardTitle>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  {provider.id === "visual_avatar" ? <Video className="h-4 w-4" /> : provider.id === "voice" ? <Mic className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  {provider.label}
                </div>
                <Badge className={provider.available ? "mt-3 border-emerald-200 bg-emerald-50 text-emerald-800" : "mt-3 border-amber-200 bg-amber-50 text-amber-800"}>
                  {provider.available ? "Available" : `Fallback to ${provider.fallbackMode ?? "text"}`}
                </Badge>
                <p className="mt-3 text-xs leading-5 text-slate-600">{provider.message}</p>
              </div>
            ))}
          </div>
          <CardTitle className="mt-6">Interview setup</CardTitle>
          <div className="flex flex-wrap gap-2">
            {[...interviewTypes, ...difficulties, "10 minutes", "20 minutes", "30 minutes"].map((item) => (
              <Badge key={item} className="border-slate-200 bg-slate-50 text-slate-700">{item}</Badge>
            ))}
          </div>
          <Card className="mt-5 border-blue-200 bg-blue-50 shadow-none">
            <div className="flex gap-3">
              <UserRoundCheck className="h-5 w-5 text-blue-700" />
              <p className="text-sm leading-6 text-blue-950">
                Visual avatar mode is clearly labelled as AI-generated. It must not use Andrew&apos;s face or voice and must not impersonate real hiring managers, recruiters, or panel members.
              </p>
            </div>
          </Card>
          <CardTitle className="mt-5">Current question</CardTitle>
          <CardDescription className="mt-2 text-base">Thanks for joining, Andrew. To start, what interests you about this Operations Coordinator role?</CardDescription>
          <Textarea className="mt-4 min-h-[220px]" placeholder="Andrew's answer..." />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button><Volume2 className="h-4 w-4" /> Submit answer</Button>
            <Button variant="secondary"><Pause className="h-4 w-4" /> Pause</Button>
            <Button variant="secondary"><RotateCcw className="h-4 w-4" /> Restart</Button>
            <Button variant="danger"><Square className="h-4 w-4" /> End & get feedback</Button>
          </div>
        </Card>
        <Card>
          <CardTitle>Realtime readiness</CardTitle>
          <CardDescription className="mt-2">{realtime.message}</CardDescription>
          <CardDescription className="mt-2">{did.message}</CardDescription>
          <div className="mt-4 space-y-3">
            {consent.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-md border border-slate-200 p-3 text-sm">
                {item.label}
                <Badge className={item.approved ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}>{item.required ? "Required" : "Optional"}</Badge>
              </div>
            ))}
          </div>
          <Button className="mt-4" variant="secondary"><Mic className="h-4 w-4" /> Request microphone permission</Button>
          <div className="mt-5 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            Post-interview reports include score, best and weakest answers, improved answers, confidence, clarity, specificity, STAR quality, job-criteria match, phrases to use, habits to avoid, and a Ready / Needs more practice recommendation.
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Activity, AlertTriangle, BarChart3, CheckCircle2, Download, MessageSquare, TrendingDown, Trophy, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoParticipants, seedClubs } from "@/lib/clubs/seed";
import { cn } from "@/lib/utils";

function metric(label: string, value: string | number, detail: string) {
  return (
    <Card className="interactive-lift">
      <p className="text-sm font-bold text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold text-zinc-500">{detail}</p>
    </Card>
  );
}

function AdminShell({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(190,242,100,0.16),transparent_28%),radial-gradient(circle_at_88%_6%,rgba(45,212,191,0.12),transparent_26%),linear-gradient(180deg,#fafafa_0%,#f4f4f5_100%)] p-5 text-zinc-950">
      <section className="mx-auto grid max-w-7xl gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-zinc-950 p-5 text-white shadow-2xl shadow-zinc-950/15">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">{label}</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">Progress patterns, check-in opportunities and commercial signals without exposing private workbook content.</p>
          </div>
          <Button><Download size={18} />Export CSV</Button>
        </header>
        {children}
      </section>
    </main>
  );
}

function InsightCard({ icon: Icon, title, copy, tone = "default" }: { icon: typeof Activity; title: string; copy: string; tone?: "default" | "warning" | "success" | "teal" }) {
  return (
    <Card className={cn(
      "interactive-lift min-h-36",
      tone === "warning" && "border-amber-200 bg-amber-50",
      tone === "success" && "border-lime-200 bg-lime-50",
      tone === "teal" && "border-teal-100 bg-teal-50",
    )}>
      <Icon className={cn("text-zinc-900", tone === "warning" && "text-amber-700", tone === "success" && "text-lime-800", tone === "teal" && "text-teal-700")} size={22} />
      <h2 className="mt-4 font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-700">{copy}</p>
    </Card>
  );
}

export function PlatformDashboard() {
  const activeClubs = seedClubs.filter((club) => club.status === "active");
  const coachingInterest = demoParticipants.filter((participant) => participant.coachingInterestSelected).length;
  const completed = demoParticipants.filter((participant) => participant.challengeStatus === "completed_30").length;

  return (
    <AdminShell label="Platform Admin" title="Platform Dashboard">
      <div className="grid gap-3 md:grid-cols-4">
        {metric("Active clubs", activeClubs.length, "Live challenge access")}
        {metric("Participants", demoParticipants.length, "Across demo clubs")}
        {metric("Completion rate", `${Math.round((completed / demoParticipants.length) * 100)}%`, "30-day finishers")}
        {metric("Coaching interest", coachingInterest, "Follow-up opportunities")}
        {metric("Check-in rate", "68%", "Weekly progress vault demo")}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black">Club leaderboard</h2>
            <Trophy className="text-lime-700" />
          </div>
          <div className="mt-4 grid gap-2">
            {seedClubs.map((club, index) => (
              <div key={club.clubId} className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-black">{club.clubName}</p>
                  <p className="text-sm text-zinc-600">{club.licenceStatus} licence</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-zinc-700">{index === 0 ? "Best completion" : "Active campaign"}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black">Commercial recommendations</h2>
            <BarChart3 className="text-teal-700" />
          </div>
          <div className="mt-4 grid gap-3">
            <InsightCard icon={MessageSquare} title="Coaching pipeline" copy="Participants selecting coaching/PT should be routed into a staff follow-up list before their momentum cools." tone="teal" />
            <InsightCard icon={TrendingDown} title="Launch quality signal" copy="Strong code unlocks but weak Day 1 completion usually means staff need a clearer handover script." tone="warning" />
          </div>
        </Card>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <InsightCard icon={Trophy} title="Best performing club this month" copy="Club Alpha is leading the demo leaderboard for starts and completion." tone="success" />
        <InsightCard icon={AlertTriangle} title="Clubs needing support" copy="Watch clubs with no recent participants, low Day 1 completion or poor Week 1 review completion." tone="warning" />
        <InsightCard icon={Activity} title="Most common drop-off" copy="The demo data points to early challenge friction around Day 6 and the first weekly review." />
        <InsightCard icon={Users} title="Suggested upsell opportunities" copy="Coaching/PT interest is visible without exposing private workbook content." tone="teal" />
        <InsightCard icon={BarChart3} title="Progress Vault opportunity" copy="Track check-in completion, photo usage and coach review requests without exposing exact measurements or photos." tone="teal" />
      </div>
    </AdminShell>
  );
}

export function ClubDashboard() {
  const inactive3 = demoParticipants.filter((participant) => participant.inactiveRiskLevel !== "low");
  const completed = demoParticipants.filter((participant) => participant.challengeStatus === "completed_30");
  const coachingInterest = demoParticipants.filter((participant) => participant.coachingInterestSelected);

  return (
    <AdminShell label="Club Admin" title="Club Dashboard">
      <div className="grid gap-3 md:grid-cols-4">
        {metric("Total participants", demoParticipants.length, "First-name-only")}
        {metric("Active participants", demoParticipants.length - inactive3.length, "Used app in last 3 days")}
        {metric("Needs check-in", inactive3.length, "Inactive 3+ days")}
        {metric("Coaching interest", coachingInterest.length, "Staff action list")}
        {metric("Coach review requests", 3, "Progress Vault opt-in")}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-black">Participant progress</h2>
              <p className="mt-1 text-sm text-zinc-600">Progress patterns only. No private notes, goals or reflections.</p>
            </div>
            <Button variant="outline"><Download size={18} />Export list</Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-[0.12em] text-zinc-500">
                  <th className="py-3">First name</th>
                  <th>Day</th>
                  <th>Completed</th>
                  <th>Streak</th>
                  <th>Status</th>
                  <th>Check-in</th>
                  <th>Coaching</th>
                  <th>Contacted</th>
                </tr>
              </thead>
              <tbody>
                {demoParticipants.map((participant) => (
                  <tr key={participant.participantId} className="border-b last:border-0 hover:bg-zinc-50">
                    <td className="py-3 font-black">{participant.firstName}</td>
                    <td>{participant.currentDayReached}</td>
                    <td>{participant.totalDaysCompleted}</td>
                    <td>{participant.currentStreak}</td>
                    <td><span className={cn("rounded-full px-2 py-1 text-xs font-black", participant.challengeStatus === "completed_30" ? "bg-lime-100 text-lime-900" : participant.challengeStatus === "inactive" ? "bg-amber-100 text-amber-900" : "bg-zinc-100 text-zinc-700")}>{participant.challengeStatus}</span></td>
                    <td><span className={cn("rounded-full px-2 py-1 text-xs font-black", participant.inactiveRiskLevel === "low" ? "bg-lime-100 text-lime-900" : "bg-amber-100 text-amber-900")}>{participant.inactiveRiskLevel === "low" ? "No" : "Yes"}</span></td>
                    <td><span className={cn("rounded-full px-2 py-1 text-xs font-black", participant.coachingInterestSelected ? "bg-purple-100 text-purple-900" : "bg-zinc-100 text-zinc-600")}>{participant.coachingInterestSelected ? "Yes" : "No"}</span></td>
                    <td>No</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="grid gap-4">
          <InsightCard icon={TrendingDown} title="Biggest drop-off point" copy="Day 6 is the first visible friction point. Ask staff to check in before Week 1 review." tone="warning" />
          <InsightCard icon={AlertTriangle} title={`${inactive3.length} need a check-in`} copy="Prioritise participants inactive for 3+ days, then anyone with zero current streak." tone="warning" />
          <InsightCard icon={CheckCircle2} title={`${completed.length} completed 30 days`} copy="Finishers are strong candidates for 45/45, 60/60 or a coaching conversation." tone="success" />
          <InsightCard icon={MessageSquare} title={`${coachingInterest.length} selected coaching/PT`} copy="Use the script below to start a helpful next-step conversation." tone="teal" />
          <InsightCard icon={BarChart3} title="Weekly check-in insight" copy="Progress Vault can show completion rates, missed check-ins and coach review requests without revealing photos, weight or body scan values." tone="teal" />
        </div>
      </div>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-black">Check-in script library</h2>
            <p className="mt-1 text-sm text-zinc-600">Copyable prompts for staff. Keep messages supportive and low-pressure.</p>
          </div>
          <MessageSquare className="text-teal-700" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            "Hey [firstName], just checking in - how is your 30/30 Challenge going? No stress if life got busy. The goal is to get back on track today, even if it is just 10 minutes.",
            "Awesome work getting through Week 1 of the 30/30 Challenge. What has been the biggest win so far?",
            "Quick reminder to do your weekly review. It only takes 2 minutes and helps lock in the next week.",
            "Massive effort finishing your 30/30 Challenge. Want help choosing your next step - repeat 30/30, step up to 60/60, or map out a PT plan?",
            "Great work. Since you selected coaching/PT as a next step, we can help you build a simple plan to keep momentum going.",
          ].map((script) => <button key={script} className="rounded-lg border border-zinc-200 bg-white p-4 text-left text-sm leading-6 hover:border-lime-400 hover:bg-lime-50">{script}</button>)}
        </div>
      </Card>
    </AdminShell>
  );
}

export function AdminListPage({ title }: { title: string }) {
  return (
    <AdminShell label="Master Admin" title={title}>
      <div className="grid gap-3 md:grid-cols-3">
        {seedClubs.map((club) => (
          <Card key={club.clubId}>
            <BarChart3 className="text-teal-700" />
            <h2 className="mt-3 font-black">{club.clubName}</h2>
            <p className="mt-1 text-sm text-zinc-600">{club.licenceStatus} licence</p>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">{club.challengeMode.replace("_", " ")}</p>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}

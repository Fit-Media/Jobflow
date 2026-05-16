"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { saveUnlockedClub } from "@/lib/storage/local";
import { trackEvent } from "@/lib/analytics/client";
import type { Club } from "@/types";

export function LandingClient() {
  const router = useRouter();
  const [clubCode, setClubCode] = useState("");
  const [clubPassword, setClubPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successClub, setSuccessClub] = useState<Club | null>(null);

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    setSuccessClub(null);
    await trackEvent("club_code_submitted", null, undefined);

    try {
      const response = await fetch("/api/clubs/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clubCode, clubPassword }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError("That code does not look right. Please check with your club.");
        await trackEvent("club_code_failed", null, { codeEntered: Boolean(clubCode) });
        setLoading(false);
        return;
      }

      saveUnlockedClub(data.club as Club);
      setSuccessClub(data.club as Club);
      await trackEvent("club_code_success", null, undefined, { clubId: data.club.clubId });
      window.setTimeout(() => router.push("/welcome"), 850);
    } catch {
      setError("We could not check that code. Please try again.");
      await trackEvent("club_code_failed", null, { codeEntered: Boolean(clubCode) });
      setLoading(false);
    }
  }

  return (
    <main className="dark-product-bg min-h-screen overflow-hidden text-white">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 overflow-hidden px-5 py-8 md:grid-cols-[1.04fr_.96fr] md:py-8">
        <div className="animate-slide-up min-w-0 pt-6 md:pt-0">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-lime-200 shadow-2xl shadow-black/20 backdrop-blur">
            <Zap className="h-4 w-4" />
            Start small. Keep moving.
          </div>
          <h1 className="max-w-2xl text-5xl font-black leading-[0.9] tracking-tight sm:text-7xl"><span className="block">30/30</span><span className="block">Challenge</span></h1>
          <p className="mt-5 max-w-[22rem] text-2xl font-black leading-tight text-zinc-100 sm:max-w-xl">30 Days. 30 Minutes. One stronger you.</p>
          <p className="mt-4 max-w-lg text-base leading-7 text-zinc-300">Enter your club code to begin.</p>
          <div className="mt-8 hidden w-full max-w-xl gap-3 sm:grid sm:grid-cols-3" aria-hidden="true">
            {[
              ["30", "days"],
              ["30", "minutes"],
              ["1", "stronger you"],
            ].map(([value, label], index) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/10 backdrop-blur" style={{ animationDelay: `${index * 90}ms` }}>
                <p className="text-3xl font-black text-lime-200">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="animate-scale-in grid w-full min-w-0 max-w-full gap-5 md:relative">
          <div className="relative z-0 mx-auto hidden aspect-square w-full max-w-[220px] place-items-center sm:grid md:absolute md:-top-20 md:right-8 md:max-w-[270px] md:opacity-80" aria-hidden="true">
            <div className="absolute inset-8 animate-subtle-float rounded-full border border-lime-300/20 bg-lime-300/5" />
            <div className="absolute inset-16 rounded-full border border-teal-300/20 bg-teal-300/5" />
            <div className="absolute inset-20 rounded-full border border-purple-300/20 bg-purple-300/5" />
            <div className="relative grid size-36 place-items-center rounded-full bg-[conic-gradient(#bef264_0deg,#2dd4bf_238deg,rgba(255,255,255,0.12)_238deg)] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:size-40">
              <div className="grid size-full place-items-center rounded-full bg-zinc-950 text-center">
                <Activity className="mb-2 h-8 w-8 text-lime-200" />
                <p className="text-4xl font-black">30</p>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">day challenge</p>
              </div>
            </div>
          </div>
          <form onSubmit={submit} className="relative z-10 mx-auto w-[calc(100vw-4rem)] max-w-[calc(100vw-4rem)] rounded-lg border border-white/10 bg-white p-5 text-zinc-950 shadow-2xl shadow-black/30 sm:w-full sm:max-w-full sm:p-7 md:-mt-44">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-lg bg-zinc-950 text-lime-300"><LockKeyhole size={20} /></div>
              <div>
                <h2 className="text-lg font-black">Enter your club code to begin.</h2>
                <p className="text-sm font-bold text-zinc-500">No account required.</p>
              </div>
            </div>
            <div className="grid gap-4">
              <Field label="Club Code" value={clubCode} onChange={(event) => setClubCode(event.target.value.toUpperCase())} placeholder="Enter code" autoCapitalize="characters" autoComplete="off" />
              <Field label="Club Password" value={clubPassword} onChange={(event) => setClubPassword(event.target.value)} placeholder="Enter password" type="password" autoComplete="current-password" />
              {error ? <p role="alert" className="animate-scale-in rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">{error}</p> : null}
              {successClub ? (
                <p role="status" className="animate-scale-in flex gap-2 rounded-lg border border-lime-200 bg-lime-50 p-3 text-sm font-bold leading-6 text-lime-900">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  You&apos;re joining the 30/30 Challenge with {successClub.clubName}.
                </p>
              ) : null}
              <Button type="submit" disabled={loading || !clubCode || !clubPassword} className="w-full">
                {loading ? "Checking..." : <>Start Challenge <ArrowRight size={18} /></>}
              </Button>
              <p className="flex min-w-0 items-start gap-2 text-sm leading-6 text-zinc-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /><span className="min-w-0">Your personal notes and challenge details stay on your device.</span></p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

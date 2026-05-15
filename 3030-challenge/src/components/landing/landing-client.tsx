"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
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

  async function submit() {
    setLoading(true);
    setError("");
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
      await trackEvent("club_code_success", null, undefined, { clubId: data.club.clubId });
      router.push("/welcome");
    } catch {
      setError("We could not check that code. Please try again.");
      await trackEvent("club_code_failed", null, { codeEntered: Boolean(clubCode) });
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-5 py-8 md:grid-cols-[1.05fr_.95fr] md:py-10">
        <div className="animate-soft-enter pt-6 md:pt-0">
          <div className="mb-7 flex gap-2" aria-hidden="true">
            <span className="h-2 w-16 rounded-full bg-lime-300" />
            <span className="h-2 w-10 rounded-full bg-teal-400" />
            <span className="h-2 w-6 rounded-full bg-purple-400" />
          </div>
          <h1 className="text-5xl font-black leading-none sm:text-7xl">30/30 Challenge</h1>
          <p className="mt-5 max-w-xl text-2xl font-bold text-zinc-100">30 Days. 30 Minutes. One stronger you.</p>
          <p className="mt-4 max-w-lg text-zinc-300">Enter your club code to begin.</p>
        </div>
        <div className="animate-soft-enter rounded-lg border border-white/10 bg-white p-5 text-zinc-950 shadow-2xl shadow-black/30 sm:p-7">
          <div className="grid gap-4">
            <Field label="Club Code" value={clubCode} onChange={(event) => setClubCode(event.target.value)} placeholder="Enter code" autoCapitalize="characters" />
            <Field label="Club Password" value={clubPassword} onChange={(event) => setClubPassword(event.target.value)} placeholder="Enter password" type="password" />
            {error ? <p role="alert" className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">{error}</p> : null}
            <Button onClick={submit} disabled={loading || !clubCode || !clubPassword}>{loading ? "Checking..." : <>Start Challenge <ArrowRight size={18} /></>}</Button>
            <p className="flex gap-2 text-sm leading-6 text-zinc-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />Your personal notes and challenge details stay on your device.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

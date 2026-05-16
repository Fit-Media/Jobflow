"use client";

import { usePathname } from "next/navigation";
import { Activity, CalendarCheck, Dumbbell, Heart, Home, Leaf, Settings, Sparkles, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  ["Dashboard", "/dashboard", Home],
  ["Today", "/day/1", CalendarCheck],
  ["Progress", "/progress", TrendingUp],
  ["My Why", "/why", Heart],
  ["Workouts", "/workouts", Dumbbell],
  ["Nutrition", "/nutrition", Leaf],
  ["Rituals", "/rituals", Activity],
  ["Hacks", "/hacks", Sparkles],
  ["Settings", "/settings", Settings],
] as const;

export function AppShell({ children, side }: { children: React.ReactNode; side?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(190,242,100,0.17),transparent_28%),radial-gradient(circle_at_88%_8%,rgba(45,212,191,0.13),transparent_26%),linear-gradient(180deg,#fafafa_0%,#f4f4f5_100%)] text-zinc-950">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-28 pt-4 sm:px-5 lg:grid-cols-[240px_minmax(0,1fr)_304px] lg:px-6 lg:pb-8">
        <aside className="sticky top-4 hidden self-start rounded-lg border border-zinc-200/80 bg-white/88 p-3 shadow-[0_16px_48px_rgba(24,24,27,0.07)] backdrop-blur lg:block">
          <div className="mb-4 overflow-hidden rounded-lg bg-zinc-950 px-4 py-4 text-white">
            <div className="mb-4 flex gap-1.5" aria-hidden="true">
              <span className="h-1.5 w-8 rounded-full bg-lime-300" />
              <span className="h-1.5 w-5 rounded-full bg-teal-300" />
              <span className="h-1.5 w-3 rounded-full bg-purple-300" />
            </div>
            <p className="text-2xl font-black leading-none">30/30</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-lime-300">Challenge</p>
            <p className="mt-3 text-xs font-bold leading-5 text-zinc-300">30 days of movement, rituals and proof.</p>
          </div>
          <nav className="grid gap-1">
            {nav.map(([label, href, Icon]) => {
              const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
              return <ButtonLink key={href} href={href} variant="ghost" className={cn("justify-start rounded-lg", active && "bg-lime-100 text-zinc-950 shadow-inner shadow-lime-900/5 hover:bg-lime-100")}><Icon size={18} />{label}</ButtonLink>;
            })}
          </nav>
        </aside>
        <main className="min-w-0 max-w-full">{children}</main>
        <aside className="sticky top-4 hidden self-start lg:block">{side}</aside>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-zinc-200 bg-white/95 px-2 pb-3 pt-2 shadow-[0_-10px_34px_rgba(24,24,27,0.1)] backdrop-blur lg:hidden">
        {nav.slice(0, 5).map(([label, href, Icon]) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return <a key={href} href={href} className={cn("grid min-h-14 justify-items-center gap-1 rounded-lg px-1 py-1 text-[11px] font-bold text-zinc-600 transition active:scale-95", active && "bg-lime-100 text-zinc-950")}><Icon size={20} />{label}</a>;
        })}
      </nav>
    </div>
  );
}

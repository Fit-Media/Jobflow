"use client";

import { usePathname } from "next/navigation";
import { Activity, CalendarCheck, Dumbbell, Heart, Home, Leaf, Settings, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  ["Dashboard", "/dashboard", Home],
  ["Today", "/day/1", CalendarCheck],
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#fafafa_0%,#f4f4f5_100%)] text-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 pb-28 pt-4 sm:px-5 lg:grid-cols-[232px_minmax(0,1fr)_304px] lg:px-6 lg:pb-8">
        <aside className="sticky top-4 hidden self-start rounded-lg border border-zinc-200 bg-white p-3 shadow-sm shadow-zinc-950/[0.03] lg:block">
          <div className="mb-4 rounded-lg bg-zinc-950 px-4 py-4 text-white">
            <p className="text-xl font-black leading-none">30/30</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-lime-300">Challenge</p>
          </div>
          <nav className="grid gap-1">
            {nav.map(([label, href, Icon]) => {
              const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
              return <ButtonLink key={href} href={href} variant="ghost" className={cn("justify-start", active && "bg-lime-100 text-zinc-950 hover:bg-lime-100")}><Icon size={18} />{label}</ButtonLink>;
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
        <aside className="sticky top-4 hidden self-start lg:block">{side}</aside>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-zinc-200 bg-white/95 px-2 pb-3 pt-2 shadow-[0_-8px_30px_rgba(24,24,27,0.08)] backdrop-blur lg:hidden">
        {nav.slice(0, 5).map(([label, href, Icon]) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return <a key={href} href={href} className={cn("grid min-h-14 justify-items-center gap-1 rounded-lg px-1 py-1 text-[11px] font-bold text-zinc-600", active && "bg-lime-100 text-zinc-950")}><Icon size={20} />{label}</a>;
        })}
      </nav>
    </div>
  );
}

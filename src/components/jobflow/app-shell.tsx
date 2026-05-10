import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { appRoutes } from "@/lib/constants";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">JobFlow Assistant</span>
              <span className="block text-xs text-slate-500">Private job workflow for Andrew</span>
            </span>
          </Link>
          <nav className="hidden max-w-4xl flex-wrap justify-end gap-2 lg:flex">
            {appRoutes.slice(0, 10).map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden rounded-lg border border-slate-200 bg-white p-3 lg:block">
          <nav className="space-y-1">
            {appRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}

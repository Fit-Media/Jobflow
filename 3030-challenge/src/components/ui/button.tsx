import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const styles = "tap-scale inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-lime-300 disabled:cursor-not-allowed disabled:opacity-50";
const variants = {
  primary: "bg-lime-400 text-zinc-950 shadow-sm shadow-lime-900/10 hover:bg-lime-300",
  dark: "bg-zinc-950 text-white shadow-sm shadow-zinc-950/20 hover:bg-zinc-800",
  ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100",
  outline: "border border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400 hover:bg-zinc-50",
  soft: "bg-teal-50 text-teal-950 hover:bg-teal-100",
  danger: "bg-red-50 text-red-700 hover:bg-red-100",
};

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return <button className={cn(styles, variants[variant], className)} {...props} />;
}

export function ButtonLink({ className, variant = "primary", children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: keyof typeof variants; children: ReactNode }) {
  return <Link className={cn(styles, variants[variant], className)} {...props}>{children}</Link>;
}

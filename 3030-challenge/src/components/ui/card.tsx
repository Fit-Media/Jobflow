import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-soft-enter rounded-lg border border-zinc-200/80 bg-white p-5 shadow-[0_10px_34px_rgba(24,24,27,0.045)]", className)} {...props} />;
}

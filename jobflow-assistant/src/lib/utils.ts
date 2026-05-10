import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value?: number | null) {
  if (value == null) return "Not scored";
  return `${value}%`;
}

export function riskTone(risk: string) {
  if (risk === "high") return "border-red-200 bg-red-50 text-red-800";
  if (risk === "medium") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

export function statusTone(status: string) {
  if (["Ready to Apply", "Offer", "Strong fit"].includes(status)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (["Applied", "Interview Scheduled", "Mock Interview Completed"].includes(status)) return "border-blue-200 bg-blue-50 text-blue-800";
  if (["Follow-up Due", "Rejected"].includes(status)) return "border-red-200 bg-red-50 text-red-800";
  if (["Resume Drafted", "Cover Letter Drafted", "Cover Email Drafted"].includes(status)) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

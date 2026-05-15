import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="grid gap-2 text-sm font-bold text-zinc-800">{label}<input className="min-h-12 rounded-lg border border-zinc-200 bg-white px-3 text-base outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100" {...props} /></label>;
}

export function TextArea({ label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return <label className="grid gap-2 text-sm font-bold text-zinc-800">{label}<textarea className="min-h-28 resize-y rounded-lg border border-zinc-200 bg-white p-3 text-base leading-6 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100" {...props} /></label>;
}

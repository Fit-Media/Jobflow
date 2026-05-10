import { Lock, MousePointerClick, Send, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";

const items = [
  { icon: Send, text: "No email has been sent." },
  { icon: MousePointerClick, text: "Only Andrew can click final Submit." },
  { icon: ShieldCheck, text: "Every risky step needs approval." },
  { icon: Lock, text: "Tokens must be encrypted at rest." },
];

export function SafetyStrip() {
  return (
    <Card className="grid gap-3 border-slate-300 bg-slate-950 text-white md:grid-cols-4">
      {items.map((item) => (
        <div key={item.text} className="flex items-center gap-3">
          <item.icon className="h-5 w-5 text-emerald-300" />
          <span className="text-sm">{item.text}</span>
        </div>
      ))}
    </Card>
  );
}

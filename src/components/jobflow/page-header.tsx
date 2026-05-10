import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

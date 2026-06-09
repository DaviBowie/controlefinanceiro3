import type { ReactNode } from "react";
import type { Tone } from "../../types";
import { cn } from "../../lib/format";
import { toneMap } from "../../lib/theme";

export function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <div className="flex items-center gap-2 border-b border-slate-800 px-6 py-4">
        <div className={cn("h-5 w-1 rounded-full", toneMap[tone].line)} />
        <span className="text-sm font-bold text-slate-100">{title}</span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

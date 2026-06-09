import type { ReactNode } from "react";
import type { Tone } from "../../types";
import { cn } from "../../lib/format";
import { toneMap } from "../../lib/theme";

export function Badge({ text, tone }: { text: ReactNode; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
        toneMap[tone].badge,
      )}
    >
      {text}
    </span>
  );
}

import type { ReactNode } from "react";
import type { Tone } from "../../types";
import { cn } from "../../lib/format";
import { toneMap } from "../../lib/theme";

export function Btn({
  tone,
  children,
  onClick,
  small,
  disabled,
}: {
  tone: Tone;
  children: ReactNode;
  onClick?: () => void;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg font-bold shadow-lg transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none",
        small ? "px-4 py-2 text-xs" : "px-7 py-3 text-sm",
        toneMap[tone].btn,
      )}
    >
      {children}
    </button>
  );
}

import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/format";

export const baseInputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(baseInputClass, props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { children, className, ...rest } = props;
  return (
    <select
      {...rest}
      className={cn(baseInputClass, "cursor-pointer appearance-none pr-9", className)}
    >
      {children}
    </select>
  );
}

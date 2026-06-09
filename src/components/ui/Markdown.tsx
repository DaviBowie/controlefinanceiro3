import type { ReactNode } from "react";

/** Converte **negrito** inline em <strong>. */
function parseInlineBold(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, idx) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={idx}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}

/** Render minimalista de markdown (titulos, listas e paragrafos). */
export function Markdown({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, idx) => {
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="mt-5 text-sm font-bold text-violet-400">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={idx} className="mt-6 text-base font-extrabold text-slate-100">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={idx} className="my-1 flex items-start gap-2">
              <span className="mt-1 text-violet-400">▸</span>
              <span className="text-sm leading-6 text-slate-300">
                {parseInlineBold(line.slice(2))}
              </span>
            </div>
          );
        }
        if (!line.trim() || line.trim() === "---") {
          return <div key={idx} className="h-2" />;
        }
        return (
          <p key={idx} className="my-1 text-sm leading-7 text-slate-300">
            {parseInlineBold(line)}
          </p>
        );
      })}
    </>
  );
}

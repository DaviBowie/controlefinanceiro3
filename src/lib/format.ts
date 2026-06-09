import type { ChangeEvent } from "react";

/** Junta classes condicionalmente (ignora false/null/undefined). */
export const cn = (...arr: Array<string | false | null | undefined>) =>
  arr.filter(Boolean).join(" ");

/** Formata um numero como moeda BRL. */
export const fmt = (v: number | string | null | undefined) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Data de hoje no formato YYYY-MM-DD. */
export const today = () => new Date().toISOString().split("T")[0];

/** Formata "YYYY-MM-DD" para a data localizada pt-BR (meio-dia evita salto de fuso). */
export const fmtDate = (date?: string) =>
  date ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR") : "-";

/** Type guard: distingue um evento de input/select de um valor direto. */
export const asInputValue = (
  v: unknown,
): v is ChangeEvent<HTMLInputElement | HTMLSelectElement> =>
  typeof v === "object" && v !== null && "target" in v;

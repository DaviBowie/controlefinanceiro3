// Barrel: ponto único de import para todos os tipos do domínio.
//   import { Transaction, Tone, FORMAS } from "@/types";
export * from "./enums";
export * from "./entities";
export * from "./ia";

export type TabId = "dashboard" | "transacoes" | "contas" | "investimentos" | "ia";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

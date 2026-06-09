import axios from "axios";
import type { Despesa } from "../types";

// Em dois repos separados, o frontend aponta diretamente para o backend.
// Define VITE_API_URL no .env do frontend (ex.: http://localhost:8000/api).
const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ------------------------------------------------------------------
// Camada anti-corrupcao
// O backend usa `pago: boolean`; a UI continua a usar "Sim"/"Não".
// A traducao acontece aqui, num unico sitio, e nao espalhada pelos componentes.
// ------------------------------------------------------------------
type DespesaApi = Omit<Despesa, "pago"> & { pago: boolean };

const despesaFromApi = (d: DespesaApi): Despesa => ({
  ...d,
  pago: d.pago ? "Sim" : "Não",
});

const despesaToApi = (d: Partial<Despesa>): Record<string, unknown> => {
  const { pago, ...rest } = d;
  return {
    ...rest,
    ...(pago !== undefined && { pago: pago === "Sim" }),
  };
};

export const despesasApi = {
  list: () =>
    api.get<DespesaApi[]>("/despesas").then((r) => r.data.map(despesaFromApi)),

  create: (d: Omit<Despesa, "id">) =>
    api.post<DespesaApi>("/despesas", despesaToApi(d)).then((r) => despesaFromApi(r.data)),

  update: (id: number, patch: Partial<Despesa>) =>
    api
      .patch<DespesaApi>(`/despesas/${id}`, despesaToApi(patch))
      .then((r) => despesaFromApi(r.data)),

  remove: (id: number) => api.delete(`/despesas/${id}`).then(() => id),
};

// ------------------------------------------------------------------
// IA (Groq via backend)
// ------------------------------------------------------------------
export const iaApi = {
  createChat: () => api.post<{ id: string }>("/ia/chats").then((r) => r.data),

  chat: (message: string, chatId?: string) =>
    api
      .post<{ response: string; chatId: string }>("/ia/chat", { message, chatId })
      .then((r) => r.data),

  analise: () =>
    api.post<{ response: string }>("/ia/analise").then((r) => r.data),
};

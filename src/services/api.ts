import axios from "axios";
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  Bill,
  CreateBillDto,
  UpdateBillDto,
  Investment,
  CreateInvestmentDto,
  UpdateInvestmentDto,
  AuthUser,
} from "../types";
import { TransactionType, BillType } from "../types";

// baseURL="/api" é o prefixo global do backend (setGlobalPrefix('api') no main.ts).
// Todas as chamadas abaixo usam paths relativos (ex: "/auth/register") que o axios
// concatena com este baseURL → URL final: /api/auth/register.
// O proxy Vite (/api → http://localhost:8000) garante que chegam ao backend sem CORS.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ── Interceptor de request: injeta o Bearer token em todas as chamadas ────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("finapp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Interceptor de response: logout automático em 401 ────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (
      axios.isAxiosError(err) &&
      err.response?.status === 401
    ) {
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(err);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api
      .post<{ token: string; user: AuthUser }>("/auth/register", data)
      .then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api
      .post<{ token: string; user: AuthUser }>("/auth/login", data)
      .then((r) => r.data),
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactionsApi = {
  list: (type?: TransactionType) =>
    api
      .get<Transaction[]>("/transactions", { params: type ? { type } : {} })
      .then((r) => r.data),

  create: (dto: CreateTransactionDto) =>
    api.post<Transaction>("/transactions", dto).then((r) => r.data),

  update: (id: number, dto: UpdateTransactionDto) =>
    api.patch<Transaction>(`/transactions/${id}`, dto).then((r) => r.data),

  remove: (id: number) => api.delete(`/transactions/${id}`).then(() => id),
};

// ── Bills ─────────────────────────────────────────────────────────────────────
export const billsApi = {
  list: (type?: BillType) =>
    api
      .get<Bill[]>("/bills", { params: type ? { type } : {} })
      .then((r) => r.data),

  create: (dto: CreateBillDto) =>
    api.post<Bill>("/bills", dto).then((r) => r.data),

  update: (id: number, dto: UpdateBillDto) =>
    api.patch<Bill>(`/bills/${id}`, dto).then((r) => r.data),

  liquidar: (id: number) =>
    api.patch<Bill>(`/bills/${id}/liquidar`).then((r) => r.data),

  remove: (id: number) => api.delete(`/bills/${id}`).then(() => id),
};

// ── Investments ───────────────────────────────────────────────────────────────
export const investmentsApi = {
  list: () => api.get<Investment[]>("/investments").then((r) => r.data),

  create: (dto: CreateInvestmentDto) =>
    api.post<Investment>("/investments", dto).then((r) => r.data),

  update: (id: number, dto: UpdateInvestmentDto) =>
    api.patch<Investment>(`/investments/${id}`, dto).then((r) => r.data),

  remove: (id: number) => api.delete(`/investments/${id}`).then(() => id),
};

// ── IA ────────────────────────────────────────────────────────────────────────
export const iaApi = {
  chat: (message: string, chatId?: string) =>
    api
      .post<{ response: string; chatId: string }>("/ia/chat", { message, chatId })
      .then((r) => r.data),

  analise: () =>
    api.post<{ response: string }>("/ia/analise").then((r) => r.data),
};

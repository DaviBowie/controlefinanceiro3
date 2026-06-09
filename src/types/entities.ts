import type { NumberOrEmpty, TransactionType, BillType } from "./enums";

// ── Transaction (match exato com src/transactions/transaction.entity.ts) ─────
export interface Transaction {
  id: number;
  type: TransactionType;
  data: string;        // YYYY-MM-DD
  descricao: string;
  valor: number;
  categoria: string;
  forma: string;
  status: boolean;     // true = pago (DESPESA) / recebido (RECEITA)
  parcela: string;     // ex: "3/12" — vazio para RECEITA
  obs: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTransactionDto = Omit<Transaction, "id" | "createdAt" | "updatedAt">;
export type UpdateTransactionDto = Partial<CreateTransactionDto>;
export type TransactionForm = Omit<CreateTransactionDto, "valor"> & { valor: NumberOrEmpty };

// ── Bill (match exato com src/bills/bill.entity.ts) ──────────────────────────
export interface Bill {
  id: number;
  type: BillType;
  contraparte: string; // credor (PAGAR) ou devedor (RECEBER)
  vencimento: string;  // YYYY-MM-DD
  valor: number;
  descricao: string;
  liquidadoEm: string | null; // null = pendente
  forma: string;
  recorrente: boolean;
  obs: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateBillDto = Omit<Bill, "id" | "createdAt" | "updatedAt">;
export type UpdateBillDto = Partial<CreateBillDto>;
export type BillForm = Omit<CreateBillDto, "valor"> & { valor: NumberOrEmpty };

// ── Investment (match exato com src/investments/investment.entity.ts) ─────────
export interface Investment {
  id: number;
  ativo: string;
  tipo: string;
  dataCompra: string; // YYYY-MM-DD
  aportado: number;
  valorAtual: number;
  vencimento: string; // YYYY-MM-DD ou ""
  obs: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateInvestmentDto = Omit<Investment, "id" | "createdAt" | "updatedAt">;
export type UpdateInvestmentDto = Partial<CreateInvestmentDto>;
export type InvestmentForm = Omit<CreateInvestmentDto, "aportado" | "valorAtual"> & {
  aportado: NumberOrEmpty;
  valorAtual: NumberOrEmpty;
};

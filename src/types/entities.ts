import type {
  CategoriaDesp,
  CategoriaRec,
  Forma,
  NumberOrEmpty,
  TipoInv,
  YesNo,
} from "./enums";

export interface Receita {
  id: number;
  data: string;
  descricao: string;
  valor: number;
  categoria: CategoriaRec;
  forma: Forma;
  recebido: YesNo;
  obs: string;
}

export interface Despesa {
  id: number;
  data: string;
  descricao: string;
  valor: number;
  categoria: CategoriaDesp;
  forma: Forma;
  pago: YesNo;
  parcela: string;
  obs: string;
}

export interface ReceberItem {
  id: number;
  devedor: string;
  vencimento: string;
  valor: number;
  descricao: string;
  recebidoEm: string;
  forma: Forma;
  obs: string;
}

export interface PagarItem {
  id: number;
  credor: string;
  vencimento: string;
  valor: number;
  descricao: string;
  pagoEm: string;
  forma: Forma;
  recorrente: YesNo;
  obs: string;
}

export interface Investimento {
  id: number;
  ativo: string;
  tipo: TipoInv;
  dataCompra: string;
  aportado: number;
  valorAtual: number;
  vencimento: string;
  obs: string;
}

export interface AllData {
  receitas: Receita[];
  despesas: Despesa[];
  receber: ReceberItem[];
  pagar: PagarItem[];
  investimentos: Investimento[];
}

// --- Tipos de formulario (valores monetarios podem estar vazios enquanto se digita) ---
export type ReceitaForm = Omit<Receita, "id" | "valor"> & { valor: NumberOrEmpty };
export type DespesaForm = Omit<Despesa, "id" | "valor"> & { valor: NumberOrEmpty };
export type ReceberForm = Omit<ReceberItem, "id" | "valor"> & { valor: NumberOrEmpty };
export type PagarForm = Omit<PagarItem, "id" | "valor"> & { valor: NumberOrEmpty };
export type InvestForm = Omit<Investimento, "id" | "aportado" | "valorAtual"> & {
  aportado: NumberOrEmpty;
  valorAtual: NumberOrEmpty;
};

import type { YesNo } from "./enums";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isAnalysis?: boolean;
}

export interface TransacaoImport {
  data: string;
  descricao: string;
  valor: number;
  tipo: "debito" | "credito";
  categoria: string;
  selecionada: boolean;
}

export type TipoAcao =
  | "criar_despesa"
  | "editar_despesa"
  | "excluir_despesa"
  | "criar_receita"
  | "editar_receita"
  | "excluir_receita"
  | "criar_categoria_desp"
  | "criar_categoria_rec";

export interface AcaoPendente {
  acao: TipoAcao;
  id?: number;
  nome?: string;
  data?: string;
  descricao?: string;
  valor?: number;
  categoria?: string;
  forma?: string;
  pago?: YesNo;
  recebido?: YesNo;
  parcela?: string;
  obs?: string;
  aprovada: boolean;
}

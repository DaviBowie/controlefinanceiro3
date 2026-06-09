// Constantes de dominio e tipos derivados.
// Sao a unica fonte da verdade para categorias, formas de pagamento e tons visuais.

export const CATS_DESP = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Vestuário",
  "Contas Fixas",
  "Assinaturas",
  "Outros",
] as const;

export const CATS_REC = [
  "Salário",
  "Freelance",
  "Aluguel",
  "Dividendos",
  "Pensão",
  "Outros",
] as const;

export const FORMAS = [
  "PIX",
  "TED/DOC",
  "Dinheiro",
  "Débito",
  "Crédito",
  "Boleto",
  "Outros",
] as const;

export const TIPOS_INV = [
  "Renda Fixa",
  "Tesouro Direto",
  "CDB/LCI/LCA",
  "Ações",
  "FIIs",
  "ETFs",
  "Fundos",
  "Criptomoedas",
  "Poupança",
  "Previdência",
  "Outros",
] as const;

export type Forma = (typeof FORMAS)[number];
export type TipoInv = (typeof TIPOS_INV)[number];

export type CategoriaDesp = string;
export type CategoriaRec = string;

export type YesNo = "Sim" | "Não";
export type Tone = "accent" | "green" | "red" | "gold" | "purple";

// Usado pelos formularios: um campo numerico que pode estar vazio.
export type NumberOrEmpty = number | "";

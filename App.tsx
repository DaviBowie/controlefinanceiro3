import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type SetStateAction,
} from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bell,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Landmark,
  LineChart,
  Loader2,
  PiggyBank,
  Search,
  Send,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import * as XLSX from "xlsx";

type Tone = "accent" | "green" | "red" | "gold" | "purple";
type YesNo = "Sim" | "Não";
type TabId = "receitas" | "despesas" | "receber" | "pagar" | "investimentos" | "ia";
type NumberOrEmpty = number | "";

type RuntimeStorage = {
  get: (key: string) => Promise<{ value: string } | null>;
  set: (key: string, value: string) => Promise<void>;
};

declare global {
  interface Window {
    storage?: RuntimeStorage;
  }
}

const CATS_DESP = [
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

const CATS_REC = ["Salário", "Freelance", "Aluguel", "Dividendos", "Pensão", "Outros"] as const;
const FORMAS = ["PIX", "TED/DOC", "Dinheiro", "Débito", "Crédito", "Boleto", "Outros"] as const;
const TIPOS_INV = [
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

type CategoriaDesp = (typeof CATS_DESP)[number];
type CategoriaRec = (typeof CATS_REC)[number];
type Forma = (typeof FORMAS)[number];
type TipoInv = (typeof TIPOS_INV)[number];

interface Receita {
  id: number;
  data: string;
  descricao: string;
  valor: number;
  categoria: CategoriaRec;
  forma: Forma;
  recebido: YesNo;
  obs: string;
}

interface Despesa {
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

interface ReceberItem {
  id: number;
  devedor: string;
  vencimento: string;
  valor: number;
  descricao: string;
  recebidoEm: string;
  forma: Forma;
  obs: string;
}

interface PagarItem {
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

interface Investimento {
  id: number;
  ativo: string;
  tipo: TipoInv;
  dataCompra: string;
  aportado: number;
  valorAtual: number;
  vencimento: string;
  obs: string;
}

interface AllData {
  receitas: Receita[];
  despesas: Despesa[];
  receber: ReceberItem[];
  pagar: PagarItem[];
  investimentos: Investimento[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isAnalysis?: boolean;
}

type ReceitaForm = Omit<Receita, "id" | "valor"> & { valor: NumberOrEmpty };
type DespesaForm = Omit<Despesa, "id" | "valor"> & { valor: NumberOrEmpty };
type ReceberForm = Omit<ReceberItem, "id" | "valor"> & { valor: NumberOrEmpty };
type PagarForm = Omit<PagarItem, "id" | "valor"> & { valor: NumberOrEmpty };
type InvestForm = Omit<Investimento, "id" | "aportado" | "valorAtual"> & {
  aportado: NumberOrEmpty;
  valorAtual: NumberOrEmpty;
};

type RowBase = { id: number };

type TableColumn<T extends RowBase> = {
  key: string;
  label: string;
  mono?: boolean;
  render?: (value: unknown, row: T) => ReactNode;
};

type StatusInfo = {
  label: string;
  tone: Tone;
};

const tabs: Array<{ id: TabId; label: string; icon: LucideIcon; tone: Tone }> = [
  { id: "receitas", label: "Receitas", icon: ArrowDown, tone: "green" },
  { id: "despesas", label: "Despesas", icon: ArrowUp, tone: "red" },
  { id: "receber", label: "A Receber", icon: Wallet, tone: "accent" },
  { id: "pagar", label: "A Pagar", icon: CreditCard, tone: "red" },
  { id: "investimentos", label: "Investimentos", icon: LineChart, tone: "gold" },
  { id: "ia", label: "Análise IA", icon: Bot, tone: "purple" },
];

const toneMap: Record<
  Tone,
  {
    text: string;
    softBg: string;
    border: string;
    line: string;
    btn: string;
    badge: string;
  }
> = {
  accent: {
    text: "text-blue-400",
    softBg: "bg-blue-500/10",
    border: "border-blue-400/40",
    line: "bg-blue-500",
    btn: "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/30",
    badge: "bg-blue-500/15 text-blue-300",
  },
  green: {
    text: "text-emerald-400",
    softBg: "bg-emerald-500/10",
    border: "border-emerald-400/40",
    line: "bg-emerald-500",
    btn: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30",
    badge: "bg-emerald-500/15 text-emerald-300",
  },
  red: {
    text: "text-rose-400",
    softBg: "bg-rose-500/10",
    border: "border-rose-400/40",
    line: "bg-rose-500",
    btn: "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30",
    badge: "bg-rose-500/15 text-rose-300",
  },
  gold: {
    text: "text-amber-400",
    softBg: "bg-amber-500/10",
    border: "border-amber-400/40",
    line: "bg-amber-500",
    btn: "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30",
    badge: "bg-amber-500/15 text-amber-300",
  },
  purple: {
    text: "text-violet-400",
    softBg: "bg-violet-500/10",
    border: "border-violet-400/40",
    line: "bg-violet-500",
    btn: "bg-violet-500 hover:bg-violet-400 text-white shadow-violet-500/30",
    badge: "bg-violet-500/15 text-violet-300",
  },
};

const KEY = (t: string) => `finapp_${t}`;

const cn = (...arr: Array<string | false | null | undefined>) => arr.filter(Boolean).join(" ");

const fmt = (v: number | string | null | undefined) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (date?: string) => (date ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR") : "-");

const asInputValue = (v: unknown): v is ChangeEvent<HTMLInputElement | HTMLSelectElement> =>
  typeof v === "object" && v !== null && "target" in v;

async function loadData<T>(type: string): Promise<T[]> {
  try {
    if (window.storage?.get) {
      const v = await window.storage.get(KEY(type));
      return v ? (JSON.parse(v.value) as T[]) : [];
    }
    const raw = localStorage.getItem(KEY(type));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

async function saveData<T>(type: string, data: T[]): Promise<void> {
  try {
    const value = JSON.stringify(data);
    if (window.storage?.set) {
      await window.storage.set(KEY(type), value);
      return;
    }
    localStorage.setItem(KEY(type), value);
  } catch {}
}
const baseInputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20";

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(baseInputClass, props.className)} />;
}

function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { children, className, ...rest } = props;
  return (
    <select {...rest} className={cn(baseInputClass, "cursor-pointer appearance-none pr-9", className)}>
      {children}
    </select>
  );
}

function CurrencyInput({
  value,
  onChange,
  placeholder = "R$ 0,00",
  tone = "green",
}: {
  value: NumberOrEmpty | string;
  onChange: (value: NumberOrEmpty) => void;
  placeholder?: string;
  tone?: Tone;
}) {
  const toCents = (v: NumberOrEmpty | string) => Math.round((parseFloat(String(v || 0)) || 0) * 100);
  const [cents, setCents] = useState(toCents(value));

  useEffect(() => {
    setCents(!value && value !== 0 ? 0 : toCents(value));
  }, [value]);

  const display = (v: number) =>
    v === 0 ? "" : (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const update = (next: number) => {
    setCents(next);
    onChange(next === 0 ? "" : next / 100);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      update(Math.floor(cents / 10));
      return;
    }
    if (e.key === "Delete" || e.key === "Escape") {
      e.preventDefault();
      update(0);
    }
  };

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) {
      update(0);
      return;
    }
    update(Math.min(parseInt(digits, 10), 99999999));
  };

  return (
    <div className="relative">
      <Input
        inputMode="numeric"
        value={display(cents)}
        placeholder={placeholder}
        onChange={onChangeInput}
        onKeyDown={onKeyDown}
        className={cn(cents > 0 ? toneMap[tone].text : "text-slate-500")}
      />
      {cents > 0 && (
        <button
          type="button"
          onClick={() => update(0)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
          aria-label="Limpar valor"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function Field({ label, children, half }: { label: string; children: ReactNode; half?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1.5", half ? "md:col-span-1" : "md:col-span-2")}>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function Badge({ text, tone }: { text: ReactNode; tone: Tone }) {
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", toneMap[tone].badge)}>{text}</span>;
}

function KPI({ label, value, tone, icon }: { label: string; value: string; tone: Tone; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg", toneMap[tone].softBg, toneMap[tone].text)}>
          {icon}
        </span>
      </div>
      <span className={cn("text-2xl font-bold tabular-nums", toneMap[tone].text)}>{value}</span>
    </div>
  );
}

function Section({ title, tone, children }: { title: string; tone: Tone; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <div className="flex items-center gap-2 border-b border-slate-800 px-6 py-4">
        <div className={cn("h-5 w-1 rounded-full", toneMap[tone].line)} />
        <span className="text-sm font-bold text-slate-100">{title}</span>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Btn({
  tone,
  children,
  onClick,
  small,
  disabled,
}: {
  tone: Tone;
  children: ReactNode;
  onClick?: () => void;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg font-bold shadow-lg transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none",
        small ? "px-4 py-2 text-xs" : "px-7 py-3 text-sm",
        toneMap[tone].btn,
      )}
    >
      {children}
    </button>
  );
}

function Table<T extends RowBase>({
  cols,
  rows,
  onDelete,
  tone,
}: {
  cols: Array<TableColumn<T>>;
  rows: T[];
  onDelete: (id: number) => void;
  tone: Tone;
}) {
  if (!rows.length) {
    return <div className="py-10 text-center text-sm text-slate-500">Nenhum registro ainda. Adicione acima.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {cols.map((col) => (
              <th key={col.key} className="border-b border-slate-800 px-3 py-2 text-left text-[11px] uppercase tracking-wider text-slate-500">
                {col.label}
              </th>
            ))}
            <th className="border-b border-slate-800" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className={cn("border-b border-slate-800/60", index % 2 ? "bg-white/[0.03]" : "") }>
              {cols.map((col) => {
                const raw = (row as Record<string, unknown>)[col.key];
                return (
                  <td
                    key={`${row.id}-${col.key}`}
                    className={cn(
                      "whitespace-nowrap px-3 py-2",
                      col.mono ? cn("font-semibold tabular-nums", toneMap[tone].text) : "text-slate-300",
                    )}
                  >
                    {col.render ? col.render(raw, row) : ((raw ?? "-") as ReactNode)}
                  </td>
                );
              })}
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  className="rounded p-1 text-rose-400/70 transition hover:bg-rose-500/10 hover:text-rose-300"
                  aria-label="Excluir registro"
                >
                  <X className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function parseInlineBold(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, idx) =>
      part.startsWith("**") && part.endsWith("**") ? <strong key={idx}>{part.slice(2, -2)}</strong> : part,
    );
}

function renderMarkdown(text: string): ReactNode[] {
  return text.split("\n").map((line, idx) => {
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
          <span className="text-sm leading-6 text-slate-300">{parseInlineBold(line.slice(2))}</span>
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
  });
}
function IATab({ allData }: { allData: AllData }) {
  const { receitas, despesas, receber, pagar, investimentos } = allData;
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const hasData = receitas.length > 0 || despesas.length > 0 || investimentos.length > 0;

  const buildContext = () => {
    const totalRec = receitas.reduce((s, r) => s + r.valor, 0);
    const totalDesp = despesas.reduce((s, r) => s + r.valor, 0);
    const totalInv = investimentos.reduce((s, r) => s + r.valorAtual, 0);
    const totalAport = investimentos.reduce((s, r) => s + r.aportado, 0);
    const saldo = totalRec - totalDesp;
    const taxaPoup = totalRec > 0 ? ((saldo / totalRec) * 100).toFixed(1) : "0";

    const byCat = CATS_DESP.map((cat) => ({
      categoria: cat,
      total: despesas.filter((r) => r.categoria === cat).reduce((s, r) => s + r.valor, 0),
    }))
      .filter((x) => x.total > 0)
      .sort((a, b) => b.total - a.total);

    const byMes = Array.from({ length: 12 }, (_, month) => ({
      mes: month + 1,
      receitas: receitas
        .filter((r) => r.data && new Date(r.data).getMonth() === month)
        .reduce((s, r) => s + r.valor, 0),
      despesas: despesas
        .filter((r) => r.data && new Date(r.data).getMonth() === month)
        .reduce((s, r) => s + r.valor, 0),
    })).filter((m) => m.receitas > 0 || m.despesas > 0);

    const vencidos = pagar.filter((r) => !r.pagoEm && new Date(r.vencimento) < new Date()).length;
    const aReceber = receber.filter((r) => !r.recebidoEm).reduce((s, r) => s + r.valor, 0);

    return `
DADOS FINANCEIROS DO USUÁRIO (em R$):

RESUMO GERAL:
- Total de Receitas: ${fmt(totalRec)} (${receitas.length} lançamentos)
- Total de Despesas: ${fmt(totalDesp)} (${despesas.length} lançamentos)
- Saldo: ${fmt(saldo)}
- Taxa de Poupança: ${taxaPoup}%
- Carteira de Investimentos (valor atual): ${fmt(totalInv)} | Aportado: ${fmt(totalAport)} | Rendimento: ${fmt(totalInv - totalAport)}
- Contas a Receber (pendentes): ${fmt(aReceber)}
- Contas vencidas a pagar: ${vencidos}

DESPESAS POR CATEGORIA:
${byCat
  .map((c) => `- ${c.categoria}: ${fmt(c.total)} (${totalDesp > 0 ? ((c.total / totalDesp) * 100).toFixed(1) : 0}% do total)`)
  .join("\n")}

HISTÓRICO MENSAL:
${byMes
  .map((m) => `- Mês ${m.mes}: Receitas ${fmt(m.receitas)} | Despesas ${fmt(m.despesas)} | Saldo ${fmt(m.receitas - m.despesas)}`)
  .join("\n")}

INVESTIMENTOS:
${
  investimentos
    .map(
      (r) =>
        `- ${r.ativo} (${r.tipo}): Aportado ${fmt(r.aportado)}, Atual ${fmt(r.valorAtual)}, Rendimento ${fmt(r.valorAtual - r.aportado)}`,
    )
    .join("\n") || "Nenhum investimento cadastrado"
}

ÚLTIMAS RECEITAS:
${receitas
  .slice(0, 10)
  .map((r) => `- ${fmtDate(r.data)} | ${r.descricao} | ${fmt(r.valor)} | ${r.categoria}`)
  .join("\n")}

ÚLTIMAS DESPESAS:
${despesas
  .slice(0, 15)
  .map((r) => `- ${fmtDate(r.data)} | ${r.descricao} | ${fmt(r.valor)} | ${r.categoria}`)
  .join("\n")}
    `.trim();
  };

  const runAnalysis = async () => {
    if (!hasData) return;

    setLoading(true);
    setAnalysis(null);

    const prompt = `Você é um consultor financeiro pessoal especializado. Analise os dados financeiros abaixo e forneça uma análise completa e personalizada em português brasileiro.

${buildContext()}

Forneça uma análise estruturada com:

## Diagnóstico Geral
Avalie a saúde financeira atual de forma direta e honesta.

## Pontos Positivos
Liste o que o usuário está fazendo bem.

## Alertas e Riscos
Identifique problemas, gastos excessivos, padrões preocupantes.

## Padrões Detectados
Identifique padrões nos dados: sazonalidade, categorias que crescem, comportamentos recorrentes.

## Recomendações Prioritárias
Liste de 3 a 5 ações concretas e específicas que o usuário deve tomar agora.

## Projeção
Com base nos dados atuais, projete como será a situação financeira em 3 e 6 meses se continuar no mesmo ritmo.

Seja direto, use números reais dos dados, e evite conselhos genéricos. Foque no que os dados mostram especificamente.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = (await res.json()) as { content?: Array<{ text?: string }> };
      const text = data.content?.map((b) => b.text || "").join("") || "Erro ao gerar análise.";
      setAnalysis(text);
      setChatHistory([{ role: "assistant", content: text, isAnalysis: true }]);
    } catch {
      setAnalysis("Erro ao conectar com a IA. Tente novamente.");
    }

    setLoading(false);
  };

  const sendQuestion = async () => {
    if (!question.trim() || chatLoading) return;

    const userMsg = question.trim();
    setQuestion("");
    setChatLoading(true);

    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", content: userMsg }];
    setChatHistory(newHistory);

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      {
        role: "user",
        content: `Você é um consultor financeiro pessoal. Aqui estão os dados financeiros do usuário:\n\n${buildContext()}\n\nResponda perguntas sobre as finanças deste usuário de forma direta e personalizada em português.`,
      },
      { role: "assistant", content: "Entendido! Analisei seus dados financeiros. Como posso ajudá-lo?" },
      ...newHistory.filter((m) => !m.isAnalysis).map((m) => ({ role: m.role, content: m.content })),
    ];

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages }),
      });
      const data = (await res.json()) as { content?: Array<{ text?: string }> };
      const text = data.content?.map((b) => b.text || "").join("") || "Erro ao responder.";
      setChatHistory((prev) => [...prev, { role: "assistant", content: text }]);
    } catch {
      setChatHistory((prev) => [...prev, { role: "assistant", content: "Erro ao conectar. Tente novamente." }]);
    }

    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const suggestions = [
    "Onde posso cortar gastos esse mês?",
    "Minha taxa de poupança é boa?",
    "Qual categoria gasto mais desnecessariamente?",
    "Como estão meus investimentos comparado à inflação?",
    "Vou conseguir poupar mais no próximo mês?",
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-blue-500/10 p-7">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 text-2xl font-extrabold text-slate-100">
            <BrainCircuit className="h-6 w-6 text-violet-300" />
            Análise Inteligente
          </div>
          <div className="max-w-[520px] text-sm leading-6 text-slate-300">
            A IA analisa seus dados financeiros e detecta padrões, tendências e oportunidades de melhoria.
          </div>
        </div>
        <Btn tone="purple" onClick={runAnalysis} disabled={loading || !hasData}>
          <span className="inline-flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            {loading ? "Analisando..." : "Gerar análise completa"}
          </span>
        </Btn>
      </div>

      {!hasData && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
          <div className="mb-3 flex justify-center">
            <Search className="h-9 w-9 text-slate-400" />
          </div>
          <div className="mb-1 text-base font-bold text-slate-100">Sem dados para analisar</div>
          <div className="text-sm text-slate-500">Adicione receitas e despesas nas outras abas.</div>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-violet-500/30 bg-slate-900/70 p-10 text-center">
          <div className="mb-3 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </div>
          <div className="mb-1 text-base font-bold text-violet-400">Analisando seus dados financeiros...</div>
          <div className="text-sm text-slate-500">Gerando recomendações personalizadas.</div>
        </div>
      )}

      {analysis && !loading && (
        <div className="overflow-hidden rounded-2xl border border-violet-500/30 bg-slate-900/70">
          <div className="flex items-center gap-2 border-b border-slate-800 bg-violet-500/10 px-6 py-4">
            <div className="h-5 w-1 rounded-full bg-violet-500" />
            <span className="text-sm font-bold text-slate-100">Análise Completa</span>
            <span className="ml-auto text-[11px] text-slate-500">Gerada agora</span>
          </div>
          <div className="px-7 py-6">{renderMarkdown(analysis)}</div>
        </div>
      )}

      {hasData && (
        <Section title="Pergunte sobre suas finanças" tone="purple">
          {chatHistory.filter((m) => !m.isAnalysis).length === 0 && (
            <div className="mb-5">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Sugestões de perguntas</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuestion(s)}
                    className="rounded-full border border-violet-500/35 bg-violet-500/15 px-3.5 py-1.5 text-xs text-slate-300 transition hover:bg-violet-500/30 hover:text-slate-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatHistory.filter((m) => !m.isAnalysis).length > 0 && (
            <div className="mb-4 flex max-h-96 flex-col gap-3 overflow-y-auto">
              {chatHistory
                .filter((m) => !m.isAnalysis)
                .map((msg, i) => (
                  <div key={`${msg.role}-${i}`} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] border px-4 py-3 text-sm leading-6 text-slate-100",
                        msg.role === "user"
                          ? "rounded-[18px_18px_4px_18px] border-violet-400 bg-violet-500"
                          : "rounded-[18px_18px_18px_4px] border-slate-700 bg-slate-800",
                      )}
                    >
                      {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                    </div>
                  </div>
                ))}

              {chatLoading && (
                <div className="flex gap-1.5 px-2 py-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}

          <div className="flex gap-2.5">
            <Input
              className="flex-1 border-violet-500/40 focus:border-violet-400 focus:ring-violet-400/20"
              placeholder="Ex: Qual mês gastei mais? Devo investir mais? Como reduzir despesas?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
              disabled={chatLoading}
            />
            <Btn tone="purple" onClick={sendQuestion} disabled={chatLoading || !question.trim()} small>
              <span className="inline-flex items-center gap-1.5">
                {chatLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Enviar
              </span>
            </Btn>
          </div>
        </Section>
      )}
    </div>
  );
}
function ReceitasTab({
  data,
  setData,
}: {
  data: Receita[];
  setData: Dispatch<SetStateAction<Receita[]>>;
}) {
  const empty: ReceitaForm = {
    data: today(),
    descricao: "",
    valor: "",
    categoria: "Salário",
    forma: "PIX",
    recebido: "Sim",
    obs: "",
  };

  const [f, setF] = useState<ReceitaForm>(empty);

  const set =
    <K extends keyof ReceitaForm>(key: K) =>
    (value: ReceitaForm[K] | ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setF((prev) => ({ ...prev, [key]: asInputValue(value) ? (value.target.value as ReceitaForm[K]) : value }));
    };

  const add = () => {
    if (!f.descricao || f.valor === "") return;

    const next: Receita[] = [
      {
        id: Date.now(),
        data: f.data,
        descricao: f.descricao,
        valor: Number(f.valor),
        categoria: f.categoria,
        forma: f.forma,
        recebido: f.recebido,
        obs: f.obs,
      },
      ...data,
    ];

    setData(next);
    void saveData("receitas", next);
    setF(empty);
  };

  const del = (id: number) => {
    const next = data.filter((r) => r.id !== id);
    setData(next);
    void saveData("receitas", next);
  };

  const total = data.reduce((s, r) => s + r.valor, 0);
  const recebido = data.filter((r) => r.recebido === "Sim").reduce((s, r) => s + r.valor, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPI label="Total Receitas" value={fmt(total)} tone="green" icon={<Landmark className="h-4 w-4" />} />
        <KPI label="Recebido" value={fmt(recebido)} tone="green" icon={<CheckCircle2 className="h-4 w-4" />} />
        <KPI label="Pendente" value={fmt(total - recebido)} tone="gold" icon={<Clock3 className="h-4 w-4" />} />
      </div>

      <Section title="Adicionar Receita" tone="green">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Data" half>
            <Input type="date" value={f.data} onChange={set("data")} />
          </Field>

          <Field label="Valor" half>
            <CurrencyInput value={f.valor} onChange={set("valor")} tone="green" />
          </Field>

          <Field label="Descrição">
            <Input placeholder="Ex: Salário março..." value={f.descricao} onChange={set("descricao")} />
          </Field>

          <Field label="Categoria" half>
            <Select value={f.categoria} onChange={set("categoria")}>
              {CATS_REC.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <Field label="Forma" half>
            <Select value={f.forma} onChange={set("forma")}>
              {FORMAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <Field label="Recebido?" half>
            <Select value={f.recebido} onChange={set("recebido")}>
              <option>Sim</option>
              <option>Não</option>
            </Select>
          </Field>

          <Field label="Observações">
            <Input placeholder="Anotações..." value={f.obs} onChange={set("obs")} />
          </Field>

          <div className="md:col-span-2">
            <Btn tone="green" onClick={add}>
              + Adicionar Receita
            </Btn>
          </div>
        </div>
      </Section>

      <Section title="Histórico" tone="green">
        <Table
          tone="green"
          onDelete={del}
          rows={data}
          cols={[
            { key: "data", label: "Data", render: (v) => fmtDate(String(v || "")) },
            { key: "descricao", label: "Descrição" },
            { key: "valor", label: "Valor", mono: true, render: (v) => fmt(Number(v || 0)) },
            { key: "categoria", label: "Categoria", render: (v) => <Badge text={String(v)} tone="green" /> },
            {
              key: "recebido",
              label: "Status",
              render: (v) => (
                <Badge
                  text={v === "Sim" ? "Recebido" : "Pendente"}
                  tone={v === "Sim" ? "green" : "gold"}
                />
              ),
            },
          ]}
        />
      </Section>
    </div>
  );
}

function DespesasTab({
  data,
  setData,
}: {
  data: Despesa[];
  setData: Dispatch<SetStateAction<Despesa[]>>;
}) {
  const empty: DespesaForm = {
    data: today(),
    descricao: "",
    valor: "",
    categoria: "Alimentação",
    forma: "PIX",
    pago: "Sim",
    parcela: "",
    obs: "",
  };

  const [f, setF] = useState<DespesaForm>(empty);

  const set =
    <K extends keyof DespesaForm>(key: K) =>
    (value: DespesaForm[K] | ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setF((prev) => ({ ...prev, [key]: asInputValue(value) ? (value.target.value as DespesaForm[K]) : value }));
    };

  const add = () => {
    if (!f.descricao || f.valor === "") return;

    const next: Despesa[] = [
      {
        id: Date.now(),
        data: f.data,
        descricao: f.descricao,
        valor: Number(f.valor),
        categoria: f.categoria,
        forma: f.forma,
        pago: f.pago,
        parcela: f.parcela,
        obs: f.obs,
      },
      ...data,
    ];

    setData(next);
    void saveData("despesas", next);
    setF(empty);
  };

  const del = (id: number) => {
    const next = data.filter((r) => r.id !== id);
    setData(next);
    void saveData("despesas", next);
  };

  const total = data.reduce((s, r) => s + r.valor, 0);
  const pago = data.filter((r) => r.pago === "Sim").reduce((s, r) => s + r.valor, 0);

  const byCat = CATS_DESP.map((cat) => ({
    cat,
    total: data.filter((r) => r.categoria === cat).reduce((s, r) => s + r.valor, 0),
  }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPI label="Total Despesas" value={fmt(total)} tone="red" icon={<CreditCard className="h-4 w-4" />} />
        <KPI label="Pago" value={fmt(pago)} tone="green" icon={<CheckCircle2 className="h-4 w-4" />} />
        <KPI label="Pendente" value={fmt(total - pago)} tone="gold" icon={<Clock3 className="h-4 w-4" />} />
      </div>

      {byCat.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Distribuição por Categoria</div>
          <div className="flex flex-col gap-2.5">
            {byCat.map(({ cat, total: catTotal }) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="min-w-[110px] text-sm text-slate-300">{cat}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-slate-800">
                  <div
                    className="h-full rounded bg-rose-500 transition-all duration-500"
                    style={{ width: `${Math.min((catTotal / total) * 100, 100)}%` }}
                  />
                </div>
                <span className="min-w-[100px] text-right text-sm font-bold text-rose-400">{fmt(catTotal)}</span>
                <span className="min-w-[36px] text-right text-[11px] text-slate-500">{((catTotal / total) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Section title="Adicionar Despesa" tone="red">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Data" half>
            <Input type="date" value={f.data} onChange={set("data")} />
          </Field>

          <Field label="Valor" half>
            <CurrencyInput value={f.valor} onChange={set("valor")} tone="red" />
          </Field>

          <Field label="Descrição">
            <Input placeholder="Ex: Mercado, Aluguel..." value={f.descricao} onChange={set("descricao")} />
          </Field>

          <Field label="Categoria" half>
            <Select value={f.categoria} onChange={set("categoria")}>
              {CATS_DESP.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <Field label="Forma" half>
            <Select value={f.forma} onChange={set("forma")}>
              {FORMAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <Field label="Pago?" half>
            <Select value={f.pago} onChange={set("pago")}>
              <option>Sim</option>
              <option>Não</option>
            </Select>
          </Field>

          <Field label="Parcela" half>
            <Input placeholder="ex: 2/12" value={f.parcela} onChange={set("parcela")} />
          </Field>

          <Field label="Observações" half>
            <Input placeholder="Anotações..." value={f.obs} onChange={set("obs")} />
          </Field>

          <div className="md:col-span-2">
            <Btn tone="red" onClick={add}>
              + Adicionar Despesa
            </Btn>
          </div>
        </div>
      </Section>

      <Section title="Histórico" tone="red">
        <Table
          tone="red"
          onDelete={del}
          rows={data}
          cols={[
            { key: "data", label: "Data", render: (v) => fmtDate(String(v || "")) },
            { key: "descricao", label: "Descrição" },
            { key: "valor", label: "Valor", mono: true, render: (v) => fmt(Number(v || 0)) },
            { key: "categoria", label: "Categoria", render: (v) => <Badge text={String(v)} tone="red" /> },
            {
              key: "pago",
              label: "Status",
              render: (v) => (
                <Badge
                  text={v === "Sim" ? "Pago" : "Pendente"}
                  tone={v === "Sim" ? "green" : "gold"}
                />
              ),
            },
          ]}
        />
      </Section>
    </div>
  );
}
function ReceberTab({
  data,
  setData,
}: {
  data: ReceberItem[];
  setData: Dispatch<SetStateAction<ReceberItem[]>>;
}) {
  const empty: ReceberForm = {
    devedor: "",
    vencimento: today(),
    valor: "",
    descricao: "",
    recebidoEm: "",
    forma: "PIX",
    obs: "",
  };

  const [f, setF] = useState<ReceberForm>(empty);

  const set =
    <K extends keyof ReceberForm>(key: K) =>
    (value: ReceberForm[K] | ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setF((prev) => ({ ...prev, [key]: asInputValue(value) ? (value.target.value as ReceberForm[K]) : value }));
    };

  const add = () => {
    if (!f.devedor || f.valor === "") return;

    const next: ReceberItem[] = [
      {
        id: Date.now(),
        devedor: f.devedor,
        vencimento: f.vencimento,
        valor: Number(f.valor),
        descricao: f.descricao,
        recebidoEm: f.recebidoEm,
        forma: f.forma,
        obs: f.obs,
      },
      ...data,
    ];

    setData(next);
    void saveData("receber", next);
    setF(empty);
  };

  const del = (id: number) => {
    const next = data.filter((r) => r.id !== id);
    setData(next);
    void saveData("receber", next);
  };

  const getStatus = (row: ReceberItem): StatusInfo => {
    if (row.recebidoEm) return { label: "✅ Recebido", tone: "green" };
    const days = Math.ceil((new Date(row.vencimento).getTime() - Date.now()) / 86400000);
    if (days < 0) return { label: "⚠️ Vencido", tone: "red" };
    if (days <= 7) return { label: "🔔 Em Breve", tone: "gold" };
    return { label: "🕐 Em Aberto", tone: "accent" };
  };

  const aberto = data.filter((r) => !r.recebidoEm).reduce((s, r) => s + r.valor, 0);
  const recebido = data.filter((r) => r.recebidoEm).reduce((s, r) => s + r.valor, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <KPI label="A Receber" value={fmt(aberto)} tone="accent" icon="📨" />
        <KPI label="Já Recebido" value={fmt(recebido)} tone="green" icon="✅" />
      </div>

      <Section title="Adicionar Conta a Receber" tone="accent">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Devedor">
            <Input placeholder="Nome..." value={f.devedor} onChange={set("devedor")} />
          </Field>

          <Field label="Valor" half>
            <CurrencyInput value={f.valor} onChange={set("valor")} tone="accent" />
          </Field>

          <Field label="Vencimento" half>
            <Input type="date" value={f.vencimento} onChange={set("vencimento")} />
          </Field>

          <Field label="Descrição">
            <Input placeholder="Motivo..." value={f.descricao} onChange={set("descricao")} />
          </Field>

          <Field label="Recebido em" half>
            <Input type="date" value={f.recebidoEm} onChange={set("recebidoEm")} />
          </Field>

          <Field label="Forma" half>
            <Select value={f.forma} onChange={set("forma")}>
              {FORMAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <Field label="Observações">
            <Input placeholder="Anotações..." value={f.obs} onChange={set("obs")} />
          </Field>

          <div className="md:col-span-2">
            <Btn tone="accent" onClick={add}>
              + Adicionar
            </Btn>
          </div>
        </div>
      </Section>

      <Section title="Contas a Receber" tone="accent">
        <Table
          tone="accent"
          onDelete={del}
          rows={data}
          cols={[
            { key: "devedor", label: "Devedor" },
            { key: "vencimento", label: "Vencimento", render: (v) => fmtDate(String(v || "")) },
            { key: "valor", label: "Valor", mono: true, render: (v) => fmt(Number(v || 0)) },
            {
              key: "_status",
              label: "Status",
              render: (_, row) => {
                const s = getStatus(row);
                return <Badge text={s.label} tone={s.tone} />;
              },
            },
            { key: "recebidoEm", label: "Recebido Em", render: (v) => (v ? fmtDate(String(v)) : "-") },
          ]}
        />
      </Section>
    </div>
  );
}

function PagarTab({
  data,
  setData,
}: {
  data: PagarItem[];
  setData: Dispatch<SetStateAction<PagarItem[]>>;
}) {
  const empty: PagarForm = {
    credor: "",
    vencimento: today(),
    valor: "",
    descricao: "",
    pagoEm: "",
    forma: "PIX",
    recorrente: "Não",
    obs: "",
  };

  const [f, setF] = useState<PagarForm>(empty);

  const set =
    <K extends keyof PagarForm>(key: K) =>
    (value: PagarForm[K] | ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setF((prev) => ({ ...prev, [key]: asInputValue(value) ? (value.target.value as PagarForm[K]) : value }));
    };

  const add = () => {
    if (!f.credor || f.valor === "") return;

    const next: PagarItem[] = [
      {
        id: Date.now(),
        credor: f.credor,
        vencimento: f.vencimento,
        valor: Number(f.valor),
        descricao: f.descricao,
        pagoEm: f.pagoEm,
        forma: f.forma,
        recorrente: f.recorrente,
        obs: f.obs,
      },
      ...data,
    ];

    setData(next);
    void saveData("pagar", next);
    setF(empty);
  };

  const del = (id: number) => {
    const next = data.filter((r) => r.id !== id);
    setData(next);
    void saveData("pagar", next);
  };

  const getStatus = (row: PagarItem): StatusInfo => {
    if (row.pagoEm) return { label: "✅ Pago", tone: "green" };
    const days = Math.ceil((new Date(row.vencimento).getTime() - Date.now()) / 86400000);
    if (days < 0) return { label: "🚨 Vencido", tone: "red" };
    if (days <= 3) return { label: "🔴 Urgente", tone: "red" };
    if (days <= 7) return { label: "🔔 Em Breve", tone: "gold" };
    return { label: "🕐 Em Aberto", tone: "accent" };
  };

  const pendente = data.filter((r) => !r.pagoEm).reduce((s, r) => s + r.valor, 0);
  const pago = data.filter((r) => r.pagoEm).reduce((s, r) => s + r.valor, 0);
  const vencidos = data.filter((r) => !r.pagoEm && new Date(r.vencimento) < new Date()).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPI label="A Pagar" value={fmt(pendente)} tone="red" icon="📬" />
        <KPI label="Já Pago" value={fmt(pago)} tone="green" icon="✅" />
        <KPI
          label="Vencidos"
          value={`${vencidos} conta${vencidos !== 1 ? "s" : ""}`}
          tone={vencidos > 0 ? "red" : "green"}
          icon="🚨"
        />
      </div>

      <Section title="Adicionar Conta a Pagar" tone="red">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Credor">
            <Input placeholder="A quem pagar..." value={f.credor} onChange={set("credor")} />
          </Field>

          <Field label="Valor" half>
            <CurrencyInput value={f.valor} onChange={set("valor")} tone="red" />
          </Field>

          <Field label="Vencimento" half>
            <Input type="date" value={f.vencimento} onChange={set("vencimento")} />
          </Field>

          <Field label="Descrição">
            <Input placeholder="Motivo..." value={f.descricao} onChange={set("descricao")} />
          </Field>

          <Field label="Pago em" half>
            <Input type="date" value={f.pagoEm} onChange={set("pagoEm")} />
          </Field>

          <Field label="Forma" half>
            <Select value={f.forma} onChange={set("forma")}>
              {FORMAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <Field label="Recorrente?" half>
            <Select value={f.recorrente} onChange={set("recorrente")}>
              <option>Não</option>
              <option>Sim</option>
            </Select>
          </Field>

          <Field label="Observações" half>
            <Input placeholder="Anotações..." value={f.obs} onChange={set("obs")} />
          </Field>

          <div className="md:col-span-2">
            <Btn tone="red" onClick={add}>
              + Adicionar
            </Btn>
          </div>
        </div>
      </Section>

      <Section title="Contas a Pagar" tone="red">
        <Table
          tone="red"
          onDelete={del}
          rows={data}
          cols={[
            { key: "credor", label: "Credor" },
            { key: "vencimento", label: "Vencimento", render: (v) => fmtDate(String(v || "")) },
            { key: "valor", label: "Valor", mono: true, render: (v) => fmt(Number(v || 0)) },
            {
              key: "_status",
              label: "Status",
              render: (_, row) => {
                const s = getStatus(row);
                return <Badge text={s.label} tone={s.tone} />;
              },
            },
            { key: "pagoEm", label: "Pago Em", render: (v) => (v ? fmtDate(String(v)) : "-") },
          ]}
        />
      </Section>
    </div>
  );
}
function InvestTab({
  data,
  setData,
}: {
  data: Investimento[];
  setData: Dispatch<SetStateAction<Investimento[]>>;
}) {
  const empty: InvestForm = {
    ativo: "",
    tipo: "Renda Fixa",
    dataCompra: today(),
    aportado: "",
    valorAtual: "",
    vencimento: "",
    obs: "",
  };

  const [f, setF] = useState<InvestForm>(empty);

  const set =
    <K extends keyof InvestForm>(key: K) =>
    (value: InvestForm[K] | ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setF((prev) => ({ ...prev, [key]: asInputValue(value) ? (value.target.value as InvestForm[K]) : value }));
    };

  const add = () => {
    if (!f.ativo || f.aportado === "") return;

    const aport = Number(f.aportado);

    const next: Investimento[] = [
      {
        id: Date.now(),
        ativo: f.ativo,
        tipo: f.tipo,
        dataCompra: f.dataCompra,
        aportado: aport,
        valorAtual: f.valorAtual === "" ? aport : Number(f.valorAtual),
        vencimento: f.vencimento,
        obs: f.obs,
      },
      ...data,
    ];

    setData(next);
    void saveData("investimentos", next);
    setF(empty);
  };

  const del = (id: number) => {
    const next = data.filter((r) => r.id !== id);
    setData(next);
    void saveData("investimentos", next);
  };

  const totalAport = data.reduce((s, r) => s + r.aportado, 0);
  const totalAtual = data.reduce((s, r) => s + r.valorAtual, 0);
  const rend = totalAtual - totalAport;
  const rendPct = totalAport > 0 ? (rend / totalAport) * 100 : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Total Investido" value={fmt(totalAport)} tone="gold" icon="💼" />
        <KPI label="Valor Atual" value={fmt(totalAtual)} tone="gold" icon="📈" />
        <KPI
          label="Rendimento"
          value={`${rendPct >= 0 ? "+" : ""}${rendPct.toFixed(2)}%`}
          tone={rend >= 0 ? "green" : "red"}
          icon={rend >= 0 ? "🚀" : "📉"}
        />
        <KPI
          label="Ganho / Perda"
          value={fmt(rend)}
          tone={rend >= 0 ? "green" : "red"}
          icon={rend >= 0 ? "✅" : "⚠️"}
        />
      </div>

      <Section title="Adicionar Investimento" tone="gold">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Ativo">
            <Input placeholder="Ex: PETR4, CDB..." value={f.ativo} onChange={set("ativo")} />
          </Field>

          <Field label="Tipo" half>
            <Select value={f.tipo} onChange={set("tipo")}>
              {TIPOS_INV.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <Field label="Data de Compra" half>
            <Input type="date" value={f.dataCompra} onChange={set("dataCompra")} />
          </Field>

          <Field label="Valor Aportado" half>
            <CurrencyInput value={f.aportado} onChange={set("aportado")} tone="gold" />
          </Field>

          <Field label="Valor Atual" half>
            <CurrencyInput
              value={f.valorAtual}
              onChange={set("valorAtual")}
              tone="gold"
              placeholder="R$ 0,00 (= aportado se vazio)"
            />
          </Field>

          <Field label="Vencimento" half>
            <Input type="date" value={f.vencimento} onChange={set("vencimento")} />
          </Field>

          <Field label="Observações">
            <Input placeholder="Corretora, obs..." value={f.obs} onChange={set("obs")} />
          </Field>

          <div className="md:col-span-2">
            <Btn tone="gold" onClick={add}>
              + Adicionar Investimento
            </Btn>
          </div>
        </div>
      </Section>

      <Section title="Carteira" tone="gold">
        <Table
          tone="gold"
          onDelete={del}
          rows={data}
          cols={[
            { key: "ativo", label: "Ativo" },
            { key: "tipo", label: "Tipo", render: (v) => <Badge text={String(v)} tone="gold" /> },
            { key: "aportado", label: "Aportado", mono: true, render: (v) => fmt(Number(v || 0)) },
            { key: "valorAtual", label: "Atual", mono: true, render: (v) => fmt(Number(v || 0)) },
            {
              key: "_rend",
              label: "Rendimento",
              render: (_, row) => {
                const r = row.valorAtual - row.aportado;
                return (
                  <span className={cn("font-semibold", r >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {r >= 0 ? "+" : ""}
                    {fmt(r)}
                  </span>
                );
              },
            },
            {
              key: "_pct",
              label: "%",
              render: (_, row) => {
                const p = row.aportado > 0 ? ((row.valorAtual - row.aportado) / row.aportado) * 100 : 0;
                return (
                  <span className={p >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {p >= 0 ? "+" : ""}
                    {p.toFixed(2)}%
                  </span>
                );
              },
            },
          ]}
        />
      </Section>
    </div>
  );
}

function exportExcel(all: AllData) {
  const wb = XLSX.utils.book_new();

  const addSheet = (name: string, rows: Array<Record<string, unknown>>, cols: Array<{ key: string; label: string }>) => {
    const ws = XLSX.utils.aoa_to_sheet([
      cols.map((c) => c.label),
      ...rows.map((row) => cols.map((c) => row[c.key] ?? "")),
    ]);
    ws["!cols"] = cols.map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  addSheet("Receitas", all.receitas as unknown as Array<Record<string, unknown>>, [
    { key: "data", label: "Data" },
    { key: "descricao", label: "Descrição" },
    { key: "valor", label: "Valor (R$)" },
    { key: "categoria", label: "Categoria" },
    { key: "forma", label: "Forma" },
    { key: "recebido", label: "Recebido?" },
    { key: "obs", label: "Obs" },
  ]);

  addSheet("Despesas", all.despesas as unknown as Array<Record<string, unknown>>, [
    { key: "data", label: "Data" },
    { key: "descricao", label: "Descrição" },
    { key: "valor", label: "Valor (R$)" },
    { key: "categoria", label: "Categoria" },
    { key: "forma", label: "Forma" },
    { key: "pago", label: "Pago?" },
    { key: "obs", label: "Obs" },
  ]);

  addSheet("Contas a Receber", all.receber as unknown as Array<Record<string, unknown>>, [
    { key: "devedor", label: "Devedor" },
    { key: "vencimento", label: "Vencimento" },
    { key: "valor", label: "Valor (R$)" },
    { key: "descricao", label: "Descrição" },
    { key: "recebidoEm", label: "Recebido Em" },
    { key: "obs", label: "Obs" },
  ]);

  addSheet("Contas a Pagar", all.pagar as unknown as Array<Record<string, unknown>>, [
    { key: "credor", label: "Credor" },
    { key: "vencimento", label: "Vencimento" },
    { key: "valor", label: "Valor (R$)" },
    { key: "descricao", label: "Descrição" },
    { key: "pagoEm", label: "Pago Em" },
    { key: "obs", label: "Obs" },
  ]);

  addSheet("Investimentos", all.investimentos as unknown as Array<Record<string, unknown>>, [
    { key: "ativo", label: "Ativo" },
    { key: "tipo", label: "Tipo" },
    { key: "aportado", label: "Aportado (R$)" },
    { key: "valorAtual", label: "Valor Atual (R$)" },
    { key: "obs", label: "Obs" },
  ]);

  XLSX.writeFile(wb, `financeiro_${new Date().toISOString().split("T")[0]}.xlsx`);
}

function LandingPage({
  onOpenPanel,
  onGoToTab,
  onSelectTab,
  selectedTab,
  totalRec,
  totalDesp,
  saldo,
  receberPendente,
  pagarPendente,
  totalInvestido,
}: {
  onOpenPanel: () => void;
  onGoToTab: (tab: TabId) => void;
  onSelectTab: (tab: TabId) => void;
  selectedTab: TabId;
  totalRec: number;
  totalDesp: number;
  saldo: number;
  receberPendente: number;
  pagarPendente: number;
  totalInvestido: number;
}) {
  const quickActions: Array<{ label: string; tab: TabId; tone: Tone }> = [
    { label: "Lançar Receita", tab: "receitas", tone: "green" },
    { label: "Registrar Despesa", tab: "despesas", tone: "red" },
    { label: "Ver A Receber", tab: "receber", tone: "accent" },
    { label: "Ver Investimentos", tab: "investimentos", tone: "gold" },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-slate-950 bg-cover bg-center bg-no-repeat text-slate-100"
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(2,6,23,0.88), rgba(15,23,42,0.82) 45%, rgba(2,6,23,0.92)), url('/hero-financas.jpg.png')",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-slate-950/30" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-6">
        <section className="overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/60 p-7 backdrop-blur-[2px] sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Página inicial</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              Controle financeiro pessoal em um único lugar.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              Acompanhe receitas, despesas, contas a pagar, contas a receber, investimentos e use a análise com IA para tomar decisões
              melhores.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onOpenPanel}
                className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                Começar agora
              </button>
              <button
                type="button"
                onClick={() => onGoToTab("ia")}
                className="rounded-lg border border-violet-400/40 bg-violet-500/10 px-6 py-3 text-sm font-bold text-violet-200 transition hover:bg-violet-500/20"
              >
                Ver análise com IA
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KPI label="Receitas Registradas" value={fmt(totalRec)} tone="green" icon="↓" />
          <KPI label="Despesas Registradas" value={fmt(totalDesp)} tone="red" icon="↑" />
          <KPI label="Saldo Atual" value={fmt(saldo)} tone={saldo >= 0 ? "green" : "red"} icon={saldo >= 0 ? "✅" : "⚠️"} />
          <KPI label="A Receber" value={fmt(receberPendente)} tone="accent" icon="📨" />
          <KPI label="A Pagar" value={fmt(pagarPendente)} tone="red" icon="📬" />
          <KPI label="Investimentos" value={fmt(totalInvestido)} tone="gold" icon="📈" />
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-bold">Atalhos rápidos</h2>
          <p className="mt-1 text-sm text-slate-400">Entre direto na área que você quer atualizar agora.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onSelectTab(action.tab)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm font-semibold transition",
                  selectedTab === action.tab
                    ? cn(toneMap[action.tone].border, toneMap[action.tone].softBg, toneMap[action.tone].text)
                    : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800/70",
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState<TabId>("receitas");
  const [selectedLandingTab, setSelectedLandingTab] = useState<TabId>("receitas");
  const [showLanding, setShowLanding] = useState(true);
  const [loading, setLoading] = useState(true);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [receber, setReceber] = useState<ReceberItem[]>([]);
  const [pagar, setPagar] = useState<PagarItem[]>([]);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);

  useEffect(() => {
    const init = async () => {
      const [r, d, cr, cp, inv] = await Promise.all([
        loadData<Receita>("receitas"),
        loadData<Despesa>("despesas"),
        loadData<ReceberItem>("receber"),
        loadData<PagarItem>("pagar"),
        loadData<Investimento>("investimentos"),
      ]);

      setReceitas(r);
      setDespesas(d);
      setReceber(cr);
      setPagar(cp);
      setInvestimentos(inv);
      setLoading(false);
    };

    void init();
  }, []);

  const totalRec = useMemo(() => receitas.reduce((s, r) => s + r.valor, 0), [receitas]);
  const totalDesp = useMemo(() => despesas.reduce((s, r) => s + r.valor, 0), [despesas]);
  const receberPendente = useMemo(() => receber.filter((r) => !r.recebidoEm).reduce((s, r) => s + r.valor, 0), [receber]);
  const pagarPendente = useMemo(() => pagar.filter((r) => !r.pagoEm).reduce((s, r) => s + r.valor, 0), [pagar]);
  const totalInvestido = useMemo(() => investimentos.reduce((s, r) => s + r.valorAtual, 0), [investimentos]);
  const saldo = totalRec - totalDesp;

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950">
        <span className="text-blue-400">Carregando...</span>
      </div>
    );
  }

  const allData: AllData = { receitas, despesas, receber, pagar, investimentos };

  if (showLanding) {
    return (
      <LandingPage
        onOpenPanel={() => {
          setActive(selectedLandingTab);
          setShowLanding(false);
        }}
        onGoToTab={(tab) => {
          setActive(tab);
          setShowLanding(false);
        }}
        onSelectTab={setSelectedLandingTab}
        selectedTab={selectedLandingTab}
        totalRec={totalRec}
        totalDesp={totalDesp}
        saldo={saldo}
        receberPendente={receberPendente}
        pagarPendente={pagarPendente}
        totalInvestido={totalInvestido}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <button type="button" onClick={() => setShowLanding(true)} className="flex items-center gap-3 transition hover:opacity-90">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-lg">💰</div>
            <div>
              <div className="text-base font-extrabold">FinanControl</div>
              <div className="text-[11px] text-slate-500">Gestão Financeira Pessoal</div>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 text-xs sm:flex">
              <span className="font-semibold text-emerald-400">↓ {fmt(totalRec)}</span>
              <span className="font-semibold text-rose-400">↑ {fmt(totalDesp)}</span>
              <span className={cn("font-bold", saldo >= 0 ? "text-emerald-400" : "text-rose-400")}>= {fmt(saldo)}</span>
            </div>
            <Btn tone="accent" small onClick={() => exportExcel(allData)}>⬇ Excel</Btn>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {tabs.map((tab) => {
            const isActive = tab.id === active;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition",
                  isActive
                    ? cn(tab.tone === "gold" ? "text-amber-300" : toneMap[tab.tone].text, toneMap[tab.tone].softBg, toneMap[tab.tone].border)
                    : "border-transparent text-slate-500 hover:text-slate-300",
                )}
              >
                <TabIcon className="h-4 w-4" /> {tab.label}
                {tab.id === "ia" && (
                  <span className="rounded bg-violet-500 px-1.5 py-0.5 text-[10px] font-bold text-white">IA</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        {active === "receitas" && <ReceitasTab data={receitas} setData={setReceitas} />}
        {active === "despesas" && <DespesasTab data={despesas} setData={setDespesas} />}
        {active === "receber" && <ReceberTab data={receber} setData={setReceber} />}
        {active === "pagar" && <PagarTab data={pagar} setData={setPagar} />}
        {active === "investimentos" && <InvestTab data={investimentos} setData={setInvestimentos} />}
        {active === "ia" && <IATab allData={allData} />}
      </main>
    </div>
  );
}





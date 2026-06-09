import { useState, type ChangeEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock3,
  CreditCard,
  Landmark,
  Loader2,
} from "lucide-react";
import { Badge, Btn, CurrencyInput, Field, Input, KPI, Section, Select, Table } from "../components/ui";
import { fmt, fmtDate, today, asInputValue } from "../lib/format";
import { CATS_DESP, CATS_REC, FORMAS, TransactionType } from "../types";
import type { TransactionForm } from "../types";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from "../hooks/useTransactions";

const EMPTY_RECEITA: TransactionForm = {
  type: TransactionType.RECEITA,
  data: today(),
  descricao: "",
  valor: "",
  categoria: "Salário",
  forma: "PIX",
  status: true,
  parcela: "",
  obs: "",
};

const EMPTY_DESPESA: TransactionForm = {
  type: TransactionType.DESPESA,
  data: today(),
  descricao: "",
  valor: "",
  categoria: "Alimentação",
  forma: "PIX",
  status: true,
  parcela: "",
  obs: "",
};

export function TransacoesPage() {
  const [subTab, setSubTab] = useState<TransactionType>(TransactionType.RECEITA);

  const isReceita = subTab === TransactionType.RECEITA;
  const cats = isReceita ? [...CATS_REC] : [...CATS_DESP];
  const tone = isReceita ? ("green" as const) : ("red" as const);

  const emptyForm = isReceita ? EMPTY_RECEITA : EMPTY_DESPESA;
  const [f, setF] = useState<TransactionForm>(emptyForm);

  const { data = [], isLoading } = useTransactions(subTab);
  const create = useCreateTransaction();
  const remove = useDeleteTransaction();

  const set =
    <K extends keyof TransactionForm>(key: K) =>
    (value: TransactionForm[K] | ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setF((prev) => ({
        ...prev,
        [key]: asInputValue(value) ? (value.target.value as TransactionForm[K]) : value,
      }));
    };

  const handleSubTab = (t: TransactionType) => {
    setSubTab(t);
    setF(t === TransactionType.RECEITA ? EMPTY_RECEITA : EMPTY_DESPESA);
  };

  const add = () => {
    if (!f.descricao || f.valor === "") return;
    create.mutate(
      {
        ...f,
        type: subTab,
        valor: Number(f.valor),
      },
      { onSuccess: () => setF(isReceita ? EMPTY_RECEITA : EMPTY_DESPESA) },
    );
  };

  const total = data.reduce((s, r) => s + r.valor, 0);
  const liquidado = data.filter((r) => r.status).reduce((s, r) => s + r.valor, 0);

  const byCat =
    !isReceita
      ? cats
          .map((cat) => ({
            cat,
            total: data.filter((r) => r.categoria === cat).reduce((s, r) => s + r.valor, 0),
          }))
          .filter((x) => x.total > 0)
          .sort((a, b) => b.total - a.total)
      : [];

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-tab: Receitas / Despesas */}
      <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-1 w-fit">
        {([TransactionType.RECEITA, TransactionType.DESPESA] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleSubTab(t)}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
              subTab === t
                ? t === TransactionType.RECEITA
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t === TransactionType.RECEITA ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            {t === TransactionType.RECEITA ? "Receitas" : "Despesas"}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPI
          label={isReceita ? "Total Receitas" : "Total Despesas"}
          value={fmt(total)}
          tone={tone}
          icon={isReceita ? <Landmark className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
        />
        <KPI
          label={isReceita ? "Recebido" : "Pago"}
          value={fmt(liquidado)}
          tone="green"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <KPI
          label="Pendente"
          value={fmt(total - liquidado)}
          tone="gold"
          icon={<Clock3 className="h-4 w-4" />}
        />
      </div>

      {/* Distribuição por Categoria (apenas Despesas) */}
      {byCat.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Distribuição por Categoria
          </div>
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
                <span className="min-w-[100px] text-right text-sm font-bold text-rose-400">
                  {fmt(catTotal)}
                </span>
                <span className="min-w-[36px] text-right text-[11px] text-slate-500">
                  {total > 0 ? ((catTotal / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário */}
      <Section title={isReceita ? "Adicionar Receita" : "Adicionar Despesa"} tone={tone}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Data" half>
            <Input type="date" value={f.data} onChange={set("data")} />
          </Field>

          <Field label="Valor" half>
            <CurrencyInput value={f.valor} onChange={set("valor")} tone={tone} />
          </Field>

          <Field label="Descrição">
            <Input
              placeholder={isReceita ? "Ex: Salário março..." : "Ex: Mercado, Aluguel..."}
              value={f.descricao}
              onChange={set("descricao")}
            />
          </Field>

          <Field label="Categoria" half>
            <Select value={f.categoria} onChange={set("categoria")}>
              {cats.map((c) => (
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

          <Field label={isReceita ? "Recebido?" : "Pago?"} half>
            <Select
              value={f.status ? "Sim" : "Não"}
              onChange={(e) => set("status")(e.target.value === "Sim")}
            >
              <option>Sim</option>
              <option>Não</option>
            </Select>
          </Field>

          {!isReceita && (
            <Field label="Parcela" half>
              <Input placeholder="ex: 2/12" value={f.parcela} onChange={set("parcela")} />
            </Field>
          )}

          <Field label="Observações" half={!isReceita}>
            <Input placeholder="Anotações..." value={f.obs} onChange={set("obs")} />
          </Field>

          <div className="md:col-span-2">
            <Btn tone={tone} onClick={add} disabled={create.isPending}>
              {create.isPending
                ? "A adicionar..."
                : isReceita
                  ? "+ Adicionar Receita"
                  : "+ Adicionar Despesa"}
            </Btn>
          </div>
        </div>
      </Section>

      {/* Histórico */}
      <Section title="Histórico" tone={tone}>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> A carregar...
          </div>
        ) : (
          <Table
            tone={tone}
            onDelete={(id) => remove.mutate(id)}
            rows={data}
            cols={[
              { key: "data", label: "Data", render: (v) => fmtDate(String(v || "")) },
              { key: "descricao", label: "Descrição" },
              { key: "valor", label: "Valor", mono: true, render: (v) => fmt(Number(v || 0)) },
              {
                key: "categoria",
                label: "Categoria",
                render: (v) => <Badge text={String(v)} tone={tone} />,
              },
              {
                key: "status",
                label: "Status",
                render: (v) => (
                  <Badge
                    text={v ? (isReceita ? "Recebido" : "Pago") : "Pendente"}
                    tone={v ? "green" : "gold"}
                  />
                ),
              },
            ]}
          />
        )}
      </Section>
    </div>
  );
}

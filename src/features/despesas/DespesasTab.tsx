import { useState } from "react";
import type { ChangeEvent } from "react";
import { CheckCircle2, Clock3, CreditCard, Loader2 } from "lucide-react";
import type { DespesaForm } from "../../types";
import { FORMAS } from "../../types";
import { asInputValue, fmt, fmtDate, today } from "../../lib/format";
import { Badge, Btn, CurrencyInput, Field, Input, KPI, Section, Select, Table } from "../../components/ui";
import {
  useCreateDespesa,
  useDeleteDespesa,
  useDespesas,
} from "../../hooks/useDespesas";

const EMPTY: DespesaForm = {
  data: today(),
  descricao: "",
  valor: "",
  categoria: "Alimentação",
  forma: "PIX",
  pago: "Sim",
  parcela: "",
  obs: "",
};

export function DespesasTab({ catsDesp }: { catsDesp: string[] }) {
  // Estado do servidor via React Query (substitui props + localStorage).
  const { data = [], isLoading } = useDespesas();
  const createDespesa = useCreateDespesa();
  const deleteDespesa = useDeleteDespesa();

  const [f, setF] = useState<DespesaForm>(EMPTY);

  const set =
    <K extends keyof DespesaForm>(key: K) =>
    (value: DespesaForm[K] | ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setF((prev) => ({
        ...prev,
        [key]: asInputValue(value) ? (value.target.value as DespesaForm[K]) : value,
      }));
    };

  const add = () => {
    if (!f.descricao || f.valor === "") return;
    createDespesa.mutate(
      {
        data: f.data,
        descricao: f.descricao,
        valor: Number(f.valor),
        categoria: f.categoria,
        forma: f.forma,
        pago: f.pago,
        parcela: f.parcela,
        obs: f.obs,
      },
      { onSuccess: () => setF(EMPTY) },
    );
  };

  const total = data.reduce((s, r) => s + r.valor, 0);
  const pago = data.filter((r) => r.pago === "Sim").reduce((s, r) => s + r.valor, 0);

  const byCat = catsDesp
    .map((cat) => ({
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
                  {((catTotal / total) * 100).toFixed(0)}%
                </span>
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
              {catsDesp.map((c) => (
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
            <Btn tone="red" onClick={add} disabled={createDespesa.isPending}>
              {createDespesa.isPending ? "A adicionar..." : "+ Adicionar Despesa"}
            </Btn>
          </div>
        </div>
      </Section>

      <Section title="Histórico" tone="red">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> A carregar...
          </div>
        ) : (
          <Table
            tone="red"
            onDelete={(id) => deleteDespesa.mutate(id)}
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
                  <Badge text={v === "Sim" ? "Pago" : "Pendente"} tone={v === "Sim" ? "green" : "gold"} />
                ),
              },
            ]}
          />
        )}
      </Section>
    </div>
  );
}

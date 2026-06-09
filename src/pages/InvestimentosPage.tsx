import { useState, type ChangeEvent } from "react";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Badge, Btn, CurrencyInput, Field, Input, KPI, Section, Select, Table } from "../components/ui";
import { cn } from "../lib/format";
import { fmt, fmtDate, today, asInputValue } from "../lib/format";
import { TIPOS_INV } from "../types";
import type { InvestmentForm } from "../types";
import {
  useInvestments,
  useCreateInvestment,
  useDeleteInvestment,
} from "../hooks/useInvestments";

const EMPTY: InvestmentForm = {
  ativo: "",
  tipo: "Renda Fixa",
  dataCompra: today(),
  aportado: "",
  valorAtual: "",
  vencimento: "",
  obs: "",
};

export function InvestimentosPage() {
  const [f, setF] = useState<InvestmentForm>(EMPTY);
  const { data = [], isLoading } = useInvestments();
  const create = useCreateInvestment();
  const remove = useDeleteInvestment();

  const set =
    <K extends keyof InvestmentForm>(key: K) =>
    (value: InvestmentForm[K] | ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setF((prev) => ({
        ...prev,
        [key]: asInputValue(value) ? (value.target.value as InvestmentForm[K]) : value,
      }));
    };

  const add = () => {
    if (!f.ativo || f.aportado === "") return;
    const aport = Number(f.aportado);
    create.mutate(
      {
        ativo: f.ativo,
        tipo: f.tipo,
        dataCompra: f.dataCompra,
        aportado: aport,
        valorAtual: f.valorAtual === "" ? aport : Number(f.valorAtual),
        vencimento: f.vencimento,
        obs: f.obs,
      },
      { onSuccess: () => setF(EMPTY) },
    );
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
          icon={rend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
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
            <Btn tone="gold" onClick={add} disabled={create.isPending}>
              {create.isPending ? "A adicionar..." : "+ Adicionar Investimento"}
            </Btn>
          </div>
        </div>
      </Section>

      <Section title="Carteira" tone="gold">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> A carregar...
          </div>
        ) : (
          <Table
            tone="gold"
            onDelete={(id) => remove.mutate(id)}
            rows={data}
            cols={[
              { key: "ativo", label: "Ativo" },
              { key: "tipo", label: "Tipo", render: (v) => <Badge text={String(v)} tone="gold" /> },
              { key: "dataCompra", label: "Compra", render: (v) => fmtDate(String(v || "")) },
              { key: "aportado", label: "Aportado", mono: true, render: (v) => fmt(Number(v || 0)) },
              { key: "valorAtual", label: "Atual", mono: true, render: (v) => fmt(Number(v || 0)) },
              {
                key: "_rend",
                label: "Rendimento",
                render: (_, row) => {
                  const r = row.valorAtual - row.aportado;
                  return (
                    <span className={cn("font-semibold tabular-nums", r >= 0 ? "text-emerald-400" : "text-rose-400")}>
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
                  const p =
                    row.aportado > 0
                      ? ((row.valorAtual - row.aportado) / row.aportado) * 100
                      : 0;
                  return (
                    <span className={cn("tabular-nums", p >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {p >= 0 ? "+" : ""}
                      {p.toFixed(2)}%
                    </span>
                  );
                },
              },
            ]}
          />
        )}
      </Section>
    </div>
  );
}

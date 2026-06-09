import { useState, type ChangeEvent } from "react";
import { Bell, CheckCircle2, Clock3, CreditCard, Loader2, Wallet } from "lucide-react";
import { Badge, Btn, CurrencyInput, Field, Input, KPI, Section, Select, Table } from "../components/ui";
import { fmt, fmtDate, today, asInputValue } from "../lib/format";
import { FORMAS, BillType } from "../types";
import type { BillForm, Bill } from "../types";
import { useBills, useCreateBill, useDeleteBill, useLiquidarBill } from "../hooks/useBills";

const EMPTY_RECEBER: BillForm = {
  type: BillType.RECEBER,
  contraparte: "",
  vencimento: today(),
  valor: "",
  descricao: "",
  liquidadoEm: null,
  forma: "PIX",
  recorrente: false,
  obs: "",
};

const EMPTY_PAGAR: BillForm = {
  type: BillType.PAGAR,
  contraparte: "",
  vencimento: today(),
  valor: "",
  descricao: "",
  liquidadoEm: null,
  forma: "Boleto",
  recorrente: false,
  obs: "",
};

type DaysStatus = { label: string; tone: "green" | "red" | "gold" | "accent" };

function getBillStatus(bill: Bill): DaysStatus {
  if (bill.liquidadoEm) {
    return { label: bill.type === BillType.PAGAR ? "✅ Pago" : "✅ Recebido", tone: "green" };
  }
  const days = Math.ceil((new Date(bill.vencimento).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "🚨 Vencido", tone: "red" };
  if (days <= 3) return { label: "🔴 Urgente", tone: "red" };
  if (days <= 7) return { label: "🔔 Em Breve", tone: "gold" };
  return { label: "🕐 Em Aberto", tone: "accent" };
}

export function ContasPage() {
  const [subTab, setSubTab] = useState<BillType>(BillType.PAGAR);

  const isPagar = subTab === BillType.PAGAR;
  const tone = isPagar ? ("red" as const) : ("accent" as const);
  const emptyForm = isPagar ? EMPTY_PAGAR : EMPTY_RECEBER;
  const [f, setF] = useState<BillForm>(emptyForm);

  const { data = [], isLoading } = useBills(subTab);
  const create = useCreateBill();
  const remove = useDeleteBill();
  const liquidar = useLiquidarBill();

  const set =
    <K extends keyof BillForm>(key: K) =>
    (value: BillForm[K] | ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setF((prev) => ({
        ...prev,
        [key]: asInputValue(value) ? (value.target.value as BillForm[K]) : value,
      }));
    };

  const handleSubTab = (t: BillType) => {
    setSubTab(t);
    setF(t === BillType.PAGAR ? EMPTY_PAGAR : EMPTY_RECEBER);
  };

  const add = () => {
    if (!f.contraparte || f.valor === "") return;
    create.mutate(
      { ...f, type: subTab, valor: Number(f.valor) },
      { onSuccess: () => setF(isPagar ? EMPTY_PAGAR : EMPTY_RECEBER) },
    );
  };

  const pendente = data.filter((b) => !b.liquidadoEm).reduce((s, b) => s + b.valor, 0);
  const liquidado = data.filter((b) => b.liquidadoEm).reduce((s, b) => s + b.valor, 0);
  const vencidos = data.filter((b) => !b.liquidadoEm && b.vencimento < today()).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Sub-tab: A Pagar / A Receber */}
      <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-1 w-fit">
        {([BillType.PAGAR, BillType.RECEBER] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleSubTab(t)}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
              subTab === t
                ? t === BillType.PAGAR
                  ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40"
                  : "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t === BillType.PAGAR ? (
              <CreditCard className="h-4 w-4" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {t === BillType.PAGAR ? "A Pagar" : "A Receber"}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPI
          label={isPagar ? "A Pagar" : "A Receber"}
          value={fmt(pendente)}
          tone={tone}
          icon={isPagar ? <CreditCard className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
        />
        <KPI
          label={isPagar ? "Já Pago" : "Já Recebido"}
          value={fmt(liquidado)}
          tone="green"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        {isPagar ? (
          <KPI
            label="Vencidos"
            value={`${vencidos} conta${vencidos !== 1 ? "s" : ""}`}
            tone={vencidos > 0 ? "red" : "green"}
            icon={<Bell className="h-4 w-4" />}
          />
        ) : (
          <KPI
            label="Em Aberto"
            value={`${data.filter((b) => !b.liquidadoEm).length}`}
            tone="gold"
            icon={<Clock3 className="h-4 w-4" />}
          />
        )}
      </div>

      {/* Formulário */}
      <Section
        title={isPagar ? "Adicionar Conta a Pagar" : "Adicionar Conta a Receber"}
        tone={tone}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={isPagar ? "Credor" : "Devedor"}>
            <Input
              placeholder={isPagar ? "A quem pagar..." : "Nome do devedor..."}
              value={f.contraparte}
              onChange={set("contraparte")}
            />
          </Field>

          <Field label="Valor" half>
            <CurrencyInput value={f.valor} onChange={set("valor")} tone={tone} />
          </Field>

          <Field label="Vencimento" half>
            <Input type="date" value={f.vencimento} onChange={set("vencimento")} />
          </Field>

          <Field label="Descrição">
            <Input placeholder="Motivo..." value={f.descricao} onChange={set("descricao")} />
          </Field>

          <Field label={isPagar ? "Pago em" : "Recebido em"} half>
            <Input
              type="date"
              value={f.liquidadoEm ?? ""}
              onChange={(e) =>
                setF((prev) => ({ ...prev, liquidadoEm: e.target.value || null }))
              }
            />
          </Field>

          <Field label="Forma" half>
            <Select value={f.forma} onChange={set("forma")}>
              {FORMAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>

          {isPagar && (
            <Field label="Recorrente?" half>
              <Select
                value={f.recorrente ? "Sim" : "Não"}
                onChange={(e) => set("recorrente")(e.target.value === "Sim")}
              >
                <option>Não</option>
                <option>Sim</option>
              </Select>
            </Field>
          )}

          <Field label="Observações" half>
            <Input placeholder="Anotações..." value={f.obs} onChange={set("obs")} />
          </Field>

          <div className="md:col-span-2">
            <Btn tone={tone} onClick={add} disabled={create.isPending}>
              {create.isPending ? "A adicionar..." : "+ Adicionar"}
            </Btn>
          </div>
        </div>
      </Section>

      {/* Lista */}
      <Section title={isPagar ? "Contas a Pagar" : "Contas a Receber"} tone={tone}>
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
              { key: "contraparte", label: isPagar ? "Credor" : "Devedor" },
              {
                key: "vencimento",
                label: "Vencimento",
                render: (v) => fmtDate(String(v || "")),
              },
              {
                key: "valor",
                label: "Valor",
                mono: true,
                render: (v) => fmt(Number(v || 0)),
              },
              {
                key: "_status",
                label: "Status",
                render: (_, row) => {
                  const s = getBillStatus(row as Bill);
                  return <Badge text={s.label} tone={s.tone} />;
                },
              },
              {
                key: "liquidadoEm",
                label: isPagar ? "Pago Em" : "Recebido Em",
                render: (v, row) =>
                  v ? (
                    fmtDate(String(v))
                  ) : (
                    <button
                      type="button"
                      onClick={() => liquidar.mutate((row as Bill).id)}
                      className="text-[11px] font-semibold text-slate-500 underline hover:text-emerald-400"
                    >
                      Liquidar
                    </button>
                  ),
              },
            ]}
          />
        )}
      </Section>
    </div>
  );
}

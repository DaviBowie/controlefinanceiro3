import { ArrowDown, ArrowUp, Bot, LineChart, PiggyBank, Wallet } from "lucide-react";
import { KPI } from "../components/ui";
import { fmt } from "../lib/format";
import { useTransactions } from "../hooks/useTransactions";
import { useBills } from "../hooks/useBills";
import { useInvestments } from "../hooks/useInvestments";
import { TransactionType, BillType } from "../types";
import type { TabId } from "../types";

export function DashboardPage({
  onNavigate,
}: {
  onNavigate: (tab: TabId) => void;
}) {
  const { data: receitas = [] } = useTransactions(TransactionType.RECEITA);
  const { data: despesas = [] } = useTransactions(TransactionType.DESPESA);
  const { data: bills = [] } = useBills();
  const { data: investments = [] } = useInvestments();

  const totalRec = receitas.reduce((s, r) => s + r.valor, 0);
  const totalDesp = despesas.reduce((s, r) => s + r.valor, 0);
  const saldo = totalRec - totalDesp;
  const receberPendente = bills
    .filter((b) => b.type === BillType.RECEBER && !b.liquidadoEm)
    .reduce((s, b) => s + b.valor, 0);
  const pagarPendente = bills
    .filter((b) => b.type === BillType.PAGAR && !b.liquidadoEm)
    .reduce((s, b) => s + b.valor, 0);
  const totalInvestido = investments.reduce((s, i) => s + i.valorAtual, 0);

  const quickActions: Array<{ label: string; tab: TabId; tone: string; color: string }> = [
    { label: "Lançar Receita", tab: "transacoes", tone: "green", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20" },
    { label: "Registar Despesa", tab: "transacoes", tone: "red", color: "border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" },
    { label: "Ver Contas", tab: "contas", tone: "accent", color: "border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20" },
    { label: "Investimentos", tab: "investimentos", tone: "gold", color: "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Background */}
      <img
        src="/hero-financas.jpg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero-financas.jpg.png"
      >
        <source src="/hero-financas.mp4.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.88),rgba(15,23,42,0.82)_45%,rgba(2,6,23,0.92))]" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-6">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/60 p-7 backdrop-blur-[2px] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            Painel Principal
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
            Controlo financeiro pessoal em único lugar.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            Acompanha receitas, despesas, contas a pagar, contas a receber e investimentos num só
            painel — alimentado em tempo real pela tua base de dados.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate("transacoes")}
              className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              Gerir Transações
            </button>
            <button
              type="button"
              onClick={() => onNavigate("ia")}
              className="rounded-lg border border-violet-400/40 bg-violet-500/10 px-6 py-3 text-sm font-bold text-violet-200 transition hover:bg-violet-500/20"
            >
              Análise com IA
            </button>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KPI
            label="Receitas"
            value={fmt(totalRec)}
            tone="green"
            icon={<ArrowDown className="h-4 w-4" />}
          />
          <KPI
            label="Despesas"
            value={fmt(totalDesp)}
            tone="red"
            icon={<ArrowUp className="h-4 w-4" />}
          />
          <KPI
            label="Saldo Atual"
            value={fmt(saldo)}
            tone={saldo >= 0 ? "green" : "red"}
            icon={<PiggyBank className="h-4 w-4" />}
          />
          <KPI
            label="A Receber"
            value={fmt(receberPendente)}
            tone="accent"
            icon={<Wallet className="h-4 w-4" />}
          />
          <KPI
            label="A Pagar"
            value={fmt(pagarPendente)}
            tone="red"
            icon={<Bot className="h-4 w-4" />}
          />
          <KPI
            label="Investimentos"
            value={fmt(totalInvestido)}
            tone="gold"
            icon={<LineChart className="h-4 w-4" />}
          />
        </section>

        {/* Atalhos */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-bold">Atalhos rápidos</h2>
          <p className="mt-1 text-sm text-slate-400">
            Entra diretamente na área que queres atualizar agora.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onNavigate(action.tab)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${action.color}`}
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

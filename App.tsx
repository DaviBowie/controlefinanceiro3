import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  CreditCard,
  Download,
  LineChart,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { toneMap } from "./src/lib/theme";
import { cn, fmt } from "./src/lib/format";
import { Btn } from "./src/components/ui";
import { DashboardPage } from "./src/pages/DashboardPage";
import { TransacoesPage } from "./src/pages/TransacoesPage";
import { ContasPage } from "./src/pages/ContasPage";
import { InvestimentosPage } from "./src/pages/InvestimentosPage";
import { IaAnalisePage } from "./src/pages/IaAnalisePage";
import { LoginPage } from "./src/pages/LoginPage";
import { RegisterPage } from "./src/pages/RegisterPage";
import { useAuth } from "./src/contexts/AuthContext";
import { useTransactions } from "./src/hooks/useTransactions";
import { TransactionType } from "./src/types";
import type { TabId } from "./src/types";
import * as XLSX from "xlsx";

const tabs: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: "dashboard", label: "Painel", icon: LayoutDashboard },
  { id: "transacoes", label: "Transações", icon: ArrowDown },
  { id: "contas", label: "Contas", icon: CreditCard },
  { id: "investimentos", label: "Investimentos", icon: LineChart },
  { id: "ia", label: "Análise IA", icon: Bot },
];

// ── Sub-componente do header (totais em tempo real) ───────────────────────────
function HeaderSummary() {
  const { data: receitas = [] } = useTransactions(TransactionType.RECEITA);
  const { data: despesas = [] } = useTransactions(TransactionType.DESPESA);
  const totalRec = receitas.reduce((s, r) => s + r.valor, 0);
  const totalDesp = despesas.reduce((s, r) => s + r.valor, 0);
  const saldo = totalRec - totalDesp;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const addSheet = (
      name: string,
      rows: object[],
      cols: Array<{ key: string; label: string }>,
    ) => {
      const ws = XLSX.utils.aoa_to_sheet([
        cols.map((c) => c.label),
        ...rows.map((row) =>
          cols.map((c) => (row as Record<string, unknown>)[c.key] ?? ""),
        ),
      ]);
      ws["!cols"] = cols.map(() => ({ wch: 20 }));
      XLSX.utils.book_append_sheet(wb, ws, name);
    };
    addSheet("Receitas", receitas, [
      { key: "data", label: "Data" },
      { key: "descricao", label: "Descrição" },
      { key: "valor", label: "Valor" },
      { key: "categoria", label: "Categoria" },
      { key: "forma", label: "Forma" },
      { key: "status", label: "Recebido" },
    ]);
    addSheet("Despesas", despesas, [
      { key: "data", label: "Data" },
      { key: "descricao", label: "Descrição" },
      { key: "valor", label: "Valor" },
      { key: "categoria", label: "Categoria" },
      { key: "forma", label: "Forma" },
      { key: "status", label: "Pago" },
      { key: "parcela", label: "Parcela" },
    ]);
    XLSX.writeFile(wb, `financeiro_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="hidden items-center gap-4 text-xs sm:flex">
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
          <ArrowDown className="h-3.5 w-3.5" /> {fmt(totalRec)}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
          <ArrowUp className="h-3.5 w-3.5" /> {fmt(totalDesp)}
        </span>
        <span className={cn("font-bold", saldo >= 0 ? "text-emerald-400" : "text-rose-400")}>
          = {fmt(saldo)}
        </span>
      </div>
      <Btn tone="accent" small onClick={exportExcel}>
        <span className="inline-flex items-center gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Excel
        </span>
      </Btn>
    </div>
  );
}

// ── Layout autenticado ────────────────────────────────────────────────────────
function AuthenticatedApp() {
  const [active, setActive] = useState<TabId>("dashboard");
  const { user, logout } = useAuth();

  if (active === "dashboard") {
    return <DashboardPage onNavigate={setActive} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActive("dashboard")}
            className="group flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/70 px-2 py-1.5 transition hover:border-slate-600 hover:bg-slate-900"
          >
            <img
              src="/hero-logotipo.jpg.jpg"
              alt="Logotipo FinanControl"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-blue-400/40"
            />
            <div className="text-left leading-tight">
              <div className="text-sm font-extrabold tracking-tight text-slate-100">
                FinanControl
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                {user?.name ?? "Gestão Financeira"}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <HeaderSummary />
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
              title={`Sair (${user?.email ?? ""})`}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {tabs
            .filter((t) => t.id !== "dashboard")
            .map((tab) => {
              const isActive = tab.id === active;
              const TabIcon = tab.icon;
              const tone =
                tab.id === "transacoes"
                  ? "green"
                  : tab.id === "contas"
                    ? "accent"
                    : tab.id === "investimentos"
                      ? "gold"
                      : "purple";
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition",
                    isActive
                      ? cn(
                          tone === "gold"
                            ? "text-amber-300"
                            : toneMap[tone as keyof typeof toneMap].text,
                          toneMap[tone as keyof typeof toneMap].softBg,
                          toneMap[tone as keyof typeof toneMap].border,
                        )
                      : "border-transparent text-slate-500 hover:text-slate-300",
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === "ia" && (
                    <span className="rounded bg-violet-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      IA
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        {active === "transacoes" && <TransacoesPage />}
        {active === "contas" && <ContasPage />}
        {active === "investimentos" && <InvestimentosPage />}
        {active === "ia" && <IaAnalisePage />}
      </main>
    </div>
  );
}

// ── Root: decide entre Auth e App ─────────────────────────────────────────────
export default function App() {
  const { token } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register">("login");

  if (!token) {
    return authView === "login" ? (
      <LoginPage onGoToRegister={() => setAuthView("register")} />
    ) : (
      <RegisterPage onGoToLogin={() => setAuthView("login")} />
    );
  }

  return <AuthenticatedApp />;
}

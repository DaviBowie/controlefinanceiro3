import { useRef, useState } from "react";
import { BrainCircuit, Loader2, Search, Send } from "lucide-react";
import { Btn, Input, Markdown, Section } from "../components/ui";
import { iaApi } from "../services/api";
import type { ChatMessage } from "../types/ia";
import { cn } from "../lib/format";

const SUGGESTIONS = [
  "Onde posso cortar gastos este mês?",
  "A minha taxa de poupança é boa?",
  "Qual categoria gasto mais desnecessariamente?",
  "Como estão os meus investimentos comparados à inflação?",
  "Vou conseguir poupar mais no próximo mês?",
];

export function IaAnalisePage() {
  const [chatId, setChatId] = useState<string | undefined>();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const runAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysis(null);
    try {
      const { response } = await iaApi.analise();
      setAnalysis(response);
      setHistory([{ role: "assistant", content: response, isAnalysis: true }]);
    } catch {
      setAnalysis("Erro ao contactar a IA. Verifica se o backend está a correr.");
    }
    setAnalysisLoading(false);
  };

  const sendQuestion = async (override?: string) => {
    const msg = (override ?? question).trim();
    if (!msg || chatLoading) return;
    if (!override) setQuestion("");

    setChatLoading(true);
    setHistory((prev) => [...prev, { role: "user", content: msg }]);

    try {
      const { response, chatId: id } = await iaApi.chat(msg, chatId);
      if (!chatId) setChatId(id);
      setHistory((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao conectar. Tente novamente." },
      ]);
    }

    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const visibleHistory = history.filter((m) => !m.isAnalysis);

  return (
    <div className="flex flex-col gap-5">
      {/* Hero da IA */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-blue-500/10 p-7">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 text-2xl font-extrabold text-slate-100">
            <BrainCircuit className="h-6 w-6 text-violet-300" />
            Análise Inteligente
          </div>
          <p className="max-w-[520px] text-sm leading-6 text-slate-300">
            O Jarvis analisa os teus dados financeiros em tempo real e detecta padrões, tendências
            e oportunidades de melhoria.
          </p>
        </div>
        <Btn tone="purple" onClick={runAnalysis} disabled={analysisLoading}>
          <span className="inline-flex items-center gap-2">
            {analysisLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="h-4 w-4" />
            )}
            {analysisLoading ? "Analisando..." : "Gerar análise completa"}
          </span>
        </Btn>
      </div>

      {/* Loading state */}
      {analysisLoading && (
        <div className="rounded-2xl border border-violet-500/30 bg-slate-900/70 p-10 text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-violet-400" />
          <p className="mb-1 text-base font-bold text-violet-400">
            Analisando os teus dados financeiros...
          </p>
          <p className="text-sm text-slate-500">A gerar recomendações personalizadas.</p>
        </div>
      )}

      {/* Resultado da análise */}
      {analysis && !analysisLoading && (
        <div className="overflow-hidden rounded-2xl border border-violet-500/30 bg-slate-900/70">
          <div className="flex items-center gap-2 border-b border-slate-800 bg-violet-500/10 px-6 py-4">
            <div className="h-5 w-1 rounded-full bg-violet-500" />
            <span className="text-sm font-bold text-slate-100">Análise Completa</span>
            <span className="ml-auto text-[11px] text-slate-500">Gerada agora</span>
          </div>
          <div className="px-7 py-6">
            <Markdown text={analysis} />
          </div>
        </div>
      )}

      {/* Chat */}
      <Section title="Pergunte sobre as suas finanças" tone="purple">
        {/* Sugestões */}
        {visibleHistory.length === 0 && (
          <div className="mb-5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Sugestões
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
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

        {/* Histórico do chat */}
        {visibleHistory.length > 0 && (
          <div className="mb-4 flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
            {visibleHistory.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] border px-4 py-3 text-sm leading-6",
                    msg.role === "user"
                      ? "rounded-[18px_18px_4px_18px] border-violet-400 bg-violet-500 text-white"
                      : "rounded-[18px_18px_18px_4px] border-slate-700 bg-slate-800 text-slate-100",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Markdown text={msg.content} />
                  ) : (
                    msg.content
                  )}
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

        {/* Input */}
        <div className="flex gap-2.5">
          <Input
            className="flex-1 border-violet-500/40 focus:border-violet-400 focus:ring-violet-400/20"
            placeholder="Ex: Qual mês gastei mais? Como reduzir despesas?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
            disabled={chatLoading}
          />
          <Btn
            tone="purple"
            onClick={() => sendQuestion()}
            disabled={chatLoading || !question.trim()}
            small
          >
            <span className="inline-flex items-center gap-1.5">
              {chatLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Enviar
            </span>
          </Btn>
        </div>
      </Section>

      {/* Estado sem dados */}
      {!analysis && !analysisLoading && visibleHistory.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
          <Search className="mx-auto mb-3 h-9 w-9 text-slate-400" />
          <p className="mb-1 text-base font-bold text-slate-100">
            Clica em "Gerar análise completa" para começar
          </p>
          <p className="text-sm text-slate-500">
            O Jarvis lê os teus dados diretamente da base de dados — sem enviar nada manualmente.
          </p>
        </div>
      )}
    </div>
  );
}

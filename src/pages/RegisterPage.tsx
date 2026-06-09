import { useState } from "react";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { authApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/format";

export function RegisterPage({ onGoToLogin }: { onGoToLogin: () => void }) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authApi.register({ name, email, password });
      login(token, user);
    } catch (err: unknown) {
      const raw = (err as { response?: { data?: { message?: string | string[] } } })?.response
        ?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : raw;
      setError(typeof msg === "string" ? msg : "Erro ao criar a conta. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur">
          {/* Header */}
          <div className="px-8 pb-0 pt-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/30">
              <User className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100">Criar conta</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              O teu gestor financeiro pessoal, grátis e privado
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="O teu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="o@teu.email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Password{" "}
                  <span className="normal-case text-slate-600">(mínimo 8 caracteres)</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition",
                  loading
                    ? "cursor-not-allowed bg-slate-700 text-slate-400"
                    : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-400",
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    A criar conta...
                  </>
                ) : (
                  "Criar conta"
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-slate-800 px-8 py-5 text-center">
            <p className="text-sm text-slate-500">
              Já tens conta?{" "}
              <button
                type="button"
                onClick={onGoToLogin}
                className="font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                Entrar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

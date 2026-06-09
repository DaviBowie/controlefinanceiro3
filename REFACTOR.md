# Refatoração do Frontend — guia de migração

Estado: **fundação criada**. A app antiga (`App.tsx` monolítico) continua a
funcionar. A nova estrutura modular foi criada em paralelo e está pronta a
receber as restantes tabs, uma de cada vez, sem partir nada.

## Nova estrutura

```
src/
├── types/                  # ✅ tipos do domínio (enums, entities, ia)
├── lib/                    # ✅ format.ts, theme.ts, queryClient.ts
├── services/api.ts         # ✅ axios + endpoints + camada anti-corrupção
├── hooks/                  # ✅ useDespesas (exemplo React Query)
├── components/ui/          # ✅ Input, Select, CurrencyInput, Field, Badge,
│                           #     KPI, Section, Btn, Table, Markdown
└── features/
    └── despesas/DespesasTab.tsx   # ✅ tab-exemplo ligada à API
```

## Já feito (fundação)

1. **Tipos** extraídos de `App.tsx` para `src/types/`.
2. **UI** extraída para `src/components/ui/` (sem alterações visuais).
3. **`services/api.ts`** com instância axios e tradução `boolean ↔ "Sim"/"Não"`.
4. **React Query** configurado (`main.tsx` já tem o `QueryClientProvider`).
5. **`DespesasTab`** reescrita: sem `localStorage`, usa `useDespesas` / `useCreateDespesa` / `useDeleteDespesa`.

## Próximos passos (iteração — replicar o padrão)

Para **cada** entidade que falta (`receitas`, `receber`, `pagar`, `investimentos`):

1. **Backend**: criar o módulo (copiar `src/despesas/` no backend, trocar os nomes).
2. **Frontend — service**: adicionar `receitasApi` em `src/services/api.ts`.
3. **Frontend — hook**: criar `src/hooks/useReceitas.ts` (igual a `useDespesas.ts`).
4. **Frontend — feature**: mover a tab de `App.tsx` para `src/features/<nome>/<Nome>Tab.tsx`
   e trocar props/`localStorage` pelos hooks.
5. Repetir para `IATab` (usar `iaApi.chat` / `iaApi.analise`) e `LandingPage`.

## Passo final

Quando todas as tabs estiverem em `src/features/`, o `App.tsx` fica reduzido a:
header + barra de tabs + render condicional dos componentes de feature
(sem estado de dados, sem `loadData`/`saveData`).

## Como correr

```bash
# 1. instalar as novas dependências
npm install

# 2. garantir que o backend está a correr (ver controle-financeiro-backend)

# 3. configurar a URL da API
cp .env.example .env

# 4. arrancar
npm run dev
```

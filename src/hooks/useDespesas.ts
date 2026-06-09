import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { despesasApi } from "../services/api";
import type { Despesa } from "../types";

const KEY = ["despesas"] as const;

/** Lista as despesas (com cache e revalidacao geridos pelo React Query). */
export function useDespesas() {
  return useQuery({ queryKey: KEY, queryFn: despesasApi.list });
}

export function useCreateDespesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nova: Omit<Despesa, "id">) => despesasApi.create(nova),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateDespesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Despesa> }) =>
      despesasApi.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteDespesa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => despesasApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../services/api";
import type { CreateTransactionDto, UpdateTransactionDto } from "../types";
import { TransactionType } from "../types";

export const txKeys = {
  all: ["transactions"] as const,
  byType: (type: TransactionType) => ["transactions", type] as const,
};

export function useTransactions(type?: TransactionType) {
  return useQuery({
    queryKey: type ? txKeys.byType(type) : txKeys.all,
    queryFn: () => transactionsApi.list(type),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTransactionDto) => transactionsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: txKeys.all }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateTransactionDto }) =>
      transactionsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: txKeys.all }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transactionsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: txKeys.all }),
  });
}

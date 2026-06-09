import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { investmentsApi } from "../services/api";
import type { CreateInvestmentDto, UpdateInvestmentDto } from "../types";

export const invKeys = {
  all: ["investments"] as const,
};

export function useInvestments() {
  return useQuery({
    queryKey: invKeys.all,
    queryFn: investmentsApi.list,
  });
}

export function useCreateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvestmentDto) => investmentsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: invKeys.all }),
  });
}

export function useUpdateInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateInvestmentDto }) =>
      investmentsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: invKeys.all }),
  });
}

export function useDeleteInvestment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => investmentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: invKeys.all }),
  });
}

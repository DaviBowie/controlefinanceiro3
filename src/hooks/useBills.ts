import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billsApi } from "../services/api";
import type { CreateBillDto, UpdateBillDto } from "../types";
import { BillType } from "../types";

export const billKeys = {
  all: ["bills"] as const,
  byType: (type: BillType) => ["bills", type] as const,
};

export function useBills(type?: BillType) {
  return useQuery({
    queryKey: type ? billKeys.byType(type) : billKeys.all,
    queryFn: () => billsApi.list(type),
  });
}

export function useCreateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBillDto) => billsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: billKeys.all }),
  });
}

export function useLiquidarBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => billsApi.liquidar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: billKeys.all }),
  });
}

export function useDeleteBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => billsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: billKeys.all }),
  });
}

export function useUpdateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateBillDto }) =>
      billsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: billKeys.all }),
  });
}

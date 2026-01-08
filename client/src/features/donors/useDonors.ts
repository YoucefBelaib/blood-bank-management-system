import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { donorsApi } from "@/api";
import type { Donor, CreateDonorInput } from "@/types";

export function useDonors() {
  const queryClient = useQueryClient();

  const {
    data: donors = [],
    isLoading,
    error,
  } = useQuery<Donor[]>({
    queryKey: ["donors"],
    queryFn: donorsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDonorInput) => donorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => donorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });

  const createDonor = async (data: CreateDonorInput) => {
    return createMutation.mutateAsync(data);
  };

  const deleteDonor = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    donors,
    isLoading,
    error,
    createDonor,
    deleteDonor,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useDonor(id: string) {
  return useQuery<Donor>({
    queryKey: ["donors", id],
    queryFn: () => donorsApi.getById(id),
    enabled: !!id,
  });
}

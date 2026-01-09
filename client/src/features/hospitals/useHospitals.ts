import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hospitalsApi } from "@/api";
import type {
  Hospital,
  CreateHospitalInput,
  BloodRequest,
  CreateBloodRequestInput,
} from "@/types";

export function useHospitals() {
  const queryClient = useQueryClient();

  const {
    data: hospitals = [],
    isLoading,
    error,
  } = useQuery<Hospital[]>({
    queryKey: ["hospitals"],
    queryFn: hospitalsApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      hospitalsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateHospitalInput) => hospitalsApi.signup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
    },
  });

  const updateStatus = async (id: string, status: string) => {
    return updateStatusMutation.mutateAsync({ id, status });
  };

  const createHospital = async (data: CreateHospitalInput) => {
    return createMutation.mutateAsync(data);
  };

  return {
    hospitals,
    isLoading,
    error,
    updateStatus,
    isUpdating: updateStatusMutation.isPending,
    createHospital,
    isCreating: createMutation.isPending,
  };
}

export function useHospital(id: string) {
  return useQuery<Hospital>({
    queryKey: ["hospitals", id],
    queryFn: () => hospitalsApi.getById(id),
    enabled: !!id,
  });
}

export function useHospitalAuth() {
  const queryClient = useQueryClient();

  const { data: hospital, isLoading } = useQuery({
    queryKey: ["hospital", "current"],
    queryFn: hospitalsApi.getCurrentHospital,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      hospitalsApi.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital", "current"] });
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: CreateHospitalInput) => hospitalsApi.signup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital", "current"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: hospitalsApi.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital", "current"] });
    },
  });

  const requestPasswordResetMutation = useMutation({
    mutationFn: (email: string) => hospitalsApi.requestPasswordReset(email),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => hospitalsApi.resetPassword(token, newPassword),
  });

  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const signup = async (data: CreateHospitalInput) => {
    return signupMutation.mutateAsync(data);
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  const requestPasswordReset = async (email: string) => {
    return requestPasswordResetMutation.mutateAsync(email);
  };

  const validateResetToken = async (token: string) => {
    return hospitalsApi.validateResetToken(token);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return resetPasswordMutation.mutateAsync({ token, newPassword });
  };

  return {
    hospital,
    isLoading,
    isAuthenticated: !!hospital,
    login,
    signup,
    logout,
    requestPasswordReset,
    isRequestingReset: requestPasswordResetMutation.isPending,
    validateResetToken,
    resetPassword,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}

export function useBloodRequests() {
  const queryClient = useQueryClient();

  const {
    data: requests = [],
    isLoading,
    error,
  } = useQuery<BloodRequest[]>({
    queryKey: ["blood-requests"],
    queryFn: hospitalsApi.getAllBloodRequests,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      hospitalsApi.updateBloodRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-requests"] });
    },
  });

  const updateStatus = async (id: string, status: string) => {
    return updateStatusMutation.mutateAsync({ id, status });
  };

  return {
    requests,
    isLoading,
    error,
    updateStatus,
    isUpdating: updateStatusMutation.isPending,
  };
}

export function useHospitalBloodRequests() {
  const queryClient = useQueryClient();

  const {
    data: requests = [],
    isLoading,
    error,
  } = useQuery<BloodRequest[]>({
    queryKey: ["hospital", "blood-requests"],
    queryFn: hospitalsApi.getHospitalBloodRequests,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBloodRequestInput) =>
      hospitalsApi.createBloodRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["hospital", "blood-requests"],
      });
      queryClient.invalidateQueries({ queryKey: ["blood-requests"] });
    },
  });

  const createRequest = async (data: CreateBloodRequestInput) => {
    return createMutation.mutateAsync(data);
  };

  return {
    requests,
    isLoading,
    error,
    createRequest,
    isCreating: createMutation.isPending,
  };
}

// Public blood request (for non-authenticated users)
export function usePublicBloodRequest() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateBloodRequestInput) =>
      hospitalsApi.createPublicBloodRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-requests"] });
      queryClient.invalidateQueries({ queryKey: ["blood-inventory"] });
    },
  });

  const createRequest = async (data: CreateBloodRequestInput) => {
    return createMutation.mutateAsync(data);
  };

  return {
    createRequest,
    isCreating: createMutation.isPending,
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api";
import type { User } from "@/types";

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Only consider user authenticated if they exist and are approved
  const user: User | null =
    userData?.approved === false ? null : userData || null;
  const isAuthenticated = !!user;

  const loginMutation = useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => authApi.login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  const signupMutation = useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => authApi.signup(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  const requestPasswordResetMutation = useMutation({
    mutationFn: (username: string) => authApi.requestPasswordReset(username),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => authApi.resetPassword(token, newPassword),
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const signup = async (username: string, password: string) => {
    await signupMutation.mutateAsync({ username, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const requestPasswordReset = async (username: string) => {
    return requestPasswordResetMutation.mutateAsync(username);
  };

  const validateResetToken = async (token: string) => {
    return authApi.validateResetToken(token);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return resetPasswordMutation.mutateAsync({ token, newPassword });
  };

  return {
    user,
    isLoading,
    isAuthenticated,
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

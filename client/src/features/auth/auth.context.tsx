import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./useAuth";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (username: string) => Promise<{ message: string }>;
  isRequestingReset: boolean;
  validateResetToken: (token: string) => Promise<{ valid: boolean }>;
  resetPassword: (
    token: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
  isResettingPassword: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

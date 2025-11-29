// components/ProtectedRoute.tsx
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (!user) {
    setLocation("/login");
    return null;
  }

  return <>{children}</>; // render the protected content
};

export default ProtectedRoute;

import { useAuthContext } from "@/features/auth";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthContext();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A30000]"></div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

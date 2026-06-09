import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("patient" | "doctor" | "admin")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-slate-600">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    // Role not allowed - redirect to a safe page (e.g., their own dashboard or 404)
    const fallbackPath = user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

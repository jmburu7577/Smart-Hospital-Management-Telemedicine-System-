import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("patient" | "doctor" | "admin")[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // IMPORTANT: wait until auth is loaded
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    const fallbackPath =
      user.role === "doctor"
        ? "/doctor/dashboard"
        : user.role === "admin"
          ? "/admin/dashboard"
          : "/patient/dashboard";

    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
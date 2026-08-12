import { ReactNode, useEffect } from "react";
import { Redirect } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ProtectedRoute({ children, role }: { children: ReactNode; role?: "admin" | "user" }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      startLogin();
    }
  }, [loading, user]);

  if (loading) return <div className="route-loading"><div className="loader-dot" /><span>Loading workspace…</span></div>;
  if (!user) return <Redirect to="/login" />;
  if (role && user.role !== role) return <Redirect to={user.role === "admin" ? "/admin" : "/customer"} />;
  return <>{children}</>;
}

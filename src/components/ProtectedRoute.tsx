import { useConvexAuth } from "convex/react";
import { Navigate, Outlet } from "react-router-dom";

function LoadingSkeleton() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-2 animate-pulse">✦</div>
        <p className="text-[11px] tracking-wider uppercase text-white/30">Loading...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

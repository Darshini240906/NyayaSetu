import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProtectedRoute() {
  const { token, user } = useAuthStore();

  // Not logged in at all
  if (!token) return <Navigate to="/login" replace />;

  // Token exists but user still loading — show blank loading state
  // not black screen — this prevents the crash
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F1A]">
        <div className="flex items-center gap-3 text-white/50">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          Loading...
        </div>
      </div>
    );
  }

  return <Outlet />;
}
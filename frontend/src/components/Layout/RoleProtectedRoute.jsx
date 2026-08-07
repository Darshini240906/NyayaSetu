import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * Gates a route to a specific set of roles. Sits *inside* <ProtectedRoute />,
 * so it can assume the user is already authenticated and `user` is loaded.
 *
 * Usage:
 *   <Route element={<RoleProtectedRoute allow={["org_super_admin"]} />}>
 *     <Route path="/analytics" element={<AnalyticsPage />} />
 *   </Route>
 *
 * This is a UX guard only — it hides the page and redirects so employees/
 * managers/HR/guests never see it in the app. The real security boundary is
 * the backend's "analytics:read" permission check, which these roles don't
 * have regardless of what the frontend does.
 */
export default function RoleProtectedRoute({ allow = [] }) {
  const { user } = useAuthStore();

  if (!user) return null; // ProtectedRoute already handles the loading state
  if (!allow.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
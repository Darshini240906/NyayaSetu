import { useLocation, Link } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useTheme } from "../../context/ThemeContext";
import { useSidebar } from "./SidebarContext";

const LABELS = {
  dashboard: "Overview", chat: "AI Assistant", documents: "Documents",
  search: "Search", domains: "Domains", hr: "HR", "knowledge-map": "Knowledge Map",
  admin: "Admin", analytics: "Analytics", reports: "Reports", settings: "Settings",
};

export default function Topbar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const { toggle } = useSidebar();
  const segment = location.pathname.split("/").filter(Boolean)[0] || "dashboard";
  const label = LABELS[segment] || segment;

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-base px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border text-rose-muted hover:bg-white/5 hover:text-cream transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Link to="/dashboard" className="hidden truncate text-rose-muted hover:text-cream transition-colors sm:inline">
            Dashboard
          </Link>
          <span className="hidden text-rose-muted sm:inline">›</span>
          <span className="truncate font-medium text-cream">{label}</span>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
        <button
          onClick={toggleTheme}
          className="flex h-6 w-11 items-center rounded-full bg-surface-hover px-0.5 transition-colors"
          aria-label="Toggle theme"
        >
          <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gold transition-transform ${isDark ? "translate-x-0" : "translate-x-5"}`}>
            {isDark ? <Moon size={11} className="text-base-deep" /> : <Sun size={11} className="text-base-deep" />}
          </div>
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-base-deep">
          {(user?.full_name || "U").split(" ").map(n => n[0]).slice(0, 2).join("")}
        </div>
      </div>
    </header>
  );
}

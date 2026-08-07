import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutDashboard, MessageSquare, FileText, Search, Settings, FolderOpen, LogOut, Shield, Sparkles, X, Scale, Bell, Gavel } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { hasPermission } from "../../utils/permissions";
import { useSidebar } from "./SidebarContext";
import { useTheme } from "../../context/ThemeContext";
import logoLight from "../../assets/logo-light.png";
import logoDark from "../../assets/logo-dark.png";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", permission: null },
  { to: "/legal-assistant", icon: Scale, label: "Understand My Case", permission: null },
  { to: "/reminders", icon: Bell, label: "Reminders", permission: null },
  { to: "/court-dashboard", icon: Gavel, label: "Triage Dashboard", permission: null },
  { to: "/chat", icon: MessageSquare, label: "AI Assistant", permission: "query:run" },
  { to: "/documents", icon: FileText, label: "Documents", permission: "documents:read" },
  { to: "/search", icon: Search, label: "Search", permission: "query:run" },
  { to: "/reports", icon: Sparkles, label: "Reports", permission: "query:run" },
  { to: "/domains", icon: FolderOpen, label: "Domains", permission: "documents:read" },
  { to: "/admin", icon: Shield, label: "Admin", permission: "admin:read" },
];

function SidebarContent({ expanded, visibleNav, user, logout, navigate, onNavigate, showClose, isDark }) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <img src={isDark ? logoDark : logoLight} alt="NyayaSetu" className="h-full w-full object-contain" />
          </div>
          {expanded && (
            <span className="font-display text-lg font-bold text-cream whitespace-nowrap animate-fade-in">
              Nyaya<span className="text-gold">Setu</span>
            </span>
          )}
        </div>
        {showClose && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-lg p-2 text-rose-muted hover:bg-white/5 hover:text-cream transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-1">
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors
              ${isActive ? "bg-gold/15 text-gold" : "text-rose-muted hover:bg-white/5 hover:text-cream"}`
            }
          >
            <Icon size={19} className="flex-shrink-0" />
            {expanded && <span className="whitespace-nowrap animate-fade-in">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={() => { navigate("/settings"); onNavigate?.(); }}
          className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-rose-muted hover:bg-white/5 hover:text-cream transition-colors"
        >
          <Settings size={19} className="flex-shrink-0" />
          {expanded && <span className="whitespace-nowrap animate-fade-in">Settings</span>}
        </button>

        <div className={`flex items-center gap-3 px-3 py-2 ${expanded ? "" : "justify-center"}`}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-base-deep">
            {(user?.full_name || "U").split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          {expanded && (
            <div className="min-w-0 animate-fade-in">
              <p className="truncate text-sm font-medium text-cream">{user?.full_name || "User"}</p>
              <p className="truncate text-xs text-rose-muted capitalize">{user?.role?.replace(/_/g, " ") || "Guest"}</p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-muted hover:bg-danger/10 hover:text-danger transition-colors"
        >
          <LogOut size={17} className="flex-shrink-0" />
          {expanded && <span className="whitespace-nowrap animate-fade-in">Log out</span>}
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { mobileOpen, close } = useSidebar();
  const { isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const visibleNav = NAV.filter(item => hasPermission(user, item.permission));

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  return (
    <>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`hidden md:flex h-full flex-shrink-0 flex-col border-r border-border bg-base-deep transition-all duration-300 ease-out
          ${expanded ? "w-60" : "w-[84px]"}`}
      >
        <SidebarContent
          expanded={expanded}
          visibleNav={visibleNav}
          user={user}
          logout={logout}
          navigate={navigate}
          isDark={isDark}
        />
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-base-deep/60 backdrop-blur-sm md:hidden"
            onClick={close}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-base-deep shadow-xl md:hidden animate-fade-in">
            <SidebarContent
              expanded
              visibleNav={visibleNav}
              user={user}
              logout={logout}
              navigate={navigate}
              isDark={isDark}
              onNavigate={close}
              showClose
            />
          </aside>
        </>
      )}
    </>
  );
}

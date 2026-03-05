import { motion } from "framer-motion";
import { useState } from "react";
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Icon } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import useAuthStore from "../store/slices/authStore";
import { ROUTES } from "../utils/constants";
import { cn, getInitials } from "../utils/helpers";

const NAV_ITEMS = [
  { icon: "home", label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD },
  { icon: "users", label: "User Management", path: ROUTES.ADMIN_USERS },
  { icon: "book", label: "Course Management", path: ROUTES.ADMIN_COURSES },
  { icon: "check", label: "Course Approval", path: ROUTES.ADMIN_APPROVAL },
  { icon: "chart", label: "Analytics", path: ROUTES.ADMIN_ANALYTICS },
  { icon: "dollar", label: "Revenue", path: ROUTES.ADMIN_REVENUE },
  { icon: "note", label: "Reports", path: ROUTES.ADMIN_REPORTS },
  { icon: "settings", label: "Settings", path: ROUTES.ADMIN_SETTINGS },
  { icon: "shield", label: "Logs", path: ROUTES.ADMIN_LOGS },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "var(--bg-page)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <ScrollRestoration />

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sticky top-0 flex flex-col h-screen overflow-hidden border-r shrink-0 border-white/10"
        style={{ background: "rgba(0,0,0,0.2)", backdropFilter: "blur(20px)" }}
      >
        {/* Logo */}
        <div className="flex items-center h-16 gap-3 p-4 border-b border-white/10">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 shrink-0">
            <Icon name="shield" size={18} color="white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-black text-white whitespace-nowrap">
              Admin Panel
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1.5 rounded-lg hover:bg-white/10 shrink-0"
          >
            <Icon
              name={collapsed ? "chevronRight" : "menu"}
              size={18}
              color="white"
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1 gap-1 p-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-semibold w-full",
                  active
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon name={item.icon} size={20} color="currentColor" />
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-xl bg-white/20 shrink-0">
                {getInitials(user?.name || "A")}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs truncate text-primary/70">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center w-full gap-3 px-3 py-3 text-sm font-semibold transition-colors rounded-xl text-danger/80 hover:bg-danger/30/30"
            title={collapsed ? "Logout" : undefined}
          >
            <Icon name="logout" size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

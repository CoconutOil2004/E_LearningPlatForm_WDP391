import { useState } from "react";
import { Outlet, useLocation, useNavigate, ScrollRestoration } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../components/ui";
import { cn, getInitials } from "../utils/helpers";
import { ROUTES } from "../utils/constants";
import useAuthStore from "../store/slices/authStore";
import { useAuth } from "../contexts/AuthContext";

const NAV_ITEMS = [
  { icon: "home", label: "Dashboard", path: ROUTES.INSTRUCTOR_DASHBOARD },
  { icon: "book", label: "My Courses", path: ROUTES.INSTRUCTOR_COURSES },
  { icon: "plus", label: "Create Course", path: ROUTES.CREATE_COURSE },
  { icon: "dollar", label: "Revenue", path: ROUTES.INSTRUCTOR_REVENUE },
  { icon: "users", label: "Students", path: ROUTES.INSTRUCTOR_STUDENTS },
  { icon: "chart", label: "Analytics", path: ROUTES.INSTRUCTOR_ANALYTICS },
  { icon: "user", label: "Profile", path: ROUTES.INSTRUCTOR_PROFILE },
];

const InstructorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-page)", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <ScrollRestoration />

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen sticky top-0 flex flex-col border-r border-border bg-white overflow-hidden shrink-0"
        style={{ boxShadow: "4px 0 20px rgba(0,0,0,0.04)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 h-16 border-b border-border">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Icon name="book" size={18} color="white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-black text-lg whitespace-nowrap"
                style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                EduFlow
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1.5 rounded-lg hover:bg-subtle shrink-0"
          >
            <Icon name={collapsed ? "chevronRight" : "menu"} size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.path}
                whileHover={{ x: 2 }}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-semibold",
                  active ? "text-white" : "text-muted hover:bg-primary/10 hover:text-primary"
                )}
                style={active ? { background: "var(--gradient-brand)", boxShadow: "0 4px 15px rgba(79,70,229,0.3)" } : {}}
                title={collapsed ? item.label : undefined}
              >
                <Icon name={item.icon} size={20} color={active ? "white" : "currentColor"} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: "var(--gradient-brand)" }}
              >
                {getInitials(user?.name || "I")}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-heading truncate">{user?.name || "Instructor"}</p>
                <p className="text-xs text-disabled truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <motion.button
            whileHover={{ x: 2 }}
            onClick={logout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-danger hover:bg-danger/10 w-full transition-colors"
            title={collapsed ? "Logout" : undefined}
          >
            <Icon name="logout" size={20} />
            {!collapsed && <span>Logout</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default InstructorLayout;

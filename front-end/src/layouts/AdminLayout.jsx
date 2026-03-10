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

      {/* ── Sidebar Arctic Tech (Bản thu gọn không cuộn) ─────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex flex-col h-screen overflow-hidden border-r shrink-0 z-30 shadow-2xl"
        style={{ 
            backgroundColor: "var(--admin-sidebar-bg)",
            borderColor: "var(--admin-sidebar-border)"
        }}
      >
        {/* Header: Thu nhỏ chiều cao từ 20 xuống 14 */}
        <div className="flex items-center h-14 gap-2 px-4 border-b border-white/5 bg-black/10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00BFA5] shrink-0">
            <Icon name="terminal" size={16} color="white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-white uppercase truncate">EduFlow</span>
              <span className="text-[8px] font-medium text-blue-200/50 tracking-tighter">Admin Hub</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 text-white/40 hover:text-white"
          >
            <Icon name={collapsed ? "chevronRight" : "menu"} size={16} />
          </button>
        </div>

        {/* Nav: Giảm gap và padding để không tràn màn hình */}
        <nav className="flex flex-col flex-1 gap-0.5 p-2 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px] font-semibold w-full group",
                  active
                    ? "bg-white/10 text-[#00BFA5] shadow-sm"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
                title={collapsed ? item.label : undefined}
              >
                <div className={cn(
                    "shrink-0",
                    active ? "text-[#00BFA5]" : "text-white/30 group-hover:text-white"
                )}>
                    <Icon name={item.icon} size={18} color="currentColor" />
                </div>
                {!collapsed && (
                  <span className="whitespace-nowrap truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer: Thiết kế siêu gọn */}
        <div className="p-2 border-t border-white/5 bg-black/10">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 mb-1 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-full border border-[#00BFA5] overflow-hidden shrink-0 shadow-md">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqOvN8u67iE2_2ownYCUc4wNKJFwYHkWblBFQukroYkILvPq4C19VD_2Fl43UZqGtZL69zgYx7O55PqkChk0_7KRGEP0-0h4WyWdVs4VBgGhWNp3ChRKkucBoLapp0-1ugUbvi1kJvbSemo1BKOIdPUeNuAFHm4D1h7QZD7jSmst-uxFOd96IDEZOav3dqp19NGNM-aXn52Mw_CCKnYdyfMAo8H8ICfmPfv_KXBHwFCncEyXbqSDxgtF92izv8RYCUqiVr_UcIKwP3" alt="Admin" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-white truncate leading-tight">
                  {user?.name || "Dr. Alistair"}
                </p>
                <p className="text-[9px] text-blue-300/70 uppercase truncate">Architect</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center w-full gap-2.5 px-3 py-2 text-[12px] font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Icon name="logout" size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-[#F5F7FA]">
        <div className="p-6">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
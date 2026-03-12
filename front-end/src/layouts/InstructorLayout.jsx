import {
  BarChartOutlined,
  BookOutlined,
  DollarOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useAuthStore from "../store/slices/authStore";
import { ROUTES } from "../utils/constants";
import { cn } from "../utils/helpers";

const NAV_ITEMS = [
  {
    icon: <HomeOutlined />,
    label: "Dashboard",
    path: ROUTES.INSTRUCTOR_DASHBOARD,
  },
  {
    icon: <BookOutlined />,
    label: "My Courses",
    path: ROUTES.INSTRUCTOR_COURSES,
  },
  {
    icon: <DollarOutlined />,
    label: "Revenue",
    path: ROUTES.INSTRUCTOR_REVENUE,
  },
  {
    icon: <TeamOutlined />,
    label: "Students",
    path: ROUTES.INSTRUCTOR_STUDENTS,
  },
  {
    icon: <BarChartOutlined />,
    label: "Analytics",
    path: ROUTES.INSTRUCTOR_ANALYTICS,
  },
  { icon: <UserOutlined />, label: "Profile", path: ROUTES.INSTRUCTOR_PROFILE },
];

const InstructorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-['Inter',system-ui,sans-serif]">
      <ScrollRestoration />

      {/* ── Sidebar (Framer Motion + Tailwind) ── */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative z-30 flex flex-col h-screen bg-white border-r border-gray-100 shadow-xl shrink-0"
      >
        {/* Header / Logo */}
        <div className="flex items-center gap-3 px-6 h-[72px] border-b border-gray-50 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 shadow-lg rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30 shrink-0">
            <BookOutlined className="text-[18px] text-white" />
          </div>
          {!collapsed && (
            <span className="text-[17px] font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 truncate">
              EduFlow
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col flex-1 gap-1.5 p-4 overflow-y-auto no-scrollbar">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Main Menu
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            const btn = (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full group relative overflow-hidden",
                  active
                    ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 ring-1 ring-inset ring-indigo-500/20 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium",
                )}
              >
                {/* Active Indicator Line */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                )}

                {/* Icon */}
                <span
                  className={cn(
                    "text-[17px] shrink-0 flex items-center justify-center w-6 transition-colors duration-200",
                    active
                      ? "text-indigo-600"
                      : "text-gray-400 group-hover:text-gray-600",
                  )}
                >
                  {item.icon}
                </span>

                {/* Label */}
                {!collapsed && (
                  <span className="text-[13.5px] truncate tracking-tight">
                    {item.label}
                  </span>
                )}
              </button>
            );

            return collapsed ? (
              <Tooltip key={item.path} title={item.label} placement="right">
                {btn}
              </Tooltip>
            ) : (
              btn
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 p-4 bg-white border-t border-gray-100 shrink-0">
          <Tooltip title={collapsed ? "Logout" : ""} placement="right">
            <button
              onClick={logout}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-medium text-red-500 transition-colors rounded-xl hover:bg-red-50 hover:text-red-600 w-full",
                collapsed && "justify-center",
              )}
            >
              <LogoutOutlined className="text-[16px] shrink-0" />
              {!collapsed && <span className="truncate">Logout</span>}
            </button>
          </Tooltip>

          <Tooltip title={collapsed ? "Mở rộng" : "Thu gọn"} placement="right">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center w-full py-2.5 text-gray-400 transition-colors rounded-xl hover:bg-gray-50 hover:text-gray-900 mt-1"
            >
              {collapsed ? (
                <MenuUnfoldOutlined className="text-[16px]" />
              ) : (
                <MenuFoldOutlined className="text-[16px]" />
              )}
            </button>
          </Tooltip>
        </div>
      </motion.aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default InstructorLayout;

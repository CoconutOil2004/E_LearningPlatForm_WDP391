import {
  // BarChartOutlined,
  BookOutlined,
  CheckSquareOutlined,
  // DollarOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  // SettingOutlined,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  ConfigProvider,
  Layout,
  Menu,
  Tooltip,
  Typography,
} from "antd";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Outlet,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router-dom";
import NotificationBell from "../components/shared/NotificationBell";
import { useAuth } from "../contexts/AuthContext";
import useAuthStore from "../store/slices/authStore";
import { adminTheme, COLOR } from "../styles/adminTheme";
import { ROUTES } from "../utils/constants";

const { Sider, Content } = Layout;
const { Text } = Typography;

const SIDEBAR_BG = "#003B5C";
const SIDEBAR_W = 220;
const COLLAPSED_W = 64;

const NAV_ITEMS = [
  { key: ROUTES.ADMIN_DASHBOARD, icon: <HomeOutlined />, label: "Dashboard" },
  { key: ROUTES.ADMIN_USERS, icon: <TeamOutlined />, label: "User Management" },
  { key: ROUTES.ADMIN_COURSES, icon: <BookOutlined />, label: "My Courses" },
  {
    key: ROUTES.ADMIN_APPROVAL,
    icon: <CheckSquareOutlined />,
    label: "Course Approval",
  },
  // {
  //   key: ROUTES.ADMIN_ANALYTICS,
  //   icon: <BarChartOutlined />,
  //   label: "Analytics",
  // },
  // { key: ROUTES.ADMIN_REVENUE, icon: <DollarOutlined />, label: "Revenue" },
  // { key: ROUTES.ADMIN_REPORTS, icon: <FileTextOutlined />, label: "Reports" },
  // { key: ROUTES.ADMIN_SETTINGS, icon: <SettingOutlined />, label: "Settings" },
  {
    key: ROUTES.ADMIN_LOGS,
    icon: <SafetyCertificateOutlined />,
    label: "Operations Hub",
  },
  {
    key: ROUTES.ADMIN_BLOG,
    icon: <FileTextOutlined />,
    label: "Blog Management",
  },
  { key: ROUTES.ADMIN_REVIEWS, icon: <StarOutlined />, label: "Reviews" },
  { key: ROUTES.ADMIN_COMMENTS, icon: <MessageOutlined />, label: "Comments" },
  { key: ROUTES.ADMIN_PROFILE, icon: <UserOutlined />, label: "Profile" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "A";

// ─── AdminLayout ──────────────────────────────────────────────────────────────
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  // Highlight menu item matching current path
  const selectedKey =
    NAV_ITEMS.find((item) => location.pathname.startsWith(item.key))?.key ??
    ROUTES.ADMIN_DASHBOARD;

  const menuItems = NAV_ITEMS.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
  }));

  return (
    <ConfigProvider
      theme={{
        ...adminTheme,
        components: {
          ...adminTheme.components,
          Menu: {
            darkItemBg: "transparent",
            darkItemHoverBg: "rgba(255,255,255,0.06)",
            darkItemSelectedBg: "rgba(255,255,255,0.10)",
            darkItemSelectedColor: "#00BFA5",
            darkItemColor: "rgba(255,255,255,0.65)",
            darkItemHoverColor: "#ffffff",
            itemHeight: 40,
            iconSize: 17,
          },
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={SIDEBAR_W}
          collapsedWidth={COLLAPSED_W}
          trigger={null} // custom trigger below
          style={{
            background: SIDEBAR_BG,
            borderRight: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "2px 0 12px rgba(0,0,0,0.18)",
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          {/* Flexbox wrapper TO PUSH FOOTER TO THE BOTTOM */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Logo */}
            <div
              style={{
                height: 56,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "0 20px" : "0 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.12)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#00BFA5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 16,
                  fontWeight: 900,
                  color: "white",
                  letterSpacing: "-1px",
                }}
              >
                E
              </div>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div style={{ lineHeight: 1.1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: "white",
                        letterSpacing: 0.5,
                      }}
                    >
                      EduFlow
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "rgba(147,197,253,0.5)",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Admin Hub
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Navigation - Sử dụng flex: 1 để chiếm hết khoảng trống ở giữa */}
            <div style={{ flex: 1, overflow: "hidden auto" }}>
              <Menu
                mode="inline"
                theme="dark"
                selectedKeys={[selectedKey]}
                items={menuItems}
                onClick={({ key }) => navigate(key)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "8px 4px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
                inlineCollapsed={collapsed}
              />
            </div>

            {/* Footer: user info + collapse toggle + logout */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.12)",
                padding: "8px",
                flexShrink: 0,
              }}
            >
              {/* User info */}
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => navigate(ROUTES.ADMIN_PROFILE)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    marginBottom: 6,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                >
                  <Avatar
                    size={32}
                    src={user?.avatarURL}
                    style={{
                      background: `linear-gradient(135deg, ${COLOR.teal}, ${COLOR.ocean})`,
                      fontWeight: 900,
                      fontSize: 12,
                      flexShrink: 0,
                      border: "2px solid #00BFA5",
                    }}
                  >
                    {!user?.avatarURL &&
                      initials(user?.fullname || user?.username || "Admin")}
                  </Avatar>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "white",
                        lineHeight: 1.2,
                      }}
                      className="truncate"
                    >
                      {user?.fullname || user?.username || "Admin"}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "rgba(147,197,253,0.6)",
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                      }}
                    >
                      Admin
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Collapse toggle */}
              <Tooltip
                title={collapsed ? "Expand sidebar" : ""}
                placement="right"
              >
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: 8,
                    width: "100%",
                    padding: collapsed ? "8px 0" : "8px 10px",
                    background: "transparent",
                    border: "none",
                    borderRadius: 8,
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
                  }
                >
                  {collapsed ? (
                    <MenuUnfoldOutlined style={{ fontSize: 17 }} />
                  ) : (
                    <MenuFoldOutlined style={{ fontSize: 17 }} />
                  )}
                  {!collapsed && <span>Collapse</span>}
                </button>
              </Tooltip>

              {/* Logout */}
              <Tooltip title={collapsed ? "Logout" : ""} placement="right">
                <button
                  onClick={logout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: 8,
                    width: "100%",
                    padding: collapsed ? "8px 0" : "8px 10px",
                    background: "transparent",
                    border: "none",
                    borderRadius: 8,
                    color: "rgba(248,113,113,0.75)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#f87171")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(248,113,113,0.75)")
                  }
                >
                  <LogoutOutlined style={{ fontSize: 17 }} />
                  {!collapsed && <span>Logout</span>}
                </button>
              </Tooltip>
            </div>
          </div>
        </Sider>

        {/* ── Main Content ────────────────────────────────────────────────── */}
        <Content
          style={{
            background: "#F5F7FA",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          {/* Dashboard Header */}
          <header
            style={{
              height: 56,
              background: "white",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 24px",
              flexShrink: 0,
            }}
          >
            <div>
              {/* <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#1e293b" }}>
                  {location.pathname.split('/').pop()?.replace('-', ' ') || 'Admin Dashboard'}
               </h2> */}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <NotificationBell />
              <div
                style={{ width: 1, height: 24, background: "rgba(0,0,0,0.05)" }}
              />
              <button
                onClick={() => navigate(ROUTES.HOME)}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#00BFA5",
                  background: "#F0FDFA",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Public View
              </button>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <ScrollRestoration />
            <Outlet />
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;

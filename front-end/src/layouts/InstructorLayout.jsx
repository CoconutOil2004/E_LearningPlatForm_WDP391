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
import { Layout, Tooltip, Typography } from "antd";
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

const { Sider, Content } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  {
    icon: <HomeOutlined />,
    label: "Dashboard",
    key: ROUTES.INSTRUCTOR_DASHBOARD,
  },
  {
    icon: <BookOutlined />,
    label: "My Courses",
    key: ROUTES.INSTRUCTOR_COURSES,
  },
  // {
  //   icon: <PlusCircleOutlined />,
  //   label: "Create Course",
  //   key: ROUTES.CREATE_COURSE,
  // },
  {
    icon: <DollarOutlined />,
    label: "Revenue",
    key: ROUTES.INSTRUCTOR_REVENUE,
  },
  {
    icon: <TeamOutlined />,
    label: "Students",
    key: ROUTES.INSTRUCTOR_STUDENTS,
  },
  {
    icon: <BarChartOutlined />,
    label: "Analytics",
    key: ROUTES.INSTRUCTOR_ANALYTICS,
  },
  { icon: <UserOutlined />, label: "Profile", key: ROUTES.INSTRUCTOR_PROFILE },
];

// ── Inline styles ────────────────────────────────────────────────────────────
const S = {
  sider: {
    height: "100vh",
    position: "sticky",
    top: 0,
    background: "#ffffff",
    borderRight: "1px solid #f0f0f0",
  },
  // Bọc nội dung để xử lý flex layout cho Antd Sider
  siderInner: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    height: 68,
    padding: "0 18px",
    borderBottom: "1px solid #f0f0f0",
    gap: 12,
    flexShrink: 0,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 14px rgba(99,102,241,0.25)",
  },
  brandText: {
    fontWeight: 800,
    fontSize: 17,
    whiteSpace: "nowrap",
    flex: 1,
    overflow: "hidden",
    background: "linear-gradient(90deg, #4f46e5, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.3px",
  },
  // Khối này giãn ra đẩy nút toggle xuống dưới cùng
  menuContainer: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#9ca3af",
    padding: "8px 12px 4px",
    textTransform: "uppercase",
  },
  userWrap: {
    padding: "10px 12px",
    borderTop: "1px solid #f0f0f0",
    flexShrink: 0,
  },
  toggleWrap: {
    padding: "12px",
    borderTop: "1px solid #f0f0f0",
    flexShrink: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#ffffff",
  },
};

// ── NavItem component ────────────────────────────────────────────────────────
const NavItem = ({ item, active, collapsed, onClick }) => {
  const btn = (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        padding: collapsed ? "11px 0" : "10px 14px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 11,
        border: "none",
        cursor: "pointer",
        transition: "all 0.18s ease",
        fontFamily: "inherit",
        background: active
          ? "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))"
          : "transparent",
        boxShadow: active ? "inset 0 0 0 1px rgba(99,102,241,0.2)" : "none",
        color: active ? "#4f46e5" : "#4b5563",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "#f3f4f6";
          e.currentTarget.style.color = "#111827";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#4b5563";
        }
      }}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 3,
            height: "60%",
            borderRadius: "0 3px 3px 0",
            background: "linear-gradient(180deg, #6366f1, #8b5cf6)",
          }}
        />
      )}
      <span
        style={{
          fontSize: 17,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: active ? "#6366f1" : "inherit",
          transition: "filter 0.2s",
          flexShrink: 0,
        }}
      >
        {item.icon}
      </span>
      {!collapsed && (
        <span
          style={{
            fontSize: 13.5,
            fontWeight: active ? 600 : 500,
            whiteSpace: "nowrap",
            letterSpacing: "-0.1px",
          }}
        >
          {item.label}
        </span>
      )}
    </button>
  );

  return collapsed ? (
    <Tooltip title={item.label} placement="right">
      {btn}
    </Tooltip>
  ) : (
    btn
  );
};

// ── Layout ───────────────────────────────────────────────────────────────────
const InstructorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <Layout
      style={{
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#f9fafb",
      }}
    >
      <ScrollRestoration />

      {/* ── Sidebar ── */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={232}
        collapsedWidth={68}
        style={S.sider}
        theme="light"
      >
        <div style={S.siderInner}>
          {/* Logo row */}
          <div style={S.logoWrap}>
            <div style={S.logoIcon}>
              <BookOutlined style={{ color: "white", fontSize: 18 }} />
            </div>
            {!collapsed && <span style={S.brandText}>EduFlow</span>}
          </div>

          {/* Wrapper cho menu và nút logout (đẩy khối này giãn ra) */}
          <div style={S.menuContainer}>
            <nav style={S.nav}>
              {!collapsed && <p style={S.navLabel}>Main Menu</p>}
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.key}
                  item={item}
                  active={isActive(item.key)}
                  collapsed={collapsed}
                  onClick={() => navigate(item.key)}
                />
              ))}
            </nav>

            <div style={S.userWrap}>
              <Tooltip title={collapsed ? "Logout" : ""} placement="right">
                <button
                  onClick={logout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: 10,
                    width: "100%",
                    padding: collapsed ? "10px 0" : "9px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "transparent",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13.5,
                    fontWeight: 500,
                    transition: "all 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#ef4444";
                  }}
                >
                  <LogoutOutlined style={{ fontSize: 16 }} />
                  {!collapsed && <span>Logout</span>}
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Nút Toggle cố định dưới cùng */}
          <div style={S.toggleWrap}>
            <Tooltip
              title={collapsed ? "Mở rộng" : "Thu gọn"}
              placement="right"
            >
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  width: "100%",
                  padding: "8px 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "transparent",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: "#9ca3af",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#111827";
                  e.currentTarget.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#9ca3af";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {collapsed ? (
                  <MenuUnfoldOutlined style={{ fontSize: 16 }} />
                ) : (
                  <MenuFoldOutlined style={{ fontSize: 16 }} />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </Sider>

      {/* ── Main ── */}
      <Layout style={{ background: "#f9fafb" }}>
        <Content style={{ overflow: "auto" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default InstructorLayout;

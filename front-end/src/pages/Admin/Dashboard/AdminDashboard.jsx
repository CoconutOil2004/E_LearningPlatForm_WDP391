/**
 * AdminDashboard - Refactored Version
 *
 * Cấu trúc mới:
 *   - Sử dụng Ant Design components
 *   - Tách nhỏ các components thành files riêng
 *   - Clean code, dễ maintain
 *   - Reusable components
 */

import { Col, ConfigProvider, Row } from "antd";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import InstructorsTable from "../../../components/admin/InstructorsTable";
import AlertCard from "../../../components/shared/AlertCard";
import EngagementProgress from "../../../components/shared/EngagementProgress";
import RevenueChart from "../../../components/shared/RevenueChart";
import StatCard from "../../../components/shared/StatCard";

// Config & Utils
import { adminTheme, COLOR } from "../../../styles/adminTheme";
import { ROUTES } from "../../../utils/constants";
import { REVENUE_DATA } from "../../../utils/fakeData";
import { pageVariants } from "../../../utils/helpers";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAT_CARDS_CONFIG = [
  {
    key: "students",
    icon: "users",
    label: "Total Students",
    value: "12,482",
    badge: { type: "trend", text: "+14%" },
    barColor: COLOR.teal,
    barWidth: 65,
    accentBg: "rgba(0,191,165,0.1)",
    accentColor: COLOR.teal,
  },
  {
    key: "revenue",
    icon: "dollar",
    label: "Monthly Revenue",
    value: "$482,000",
    badge: { type: "trend", text: "+14%" },
    barColor: COLOR.green,
    barWidth: 82,
    accentBg: "rgba(0,200,83,0.1)",
    accentColor: COLOR.green,
  },
  {
    key: "completion",
    icon: "award",
    label: "Course Completion",
    value: "94.2%",
    badge: { type: "target" },
    barColor: COLOR.ocean,
    barWidth: 94,
    accentBg: "rgba(0,119,182,0.1)",
    accentColor: COLOR.ocean,
  },
];

const MOCK_INSTRUCTORS = [
  {
    id: "9823-TX",
    name: "Prof. Marcus Thorne",
    spec: "Cybersecurity Architecture",
    rating: 4.8,
    students: 1240,
    isActive: true,
  },
  {
    id: "4122-RX",
    name: "Dr. Helena Vance",
    spec: "Machine Learning / AI",
    rating: 5.0,
    students: 2105,
    isActive: false,
  },
  {
    id: "7731-ZX",
    name: "Jonas K. Sterling",
    spec: "Full-Stack Dev Ops",
    rating: 4.2,
    students: 985,
    isActive: true,
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

const toWeeklyData = (data) =>
  data.map((d) => ({ ...d, revenue: Math.round(d.revenue / 4.3) }));

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [weeklyData] = useState(toWeeklyData(REVENUE_DATA));

  // Trong thực tế, fetch data từ API tại đây
  // useEffect(() => {
  //   fetchDashboardStats();
  // }, []);

  return (
    <ConfigProvider theme={adminTheme}>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          padding: "24px",
          background: COLOR.bgPage,
          minHeight: "100vh",
        }}
      >
        {/* Page Title */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: COLOR.ocean,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Operations Hub
          </h1>
          <p
            style={{ color: COLOR.gray500, fontSize: 13, margin: "4px 0 0 0" }}
          >
            Real-time platform analytics and insights
          </p>
        </div>

        {/* Stat Cards Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          {STAT_CARDS_CONFIG.map((card, index) => (
            <Col xs={24} sm={24} md={8} key={card.key}>
              <StatCard {...card} animDelay={0.1 + index * 0.08} />
            </Col>
          ))}
        </Row>

        {/* Revenue Chart + Right Sidebar */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          {/* Revenue Chart - 2/3 width */}
          <Col xs={24} lg={16}>
            <RevenueChart
              monthlyData={REVENUE_DATA}
              weeklyData={weeklyData}
              title="Revenue Growth"
              subtitle="Holographic Projection"
              animDelay={0.3}
            />
          </Col>

          {/* Right Sidebar - 1/3 width */}
          <Col xs={24} lg={8}>
            <Row gutter={[24, 24]}>
              {/* Engagement Progress */}
              <Col span={24}>
                <EngagementProgress
                  title="Course Engagement"
                  percent={80}
                  subtitle="Overall"
                  animDelay={0.35}
                />
              </Col>

              {/* System Alert */}
              <Col span={24}>
                <AlertCard
                  type="success"
                  title="System Integration Complete"
                  message="Cloud instances synced across all regions."
                  timestamp="Just now"
                  animDelay={0.4}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Top Instructors Table */}
        <InstructorsTable
          instructors={MOCK_INSTRUCTORS}
          title="Top Performing Instructors"
          subtitle="Academic efficiency rankings"
          onViewAll={() => navigate(ROUTES.ADMIN_USERS)}
          animDelay={0.45}
        />
      </motion.div>
    </ConfigProvider>
  );
};

export default AdminDashboard;

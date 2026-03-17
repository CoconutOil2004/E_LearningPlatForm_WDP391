/**
 * AdminDashboard
 * - Revenue summary cards (real API)
 * - Revenue chart by day / month (real API)
 * - Top courses by revenue table (real API)
 */

import {
  ArrowUpOutlined,
  BookOutlined,
  DollarOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  StarFilled,
} from "@ant-design/icons";
import { ConfigProvider, Skeleton, Space, Spin, Table, Typography, Row, Col, Card } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

import AnalyticsService from "../../../services/api/AnalyticsService";
import PaymentService from "../../../services/api/PaymentService";
import { adminTheme, COLOR } from "../../../styles/adminTheme";
import { formatThousands, pageVariants } from "../../../utils/helpers";

const { Text, Title } = Typography;

/* ─── SummaryCard ────────────────────────────────────────────────────────────── */
const COLORS = [COLOR.ocean, COLOR.teal, "#8b5cf6", "#f59e0b", "#ef4444", "#3b82f6"];

/* ─── Refactored Summary Component ─────────────────────────────────────────── */
const SummaryCard = ({ icon: Icon, label, value, sub, accent, loading, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Card 
      bodyStyle={{ padding: '24px' }}
      style={{ 
        borderRadius: 20, 
        border: 'none', 
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)" 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ 
          width: 48, height: 48, borderRadius: 12, background: `${accent}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <Icon style={{ fontSize: 20, color: accent }} />
        </div>
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            {label}
          </Text>
          <div style={{ fontSize: 24, fontWeight: 800, color: COLOR.gray900 }}>
            {loading ? <Skeleton.Input active size="small" /> : value}
          </div>
          {sub && <Text type="success" style={{ fontSize: 12, fontWeight: 600 }}>+ {sub}</Text>}
        </div>
      </div>
    </Card>
  </motion.div>
);

/* ─── TopCoursesTable ────────────────────────────────────────────────────────── */
const TopCoursesTable = ({ data, loading }) => {
  const columns = [
    {
      title: "Rank",
      width: 64,
      render: (_, __, i) => {
        const medals = ["🥇", "🥈", "🥉"];
        return (
          <span
            style={{
              fontSize: i < 3 ? 20 : 13,
              fontWeight: 700,
              color: i < 3 ? undefined : COLOR.gray500,
            }}
          >
            {medals[i] ?? i + 1}
          </span>
        );
      },
    },
    {
      title: "Course Name",
      dataIndex: "title",
      ellipsis: true,
      render: (t) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${COLOR.ocean}, ${COLOR.teal})`,
              flexShrink: 0,
            }}
          />
          <Text strong style={{ color: COLOR.gray900 }}>
            {t}
          </Text>
        </div>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "totalRevenue",
      width: 170,
      defaultSortOrder: "descend",
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
      render: (v) => (
        <div>
          <Text style={{ fontWeight: 700, color: COLOR.ocean, fontSize: 14 }}>
            {formatThousands(v)}
          </Text>
          <div
            style={{
              height: 3,
              background: COLOR.gray100,
              borderRadius: 99,
              marginTop: 5,
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 99,
                background: `linear-gradient(90deg, ${COLOR.ocean}, ${COLOR.teal})`,
                width: `${Math.max((v / (data[0]?.totalRevenue || 1)) * 100, 4)}%`,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Orders",
      dataIndex: "totalOrders",
      width: 110,
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      render: (v) => (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: `${COLOR.teal}18`,
            color: COLOR.teal,
            fontWeight: 700,
            fontSize: 13,
            padding: "3px 12px",
            borderRadius: 20,
          }}
        >
          <ShoppingCartOutlined style={{ fontSize: 11 }} />
          {v}
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      width: 90,
      render: (v) => (
        <Space size={4}>
          <StarFilled style={{ color: "#f59e0b" }} />
          <Text strong>{Number(v || 0).toFixed(1)}</Text>
        </Space>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.45 }}
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "28px 32px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: `${COLOR.ocean}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BookOutlined style={{ color: COLOR.ocean, fontSize: 17 }} />
        </div>
        <div>
          <Title
            level={4}
            style={{ margin: 0, color: COLOR.gray900, fontWeight: 800 }}
          >
            Top Courses by Revenue
          </Title>
          <Text style={{ fontSize: 13, color: COLOR.gray500 }}>
            {data.length} courses with successful transactions
          </Text>
        </div>
      </div>

      <Table
        dataSource={data.slice(0, 10)}
        columns={columns}
        rowKey="courseId"
        loading={loading}
        pagination={false}
        size="middle"
        style={{ borderRadius: 12, overflow: "hidden" }}
      />

      <style>{`
        .ant-table-thead th {
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
          color: ${COLOR.gray500} !important;
          font-weight: 700 !important;
          background: ${COLOR.gray50} !important;
        }
        .ant-table-tbody tr:hover td { background: #EFF6FF !important; }
      `}</style>
    </motion.div>
  );
};

/* ─── AdminDashboard ─────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AnalyticsService.getAdminAnalytics()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Spin size="large" tip="Loading analytics..." />
      </div>
    );
  }

  // Pre-process revenue data for Recharts
  const revenueChartData = data.revenueByMonth.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    revenue: item.revenue
  }));

  const userDistributionData = data.userDistribution.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  }));

  return (
    <ConfigProvider theme={adminTheme}>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          padding: "24px 32px",
          background: COLOR.bgPage,
          minHeight: "100vh",
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, fontWeight: 900 }}>Platform Insights</Title>
          <Text type="secondary">Holistic view of your e-learning ecosystem</Text>
        </div>

        {/* Summary Row */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 20 
          }}>
            <SummaryCard 
              icon={DollarOutlined} 
              label="Total Revenue" 
              value={formatThousands(data.revenueByMonth.reduce((acc, curr) => acc + curr.revenue, 0))}
              accent={COLOR.ocean} 
              delay={0.1}
            />
            <SummaryCard 
              icon={TeamOutlined} 
              label="Total Users" 
              value={data.userDistribution.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()}
              accent={COLOR.teal} 
              delay={0.2}
            />
            <SummaryCard 
              icon={BookOutlined} 
              label="Taxonomies" 
              value={data.categoryDistribution.length.toString()}
              accent="#8b5cf6" 
              delay={0.3}
            />
            <SummaryCard 
              icon={ShoppingCartOutlined} 
              label="Top Grossing" 
              value={formatThousands(data.topCourses[0]?.revenue || 0)}
              accent="#f59e0b" 
              delay={0.4}
            />
            <SummaryCard 
              icon={StarFilled} 
              label="Platform Rating" 
              value={`${Number(data.avgPlatformRating || 0).toFixed(1)} / 5.0`}
              accent="#f59e0b" 
              delay={0.5}
            />
          </div>
        </div>

        {/* Main Charts Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          {/* Revenue Area Chart */}
          <Col xs={24} lg={16}>
            <Card title="Revenue Growth" style={{ borderRadius: 20, height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLOR.ocean} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLOR.ocean} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `${v/1000}k`} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="revenue" stroke={COLOR.ocean} fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* User Distribution Pie Chart */}
          <Col xs={24} lg={8}>
            <Card title="User Demographics" style={{ borderRadius: 20, height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: -20 }}>
                {userDistributionData.map((entry, index) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                    <Text style={{ fontSize: 12 }}>{entry.name}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Categories and Top Courses */}
        <Row gutter={[24, 24]}>
          <Col xs={24} xl={10}>
            <Card title="Course Distribution by Category" style={{ borderRadius: 20 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categoryDistribution} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 11 }} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill={COLOR.teal} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} xl={14}>
            <TopCoursesTable data={data.topCourses.map((c, i) => ({ ...c, key: i }))} loading={false} />
          </Col>
        </Row>
      </motion.div>
    </ConfigProvider>
  );
};


export default AdminDashboard;

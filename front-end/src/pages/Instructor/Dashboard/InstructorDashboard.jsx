import {
  ArrowRightOutlined,
  ArrowUpOutlined,
  BookOutlined,
  CheckCircleFilled,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  MessageOutlined,
  PlusOutlined,
  RiseOutlined,
  StarFilled,
  TeamOutlined,
  TrophyOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Progress,
  Row,
  Segmented,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  Cell,
} from "recharts";

import AnalyticsService from "../../../services/api/AnalyticsService";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import { ROUTES } from "../../../utils/constants";
import { formatThousands, pageVariants } from "../../../utils/helpers";

const { Title, Text } = Typography;

// ─── Design tokens — đồng nhất với InstructorLayout (indigo/purple) ───────────
const C = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryBg: "rgba(99,102,241,0.08)",
  mint: "#10b981",
  mintBg: "rgba(16,185,129,0.08)",
  amber: "#f59e0b",
  amberBg: "rgba(245,158,11,0.08)",
  border: "#f1f0fe",
  text: "#111827",
  textSub: "#6b7280",
  textMuted: "#9ca3af",
  gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a855f7 100%)",
  gradientMint: "linear-gradient(135deg, #10b981, #06b6d4)",
  gradientAmber: "linear-gradient(135deg, #f59e0b, #ef4444)",
};

const card = {
  borderRadius: 16,
  border: "1px solid #f1f0fe",
  boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
  overflow: "hidden",
};

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, ease: "easeOut", delay },
});

// ─── Animated counter ─────────────────────────────────────────────────────────
const AnimCount = ({ val }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    const end = parseFloat(String(val).replace(/[^0-9.]/g, "")) || 0;
    let cur = 0;
    const step = end / 60;
    const t = setInterval(() => {
      cur += step;
      if (cur >= end) { setN(end); clearInterval(t); }
      else setN(cur);
    }, 16);
    return () => clearInterval(t);
  }, [val]);
  const isK = String(val).includes("k");
  return <>{isK ? (n / 1000).toFixed(1) + "k" : Math.floor(n).toLocaleString()}</>;
};

// Custom Recharts wrapper will be used instead

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, val, badge, badgeClr, barW, barBg, aBg, aClr, delay }) => (
  <motion.div {...up(delay)} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
    <Card bordered={false} style={card} bodyStyle={{ padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: aBg, filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: aBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: aClr }}>
          {icon}
        </div>
        {badge && (
          <Tag style={{ borderRadius: 20, fontWeight: 700, fontSize: 11, border: "none", background: `${badgeClr}18`, color: badgeClr }}>
            <ArrowUpOutlined style={{ fontSize: 10 }} /> {badge}
          </Tag>
        )}
      </div>
      <Text style={{ fontSize: 13, color: C.textSub, fontWeight: 500, display: "block", marginBottom: 2 }}>{label}</Text>
      <Title level={2} style={{ margin: "0 0 12px", color: C.text, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
        <AnimCount val={val} />
      </Title>
      {barW > 0 && (
        <div style={{ height: 4, background: "#f1f0fe", borderRadius: 2, overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${barW}%` }} transition={{ delay: delay + 0.4, duration: 0.9 }}
            style={{ height: "100%", borderRadius: 2, background: barBg }} />
        </div>
      )}
    </Card>
  </motion.div>
);

// ─── Activity item ────────────────────────────────────────────────────────────
const Act = ({ icon, iBg, iClr, title, desc, time, lineClr, delay }) => (
  <motion.div {...up(delay)} style={{ paddingLeft: 14, borderLeft: `2px solid ${lineClr}`, position: "relative" }}>
    <div style={{ position: "absolute", left: -5, top: 0, width: 10, height: 10, borderRadius: "50%", background: lineClr, border: "2px solid white" }} />
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
      <div style={{ flex: 1 }}>
        <Text strong style={{ fontSize: 13, color: C.text }}>{title}</Text>
        <Text style={{ fontSize: 12, color: C.textSub, display: "block", marginTop: 2, lineHeight: 1.5 }}>{desc}</Text>
        <Text style={{ fontSize: 10, color: C.primary, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginTop: 4 }}>{time}</Text>
      </div>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: iBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = user?.fullName?.split(" ")[0] ?? "Instructor";

  useEffect(() => {
    AnalyticsService.getInstructorAnalytics()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  const enrollmentTrendData = data.enrollmentTrend.map(item => ({
    date: item._id,
    count: item.count
  }));

  const totalRevenue = data.revenueByCourse.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalStudents = data.revenueByCourse.reduce((acc, curr) => acc + curr.sales, 0);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px", background: "#f9fafb", minHeight: "100vh" }}>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <motion.div {...up(0)} style={{ marginBottom: 20 }}>
          <Card bordered={false}
            style={{ ...card, background: C.gradient, border: "none", boxShadow: "0 8px 40px rgba(99,102,241,0.28)" }}
            bodyStyle={{ padding: "28px 36px" }}
          >
            <Row gutter={[32, 20]} align="middle">
              <Col xs={24} lg={15}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "4px 14px", marginBottom: 14 }}>
                  <StarFilled style={{ color: "#fbbf24", fontSize: 13 }} />
                  <Text style={{ color: "white", fontWeight: 700, fontSize: 12 }}>Pro Instructor</Text>
                </div>
                <Title level={1} style={{ color: "white", margin: "0 0 10px", fontWeight: 800, fontSize: 32, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                  {greet}, {name}! 👋<br />
                  Share Knowledge.{" "}
                  <span style={{ fontWeight: 300, fontStyle: "italic", opacity: 0.85 }}>Inspire Learners.</span>
                </Title>
                <Space wrap>
                  <Button size="large" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.CREATE_COURSE)}
                    style={{ background: "white", color: C.primaryDark, border: "none", borderRadius: 12, fontWeight: 700, height: 44, paddingInline: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                    Create Course
                  </Button>
                </Space>
                <div style={{ display: "flex", gap: 24, marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                  {[
                    [totalStudents.toLocaleString(), "Total Enrolls"],
                    [data.revenueByCourse.length.toString(), "Courses"],
                    [`${Number(data.avgInstructorRating || 0).toFixed(1)} ★`, "Avg Rating"]
                  ].map(([v, l]) => (
                    <div key={l}>
                      <Text style={{ color: "white", fontWeight: 800, fontSize: 20, display: "block", lineHeight: 1.2 }}>{v}</Text>
                      <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500 }}>{l}</Text>
                    </div>
                  ))}
                </div>
              </Col>

              <Col xs={24} lg={9} style={{ display: "flex", justifyContent: "flex-end" }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
                  <Card bordered={false}
                    style={{ borderRadius: 16, background: "rgba(255,255,255,0.13)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", minWidth: 220 }}
                    bodyStyle={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <RiseOutlined style={{ color: "#10b981", fontSize: 17 }} />
                      </div>
                      <div>
                        <Text style={{ color: "white", fontWeight: 700, fontSize: 13, display: "block" }}>Total Revenue</Text>
                        <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>Cumulative performance</Text>
                      </div>
                    </div>
                    <Text style={{ color: "white", fontWeight: 900, fontSize: 24, display: "block", lineHeight: 1 }}>
                      {formatThousands(totalRevenue)}
                    </Text>
                    <Text style={{ color: "#10b981", fontWeight: 700, fontSize: 13, display: "block", marginTop: 6 }}>
                      <ArrowUpOutlined /> Growing Audience
                    </Text>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
        <Row gutter={[14, 14]} style={{ marginBottom: 18 }}>
          <Col xs={12} lg={6}>
            <StatCard icon={<TeamOutlined />} label="Total Enrolls" val={(data.totalEnrolls || 0).toString()} aBg={C.primaryBg} aClr={C.primary} delay={0.1} />
          </Col>
          <Col xs={12} lg={6}>
            <StatCard icon={<BookOutlined />} label="Active Courses" val={(data.activeCourses || 0).toString()} aBg={C.mintBg} aClr={C.mint} delay={0.2} />
          </Col>
          <Col xs={12} lg={6}>
            <StatCard icon={<RiseOutlined />} label="Conversion" val="12%" aBg={C.amberBg} aClr={C.amber} delay={0.3} />
          </Col>
          <Col xs={12} lg={6}>
            <StatCard icon={<EyeOutlined />} label="Platform Rank" val="#1" aBg={C.primaryBg} aClr={C.primary} delay={0.4} />
          </Col>
        </Row>

        {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
        <Row gutter={[14, 14]}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={14} style={{ width: "100%" }}>
              <motion.div {...up(0.28)}>
                <Card bordered={false} style={card} bodyStyle={{ padding: 22 }}>
                  <Title level={4} style={{ margin: "0 0 18px", color: C.text }}>Enrollment Trend</Title>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={enrollmentTrendData}>
                        <defs>
                          <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={C.primary} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="count" stroke={C.primary} fillOpacity={1} fill="url(#colorEnroll)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>

              <motion.div {...up(0.34)}>
                <Card bordered={false} style={card} bodyStyle={{ padding: 0 }}
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <Title level={4} style={{ margin: 0, color: C.text }}>Course Performance</Title>
                        <Text style={{ color: C.textSub, fontSize: 13, fontWeight: 400 }}>Revenue and enrollment breakdown</Text>
                      </div>
                      <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)} style={{ color: C.primary, fontWeight: 700, padding: 0 }}>View All</Button>
                    </div>
                  }
                  headStyle={{ padding: "14px 22px", borderBottom: "1px solid #f1f0fe" }}
                >
                  {data.revenueByCourse.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 22px", borderBottom: i < data.revenueByCourse.length - 1 ? "1px solid #f9f9ff" : "none" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOutlined style={{ color: C.primary }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 13, display: 'block' }}>{c.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {c.sales} enrollments · {Number(c.rating || 0).toFixed(1)} ★
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: 14, color: C.primary }}>{formatThousands(c.value)}</Text>
                      </div>
                    </div>
                  ))}
                </Card>
              </motion.div>
            </Space>
          </Col>

          <Col xs={24} lg={8}>
            <Space direction="vertical" size={14} style={{ width: "100%" }}>
              <Card bordered={false} style={card} title="Impact Summary">
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <TrophyOutlined style={{ fontSize: 48, color: '#f59e0b', marginBottom: 16 }} />
                  <Title level={4}>Keep it up!</Title>
                  <Text type="secondary">Your courses have reached {totalStudents} students this month.</Text>
                </div>
              </Card>
              <Card bordered={false} style={card} title="Engagement Goals">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text size="small">Enrollment Target</Text>
                    <Progress percent={Math.min(100, Math.round((totalStudents / 100) * 100))} strokeColor={C.primary} />
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};

export default InstructorDashboard;
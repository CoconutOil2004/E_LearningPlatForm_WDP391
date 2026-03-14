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
  Tag,
  Typography,
} from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

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

// ─── Bar chart ────────────────────────────────────────────────────────────────
const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 128 }}>
      {data.map((d, i) => (
        <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.35 + i * 0.07, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              transformOrigin: "bottom",
              width: "100%",
              height: Math.max(8, (d.v / max) * 112),
              borderRadius: "6px 6px 0 0",
              background: d.hi ? C.gradient : d.mint ? C.gradientMint : C.primaryBg,
            }}
          />
          <Text style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase" }}>{d.day}</Text>
        </div>
      ))}
    </div>
  );
};

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
  const [period, setPeriod] = useState("Week");

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = user?.fullname?.split(" ")[0] ?? "Instructor";

  const charts = {
    Week: [
      { day: "Mon", v: 40 }, { day: "Tue", v: 62 }, { day: "Wed", v: 55 },
      { day: "Thu", v: 82, hi: true }, { day: "Fri", v: 96, hi: true },
      { day: "Sat", v: 72, mint: true }, { day: "Sun", v: 86, mint: true },
    ],
    Month: [{ day: "W1", v: 55 }, { day: "W2", v: 70 }, { day: "W3", v: 90, hi: true }, { day: "W4", v: 80, mint: true }],
    Year: [{ day: "Q1", v: 60 }, { day: "Q2", v: 75, hi: true }, { day: "Q3", v: 90, hi: true }, { day: "Q4", v: 85, mint: true }],
  };

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
                {/* Badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "4px 14px", marginBottom: 14 }}>
                  <StarFilled style={{ color: "#fbbf24", fontSize: 13 }} />
                  <Text style={{ color: "white", fontWeight: 700, fontSize: 12 }}>Premium Instructor</Text>
                </div>
                <Title level={1} style={{ color: "white", margin: "0 0 10px", fontWeight: 800, fontSize: 32, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                  {greet}, {name}! 👋<br />
                  Share Knowledge.{" "}
                  <span style={{ fontWeight: 300, fontStyle: "italic", opacity: 0.85 }}>Inspire Learners.</span>
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, display: "block", marginBottom: 20, lineHeight: 1.7, maxWidth: 460 }}>
                  Empower your students with premium content and real-time insights. Your impact starts here.
                </Text>
                <Space wrap>
                  <Button size="large" icon={<PlusOutlined />} onClick={() => navigate(ROUTES.CREATE_COURSE)}
                    style={{ background: "white", color: C.primaryDark, border: "none", borderRadius: 12, fontWeight: 700, height: 44, paddingInline: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
                    Create Course
                  </Button>
                  <Button size="large" icon={<EditOutlined />} onClick={() => navigate("/instructor/blog/create")}
                    style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, fontWeight: 700, height: 44, paddingInline: 22 }}>
                    Create New Blog
                  </Button>
                </Space>
                {/* Quick stats */}
                <div style={{ display: "flex", gap: 24, marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                  {[["12.8k", "Students"], ["12", "Courses"], ["4.9 ★", "Rating"]].map(([v, l]) => (
                    <div key={l}>
                      <Text style={{ color: "white", fontWeight: 800, fontSize: 20, display: "block", lineHeight: 1.2 }}>{v}</Text>
                      <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 500 }}>{l}</Text>
                    </div>
                  ))}
                </div>
              </Col>

              {/* Floating revenue card */}
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
                        <Text style={{ color: "white", fontWeight: 700, fontSize: 13, display: "block" }}>Revenue this month</Text>
                        <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>vs last month</Text>
                      </div>
                    </div>
                    <Text style={{ color: "white", fontWeight: 900, fontSize: 28, display: "block", lineHeight: 1 }}>$4,280</Text>
                    <Text style={{ color: "#10b981", fontWeight: 700, fontSize: 13, display: "block", marginTop: 6 }}>
                      <ArrowUpOutlined /> +22% from last month
                    </Text>
                    <Progress percent={72} showInfo={false} strokeColor="#10b981" trailColor="rgba(255,255,255,0.15)" strokeWidth={4} style={{ marginTop: 12 }} />
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Card>
        </motion.div>

        {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
        <Row gutter={[14, 14]} style={{ marginBottom: 18 }}>
          {[
            { icon: <TeamOutlined />, label: "Total Students", val: "12840", badge: "+12%", badgeClr: C.mint, barW: 72, barBg: C.gradient, aBg: C.primaryBg, aClr: C.primary, delay: 0.08 },
            { icon: <EditOutlined />, label: "Published Blogs", val: "42", badge: "+5%", badgeClr: C.mint, barW: 55, barBg: C.gradientMint, aBg: C.mintBg, aClr: C.mint, delay: 0.14 },
            { icon: <BookOutlined />, label: "Active Courses", val: "12", barW: 40, barBg: C.gradientAmber, aBg: C.amberBg, aClr: C.amber, delay: 0.2 },
            { icon: <EyeOutlined />, label: "Monthly Views", val: "85.2k", badge: "+18%", badgeClr: C.mint, barW: 85, barBg: C.gradient, aBg: C.primaryBg, aClr: C.primary, delay: 0.26 },
          ].map((s) => (
            <Col key={s.label} xs={12} lg={6}>
              <StatCard {...s} />
            </Col>
          ))}
        </Row>

        {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
        <Row gutter={[14, 14]}>
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={14} style={{ width: "100%" }}>

              {/* Chart */}
              <motion.div {...up(0.28)}>
                <Card bordered={false} style={card} bodyStyle={{ padding: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <div>
                      <Title level={4} style={{ margin: 0, color: C.text }}>Performance Analytics</Title>
                      <Text style={{ color: C.textSub, fontSize: 13 }}>Student engagement over time</Text>
                    </div>
                    <Segmented options={["Week", "Month", "Year"]} value={period} onChange={setPeriod} style={{ borderRadius: 10 }} />
                  </div>
                  <BarChart data={charts[period]} />
                  <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f0fe" }}>
                    {[[C.primary, "Enrolled"], [C.mint, "Completed"]].map(([clr, lbl]) => (
                      <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: clr }} />
                        <Text style={{ fontSize: 12, color: C.textSub }}>{lbl}</Text>
                      </div>
                    ))}
                    <Tag style={{ marginLeft: "auto", borderRadius: 20, fontWeight: 700, fontSize: 12, border: "none", background: "#d1fae5", color: C.mint }}>
                      <ArrowUpOutlined /> +24% vs last {period.toLowerCase()}
                    </Tag>
                  </div>
                </Card>
              </motion.div>

              {/* Top Courses */}
              <motion.div {...up(0.34)}>
                <Card bordered={false} style={card} bodyStyle={{ padding: 0 }}
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <Title level={4} style={{ margin: 0, color: C.text }}>Top Performing Courses</Title>
                        <Text style={{ color: C.textSub, fontSize: 13, fontWeight: 400 }}>Ranked by enrollment this month</Text>
                      </div>
                      <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)} style={{ color: C.primary, fontWeight: 700, padding: 0 }}>View All</Button>
                    </div>
                  }
                  headStyle={{ padding: "14px 22px", borderBottom: "1px solid #f1f0fe" }}
                >
                  {[
                    { rank: 1, title: "Advanced Python for Data Science", students: "4,280", rating: "4.9", rev: "$1,240", growth: "+18%", clr: C.primary, bg: C.primaryBg, bar: 92 },
                    { rank: 2, title: "Mastering React Patterns in 2024", students: "3,120", rating: "4.8", rev: "$980", growth: "+12%", clr: C.mint, bg: C.mintBg, bar: 70 },
                    { rank: 3, title: "UX/UI Foundations Complete", students: "2,840", rating: "4.7", rev: "$760", growth: "Stable", clr: C.amber, bg: C.amberBg, bar: 55 },
                  ].map((c, i) => (
                    <motion.div key={c.rank} {...up(0.34 + i * 0.07)}>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 22px", borderBottom: i < 2 ? "1px solid #f9f9ff" : "none", cursor: "pointer", transition: "background 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = C.primaryBg}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Text style={{ color: c.clr, fontWeight: 900, fontSize: 13 }}>#{c.rank}</Text>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text strong style={{ fontSize: 13, color: C.text, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</Text>
                          <Text style={{ fontSize: 12, color: C.textSub }}>{c.students} students · {c.rating} ★</Text>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <Text strong style={{ fontSize: 13, color: C.text, display: "block" }}>{c.rev}</Text>
                          <Text style={{ fontSize: 12, color: c.growth === "Stable" ? C.textMuted : C.mint, fontWeight: 700 }}>{c.growth}</Text>
                        </div>
                        <div style={{ width: 68, flexShrink: 0 }}>
                          <div style={{ height: 5, background: "#f1f0fe", borderRadius: 3, overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${c.bar}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.9 }}
                              style={{ height: "100%", borderRadius: 3, background: c.clr }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </Card>
              </motion.div>

              {/* Blog Activity */}
              <motion.div {...up(0.4)}>
                <Card bordered={false} style={card} bodyStyle={{ padding: 16 }}
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <Title level={4} style={{ margin: 0, color: C.text }}>Recent Blog Activity</Title>
                        <Text style={{ color: C.textSub, fontSize: 13, fontWeight: 400 }}>Your latest published content</Text>
                      </div>
                      <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate("/instructor/blog/create")} style={{ color: C.primary, fontWeight: 700, padding: 0 }}>New Post</Button>
                    </div>
                  }
                  headStyle={{ padding: "14px 22px", borderBottom: "1px solid #f1f0fe" }}
                >
                  <Row gutter={[12, 12]}>
                    {[
                      { tag: "React", tagClr: C.primary, title: "Mastering Advanced React Patterns in 2024", views: "1.2k", comments: 24, likes: 89 },
                      { tag: "AI & Education", tagClr: C.mint, title: "The Future of AI in Modern Education Systems", views: "850", comments: 18, likes: 62 },
                    ].map((b, i) => (
                      <Col key={b.title} xs={24} sm={12}>
                        <motion.div {...up(0.4 + i * 0.08)} whileHover={{ y: -2 }}>
                          <Card bordered={false} hoverable
                            style={{ borderRadius: 12, border: "1px solid #f1f0fe", cursor: "pointer" }}
                            bodyStyle={{ padding: 14 }}
                          >
                            <div style={{ display: "flex", gap: 12 }}>
                              <div style={{ width: 68, height: 68, borderRadius: 10, background: `linear-gradient(135deg, ${b.tagClr}20, ${b.tagClr}40)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <EditOutlined style={{ fontSize: 20, color: b.tagClr }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <Tag style={{ borderRadius: 6, fontSize: 10, fontWeight: 700, border: "none", background: `${b.tagClr}15`, color: b.tagClr, marginBottom: 4 }}>{b.tag}</Tag>
                                <Text strong style={{ fontSize: 12, color: C.text, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>{b.title}</Text>
                                <div style={{ display: "flex", gap: 10, marginTop: 7 }}>
                                  <Text style={{ fontSize: 11, color: C.textSub, display: "flex", alignItems: "center", gap: 3 }}><EyeOutlined /> {b.views}</Text>
                                  <Text style={{ fontSize: 11, color: C.textSub, display: "flex", alignItems: "center", gap: 3 }}><MessageOutlined /> {b.comments}</Text>
                                  <Text style={{ fontSize: 11, color: C.mint }}>❤ {b.likes}</Text>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </motion.div>
            </Space>
          </Col>

          {/* RIGHT SIDEBAR */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size={14} style={{ width: "100%" }}>

              {/* Recent Activity */}
              <motion.div {...up(0.28)}>
                <Card bordered={false} style={card}
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Title level={4} style={{ margin: 0, color: C.text }}>Recent Activity</Title>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.primaryBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: C.primary }}>4</Text>
                      </div>
                    </div>
                  }
                  headStyle={{ padding: "14px 18px", borderBottom: "1px solid #f1f0fe" }}
                  bodyStyle={{ padding: "18px" }}
                >
                  <Space direction="vertical" size={18} style={{ width: "100%" }}>
                    <Act icon={<UserAddOutlined style={{ color: C.primary, fontSize: 13 }} />} iBg={C.primaryBg} iClr={C.primary}
                      title="New Student Enrolled" desc="Alex Johnson joined 'Advanced Python for Data Science'" time="2 minutes ago" lineClr={C.primary} delay={0.3} />
                    <Act icon={<CheckCircleFilled style={{ color: C.mint, fontSize: 13 }} />} iBg={C.mintBg} iClr={C.mint}
                      title="Course Completed" desc="Sarah Miller finished 'UX/UI Foundations'" time="15 minutes ago" lineClr={C.mint} delay={0.34} />
                    <Act icon={<MessageOutlined style={{ color: C.textMuted, fontSize: 13 }} />} iBg="#f3f4f6" iClr={C.textMuted}
                      title="Comment Received" desc="David posted a question on 'Mastering React Patterns'" time="1 hour ago" lineClr="#d1d5db" delay={0.38} />
                    <Act icon={<DollarOutlined style={{ color: C.amber, fontSize: 13 }} />} iBg={C.amberBg} iClr={C.amber}
                      title="Payment Processed" desc="Earnings for July have been deposited" time="3 hours ago" lineClr={C.amber} delay={0.42} />
                    <Button block type="text" icon={<ArrowRightOutlined />}
                      style={{ color: C.textSub, fontWeight: 600, borderTop: "1px solid #f1f0fe", marginTop: 2, height: "auto", paddingTop: 12 }}>
                      View History
                    </Button>
                  </Space>
                </Card>
              </motion.div>

              {/* Monthly Goals */}
              <motion.div {...up(0.36)}>
                <Card bordered={false} style={card} bodyStyle={{ padding: 20 }}>
                  <Title level={5} style={{ margin: "0 0 16px", color: C.text }}>Monthly Goals</Title>
                  <Space direction="vertical" size={14} style={{ width: "100%" }}>
                    {[
                      { label: "New Students", cur: 840, total: 1000, clr: C.primary, fmt: (c, t) => `${c} / ${t}` },
                      { label: "Blogs Published", cur: 6, total: 8, clr: C.mint, fmt: (c, t) => `${c} / ${t}` },
                      { label: "Revenue Target", cur: 4200, total: 5000, clr: C.amber, fmt: () => "$4.2k / $5k" },
                    ].map((g) => (
                      <div key={g.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <Text style={{ fontSize: 13, color: C.textSub, fontWeight: 500 }}>{g.label}</Text>
                          <Text strong style={{ fontSize: 13, color: C.text }}>{g.fmt(g.cur, g.total)}</Text>
                        </div>
                        <Progress percent={Math.round((g.cur / g.total) * 100)} strokeColor={g.clr} trailColor="#f1f0fe" showInfo={false} strokeWidth={6} style={{ margin: 0 }} />
                      </div>
                    ))}
                  </Space>
                </Card>
              </motion.div>

              {/* Upgrade Card */}
              <motion.div {...up(0.44)}>
                <Card bordered={false}
                  style={{ borderRadius: 16, background: C.gradient, border: "none", boxShadow: "0 8px 32px rgba(99,102,241,0.28)", overflow: "hidden", position: "relative" }}
                  bodyStyle={{ padding: 22, position: "relative", zIndex: 1 }}
                >
                  <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", bottom: -20, left: 10, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <TrophyOutlined style={{ color: "white", fontSize: 19 }} />
                  </div>
                  <Title level={4} style={{ color: "white", margin: "0 0 8px" }}>Nexus Pro Upgrade</Title>
                  <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.6, display: "block", marginBottom: 12 }}>
                    Get detailed heatmaps of student engagement and AI-powered blog writing assistance.
                  </Text>
                  <Space direction="vertical" size={5} style={{ marginBottom: 16 }}>
                    {["Advanced analytics dashboard", "AI blog writing assistant", "Student heatmap insights"].map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircleFilled style={{ color: "#10b981", fontSize: 12 }} />
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{f}</Text>
                      </div>
                    ))}
                  </Space>
                  <Button block size="large"
                    style={{ background: "white", color: C.primaryDark, border: "none", borderRadius: 10, fontWeight: 700, height: 42 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#10b981"; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = C.primaryDark; }}
                  >
                    Upgrade Now — $29/mo
                  </Button>
                </Card>
              </motion.div>
            </Space>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};

export default InstructorDashboard;
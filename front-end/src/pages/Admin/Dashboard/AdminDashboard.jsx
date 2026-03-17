import {
  ArrowUpOutlined,
  BookOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { ConfigProvider, Skeleton, Spin, Table, Typography } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import PaymentService from "../../../services/api/PaymentService";
import { adminTheme, COLOR } from "../../../styles/adminTheme";
import { formatThousands, pageVariants } from "../../../utils/helpers";

const { Text, Title } = Typography;

/* ─── SummaryCard ────────────────────────────────────────────────────────────── */
const SummaryCard = ({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  loading,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    style={{
      background: "#fff",
      borderRadius: 16,
      padding: "24px 28px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      display: "flex",
      alignItems: "center",
      gap: 20,
      flex: 1,
      minWidth: 200,
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 14,
        background: `${accent}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon style={{ fontSize: 22, color: accent }} />
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <Text
        style={{
          fontSize: 11,
          color: COLOR.gray500,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontWeight: 600,
        }}
      >
        {label}
      </Text>
      {loading ? (
        <Skeleton.Input
          active
          size="small"
          style={{ width: 110, marginTop: 8, display: "block" }}
        />
      ) : (
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: COLOR.gray900,
            lineHeight: 1.2,
            marginTop: 5,
          }}
        >
          {value}
        </div>
      )}
      {sub && !loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 5,
          }}
        >
          <ArrowUpOutlined style={{ fontSize: 10, color: COLOR.green }} />
          <Text style={{ fontSize: 12, color: COLOR.green, fontWeight: 600 }}>
            {sub}
          </Text>
        </div>
      )}
    </div>
  </motion.div>
);

/* ─── RevenueChart ───────────────────────────────────────────────────────────── */
const RevenueChart = ({ data, groupBy, onGroupBy, loading, totalRevenue }) => {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...data.map((d) => d.totalRevenue), 1);
  const CHART_H = 220;

  const GROUP_TABS = [
    { key: "month", label: "By Month" },
    { key: "day", label: "By Day" },
  ];

  const statStrip = [
    {
      label: "Highest",
      value: formatThousands(Math.max(...data.map((d) => d.totalRevenue))),
      color: COLOR.ocean,
    },
    {
      label: "Avg / period",
      value: formatThousands(
        Math.round(data.reduce((s, d) => s + d.totalRevenue, 0) / data.length),
      ),
      color: COLOR.gray700,
    },
    {
      label: "Lowest",
      value: formatThousands(Math.min(...data.map((d) => d.totalRevenue))),
      color: COLOR.gray500,
    },
    {
      label: "Total Orders",
      value: data.reduce((s, d) => s + d.totalOrders, 0).toLocaleString(),
      color: COLOR.teal,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.45 }}
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "28px 32px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <Title
            level={4}
            style={{ margin: 0, color: COLOR.gray900, fontWeight: 800 }}
          >
            Revenue Over Time
          </Title>
          <Text
            style={{
              fontSize: 13,
              color: COLOR.gray500,
              marginTop: 3,
              display: "block",
            }}
          >
            Total:{" "}
            <span style={{ color: COLOR.ocean, fontWeight: 700, fontSize: 15 }}>
              {formatThousands(totalRevenue)}
            </span>
          </Text>
        </div>

        {/* Tab toggle */}
        <div
          style={{
            display: "flex",
            background: COLOR.gray100,
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}
        >
          {GROUP_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onGroupBy(t.key)}
              style={{
                padding: "6px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                background: groupBy === t.key ? "#fff" : "transparent",
                color: groupBy === t.key ? COLOR.ocean : COLOR.gray500,
                boxShadow:
                  groupBy === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      {loading ? (
        <div
          style={{
            height: CHART_H + 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" />
        </div>
      ) : data.length === 0 ? (
        <div
          style={{
            height: CHART_H,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <DollarOutlined style={{ fontSize: 38, color: COLOR.gray300 }} />
          <Text style={{ color: COLOR.gray400 }}>
            No revenue data available
          </Text>
        </div>
      ) : (
        <>
          <div style={{ position: "relative" }}>
            {[0, 25, 50, 75, 100].map((pct) => (
              <div
                key={pct}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: `${pct}%`,
                  height: 1,
                  background: pct === 0 ? COLOR.gray300 : COLOR.gray100,
                  zIndex: 0,
                }}
              />
            ))}

            {[0, 50, 100].map((pct) => (
              <div
                key={pct}
                style={{
                  position: "absolute",
                  right: "calc(100% + 8px)",
                  bottom: `${pct}%`,
                  fontSize: 11,
                  color: COLOR.gray400,
                  transform: "translateY(50%)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatThousands(Math.round((max * pct) / 100))}
              </div>
            ))}

            <div
              style={{
                height: CHART_H,
                display: "flex",
                alignItems: "flex-end",
                gap: data.length > 20 ? 3 : data.length > 10 ? 7 : 12,
                padding: "0 2px",
                overflowX: data.length > 30 ? "auto" : "visible",
                position: "relative",
                zIndex: 1,
                marginLeft: 70,
              }}
            >
              {data.map((d, i) => {
                const heightPct = Math.max((d.totalRevenue / max) * 100, 1.5);
                const isHov = hovered === i;

                return (
                  <div
                    key={d.date}
                    style={{
                      flex: data.length > 20 ? "0 0 auto" : 1,
                      minWidth: data.length > 20 ? 16 : undefined,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      height: "100%",
                      justifyContent: "flex-end",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {isHov && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: `calc(${heightPct}% + 12px)`,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: COLOR.gray900,
                          color: "#fff",
                          borderRadius: 10,
                          padding: "10px 14px",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                          zIndex: 30,
                          pointerEvents: "none",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: 4,
                            color: "#e5e7eb",
                          }}
                        >
                          {d.date}
                        </div>
                        <div
                          style={{
                            color: "#6ee7b7",
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          {formatThousands(d.totalRevenue)}
                        </div>
                        <div
                          style={{
                            color: COLOR.gray400,
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          {d.totalOrders} orders
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: -5,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 0,
                            height: 0,
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: `5px solid ${COLOR.gray900}`,
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        width: "100%",
                        height: `${heightPct}%`,
                        background: isHov
                          ? `linear-gradient(180deg, #38bdf8 0%, ${COLOR.ocean} 100%)`
                          : `linear-gradient(180deg, #93c5fd 0%, ${COLOR.ocean} 100%)`,
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                        transition: "background 0.15s ease",
                        boxShadow: isHov
                          ? `0 -2px 8px ${COLOR.ocean}55`
                          : "none",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {data.length <= 18 && (
            <div
              style={{
                display: "flex",
                gap: data.length > 10 ? 7 : 12,
                padding: "10px 2px 0",
                marginLeft: 70,
              }}
            >
              {data.map((d, i) => (
                <div
                  key={d.date}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: hovered === i ? 700 : 500,
                    color: hovered === i ? COLOR.ocean : COLOR.gray400,
                    transition: "color 0.15s",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {groupBy === "month" ? d.date.slice(0, 7) : d.date.slice(5)}
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 24,
              paddingTop: 20,
              borderTop: `1px solid ${COLOR.gray100}`,
              flexWrap: "wrap",
            }}
          >
            {statStrip.map((s) => (
              <div key={s.label}>
                <Text
                  style={{
                    fontSize: 11,
                    color: COLOR.gray400,
                    display: "block",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </Text>
                <Text style={{ fontWeight: 700, color: s.color, fontSize: 15 }}>
                  {s.value}
                </Text>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

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
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("month");

  const [courseRevenue, setCourseRevenue] = useState([]);
  const [courseLoading, setCourseLoading] = useState(true);

  useEffect(() => {
    PaymentService.getRevenueSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    setChartLoading(true);
    PaymentService.getRevenueByDate({ groupBy })
      .then(setChartData)
      .catch(() => {})
      .finally(() => setChartLoading(false));
  }, [groupBy]);

  useEffect(() => {
    PaymentService.getRevenueByCourse()
      .then(setCourseRevenue)
      .catch(() => {})
      .finally(() => setCourseLoading(false));
  }, []);

  const avgOrderValue =
    summary.totalOrders > 0
      ? Math.round(summary.totalRevenue / summary.totalOrders)
      : 0;

  const CARDS = [
    {
      icon: DollarOutlined,
      label: "Total Revenue",
      value: formatThousands(summary.totalRevenue),
      sub: "All time",
      accent: COLOR.ocean,
      loading: summaryLoading,
      delay: 0.08,
    },
    {
      icon: ShoppingCartOutlined,
      label: "Total Orders",
      value: summary.totalOrders.toLocaleString(),
      sub: "Successful transactions",
      accent: COLOR.teal,
      loading: summaryLoading,
      delay: 0.16,
    },
    {
      icon: BookOutlined,
      label: "Courses with Revenue",
      value: courseLoading ? "—" : courseRevenue.length.toString(),
      sub: "Have been purchased",
      accent: "#8b5cf6",
      loading: courseLoading,
      delay: 0.24,
    },
    {
      icon: ArrowUpOutlined,
      label: "Avg. Order Value",
      value: formatThousands(avgOrderValue),
      sub: "Per transaction",
      accent: "#f59e0b",
      loading: summaryLoading,
      delay: 0.32,
    },
  ];

  return (
    <ConfigProvider theme={adminTheme}>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          padding: "28px 32px",
          background: COLOR.bgPage,
          minHeight: "100vh",
        }}
      >
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.38 }}
          style={{ marginBottom: 28 }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: COLOR.gray900,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: COLOR.gray500, fontSize: 13, margin: "4px 0 0" }}>
            Real-time revenue statistics
          </p>
        </motion.div>

        {/* Summary cards */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {CARDS.map((c) => (
            <SummaryCard key={c.label} {...c} />
          ))}
        </div>

        {/* Revenue chart */}
        <div style={{ marginBottom: 24 }}>
          <RevenueChart
            data={chartData}
            groupBy={groupBy}
            onGroupBy={setGroupBy}
            loading={chartLoading}
            totalRevenue={summary.totalRevenue}
          />
        </div>

        {/* Top courses */}
        <TopCoursesTable data={courseRevenue} loading={courseLoading} />
      </motion.div>
    </ConfigProvider>
  );
};

export default AdminDashboard;

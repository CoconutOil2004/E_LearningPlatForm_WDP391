/**
 * AdminDashboard — "Operations Hub"
 *
 * Cấu trúc file:
 *   1. Constants / static data    → đổi số liệu hoặc swap API ở đây
 *   2. Pure sub-components        → GlassCard, StatCard, RevenueBarChart,
 *                                   CircleProgress, StarsRow
 *   3. Main component             → AdminDashboard
 *
 * Khi kết nối API thật:
 *   - Xoá phần MOCK_INSTRUCTORS
 *   - Tạo hook (vd: useAdminStats) rồi truyền data xuống sub-component như cũ
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Icon } from "../../../components/ui";
import { REVENUE_DATA } from "../../../utils/fakeData";
import { pageVariants, getInitials } from "../../../utils/helpers";
import { ROUTES } from "../../../utils/constants";


// ─── 1. Constants / static mock data ─────────────────────────────────────────

/** Màu chủ đạo — đổi tại đây để thay toàn bộ theme dashboard */
const COLOR = {
  ocean:  "#0077B6",
  teal:   "#00BFA5",
  green:  "#00C853",
  bgPage: "#F8FAFB",
};

/** Stat cards hàng trên */
const STAT_CARDS = [
  {
    key:         "students",
    icon:        "users",
    label:       "Total Students",
    value:       "12,482",
    badge:       { type: "trend", text: "+14%" },
    barColor:    COLOR.teal,
    barWidth:    "65%",
    accentBg:    "rgba(0,191,165,0.1)",
    accentColor: COLOR.teal,
  },
  {
    key:         "revenue",
    icon:        "dollar",
    label:       "Monthly Revenue",
    value:       "$482,000",
    badge:       { type: "trend", text: "+14%" },
    barColor:    COLOR.green,
    barWidth:    "82%",
    accentBg:    "rgba(0,200,83,0.1)",
    accentColor: COLOR.green,
  },
  {
    key:         "completion",
    icon:        "award",
    label:       "Course Completion",
    value:       "94.2%",
    badge:       { type: "target" },
    barColor:    COLOR.ocean,
    barWidth:    "94%",
    accentBg:    "rgba(0,119,182,0.1)",
    accentColor: COLOR.ocean,
  },
];

/** Bảng instructor — thay bằng API data sau */
const MOCK_INSTRUCTORS = [
  { id: "9823-TX", name: "Prof. Marcus Thorne", spec: "Cybersecurity Architecture", rating: 4.8, students: 1240, isActive: true  },
  { id: "4122-RX", name: "Dr. Helena Vance",    spec: "Machine Learning / AI",      rating: 5.0, students: 2105, isActive: false },
  { id: "7731-ZX", name: "Jonas K. Sterling",   spec: "Full-Stack Dev Ops",         rating: 4.2, students: 985,  isActive: true  },
];

/** Weekly = monthly / 4.3 */
const toWeeklyData = (data) =>
  data.map((d) => ({ ...d, revenue: Math.round(d.revenue / 4.3) }));

// ─── 2. Sub-components ────────────────────────────────────────────────────────

/** Glassmorphism card wrapper dùng chung */
const GlassCard = ({ children, className = "", style = {} }) => (
  <div
    className={`rounded-[2rem] border border-white/60 ${className}`}
    style={{
      background:     "rgba(255,255,255,0.7)",
      backdropFilter: "blur(10px)",
      boxShadow:      "0 10px 40px -10px rgba(0,191,165,0.15)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Badge "+14%" hoặc "✓ Target" */
const StatBadge = ({ badge, accentColor }) => {
  if (badge.type === "target") {
    return (
      <span className="flex items-center gap-1 text-xs font-bold" style={{ color: COLOR.teal }}>
        <Icon name="check" size={13} color={COLOR.teal} />
        Target
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
      style={{ background: "rgba(0,191,165,0.1)", color: accentColor }}
    >
      <Icon name="trending" size={13} color={accentColor} />
      {badge.text}
    </span>
  );
};

/** Stat card với hiệu ứng 3D hover + animated progress bar */
const StatCard = ({ card, animDelay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: animDelay }}
    whileHover={{ y: -8, transition: { duration: 0.25 } }}
  >
    <GlassCard className="p-8 relative overflow-hidden">
      {/* Decorative glow blob */}
      <div
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl"
        style={{ background: card.accentBg }}
      />

      <div className="flex justify-between items-start mb-5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: card.accentBg }}
        >
          <Icon name={card.icon} size={26} color={card.accentColor} />
        </div>
        <StatBadge badge={card.badge} accentColor={card.accentColor} />
      </div>

      <p className="text-slate-500 text-sm font-medium mb-1">{card.label}</p>
      <p
        className="text-4xl font-black font-mono mb-5"
        style={{ color: COLOR.ocean, letterSpacing: "-0.03em" }}
      >
        {card.value}
      </p>

      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: card.barWidth }}
          transition={{ delay: animDelay + 0.3, duration: 0.8, ease: "easeOut" }}
          style={{ background: card.barColor }}
        />
      </div>
    </GlassCard>
  </motion.div>
);

/** Bar chart thuần CSS — không cần recharts */
const RevenueBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="flex flex-col gap-4">
      <div className="h-56 flex items-end gap-2 px-1">
        {data.map((d, i) => {
          const heightPct = Math.round((d.revenue / max) * 100);
          const gradient  = i % 2 === 0
            ? "linear-gradient(to top, rgba(0,119,182,0.4), rgba(0,119,182,0.9))"
            : "linear-gradient(to top, rgba(0,191,165,0.4), rgba(0,191,165,0.9))";
          return (
            <div
              key={d.month}
              className="group flex-1 rounded-t-xl opacity-90 hover:opacity-100 transition-opacity relative cursor-default"
              style={{ height: `${heightPct}%`, background: gradient }}
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                ${(d.revenue / 1000).toFixed(1)}k
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis */}
      <div className="flex justify-between px-1">
        {data.map((d) => (
          <span key={d.month} className="flex-1 text-center text-[10px] text-slate-400 font-mono font-bold uppercase">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
};

/** Vòng tròn progress SVG */
const CircleProgress = ({ percent }) => {
  const r    = 16;
  const circ = 2 * Math.PI * r;
  const fill = (percent / 100) * circ;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle
          cx="18" cy="18" r={r} fill="none"
          stroke={COLOR.teal}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ - fill}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-800 font-mono">{percent}%</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Active</span>
      </div>
    </div>
  );
};

/** Hàng sao đánh giá */
const StarsRow = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={n <= Math.round(rating) ? COLOR.teal : "#e2e8f0"}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
    <span className="ml-1.5 text-xs font-bold font-mono text-slate-700">{rating.toFixed(1)}</span>
  </div>
);

// ─── 3. Main component ────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [chartMode, setChartMode] = useState("month"); // "week" | "month"

  const chartData = chartMode === "month" ? REVENUE_DATA : toWeeklyData(REVENUE_DATA);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }).toUpperCase();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-8 min-h-screen"
      style={{ background: COLOR.bgPage }}
    >

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between mb-10 gap-4">

        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: COLOR.ocean }}>
            Operations Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-mono">
            SYSTEM_STATUS:{" "}
            <span className="font-bold" style={{ color: COLOR.teal }}>OPTIMAL</span>
            {" "}| {today}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {/* Search */}
          <div className="hidden lg:flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2 gap-2 shadow-sm">
            <Icon name="search" size={16} color="#94a3b8" />
            <input
              placeholder="Search data points..."
              className="bg-transparent outline-none text-sm w-52 text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Bell */}
          <div className="relative">
            <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:border-teal-300 transition-colors">
              <Icon name="bell" size={18} color="#64748b" />
            </button>
            <span
              className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-50"
              style={{ background: COLOR.teal }}
            />
          </div>

          {/* Export */}
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold tracking-wide hover:scale-105 transition-transform shadow-lg"
            style={{ background: COLOR.teal, boxShadow: "0 8px 20px -8px rgba(0,191,165,0.5)" }}
          >
            <Icon name="note" size={16} color="white" />
            EXPORT REPORT
          </button>
        </motion.div>
      </header>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.key} card={card} animDelay={0.1 + i * 0.08} />
        ))}
      </div>

      {/* ── Revenue Chart + Right Column ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Revenue Growth chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-8 h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black" style={{ color: COLOR.ocean }}>
                  Revenue Growth
                </h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
                  Holographic Projection
                </p>
              </div>

              {/* Week / Month toggle */}
              <div className="flex gap-2">
                {["week", "month"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setChartMode(mode)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    style={
                      chartMode === mode
                        ? { background: COLOR.teal, color: "white", boxShadow: "0 4px 12px rgba(0,191,165,0.35)" }
                        : { background: "#f1f5f9", color: "#64748b" }
                    }
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <RevenueBarChart data={chartData} />
          </GlassCard>
        </motion.div>

        {/* Right: Engagement donut + System alert */}
        <motion.div
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-lg font-black mb-4" style={{ color: COLOR.ocean }}>
              Course Engagement
            </h2>
            <CircleProgress percent={80} />
          </GlassCard>

          <GlassCard
            className="p-5"
            style={{ borderLeft: `4px solid ${COLOR.teal}`, borderRadius: "1rem" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,191,165,0.12)" }}
              >
                <Icon name="shield" size={18} color={COLOR.teal} />
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1" style={{ color: COLOR.ocean }}>
                  System Integration Complete
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cloud instances synced across all regions.
                </p>
                <p className="text-[10px] font-mono mt-2" style={{ color: COLOR.teal }}>
                  Just now
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Top Performing Instructors ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <GlassCard className="overflow-hidden">

          {/* Section header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black" style={{ color: COLOR.ocean }}>
                Top Performing Instructors
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">Academic efficiency rankings</p>
            </div>
            <button
              onClick={() => navigate(ROUTES.ADMIN_USERS)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="View all"
            >
              <Icon name="menu" size={18} color="#94a3b8" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60">
                  {["Instructor", "Specialization", "Course Rating", "Active Students", "Status"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 ${i === 4 ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {MOCK_INSTRUCTORS.map((ins, i) => (
                  <motion.tr
                    key={ins.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                    onClick={() => navigate(ROUTES.ADMIN_USERS)}
                  >
                    {/* Name */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ring-2 ring-offset-2 ring-teal-200"
                          style={{ background: `linear-gradient(135deg, ${COLOR.ocean}, ${COLOR.teal})` }}
                        >
                          {getInitials(ins.name)}
                        </div>
                        <div>
                          <p className="text-base font-black" style={{ color: COLOR.ocean }}>
                            {ins.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {ins.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Spec */}
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">{ins.spec}</td>

                    {/* Rating */}
                    <td className="px-8 py-5"><StarsRow rating={ins.rating} /></td>

                    {/* Students */}
                    <td className="px-8 py-5 text-xl font-black font-mono" style={{ color: COLOR.ocean }}>
                      {ins.students.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-8 py-5 text-right">
                      {ins.isActive ? (
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                          style={{ background: "rgba(0,191,165,0.1)", color: COLOR.teal }}
                        >
                          <Icon name="trending" size={12} color={COLOR.teal} />
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-400">
                          On Break
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50/40 flex justify-center border-t border-slate-50">
            <button
              onClick={() => navigate(ROUTES.ADMIN_USERS)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-60 transition-opacity"
              style={{ color: COLOR.teal }}
            >
              View Full Personnel Registry
              <Icon name="chevronRight" size={14} color={COLOR.teal} />
            </button>
          </div>
        </GlassCard>
      </motion.div>

    </motion.div>
  );
};

export default AdminDashboard;
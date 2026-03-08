import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CourseCard from "../../../components/common/CourseCard";
import { Icon } from "../../../components/ui";
import { FAKE_COURSES } from "../../../utils/fakeData";
import { pageVariants } from "../../../utils/helpers";
import { ROUTES } from "../../../utils/constants";
import useCourseStore from "../../../store/slices/courseStore";
import useAuthStore from "../../../store/slices/authStore";
import { useToast } from "../../../contexts/ToastContext";

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { label: "Học viên tin dùng",   value: "20K+",  delay: 0 },
  { label: "Khóa học chuyên sâu", value: "150+",  delay: 0.1 },
  { label: "Mức độ hài lòng",     value: "95%",   delay: 0.2 },
  { label: "Đánh giá App Store",  value: "4.9/5", delay: 0.3 },
];

const TOOLS = [
  {
    icon: "terminal",
    iconColor: "var(--color-primary)",
    bg: "var(--color-primary-bg)",
    title: "Code Lab",
    desc: "Thực hành lập trình đa ngôn ngữ ngay trên trình duyệt.",
    route: ROUTES.COURSES,
  },
  {
    icon: "hub",
    iconColor: "#8B5CF6",
    bg: "#F5F3FF",
    title: "Mind 3D",
    desc: "Hệ thống hóa kiến thức qua sơ đồ tư duy không gian 3D.",
    route: ROUTES.COURSES,
  },
  {
    icon: "sparkles",
    iconColor: "#EC4899",
    bg: "#FDF2F8",
    title: "AI Mentor",
    desc: "Trợ lý ảo hỗ trợ giải đáp thắc mắc 24/7 tức thì.",
    route: ROUTES.COURSES,
  },
  {
    icon: "users",
    iconColor: "var(--color-secondary)",
    bg: "var(--color-secondary-bg)",
    title: "Live Hub",
    desc: "Kết nối và thảo luận cùng cộng đồng học viên toàn cầu.",
    route: ROUTES.ABOUT,
  },
];

const MILESTONES = [
  {
    icon: "compass",
    title: "Khám phá",
    desc: "Định hướng nghề nghiệp và lĩnh vực đam mê",
    color: "var(--gradient-brand)",
    rotate: "-2deg",
    pos: { bottom: "1rem", left: "5%" },
    delay: 0,
    route: ROUTES.COURSES,
  },
  {
    icon: "book-open",
    title: "Học tập",
    desc: "Kiến thức chuyên sâu từ chuyên gia",
    color: "var(--gradient-secondary)",
    rotate: "3deg",
    pos: { top: "40%", left: "28%" },
    delay: 0.5,
    route: ROUTES.COURSES,
  },
  {
    icon: "code",
    title: "Thực hành",
    desc: "Xây dựng dự án thực tế trong Lab",
    color: "var(--gradient-brand)",
    rotate: "-1deg",
    pos: { top: "20%", right: "25%" },
    delay: 1,
    route: ROUTES.COURSES,
  },
  {
    icon: "award",
    title: "Chứng chỉ",
    desc: "Khẳng định năng lực quốc tế",
    color: "var(--gradient-purple)",
    rotate: "6deg",
    pos: { top: "0", right: "5%" },
    delay: 1.5,
    route: ROUTES.ABOUT,
  },
];

// Sidebar items trong Dashboard preview — liên kết đúng route của app
const SIDEBAR_ITEMS = [
  { icon: "layout",   label: "Dashboard", route: ROUTES.STUDENT_DASHBOARD, active: true },
  { icon: "book",     label: "Courses",   route: ROUTES.MY_COURSES },
  { icon: "trending", label: "Progress",  route: ROUTES.PROGRESS },
  { icon: "settings", label: "Settings",  route: ROUTES.STUDENT_SETTINGS },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Aurora radial-gradient background — fixed, behind everything */
const AuroraBg = () => (
  <div
    aria-hidden
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      background: `
        radial-gradient(circle at 0% 0%,    var(--aurora-tl) 0%, transparent 40%),
        radial-gradient(circle at 100% 0%,  var(--aurora-tr) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%,  var(--aurora-c)  0%, transparent 70%),
        radial-gradient(circle at 100% 100%,var(--aurora-br) 0%, transparent 40%),
        radial-gradient(circle at 0% 100%,  var(--aurora-bl) 0%, transparent 40%)
      `,
      filter: "blur(60px)",
      opacity: 0.9,
    }}
  />
);

/** Reusable glass card wrapper */
const GlassCard = ({ children, className = "", style = {}, onClick }) => (
  <div
    className={`glass-card ${className}`}
    style={style}
    onClick={onClick}
  >
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuthStore();
  const { enrolledCourseIds, wishlistIds, enroll, toggleWishlist } = useCourseStore();
  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  /** Đăng ký khóa học: guard auth → enroll → navigate vào learning page */
  const handleEnroll = (course) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    enroll(course.id);
    toast.success(`Đã đăng ký "${course.title}"!`);
    navigate(`/student/learning/${course.id}`);
  };

  /** Toggle yêu thích: guard auth */
  const handleWishlist = (courseId) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    toggleWishlist(courseId);
    toast.success(
      wishlistIds.includes(courseId)
        ? "Đã xóa khỏi yêu thích"
        : "Đã thêm vào yêu thích"
    );
  };

  /**
   * Navigate đến các route cần auth (sidebar, avatar, v.v.):
   * chưa đăng nhập → redirect về /signin
   */
  const handleAuthRoute = (route) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    navigate(route);
  };

  /** Avatar initial từ tên user, fallback "U" */
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <AuroraBg />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ position: "relative", zIndex: 1 }}
      >

        {/* ════════════════════════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">

          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-muted font-bold tracking-[0.3em] text-[10px] uppercase mb-4 block"
          >
            TƯƠNG LAI CỦA GIÁO DỤC
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tighter text-heading leading-[1.1]"
          >
            Nền tảng học công nghệ<br />
            <span className="gradient-text">của tương lai</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="max-w-2xl mx-auto text-muted text-lg md:text-xl font-medium leading-relaxed mb-10"
          >
            Trải nghiệm học tập 3D đỉnh cao với giáo trình chuẩn quốc tế, giúp bạn
            làm chủ công nghệ và kiến tạo sự nghiệp mơ ước.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-6 mb-16"
          >
            {/*
              Đã đăng nhập  → "Vào học ngay" → student dashboard
              Chưa đăng nhập → "Tham gia ngay" → /signup
            */}
            <button
              className="btn-aurora"
              onClick={() =>
                navigate(isAuthenticated ? ROUTES.STUDENT_DASHBOARD : ROUTES.REGISTER)
              }
            >
              {isAuthenticated ? "Vào học ngay" : "Tham gia ngay"}
            </button>

            {/* Luôn dẫn đến danh sách khóa học */}
            <GlassCard
              className="px-10 py-4 rounded-2xl font-bold flex items-center gap-3 cursor-pointer hover:bg-white/60 transition-all duration-300"
              onClick={() => navigate(ROUTES.COURSES)}
            >
              <Icon name="play" size={20} color="var(--color-secondary)" />
              Xem lộ trình
            </GlassCard>
          </motion.div>

          {/* ── Dashboard Preview Card ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="relative max-w-6xl mx-auto"
          >
            <div className="absolute inset-0 bg-white/30 blur-3xl -z-10 rounded-[3rem]" />
            <GlassCard className="rounded-[2.5rem] p-4 md:p-8 shadow-2xl overflow-hidden hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar — mỗi item là button navigate đến đúng route */}
                <nav className="w-full md:w-56 border-r border-border/50 pr-6 hidden lg:block text-left shrink-0">
                  <div className="space-y-1">
                    {SIDEBAR_ITEMS.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleAuthRoute(item.route)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-colors text-left ${
                          item.active
                            ? "bg-white shadow-sm text-heading"
                            : "text-muted hover:text-body hover:bg-white/40"
                        }`}
                      >
                        <Icon
                          name={item.icon}
                          size={18}
                          color={item.active ? "var(--color-secondary)" : "currentColor"}
                        />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </nav>

                {/* Main content */}
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-extrabold tracking-tight text-heading">
                      Learning Hub
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/60 px-4 py-2 rounded-full text-xs font-bold border border-border">
                        76% Complete
                      </div>
                      {/* Avatar: click → student profile (guard auth) */}
                      <button
                        onClick={() => handleAuthRoute(ROUTES.STUDENT_PROFILE)}
                        className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: "var(--gradient-brand)" }}
                        title={isAuthenticated ? user?.name : "Đăng nhập để xem profile"}
                      >
                        {userInitial}
                      </button>
                    </div>
                  </div>

                  {/* Mini charts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Growth Rate bar chart */}
                    <div className="bg-white/40 p-5 rounded-3xl border border-white/60">
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-3 block">
                        Growth Rate
                      </span>
                      <div className="h-24 flex items-end gap-2">
                        {[50, 65, 100, 75].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-xl"
                            style={{
                              height: `${h}%`,
                              background: i === 2 ? "var(--gradient-brand)" : "var(--color-primary-bg)",
                              opacity: i === 2 ? 1 : 0.6,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Overall Progress ring */}
                    <div className="bg-white/40 p-5 rounded-3xl border border-white/60 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-3 block">
                        Overall Progress
                      </span>
                      <div className="relative w-20 h-20">
                        <svg
                          className="w-full h-full"
                          style={{ transform: "rotate(-90deg)" }}
                          viewBox="0 0 36 36"
                        >
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="16"
                            fill="none"
                            stroke="url(#progressGrad)"
                            strokeDasharray="76,100"
                            strokeLinecap="round"
                            strokeWidth="3"
                          />
                          <defs>
                            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%"   stopColor="var(--color-primary)" />
                              <stop offset="100%" stopColor="var(--color-secondary)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-heading">
                          76%
                        </div>
                      </div>
                    </div>

                    {/* Weekly Activity bars */}
                    <div className="bg-white/40 p-5 rounded-3xl border border-white/60">
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-3 block">
                        Weekly Activity
                      </span>
                      <div className="space-y-3 pt-2">
                        {[100, 65, 80].map((w, i) => (
                          <div key={i} className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${w}%`,
                                background: i % 2 === 0 ? "var(--color-primary)" : "var(--color-secondary)",
                                opacity: 0.7,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Next lessons — dùng FAKE_COURSES thật, click đến course detail hoặc learning */}
                  <div>
                    <h4 className="text-xl font-extrabold mb-4 text-heading">Bài học tiếp theo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {FAKE_COURSES.slice(0, 2).map((course) => (
                        <button
                          key={course.id}
                          onClick={() =>
                            enrolledCourseIds.includes(course.id)
                              ? navigate(`/student/learning/${course.id}`)
                              : navigate(`/courses/${course.id}`)
                          }
                          className="bg-white/80 p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-all cursor-pointer group border border-border/50 text-left w-full"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0">
                              <img
                                src={course.image}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-xs uppercase tracking-tight text-heading line-clamp-1">
                                {course.title}
                              </p>
                              <p className="text-[9px] font-bold text-muted uppercase tracking-tighter mt-0.5">
                                {course.category} · {course.level}
                              </p>
                            </div>
                          </div>
                          <Icon name="chevronRight" size={16} color="var(--text-muted)" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </GlassCard>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            LEARNING PATH
        ════════════════════════════════════════════════════════════════ */}
        <section
          className="max-w-7xl mx-auto px-6 py-16 relative"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(240,253,250,0.5) 0%, transparent 100%)" }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight text-heading">
              Lộ trình học tập thông minh
            </h2>
            <p className="text-muted font-medium">
              Trải nghiệm hành trình chinh phục công nghệ qua 4 giai đoạn chiến lược
            </p>
          </div>

          <div className="relative min-h-[500px] flex items-center justify-center">

            {/* Background particles */}
            <div aria-hidden className="particle" style={{ top: "20%", left: "15%", animationDelay: "0s" }} />
            <div aria-hidden className="particle" style={{ top: "50%", left: "45%", animationDelay: "-3s" }} />
            <div aria-hidden className="particle" style={{ top: "80%", left: "75%", animationDelay: "-6s" }} />

            {/* Glowing energy ribbon — 2 lớp: glow phía dưới + dashed trên */}
            <svg
              className="absolute w-full pointer-events-none z-0"
              style={{ height: 500 }}
              preserveAspectRatio="none"
              viewBox="0 0 1200 500"
            >
              <defs>
                <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="var(--color-primary)" />
                  <stop offset="50%"  stopColor="var(--color-secondary)" />
                  <stop offset="100%" stopColor="var(--color-success)" />
                </linearGradient>
                {/* Glow filter */}
                <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Layer 1: thick glowing ribbon */}
              <path
                className="opacity-60"
                d="M 150 400 C 300 400, 350 150, 450 150 C 550 150, 650 375, 750 375 C 850 375, 950 150, 1100 150"
                fill="none"
                stroke="url(#ribbonGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                filter="url(#ribbonGlow)"
              />

              {/* Layer 2: animated white dashes on top */}
              <path
                className="step-path opacity-80"
                d="M 150 400 C 300 400, 350 150, 450 150 C 550 150, 650 375, 750 375 C 850 375, 950 150, 1100 150"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 10"
              />
            </svg>

            {/*
              Milestone stations — tọa độ tính từ path SVG (viewBox 0 0 1200 500):
                Khám phá  → M  150, 400  →  left=12.5%,  top=80%
                Học tập   → C  450, 150  →  left=37.5%,  top=30%
                Thực hành → C  750, 375  →  left=62.5%,  top=75%
                Chứng chỉ → C 1100, 150  →  left=91.7%,  top=30%
              transform: translate(-50%, -50%) để tâm card khớp đúng điểm path.
            */}
            <div className="absolute inset-0 z-10">

              {/* Station 1: Khám phá — điểm đầu path (150, 400) */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0 }}
                whileHover={{ scale: 1.08 }}
                onClick={() => navigate(MILESTONES[0].route)}
                className="absolute flex flex-col items-center milestone-float"
                style={{ left: "12.5%", top: "80%", transform: "translate(-50%, -50%)" }}
              >
                <div
                  className="w-40 h-28 glass-card rounded-[2rem] border-2 flex flex-col items-center justify-center p-4"
                  style={{ borderColor: "rgba(52,211,153,0.5)", boxShadow: "0 0 30px rgba(52,211,153,0.15)" }}
                >
                  <Icon name="compass" size={36} color="var(--color-primary)" className="milestone-icon-pulse" />
                  <span className="font-bold text-sm mt-2 text-heading">Khám phá</span>
                </div>
                <p className="text-[9px] text-muted font-bold uppercase mt-3 tracking-widest">Tech Discovery</p>
              </motion.button>

              {/* Station 2: Học tập — đỉnh cao path (450, 150) */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.08 }}
                onClick={() => navigate(MILESTONES[1].route)}
                className="absolute flex flex-col items-center milestone-float"
                style={{ left: "37.5%", top: "30%", transform: "translate(-50%, -50%)", animationDelay: "0.5s" }}
              >
                <div
                  className="w-40 h-28 glass-card rounded-[2rem] border-2 flex flex-col items-center justify-center p-4"
                  style={{ borderColor: "rgba(52,211,153,0.5)", boxShadow: "0 0 30px rgba(52,211,153,0.15)" }}
                >
                  <Icon name="book-open" size={36} color="var(--color-secondary)" className="milestone-icon-pulse" />
                  <span className="font-bold text-sm mt-2 text-heading">Học tập</span>
                </div>
                <p className="text-[9px] text-muted font-bold uppercase mt-3 tracking-widest">Digital Wisdom</p>
              </motion.button>

              {/* Station 3: Thực hành — điểm lõm path (750, 375) */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.08 }}
                onClick={() => navigate(MILESTONES[2].route)}
                className="absolute flex flex-col items-center milestone-float"
                style={{ left: "62.5%", top: "75%", transform: "translate(-50%, -50%)", animationDelay: "1s" }}
              >
                <div
                  className="w-40 h-28 glass-card rounded-[2rem] border-2 flex flex-col items-center justify-center p-4"
                  style={{ borderColor: "rgba(52,211,153,0.5)", boxShadow: "0 0 30px rgba(52,211,153,0.15)" }}
                >
                  <Icon name="code" size={36} color="var(--color-secondary-light)" className="milestone-icon-pulse" />
                  <span className="font-bold text-sm mt-2 text-heading">Thực hành</span>
                </div>
                <p className="text-[9px] text-muted font-bold uppercase mt-3 tracking-widest">Cyber Forge</p>
              </motion.button>

              {/* Station 4: Chứng chỉ — điểm cuối path (1100, 150) */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.08 }}
                onClick={() => navigate(MILESTONES[3].route)}
                className="absolute flex flex-col items-center milestone-float"
                style={{ left: "91.7%", top: "30%", transform: "translate(-50%, -50%)", animationDelay: "1.5s" }}
              >
                <div
                  className="w-40 h-28 glass-card rounded-[2rem] border-2 flex flex-col items-center justify-center p-4"
                  style={{ borderColor: "rgba(52,211,153,0.5)", boxShadow: "0 0 30px rgba(52,211,153,0.15)" }}
                >
                  <Icon name="award" size={36} color="var(--color-success)" className="milestone-icon-pulse" />
                  <span className="font-bold text-sm mt-2 text-heading">Chứng chỉ</span>
                </div>
                <p className="text-[9px] text-muted font-bold uppercase mt-3 tracking-widest">Neon Credential</p>
              </motion.button>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            TOOLS
        ════════════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight text-heading">
              Công cụ học tập đỉnh cao
            </h2>
            <p className="text-muted font-medium">Tích hợp AI và môi trường giả lập tiên tiến</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOOLS.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard
                  className="p-8 rounded-[2.5rem] group hover:bg-white/80 transition-all duration-300 hover:border-primary/20 h-full cursor-pointer"
                  onClick={() => navigate(tool.route)}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: tool.bg }}
                  >
                    <Icon name={tool.icon} size={26} color={tool.iconColor} />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-heading">{tool.title}</h4>
                  <p className="text-muted text-sm leading-relaxed font-medium">{tool.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            FEATURED COURSES
            Dùng lại CourseCard + handleEnroll + handleWishlist từ HomePage cũ
        ════════════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight text-heading">
              Khóa học chuyên sâu
            </h2>
            <p className="text-muted font-medium">
              Cập nhật những xu hướng công nghệ mới nhất
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <GlassCard key={i} className="rounded-[2.5rem] overflow-hidden">
                  <div className="h-48 bg-white/40 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-white/40 rounded-full animate-pulse" />
                    <div className="h-3 bg-white/40 rounded-full w-3/4 animate-pulse" />
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FAKE_COURSES.slice(0, 4).map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CourseCard
                    course={course}
                    onEnroll={handleEnroll}
                    onWishlist={handleWishlist}
                    isEnrolled={enrolledCourseIds.includes(course.id)}
                    isWishlisted={wishlistIds.includes(course.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <button
              className="btn-aurora-outline"
              onClick={() => navigate(ROUTES.COURSES)}
            >
              Xem tất cả khóa học
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            TRUST & STATS
        ════════════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 py-16 pb-24 text-center">
          <h2 className="text-4xl font-extrabold mb-3 tracking-tight text-heading">
            Trust &amp; Stats
          </h2>
          <p className="text-muted font-medium mb-16">
            Cộng đồng học tập lớn mạnh nhất khu vực
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: s.delay }}
              >
                <div className="deep-glass p-12 rounded-[3rem] relative overflow-hidden flex flex-col justify-center items-center">
                  <div aria-hidden className="particle" style={{ top: "20%", left: "10%", animationDelay: "0s" }} />
                  <div aria-hidden className="particle" style={{ top: "60%", left: "80%", animationDelay: "-5s", background: "var(--color-primary)" }} />
                  <h3
                    className="text-6xl font-black mb-4 gradient-text"
                    style={{ letterSpacing: "-0.05em" }}
                  >
                    {s.value}
                  </h3>
                  <p className="text-muted font-bold uppercase tracking-[0.2em] text-[10px]">
                    {s.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </motion.div>
    </>
  );
};

export default HomePage;
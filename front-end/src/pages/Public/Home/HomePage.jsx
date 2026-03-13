import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../../../components/common/CourseCard";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import useCategorySection from "../../../hooks/useCategorySection";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

// ─── Static data ──────────────────────────────────────────────────────────────
const STATS = [
  { label: "Learners Worldwide", value: "20K+", delay: 0 },
  { label: "Expert Courses", value: "150+", delay: 0.1 },
  { label: "Satisfaction Rate", value: "95%", delay: 0.2 },
  { label: "App Store Rating", value: "4.9/5", delay: 0.3 },
];

const TOOLS = [
  {
    icon: "terminal",
    iconColor: "var(--color-primary)",
    bg: "var(--color-primary-bg)",
    title: "Code Lab",
    desc: "Write and run multi-language code directly in your browser.",
    route: ROUTES.COURSES,
  },
  {
    icon: "hub",
    iconColor: "#8B5CF6",
    bg: "#F5F3FF",
    title: "Mind 3D",
    desc: "Organize knowledge through immersive 3D mind mapping.",
    route: ROUTES.COURSES,
  },
  {
    icon: "sparkles",
    iconColor: "#EC4899",
    bg: "#FDF2F8",
    title: "AI Mentor",
    desc: "Get instant answers from your personal AI tutor, 24/7.",
    route: ROUTES.COURSES,
  },
  {
    icon: "users",
    iconColor: "var(--color-secondary)",
    bg: "var(--color-secondary-bg)",
    title: "Live Hub",
    desc: "Connect and collaborate with learners across the globe.",
    route: ROUTES.ABOUT,
  },
];

const MILESTONES = [
  {
    icon: "compass",
    title: "Discover",
    sub: "Tech Discovery",
    desc: "Find your career direction and passion",
    route: ROUTES.COURSES,
  },
  {
    icon: "book-open",
    title: "Learn",
    sub: "Digital Wisdom",
    desc: "Expert-led, deeply structured curriculum",
    route: ROUTES.COURSES,
  },
  {
    icon: "code",
    title: "Build",
    sub: "Cyber Forge",
    desc: "Ship real projects inside the Lab",
    route: ROUTES.COURSES,
  },
  {
    icon: "award",
    title: "Certify",
    sub: "Neon Credential",
    desc: "Prove your skills internationally",
    route: ROUTES.ABOUT,
  },
];

const SIDEBAR_ITEMS = [
  {
    icon: "layout",
    label: "Dashboard",
    route: ROUTES.STUDENT_DASHBOARD,
    active: true,
  },
  { icon: "book", label: "Courses", route: ROUTES.MY_COURSES },
  { icon: "trending", label: "Progress", route: ROUTES.PROGRESS },
  { icon: "settings", label: "Settings", route: ROUTES.STUDENT_SETTINGS },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const AuroraBg = () => (
  <div
    aria-hidden
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      background: `radial-gradient(circle at 0% 0%,var(--aurora-tl) 0%,transparent 40%),radial-gradient(circle at 100% 0%,var(--aurora-tr) 0%,transparent 40%),radial-gradient(circle at 50% 50%,var(--aurora-c) 0%,transparent 70%),radial-gradient(circle at 100% 100%,var(--aurora-br) 0%,transparent 40%),radial-gradient(circle at 0% 100%,var(--aurora-bl) 0%,transparent 40%)`,
      filter: "blur(60px)",
      opacity: 0.9,
    }}
  />
);

const GlassCard = ({ children, className = "", style = {}, onClick }) => (
  <div className={`glass-card ${className}`} style={style} onClick={onClick}>
    {children}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { enrolledCourseIds, wishlistIds, enroll, toggleWishlist } =
    useCourseStore();
  const toast = useToast();

  const {
    sections: categorySections,
    loading: sectionsLoading,
    error: sectionsError,
  } = useCategorySection({ limit: 4, sortBy: "popular", maxCategories: 5 });

  // Up Next: 2 popular courses từ API
  const [upNext, setUpNext] = useState([]);
  useEffect(() => {
    CourseService.searchCourses({ sortBy: "popular", limit: 2 })
      .then((r) => setUpNext(r.courses ?? []))
      .catch(() => {});
  }, []);

  const handleEnroll = (course) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    enroll(course._id);
    toast.success(`Enrolled in "${course.title}"!`);
    navigate(`/student/learning/${course._id}`);
  };

  const handleWishlist = (courseId) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    toggleWishlist(courseId);
    toast.success(
      wishlistIds.includes(courseId)
        ? "Removed from wishlist"
        : "Added to wishlist",
    );
  };

  const handleAuthRoute = (route) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    navigate(route);
  };

  const userInitial = user?.fullname
    ? user.fullname.charAt(0).toUpperCase()
    : (user?.email?.charAt(0).toUpperCase() ?? "U");

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
        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section className="px-6 pt-24 pb-20 mx-auto text-center max-w-7xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-muted font-bold tracking-[0.3em] text-[10px] uppercase mb-4 block"
          >
            THE FUTURE OF EDUCATION
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tighter text-heading leading-[1.1]"
          >
            Master technology
            <br />
            <span className="gradient-text">at your own pace</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="max-w-2xl mx-auto mb-10 text-lg font-medium leading-relaxed text-muted md:text-xl"
          >
            World-class curriculum crafted by industry experts. Build real
            skills, earn globally recognized certificates, and accelerate your
            career.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-6 mb-16"
          >
            <button
              className="btn-aurora"
              onClick={() =>
                navigate(
                  isAuthenticated ? ROUTES.STUDENT_DASHBOARD : ROUTES.REGISTER,
                )
              }
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Learning Free"}
            </button>
            <GlassCard
              className="flex items-center gap-3 px-10 py-4 font-bold transition-all duration-300 cursor-pointer rounded-2xl hover:bg-white/60"
              onClick={() => navigate(ROUTES.COURSES)}
            >
              <Icon name="play" size={20} color="var(--color-secondary)" />{" "}
              Browse Courses
            </GlassCard>
          </motion.div>

          {/* ── Dashboard Preview ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="relative max-w-6xl mx-auto"
          >
            <div className="absolute inset-0 bg-white/30 blur-3xl -z-10 rounded-[3rem]" />
            <GlassCard className="rounded-[2.5rem] p-4 md:p-8 shadow-2xl overflow-hidden hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col gap-8 md:flex-row">
                {/* Sidebar nav */}
                <nav className="hidden w-full pr-6 text-left border-r md:w-56 border-border/50 lg:block shrink-0">
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
                          color={
                            item.active
                              ? "var(--color-secondary)"
                              : "currentColor"
                          }
                        />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </nav>

                {/* Main */}
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-extrabold tracking-tight text-heading">
                      Learning Hub
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 text-xs font-bold border rounded-full bg-white/60 border-border">
                        76% Complete
                      </div>
                      <button
                        onClick={() => handleAuthRoute(ROUTES.STUDENT_PROFILE)}
                        className="flex items-center justify-center w-12 h-12 overflow-hidden text-sm font-bold text-white border-2 border-white shadow-sm rounded-2xl"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        {userInitial}
                      </button>
                    </div>
                  </div>

                  {/* Mini charts */}
                  <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                    <div className="p-5 border bg-white/40 rounded-3xl border-white/60">
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-3 block">
                        Growth Rate
                      </span>
                      <div className="flex items-end h-24 gap-2">
                        {[50, 65, 100, 75].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-xl"
                            style={{
                              height: `${h}%`,
                              background:
                                i === 2
                                  ? "var(--gradient-brand)"
                                  : "var(--color-primary-bg)",
                              opacity: i === 2 ? 1 : 0.6,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-5 border bg-white/40 rounded-3xl border-white/60">
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-3 block">
                        Overall Progress
                      </span>
                      <div className="relative w-20 h-20">
                        <svg
                          className="w-full h-full"
                          style={{ transform: "rotate(-90deg)" }}
                          viewBox="0 0 36 36"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="#E2E8F0"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="url(#pg)"
                            strokeDasharray="76,100"
                            strokeLinecap="round"
                            strokeWidth="3"
                          />
                          <defs>
                            <linearGradient
                              id="pg"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor="var(--color-primary)"
                              />
                              <stop
                                offset="100%"
                                stopColor="var(--color-secondary)"
                              />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-heading">
                          76%
                        </div>
                      </div>
                    </div>
                    <div className="p-5 border bg-white/40 rounded-3xl border-white/60">
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-3 block">
                        Weekly Activity
                      </span>
                      <div className="pt-2 space-y-3">
                        {[100, 65, 80].map((w, i) => (
                          <div
                            key={i}
                            className="h-2.5 bg-slate-100 rounded-full overflow-hidden"
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${w}%`,
                                background:
                                  i % 2 === 0
                                    ? "var(--color-primary)"
                                    : "var(--color-secondary)",
                                opacity: 0.7,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Up Next — real API */}
                  <div>
                    <h4 className="mb-4 text-xl font-extrabold text-heading">
                      Up Next
                    </h4>
                    {upNext.length === 0 ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {[...Array(2)].map((_, i) => (
                          <div
                            key={i}
                            className="h-16 rounded-2xl bg-white/40 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {upNext.map((course) => (
                          <button
                            key={course._id}
                            onClick={() =>
                              enrolledCourseIds.includes(course._id)
                                ? navigate(`/student/learning/${course._id}`)
                                : navigate(`/courses/${course._id}`)
                            }
                            className="flex items-center justify-between w-full p-4 text-left transition-all border cursor-pointer bg-white/80 rounded-2xl hover:shadow-md group border-border/50"
                          >
                            <div className="flex items-center gap-4">
                              <div className="overflow-hidden w-11 h-11 rounded-xl shrink-0">
                                <img
                                  src={
                                    course.thumbnail ||
                                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=88&h=88&fit=crop"
                                  }
                                  alt={course.title}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div>
                                <p className="text-xs font-bold tracking-tight uppercase text-heading line-clamp-1">
                                  {course.title}
                                </p>
                                <p className="text-[9px] font-bold text-muted uppercase tracking-tighter mt-0.5">
                                  {course.category?.name} · {course.level}
                                </p>
                              </div>
                            </div>
                            <Icon
                              name="chevronRight"
                              size={16}
                              color="var(--text-muted)"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </section>

        {/* ══ LEARNING PATH ════════════════════════════════════════════════ */}
        <section
          className="relative px-6 py-16 mx-auto max-w-7xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%,rgba(240,253,250,0.5) 0%,transparent 100%)",
          }}
        >
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-heading">
              Your Learning Journey
            </h2>
            <p className="font-medium text-muted">
              Four strategic milestones from beginner to certified professional
            </p>
          </div>
          <div className="relative min-h-[500px] flex items-center justify-center">
            <svg
              className="absolute z-0 w-full pointer-events-none"
              style={{ height: 500 }}
              preserveAspectRatio="none"
              viewBox="0 0 1200 500"
            >
              <defs>
                <linearGradient
                  id="ribbonGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="50%" stopColor="var(--color-secondary)" />
                  <stop offset="100%" stopColor="var(--color-success)" />
                </linearGradient>
                <filter
                  id="ribbonGlow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path
                className="opacity-60"
                d="M 150 400 C 300 400,350 150,450 150 C 550 150,650 375,750 375 C 850 375,950 150,1100 150"
                fill="none"
                stroke="url(#ribbonGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                filter="url(#ribbonGlow)"
              />
              <path
                className="opacity-80"
                d="M 150 400 C 300 400,350 150,450 150 C 550 150,650 375,750 375 C 850 375,950 150,1100 150"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 10"
              />
            </svg>
            <div className="absolute inset-0 z-10">
              {[
                {
                  ms: MILESTONES[0],
                  left: "12.5%",
                  top: "80%",
                  delay: 0,
                  animDelay: "0s",
                },
                {
                  ms: MILESTONES[1],
                  left: "37.5%",
                  top: "30%",
                  delay: 0.15,
                  animDelay: "0.5s",
                },
                {
                  ms: MILESTONES[2],
                  left: "62.5%",
                  top: "75%",
                  delay: 0.3,
                  animDelay: "1s",
                },
                {
                  ms: MILESTONES[3],
                  left: "91.7%",
                  top: "30%",
                  delay: 0.45,
                  animDelay: "1.5s",
                },
              ].map(({ ms, left, top, delay, animDelay }) => (
                <motion.button
                  key={ms.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay }}
                  whileHover={{ scale: 1.08 }}
                  onClick={() => navigate(ms.route)}
                  className="absolute flex flex-col items-center milestone-float"
                  style={{
                    left,
                    top,
                    transform: "translate(-50%,-50%)",
                    animationDelay: animDelay,
                  }}
                >
                  <div
                    className="w-40 h-28 glass-card rounded-[2rem] border-2 flex flex-col items-center justify-center p-4"
                    style={{
                      borderColor: "rgba(52,211,153,0.5)",
                      boxShadow: "0 0 30px rgba(52,211,153,0.15)",
                    }}
                  >
                    <Icon
                      name={ms.icon}
                      size={36}
                      color="var(--color-primary)"
                    />
                    <span className="mt-2 text-sm font-bold text-heading">
                      {ms.title}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted font-bold uppercase mt-3 tracking-widest">
                    {ms.sub}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TOOLS ════════════════════════════════════════════════════════ */}
        <section className="px-6 py-16 mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-heading">
              Next-gen Learning Tools
            </h2>
            <p className="font-medium text-muted">
              AI-powered and simulator-driven environments
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                    className="flex items-center justify-center mb-6 w-14 h-14 rounded-2xl"
                    style={{ background: tool.bg }}
                  >
                    <Icon name={tool.icon} size={26} color={tool.iconColor} />
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-heading">
                    {tool.title}
                  </h4>
                  <p className="text-sm font-medium leading-relaxed text-muted">
                    {tool.desc}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══ FEATURED COURSES ═════════════════════════════════════════════ */}
        <section className="px-6 py-16 mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-heading">
              Featured Courses
            </h2>
            <p className="font-medium text-muted">
              Curated for the latest trends in technology
            </p>
          </div>

          {/* Skeleton */}
          {sectionsLoading && (
            <div className="space-y-12">
              {[...Array(3)].map((_, si) => (
                <div key={si}>
                  <div className="w-40 mb-6 rounded-full h-7 bg-white/50 animate-pulse" />
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="glass-card rounded-[2.5rem] overflow-hidden"
                      >
                        <div className="h-44 bg-white/40 animate-pulse" />
                        <div className="p-6 space-y-3">
                          <div className="h-4 rounded-full bg-white/40 animate-pulse" />
                          <div className="w-3/4 h-3 rounded-full bg-white/40 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!sectionsLoading && sectionsError && (
            <div className="py-16 text-center">
              <p className="mt-4 font-medium text-muted">
                Could not load courses. Please try again.
              </p>
              <button
                className="mt-4 text-sm btn-aurora-outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}

          {/* Real data */}
          {!sectionsLoading && !sectionsError && (
            <div className="space-y-16">
              {categorySections.map((section, si) => (
                <motion.div
                  key={section.category._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.07 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1.5 h-8 rounded-full"
                        style={{ background: "var(--gradient-brand)" }}
                      />
                      <h3 className="text-2xl font-extrabold tracking-tight text-heading">
                        {section.category.name}
                      </h3>
                      <span className="px-3 py-1 text-xs font-bold border rounded-full text-muted bg-white/50 border-border/40">
                        {section.total} courses
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        navigate(
                          `${ROUTES.COURSES}?category=${section.category._id}`,
                        )
                      }
                      className="flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-3 transition-all duration-200"
                    >
                      View all{" "}
                      <Icon
                        name="chevronRight"
                        size={16}
                        color="var(--color-primary)"
                      />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {section.courses.map((course, i) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <CourseCard
                          course={course}
                          onEnroll={handleEnroll}
                          onWishlist={handleWishlist}
                          isEnrolled={enrolledCourseIds.includes(course._id)}
                          isWishlisted={wishlistIds.includes(course._id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
              {categorySections.length === 0 && (
                <div className="py-20 text-center">
                  <p className="mt-4 text-lg font-medium text-muted">
                    No published courses yet.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 text-center">
            <button
              className="btn-aurora-outline"
              onClick={() => navigate(ROUTES.COURSES)}
            >
              Browse All Courses
            </button>
          </div>
        </section>

        {/* ══ STATS ════════════════════════════════════════════════════════ */}
        <section className="px-6 py-16 pb-24 mx-auto text-center max-w-7xl">
          <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-heading">
            Trusted by Thousands
          </h2>
          <p className="mb-16 font-medium text-muted">
            The fastest-growing tech learning community in Southeast Asia
          </p>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: s.delay }}
              >
                <div className="deep-glass p-12 rounded-[3rem] relative overflow-hidden flex flex-col justify-center items-center">
                  <h3
                    className="mb-4 text-6xl font-black gradient-text"
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

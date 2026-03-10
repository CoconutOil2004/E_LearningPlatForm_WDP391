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
import useCategorySection from "../../../hooks/useCategorySection";

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { label: "Learners Worldwide", value: "20K+",  delay: 0 },
  { label: "Expert Courses",     value: "150+",  delay: 0.1 },
  { label: "Satisfaction Rate",  value: "95%",   delay: 0.2 },
  { label: "App Store Rating",   value: "4.9/5", delay: 0.3 },
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
  { icon: "layout",   label: "Dashboard", route: ROUTES.STUDENT_DASHBOARD, active: true },
  { icon: "book",     label: "Courses",   route: ROUTES.MY_COURSES },
  { icon: "trending", label: "Progress",  route: ROUTES.PROGRESS },
  { icon: "settings", label: "Settings",  route: ROUTES.STUDENT_SETTINGS },
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

const GlassCard = ({ children, className = "", style = {}, onClick }) => (
  <div className={`glass-card ${className}`} style={style} onClick={onClick}>
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

  const {
    sections: categorySections,
    loading:  sectionsLoading,
    error:    sectionsError,
  } = useCategorySection({ limit: 4, sortBy: "popular", maxCategories: 5 });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleEnroll = (course) => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    enroll(course.id);
    toast.success(`Enrolled in "${course.title}"!`);
    navigate(`/student/learning/${course.id}`);
  };

  const handleWishlist = (courseId) => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    toggleWishlist(courseId);
    toast.success(
      wishlistIds.includes(courseId) ? "Removed from wishlist" : "Added to wishlist"
    );
  };

  const handleAuthRoute = (route) => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    navigate(route);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

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
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">

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
            Master technology<br />
            <span className="gradient-text">at your own pace</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="max-w-2xl mx-auto text-muted text-lg md:text-xl font-medium leading-relaxed mb-10"
          >
            World-class curriculum crafted by industry experts. Build real skills,
            earn globally recognized certificates, and accelerate your career.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-6 mb-16"
          >
            <button
              className="btn-aurora"
              onClick={() => navigate(isAuthenticated ? ROUTES.STUDENT_DASHBOARD : ROUTES.REGISTER)}
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Learning Free"}
            </button>

            <GlassCard
              className="px-10 py-4 rounded-2xl font-bold flex items-center gap-3 cursor-pointer hover:bg-white/60 transition-all duration-300"
              onClick={() => navigate(ROUTES.COURSES)}
            >
              <Icon name="play" size={20} color="var(--color-secondary)" />
              Browse Courses
            </GlassCard>
          </motion.div>

          {/* ── Dashboard Preview ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="relative max-w-6xl mx-auto"
          >
            <div className="absolute inset-0 bg-white/30 blur-3xl -z-10 rounded-[3rem]" />
            <GlassCard className="rounded-[2.5rem] p-4 md:p-8 shadow-2xl overflow-hidden hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar */}
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
                      <button
                        onClick={() => handleAuthRoute(ROUTES.STUDENT_PROFILE)}
                        className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: "var(--gradient-brand)" }}
                        title={isAuthenticated ? user?.name : "Sign in to view profile"}
                      >
                        {userInitial}
                      </button>
                    </div>
                  </div>

                  {/* Mini charts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

                    <div className="bg-white/40 p-5 rounded-3xl border border-white/60 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-3 block">
                        Overall Progress
                      </span>
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke="url(#progressGrad)"
                            strokeDasharray="76,100" strokeLinecap="round" strokeWidth="3" />
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

                  {/* Next lessons */}
                  <div>
                    <h4 className="text-xl font-extrabold mb-4 text-heading">Up Next</h4>
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
                              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
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

        {/* ══ LEARNING PATH ════════════════════════════════════════════════ */}
        <section
          className="max-w-7xl mx-auto px-6 py-16 relative"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(240,253,250,0.5) 0%, transparent 100%)" }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight text-heading">
              Your Learning Journey
            </h2>
            <p className="text-muted font-medium">
              Four strategic milestones from beginner to certified professional
            </p>
          </div>

          <div className="relative min-h-[500px] flex items-center justify-center">
            <div aria-hidden className="particle" style={{ top: "20%", left: "15%", animationDelay: "0s" }} />
            <div aria-hidden className="particle" style={{ top: "50%", left: "45%", animationDelay: "-3s" }} />
            <div aria-hidden className="particle" style={{ top: "80%", left: "75%", animationDelay: "-6s" }} />

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
                <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path
                className="opacity-60"
                d="M 150 400 C 300 400, 350 150, 450 150 C 550 150, 650 375, 750 375 C 850 375, 950 150, 1100 150"
                fill="none" stroke="url(#ribbonGrad)" strokeWidth="12" strokeLinecap="round"
                filter="url(#ribbonGlow)"
              />
              <path
                className="step-path opacity-80"
                d="M 150 400 C 300 400, 350 150, 450 150 C 550 150, 650 375, 750 375 C 850 375, 950 150, 1100 150"
                fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 10"
              />
            </svg>

            <div className="absolute inset-0 z-10">
              {/* Station 1: Discover — (150, 400) → left=12.5%, top=80% */}
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
                  <span className="font-bold text-sm mt-2 text-heading">{MILESTONES[0].title}</span>
                </div>
                <p className="text-[9px] text-muted font-bold uppercase mt-3 tracking-widest">{MILESTONES[0].sub}</p>
              </motion.button>

              {/* Station 2: Learn — (450, 150) → left=37.5%, top=30% */}
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
                  <span className="font-bold text-sm mt-2 text-heading">{MILESTONES[1].title}</span>
                </div>
                <p className="text-[9px] text-muted font-bold uppercase mt-3 tracking-widest">{MILESTONES[1].sub}</p>
              </motion.button>

              {/* Station 3: Build — (750, 375) → left=62.5%, top=75% */}
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
                  <span className="font-bold text-sm mt-2 text-heading">{MILESTONES[2].title}</span>
                </div>
                <p className="text-[9px] text-muted font-bold uppercase mt-3 tracking-widest">{MILESTONES[2].sub}</p>
              </motion.button>

              {/* Station 4: Certify — (1100, 150) → left=91.7%, top=30% */}
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
                  <span className="font-bold text-sm mt-2 text-heading">{MILESTONES[3].title}</span>
                </div>
                <p className="text-[9px] text-muted font-bold uppercase mt-3 tracking-widest">{MILESTONES[3].sub}</p>
              </motion.button>
            </div>
          </div>
        </section>

        {/* ══ TOOLS ════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight text-heading">
              Next-gen Learning Tools
            </h2>
            <p className="text-muted font-medium">AI-powered and simulator-driven environments</p>
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

        {/* ══ FEATURED COURSES ═════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-3 tracking-tight text-heading">
              Featured Courses
            </h2>
            <p className="text-muted font-medium">
              Curated for the latest trends in technology
            </p>
          </div>

          {/* Loading skeleton */}
          {sectionsLoading && (
            <div className="space-y-12">
              {[...Array(3)].map((_, si) => (
                <div key={si}>
                  <div className="h-7 w-40 bg-white/50 rounded-full animate-pulse mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="glass-card rounded-[2.5rem] overflow-hidden">
                        <div className="h-44 bg-white/40 animate-pulse" />
                        <div className="p-6 space-y-3">
                          <div className="h-4 bg-white/40 rounded-full animate-pulse" />
                          <div className="h-3 bg-white/40 rounded-full w-3/4 animate-pulse" />
                          <div className="h-3 bg-white/40 rounded-full w-1/2 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error fallback */}
          {!sectionsLoading && sectionsError && (
            <>
              <div className="mb-8 flex items-center gap-3 glass-card px-5 py-3 rounded-2xl w-fit mx-auto text-sm text-muted">
                <Icon name="wifi-off" size={16} color="var(--text-muted)" />
                Showing sample data · {sectionsError}
              </div>
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
            </>
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
                      <div className="w-1.5 h-8 rounded-full" style={{ background: "var(--gradient-brand)" }} />
                      <h3 className="text-2xl font-extrabold text-heading tracking-tight">
                        {section.category.name}
                      </h3>
                      <span className="text-xs text-muted font-bold bg-white/50 px-3 py-1 rounded-full border border-border/40">
                        {section.total} courses
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`${ROUTES.COURSES}?category=${section.category._id}`)}
                      className="flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-3 transition-all duration-200"
                    >
                      View all
                      <Icon name="chevronRight" size={16} color="var(--color-primary)" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {section.courses.map((course, i) => (
                      <motion.div
                        key={course.id ?? course._id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <CourseCard
                          course={course}
                          onEnroll={handleEnroll}
                          onWishlist={handleWishlist}
                          isEnrolled={enrolledCourseIds.includes(course.id ?? course._id)}
                          isWishlisted={wishlistIds.includes(course.id ?? course._id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}

              {categorySections.length === 0 && (
                <div className="text-center py-20">
                  <Icon name="inbox" size={48} color="var(--text-muted)" />
                  <p className="text-muted text-lg font-medium mt-4">
                    No published courses yet.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <button className="btn-aurora-outline" onClick={() => navigate(ROUTES.COURSES)}>
              Browse All Courses
            </button>
          </div>
        </section>

        {/* ══ TRUST & STATS ════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 py-16 pb-24 text-center">
          <h2 className="text-4xl font-extrabold mb-3 tracking-tight text-heading">
            Trusted by Thousands
          </h2>
          <p className="text-muted font-medium mb-16">
            The fastest-growing tech learning community in Southeast Asia
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
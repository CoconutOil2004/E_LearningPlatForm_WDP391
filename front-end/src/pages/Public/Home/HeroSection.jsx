import { Skeleton } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { ROUTES } from "../../../utils/constants";
import { GlassCard, SIDEBAR_ITEMS } from "./homeConstants";

/* ── Up-Next mini card ── */
const UpNextItem = ({ course, isEnrolled }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() =>
        isEnrolled
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
      <Icon name="chevronRight" size={16} color="var(--text-muted)" />
    </button>
  );
};

/* ── Dashboard preview widget ── */
const DashboardPreview = ({
  upNext,
  enrolledCourseIds,
  userInitial,
  onAuthRoute,
}) => (
  <GlassCard className="rounded-[2.5rem] p-4 md:p-8 shadow-2xl overflow-hidden hover:border-primary/20 transition-all duration-300">
    <div className="flex flex-col gap-8 md:flex-row">
      {/* Sidebar nav */}
      <nav className="hidden w-full pr-6 text-left border-r md:w-56 border-border/50 lg:block shrink-0">
        <div className="space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => onAuthRoute(item.route)}
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
            <div className="px-4 py-2 text-xs font-bold border rounded-full bg-white/60 border-border">
              76% Complete
            </div>
            <button
              onClick={() => onAuthRoute(ROUTES.STUDENT_PROFILE)}
              className="flex items-center justify-center w-12 h-12 overflow-hidden text-sm font-bold text-white border-2 border-white shadow-sm rounded-2xl"
              style={{ background: "var(--gradient-brand)" }}
            >
              {userInitial}
            </button>
          </div>
        </div>

        {/* Mini charts */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          {/* Growth Rate */}
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

          {/* Overall Progress */}
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
                  <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-secondary)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-heading">
                76%
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
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

        {/* Up Next */}
        <div>
          <h4 className="mb-4 text-xl font-extrabold text-heading">Up Next</h4>
          {upNext.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/40">
                  <Skeleton
                    active
                    avatar={{ shape: "square" }}
                    paragraph={{ rows: 1 }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {upNext.map((course) => (
                <UpNextItem
                  key={course._id}
                  course={course}
                  isEnrolled={enrolledCourseIds.includes(course._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </GlassCard>
);

/* ── HeroSection ── */
const HeroSection = ({
  isAuthenticated,
  upNext,
  enrolledCourseIds,
  userInitial,
  onAuthRoute,
}) => {
  const navigate = useNavigate();

  return (
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
          <Icon name="play" size={20} color="var(--color-secondary)" /> Browse
          Courses
        </GlassCard>
      </motion.div>

      {/* Dashboard Preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="relative max-w-6xl mx-auto"
      >
        <div className="absolute inset-0 bg-white/30 blur-3xl -z-10 rounded-[3rem]" />
        <DashboardPreview
          upNext={upNext}
          enrolledCourseIds={enrolledCourseIds}
          userInitial={userInitial}
          onAuthRoute={onAuthRoute}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;

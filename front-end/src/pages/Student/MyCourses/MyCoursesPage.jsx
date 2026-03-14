import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import PaymentService from "../../../services/api/PaymentService";
import { ROUTES } from "../../../utils/constants";
import { formatDuration, pageVariants } from "../../../utils/helpers";


const countLessons = (sections = []) =>
  sections.reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );

const TABS = ["all", "inProgress", "completed"];
const TAB_LABELS = {
  all: "All Courses",
  inProgress: "In Progress",
  completed: "Completed",
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const MyCourseCard = ({ enrollment }) => {
  const navigate = useNavigate();
  const { course, progress, continueLesson } = enrollment;
  const instructor =
    course?.instructor?.fullname ??
    course?.instructorId?.fullname ??
    course?.instructorId?.email ??
    "Instructor";
  const lessons = countLessons(course?.sections);
  const duration = formatDuration(course?.totalDuration);
  const progressPct = Math.min(100, Math.max(0, progress ?? 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="overflow-hidden cursor-pointer glass-card rounded-2xl group"
      onClick={() => course?._id && navigate(`/student/learning/${course._id}`)}
    >
      <div
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/20"
        style={{ aspectRatio: "16/9" }}
      >
        <img
          src={
            course?.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop"
          }
          alt={course?.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {progressPct > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/20">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background:
                  progressPct === 100
                    ? "#10B981"
                    : "var(--gradient-brand, #667eea)",
              }}
            />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/20 group-hover:opacity-100">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90">
            <Icon name="play" size={20} color="var(--color-primary)" />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {course?.category?.name && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
              {course.category.name}
            </span>
          )}
          {course?.level && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted bg-white/50 px-2 py-0.5 rounded border border-border/30">
              {course.level}
            </span>
          )}
        </div>
        <h3 className="mb-1 text-sm font-bold leading-snug text-heading line-clamp-2">
          {course?.title}
        </h3>
        <p className="mb-3 text-xs text-muted">{instructor}</p>
        <div className="flex items-center gap-4 mb-4 text-xs text-muted">
          {duration && (
            <span className="flex items-center gap-1">
              <Icon name="clock" size={12} /> {duration}
            </span>
          )}
          {lessons > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="book" size={12} /> {lessons} lessons
            </span>
          )}
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-body">
              {progressPct > 0 ? `${progressPct}% complete` : "Not started"}
            </span>
            {progressPct === 100 && (
              <span className="flex items-center gap-1 font-bold text-green-600">
                <Icon name="award" size={12} color="#10B981" /> Complete
              </span>
            )}
          </div>
          <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${progressPct}%`,
                background:
                  progressPct === 100
                    ? "#10B981"
                    : "var(--gradient-brand, #667eea)",
              }}
            />
          </div>
        </div>
        <button className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all btn-aurora">
          {progressPct === 0
            ? "Start Learning"
            : progressPct === 100
              ? "Review Course"
              : continueLesson?.title
                ? `Continue: ${continueLesson.title.slice(0, 28)}${continueLesson.title.length > 28 ? "…" : ""}`
                : "Continue"}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const MyCoursesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    // Use enrollment endpoint which returns progress + continueLesson
    PaymentService.getMyCourses()
      .then((data) => setEnrollments(data ?? []))
      .catch(() => toast.error("Failed to load your courses"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter((e) => {
    const p = e.progress ?? 0;
    if (tab === "inProgress") return p > 0 && p < 100;
    if (tab === "completed") return p === 100 || e.completed;
    return true;
  });

  const tabCounts = {
    all: enrollments.length,
    inProgress: enrollments.filter((e) => {
      const p = e.progress ?? 0;
      return p > 0 && p < 100;
    }).length,
    completed: enrollments.filter(
      (e) => (e.progress ?? 0) === 100 || e.completed,
    ).length,
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-6xl px-6 py-10 mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-black tracking-tight text-heading">
            My Courses
          </h1>
          <p className="text-muted">
            {enrollments.length > 0
              ? `Enrolled in ${enrollments.length} course${enrollments.length > 1 ? "s" : ""}`
              : "Your enrolled courses will appear here"}
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                t === tab ? "btn-aurora" : "glass-card hover:border-primary/30"
              }`}
            >
              {TAB_LABELS[t]}
              {tabCounts[t] > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-black ${t === tab ? "bg-white/30" : "bg-white/60"}`}
                >
                  {tabCounts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden glass-card rounded-2xl animate-pulse"
              >
                <div
                  style={{
                    aspectRatio: "16/9",
                    background: "rgba(255,255,255,0.4)",
                  }}
                />
                <div className="p-5 space-y-3">
                  <div className="w-3/4 h-4 rounded-full bg-white/40" />
                  <div className="w-1/2 h-3 rounded-full bg-white/30" />
                  <div className="h-2 rounded-full bg-white/20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10">
              <Icon name="book" size={36} color="var(--color-primary)" />
            </div>
            <h2 className="mb-3 text-2xl font-black text-heading">
              {tab === "all"
                ? "No courses yet"
                : `No ${TAB_LABELS[tab].toLowerCase()} courses`}
            </h2>
            <p className="mb-6 text-muted">
              {tab === "all"
                ? "Browse our catalog and start learning today."
                : "Keep learning to see courses here."}
            </p>
            {tab === "all" && (
              <button
                onClick={() => navigate(ROUTES.COURSES)}
                className="px-8 py-3 btn-aurora"
              >
                Browse Courses
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((enrollment, i) => (
              <motion.div
                key={enrollment.enrollmentId || i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <MyCourseCard enrollment={enrollment} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyCoursesPage;

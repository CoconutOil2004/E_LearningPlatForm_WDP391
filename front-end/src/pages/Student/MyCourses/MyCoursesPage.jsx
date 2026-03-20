import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CourseCard from "../../../components/common/CourseCard";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import PaymentService from "../../../services/api/PaymentService";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const TABS = ["all", "inProgress", "completed"];
const TAB_LABELS = {
  all: "All Courses",
  inProgress: "In Progress",
  completed: "Completed",
};

/* ── Skeleton ── */
const SkeletonCard = () => (
  <div className="overflow-hidden glass-card rounded-2xl animate-pulse">
    <div style={{ aspectRatio: "16/9", background: "rgba(255,255,255,0.4)" }} />
    <div className="p-5 space-y-3">
      <div className="w-3/4 h-4 rounded-full bg-white/40" />
      <div className="w-1/2 h-3 rounded-full bg-white/30" />
      <div className="h-2 rounded-full bg-white/20" />
    </div>
  </div>
);

/* ── Main ── */
const MyCoursesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
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
        {/* Header */}
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

        {/* Tabs */}
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
                  className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                    t === tab ? "bg-white/30" : "bg-white/60"
                  }`}
                >
                  {tabCounts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
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
                {/*
                  CourseCard variant="enrolled":
                  - course data lấy từ enrollment.course
                  - enrollment object truyền vào để hiện progress + continueLesson
                */}
                <CourseCard
                  course={enrollment.course}
                  variant="enrolled"
                  isEnrolled
                  enrollment={enrollment}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyCoursesPage;

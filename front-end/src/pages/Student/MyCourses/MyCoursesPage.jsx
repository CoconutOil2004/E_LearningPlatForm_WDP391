import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const fmtDuration = (s) => {
  if (!s) return null;
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const countLessons = (sections = []) =>
  sections.reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );

const TABS = ["all", "inProgress", "completed"];

// ─── Card ─────────────────────────────────────────────────────────────────────
const MyCourseCard = ({ course, progress }) => {
  const navigate = useNavigate();
  const instructor =
    course.instructorId?.fullname ?? course.instructorId?.email ?? "Instructor";
  const lessons = countLessons(course.sections);
  const duration = fmtDuration(course.totalDuration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="overflow-hidden cursor-pointer glass-card rounded-2xl group"
      onClick={() => navigate(`/student/learning/${course._id}`)}
    >
      <div className="relative overflow-hidden aspect-video bg-gradient-to-br from-primary/10 to-secondary/20">
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop"
          }
          alt={course.title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {progress > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/20">
            <div
              className="h-full transition-all duration-500 bg-secondary"
              style={{ width: `${progress}%` }}
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
          {course.category?.name && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
              {course.category.name}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted bg-white/50 px-2 py-0.5 rounded border border-border/30">
            {course.level}
          </span>
        </div>
        <h3 className="mb-1 text-sm font-bold leading-snug text-heading line-clamp-2">
          {course.title}
        </h3>
        <p className="mb-3 text-xs text-muted">{instructor}</p>

        <div className="flex items-center gap-4 mb-4 text-xs text-muted">
          {duration && (
            <span className="flex items-center gap-1">
              <Icon name="clock" size={12} />
              {duration}
            </span>
          )}
          {lessons > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="book" size={12} />
              {lessons} lessons
            </span>
          )}
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-semibold text-body">
              {progress > 0 ? `${progress}% complete` : "Not started"}
            </span>
            {progress === 100 && (
              <span className="flex items-center gap-1 font-bold text-green-600">
                <Icon name="award" size={12} color="#10B981" /> Complete
              </span>
            )}
          </div>
          <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${progress}%`,
                background:
                  progress === 100 ? "#10B981" : "var(--gradient-brand)",
              }}
            />
          </div>
        </div>

        <button className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all btn-aurora">
          {progress === 0
            ? "Start Learning"
            : progress === 100
              ? "Review Course"
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
  const { lessonProgress } = useCourseStore();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    CourseService.getMyCourses({ limit: 50 })
      .then((res) => setCourses(res.courses ?? []))
      .catch(() => toast.error("Failed to load your courses"))
      .finally(() => setLoading(false));
  }, []);

  const getProgress = (courseId, total) => {
    const prog = lessonProgress[courseId];
    if (!prog || total === 0) return 0;
    return Math.round((prog.completedLessons.length / total) * 100);
  };

  const filtered = courses.filter((c) => {
    const p = getProgress(c._id, countLessons(c.sections));
    if (tab === "inProgress") return p > 0 && p < 100;
    if (tab === "completed") return p === 100;
    return true;
  });

  const tabCounts = {
    all: courses.length,
    inProgress: courses.filter((c) => {
      const p = getProgress(c._id, countLessons(c.sections));
      return p > 0 && p < 100;
    }).length,
    completed: courses.filter(
      (c) => getProgress(c._id, countLessons(c.sections)) === 100,
    ).length,
  };

  const TAB_LABELS = {
    all: "All Courses",
    inProgress: "In Progress",
    completed: "Completed",
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
            {courses.length > 0
              ? `Enrolled in ${courses.length} course${courses.length > 1 ? "s" : ""}`
              : "Your enrolled courses will appear here"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${t === tab ? "btn-aurora" : "glass-card hover:border-primary/30"}`}
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
                <div className="aspect-video bg-white/40" />
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
            {filtered.map((course, i) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <MyCourseCard
                  course={course}
                  progress={getProgress(
                    course._id,
                    countLessons(course.sections),
                  )}
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

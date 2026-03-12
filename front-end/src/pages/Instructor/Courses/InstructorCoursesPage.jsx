import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const STATUS_STYLE = {
  draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "In Review" },
  published: { bg: "bg-green-100", text: "text-green-700", label: "Published" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
  archived: { bg: "bg-slate-100", text: "text-slate-600", label: "Archived" },
};

const TABS = ["all", "draft", "pending", "published", "rejected"];

const fmtDuration = (s) => {
  if (!s) return null;
  const h = Math.floor(s / 3600);
  return h > 0 ? `${h}h` : `${Math.floor(s / 60)}m`;
};

// ─── CourseRow ────────────────────────────────────────────────────────────────
const CourseRow = ({ course, onSubmit, submitting }) => {
  const navigate = useNavigate();
  const st = STATUS_STYLE[course.status] ?? STATUS_STYLE.draft;
  const duration = fmtDuration(course.totalDuration);
  const canEdit = ["draft", "rejected"].includes(course.status);
  const canSubmit = ["draft", "rejected"].includes(course.status);
  const isPending = course.status === "pending";

  const handleRowClick = () => {
    navigate(`/courses/${course._id}`);
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={handleRowClick}
      className="transition-colors border-b border-border/30 hover:bg-white/30 cursor-pointer"
    >
      {/* Thumbnail + title */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="w-16 overflow-hidden h-11 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/20 shrink-0">
            <img
              src={
                course.thumbnail ||
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&h=80&fit=crop"
              }
              alt={course.title}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-heading line-clamp-1">
              {course.title}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {course.category?.name ?? "—"} · {course.level}
            </p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4 whitespace-nowrap">
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${st.bg} ${st.text}`}
        >
          {st.label}
        </span>
      </td>

      {/* Stats */}
      <td className="px-4 py-4 text-sm text-muted whitespace-nowrap">
        {course.price === 0 ? "Free" : `$${course.price}`}
      </td>
      <td className="px-4 py-4 text-sm text-muted whitespace-nowrap">
        {(course.enrollmentCount ?? 0).toLocaleString()}
      </td>
      <td className="px-4 py-4 text-sm text-muted whitespace-nowrap">
        {duration ?? "—"}
      </td>

      {/* Actions */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/${course._id}`);
            }}
            className="p-2 transition-all rounded-lg glass-card hover:border-primary/30"
            title="View"
          >
            <Icon name="eye" size={15} color="var(--text-muted)" />
          </button>
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/instructor/courses/edit/${course._id}`);
              }}
              className="p-2 transition-all rounded-lg glass-card hover:border-primary/30"
              title="Edit"
            >
              <Icon name="edit" size={15} color="var(--color-primary)" />
            </button>
          )}
          {isPending && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/instructor/courses/edit/${course._id}`);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold glass-card hover:border-primary/30 transition-all"
            >
              Update
            </button>
          )}
          {canSubmit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubmit(course._id);
              }}
              disabled={submitting === course._id}
              className="px-3 py-1.5 rounded-lg text-xs font-bold btn-aurora disabled:opacity-50 transition-all"
            >
              {submitting === course._id ? "…" : "Submit"}
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const InstructorCoursesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    setLoading(true);
    CourseService.getInstructorCourses()
      .then((list) => setCourses(list ?? []))
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (courseId) => {
    setSubmitting(courseId);
    try {
      await CourseService.submitCourse(courseId);
      toast.success("Submitted for review!");
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? { ...c, status: "pending" } : c)),
      );
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Submit failed");
    } finally {
      setSubmitting(null);
    }
  };

  const filtered =
    activeTab === "all"
      ? courses
      : courses.filter((c) => c.status === activeTab);

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === "published").length,
    pending: courses.filter((c) => c.status === "pending").length,
    draft: courses.filter((c) => c.status === "draft").length,
    students: courses.reduce((a, c) => a + (c.enrollmentCount ?? 0), 0),
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-heading">
              My Courses
            </h1>
            <p className="mt-1 text-muted">
              Manage and track your course catalog
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.CREATE_COURSE)}
            className="flex items-center gap-2 px-6 py-3 btn-aurora"
          >
            <Icon name="plus" size={18} color="white" /> New Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
          {[
            { label: "Total Courses", value: stats.total, icon: "book" },
            { label: "Published", value: stats.published, icon: "check" },
            { label: "In Review", value: stats.pending, icon: "clock" },
            { label: "Total Students", value: stats.students, icon: "users" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 p-5 glass-card rounded-2xl"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
                <Icon name={s.icon} size={18} color="var(--color-primary)" />
              </div>
              <div>
                <p className="text-2xl font-black text-heading">
                  {s.value.toLocaleString()}
                </p>
                <p className="text-xs font-medium text-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 pb-1 mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const count =
              tab === "all"
                ? courses.length
                : courses.filter((c) => c.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "btn-aurora"
                    : "glass-card hover:border-primary/30"
                }`}
              >
                {tab === "all" ? "All Courses" : tab}
                {count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-black ${activeTab === tab ? "bg-white/30" : "bg-white/60"}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-hidden glass-card rounded-3xl">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-16 h-11 rounded-xl bg-white/40" />
                  <div className="flex-1 h-4 rounded-full bg-white/40" />
                  <div className="w-20 h-4 rounded-full bg-white/30" />
                  <div className="w-16 h-4 rounded-full bg-white/30" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="mt-4 font-medium text-muted">
                {activeTab === "all"
                  ? "No courses yet. Create your first course!"
                  : `No ${activeTab} courses.`}
              </p>
              {activeTab === "all" && (
                <button
                  onClick={() => navigate(ROUTES.CREATE_COURSE)}
                  className="mt-4 btn-aurora px-6 py-2.5 text-sm"
                >
                  Create Course
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 bg-white/30">
                    <th className="px-4 py-3 text-xs font-bold tracking-widest text-left uppercase text-muted">
                      Course
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-widest text-left uppercase text-muted">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-widest text-left uppercase text-muted">
                      Price
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-widest text-left uppercase text-muted">
                      Students
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-widest text-left uppercase text-muted">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-xs font-bold tracking-widest text-left uppercase text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((course) => (
                    <CourseRow
                      key={course._id}
                      course={course}
                      onSubmit={handleSubmit}
                      submitting={submitting}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InstructorCoursesPage;

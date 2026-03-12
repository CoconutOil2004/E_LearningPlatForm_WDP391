import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import { pageVariants } from "../../../utils/helpers";

const fmtDuration = (s) => {
  if (!s) return null;
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ─── RejectModal ──────────────────────────────────────────────────────────────
const RejectModal = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md p-8 space-y-5 shadow-2xl glass-card rounded-3xl"
      >
        <h3 className="text-xl font-black text-heading">Reject Course</h3>
        <p className="text-sm text-muted">
          Provide a reason so the instructor can improve their course.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Reason for rejection (optional)..."
          className="w-full px-4 py-3 text-sm border resize-none rounded-xl bg-white/50 border-border/40 focus:outline-none focus:border-primary text-body"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold transition-all rounded-xl glass-card hover:border-primary/30"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="flex-1 py-3 text-sm font-bold text-white transition-all bg-red-500 rounded-xl hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── CourseReviewCard ─────────────────────────────────────────────────────────
const CourseReviewCard = ({ course, onApprove, onReject, processing }) => {
  const navigate = useNavigate();
  const instructor =
    course.instructorId?.fullname ?? course.instructorId?.email ?? "Instructor";
  const duration = fmtDuration(course.totalDuration);
  const totalLessons = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="overflow-hidden glass-card rounded-3xl"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video bg-gradient-to-br from-primary/10 to-secondary/20">
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=340&fit=crop"
          }
          alt={course.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute flex items-end justify-between bottom-4 left-4 right-4">
          <div>
            <span className="px-2 py-1 text-xs font-bold rounded text-white/70 bg-black/30">
              {course.category?.name}
            </span>
          </div>
          <span className="text-xl font-black text-white">
            {course.price === 0 ? "Free" : `$${course.price}`}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Title + instructor */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-muted bg-white/50 border border-border/30 px-2 py-0.5 rounded">
              {course.level}
            </span>
          </div>
          <h3 className="text-lg font-black leading-snug text-heading">
            {course.title}
          </h3>
          <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
            <Icon name="user" size={13} /> {instructor}
          </p>
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-sm leading-relaxed text-body line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Icon name="book" size={12} />
            {totalLessons} lessons
          </span>
          {duration && (
            <span className="flex items-center gap-1">
              <Icon name="clock" size={12} />
              {duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Icon name="users" size={12} />
            {course.sections?.length ?? 0} sections
          </span>
        </div>

        {/* Sections preview (first 3) */}
        {(course.sections?.length ?? 0) > 0 && (
          <div className="p-4 space-y-2 bg-white/30 rounded-2xl">
            <p className="mb-2 text-xs font-bold tracking-widest uppercase text-muted">
              Curriculum Preview
            </p>
            {course.sections.slice(0, 3).map((sec, i) => (
              <div
                key={sec._id || i}
                className="flex items-center gap-2 text-sm"
              >
                <Icon name="book" size={13} color="var(--color-primary)" />
                <span className="font-medium truncate text-body">
                  {sec.title}
                </span>
                <span className="ml-auto text-muted shrink-0">
                  {sec.items?.length ?? 0} items
                </span>
              </div>
            ))}
            {course.sections.length > 3 && (
              <p className="text-xs text-muted">
                +{course.sections.length - 3} more sections
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => navigate(`/courses/${course._id}`)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold glass-card hover:border-primary/30 transition-all flex items-center gap-1.5"
          >
            <Icon name="eye" size={14} color="var(--text-muted)" /> Preview
          </button>
          <button
            onClick={() => onReject(course._id)}
            disabled={processing === course._id}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Icon name="x" size={14} color="#DC2626" /> Reject
          </button>
          <button
            onClick={() => onApprove(course._id)}
            disabled={processing === course._id}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold btn-aurora disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {processing === course._id ? (
              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
            ) : (
              <>
                <Icon name="check" size={14} color="white" /> Approve
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminApprovalPage = () => {
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // courseId awaiting reject modal

  useEffect(() => {
    CourseService.getPendingCourses()
      .then(setCourses)
      .catch(() => toast.error("Failed to load pending courses"))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (courseId) => {
    setProcessing(courseId);
    try {
      await CourseService.approveCourse(courseId);
      toast.success("Course approved and published!");
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Approve failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    const courseId = rejectTarget;
    setRejectTarget(null);
    setProcessing(courseId);
    try {
      await CourseService.rejectCourse(courseId, reason);
      toast.success("Course rejected.");
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Reject failed");
    } finally {
      setProcessing(null);
    }
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
          <h1 className="text-4xl font-black tracking-tight text-heading">
            Course Approval
          </h1>
          <p className="mt-1 text-muted">
            {courses.length > 0
              ? `${courses.length} course${courses.length > 1 ? "s" : ""} pending review`
              : "All caught up — no pending reviews"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="overflow-hidden glass-card rounded-3xl animate-pulse"
              >
                <div className="aspect-video bg-white/40" />
                <div className="p-6 space-y-3">
                  <div className="w-3/4 h-5 rounded-full bg-white/40" />
                  <div className="h-4 rounded-full bg-white/30" />
                  <div className="h-10 bg-white/20 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-24 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
              <Icon name="check" size={36} color="#059669" />
            </div>
            <h2 className="mb-2 text-2xl font-black text-heading">
              All clear!
            </h2>
            <p className="text-muted">
              No courses pending review at the moment.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {courses.map((course) => (
                <CourseReviewCard
                  key={course._id}
                  course={course}
                  onApprove={handleApprove}
                  onReject={(id) => setRejectTarget(id)}
                  processing={processing}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Reject modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            onConfirm={handleRejectConfirm}
            onCancel={() => setRejectTarget(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminApprovalPage;

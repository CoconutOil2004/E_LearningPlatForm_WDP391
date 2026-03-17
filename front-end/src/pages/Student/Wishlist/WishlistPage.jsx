import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";
import {
  formatDurationClock,
  formatThousands,
  pageVariants,
} from "../../../utils/helpers";

const LEVEL_COLORS = {
  Beginner: { bg: "rgba(16,185,129,0.12)", text: "var(--color-success)" },
  Intermediate: { bg: "rgba(2,132,199,0.12)", text: "var(--color-primary)" },
  Advanced: { bg: "rgba(139,92,246,0.12)", text: "#8B5CF6" },
};

// Reusing CourseCard layout structure for consistency
const WishlistCourseCard = ({ course, onEnroll, onRemove }) => {
  const navigate = useNavigate();
  const level = LEVEL_COLORS[course.level] || LEVEL_COLORS.Beginner;
  const instructor =
    course.instructorId?.fullname ?? course.instructorId?.email ?? "Instructor";
  const duration = formatDurationClock(course.totalDuration);
  const lessonCount = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      layout
      className="glass-card rounded-[1.5rem] flex flex-col overflow-hidden cursor-pointer hover:border-secondary/40 transition-all duration-300"
      style={{ boxShadow: "0 8px 32px -8px rgba(16,185,129,0.1)" }}
      onClick={() => navigate(`/courses/${course._id}`)}
    >
      <div className="relative w-full overflow-hidden aspect-video bg-gradient-to-br from-primary/10 to-secondary/20 group">
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop"
          }
          alt={course.title}
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(course._id);
          }}
          className="absolute flex items-center justify-center w-8 h-8 transition-all rounded-full top-3 right-3 bg-white/80 backdrop-blur hover:scale-110"
          title="Remove from Wishlist"
        >
          <Icon name="heart" size={15} color="#EF4444" />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded"
            style={{ background: level.bg, color: level.text }}
          >
            {course.level}
          </span>
          <div className="flex items-center gap-1">
            <Icon name="star" size={14} color="#F59E0B" />
            <span className="text-xs font-bold text-heading">
              {Number(course.rating ?? 0).toFixed(1)}
            </span>
          </div>
        </div>

        <h3 className="flex-1 mb-2 text-lg font-black leading-tight text-heading line-clamp-2">
          {course.title}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-muted line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-4 mb-4 text-xs font-medium text-muted">
          {duration && (
            <span className="flex items-center gap-1">
              <Icon name="clock" size={13} /> {duration}
            </span>
          )}
          {lessonCount > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="book" size={13} /> {lessonCount} lessons
            </span>
          )}
          <span className="flex items-center gap-1">
            <Icon name="user" size={13} /> {instructor}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
          <div>
            <span
              className="text-2xl font-black gradient-text"
              style={{ letterSpacing: "-0.02em" }}
            >
              {course.price === 0 ? "Free" : formatThousands(course.price)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnroll(course);
            }}
            className="px-5 py-2 text-sm transition-all rounded-full btn-aurora"
          >
            Enroll
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuthStore();
  const { enrolledCourseIds, wishlistIds, wishlistSynced, enroll, toggleWishlist } =
    useCourseStore();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    // Only fetch once — wait for AuthContext to sync wishlist from server
    if (!wishlistSynced || hasFetched.current) return;
    hasFetched.current = true;

    if (wishlistIds.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      wishlistIds.map((id) =>
        CourseService.getCoursePreview(id)
          .then((course) => course)
          .catch(() => null),
      ),
    )
      .then((fetched) => setCourses(fetched.filter(Boolean)))
      .catch(() => toast.error("Failed to load wishlist"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, wishlistSynced, wishlistIds, navigate, toast]);

  // When user removes a course, update local state immediately
  const handleRemove = async (courseId) => {
    await toggleWishlist(courseId);
    setCourses((prev) => prev.filter((c) => c._id !== courseId));
    toast.success("Removed from wishlist");
  };

  const handleEnroll = (course) => {
    if (enrolledCourseIds.includes(course._id)) {
      toast.info("You are already enrolled in this course");
      navigate(`/student/learning/${course._id}`);
      return;
    }
    enroll(course._id);
    toast.success(`Enrolled in "${course.title}"!`);
    navigate(`/student/learning/${course._id}`);
  };



  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="px-6 pt-10 pb-20 mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 mb-10 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h1 className="mb-4 text-5xl font-black leading-none tracking-tighter md:text-6xl text-heading">
              My <span className="gradient-text">Wishlist</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Courses you have saved for later.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-[1.5rem] overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-white/40" />
                <div className="p-6 space-y-3">
                  <div className="w-3/4 h-5 rounded-full bg-white/40" />
                  <div className="w-full h-4 rounded-full bg-white/30" />
                  <div className="w-1/2 h-4 rounded-full bg-white/20" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-24 text-center glass-card rounded-3xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10">
              <Icon name="heart" size={40} color="var(--color-primary)" />
            </div>
            <h2 className="mb-2 text-2xl font-black text-heading">
              Your wishlist is empty
            </h2>
            <p className="mb-8 text-muted">
              Browse our course catalog and find something you love.
            </p>
            <button
              onClick={() => navigate(ROUTES.COURSES)}
              className="px-8 py-3 text-sm font-bold transition-all rounded-full btn-aurora"
            >
              Explore Courses
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {courses.map((course) => (
                <WishlistCourseCard
                  key={course._id}
                  course={course}
                  onEnroll={handleEnroll}
                  onRemove={handleRemove}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WishlistPage;

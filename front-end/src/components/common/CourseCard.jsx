import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  cardVariants,
  formatDurationClock,
  formatThousands,
} from "../../utils/helpers";
import { Icon } from "../ui";

const LEVEL_COLORS = {
  Beginner: { bg: "rgba(16,185,129,0.12)", text: "var(--color-success)" },
  Intermediate: { bg: "rgba(2,132,199,0.12)", text: "var(--color-primary)" },
  Advanced: { bg: "rgba(139,92,246,0.12)", text: "#8B5CF6" },
};

const countLessons = (sections = []) =>
  sections.reduce(
    (acc, s) =>
      acc + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );

/**
 * CourseCard — component dùng chung cho:
 *  - /home          (browse, no progress)
 *  - /courses       (browse, có enroll button + wishlist)
 *  - /student/my-courses (enrolled, có progress bar + continue button)
 *
 * Props:
 *  course        — object khoá học
 *  variant       — "browse" | "enrolled"  (default: "browse")
 *  isEnrolled    — bool
 *  isWishlisted  — bool
 *  enrollment    — { progress, continueLesson, completed } — chỉ dùng khi variant="enrolled"
 *  onWishlist    — fn(courseId)  — nếu không truyền thì ẩn nút wishlist
 *  onEnroll      — fn(course)   — nếu không truyền thì click => navigate detail
 */
const CourseCard = ({
  course,
  variant = "browse",
  isEnrolled = false,
  isWishlisted = false,
  enrollment = null,
  onWishlist,
  onEnroll,
}) => {
  const navigate = useNavigate();

  const thumbnail =
    course?.thumbnail ||
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop";
  const categoryName = course?.category?.name ?? "";
  const instructorName =
    course?.instructor?.fullname ??
    course?.instructorId?.fullname ??
    course?.instructorId?.email ??
    "Instructor";
  const lessonCount = countLessons(course?.sections);
  const duration = formatDurationClock(course?.totalDuration);
  const isFree = course?.price === 0;
  const level = LEVEL_COLORS[course?.level] || LEVEL_COLORS.Beginner;

  // Enrolled-mode data
  const progressPct = Math.min(100, Math.max(0, enrollment?.progress ?? 0));
  const continueTitle = enrollment?.continueLesson?.title;

  const goToDetail = () => navigate(`/courses/${course._id}`);

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    if (variant === "enrolled") {
      // Enrolled card: button => continue/certificate
      if (progressPct === 100) {
        navigate(`/student/certificate/${course._id}`);
      } else {
        navigate(`/student/learning/${course._id}`);
      }
      return;
    }
    if (isEnrolled) {
      navigate(`/student/learning/${course._id}`);
      return;
    }
    if (onEnroll) onEnroll(course);
    else goToDetail();
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onWishlist?.(course._id);
  };

  const enrollBtnLabel = () => {
    if (variant === "enrolled") {
      if (progressPct === 0) return "Start Learning";
      if (progressPct === 100) return "View Certificate";
      if (continueTitle)
        return `Continue: ${continueTitle.slice(0, 28)}${continueTitle.length > 28 ? "…" : ""}`;
      return "Continue";
    }
    return isEnrolled ? "Continue" : "Enroll";
  };

  const enrollBtnClass = () => {
    const base =
      "px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all";
    if (variant === "enrolled" && progressPct === 100)
      return `${base} bg-primary text-white shadow-lg shadow-primary/30`;
    if (isEnrolled)
      return `${base} bg-secondary/10 text-secondary border border-secondary/30`;
    return `${base} btn-aurora`;
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      layout
      className="glass-card rounded-[1.5rem] flex flex-col overflow-hidden cursor-pointer hover:border-secondary/40 transition-all duration-300"
      style={{ boxShadow: "0 8px 32px -8px rgba(16,185,129,0.1)" }}
      onClick={goToDetail}
    >
      {/* ── Thumbnail ── */}
      <div className="relative w-full overflow-hidden aspect-video bg-gradient-to-br from-primary/10 to-secondary/20 group">
        <img
          src={thumbnail}
          alt={course?.title}
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />

        {/* Bestseller badge */}
        {(course?.enrollmentCount ?? 0) > 100 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-primary">
            BESTSELLER
          </div>
        )}

        {/* Progress bar (enrolled mode) */}
        {variant === "enrolled" && progressPct > 0 && (
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

        {/* Hover play overlay (enrolled mode) */}
        {variant === "enrolled" && (
          <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 bg-black/20 group-hover:opacity-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90">
              <Icon name="play" size={20} color="var(--color-primary)" />
            </div>
          </div>
        )}

        {/* Wishlist button (browse mode) */}
        {onWishlist && variant === "browse" && (
          <button
            onClick={handleWishlistClick}
            className="absolute flex items-center justify-center w-8 h-8 transition-all rounded-full top-3 right-3 bg-white/80 backdrop-blur hover:scale-110"
          >
            <Icon
              name="heart"
              size={15}
              color={isWishlisted ? "#EF4444" : "var(--text-muted)"}
            />
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5">
        {/* Tags */}
        <div className="flex items-center gap-2 mb-2">
          {categoryName && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
              {categoryName}
            </span>
          )}
          {course?.level && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ background: level.bg, color: level.text }}
            >
              {course.level}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="flex-1 mb-1 text-sm font-bold leading-snug text-heading line-clamp-2">
          {course?.title}
        </h3>

        {/* Instructor */}
        <p className="mb-3 text-xs text-muted">{instructorName}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-3 text-xs text-muted">
          {duration && (
            <span className="flex items-center gap-1">
              <Icon name="clock" size={12} /> {duration}
            </span>
          )}
          {lessonCount > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="book" size={12} /> {lessonCount} lessons
            </span>
          )}
          {variant === "browse" && (
            <span className="flex items-center gap-1">
              <Icon name="star" size={12} color="#F59E0B" />
              <span className="font-bold text-heading">
                {Number(course?.rating ?? 0).toFixed(1)}
              </span>
              <span>({(course?.enrollmentCount ?? 0).toLocaleString()})</span>
            </span>
          )}
        </div>

        {/* Progress bar (enrolled mode) */}
        {variant === "enrolled" && (
          <div className="mb-3">
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
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50">
          {variant === "browse" ? (
            <div>
              {!isFree && (
                <span className="block text-xs line-through text-muted">
                  {formatThousands(Math.round((course?.price ?? 0) * 1.4))}
                </span>
              )}
              <span
                className="text-xl font-black gradient-text"
                style={{ letterSpacing: "-0.02em" }}
              >
                {isFree ? "Free" : formatThousands(course?.price)}
              </span>
            </div>
          ) : (
            <span /> /* spacer — price không cần thiết ở enrolled mode */
          )}

          <button onClick={handleEnrollClick} className={enrollBtnClass()}>
            {enrollBtnLabel()}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;

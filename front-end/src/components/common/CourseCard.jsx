import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cardVariants } from "../../utils/helpers";
import { Badge, Icon, Stars } from "../ui";

const fmtDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  // Nếu có giờ thì hiển thị hh:mm:ss, không thì mm:ss
  const parts = [
    h > 0 ? h : null,
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0"),
  ].filter(Boolean); // Loại bỏ phần giờ nếu bằng null

  return parts.join(":");
};

const countLessons = (sections = []) =>
  sections.reduce(
    (acc, s) =>
      acc + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );

const CourseCard = ({
  course,
  isEnrolled,
  isWishlisted,
  onWishlist,
  onEnroll,
}) => {
  const navigate = useNavigate();
  const thumbnail =
    course.thumbnail ||
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop";
  const categoryName = course.category?.name ?? "";
  const instructorName =
    course.instructorId?.fullname ?? course.instructorId?.email ?? "Instructor";
  const lessonCount = countLessons(course.sections);
  const duration = fmtDuration(course.totalDuration);
  const isFree = course.price === 0;

  const goToDetail = () => navigate(`/courses/${course._id}`);

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    if (onEnroll) onEnroll(course);
    else navigate(`/courses/${course._id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (onWishlist) onWishlist(course._id);
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="overflow-hidden bg-white border cursor-pointer rounded-2xl border-border group"
      style={{ boxShadow: "var(--shadow-md)" }}
      onClick={goToDetail}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        <img
          src={thumbnail}
          alt={course.title}
          className="object-cover w-full transition-transform duration-500 h-44 group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end p-3 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/40 to-transparent group-hover:opacity-100">
          <button
            onClick={handleEnrollClick}
            className="flex items-center justify-center w-full gap-2 py-2 text-sm font-bold text-white rounded-xl"
            style={{ background: "var(--color-primary)" }}
          >
            <Icon name="play" size={16} color="white" />
            {isEnrolled ? "Continue Learning" : "Preview Course"}
          </button>
        </div>

        {/* Badges */}
        {course.enrollmentCount > 100 && (
          <div className="absolute top-3 left-3">
            <Badge color="yellow">⭐ Bestseller</Badge>
          </div>
        )}
        {isFree && (
          <div className="absolute top-3 left-3">
            <Badge color="green">Free</Badge>
          </div>
        )}

        {/* Wishlist */}
        {onWishlist && (
          <button
            onClick={handleWishlistClick}
            className="absolute p-2 transition-colors top-3 right-3 bg-white/90 rounded-xl hover:bg-white"
          >
            <Icon
              name="heart"
              size={16}
              color={
                isWishlisted ? "var(--color-danger)" : "var(--text-disabled)"
              }
            />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {categoryName && <Badge color="indigo">{categoryName}</Badge>}
          <Badge color="gray">{course.level}</Badge>
        </div>

        <h3 className="mb-1 text-sm font-bold leading-snug transition-colors text-heading line-clamp-2 hover:text-primary">
          {course.title}
        </h3>

        <p className="mb-3 text-xs text-muted">{instructorName}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-accent">
            {Number(course.rating ?? 0).toFixed(1)}
          </span>
          <Stars rating={course.rating ?? 0} size={14} />
          <span className="text-xs text-disabled">
            ({(course.enrollmentCount ?? 0).toLocaleString()})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-black text-heading">
            {isFree ? "Free" : `$${course.price}`}
          </span>
          <div className="flex items-center gap-3 text-xs text-muted">
            {duration && (
              <span className="flex items-center gap-1">
                <Icon name="clock" size={12} />
                {duration}
              </span>
            )}
            {lessonCount > 0 && (
              <span className="flex items-center gap-1">
                <Icon name="book" size={12} />
                {lessonCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;

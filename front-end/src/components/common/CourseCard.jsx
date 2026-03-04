import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cardVariants } from "../../utils/helpers";
import { Badge, Stars, Icon } from "../ui";
import { ROUTES } from "../../utils/constants";

/**
 * CourseCard — used across public and student pages.
 * @prop {object} course
 * @prop {boolean} isEnrolled
 * @prop {boolean} isWishlisted
 * @prop {function} onWishlist(courseId)
 * @prop {function} onEnroll(course)
 */
const CourseCard = ({ course, isEnrolled, isWishlisted, onWishlist, onEnroll }) => (
  <motion.div
    variants={cardVariants}
    initial="initial"
    animate="animate"
    whileHover="hover"
    className="bg-white rounded-2xl overflow-hidden border border-border cursor-pointer group"
    style={{ boxShadow: "var(--shadow-md)" }}
  >
    {/* Thumbnail */}
    <div className="relative overflow-hidden">
      <Link to={`/courses/${course.id}`}>
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
        <button
          onClick={() => onEnroll(course)}
          className="w-full py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
          style={{ background: "var(--color-primary)" }}
        >
          <Icon name="play" size={16} color="white" />
          {isEnrolled ? "Continue Learning" : "Preview Course"}
        </button>
      </div>
      {/* Badges */}
      {course.bestseller && (
        <div className="absolute top-3 left-3">
          <Badge color="yellow">⭐ Bestseller</Badge>
        </div>
      )}
      {/* Wishlist button */}
      <button
        onClick={() => onWishlist(course.id)}
        className="absolute top-3 right-3 p-2 bg-white/90 rounded-xl hover:bg-white transition-colors"
      >
        <Icon name="heart" size={16} color={isWishlisted ? "var(--color-danger)" : "var(--text-disabled)"} />
      </button>
    </div>

    {/* Info */}
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge color="indigo">{course.category}</Badge>
        <Badge color="gray">{course.level}</Badge>
      </div>
      <Link to={`/courses/${course.id}`}>
        <h3 className="font-bold text-heading text-sm leading-snug mb-1 line-clamp-2 hover:text-primary transition-colors">
          {course.title}
        </h3>
      </Link>
      <p className="text-xs text-muted mb-3">{course.instructor}</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-bold text-accent text-sm">{course.rating}</span>
        <Stars rating={course.rating} size={14} />
        <span className="text-xs text-disabled">({course.students.toLocaleString()})</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-black text-lg text-heading">${course.price}</span>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Icon name="clock" size={12} />{course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="book" size={12} />{course.lessons}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default CourseCard;

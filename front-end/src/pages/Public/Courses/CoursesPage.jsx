import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../../components/ui";
import { FAKE_COURSES, FAKE_CATEGORIES } from "../../../utils/fakeData";
import { pageVariants } from "../../../utils/helpers";
import { ROUTES } from "../../../utils/constants";
import useCourseStore from "../../../store/slices/courseStore";
import useAuthStore from "../../../store/slices/authStore";
import { useToast } from "../../../contexts/ToastContext";

// ─── Static data ──────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "popular",    label: "Most Popular" },
  { value: "newest",     label: "Newest" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating",     label: "Highest Rated" },
];

const LEVEL_COLORS = {
  Beginner:     { bg: "rgba(16,185,129,0.12)", text: "var(--color-success)" },
  Intermediate: { bg: "rgba(2,132,199,0.12)",  text: "var(--color-primary)" },
  Advanced:     { bg: "rgba(139,92,246,0.12)", text: "#8B5CF6" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const GlassCard = ({ children, className = "", onClick, style = {} }) => (
  <div className={`glass-card ${className}`} onClick={onClick} style={style}>
    {children}
  </div>
);

const StarRating = ({ rating, students }) => (
  <div className="flex items-center gap-1">
    <Icon name="star" size={14} color="#F59E0B" />
    <span className="text-xs font-bold text-heading">{rating}</span>
    <span className="text-xs text-muted">({(students / 1000).toFixed(1)}k)</span>
  </div>
);

const CourseCard = ({ course, onEnroll, onWishlist, isEnrolled, isWishlisted }) => {
  const navigate = useNavigate();
  const level = LEVEL_COLORS[course.level] || LEVEL_COLORS.Beginner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      layout
      className="glass-card rounded-[1.5rem] flex flex-col overflow-hidden cursor-pointer hover:border-secondary/40 transition-all duration-300"
      style={{ boxShadow: "0 8px 32px -8px rgba(16,185,129,0.1)" }}
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-primary/10 to-secondary/20 overflow-hidden group">
        <img
          src={course.image}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
        {course.bestseller && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-primary">
            BESTSELLER
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(course.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center transition-all hover:scale-110"
        >
          <Icon name="heart" size={15} color={isWishlisted ? "#EF4444" : "var(--text-muted)"} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded"
            style={{ background: level.bg, color: level.text }}
          >
            {course.level}
          </span>
          <StarRating rating={course.rating} students={course.students} />
        </div>

        <h3 className="text-lg font-black text-heading mb-2 leading-tight line-clamp-2 flex-1">
          {course.title}
        </h3>

        <p className="text-muted text-sm mb-4 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted font-medium mb-4">
          <span className="flex items-center gap-1">
            <Icon name="clock" size={13} /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="book" size={13} /> {course.lessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Icon name="users" size={13} /> {course.instructor}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
          <div>
            <span className="text-muted text-xs line-through block">
              ${(course.price * 1.4).toFixed(2)}
            </span>
            <span className="font-black text-2xl gradient-text" style={{ letterSpacing: "-0.02em" }}>
              ${course.price}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onEnroll(course); }}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              isEnrolled
                ? "bg-secondary/10 text-secondary border border-secondary/30"
                : "btn-aurora text-sm px-5 py-2"
            }`}
          >
            {isEnrolled ? "Continue" : "Enroll"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CoursesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { enrolledCourseIds, wishlistIds, enroll, toggleWishlist } = useCourseStore();
  const toast = useToast();

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy]               = useState("popular");
  const [showSortMenu, setShowSortMenu]   = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [visibleCount, setVisibleCount]   = useState(6);

  const handleEnroll = (course) => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    enroll(course.id);
    toast.success(`Enrolled in "${course.title}"!`);
    navigate(`/student/learning/${course.id}`);
  };

  const handleWishlist = (courseId) => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    toggleWishlist(courseId);
    toast.success(wishlistIds.includes(courseId) ? "Removed from wishlist" : "Added to wishlist");
  };

  const filteredCourses = useMemo(() => {
    let list = [...FAKE_COURSES];
    if (activeCategory !== "All") list = list.filter((c) => c.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "price_asc":  list.sort((a, b) => a.price - b.price);       break;
      case "price_desc": list.sort((a, b) => b.price - a.price);       break;
      case "rating":     list.sort((a, b) => b.rating - a.rating);     break;
      case "newest":     list.sort((a, b) => b.id - a.id);             break;
      default:           list.sort((a, b) => b.students - a.students); break;
    }
    return list;
  }, [activeCategory, sortBy, searchQuery]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCourses.length;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Most Popular";

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-20">

        {/* ── Hero header ───────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h1 className="text-5xl md:text-6xl font-black text-heading leading-none mb-4 tracking-tighter">
              All Courses<br />
              <span className="gradient-text">In One Place</span>
            </h1>
            <p className="text-muted text-lg max-w-xl leading-relaxed">
              Hundreds of expert-led courses across every discipline. Learn at your own pace,
              earn certificates, and advance your career.
            </p>
          </motion.div>

          {/* Search + sort */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="flex items-center glass-card rounded-full px-4 py-2.5 gap-2 min-w-[220px]">
              <Icon name="search" size={16} color="var(--text-muted)" />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(6); }}
                placeholder="Search courses..."
                className="bg-transparent border-none outline-none text-sm text-body placeholder:text-muted w-full"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className="flex items-center gap-2 glass-card rounded-full px-5 py-2.5 text-sm font-bold hover:border-primary/30 transition-all"
              >
                {currentSortLabel}
                <Icon name="chevronDown" size={15} color="var(--text-muted)" />
              </button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 glass-card rounded-2xl overflow-hidden z-30 min-w-[180px]"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSortMenu(false); setVisibleCount(6); }}
                        className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors hover:bg-primary/10 ${
                          sortBy === opt.value ? "text-primary" : "text-body"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ── Category tabs ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide"
        >
          {["All", ...FAKE_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setVisibleCount(6); }}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat ? "btn-aurora" : "glass-card hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* ── Result count ───────────────────────────────────────────────── */}
        <motion.p
          key={filteredCourses.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted font-medium mb-8"
        >
          Showing{" "}
          <span className="text-heading font-bold">{Math.min(visibleCount, filteredCourses.length)}</span>
          {" "}of{" "}
          <span className="text-heading font-bold">{filteredCourses.length}</span> courses
        </motion.p>

        {/* ── Course grid ────────────────────────────────────────────────── */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-24">
            <Icon name="search" size={48} color="var(--text-muted)" />
            <p className="text-muted text-lg font-medium mt-4">No courses match your search.</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="mt-4 btn-aurora-outline text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {visibleCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnroll}
                  onWishlist={handleWishlist}
                  isEnrolled={enrolledCourseIds.includes(course.id)}
                  isWishlisted={wishlistIds.includes(course.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Load more ──────────────────────────────────────────────────── */}
        {hasMore && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setVisibleCount((v) => v + 6)}
              className="glass-card px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-white/60 transition-all group"
            >
              <Icon name="refresh" size={20} color="var(--text-body)" className="group-hover:rotate-180 transition-transform duration-500" />
              Load more courses
            </button>
          </div>
        )}

        {/* ── Newsletter CTA ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-20 p-12 rounded-3xl bg-white/40 backdrop-blur-xl border border-border/20 flex flex-col items-center text-center"
        >
          <Icon name="bell" size={48} color="var(--color-primary)" />
          <h2 className="text-3xl md:text-4xl font-black text-heading mb-4 mt-6">
            Stay ahead of the curve
          </h2>
          <p className="text-muted max-w-2xl mb-8 leading-relaxed">
            Join 50,000+ learners who receive weekly updates on new courses, tech trends,
            and free learning resources straight to their inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email..."
              className="flex-1 px-6 py-4 rounded-full bg-white/60 border border-border/30 focus:outline-none focus:border-primary text-body font-medium placeholder:text-muted"
            />
            <button className="btn-aurora px-8 py-4 rounded-full whitespace-nowrap text-base">
              Subscribe
            </button>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default CoursesPage;
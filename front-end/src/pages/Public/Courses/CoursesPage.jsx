import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "priceAsc", label: "Price: Low → High" },
  { value: "priceDesc", label: "Price: High → Low" },
];

const LEVEL_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

const LEVEL_COLORS = {
  Beginner: { bg: "rgba(16,185,129,0.12)", text: "var(--color-success)" },
  Intermediate: { bg: "rgba(2,132,199,0.12)", text: "var(--color-primary)" },
  Advanced: { bg: "rgba(139,92,246,0.12)", text: "#8B5CF6" },
};

// ─── CourseCard (inline, dùng trực tiếp BE fields) ───────────────────────────
const CourseCard = ({
  course,
  onEnroll,
  onWishlist,
  isEnrolled,
  isWishlisted,
}) => {
  const navigate = useNavigate();
  const level = LEVEL_COLORS[course.level] || LEVEL_COLORS.Beginner;
  const instructor =
    course.instructorId?.fullname ?? course.instructorId?.email ?? "Instructor";
  const duration = course.totalDuration
    ? `${Math.floor(course.totalDuration / 3600)}h ${Math.floor((course.totalDuration % 3600) / 60)}m`
    : null;
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
      {/* Thumbnail */}
      <div className="relative w-full overflow-hidden aspect-video bg-gradient-to-br from-primary/10 to-secondary/20 group">
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop"
          }
          alt={course.title}
          className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
        />
        {(course.enrollmentCount ?? 0) > 100 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-primary">
            BESTSELLER
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist(course._id);
          }}
          className="absolute flex items-center justify-center w-8 h-8 transition-all rounded-full top-3 right-3 bg-white/80 backdrop-blur hover:scale-110"
        >
          <Icon
            name="heart"
            size={15}
            color={isWishlisted ? "#EF4444" : "var(--text-muted)"}
          />
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
          <div className="flex items-center gap-1">
            <Icon name="star" size={14} color="#F59E0B" />
            <span className="text-xs font-bold text-heading">
              {Number(course.rating ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-muted">
              ({(course.enrollmentCount ?? 0).toLocaleString()})
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
              <Icon name="clock" size={13} />
              {duration}
            </span>
          )}
          {lessonCount > 0 && (
            <span className="flex items-center gap-1">
              <Icon name="book" size={13} />
              {lessonCount} lessons
            </span>
          )}
          <span className="flex items-center gap-1">
            <Icon name="user" size={13} />
            {instructor}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
          <div>
            {course.price > 0 && (
              <span className="block text-xs line-through text-muted">
                ${(course.price * 1.4).toFixed(2)}
              </span>
            )}
            <span
              className="text-2xl font-black gradient-text"
              style={{ letterSpacing: "-0.02em" }}
            >
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnroll(course);
            }}
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

// ─── Main ─────────────────────────────────────────────────────────────────────
const CoursesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { enrolledCourseIds, wishlistIds, enroll, toggleWishlist } =
    useCourseStore();
  const toast = useToast();

  // Filter state — sync with URL params
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") ?? "",
  );
  const [activeLevel, setActiveLevel] = useState(
    searchParams.get("level") ?? "All",
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "popular");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Data state
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load categories once
  useEffect(() => {
    CourseService.getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Fetch courses (debounced on keyword)
  const fetchCourses = useCallback(
    (p = 1, append = false) => {
      const setter = append ? setLoadingMore : setLoading;
      setter(true);
      const params = {
        sortBy,
        page: p,
        limit: 9,
        ...(keyword.trim() && { keyword: keyword.trim() }),
        ...(activeCategory && { category: activeCategory }),
        ...(activeLevel !== "All" && { level: activeLevel }),
      };
      CourseService.searchCourses(params)
        .then((res) => {
          setCourses((prev) =>
            append ? [...prev, ...res.courses] : res.courses,
          );
          setTotal(res.total);
          setPage(p);
          setTotalPages(res.pages);
        })
        .catch(() => toast.error("Failed to load courses"))
        .finally(() => setter(false));
    },
    [keyword, activeCategory, activeLevel, sortBy],
  );

  // Debounce keyword changes
  useEffect(() => {
    const t = setTimeout(() => {
      fetchCourses(1);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  // Sync URL params
  useEffect(() => {
    const p = {};
    if (keyword) p.q = keyword;
    if (activeCategory) p.category = activeCategory;
    if (activeLevel !== "All") p.level = activeLevel;
    if (sortBy !== "popular") p.sort = sortBy;
    setSearchParams(p, { replace: true });
  }, [keyword, activeCategory, activeLevel, sortBy]);

  const handleEnroll = (course) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    enroll(course._id);
    toast.success(`Enrolled in "${course.title}"!`);
    navigate(`/student/learning/${course._id}`);
  };

  const handleWishlist = (courseId) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    toggleWishlist(courseId);
    toast.success(
      wishlistIds.includes(courseId)
        ? "Removed from wishlist"
        : "Added to wishlist",
    );
  };

  const handleFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };
  const clearFilters = () => {
    setKeyword("");
    setActiveCategory("");
    setActiveLevel("All");
    setSortBy("popular");
  };

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Most Popular";
  const hasFilters = keyword || activeCategory || activeLevel !== "All";

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="px-6 pt-10 pb-20 mx-auto max-w-7xl">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-6 mb-10 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h1 className="mb-4 text-5xl font-black leading-none tracking-tighter md:text-6xl text-heading">
              All Courses
              <br />
              <span className="gradient-text">In One Place</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Hundreds of expert-led courses across every discipline.
            </p>
          </motion.div>

          {/* Search + Sort */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="flex items-center glass-card rounded-full px-4 py-2.5 gap-2 min-w-[220px]">
              <Icon name="search" size={16} color="var(--text-muted)" />
              <input
                value={keyword}
                onChange={(e) => handleFilter(setKeyword, e.target.value)}
                placeholder="Search courses..."
                className="w-full text-sm bg-transparent border-none outline-none text-body placeholder:text-muted"
              />
              {keyword && (
                <button onClick={() => handleFilter(setKeyword, "")}>
                  <Icon name="x" size={14} color="var(--text-muted)" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className="flex items-center gap-2 glass-card rounded-full px-5 py-2.5 text-sm font-bold hover:border-primary/30 transition-all"
              >
                {currentSortLabel}{" "}
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
                        onClick={() => {
                          handleFilter(setSortBy, opt.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors hover:bg-primary/10 ${sortBy === opt.value ? "text-primary" : "text-body"}`}
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

        {/* ── Category tabs ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 pb-2 mb-4 overflow-x-auto scrollbar-hide"
        >
          <button
            onClick={() => handleFilter(setActiveCategory, "")}
            className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all ${!activeCategory ? "btn-aurora" : "glass-card hover:border-primary/30"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleFilter(setActiveCategory, cat._id)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat._id ? "btn-aurora" : "glass-card hover:border-primary/30"}`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* ── Level tabs ──────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-8">
          {LEVEL_OPTIONS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleFilter(setActiveLevel, lvl)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeLevel === lvl ? "btn-aurora" : "glass-card opacity-70 hover:opacity-100"}`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* ── Result count ────────────────────────────────────────────────── */}
        {!loading && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm font-medium text-muted">
              Showing{" "}
              <span className="font-bold text-heading">{courses.length}</span>{" "}
              of <span className="font-bold text-heading">{total}</span> courses
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <Icon name="x" size={12} color="var(--color-primary)" /> Clear
                filters
              </button>
            )}
          </div>
        )}

        {/* ── Grid ────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-[1.5rem] overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-white/40" />
                <div className="p-6 space-y-3">
                  <div className="w-3/4 h-5 rounded-full bg-white/40" />
                  <div className="w-full h-4 rounded-full bg-white/30" />
                  <div className="w-5/6 h-4 rounded-full bg-white/30" />
                  <div className="w-1/2 h-4 rounded-full bg-white/20" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-24 text-center">
            <p className="mt-4 text-lg font-medium text-muted">
              No courses match your search.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onEnroll={handleEnroll}
                  onWishlist={handleWishlist}
                  isEnrolled={enrolledCourseIds.includes(course._id)}
                  isWishlisted={wishlistIds.includes(course._id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Load More ───────────────────────────────────────────────────── */}
        {!loading && page < totalPages && (
          <div className="flex justify-center mt-14">
            <button
              onClick={() => fetchCourses(page + 1, true)}
              disabled={loadingMore}
              className="flex items-center gap-3 px-10 py-4 font-bold transition-all glass-card rounded-2xl hover:bg-white/60"
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full border-primary border-t-transparent animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Icon name="refresh" size={20} color="var(--text-body)" />
                  Load more courses
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CoursesPage;

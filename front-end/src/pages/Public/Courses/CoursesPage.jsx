import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin } from "antd";

import CourseCard from "../../../components/common/CourseCard";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import PaymentService from "../../../services/api/PaymentService";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const SORT_OPTIONS = [
  { value: "popular",   label: "Most Popular",       icon: "trending" },
  { value: "rating",    label: "Highest Rated",       icon: "star"     },
  { value: "priceAsc",  label: "Price: Low → High",   icon: "dollar"   },
  { value: "priceDesc", label: "Price: High → Low",   icon: "dollar"   },
];

const LEVEL_OPTIONS = [
  { value: "All",          label: "All Levels" },
  { value: "Beginner",     label: "Beginner"   },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced",     label: "Advanced"   },
];

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div className="glass-card rounded-[1.5rem] overflow-hidden animate-pulse">
    <div className="aspect-video bg-white/40" />
    <div className="p-6 space-y-3">
      <div className="w-3/4 h-5 rounded-full bg-white/40" />
      <div className="w-full h-4 rounded-full bg-white/30" />
      <div className="w-5/6 h-4 rounded-full bg-white/30" />
      <div className="w-1/2 h-4 rounded-full bg-white/20" />
    </div>
  </div>
);

/* ── Main ── */
const CoursesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { enrolledCourseIds, wishlistIds, enroll, toggleWishlist, setEnrolledCourseIds } = useCourseStore();
  const toast = useToast();

  const [keyword,        setKeyword]        = useState(searchParams.get("q") ?? "");
  const [inputVal,       setInputVal]       = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "");
  const [activeLevel,    setActiveLevel]    = useState(searchParams.get("level") ?? "All");
  const [sortBy,         setSortBy]         = useState(searchParams.get("sort") ?? "popular");

  const [courses,     setCourses]     = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    CourseService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    PaymentService.getEnrolledCourseIds().then(setEnrolledCourseIds).catch(() => {});
  }, [isAuthenticated]);

  const fetchCourses = useCallback(
    (p = 1, append = false) => {
      const setter = append ? setLoadingMore : setLoading;
      setter(true);
      CourseService.searchCourses({
        sortBy,
        page: p,
        limit: 9,
        ...(keyword.trim()        && { keyword: keyword.trim() }),
        ...(activeCategory        && { category: activeCategory }),
        ...(activeLevel !== "All" && { level: activeLevel }),
      })
        .then((res) => {
          setCourses((prev) => append ? [...prev, ...res.courses] : res.courses);
          setTotal(res.total);
          setPage(p);
          setTotalPages(res.pages);
        })
        .catch(() => toast.error("Failed to load courses"))
        .finally(() => setter(false));
    },
    [keyword, activeCategory, activeLevel, sortBy],
  );

  useEffect(() => {
    const t = setTimeout(() => { fetchCourses(1); }, 400);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  // Sync URL params
  useEffect(() => {
    const p = {};
    if (keyword)              p.q        = keyword;
    if (activeCategory)       p.category = activeCategory;
    if (activeLevel !== "All") p.level   = activeLevel;
    if (sortBy !== "popular") p.sort     = sortBy;
    setSearchParams(p, { replace: true });
  }, [keyword, activeCategory, activeLevel, sortBy]);

  const handleSearch = () => { setKeyword(inputVal); };
  const handleClearSearch = () => { setInputVal(""); setKeyword(""); };

  const clearFilters = () => {
    setInputVal(""); setKeyword(""); setActiveCategory(""); setActiveLevel("All"); setSortBy("popular");
  };

  const hasFilters = keyword || activeCategory || activeLevel !== "All";

  const handleEnroll = (course) => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    enroll(course._id);
    navigate(`/student/learning/${course._id}`);
  };

  const handleWishlist = (courseId) => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    toggleWishlist(courseId);
  };

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="px-6 pt-10 pb-20 mx-auto max-w-7xl">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-10"
        >
          <h1 className="mb-3 text-5xl font-black leading-none tracking-tighter md:text-6xl text-heading">
            All Courses<br />
            <span className="gradient-text">In One Place</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            Hundreds of expert-led courses across every discipline.
          </p>
        </motion.div>

        {/* ── Filter Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-card rounded-[1.75rem] p-5 mb-8"
          style={{ border: "1px solid rgba(255,255,255,0.6)" }}
        >
          {/* Row 1: Search + Sort */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search input */}
            <div
              className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md px-4 py-2.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <Icon name="search" size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search courses..."
                className="flex-1 bg-transparent outline-none text-sm font-medium text-body placeholder:text-muted"
              />
              {inputVal && (
                <button onClick={handleClearSearch} className="text-muted hover:text-heading transition-colors">
                  <Icon name="x" size={14} color="currentColor" />
                </button>
              )}
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="btn-aurora px-6 py-2.5 text-sm font-bold rounded-2xl flex items-center gap-2"
            >
              <Icon name="search" size={14} color="white" />
              Search
            </button>

            {/* Sort dropdown */}
            <div className="relative ml-auto">
              <div className="flex items-center gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      sortBy === opt.value
                        ? "btn-aurora"
                        : "glass-card opacity-70 hover:opacity-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mb-4" style={{ background: "rgba(0,0,0,0.06)" }} />

          {/* Row 2: Category tabs */}
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2.5">Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !activeCategory ? "btn-aurora" : "glass-card opacity-70 hover:opacity-100"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(activeCategory === cat._id ? "" : cat._id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat._id ? "btn-aurora" : "glass-card opacity-70 hover:opacity-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Level tabs */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2.5">Level</p>
            <div className="flex flex-wrap gap-2">
              {LEVEL_OPTIONS.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => setActiveLevel(lvl.value)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeLevel === lvl.value ? "btn-aurora" : "glass-card opacity-70 hover:opacity-100"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Result info bar ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-muted">
                Showing{" "}
                <span className="font-bold text-heading">{courses.length}</span>
                {" "}of{" "}
                <span className="font-bold text-heading">{total}</span>
                {" "}courses
              </p>
              {hasFilters && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(2,132,199,0.1)", color: "var(--color-primary)" }}>
                  Filtered
                </span>
              )}
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline transition-all"
              >
                <Icon name="x" size={12} color="var(--color-primary)" />
                Clear all filters
              </button>
            )}
          </motion.div>
        )}

        {/* ── Course Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ background: "rgba(2,132,199,0.08)" }}>
              <Icon name="search" size={36} color="var(--color-primary)" />
            </div>
            <p className="text-xl font-bold text-heading mb-2">No courses found</p>
            <p className="text-muted mb-6">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-aurora px-8 py-3 rounded-2xl font-bold">
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  variant="browse"
                  isEnrolled={enrolledCourseIds.includes(course._id)}
                  isWishlisted={wishlistIds.includes(course._id)}
                  onEnroll={handleEnroll}
                  onWishlist={handleWishlist}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Load More ── */}
        {!loading && page < totalPages && (
          <div className="flex justify-center mt-14">
            <button
              onClick={() => fetchCourses(page + 1, true)}
              disabled={loadingMore}
              className="flex items-center gap-3 px-10 py-4 font-bold transition-all glass-card rounded-2xl hover:bg-white/60"
            >
              {loadingMore
                ? <Spin size="small" />
                : <Icon name="refresh" size={20} color="var(--text-body)" />}
              {loadingMore ? "Loading..." : "Load more courses"}
            </button>
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default CoursesPage;
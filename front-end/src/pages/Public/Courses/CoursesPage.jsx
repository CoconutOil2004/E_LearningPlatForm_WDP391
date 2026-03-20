import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input, Select, Spin } from "antd";

import CourseCard from "../../../components/common/CourseCard";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating",  label: "Highest Rated" },
  { value: "priceAsc",  label: "Price: Low → High" },
  { value: "priceDesc", label: "Price: High → Low" },
];

const LEVEL_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

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
  const { enrolledCourseIds, wishlistIds, enroll, toggleWishlist } = useCourseStore();
  const toast = useToast();

  const [keyword,        setKeyword]        = useState(searchParams.get("q") ?? "");
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

  const fetchCourses = useCallback(
    (p = 1, append = false) => {
      const setter = append ? setLoadingMore : setLoading;
      setter(true);
      CourseService.searchCourses({
        sortBy,
        page: p,
        limit: 9,
        ...(keyword.trim()         && { keyword: keyword.trim() }),
        ...(activeCategory         && { category: activeCategory }),
        ...(activeLevel !== "All"  && { level: activeLevel }),
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
    const t = setTimeout(() => { fetchCourses(1); setPage(1); }, 400);
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

  const handleFilter = (setter, value) => { setter(value); setPage(1); };
  const clearFilters = () => {
    setKeyword(""); setActiveCategory(""); setActiveLevel("All"); setSortBy("popular");
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

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="px-6 pt-10 pb-20 mx-auto max-w-7xl">

        {/* ── Header ── */}
        <div className="flex flex-col justify-between gap-6 mb-10 md:flex-row md:items-end">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h1 className="mb-4 text-5xl font-black leading-none tracking-tighter md:text-6xl text-heading">
              All Courses<br />
              <span className="gradient-text">In One Place</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Hundreds of expert-led courses across every discipline.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Input
              prefix={<Icon name="search" size={16} color="var(--text-muted)" />}
              value={keyword}
              onChange={(e) => handleFilter(setKeyword, e.target.value)}
              placeholder="Search courses..."
              allowClear
              style={{ borderRadius: 999, minWidth: 220 }}
            />
            <Select
              value={sortBy}
              onChange={(val) => handleFilter(setSortBy, val)}
              options={SORT_OPTIONS}
              style={{ minWidth: 180, borderRadius: 999 }}
            />
          </motion.div>
        </div>

        {/* ── Category tabs ── */}
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

        {/* ── Level tabs ── */}
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

        {/* ── Result count ── */}
        {!loading && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm font-medium text-muted">
              Showing <span className="font-bold text-heading">{courses.length}</span> of{" "}
              <span className="font-bold text-heading">{total}</span> courses
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <Icon name="x" size={12} color="var(--color-primary)" /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-24 text-center">
            <p className="mt-4 text-lg font-medium text-muted">No courses match your search.</p>
          </div>
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

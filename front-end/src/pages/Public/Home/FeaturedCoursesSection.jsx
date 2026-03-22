import { Button, Skeleton } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CourseCard from "../../../components/common/CourseCard";
import { Icon } from "../../../components/ui";
import { ROUTES } from "../../../utils/constants";

/* ── Course skeleton ── */
const CourseSkeleton = () => (
  <div className="glass-card rounded-[2.5rem] overflow-hidden p-4">
    <Skeleton.Image
      active
      style={{ width: "100%", height: 176, borderRadius: 16 }}
    />
    <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
  </div>
);

/* ── Category row ── */
const CategoryRow = ({
  section,
  enrolledCourseIds,
  wishlistIds,
  onEnroll,
  onWishlist,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Row header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-8 rounded-full"
            style={{ background: "var(--gradient-brand)" }}
          />
          <h3 className="text-2xl font-extrabold tracking-tight text-heading">
            {section.category.name}
          </h3>
          <span className="px-3 py-1 text-xs font-bold border rounded-full text-muted bg-white/50 border-border/40">
            {section.total} courses
          </span>
        </div>
        <button
          onClick={() =>
            navigate(`${ROUTES.COURSES}?category=${section.category._id}`)
          }
          className="flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-3 transition-all duration-200"
        >
          View all{" "}
          <Icon name="chevronRight" size={16} color="var(--color-primary)" />
        </button>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {section.courses.map((course, i) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <CourseCard
              course={course}
              variant="browse"
              isEnrolled={enrolledCourseIds.includes(course._id)}
              isWishlisted={wishlistIds.includes(course._id)}
              onEnroll={onEnroll}
              onWishlist={onWishlist}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

/* ── FeaturedCoursesSection ── */
const FeaturedCoursesSection = ({
  categorySections,
  sectionsLoading,
  sectionsError,
  enrolledCourseIds,
  wishlistIds,
  onEnroll,
  onWishlist,
}) => {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-16 mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-heading">
          Featured Courses
        </h2>
        <p className="font-medium text-muted">
          Curated for the latest trends in technology
        </p>
      </div>

      {/* Loading skeleton */}
      {sectionsLoading && (
        <div className="space-y-12">
          {[...Array(3)].map((_, si) => (
            <div key={si}>
              <Skeleton.Input
                active
                style={{ width: 160, marginBottom: 24, borderRadius: 999 }}
              />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <CourseSkeleton key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!sectionsLoading && sectionsError && (
        <div className="py-16 text-center">
          <p className="mt-4 font-medium text-muted">
            Could not load courses. Please try again.
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {/* Sections */}
      {!sectionsLoading && !sectionsError && (
        <div className="space-y-16">
          {categorySections.map((section) => (
            <CategoryRow
              key={section.category._id}
              section={section}
              enrolledCourseIds={enrolledCourseIds}
              wishlistIds={wishlistIds}
              onEnroll={onEnroll}
              onWishlist={onWishlist}
            />
          ))}
          {categorySections.length === 0 && (
            <div className="py-20 text-center">
              <p className="mt-4 text-lg font-medium text-muted">
                No published courses yet.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 text-center">
        <button
          className="btn-aurora-outline"
          onClick={() => navigate(ROUTES.COURSES)}
        >
          Browse All Courses
        </button>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;

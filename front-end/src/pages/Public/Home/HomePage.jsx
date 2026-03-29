import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "../../../contexts/ToastContext";
import useCategorySection from "../../../hooks/useCategorySection";
import BlogService from "../../../services/api/BlogService";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

import BlogSection from "./BlogSection";
import FeaturedCoursesSection from "./FeaturedCoursesSection";
import HeroSection from "./HeroSection";
import { AuroraBg } from "./homeConstants";
import LearningPathSection from "./LearningPathSection";
import StatsSection from "./StatsSection";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { enrolledCourseIds, wishlistIds, enroll, toggleWishlist } =
    useCourseStore();
  const toast = useToast();

  const {
    sections: categorySections,
    loading: sectionsLoading,
    error: sectionsError,
  } = useCategorySection({ limit: 4, sortBy: "popular", maxCategories: 5 });

  const [upNext, setUpNext] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  useEffect(() => {
    CourseService.searchCourses({ sortBy: "popular", limit: 2 })
      .then((r) => setUpNext(r.courses ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setBlogsLoading(true);
    BlogService.getPublicBlogs({ page: 1, limit: 3 })
      .then((res) => setLatestBlogs(res.data || []))
      .catch(() => setLatestBlogs([]))
      .finally(() => setBlogsLoading(false));
  }, []);

  const handleEnroll = (course) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    enroll(course._id);
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

  const handleAuthRoute = (route) => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    navigate(route);
  };

  const userInitial = user?.fullname
    ? user.fullname.charAt(0).toUpperCase()
    : (user?.email?.charAt(0).toUpperCase() ?? "U");

  return (
    <>
      <AuroraBg />
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ position: "relative", zIndex: 1 }}
      >
        <HeroSection
          isAuthenticated={isAuthenticated}
          upNext={upNext}
          enrolledCourseIds={enrolledCourseIds}
          userInitial={userInitial}
          onAuthRoute={handleAuthRoute}
        />

        <LearningPathSection />

        {/* <ToolsSection /> */}

        <FeaturedCoursesSection
          categorySections={categorySections}
          sectionsLoading={sectionsLoading}
          sectionsError={sectionsError}
          enrolledCourseIds={enrolledCourseIds}
          wishlistIds={wishlistIds}
          onEnroll={handleEnroll}
          onWishlist={handleWishlist}
        />

        <BlogSection latestBlogs={latestBlogs} blogsLoading={blogsLoading} />

        <StatsSection />
      </motion.div>
    </>
  );
};

export default HomePage;

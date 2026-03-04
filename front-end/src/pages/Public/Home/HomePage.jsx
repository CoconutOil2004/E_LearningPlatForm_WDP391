import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CourseCard from "../../../components/common/CourseCard";
import { Btn, Skeleton, Badge, StatCard, Icon } from "../../../components/ui";
import { FAKE_COURSES, FAKE_CATEGORIES } from "../../../utils/fakeData";
import { pageVariants } from "../../../utils/helpers";
import { ROUTES } from "../../../utils/constants";
import useCourseStore from "../../../store/slices/courseStore";
import useAuthStore from "../../../store/slices/authStore";
import { useToast } from "../../../contexts/ToastContext";

const STATS = [
  { label: "Students Enrolled", value: "2.4M+", icon: "users", color: "var(--color-primary)" },
  { label: "Courses Available", value: "15,000+", icon: "book", color: "var(--color-secondary)" },
  { label: "Expert Instructors", value: "3,200+", icon: "award", color: "var(--color-success)" },
  { label: "Countries Reached", value: "190+", icon: "globe", color: "var(--color-accent)" },
];

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const { enrolledCourseIds, wishlistIds, enroll, toggleWishlist } = useCourseStore();
  const toast = useToast();

  useEffect(() => { setTimeout(() => setLoading(false), 700); }, []);

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

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 section-hero">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full opacity-20"
              style={{ width: 80 + i * 40, height: 80 + i * 40, background: i % 2 === 0 ? "var(--color-primary)" : "var(--color-secondary)", left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 30}%` }}
              animate={{ y: [0, -20, 0] }} transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }} />
          ))}
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Badge color="indigo">🚀 The Future of Learning is Here</Badge>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-black mt-4 mb-6 leading-tight text-heading">
              Learn Without<br />
              <span style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Boundaries</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-lg text-muted mb-8 leading-relaxed max-w-lg">
              Access world-class courses from top instructors. Learn at your pace, earn certificates, and advance your career.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-4 flex-wrap">
              <Btn size="lg" onClick={() => navigate(ROUTES.COURSES)}><Icon name="search" size={18} />Explore Courses</Btn>
              <Btn variant="outline" size="lg" onClick={() => navigate(ROUTES.REGISTER)}>Start Teaching</Btn>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="hidden md:grid grid-cols-2 gap-4">
            {FAKE_COURSES.slice(0, 4).map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <img src={c.image} alt={c.title} className="w-full h-24 object-cover" />
                <div className="p-2"><p className="text-xs font-bold text-body line-clamp-1">{c.title}</p><p className="text-xs text-primary font-semibold">${c.price}</p></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center border border-border" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <Icon name={s.icon} size={24} color={s.color} />
              </div>
              <div className="text-3xl font-black text-heading mb-1">{s.value}</div>
              <div className="text-sm text-muted font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-6 bg-subtle">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-heading mb-8">Browse by Category</h2>
          <div className="flex gap-3 flex-wrap">
            {FAKE_CATEGORIES.map((cat, i) => (
              <motion.button key={cat} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05 }}
                onClick={() => navigate(ROUTES.COURSES)}
                className="px-5 py-2.5 bg-white rounded-xl border-2 border-border text-sm font-semibold text-body hover:border-primary hover:text-primary transition-all">
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-heading">Featured Courses</h2>
            <Btn variant="outline" size="sm" onClick={() => navigate(ROUTES.COURSES)}>View All</Btn>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i}><Skeleton className="h-44 mb-4" /><Skeleton className="h-4 mb-2" /><Skeleton className="h-4 w-3/4" /></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FAKE_COURSES.slice(0, 4).map((course) => (
                <CourseCard key={course.id} course={course} onEnroll={handleEnroll} onWishlist={handleWishlist}
                  isEnrolled={enrolledCourseIds.includes(course.id)} isWishlisted={wishlistIds.includes(course.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 mx-6 mb-8 rounded-3xl" style={{ background: "var(--gradient-brand)" }}>
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-black mb-4">Ready to Start Learning?</h2>
          <p className="text-primary/30 text-lg mb-8">Join millions of learners worldwide and unlock your potential today.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Btn size="lg" onClick={() => navigate(ROUTES.REGISTER)} className="bg-white !text-primary hover:bg-primary/10">Get Started Free</Btn>
            <Btn size="lg" variant="ghost" onClick={() => navigate(ROUTES.COURSES)} className="!text-white border-2 border-white/30 hover:bg-white/10">Browse Courses</Btn>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
export default HomePage;

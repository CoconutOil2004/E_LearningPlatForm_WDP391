import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const fmtDuration = (s) => {
  if (!s) return null;
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ─── Section accordion ────────────────────────────────────────────────────────
const SectionAccordion = ({ section, idx, isUnlocked }) => {
  const [open, setOpen] = useState(idx === 0);
  const lessons = section.items?.filter((i) => i.itemType === "lesson") ?? [];
  const quizzes = section.items?.filter((i) => i.itemType === "quiz") ?? [];

  return (
    <div className="overflow-hidden border border-border/40 rounded-2xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full p-5 text-left transition-colors bg-white/50 hover:bg-white/70"
      >
        <div>
          <span className="font-bold text-heading">{section.title}</span>
          <span className="ml-3 text-xs text-muted">
            {lessons.length} lessons · {quizzes.length} quizzes
          </span>
        </div>
        <Icon
          name={open ? "chevronDown" : "chevronRight"}
          size={18}
          color="var(--text-muted)"
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border/30">
              {section.items?.map((item, i) => {
                const duration = item.itemId?.duration;
                return (
                  <div
                    key={item._id || i}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        item.itemType === "quiz"
                          ? "bg-purple-100"
                          : isUnlocked
                            ? "bg-green-100"
                            : "bg-gray-100"
                      }`}
                    >
                      {item.itemType === "quiz" ? (
                        <Icon name="note" size={14} color="#8B5CF6" />
                      ) : isUnlocked ? (
                        <Icon
                          name="play"
                          size={14}
                          color="var(--color-success)"
                        />
                      ) : (
                        <Icon name="lock" size={14} color="var(--text-muted)" />
                      )}
                    </div>
                    <span className="flex-1 text-sm text-body">
                      {item.title}
                    </span>
                    {duration > 0 && (
                      <span className="text-xs text-muted">
                        {fmtDuration(duration)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { enrolledCourseIds, wishlistIds, enroll, toggleWishlist } =
    useCourseStore();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview"); // overview | curriculum

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Try full detail first (enrolled/instructor/admin), fallback to preview
    CourseService.getCourseDetail(id)
      .then(setCourse)
      .catch((err) => {
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          return CourseService.getCoursePreview(id).then(setCourse);
        }
        throw err;
      })
      .catch(() => {
        toast.error("Course not found");
        navigate(ROUTES.COURSES);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="max-w-6xl px-6 py-10 mx-auto">
        <div className="w-64 h-8 mb-8 rounded-full bg-white/40 animate-pulse" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="aspect-video bg-white/40 rounded-3xl animate-pulse" />
            <div className="w-3/4 h-6 rounded-full bg-white/40 animate-pulse" />
            <div className="h-4 rounded-full bg-white/30 animate-pulse" />
            <div className="w-5/6 h-4 rounded-full bg-white/30 animate-pulse" />
          </div>
          <div className="h-80 bg-white/40 rounded-3xl animate-pulse" />
        </div>
      </div>
    );

  if (!course) return null;

  const instructor =
    course.instructorId?.fullname ?? course.instructorId?.email ?? "Instructor";
  const categoryName = course.category?.name ?? "";
  const isFree = course.price === 0;
  const isEnrolled = enrolledCourseIds.includes(course._id);
  const isOwner =
    user?._id &&
    (course.instructorId?._id === user._id || course.instructorId === user._id);
  const isAdmin = user?.role === "admin";
  const isUnlocked = isEnrolled || isOwner || isAdmin;
  const isWishlisted = wishlistIds.includes(course._id);

  const totalLessons = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "lesson").length ?? 0),
    0,
  );
  const totalQuizzes = (course.sections ?? []).reduce(
    (a, s) => a + (s.items?.filter((i) => i.itemType === "quiz").length ?? 0),
    0,
  );
  const duration = fmtDuration(course.totalDuration);

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (isFree) {
      enroll(course._id);
      toast.success("Enrolled successfully!");
      navigate(`/student/learning/${course._id}`);
    } else {
      toast.info("Payment flow coming soon");
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-6xl px-6 py-10 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-xs font-medium text-muted">
          <button
            onClick={() => navigate(ROUTES.COURSES)}
            className="transition-colors hover:text-primary"
          >
            Courses
          </button>
          <Icon name="chevronRight" size={12} color="var(--text-muted)" />
          {categoryName && (
            <>
              <span>{categoryName}</span>
              <Icon name="chevronRight" size={12} color="var(--text-muted)" />
            </>
          )}
          <span className="text-body line-clamp-1">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ── Left: detail ──────────────────────────────────────────── */}
          <div className="space-y-8 lg:col-span-2">
            {/* Thumbnail */}
            <div className="overflow-hidden aspect-video rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/20">
              <img
                src={
                  course.thumbnail ||
                  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop"
                }
                alt={course.title}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Title */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {categoryName && (
                  <span className="px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full text-primary bg-primary/10">
                    {categoryName}
                  </span>
                )}
                <span className="px-3 py-1 text-xs font-bold border rounded-full text-muted bg-white/50 border-border/30">
                  {course.level}
                </span>
                {!isUnlocked && (
                  <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">
                    <Icon name="lock" size={11} color="#92400E" /> Preview Only
                  </span>
                )}
              </div>
              <h1 className="mb-3 text-3xl font-black tracking-tight text-heading">
                {course.title}
              </h1>
              <p className="leading-relaxed text-muted">{course.description}</p>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-muted">
                <Icon name="user" size={16} />
                <span>{instructor}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted">
                <Icon name="star" size={16} color="#F59E0B" />
                <span className="font-bold text-heading">
                  {Number(course.rating ?? 0).toFixed(1)}
                </span>
                <span>
                  ({(course.enrollmentCount ?? 0).toLocaleString()} students)
                </span>
              </div>
              {duration && (
                <div className="flex items-center gap-1.5 text-muted">
                  <Icon name="clock" size={16} />
                  <span>{duration}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted">
                <Icon name="book" size={16} />
                <span>
                  {totalLessons} lessons · {totalQuizzes} quizzes
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-2 mb-6 border-b border-border/40">
                {["overview", "curriculum"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-5 py-3 text-sm font-bold capitalize transition-colors border-b-2 -mb-px ${
                      tab === t
                        ? "border-primary text-primary"
                        : "border-transparent text-muted hover:text-body"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {tab === "overview" && (
                <div className="prose-sm prose max-w-none text-body">
                  <p className="leading-relaxed">
                    {course.description || "No description available."}
                  </p>
                  {course.sections?.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {[
                        { icon: "book", label: `${totalLessons} Lessons` },
                        { icon: "note", label: `${totalQuizzes} Quizzes` },
                        { icon: "clock", label: duration || "—" },
                        {
                          icon: "users",
                          label: `${(course.enrollmentCount ?? 0).toLocaleString()} Students`,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 p-4 glass-card rounded-2xl"
                        >
                          <Icon
                            name={item.icon}
                            size={18}
                            color="var(--color-primary)"
                          />
                          <span className="text-sm font-semibold text-body">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "curriculum" && (
                <div className="space-y-3">
                  {(course.sections ?? []).length === 0 ? (
                    <p className="text-sm text-muted">
                      No curriculum available yet.
                    </p>
                  ) : (
                    (course.sections ?? []).map((sec, idx) => (
                      <SectionAccordion
                        key={sec._id || idx}
                        section={sec}
                        idx={idx}
                        isUnlocked={isUnlocked}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: sticky purchase card ───────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky p-6 space-y-5 top-24 glass-card rounded-3xl">
              {/* Price */}
              <div>
                {!isFree && (
                  <p className="text-sm line-through text-muted">
                    ${(course.price * 1.4).toFixed(2)}
                  </p>
                )}
                <p className="text-4xl font-black tracking-tight gradient-text">
                  {isFree ? "Free" : `$${course.price}`}
                </p>
              </div>

              {/* CTA */}
              {isOwner || isAdmin ? (
                <button
                  onClick={() =>
                    navigate(`/instructor/courses/edit/${course._id}`)
                  }
                  className="w-full py-3.5 rounded-2xl font-bold text-sm btn-aurora flex items-center justify-center gap-2"
                >
                  <Icon name="edit" size={16} color="white" /> Edit Course
                </button>
              ) : isEnrolled ? (
                <button
                  onClick={() => navigate(`/student/learning/${course._id}`)}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm btn-aurora flex items-center justify-center gap-2"
                >
                  <Icon name="play" size={16} color="white" /> Continue Learning
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm btn-aurora flex items-center justify-center gap-2"
                >
                  <Icon name="award" size={16} color="white" />
                  {isFree ? "Enroll Free" : "Buy Now"}
                </button>
              )}

              {/* Wishlist */}
              {/* {!isOwner && !isAdmin && !isEnrolled && (
                <button
                  onClick={() => handleWishlist(course._id)}
                  className="flex items-center justify-center w-full gap-2 py-3 text-sm font-bold transition-all rounded-2xl glass-card hover:border-primary/30"
                >
                  <Icon
                    name="heart"
                    size={16}
                    color={isWishlisted ? "#EF4444" : "var(--text-muted)"}
                  />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>
              )} */}

              {/* Info list */}
              <div className="pt-2 space-y-2 text-sm border-t border-border/40 text-muted">
                {[
                  { icon: "book", text: `${totalLessons} lessons` },
                  { icon: "note", text: `${totalQuizzes} quizzes` },
                  { icon: "clock", text: duration || "—" },
                  { icon: "globe", text: "Full lifetime access" },
                  { icon: "award", text: "Certificate of completion" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <Icon
                      name={item.icon}
                      size={15}
                      color="var(--color-primary)"
                    />{" "}
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetailPage;

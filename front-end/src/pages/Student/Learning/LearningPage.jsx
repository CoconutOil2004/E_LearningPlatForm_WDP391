import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import { ROUTES } from "../../../utils/constants";

const fmtTime = (s) => {
  if (!s) return "—";
  const m = Math.floor(s / 60),
    sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();
  const { markLessonComplete, setCurrentLesson, lessonProgress } =
    useCourseStore();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]); // flat list: { ...lesson, sectionTitle }
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    CourseService.getCourseDetail(courseId)
      .then((data) => {
        if (!data) {
          toast.error("Course not found");
          navigate(ROUTES.MY_COURSES);
          return;
        }
        setCourse(data);
        setLessons(CourseService.getLessonsFromCourse(data));
        const saved = lessonProgress[courseId]?.currentLesson;
        if (saved) setActiveIdx(saved);
      })
      .catch((err) => {
        if (err?.response?.status === 403) {
          toast.error("You haven't enrolled in this course");
          navigate(ROUTES.MY_COURSES);
        } else {
          toast.error("Failed to load course");
        }
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const completed = lessonProgress[courseId]?.completedLessons ?? [];
  const totalLess = lessons.length;
  const progress =
    totalLess > 0 ? Math.round((completed.length / totalLess) * 100) : 0;
  const activeLesson = lessons[activeIdx];

  const goTo = (idx) => {
    setActiveIdx(idx);
    setCurrentLesson(courseId, idx);
  };

  const handleComplete = () => {
    markLessonComplete(courseId, activeIdx);
    if (activeIdx < totalLess - 1) goTo(activeIdx + 1);
    else toast.success("🎉 You've completed this course!");
  };

  // Build sections with flat index mapping
  const sectionsWithIdx = [];
  let flatCounter = 0;
  for (const sec of course?.sections ?? []) {
    const mapped = [];
    for (const item of sec.items ?? []) {
      if (item.itemType === "lesson")
        mapped.push({ ...item, flatIdx: flatCounter++ });
    }
    if (mapped.length) sectionsWithIdx.push({ ...sec, mappedItems: mapped });
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="w-8 h-8 border-2 rounded-full border-primary border-t-transparent animate-spin" />
      </div>
    );
  if (!course) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden text-white bg-gray-950">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 border-b h-14 border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.MY_COURSES)}
            className="p-2 transition-colors rounded-lg hover:bg-white/10"
          >
            <Icon name="chevronLeft" size={18} color="white" />
          </button>
          <div>
            <p className="text-xs text-white/50 font-medium leading-none mb-0.5">
              {course.category?.name}
            </p>
            <h1 className="max-w-xs text-sm font-bold leading-none line-clamp-1">
              {course.title}
            </h1>
          </div>
        </div>
        <div className="items-center hidden gap-3 md:flex">
          <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full transition-all rounded-full bg-secondary"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-white/50">{progress}%</span>
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="p-2 transition-colors rounded-lg hover:bg-white/10"
        >
          <Icon name="menu" size={18} color="white" />
        </button>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {activeLesson?.videoUrl ? (
            <video
              key={activeLesson._id ?? activeIdx}
              src={activeLesson.videoUrl}
              controls
              className="flex-1 object-contain w-full bg-black"
              onEnded={handleComplete}
            />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 bg-gray-900">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-white/10">
                <Icon name="play" size={32} color="white" />
              </div>
              <p className="font-medium text-white/50">
                {activeLesson
                  ? "No video for this lesson"
                  : "Select a lesson to start"}
              </p>
            </div>
          )}

          {/* Controls */}
          {activeLesson && (
            <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gray-900 border-t border-white/10 shrink-0">
              <div className="min-w-0">
                <p className="text-xs text-white/40 font-medium mb-0.5">
                  Lesson {activeIdx + 1} of {totalLess}
                </p>
                <h2 className="font-bold text-white truncate">
                  {activeLesson.title}
                </h2>
                {activeLesson.duration > 0 && (
                  <p className="text-xs text-white/40 mt-0.5">
                    {fmtTime(activeLesson.duration)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => goTo(Math.max(0, activeIdx - 1))}
                  disabled={activeIdx === 0}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors"
                >
                  <Icon name="chevronLeft" size={16} color="white" />
                </button>
                <button
                  onClick={handleComplete}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    completed.includes(activeIdx)
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "btn-aurora"
                  }`}
                >
                  {completed.includes(activeIdx) ? (
                    <span className="flex items-center gap-1.5">
                      <Icon name="check" size={14} color="#4ADE80" />
                      Done
                    </span>
                  ) : activeIdx === totalLess - 1 ? (
                    "Complete Course"
                  ) : (
                    "Mark Complete & Next"
                  )}
                </button>
                <button
                  onClick={() => goTo(Math.min(totalLess - 1, activeIdx + 1))}
                  disabled={activeIdx === totalLess - 1}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors"
                >
                  <Icon name="chevronRight" size={16} color="white" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col overflow-hidden bg-gray-900 border-l border-white/10 shrink-0"
            >
              <div className="p-4 border-b border-white/10">
                <p className="text-xs font-bold tracking-widest uppercase text-white/40">
                  Course Content
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {completed.length}/{totalLess} completed
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sectionsWithIdx.map((sec, si) => (
                  <div key={sec._id || si} className="border-b border-white/5">
                    <div className="px-4 py-3 bg-white/5">
                      <p className="text-xs font-bold tracking-widest uppercase text-white/60">
                        {sec.title}
                      </p>
                    </div>
                    {sec.mappedItems.map((item) => {
                      const isDone = completed.includes(item.flatIdx);
                      const isActive = item.flatIdx === activeIdx;
                      return (
                        <button
                          key={item._id || item.flatIdx}
                          onClick={() => goTo(item.flatIdx)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                            isActive
                              ? "bg-primary/20 border-l-2 border-primary"
                              : ""
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                              isDone
                                ? "bg-green-500 text-white"
                                : isActive
                                  ? "bg-primary text-white"
                                  : "bg-white/10 text-white/40"
                            }`}
                          >
                            {isDone ? (
                              <Icon name="check" size={10} color="white" />
                            ) : (
                              item.flatIdx + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-white/60"}`}
                            >
                              {item.title}
                            </p>
                            {item.itemId?.duration > 0 && (
                              <p className="text-[10px] text-white/30">
                                {fmtTime(item.itemId.duration)}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LearningPage;

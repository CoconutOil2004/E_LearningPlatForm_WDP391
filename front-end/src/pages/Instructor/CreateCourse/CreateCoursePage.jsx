import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CourseService from "../../../services/api/CourseService";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

// ─── VideoUploadCell ──────────────────────────────────────────────────────────
const VideoUploadCell = ({ lesson, onUploaded }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await CourseService.uploadVideo(file, setProgress);
      if (res) onUploaded(res); // { videoUrl, publicId, duration }
    } catch {
      // toast handled by axios interceptor
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (lesson.videoUrl)
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
        <Icon name="check" size={13} color="#059669" />
        Video uploaded
        <button
          onClick={() => onUploaded(null)}
          className="ml-1 text-red-400 hover:text-red-600"
          title="Remove"
        >
          <Icon name="x" size={12} color="currentColor" />
        </button>
      </div>
    );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFile}
      />
      {uploading ? (
        <div className="flex items-center gap-2 text-xs text-muted">
          <div className="w-24 h-1.5 bg-border/40 rounded-full overflow-hidden">
            <div
              className="h-full transition-all rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{progress}%</span>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <Icon name="video" size={13} color="var(--color-primary)" /> Upload
          video
        </button>
      )}
    </div>
  );
};

// ─── LessonRow ────────────────────────────────────────────────────────────────
const LessonRow = ({ lesson, onChange, onRemove }) => (
  <div className="flex items-center gap-3 p-3 bg-white/40 rounded-xl">
    <Icon name="play" size={14} color="var(--text-muted)" />
    <input
      value={lesson.title}
      onChange={(e) => onChange({ title: e.target.value })}
      placeholder="Lesson title"
      maxLength={100}
      className="flex-1 text-sm font-medium bg-transparent border-none outline-none text-body placeholder:text-muted"
    />
    <VideoUploadCell
      lesson={lesson}
      onUploaded={(data) => {
        if (!data) onChange({ videoUrl: "", videoPublicId: "", duration: 0 });
        else
          onChange({
            videoUrl: data.videoUrl,
            videoPublicId: data.publicId,
            duration: data.duration,
          });
      }}
    />
    <button
      onClick={onRemove}
      className="transition-colors text-muted hover:text-red-500 shrink-0"
    >
      <Icon name="trash" size={14} color="currentColor" />
    </button>
  </div>
);

// ─── SectionEditor ────────────────────────────────────────────────────────────
const SectionEditor = ({ section, idx, onChange, onRemove }) => {
  const addLesson = () =>
    onChange({
      ...section,
      items: [
        ...section.items,
        {
          _uid: Date.now(),
          itemType: "lesson",
          title: "",
          videoUrl: "",
          videoPublicId: "",
          duration: 0,
          itemId: null,
        },
      ],
    });
  const updateLesson = (li, patch) =>
    onChange({
      ...section,
      items: section.items.map((it, i) =>
        i === li ? { ...it, ...patch } : it,
      ),
    });
  const removeLesson = (li) =>
    onChange({ ...section, items: section.items.filter((_, i) => i !== li) });

  return (
    <div className="p-5 space-y-3 glass-card rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-6 h-6 text-xs font-black rounded-full bg-primary/20 text-primary shrink-0">
          {idx + 1}
        </div>
        <input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Section title"
          maxLength={100}
          className="flex-1 font-bold bg-transparent border-none outline-none text-heading placeholder:text-muted"
        />
        <button
          onClick={onRemove}
          className="transition-colors text-muted hover:text-red-500"
        >
          <Icon name="x" size={16} color="currentColor" />
        </button>
      </div>

      <div className="space-y-2 pl-9">
        {section.items.map((lesson, li) => (
          <LessonRow
            key={lesson._uid ?? lesson.itemId ?? li}
            lesson={lesson}
            onChange={(patch) => updateLesson(li, patch)}
            onRemove={() => removeLesson(li)}
          />
        ))}
        <button
          onClick={addLesson}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-2"
        >
          <Icon name="plus" size={13} color="var(--color-primary)" /> Add lesson
        </button>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const CreateCoursePage = () => {
  const { id: editId } = useParams(); // present when editing
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(editId);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [price, setPrice] = useState(0);
  const [sections, setSections] = useState([]);
  const [status, setStatus] = useState("draft");
  const [courseId, setCourseId] = useState(editId ?? null);

  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLocked = ["pending", "published"].includes(status);

  // Load categories
  useEffect(() => {
    CourseService.getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Load existing course in edit mode
  useEffect(() => {
    if (!editId) return;
    CourseService.getCourseDetail(editId)
      .then((c) => {
        if (!c) return;
        setTitle(c.title ?? "");
        setDescription(c.description ?? "");
        setCategoryId(c.category?._id ?? c.category ?? "");
        setLevel(c.level ?? "Beginner");
        setPrice(c.price ?? 0);
        setStatus(c.status ?? "draft");
        // Rebuild sections state with _uid for keys
        const rebuilt = (c.sections ?? []).map((sec, si) => ({
          title: sec.title,
          items: (sec.items ?? []).map((it, ii) => ({
            _uid: `${si}-${ii}`,
            itemType: it.itemType,
            itemId: it.itemId?._id ?? it.itemId ?? null,
            title: it.title,
            videoUrl: it.itemId?.videoUrl ?? "",
            videoPublicId: it.itemId?.videoPublicId ?? "",
            duration: it.itemId?.duration ?? 0,
          })),
        }));
        setSections(rebuilt);
      })
      .catch(() => toast.error("Failed to load course"));
  }, [editId]);

  const addSection = () =>
    setSections((prev) => [...prev, { title: "", items: [] }]);
  const updateSection = (idx, sec) =>
    setSections((prev) => prev.map((s, i) => (i === idx ? sec : s)));
  const removeSection = (idx) =>
    setSections((prev) => prev.filter((_, i) => i !== idx));

  // Build payload sections for BE
  const buildSections = () =>
    sections.map((sec, si) => ({
      title: sec.title || `Section ${si + 1}`,
      items: sec.items.map((it, ii) => ({
        itemType: it.itemType ?? "lesson",
        itemRef: it.itemType === "quiz" ? "Quiz" : "Lesson",
        title: it.title || `Lesson ${ii + 1}`,
        orderIndex: ii + 1,
        ...(it.itemId && { itemId: it.itemId }),
        ...(it.videoUrl && { videoUrl: it.videoUrl }),
        ...(it.videoPublicId && { videoPublicId: it.videoPublicId }),
        ...(it.duration && { duration: it.duration }),
      })),
    }));

  const validate = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!categoryId) {
      toast.error("Category is required");
      return false;
    }
    if (!level) {
      toast.error("Level is required");
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let id = courseId;
      // Create if new
      if (!id) {
        const created = await CourseService.createCourse({
          title: title.trim(),
          description,
          categoryId,
          level,
        });
        if (!created) throw new Error("Create failed");
        id = created._id;
        setCourseId(id);
      }
      // Update metadata + sections
      await CourseService.updateCourse(id, {
        title: title.trim(),
        description,
        categoryId,
        level,
        price: Number(price),
        sections: buildSections(),
      });
      toast.success("Draft saved!");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Save first
      let id = courseId;
      if (!id) {
        const created = await CourseService.createCourse({
          title: title.trim(),
          description,
          categoryId,
          level,
        });
        id = created._id;
        setCourseId(id);
      }
      await CourseService.updateCourse(id, {
        title: title.trim(),
        description,
        categoryId,
        level,
        price: Number(price),
        sections: buildSections(),
      });
      // Then submit
      await CourseService.submitCourse(id);
      toast.success("Submitted for review!");
      setStatus("pending");
      navigate(ROUTES.INSTRUCTOR_COURSES);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-4xl px-6 py-10 mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
            className="p-2 transition-all rounded-xl glass-card hover:border-primary/30"
          >
            <Icon name="chevronLeft" size={18} color="var(--text-muted)" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight text-heading">
              {isEdit ? "Edit Course" : "Create New Course"}
            </h1>
            {isLocked && (
              <p className="inline-block px-3 py-1 mt-1 text-xs font-bold text-yellow-700 bg-yellow-100 rounded-full">
                Status: {status} — editing is disabled
              </p>
            )}
          </div>
          {/* Status badge */}
          {status && (
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${
                status === "published"
                  ? "bg-green-100 text-green-700"
                  : status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
              }`}
            >
              {status}
            </span>
          )}
        </div>

        <div className="space-y-6">
          {/* ── Metadata ──────────────────────────────────────────────── */}
          <div className="space-y-5 glass-card rounded-3xl p-7">
            <h2 className="pb-3 text-lg font-bold border-b text-heading border-border/40">
              Course Info
            </h2>

            {/* Title */}
            <div>
              <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-muted">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
                disabled={isLocked}
                placeholder="Course title (max 60 chars)"
                className="w-full px-4 py-3 font-medium border rounded-xl bg-white/50 border-border/40 focus:outline-none focus:border-primary text-body disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-right text-muted">
                {title.length}/60
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-muted">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={isLocked}
                placeholder="What will students learn?"
                className="w-full px-4 py-3 font-medium border resize-none rounded-xl bg-white/50 border-border/40 focus:outline-none focus:border-primary text-body disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Category */}
              <div>
                <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-muted">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isLocked}
                  className="w-full px-4 py-3 font-medium border rounded-xl bg-white/50 border-border/40 focus:outline-none focus:border-primary text-body disabled:opacity-50"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-muted">
                  Level <span className="text-red-400">*</span>
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={isLocked}
                  className="w-full px-4 py-3 font-medium border rounded-xl bg-white/50 border-border/40 focus:outline-none focus:border-primary text-body disabled:opacity-50"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block mb-2 text-xs font-bold tracking-widest uppercase text-muted">
                  Price (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isLocked}
                  className="w-full px-4 py-3 font-medium border rounded-xl bg-white/50 border-border/40 focus:outline-none focus:border-primary text-body disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-muted">0 = Free</p>
              </div>
            </div>
          </div>

          {/* ── Curriculum ────────────────────────────────────────────── */}
          <div className="space-y-4 glass-card rounded-3xl p-7">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <h2 className="text-lg font-bold text-heading">Curriculum</h2>
              {!isLocked && (
                <button
                  onClick={addSection}
                  className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                >
                  <Icon name="plus" size={15} color="var(--color-primary)" />{" "}
                  Add Section
                </button>
              )}
            </div>

            {sections.length === 0 ? (
              <div className="py-10 text-center text-muted">
                <Icon name="book" size={32} color="var(--text-muted)" />
                <p className="mt-2 text-sm">
                  No sections yet. Add a section to start building your
                  curriculum.
                </p>
              </div>
            ) : (
              sections.map((sec, idx) => (
                <SectionEditor
                  key={idx}
                  section={sec}
                  idx={idx}
                  onChange={(updated) => updateSection(idx, updated)}
                  onRemove={() => removeSection(idx)}
                />
              ))
            )}
          </div>

          {/* ── Actions ───────────────────────────────────────────────── */}
          {!isLocked && (
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm glass-card hover:border-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 rounded-full border-primary border-t-transparent animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Draft"
                )}
              </button>
              <button
                onClick={handleSubmitForReview}
                disabled={submitting}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm btn-aurora flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit for Review"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CreateCoursePage;

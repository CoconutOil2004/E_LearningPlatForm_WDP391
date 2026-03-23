import { Form, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseService from "../../../services/api/CourseService";
import { ROUTES } from "../../../utils/constants";

/* ── Validation ──────────────────────────────────────────────────────────── */
export const validateCurriculum = (sections) => {
  if (!sections || sections.length === 0) {
    return "Please add at least 1 section to the curriculum.";
  }
  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    const secLabel = sec.title?.trim() || `Section ${si + 1}`;
    if (!sec.title?.trim()) {
      return `Section ${si + 1}: Please enter a section title.`;
    }
    if (!sec.items || sec.items.length === 0) {
      return `"${secLabel}": Each section must have at least 1 lesson or quiz.`;
    }
    for (let li = 0; li < sec.items.length; li++) {
      const item = sec.items[li];
      const itemLabel =
        item.title?.trim() ||
        (item.itemType === "quiz" ? `Quiz ${li + 1}` : `Lesson ${li + 1}`);
      if (!item.title?.trim()) {
        return `"${secLabel}" → Item ${li + 1}: Please enter a title.`;
      }
      if (item.itemType === "lesson" && !item.videoUrl) {
        return `"${secLabel}" → "${itemLabel}": Please upload a video for this lesson.`;
      }
      if (item.itemType === "quiz") {
        if (!item.questions || item.questions.length === 0) {
          return `"${secLabel}" → "${itemLabel}": Quiz must have at least 1 question.`;
        }
        for (let qi = 0; qi < item.questions.length; qi++) {
          const q = item.questions[qi];
          if (!q.text?.trim()) {
            return `"${secLabel}" → "${itemLabel}" → Question ${qi + 1}: Please enter question content.`;
          }
          if (!q.options || q.options.length < 2) {
            return `"${secLabel}" → "${itemLabel}" → Question ${qi + 1}: Must have at least 2 options.`;
          }
          if (q.options.some((o) => !o?.trim())) {
            return `"${secLabel}" → "${itemLabel}" → Question ${qi + 1}: All options must be filled in.`;
          }
          if (q.correctAnswer === undefined || q.correctAnswer === null) {
            return `"${secLabel}" → "${itemLabel}" → Question ${qi + 1}: Please select a correct answer.`;
          }
        }
      }
    }
  }
  return null;
};

/* ── Build sections payload for BE ──────────────────────────────────────── */
const buildSections = (sections) =>
  sections.map((sec, si) => ({
    title: sec.title || `Section ${si + 1}`,
    items: sec.items.map((it, ii) => ({
      itemType: it.itemType ?? "lesson",
      itemRef: it.itemType === "quiz" ? "Quiz" : "Lesson",
      title:
        it.title ||
        (it.itemType === "quiz" ? `Quiz ${ii + 1}` : `Lesson ${ii + 1}`),
      orderIndex: ii + 1,
      ...(it.itemId && { itemId: it.itemId }),
      ...(it.itemType === "lesson" && {
        ...(it.videoUrl && { videoUrl: it.videoUrl }),
        ...(it.videoPublicId && { videoPublicId: it.videoPublicId }),
        ...(it.duration && { duration: it.duration }),
      }),
      ...(it.itemType === "quiz" && { questions: it.questions ?? [] }),
    })),
  }));

/* ── Hook ─────────────────────────────────────────────────────────────────── */
/**
 * useCourseForm
 * Tách toàn bộ business-logic (load, save draft, submit) ra khỏi UI component.
 */
const useCourseForm = () => {
  const { id: editId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(editId);

  const [form] = Form.useForm();
  const [sections, setSections] = useState([]);
  const [status, setStatus] = useState("draft");
  const [courseId, setCourseId] = useState(editId ?? null);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadingCount, setUploadingCount] = useState(0);
  const [curriculumError, setCurriculumError] = useState(null);
  const [showSectionErrors, setShowSectionErrors] = useState(false);

  const incUploading = useCallback(() => setUploadingCount((c) => c + 1), []);
  const decUploading = useCallback(
    () => setUploadingCount((c) => Math.max(0, c - 1)),
    [],
  );

  const isLocked = ["pending", "published"].includes(status);

  // ── Load categories ──────────────────────────────────────────────────────
  useEffect(() => {
    CourseService.getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // ── Load course data for edit mode ───────────────────────────────────────
  useEffect(() => {
    if (!editId) return;
    CourseService.getCourseDetail(editId)
      .then(({ course: c }) => {
        if (!c) return;
        form.setFieldsValue({
          title: c.title ?? "",
          description: c.description ?? "",
          categoryId: c.category?._id ?? c.category ?? "",
          level: c.level ?? "Beginner",
          price: c.price ?? 0,
          thumbnail: c.thumbnail ?? "",
        });
        setThumbnailUrl(c.thumbnail ?? "");
        setStatus(c.status ?? "draft");
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
            questions: it.itemId?.questions ?? [],
          })),
        }));
        setSections(rebuilt);
      })
      .catch(() => message.error("Failed to load course"));
  }, [editId, form]);

  // ── Re-validate curriculum live (only after first submit attempt) ────────
  useEffect(() => {
    if (showSectionErrors) {
      setCurriculumError(validateCurriculum(sections));
    }
  }, [sections, showSectionErrors]);

  // ── Section mutations ─────────────────────────────────────────────────────
  const addSection = () =>
    setSections((prev) => [...prev, { title: "", items: [] }]);
  const updateSection = (idx, sec) =>
    setSections((prev) => prev.map((s, i) => (i === idx ? sec : s)));
  const removeSection = (idx) =>
    setSections((prev) => prev.filter((_, i) => i !== idx));

  // ── Core save helper ──────────────────────────────────────────────────────
  /**
   * saveAndGetId
   * - Nếu đã có courseId (edit mode) → PUT /courses/:id để cập nhật thông tin + sections
   * - Nếu chưa có courseId (create mode) → POST /courses với đầy đủ data (metadata + sections)
   *   trong 1 request duy nhất, không còn double-trip create → update.
   *
   * @param {object} values - form values
   * @param {boolean} [includeSubmit=false] - nếu true, truyền submitForReview=true vào createCourse
   * @returns {Promise<string>} courseId
   */
  const saveAndGetId = async (values, includeSubmit = false) => {
    let id = courseId;

    if (!id) {
      // ── Create mode: gửi metadata + sections + (tuỳ chọn) submitForReview trong 1 lần ──
      const created = await CourseService.createCourse({
        title: values.title.trim(),
        description: values.description,
        categoryId: values.categoryId,
        level: values.level,
        price: Number(values.price || 0),
        language: values.language || "English",
        thumbnail: values.thumbnail || thumbnailUrl || null,
        sections: buildSections(sections),
        submitForReview: includeSubmit,
      });
      if (!created) throw new Error("Failed to create course");
      id = created._id;
      setCourseId(id);
    } else {
      // ── Edit mode: chỉ update, không submit ở đây ────────────────────────
      await CourseService.updateCourse(id, {
        title: values.title.trim(),
        description: values.description,
        categoryId: values.categoryId,
        level: values.level,
        price: Number(values.price || 0),
        language: values.language,
        thumbnail: values.thumbnail || thumbnailUrl,
        sections: buildSections(sections),
      });
    }

    return id;
  };

  // ── Save Draft ────────────────────────────────────────────────────────────
  /**
   * handleSaveDraft
   * Chỉ validate form fields cơ bản, không bắt buộc có curriculum.
   * Create mode: POST /courses (metadata + sections hiện tại, status="draft")
   * Edit mode:   PUT /courses/:id
   */
  const handleSaveDraft = async () => {
    if (uploadingCount > 0) {
      message.warning(
        `Please wait for ${uploadingCount} video(s) to finish uploading before saving.`,
      );
      return;
    }
    try {
      const values = await form.validateFields();
      setSaving(true);
      await saveAndGetId(values, false);
      navigate(-1);
    } catch (err) {
      if (err?.errorFields) return; // Ant Design validation error — đã hiển thị trên form
      message.error("Failed to save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Submit for Review ─────────────────────────────────────────────────────
  /**
   * handleSubmitForReview
   * Create mode: POST /courses với submitForReview=true → 1 API duy nhất
   *              (tạo course + sections + set status="pending" trong BE)
   * Edit mode:   PUT /courses/:id → rồi PUT /courses/:id/submit (2 API, cần thiết)
   */
  const handleSubmitForReview = async () => {
    if (uploadingCount > 0) {
      message.warning(
        `Please wait for ${uploadingCount} video(s) to finish uploading.`,
      );
      return;
    }

    // Bật hiển thị lỗi inline trên SectionEditor
    setShowSectionErrors(true);

    const currErr = validateCurriculum(sections);
    setCurriculumError(currErr);
    if (currErr) {
      message.error(currErr);
      document
        .getElementById("curriculum-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (!courseId) {
        // ── Create mode: 1 API duy nhất ──────────────────────────────────
        // saveAndGetId với includeSubmit=true → POST /courses { submitForReview: true }
        await saveAndGetId(values, true);
      } else {
        // ── Edit mode: update rồi submit riêng ───────────────────────────
        const id = await saveAndGetId(values, false);
        await CourseService.submitCourse(id);
      }

      setStatus("pending");
      navigate(ROUTES.INSTRUCTOR_COURSES);
    } catch (err) {
      if (err?.errorFields) {
        message.error("Please fill in all required fields.");
        return;
      }
      message.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    // Form
    form,
    isEdit,
    status,
    // Data
    sections,
    categories,
    thumbnailUrl,
    setThumbnailUrl,
    // Loading states
    saving,
    submitting,
    uploadingCount,
    incUploading,
    decUploading,
    // Validation
    curriculumError,
    showSectionErrors,
    // Section mutations
    addSection,
    updateSection,
    removeSection,
    // Actions
    handleSaveDraft,
    handleSubmitForReview,
  };
};

export default useCourseForm;

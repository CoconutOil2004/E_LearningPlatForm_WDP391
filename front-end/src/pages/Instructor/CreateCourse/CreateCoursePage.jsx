import { Alert, Form } from "antd";
import { motion } from "framer-motion";
import { INSTRUCTOR_STATUS_CONFIG } from "../../../../src/styles/instructorTheme";
import { pageVariants } from "../../../utils/helpers";
import CourseBasicInfoForm from "./CourseBasicInfoForm";
import CourseCurriculumSection from "./CourseCurriculumSection";
import CourseFormHeader from "./CourseFormHeader";
import { UploadingProvider } from "./UploadingContext";
import useCourseForm from "./useCourseForm";

/**
 * CreateCoursePage (refactored)
 *
 * Cấu trúc file đã được tách nhỏ:
 * ├── CreateCoursePage.jsx       ← File này (entry point, layout)
 * ├── useCourseForm.js           ← Toàn bộ business logic
 * ├── CourseFormHeader.jsx       ← Header + Save/Submit buttons
 * ├── CourseBasicInfoForm.jsx    ← Section "Basic Information"
 * ├── CourseCurriculumSection.jsx← Section "Curriculum"
 * ├── SectionEditor.jsx          ← 1 section (title + items)
 * ├── VideoUploadCell.jsx        ← Upload video cho 1 lesson
 * ├── QuestionEditor.jsx         ← 1 câu hỏi quiz
 * └── UploadingContext.jsx       ← Context đếm số video đang upload
 */
const CreateCoursePage = () => {
  const {
    form,
    isEdit,
    status,
    sections,
    categories,
    thumbnailUrl,
    setThumbnailUrl,
    saving,
    submitting,
    uploadingCount,
    incUploading,
    decUploading,
    curriculumError,
    showSectionErrors,
    addSection,
    updateSection,
    removeSection,
    handleSaveDraft,
    handleSubmitForReview,
  } = useCourseForm();

  const isLocked = ["pending", "published"].includes(status);
  const currentStatus =
    INSTRUCTOR_STATUS_CONFIG[status] || INSTRUCTOR_STATUS_CONFIG.draft;

  return (
    // UploadingProvider cung cấp context đếm video đang upload cho VideoUploadCell
    <UploadingProvider
      uploadingCount={uploadingCount}
      inc={incUploading}
      dec={decUploading}
    >
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="pb-20"
      >
        <div className="max-w-5xl px-6 py-10 mx-auto">
          {/* ── Header: back button + status badge + Save/Submit ── */}
          <CourseFormHeader
            isEdit={isEdit}
            status={status}
            saving={saving}
            submitting={submitting}
            uploadingCount={uploadingCount}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmitForReview}
          />

          {/* ── Locked course warning ── */}
          {isLocked && (
            <Alert
              message={`Course is currently "${currentStatus.label}" — content cannot be edited at this time.`}
              type="warning"
              showIcon
              className="mb-6 rounded-xl border-amber-200 bg-amber-50"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            disabled={isLocked}
            requiredMark={false}
          >
            {/* ── Section 1: Basic Information ── */}
            <CourseBasicInfoForm
              form={form}
              categories={categories}
              thumbnailUrl={thumbnailUrl}
              setThumbnailUrl={setThumbnailUrl}
              isLocked={isLocked}
            />

            {/* ── Section 2: Curriculum ── */}
            <CourseCurriculumSection
              sections={sections}
              onAddSection={addSection}
              onUpdateSection={updateSection}
              onRemoveSection={removeSection}
              isLocked={isLocked}
              uploadingCount={uploadingCount}
              curriculumError={curriculumError}
              showSectionErrors={showSectionErrors}
            />
          </Form>
        </div>
      </motion.div>
    </UploadingProvider>
  );
};

export default CreateCoursePage;

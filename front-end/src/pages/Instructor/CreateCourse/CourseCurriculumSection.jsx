import {
  BookOutlined,
  LoadingOutlined,
  PlusOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Alert, Button } from "antd";
import { INSTRUCTOR_COLORS } from "../../../../src/styles/instructorTheme";
import SectionEditor from "./SectionEditor";

/**
 * CourseCurriculumSection
 * Phần "Curriculum" trong CreateCoursePage.
 * - Hiển thị upload-in-progress banner
 * - Render danh sách SectionEditor
 * - Nút thêm section mới
 * - Hiển thị lỗi curriculum
 */
const CourseCurriculumSection = ({
  sections,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  isLocked,
  uploadingCount,
  curriculumError,
  showSectionErrors,
}) => {
  return (
    <div
      id="curriculum-section"
      className="p-8 mb-8 bg-white border border-gray-100 shadow-sm rounded-2xl"
      style={{
        position: "relative",
        borderColor: curriculumError ? "#fca5a5" : undefined,
      }}
    >
      {/* ── Upload-in-progress banner ── */}
      {uploadingCount > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            background: "linear-gradient(135deg, #7c3aed, #6366f1)",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#fff",
          }}
        >
          <LoadingOutlined spin style={{ fontSize: 16 }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            Uploading {uploadingCount} video...
          </span>
        </div>
      )}
      {uploadingCount > 0 && <div style={{ height: 40 }} />}

      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center gap-2 m-0 text-xl font-bold text-gray-900">
            <VideoCameraOutlined style={{ color: INSTRUCTOR_COLORS.accent }} />{" "}
            Curriculum <span className="text-red-500">*</span>
          </h2>
          <p className="m-0 mt-1 text-xs text-gray-400">
            At least 1 section · Each section must have at least 1 lesson or
            quiz
          </p>
        </div>
        {!isLocked && (
          <button
            type="button"
            onClick={() => uploadingCount === 0 && onAddSection()}
            disabled={uploadingCount > 0}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl transition-colors ${
              uploadingCount > 0
                ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400"
                : "text-purple-600 bg-purple-50 hover:bg-purple-100"
            }`}
          >
            <PlusOutlined /> Add new section
          </button>
        )}
      </div>

      {/* ── Curriculum-level error banner ── */}
      {curriculumError && (
        <Alert
          message={curriculumError}
          type="error"
          showIcon
          className="mb-4 rounded-xl"
        />
      )}

      {/* ── Empty state ── */}
      {sections.length === 0 ? (
        <div
          className={`py-16 text-center border-2 border-dashed rounded-2xl bg-gray-50 ${
            curriculumError ? "border-red-300" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white rounded-full shadow-sm">
            <BookOutlined className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700">No content yet</h3>
          <p className="mt-1 text-gray-500">
            Start by adding your first section.
          </p>
          {!isLocked && (
            <Button
              type="primary"
              className="mt-4 border-none rounded-lg"
              style={{ background: INSTRUCTOR_COLORS.primary }}
              icon={<PlusOutlined />}
              onClick={onAddSection}
            >
              Add Section
            </Button>
          )}
        </div>
      ) : (
        sections.map((sec, idx) => (
          <SectionEditor
            key={idx}
            section={sec}
            idx={idx}
            onChange={(updated) => onUpdateSection(idx, updated)}
            onRemove={() => onRemoveSection(idx)}
            isLocked={isLocked}
            isUploading={uploadingCount > 0}
            showErrors={showSectionErrors}
          />
        ))
      )}
    </div>
  );
};

export default CourseCurriculumSection;

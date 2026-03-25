import {
  ArrowLeftOutlined,
  LoadingOutlined,
  SaveOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Tooltip, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import {
  INSTRUCTOR_COLORS,
  INSTRUCTOR_STATUS_CONFIG,
} from "../../../../src/styles/instructorTheme";
import { ROUTES } from "../../../utils/constants";

const { Title, Text } = Typography;

/**
 * CourseFormHeader
 * Thanh header của CreateCoursePage:
 * - Nút back
 * - Tiêu đề trang + status badge
 * - Nút Save Draft + Submit
 */
const CourseFormHeader = ({
  isEdit,
  status,
  saving,
  submitting,
  uploadingCount,
  onSaveDraft,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const isLocked = ["pending", "published"].includes(status);
  const currentStatus =
    INSTRUCTOR_STATUS_CONFIG[status] || INSTRUCTOR_STATUS_CONFIG.draft;

  return (
    <div className="flex items-center justify-between px-6 py-6 mb-10 bg-white border-b border-gray-100 shadow-sm rounded-2xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
          className="flex items-center justify-center w-10 h-10 transition-all bg-white border border-gray-200 shadow-sm rounded-xl hover:border-purple-300 hover:text-purple-600"
        >
          <ArrowLeftOutlined />
        </button>
        <div>
          <Title level={2} className="m-0 font-black text-gray-900 !text-2xl">
            {isEdit ? "Edit Course" : "Create New Course"}
          </Title>
          <Text type="secondary" className="text-xs">
            Build your course curriculum
          </Text>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status badge */}
        {status && (
          <div
            className="px-3 py-1.5 text-xs font-bold border shadow-sm rounded-lg mr-2"
            style={{
              backgroundColor: currentStatus.bg,
              color: currentStatus.text,
              borderColor: currentStatus.border,
            }}
          >
            {currentStatus.label}
          </div>
        )}

        {/* Action buttons — hidden when locked */}
        {!isLocked && (
          <div className="flex items-center gap-2">
            <Tooltip
              title={
                uploadingCount > 0
                  ? `Uploading ${uploadingCount} video, please wait...`
                  : ""
              }
            >
              <Button
                size="middle"
                icon={
                  uploadingCount > 0 ? (
                    <LoadingOutlined spin />
                  ) : (
                    <SaveOutlined />
                  )
                }
                loading={saving}
                disabled={uploadingCount > 0}
                onClick={onSaveDraft}
                className="h-10 px-4 font-semibold text-gray-700 border-gray-300 rounded-lg hover:text-purple-600 hover:border-purple-300"
              >
                {uploadingCount > 0
                  ? `Uploading (${uploadingCount})`
                  : "Save Draft"}
              </Button>
            </Tooltip>

            <Tooltip
              title={
                uploadingCount > 0
                  ? `Wait for ${uploadingCount} video(s) to finish`
                  : ""
              }
            >
              <button
                onClick={onSubmit}
                disabled={submitting || uploadingCount > 0}
                className="flex items-center gap-2 px-6 py-2 font-bold text-white transition-all transform shadow-md rounded-lg hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed h-10 text-sm"
                style={{
                  background: `linear-gradient(135deg, ${INSTRUCTOR_COLORS.primary}, ${INSTRUCTOR_COLORS.primaryDark})`,
                }}
              >
                {submitting ? (
                  <SaveOutlined className="animate-spin" />
                ) : (
                  <SendOutlined />
                )}
                Submit for Review
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseFormHeader;

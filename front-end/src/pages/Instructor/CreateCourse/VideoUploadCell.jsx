import {
  CheckCircleOutlined,
  CloseOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Progress, message } from "antd";
import { useRef, useState } from "react";
import { INSTRUCTOR_COLORS } from "../../../../src/styles/instructorTheme";
import CourseService from "../../../services/api/CourseService";
import { useUploading } from "./UploadingContext";

/**
 * VideoUploadCell
 * Hiển thị trạng thái upload video của 1 lesson.
 * - Nếu đã có videoUrl: hiện badge "Video uploaded" + nút xóa
 * - Nếu chưa: hiện nút "Upload video" + progress bar khi đang upload
 */
const VideoUploadCell = ({ lesson, onUploaded }) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();
  const { inc, dec } = useUploading();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    inc();
    try {
      const res = await CourseService.uploadVideo(file, setProgress);
      if (res) onUploaded(res);
    } catch {
      message.error("Failed to upload video");
    } finally {
      setUploading(false);
      setProgress(0);
      dec();
      e.target.value = "";
    }
  };

  if (lesson.videoUrl)
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200 shrink-0">
        <CheckCircleOutlined className="text-green-500" />
        <span className="text-xs font-semibold text-green-600">
          Video uploaded
        </span>
        <button
          type="button"
          className="flex items-center justify-center w-5 h-5 ml-1 text-red-400 transition-colors rounded hover:text-red-600 hover:bg-red-100"
          onClick={() => onUploaded(null)}
        >
          <CloseOutlined className="text-[10px]" />
        </button>
      </div>
    );

  return (
    <div className="flex items-center shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      {uploading ? (
        <div className="flex items-center w-32 px-2">
          <Progress
            percent={progress}
            size="small"
            strokeColor={INSTRUCTOR_COLORS.primary}
            className="m-0"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-600 transition-colors border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100 hover:border-purple-300"
        >
          <VideoCameraOutlined /> Upload video
        </button>
      )}
    </div>
  );
};

export default VideoUploadCell;

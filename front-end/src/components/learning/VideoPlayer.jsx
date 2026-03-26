import { PlayCircleOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const { Text } = Typography;

/**
 * VideoPlayer (HTML5 native)
 *
 * Anti-cheat rules:
 *  1. Không tua vượt quá highestWatched → snap back + hiện toast cảnh báo overlay.
 *  2. Sau khi xem đủ threshold% (mặc định 30%) → gọi onReachedThreshold() 1 lần.
 *  3. Khi video kết thúc → gọi onEnded().
 *
 * Props:
 *  url                – string | undefined
 *  lessonKey          – unique key để reset player khi chuyển bài
 *  initialWatched     – số giây đã xem từ server (để restore progress)
 *  threshold          – % để đánh dấu done (mặc định 0.3 = 30%)
 *  onReachedThreshold – () => void
 *  onEnded            – () => void
 *  onTimeUpdate       – (currentTime, duration) => void
 *
 * Ref: getWatchedSeconds() → number
 */
const VideoPlayer = forwardRef(function VideoPlayer(
  {
    url,
    lessonKey,
    initialWatched = 0,
    threshold = 0.3,
    onReachedThreshold,
    onEnded,
    onTimeUpdate,
  },
  ref,
) {
  const videoRef = useRef(null);
  // Số giây cao nhất đã thực sự xem (chỉ tăng khi video đang PLAY, không phải khi seeking)
  const highestWatchedRef = useRef(initialWatched);
  const thresholdFiredRef = useRef(false);
  // Snapshot highestWatched tại thời điểm onSeeking bắt đầu — dùng để so sánh trong onSeeked
  const watchedAtSeekStartRef = useRef(initialWatched);
  // Flag: đang trong quá trình snap back (tránh vòng lặp seeking → seeked → seeking)
  const isSnappingRef = useRef(false);

  const [showNoVideo, setShowNoVideo] = useState(!url);

  // Toast cảnh báo overlay trên video
  const [toast, setToast] = useState(null); // { msg, key }
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, key: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  // Reset khi chuyển bài
  useEffect(() => {
    highestWatchedRef.current = initialWatched;
    thresholdFiredRef.current = false;
    watchedAtSeekStartRef.current = initialWatched;
    isSnappingRef.current = false;
    setShowNoVideo(!url);
    setToast(null);
    clearTimeout(toastTimerRef.current);
  }, [lessonKey, url, initialWatched]);

  // Restore currentTime từ server watchedSeconds khi load metadata
  useEffect(() => {
    if (!videoRef.current || !initialWatched) return;
    const video = videoRef.current;
    const onLoaded = () => {
      if (initialWatched > 0 && video.duration > 0) {
        // Nếu đã xem xong (watchedSeconds >= 95% duration) → rewatch từ đầu
        const isCompleted = initialWatched >= video.duration * 0.95;
        if (isCompleted) {
          // Rewatch mode: reset về đầu, cho phép tua tự do toàn bộ video
          highestWatchedRef.current = video.duration;
          watchedAtSeekStartRef.current = video.duration;
          video.currentTime = 0;
        } else {
          const restoreTo = Math.min(initialWatched, video.duration * 0.98);
          video.currentTime = restoreTo;
        }
      }
    };
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [lessonKey, initialWatched]);

  useImperativeHandle(ref, () => ({
    getWatchedSeconds: () => highestWatchedRef.current,
  }));

  // Cập nhật highestWatched khi video chạy bình thường
  // QUAN TRỌNG: bỏ qua hoàn toàn khi video.seeking = true hoặc đang snap
  // để tránh highestWatched bị cập nhật trong lúc user đang kéo thanh seek
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused || video.seeking || isSnappingRef.current)
      return;

    const current = video.currentTime;
    const duration = video.duration;

    if (current > highestWatchedRef.current) {
      highestWatchedRef.current = current;
    }

    onTimeUpdate?.(current, duration);

    if (!thresholdFiredRef.current && duration > 0) {
      if (highestWatchedRef.current / duration >= threshold) {
        thresholdFiredRef.current = true;
        onReachedThreshold?.();
      }
    }
  }, [onReachedThreshold, onTimeUpdate, threshold]);

  // Ghi lại snapshot của highestWatched tại thời điểm seek BẮT ĐẦU
  // (trước khi highestWatched có thể bị ảnh hưởng bởi bất kỳ event nào khác)
  const handleSeeking = useCallback(() => {
    if (isSnappingRef.current) return; // đang snap back → bỏ qua
    // Freeze snapshot — đây là "điểm tối đa được phép" cho lần seek này
    watchedAtSeekStartRef.current = highestWatchedRef.current;
  }, []);

  // Sau khi seek xong → so sánh với snapshot đã freeze ở onSeeking
  const handleSeeked = useCallback(() => {
    if (isSnappingRef.current) {
      isSnappingRef.current = false;
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    const seekedTo = video.currentTime;
    // Dùng snapshot đã đóng băng lúc seeking bắt đầu, không phải giá trị hiện tại
    const maxAllowed = watchedAtSeekStartRef.current;

    // Buffer 0.3s để tránh false positive khi click chính xác vào thanh seek
    if (seekedTo > maxAllowed + 0.3) {
      isSnappingRef.current = true;
      video.currentTime = maxAllowed;

      const overBy = Math.round(seekedTo - maxAllowed);
      showToast(
        `⛔ Không thể tua vượt! Quay lại ${formatTime(maxAllowed)} (tua thêm ~${overBy}s)`,
      );
    }
  }, [showToast]);

  const handleEnded = useCallback(() => {
    if (!thresholdFiredRef.current) {
      thresholdFiredRef.current = true;
      onReachedThreshold?.();
    }
    onEnded?.();
  }, [onReachedThreshold, onEnded]);

  if (showNoVideo || !url) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          gap: 12,
        }}
      >
        <PlayCircleOutlined
          style={{ fontSize: 48, color: "rgba(255,255,255,0.2)" }}
        />
        <Text style={{ color: "rgba(255,255,255,0.5)" }}>
          This lesson has no video yet
        </Text>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <video
        key={lessonKey}
        ref={videoRef}
        src={url}
        controls
        autoPlay
        controlsList="nodownload nofullscreen"
        disablePictureInPicture
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
        onEnded={handleEnded}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "calc(100vh - 130px)",
          objectFit: "contain",
          outline: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Anti-cheat hint cố định góc phải */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          right: 16,
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        🔒 Chỉ tua đến điểm đã xem
      </div>

      {/* Toast cảnh báo khi tua quá — nổi bật trung tâm */}
      {toast && (
        <div
          key={toast.key}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(239,68,68,0.92)",
            backdropFilter: "blur(6px)",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
            maxWidth: 380,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            pointerEvents: "none",
            userSelect: "none",
            animation: "fadeInPop 0.2s ease",
            zIndex: 10,
            lineHeight: 1.5,
          }}
        >
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeInPop {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.93); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
});

/** Định dạng giây → mm:ss */
function formatTime(secs) {
  const s = Math.floor(secs);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export default VideoPlayer;

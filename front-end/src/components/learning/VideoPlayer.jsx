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
 *  1. Chặn tua hoàn toàn cho đến khi xem đủ thresholdSeconds giây thực sự.
 *     "Thực sự" = tổng số giây cao nhất đã phát liên tục, không tính tua.
 *     Sau khi đủ thresholdSeconds → tua tự do trong toàn bộ video.
 *  2. initialWatched từ server được tính vào highestWatched.
 *     Nếu initialWatched >= thresholdSeconds → mở khóa tua ngay từ đầu.
 *     Nếu chưa đủ → người dùng phải xem tiếp cho đến khi tổng đạt threshold.
 *  3. Sau khi đủ thresholdSeconds → gọi onReachedThreshold() 1 lần.
 *  4. Khi video kết thúc → gọi onEnded().
 *
 * Props:
 *  url                – string | undefined
 *  lessonKey          – unique key để reset player khi chuyển bài
 *  initialWatched     – số giây đã xem từ server (để restore progress)
 *  thresholdSeconds   – số giây tuyệt đối để mở khóa tua & nút Complete (mặc định 30)
 *  onReachedThreshold – () => void  — fired khi đủ thresholdSeconds
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
    thresholdSeconds, // deprecated – kept for compat
    thresholdPercent = 0.3, // 30% of video duration (min 30s if video is long)
    onReachedThreshold,
    onEnded,
    onTimeUpdate,
  },
  ref,
) {
  const videoRef = useRef(null);

  // Effective threshold in seconds — computed once video metadata is available
  // Falls back to thresholdSeconds prop if supplied (legacy), else 30s initially.
  const effectiveThresholdRef = useRef(thresholdSeconds ?? 30);

  // Số giây cao nhất đã thực sự xem (chỉ tăng khi PLAY, không seeking)
  // Khởi tạo từ initialWatched — tiếp tục từ điểm server đã ghi nhận
  const highestWatchedRef = useRef(initialWatched);

  // true nếu đã fire onReachedThreshold (tránh fire nhiều lần)
  const thresholdFiredRef = useRef(false);

  // Snapshot highestWatched tại thời điểm seeking bắt đầu
  const watchedAtSeekStartRef = useRef(initialWatched);

  // Flag: đang snap back (tránh vòng lặp seeking → seeked → seeking)
  const isSnappingRef = useRef(false);

  const [showNoVideo, setShowNoVideo] = useState(!url);

  // Toast cảnh báo overlay
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, key: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  // Reset khi chuyển bài (lessonKey thay đổi)
  useEffect(() => {
    highestWatchedRef.current = initialWatched;
    watchedAtSeekStartRef.current = initialWatched;
    isSnappingRef.current = false;
    // Reset threshold về default cho đến khi metadata load
    effectiveThresholdRef.current = thresholdSeconds ?? 30;
    setShowNoVideo(!url);
    setToast(null);
    clearTimeout(toastTimerRef.current);

    // Nếu server đã ghi nhận >= threshold → fire ngay để mở khóa nút Complete
    if (initialWatched >= effectiveThresholdRef.current) {
      thresholdFiredRef.current = true;
      onReachedThreshold?.();
    } else {
      thresholdFiredRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonKey]); // Chỉ chạy khi chuyển bài. Các deps khác là config ổn định.

  // Restore currentTime từ server watchedSeconds khi video load metadata
  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const onLoaded = () => {
      if (video.duration > 0) {
        // Tính threshold động: 30% thời lượng, tối đa 30s
        const dynThreshold = Math.min(video.duration * thresholdPercent, 30);
        effectiveThresholdRef.current = dynThreshold;

        // Nếu initialWatched đạt ngưỡng mới → fire ngay
        if (!thresholdFiredRef.current && initialWatched >= dynThreshold) {
          thresholdFiredRef.current = true;
          onReachedThreshold?.();
        }

        if (initialWatched > 0) {
          const isCompleted = initialWatched >= video.duration * 0.95;
          if (isCompleted) {
            // Đã xem gần hết / hoàn thành → reset về đầu, tua tự do
            highestWatchedRef.current = video.duration;
            watchedAtSeekStartRef.current = video.duration;
            thresholdFiredRef.current = true;
            video.currentTime = 0;
          } else {
            // Restore về đúng điểm đã xem
            const restoreTo = Math.min(initialWatched, video.duration * 0.98);
            video.currentTime = restoreTo;
          }
        }
      }
    };
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [lessonKey, initialWatched, thresholdPercent, onReachedThreshold]);

  useImperativeHandle(ref, () => ({
    getWatchedSeconds: () => highestWatchedRef.current,
  }));

  // Cập nhật highestWatched khi video phát bình thường (không tua)
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused || video.seeking || isSnappingRef.current)
      return;

    const current = video.currentTime;
    const duration = video.duration;

    // Chỉ tăng, không giảm
    if (current > highestWatchedRef.current) {
      highestWatchedRef.current = current;
    }

    onTimeUpdate?.(current, duration);

    // Kiểm tra đã đủ threshold chưa
    if (
      !thresholdFiredRef.current &&
      highestWatchedRef.current >= effectiveThresholdRef.current
    ) {
      thresholdFiredRef.current = true;
      onReachedThreshold?.();
    }
  }, [onReachedThreshold, onTimeUpdate]);

  // Ghi snapshot highestWatched tại thời điểm seek BẮT ĐẦU
  const handleSeeking = useCallback(() => {
    if (isSnappingRef.current) return;
    watchedAtSeekStartRef.current = highestWatchedRef.current;
  }, []);

  // Sau khi seek xong → kiểm tra có được phép tua không
  const handleSeeked = useCallback(() => {
    if (isSnappingRef.current) {
      isSnappingRef.current = false;
      // Clamp highestWatched về đúng vị trí snap
      highestWatchedRef.current = watchedAtSeekStartRef.current;
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Đã xem đủ threshold (kể cả từ initialWatched) → tua tự do
    if (highestWatchedRef.current >= effectiveThresholdRef.current) return;

    const seekedTo = video.currentTime;
    const maxAllowed = watchedAtSeekStartRef.current;

    // Chưa đủ threshold → chặn tua vượt quá điểm cao nhất đã xem
    if (seekedTo > maxAllowed + 0.3) {
      isSnappingRef.current = true;
      highestWatchedRef.current = maxAllowed;
      video.currentTime = maxAllowed;

      const remaining = Math.ceil(effectiveThresholdRef.current - maxAllowed);
      showToast(`⛔ Xem thêm ~${remaining}s nữa để mở khóa tua video`);
    }
  }, [showToast]);

  // Khi video kết thúc tự nhiên
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

export default VideoPlayer;

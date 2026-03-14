import { PlayCircleOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

const { Text } = Typography;

/**
 * VideoPlayer (HTML5 native — không dùng ReactPlayer)
 *
 * Anti-cheat rules:
 *  1. Cho phép tua TỰ DO nhưng KHÔNG được tua vượt quá điểm cao nhất đã xem
 *     (highestWatched). Nếu seeked > highestWatched → snap back.
 *  2. Sau khi xem đủ 80% tổng thời lượng → gọi onReached80() (1 lần duy nhất).
 *  3. Khi video kết thúc (ended) → gọi onEnded().
 *
 * Props:
 *  url           – string | undefined
 *  lessonKey     – unique key để reset player khi chuyển bài (VD: flatIdx)
 *  onReached80   – () => void   → triggered một lần khi watched ≥ 80%
 *  onEnded       – () => void   → triggered khi video kết thúc hoàn toàn
 */
const VideoPlayer = ({ url, lessonKey, onReached80, onEnded }) => {
  const videoRef = useRef(null);

  // highestWatched: số giây cao nhất người dùng đã thực sự xem đến
  const highestWatchedRef = useRef(0);
  // tránh gọi onReached80 nhiều lần
  const reached80Fired = useRef(false);
  // lưu thời điểm seek bắt đầu để detect seek quá xa
  const lastTimeRef = useRef(0);

  const [showNoVideo, setShowNoVideo] = useState(!url);

  // Reset state khi chuyển bài
  useEffect(() => {
    highestWatchedRef.current = 0;
    reached80Fired.current = false;
    lastTimeRef.current = 0;
    setShowNoVideo(!url);
  }, [lessonKey, url]);

  /** Cập nhật highestWatched liên tục khi video đang chạy bình thường */
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused) return;

    const current = video.currentTime;
    const duration = video.duration;

    // Cập nhật cao điểm đã xem
    if (current > highestWatchedRef.current) {
      highestWatchedRef.current = current;
      lastTimeRef.current = current;
    }

    // Kiểm tra đạt 80%
    if (!reached80Fired.current && duration > 0) {
      const watchedPct = highestWatchedRef.current / duration;
      if (watchedPct >= 0.8) {
        reached80Fired.current = true;
        onReached80?.();
      }
    }
  }, [onReached80]);

  /**
   * Anti-cheat: khi người dùng seek, kiểm tra xem vị trí mới có vượt
   * highestWatched không. Nếu vượt → snap về highestWatched.
   * Cho phép seek NGƯỢC (backward) tự do.
   */
  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const seekedTo = video.currentTime;
    const maxAllowed = highestWatchedRef.current;

    if (seekedTo > maxAllowed + 0.5) {
      // +0.5s buffer tránh giật liên tục
      video.currentTime = maxAllowed;
    }
  }, []);

  const handleEnded = useCallback(() => {
    // Đảm bảo 80% đã fire trước khi báo ended
    if (!reached80Fired.current) {
      reached80Fired.current = true;
      onReached80?.();
    }
    onEnded?.();
  }, [onReached80, onEnded]);

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
        key={lessonKey} // force remount khi đổi bài
        ref={videoRef}
        src={url}
        controls
        autoPlay
        controlsList="nodownload nofullscreen" // bỏ nút tải về
        disablePictureInPicture
        onTimeUpdate={handleTimeUpdate}
        onSeeked={handleSeeked}
        onEnded={handleEnded}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "calc(100vh - 130px)",
          objectFit: "contain",
          outline: "none",
        }}
        // Chặn context menu chuột phải để tránh "save video"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Anti-cheat overlay tooltip */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 16,
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        🔒 Tua tối đa đến điểm đã xem
      </div>
    </div>
  );
};

export default VideoPlayer;

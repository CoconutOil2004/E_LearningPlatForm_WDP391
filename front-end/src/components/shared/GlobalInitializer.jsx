import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import PaymentService from "../../services/api/PaymentService";
import useAuthStore from "../../store/slices/authStore";
import useCourseStore from "../../store/slices/courseStore";
import useNotificationStore from "../../store/slices/notificationStore";

/** Tránh toast/navigation trùng khi Strict Mode remount (ref trong component bị reset). */
let lastHandledPaymentLocation = "";

/**
 * GlobalInitializer — A headless component to handle app-wide initializations.
 * It sits in the RootLayout so it stays mounted during navigation.
 */
const GlobalInitializer = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchNotifications, setupSocket, disconnectSocket } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { enroll, setEnrolledCourseIds } = useCourseStore();

  /* VNPay (và callback tương tự) redirect về CLIENT_URL/?payment=... — không phải /courses/:id */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get("payment");
    if (!payment) return;

    const dedupe = `${location.pathname}${location.search}`;
    if (lastHandledPaymentLocation === dedupe) return;
    lastHandledPaymentLocation = dedupe;

    const courseIdParam = params.get("courseId");
    const invalidCourseId =
      !courseIdParam ||
      courseIdParam === "[object Object]" ||
      courseIdParam === "undefined";

    if (payment === "success") {
      if (!invalidCourseId) {
        toast.success(
          "Thanh toán thành công! Bạn có thể bắt đầu học ngay.",
        );
        enroll(courseIdParam);
        PaymentService.getEnrolledCourseIds()
          .then(setEnrolledCourseIds)
          .catch(() => {});
        navigate(`/courses/${courseIdParam}`, { replace: true });
      } else {
        toast.success("Thanh toán thành công!");
        navigate({ pathname: location.pathname, search: "" }, { replace: true });
      }
      return;
    }

    if (payment === "failed") {
      toast.error("Thanh toán thất bại. Vui lòng thử lại.");
      navigate({ pathname: location.pathname, search: "" }, { replace: true });
      return;
    }

    if (payment === "error") {
      toast.error("Đã xảy ra lỗi trong quá trình thanh toán.");
      navigate({ pathname: location.pathname, search: "" }, { replace: true });
    }
  }, [
    location.pathname,
    location.search,
    navigate,
    toast,
    enroll,
    setEnrolledCourseIds,
  ]);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (isAuthenticated && userId) {
      console.log("[GlobalInitializer] Initializing notifications for user:", userId);
      fetchNotifications();
      setupSocket(userId);
    } else {
      disconnectSocket();
    }

    // Cleanup on unmount (though this stays mounted mostly)
    return () => {
      // We don't necessarily want to disconnect on every re-render, 
      // the store handles the "if exists" check.
    };
  }, [isAuthenticated, user?._id, fetchNotifications, setupSocket, disconnectSocket]);

  return null; // This component doesn't render anything
};

export default GlobalInitializer;

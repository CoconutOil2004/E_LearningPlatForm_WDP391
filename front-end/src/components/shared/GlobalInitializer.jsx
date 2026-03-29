import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import PaymentService from "../../services/api/PaymentService";
import useAuthStore from "../../store/slices/authStore";
import useCourseStore from "../../store/slices/courseStore";
import useNotificationStore from "../../store/slices/notificationStore";

/** Prevent duplicate toasts/navigation during Strict Mode remount. */
let lastHandledPaymentLocation = "";

/**
 * GlobalInitializer — A headless component to handle app-wide initializations.
 * It sits in the RootLayout so it stays mounted during navigation.
 */
const GlobalInitializer = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchNotifications, setupSocket, disconnectSocket } =
    useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { enroll, setEnrolledCourseIds } = useCourseStore();

  /* VNPay (and similar callbacks) redirect to CLIENT_URL/?payment=... */
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
        enroll(courseIdParam);
        PaymentService.getEnrolledCourseIds()
          .then(setEnrolledCourseIds)
          .catch(() => {});
        navigate(`/courses/${courseIdParam}`, { replace: true });
      } else {
        navigate(
          { pathname: location.pathname, search: "" },
          { replace: true },
        );
      }
      return;
    }

    if (payment === "failed") {
      toast.error("Payment failed. Please try again.");
      navigate({ pathname: location.pathname, search: "" }, { replace: true });
      return;
    }

    if (payment === "error") {
      toast.error("An error occurred during the payment process.");
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
      fetchNotifications();
      setupSocket(userId);
    } else {
      disconnectSocket();
    }

    return () => {
      // Cleanup logic if necessary
    };
  }, [
    isAuthenticated,
    user?._id,
    fetchNotifications,
    setupSocket,
    disconnectSocket,
  ]);

  // Sync enrolled course IDs from server whenever user logs in
  useEffect(() => {
    if (!isAuthenticated) {
      setEnrolledCourseIds([]);
      return;
    }
    PaymentService.getEnrolledCourseIds()
      .then(setEnrolledCourseIds)
      .catch(() => {});
  }, [isAuthenticated, user?._id, setEnrolledCourseIds]);

  return null;
};

export default GlobalInitializer;

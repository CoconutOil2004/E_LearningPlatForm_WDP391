import { useEffect } from "react";
import useAuthStore from "../../store/slices/authStore";
import useNotificationStore from "../../store/slices/notificationStore";

/**
 * GlobalInitializer — A headless component to handle app-wide initializations.
 * It sits in the RootLayout so it stays mounted during navigation.
 */
const GlobalInitializer = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchNotifications, setupSocket, disconnectSocket } = useNotificationStore();

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

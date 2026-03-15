import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import useNotificationStore from "../../store/slices/notificationStore";
import { cn } from "../../utils/helpers";
import { Icon } from "../ui";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 transition-colors rounded-xl hover:bg-subtle group"
      >
        <Icon name="bell" size={22} className="text-muted group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-[100] mt-2 overflow-hidden bg-white border top-full w-80 rounded-2xl border-border shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-gray-50/50">
              <h3 className="font-bold text-heading">Notifications</h3>
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-12 h-12 bg-subtle rounded-full flex items-center justify-center mb-3">
                    <Icon name="bell" size={24} className="text-disabled" />
                  </div>
                  <p className="text-sm font-medium text-muted">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => {
                      markAsRead(n._id);
                      if (n.link) {
                        // Optional: Navigate to link
                      }
                    }}
                    className={cn(
                      "p-4 border-b border-border hover:bg-primary/[0.02] transition-colors cursor-pointer relative",
                      !n.isRead && "bg-primary/[0.04]"
                    )}
                  >
                    {!n.isRead && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                    <div className={cn("flex flex-col gap-0.5", !n.isRead && "pl-2")}>
                      <p className={cn("text-sm text-heading leading-snug", !n.isRead ? "font-bold" : "font-medium")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-body line-clamp-2 opacity-80">{n.message}</p>
                      <p className="mt-1.5 text-[10px] font-semibold text-disabled uppercase tracking-wider">
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50/50 border-t border-border text-center">
                <button className="text-xs font-bold text-muted hover:text-primary transition-colors">
                  View All Activity
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;

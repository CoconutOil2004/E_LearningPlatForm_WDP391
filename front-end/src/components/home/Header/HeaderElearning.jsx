import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import useAuthStore from "../../../store/slices/authStore";
import useCourseStore from "../../../store/slices/courseStore";
import useNotificationStore from "../../../store/slices/notificationStore";
import { ROUTES } from "../../../utils/constants";
import { cn, getInitials } from "../../../utils/helpers";
import { Icon } from "../../ui";

// ─── Avatar Dropdown ──────────────────────────────────────────────────────────
const AvatarDropdown = ({ user }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { role } = useAuthStore();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getItems = () => {
    if (role === "instructor") {
      return [
        {
          icon: "layoutDashboard",
          label: "Dashboard",
          path: ROUTES.INSTRUCTOR_DASHBOARD,
        },
      ];
    }
    if (role === "admin") {
      return [
        {
          icon: "layoutDashboard",
          label: "Dashboard",
          path: ROUTES.ADMIN_DASHBOARD,
        },
      ];
    }
    return [
      { icon: "user", label: "Profile", path: ROUTES.STUDENT_PROFILE },
      { icon: "book", label: "My Courses", path: ROUTES.MY_COURSES },
      { icon: "trending", label: "Learning Progress", path: ROUTES.PROGRESS },
      { icon: "settings", label: "Settings", path: ROUTES.STUDENT_SETTINGS },
    ];
  };

  const items = getItems();

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 transition-colors rounded-xl hover:bg-primary/10"
      >
        <div
          className="flex items-center justify-center text-sm font-bold text-white w-9 h-9 rounded-xl"
          style={{ background: "var(--gradient-brand)" }}
        >
          {getInitials(user?.username || "S")}
        </div>
        <Icon name="chevronDown" size={16} color="var(--text-muted)" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 w-56 mt-2 overflow-hidden bg-white border top-full rounded-2xl border-border"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <div className="p-4 border-b border-border">
              <p className="text-sm font-bold text-heading">
                {user?.username || "Student"}
              </p>
              <p className="text-xs truncate text-muted">{user?.email}</p>
            </div>
            {items.map((item, i) => (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10 text-body hover:text-primary"
              >
                <Icon name={item.icon} size={17} />
                {item.label}
              </motion.button>
            ))}
            <div className="border-t border-border">
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-danger/10 text-danger"
              >
                <Icon name="logout" size={17} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Notification Dropdown ────────────────────────────────────────────────────
const NotifDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { notifications, markAllRead } = useNotificationStore();
  const unread = notifications.filter((n) => !n.read).length;

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
        className="relative p-2 transition-colors rounded-xl hover:bg-subtle"
      >
        <Icon name="bell" size={22} color="var(--text-body)" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger/100 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 z-50 mt-2 overflow-hidden bg-white border top-full w-80 rounded-2xl border-border"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-heading">Notifications</h3>
              <button
                onClick={markAllRead}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            </div>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "p-4 border-b border-border hover:bg-subtle transition-colors",
                  !n.read && "bg-indigo-50/40",
                )}
              >
                <p className="text-sm font-medium text-body">{n.text}</p>
                <p className="mt-1 text-xs text-disabled">{n.time}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Public Header ────────────────────────────────────────────────────────────
const Header = () => {
  const { isAuthenticated, user, role } = useAuthStore();
  const { wishlistIds } = useCourseStore();
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md border-border"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center h-16 gap-4 px-4 mx-auto max-w-7xl sm:px-6">
        {/* Logo */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 text-xl font-black shrink-0"
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-xl"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Icon name="book" size={18} color="white" />
          </div>
          <span
            className="hidden sm:block"
            style={{
              background: "var(--gradient-brand)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            EduFlow
          </span>
        </Link>

        {/* Nav links */}
        <nav className="items-center justify-center flex-1 hidden gap-1 md:flex">
          <Link
            to={ROUTES.COURSES}
            className="px-4 py-2 text-sm font-semibold transition-colors rounded-xl text-muted hover:text-primary hover:bg-primary/10"
          >
            Browse
          </Link>
          {isAuthenticated && role === "student" && (
            <Link
              to={ROUTES.MY_COURSES}
              className="px-4 py-2 text-sm font-semibold transition-colors rounded-xl text-muted hover:text-primary hover:bg-primary/10"
            >
              My Learning
            </Link>
          )}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Wishlist */}
              <Link
                to={ROUTES.WISHLIST}
                className="relative p-2 transition-colors rounded-xl hover:bg-subtle"
              >
                <Icon name="heart" size={22} color="var(--text-body)" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
              <NotifDropdown />
              <AvatarDropdown user={user} />
            </>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="px-4 py-2 text-sm font-semibold transition-colors rounded-xl text-body hover:bg-subtle"
              >
                Login
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "var(--gradient-brand)" }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

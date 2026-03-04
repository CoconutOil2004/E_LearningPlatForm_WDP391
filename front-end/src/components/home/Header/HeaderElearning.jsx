import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, Badge } from "../../ui";
import { cn, getInitials } from "../../../utils/helpers";
import { ROUTES } from "../../../utils/constants";
import useAuthStore from "../../../store/slices/authStore";
import useNotificationStore from "../../../store/slices/notificationStore";
import useCourseStore from "../../../store/slices/courseStore";
import { useAuth } from "../../../contexts/AuthContext";

// ─── Avatar Dropdown ──────────────────────────────────────────────────────────
const AvatarDropdown = ({ user }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    { icon: "user", label: "Profile", path: ROUTES.STUDENT_PROFILE },
    { icon: "book", label: "My Courses", path: ROUTES.MY_COURSES },
    { icon: "trending", label: "Learning Progress", path: ROUTES.PROGRESS },
    { icon: "settings", label: "Settings", path: ROUTES.STUDENT_SETTINGS },
  ];

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-primary/10 transition-colors"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "var(--gradient-brand)" }}
        >
          {getInitials(user?.name || "S")}
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
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-border overflow-hidden z-50"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <div className="p-4 border-b border-border">
              <p className="font-bold text-sm text-heading">{user?.name || "Student"}</p>
              <p className="text-xs text-muted truncate">{user?.email}</p>
            </div>
            {items.map((item, i) => (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { navigate(item.path); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors text-sm font-medium text-body hover:text-primary"
              >
                <Icon name={item.icon} size={17} />
                {item.label}
              </motion.button>
            ))}
            <div className="border-t border-border">
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-danger/10 transition-colors text-sm font-medium text-danger"
              >
                <Icon name="logout" size={17} />Logout
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
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-subtle transition-colors"
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
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-border overflow-hidden z-50"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-heading">Notifications</h3>
              <button onClick={markAllRead} className="text-xs text-primary font-medium hover:underline">
                Mark all read
              </button>
            </div>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn("p-4 border-b border-border hover:bg-subtle transition-colors", !n.read && "bg-indigo-50/40")}
              >
                <p className="text-sm text-body font-medium">{n.text}</p>
                <p className="text-xs text-disabled mt-1">{n.time}</p>
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
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 font-black text-xl shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Icon name="book" size={18} color="white" />
          </div>
          <span
            className="hidden sm:block"
            style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            EduFlow
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md relative hidden sm:block">
          <Icon name="search" size={17} color="var(--text-disabled)" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search courses, instructors..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-subtle border-2 border-transparent text-sm focus:outline-none focus:border-primary/60 focus:bg-white transition-all"
          />
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          <Link to={ROUTES.COURSES} className="px-4 py-2 rounded-xl text-sm font-semibold text-muted hover:text-primary hover:bg-primary/10 transition-colors">
            Browse
          </Link>
          {isAuthenticated && role === "student" && (
            <Link to={ROUTES.MY_COURSES} className="px-4 py-2 rounded-xl text-sm font-semibold text-muted hover:text-primary hover:bg-primary/10 transition-colors">
              My Learning
            </Link>
          )}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <>
              {/* Wishlist */}
              <Link to={ROUTES.WISHLIST} className="relative p-2 rounded-xl hover:bg-subtle transition-colors">
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
                className="px-4 py-2 rounded-xl text-sm font-semibold text-body hover:bg-subtle transition-colors"
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

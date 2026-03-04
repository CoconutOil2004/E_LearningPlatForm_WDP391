import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, Menu, User, X } from "lucide-react";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../../features/auth/authSlice";

const Header = () => {
  const [sidenav, setSidenav] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userMenuRef = useRef();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const profileUser = useSelector((state) => state.profile?.user);

  // Dùng profile data nếu có, fallback về auth state
  const displayName =
    profileUser?.fullname ||
    profileUser?.username ||
    user?.fullname ||
    user?.username ||
    "Học viên";
  const avatarURL = profileUser?.avatarURL || user?.avatarURL;

  const handleLogout = () => {
    dispatch(logout());
    setShowUser(false);
    navigate("/signin");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#080812]/90 backdrop-blur-xl border-b border-white/8">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-500/30">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              LearnX
            </span>
          </Link>

          {/* Nav */}
          <nav className="items-center hidden gap-6 text-sm md:flex text-white/50">
            <Link to="/" className="transition-colors hover:text-white">
              Khóa học
            </Link>
            <Link to="/profile" className="transition-colors hover:text-white">
              Hồ sơ
            </Link>
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUser(!showUser)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  {avatarURL ? (
                    <img
                      src={avatarURL}
                      alt=""
                      className="object-cover w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500">
                      <span className="text-[10px] font-bold text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-white/80 max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-white/40 transition-transform ${showUser ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {showUser && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#111118] shadow-2xl overflow-hidden"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-white/8 bg-white/3">
                        <p className="text-xs text-white/40 mb-0.5">
                          Đăng nhập với
                        </p>
                        <p className="text-sm font-semibold text-white truncate">
                          {displayName}
                        </p>
                        {(profileUser?.email || user?.email) && (
                          <p className="text-xs truncate text-white/30">
                            {profileUser?.email || user?.email}
                          </p>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUser(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User size={14} /> Trang cá nhân
                        </Link>

                        {user?.role === "instructor" && (
                          <Link
                            to="/overview"
                            onClick={() => setShowUser(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <BookOpen size={14} /> Quản lý khóa học
                          </Link>
                        )}

                        {user?.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUser(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="py-1 border-t border-white/8">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="px-4 py-1.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-1.5 text-white/60 hover:text-white"
              onClick={() => setSidenav(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidenav */}
      <AnimatePresence>
        {sidenav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidenav(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-[70] w-72 h-full bg-[#0e0e1a] border-l border-white/8 shadow-2xl md:hidden p-6"
            >
              <button
                onClick={() => setSidenav(false)}
                className="absolute top-5 right-5 text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col gap-6 mt-12">
                <Link
                  to="/"
                  onClick={() => setSidenav(false)}
                  className="text-lg font-medium text-white/70 hover:text-white"
                >
                  Khóa học
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setSidenav(false)}
                      className="text-lg font-medium text-white/70 hover:text-white"
                    >
                      Hồ sơ
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-lg font-medium text-left text-rose-400"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => setSidenav(false)}
                    className="block px-6 py-3 mt-4 font-semibold text-center text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;

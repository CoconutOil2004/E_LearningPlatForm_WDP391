import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Menu,
  Package,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoTrang from "../../../assets/images/home/logo-trang.png";
import logoXanh from "../../../assets/images/home/logo-xanh.png";
import { logout } from "../../../features/auth/authSlice";
import { resetUserInfo, setUserInfo } from "../../../redux/orebiSlice";

const Header = () => {
  const [sidenav, setSidenav] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [userName, setUserName] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken"),
  );
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userMenuRef = useRef();

  const API_BASE_URL = process.env.REACT_APP_API_URL || API_BASE_URL;
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart?.items) || [];
  const cartTotalCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUser(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserName(response.data.fullname || response.data.username);
      dispatch(setUserInfo(response.data));
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        setIsLoggedIn(false);
      }
    }
  }, [API_BASE_URL, dispatch]);

  useEffect(() => {
    if (isLoggedIn) fetchUserData();
  }, [isLoggedIn, fetchUserData]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`${API_BASE_URL}/api/logout`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Lỗi đăng xuất", error);
    } finally {
      localStorage.removeItem("accessToken");
      dispatch(resetUserInfo());
      dispatch(logout());
      setIsLoggedIn(false);
      setUserName(null);
      navigate("/signin");
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#fdfbf7]/95 backdrop-blur-md py-4 shadow-sm text-[#1E4D3B]"
            : "bg-transparent py-8 text-white"
        }`}
      >
        <div className="container flex items-center justify-between px-6 mx-auto lg:px-12">
          {/* NAV TRÁI (DESKTOP) */}
          <nav className="items-center hidden w-1/3 gap-8 ml-4 text-xs font-bold tracking-widest uppercase lg:flex">
            <Link
              to="/products"
              className="transition-colors hover:text-emerald-600"
            >
              Cửa hàng
            </Link>
            <Link
              to="/about-us"
              className="transition-colors hover:text-emerald-600"
            >
              Về chúng tôi
            </Link>
          </nav>

          {/* LOGO GIỮA */}
          <Link to="/" className="flex flex-col items-center w-1/3 group">
            <img
              src={scrolled ? logoXanh : logoTrang}
              alt="Yên Detox Tea"
              className="object-contain w-auto transition-all duration-300 h-14"
            />
            <span
              className={`text-[10px] tracking-[0.5em] uppercase transition-colors duration-300 
              ${scrolled ? "text-[#1E4D3B]" : "text-white"}`}
            >
              DETOX TEA
            </span>
          </Link>

          {/* ICON HÀNH ĐỘNG PHẢI */}
          <div className="flex items-center justify-end w-1/3 gap-4 lg:gap-8">
            {/* Giỏ hàng */}
            <Link
              to="/cart"
              className="relative p-1 transition-colors hover:text-emerald-600"
            >
              <ShoppingCart size={20} />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartTotalCount}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-3 lg:gap-5">
              {/* Menu Người dùng */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUser(!showUser)}
                  className="flex items-center gap-1 p-1 transition-colors hover:text-emerald-600"
                >
                  <User size={20} />
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-300 ${showUser ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {showUser && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 mt-4 w-56 bg-white shadow-xl rounded-lg overflow-hidden text-[#333] border border-stone-100"
                    >
                      {isAuthenticated ? (
                        <div className="flex flex-col">
                          <div className="px-4 py-3 border-b bg-stone-50">
                            <p className="text-xs font-bold tracking-widest uppercase text-stone-400">
                              Xin chào
                            </p>
                            <p className="text-sm font-serif text-[#1E4D3B] truncate">
                              {userName || user?.username}
                            </p>
                          </div>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50"
                          >
                            <User size={14} /> Hồ sơ cá nhân
                          </Link>
                          <Link
                            to="/order-history"
                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50"
                          >
                            <Package size={14} /> Lịch sử đơn hàng
                          </Link>
                          {/* <Link
                            to="/watchlist"
                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50"
                          >
                            <Heart size={14} /> Sản phẩm yêu thích
                          </Link> */}
                          <button
                            onClick={handleLogout}
                            className="px-4 py-3 text-sm font-bold text-left text-red-600 border-t hover:bg-red-50"
                          >
                            Đăng xuất
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <Link
                            to="/signin"
                            className="px-4 py-4 text-center text-sm font-bold bg-[#1E4D3B] text-white"
                          >
                            Đăng nhập
                          </Link>
                          <Link
                            to="/signup"
                            className="px-4 py-3 text-sm text-center hover:bg-stone-50"
                          >
                            Tạo tài khoản
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="p-1 lg:hidden"
                onClick={() => setSidenav(true)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SIDENAV */}
      <AnimatePresence>
        {sidenav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidenav(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-[70] w-72 h-full bg-[#fdfbf7] shadow-2xl lg:hidden p-8"
            >
              <button
                onClick={() => setSidenav(false)}
                className="absolute top-8 right-8"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col mt-12 space-y-8">
                <Link
                  to="/"
                  onClick={() => setSidenav(false)}
                  className="text-2xl font-serif text-[#1E4D3B]"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/products"
                  onClick={() => setSidenav(false)}
                  className="text-2xl font-serif text-[#1E4D3B]"
                >
                  Cửa hàng
                </Link>
                <Link
                  to="/about-us"
                  onClick={() => setSidenav(false)}
                  className="text-2xl font-serif text-[#1E4D3B]"
                >
                  Câu chuyện
                </Link>

                <div className="pt-8 border-t border-stone-200">
                  {!isAuthenticated && (
                    <Link
                      to="/signin"
                      className="block py-4 px-6 bg-[#1E4D3B] text-white text-center rounded-full font-bold"
                    >
                      Đăng nhập
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;

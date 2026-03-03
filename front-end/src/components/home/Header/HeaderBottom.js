import axios from "axios";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaExchangeAlt, FaSearch } from "react-icons/fa";
import {
  FiLogOut,
  FiMessageSquare,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import { IoStorefrontOutline } from "react-icons/io5";
import { MdOutlineHistory, MdOutlineRateReview } from "react-icons/md";
import {
  RiHomeSmileLine,
  RiShieldLine,
  RiUserSettingsLine,
} from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  resetUserInfo,
  setProducts,
  setUserInfo,
} from "../../../redux/orebiSlice";
import Flex from "../../designLayouts/Flex";

const HeaderBottom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ref = useRef();

  // Get authentication info from Redux store
  const authState = useSelector((state) => state.auth);
  const isAuthenticated = authState?.isAuthenticated || false;
  const user = authState?.user || null;

  // Get data from Redux store with safe checks
  const orebiReducer = useSelector((state) => state.orebiReducer) || {};
  const products = orebiReducer.products || [];

  // Get chat unread count
  const chatState = useSelector((state) => state.chat);
  const chatNotifications =
    chatState?.conversations?.reduce(
      (count, conv) => count + (conv.unreadCount || 0),
      0,
    ) || 0;

  // Get cart information from Redux store
  const cartState = useSelector((state) => state.cart) || {};
  const cartItems = cartState.items || [];

  // Calculate total items in cart
  const cartTotalCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const [showUser, setShowUser] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [userName, setUserName] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken"),
  );

  const API_BASE_URL = process.env.REACT_APP_API_URL || API_BASE_URL;

  // Fetch products function
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      // Update to match backend model
      const formattedProducts = response.data.data.map((product) => ({
        ...product,
        name: product.title, // Backend uses 'title' field for product names
        image: product.image,
      }));

      dispatch(setProducts(formattedProducts));
      setAllProducts(formattedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, [API_BASE_URL, dispatch]);

  // Fetch user data function
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserName(response.data.fullname || response.data.username);
      dispatch(setUserInfo(response.data));
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("accessToken");
        setIsLoggedIn(false);
      }
    }
  }, [API_BASE_URL, dispatch]);

  // Effect to check login status whenever component renders
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  // Effect to load data when component mounts
  useEffect(() => {
    fetchProducts();

    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn, fetchProducts, fetchUserData, dispatch]);

  // Handle clicks outside user menu
  useEffect(() => {
    /*************  ✨ Windsurf Command 🌟  *************/
    /**
     * Handles clicks outside the user menu.
     * If the target element is not the user menu or its children,
     * then hide the user menu.
     * @param {Event} e - The event object.
     */
    const handleClickOutside = (e) => {
      // Check if the target element is not the user menu or its children
      if (ref.current && !ref.current.contains(e.target)) {
        // Hide the user menu
        setShowUser(false);
      }
    };
    /*******  5cbcba24-cbeb-4e03-b3e9-552ded8c558c  *******/

    document.body.addEventListener("click", handleClickOutside);
    return () => document.body.removeEventListener("click", handleClickOutside);
  }, []);

  // Filter products when search query changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();

        if (Array.isArray(data)) {
          // Map dữ liệu API → đồng bộ field
          const mapped = data.map((item) => ({
            ...item,
            name: item.title || item.name || "Untitled Product",
          }));

          setAllProducts(mapped);
          dispatch(setProducts(mapped));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [dispatch]);

  // Lọc sản phẩm mỗi khi searchQuery thay đổi
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts([]);
      return;
    }

    const filtered = allProducts
      .filter(
        (item) =>
          (item.name &&
            item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.description &&
            item.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      .map((item) => ({
        _id: item._id,
        image: item.image,
        name: item.name,
        price: item.price,
        description: item.description,
        category: item.categoryId?.name || "",
      }));

    setFilteredProducts(filtered);
  }, [searchQuery, allProducts]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`${API_BASE_URL}/api/logout`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem("accessToken");
      dispatch(resetUserInfo());
      setIsLoggedIn(false);
      setUserName(null);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear the token on the client side even if the API call fails
      localStorage.removeItem("accessToken");
      setIsLoggedIn(false);
      setUserName(null);
      navigate("/signin");
    }
  };

  const getProductImage = (item) => {
    if (!item.image) {
      return "https://via.placeholder.com/100?text=No+Image";
    }

    if (item.image.startsWith("http://") || item.image.startsWith("https://")) {
      return item.image;
    } else {
      return `${API_BASE_URL}/uploads/${item.image}`;
    }
  };

  return (
    <div className="relative w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-container">
        <Flex className="flex flex-col items-start justify-between w-full h-full px-4 pb-4 lg:flex-row lg:items-center lg:pb-0 lg:h-20">
          {/* Brand Name */}
          <div className="flex items-center gap-2 h-14">
            <Link to="/">
              <div className="flex items-center">
                <IoStorefrontOutline className="text-3xl text-[#e53238] mr-2" />
                <p className="text-[24px] font-bold text-gray-800 tracking-wider hover:text-[#0064d2] transition-colors">
                  Ebay
                </p>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-[600px] h-[50px] text-base bg-white flex items-center gap-2 justify-between px-6 rounded-xl overflow-hidden shadow border border-gray-300">
            <input
              className="flex-1 h-full outline-none placeholder:text-gray-500 placeholder:text-[14px]"
              type="text"
              onChange={handleSearch}
              value={searchQuery}
              placeholder="Search products..."
            />
            <FaSearch className="w-5 h-5 text-[#0064d2] cursor-pointer" />

            {searchQuery && filteredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute left-0 z-50 w-full mx-auto overflow-y-auto bg-white rounded-lg shadow-2xl cursor-pointer max-h-96 top-16 scrollbar-thin scrollbar-thumb-gray-300"
              >
                {filteredProducts.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      navigate(`/product/${item._id}`, { state: { item } });
                      setSearchQuery("");
                    }}
                    className="max-w-[600px] h-28 bg-gray-50 mb-2 flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                  >
                    <div className="w-24 h-24 overflow-hidden bg-gray-100 rounded-md">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="object-contain w-full h-full p-1"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/100?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                      <p className="font-semibold text-lg truncate text-[#0064d2]">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {item.description || "No description available"}
                      </p>
                      <p className="text-sm font-medium">
                        Price:{" "}
                        <span className="text-[#0064d2] font-semibold">
                          ${item.price?.toFixed(2) || "0.00"}
                        </span>
                      </p>
                      {item.category && (
                        <p className="text-xs text-gray-500">
                          Category: {item.category}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* User Actions */}
          <div className="relative flex items-center gap-8 pr-6 mt-2 cursor-pointer lg:mt-0">
            {/* Chat icon */}
            {isAuthenticated && (
              <Link
                to="/chat"
                className="text-gray-800 transition-colors hover:text-black"
              >
                <div className="relative flex flex-col items-center group">
                  <div className="p-2 transition-all bg-blue-500 rounded-full group-hover:bg-gray-300">
                    <FiMessageSquare className="text-xl" />
                  </div>
                  {chatNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center rounded-full bg-[#e53238] text-white font-bold">
                      {chatNotifications}
                    </span>
                  )}
                  <span className="mt-1 text-xs font-medium">Chat</span>
                </div>
              </Link>
            )}

            {/* User dropdown */}
            <div
              ref={ref}
              onClick={() => setShowUser(!showUser)}
              className="text-gray-800 transition-colors hover:text-black"
            >
              <div className="flex flex-col items-center group">
                <div className="p-2 transition-all bg-blue-500 rounded-full group-hover:bg-gray-300">
                  <FiUser className="text-xl" />
                </div>
                <span className="mt-1 text-xs font-medium">Account</span>
              </div>

              {showUser && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-16 right-0 z-50 bg-white w-64 text-[#262626] rounded-lg shadow-2xl p-4"
                >
                  {isAuthenticated ? (
                    <>
                      {userName && (
                        <div className="text-[#0064d2] font-medium py-2 border-b border-gray-200 mb-2 flex items-center">
                          <FiUser className="mr-2 text-lg" />
                          Hello, {userName}
                        </div>
                      )}
                      <Link
                        to="/order-history"
                        onClick={() => setShowUser(false)}
                      >
                        <div className="flex items-center gap-3 px-3 py-2 transition-colors rounded hover:bg-blue-50">
                          <MdOutlineHistory className="text-[#0064d2] text-lg" />
                          Order History
                        </div>
                      </Link>
                      <Link to="/profile" onClick={() => setShowUser(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 transition-colors rounded hover:bg-blue-50">
                          <RiUserSettingsLine className="text-[#0064d2] text-lg" />
                          Profile
                        </div>
                      </Link>
                      <Link to="/address" onClick={() => setShowUser(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 transition-colors rounded hover:bg-blue-50">
                          <RiHomeSmileLine className="text-[#0064d2] text-lg" />
                          Addresses
                        </div>
                      </Link>
                      <Link to="/my-reviews" onClick={() => setShowUser(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 transition-colors rounded hover:bg-blue-50">
                          <MdOutlineRateReview className="text-[#0064d2] text-lg" />
                          Reviews
                        </div>
                      </Link>
                      <Link to="/disputes" onClick={() => setShowUser(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 transition-colors rounded hover:bg-blue-50">
                          <RiShieldLine className="text-[#0064d2] text-lg" />
                          Disputes
                        </div>
                      </Link>
                      <Link
                        to="/return-requests"
                        onClick={() => setShowUser(false)}
                      >
                        <div className="flex items-center gap-3 px-3 py-2 transition-colors rounded hover:bg-blue-50">
                          <FaExchangeAlt className="text-[#0064d2] text-lg" />
                          Return Requests
                        </div>
                      </Link>
                      <div
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 pt-3 mt-2 text-red-600 transition-colors border-t border-gray-200 rounded hover:bg-red-50"
                      >
                        <FiLogOut className="text-lg" />
                        Logout
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/signin" onClick={() => setShowUser(false)}>
                        <div className="py-3 bg-[#0064d2] hover:bg-[#0047a3] text-white px-3 rounded-lg transition-colors text-center font-medium">
                          Sign In
                        </div>
                      </Link>
                      <Link to="/signup" onClick={() => setShowUser(false)}>
                        <div className="py-3 border border-[#0064d2] text-[#0064d2] hover:bg-blue-50 px-3 rounded-lg transition-colors mt-3 text-center font-medium">
                          Sign Up
                        </div>
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative text-gray-800 transition-colors hover:text-black"
            >
              <div className="flex flex-col items-center group">
                <div className="relative p-2 transition-all bg-blue-500 rounded-full group-hover:bg-gray-300">
                  <FiShoppingBag className="text-xl" />
                  {cartTotalCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs w-5 h-5 flex items-center justify-center rounded-full bg-[#e53238] text-white font-bold">
                      {cartTotalCount}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-xs font-medium">Cart</span>
              </div>
            </Link>
          </div>
        </Flex>
      </div>
    </div>
  );
};

export default HeaderBottom;

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addToCart } from "../../features/cart/cartSlice";

const ProductCard = ({
  product,
  index,
  isFavorite,
  isAddingToCart,
  onAddToCart,
  onToggleFavorite,
  onProductClick,
  onImageError,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      // THAY ĐỔI: Thêm border màu #C5A059 và hiệu ứng hover
      className="relative overflow-hidden transition-all duration-300 border group rounded-2xl hover:shadow-2xl hover:-translate-y-1"
      style={{ borderColor: "#C5A059" }} // Sử dụng inline style để đảm bảo màu chính xác
    >
      {/* Product Image */}
      <div
        className="relative h-48 overflow-hidden cursor-pointer bg-gradient-to-br from-stone-50 to-stone-100"
        onClick={() => onProductClick(product)}
      >
        <img
          src={
            product.imageUrl || "https://via.placeholder.com/300?text=No+Image"
          }
          alt={product.title || "Product"}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          onError={onImageError}
        />

        {/* View Details Overlay */}
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-black/20 group-hover:opacity-100">
          <div className="flex items-center justify-center h-full">
            <button
              className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all duration-300 transform scale-90 bg-white/20 backdrop-blur-md rounded-xl group-hover:scale-100"
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(product);
              }}
            >
              <VisibilityIcon style={{ fontSize: 18 }} />
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <h3
          className="text-base font-bold text-gray-800 transition-colors cursor-pointer line-clamp-1 hover:text-[#C5A059]"
          onClick={() => onProductClick(product)}
        >
          {product.title || "Untitled Product"}
        </h3>

        <p className="text-xs font-medium tracking-wider uppercase text-stone-500">
          {product.categoryName}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xl font-bold text-[#1E4D3B]">
            {product.price?.toFixed(3)}đ
          </div>

          <button
            onClick={() => onAddToCart(product._id)}
            disabled={isAddingToCart}
            // THAY ĐỔI: Đồng bộ màu nút bấm với thương hiệu nếu muốn (Tùy chọn)
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white transition-all duration-300 bg-[#1E4D3B] rounded-lg hover:bg-[#15382B] disabled:bg-stone-400"
          >
            <AddShoppingCartIcon style={{ fontSize: 16 }} />
            Thêm sản phẩm
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ProductSkeleton = ({ count = 6 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden bg-white animate-pulse rounded-2xl"
        >
          <div className="h-64 bg-stone-200"></div>
          <div className="p-5 space-y-3">
            <div className="w-3/4 h-4 rounded bg-stone-200"></div>
            <div className="w-1/2 h-3 rounded bg-stone-200"></div>
            <div className="w-1/3 h-3 rounded bg-stone-200"></div>
            <div className="flex items-center justify-between pt-2">
              <div className="w-20 h-6 rounded bg-stone-200"></div>
              <div className="w-24 h-10 rounded-xl bg-stone-200"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 transition-colors border rounded-lg border-stone-300 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
            currentPage === page
              ? "bg-stone-800 text-white"
              : "border border-stone-300 hover:bg-stone-100 text-gray-700"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 transition-colors border rounded-lg border-stone-300 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [favoriteProducts, setFavoriteProducts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const isAuthenticated = authState?.isAuthenticated || false;
  const user = authState?.user || null;
  const token = authState?.token || null;

  const API_BASE_URL = (
    process.env.REACT_APP_API_URL || API_BASE_URL
  ).trim();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const paymentStatus = query.get("paymentStatus");

    if (paymentStatus === "paid") {
      toast.success("Payment successful!");
      navigate("/", { replace: true });
    } else if (paymentStatus === "failed") {
      toast.error("Payment failed!");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get(`${API_BASE_URL}/api/categories`);
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error("Error loading categories");
      console.error(error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get("search");

      let url = `${API_BASE_URL}/api/products?page=${currentPage}&limit=9`;

      if (searchParam) {
        url += `&search=${encodeURIComponent(searchParam)}`;
      }

      if (selectedCategories.length > 0) {
        const categoryIds = selectedCategories.join(",");
        url += `&categories=${categoryIds}`;
      }

      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;

      if (sortOrder !== "default") {
        const serverSort = sortOrder.replace(/-/g, "_");
        url += `&sort=${serverSort}`;
      }

      const response = await axios.get(url);
      const { data, pagination } = response.data;
      setTotalPages(pagination?.totalPages || 1);

      const formattedProducts = data.map((product) => {
        let imageUrl;
        const img = String(product.image || "").trim();

        if (img.startsWith("http://") || img.startsWith("https://")) {
          imageUrl = img;
        } else if (img) {
          imageUrl = `${API_BASE_URL}/uploads/${img}`;
        } else {
          imageUrl = "https://via.placeholder.com/300?text=No+Image";
        }

        return {
          ...product,
          imageUrl,
          categoryName: product.categoryId?.name || "Uncategorized",
          sellerName: product.sellerId?.username || "Unknown Seller",
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      toast.error("Error loading products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoriesParam = params.get("categories");

    if (categoriesParam) {
      const categoryIds = categoriesParam.split(",").filter((id) => id);
      setSelectedCategories(categoryIds);
    } else {
      setSelectedCategories([]);
    }

    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategories, currentPage, minPrice, maxPrice, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, minPrice, maxPrice]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/300?text=No+Image";
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleResetCategories = () => {
    setSelectedCategories([]);
  };

  const handleAddToCart = (productId) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to add products to cart");
      navigate("/signin");
      return;
    }

    const productToAdd = products.find((p) => p._id === productId);

    if (
      user?.role === "seller" &&
      productToAdd &&
      productToAdd.sellerId?._id === user?.id
    ) {
      toast.warning("You cannot add your own products to cart");
      return;
    }

    dispatch(addToCart({ productId, quantity: 1 }));
  };

  const handleToggleFavorite = async (productId) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to favorite products");
      navigate("/signin");
      return;
    }

    try {
      setFavoriteProducts((prev) => ({
        ...prev,
        [productId]: !prev[productId],
      }));

      // Assuming WatchlistService.toggleWatchlist exists
      // Replace with your actual API call
      await axios.post(
        `${API_BASE_URL}/api/watchlist/toggle`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!favoriteProducts[productId]) {
        toast.success("Added to favorites!");
      } else {
        toast.info("Removed from favorites");
      }
    } catch (error) {
      setFavoriteProducts((prev) => ({
        ...prev,
        [productId]: !prev[productId],
      }));
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites.");
    }
  };

  const handleProductClick = (product) => {
    navigate(`/auth/product/${product._id}`, { state: { item: product } });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="pt-12 ">
        <div className="max-w-full px-4 mx-20">
          <h1 className="text-3xl tracking-tight text-left text-gray-800 md:text-3xl">
            Trà Dextox
          </h1>
        </div>
      </div>

      <div className="px-4 pt-4 pb-12 mx-20 8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky p-6 top-6 ">
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  Danh mục
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === 0}
                      onChange={handleResetCategories}
                      className="w-4 h-4 border-2 rounded text-stone-700 border-stone-300 focus:ring-stone-500"
                    />
                    <span className="ml-3 text-gray-700 transition-colors group-hover:text-stone-800">
                      Tất cả danh mục
                    </span>
                  </label>

                  {loadingCategories ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="h-6 rounded animate-pulse bg-stone-200"
                        ></div>
                      ))}
                    </div>
                  ) : (
                    categories.map((category) => (
                      <label
                        key={category._id}
                        className="flex items-center cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleCategoryChange(category._id)}
                          className="w-4 h-4 border-2 rounded text-stone-700 border-stone-300 focus:ring-stone-500"
                        />
                        <span className="ml-3 text-gray-700 transition-colors group-hover:text-stone-800">
                          {category.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Price Filter */}
              {/* <div className="pt-6 mb-6 border-t border-stone-200">
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  Price Range
                </h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-4 py-2 text-sm border rounded-lg border-stone-300 focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-4 py-2 text-sm border rounded-lg border-stone-300 focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  />
                </div>
              </div> */}

              {/* Sort Filter */}
              {/* <div className="pt-6 border-t border-stone-200">
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  Sắp xếp
                </h3>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-2 text-sm border rounded-lg border-stone-300 focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div> */}

              {/* Reset Button */}
              {(selectedCategories.length > 0 ||
                minPrice ||
                maxPrice ||
                sortOrder !== "default") && (
                <button
                  onClick={() => {
                    handleResetCategories();
                    setMinPrice("");
                    setMaxPrice("");
                    setSortOrder("default");
                  }}
                  className="w-full px-4 py-2 mt-6 text-sm font-medium transition-colors border-2 rounded-lg text-stone-700 border-[#6B8F4C] hover:bg-[#6B8F4C] hover:text-white"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <ProductSkeleton count={9} />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 text-2xl font-bold text-gray-800">
                  Không tìm thấy sản phẩm.
                </h3>
                <p className="mb-6 text-stone-600"></p>
                <button
                  onClick={() => {
                    handleResetCategories();
                    setMinPrice("");
                    setMaxPrice("");
                    setSortOrder("default");
                  }}
                  className="px-8 py-3 font-medium text-white transition-colors rounded-xl bg-stone-700 hover:bg-stone-800"
                >
                  Tất cả sản phẩm
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={index}
                      isFavorite={favoriteProducts[product._id]}
                      isAddingToCart={addingToCart[product._id]}
                      onAddToCart={handleAddToCart}
                      onToggleFavorite={handleToggleFavorite}
                      onProductClick={handleProductClick}
                      onImageError={handleImageError}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;

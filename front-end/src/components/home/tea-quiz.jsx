import { Button } from "@mui/material";
import axios from "axios";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addToCart } from "../../features/cart/cartSlice";

const QUIZ_META = {
  label: "TÌM KIẾM HƯƠNG VỊ HOÀN HẢO",
  question: "Hôm nay bạn cần gì?",
  subtitle: "Chọn cảm giác bạn muốn tìm, Yên gợi ý loại trà phù hợp.",
};

const ANSWER_CONFIG = [
  {
    id: "energetic",
    icon: "⚡",
    title: "Sự mới mẻ tinh tế",
    description:
      "Nền trà rõ và dày vị hơn. Hậu sâu, lưu lại lâu, dành cho khi bạn muốn một trải nghiệm khác.",
    productId: "60d21b4667d0d8992e610110", // Tinh Sắc
  },
  {
    id: "relaxed",
    icon: "🌿",
    title: "Sự tỉnh táo nhẹ nhàng",
    description:
      "Trà xanh nền thanh, hương lài ướp vừa đủ. Tỉnh mà không gắt, rõ vị nhưng vẫn êm.",
    productId: "60d21b4667d0d8992e610100", // Nhã Hương
  },
  {
    id: "balanced",
    icon: "🌼",
    title: "Sự thoải mái cân bằng",
    description:
      "Trà xanh phối ô long nhẹ, vị mềm và tròn. Cảm giác dịu và sạch, dễ uống mỗi ngày.",
    productId: "6999c974c2bc0991140e4a57", // Sương Mai
  },
];

export default function TeaQuiz() {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const isAuthenticated = authState?.isAuthenticated || false;

  const API_BASE_URL = (
    process.env.REACT_APP_API_URL || API_BASE_URL
  ).trim();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch danh sách sản phẩm (đảm bảo chứa các ID cần tìm)
        const response = await axios.get(
          `${API_BASE_URL}/api/products?limit=20`,
        );
        const { data } = response.data;

        const formatted = data.map((product) => {
          const img = String(product.image || "").trim();
          let imageUrl;
          if (img.startsWith("http://") || img.startsWith("https://")) {
            imageUrl = img;
          } else if (img) {
            imageUrl = `${API_BASE_URL}/uploads/${img}`;
          } else {
            imageUrl = "https://via.placeholder.com/400?text=No+Image";
          }
          return { ...product, imageUrl };
        });

        setProducts(formatted);
      } catch (error) {
        console.error("Error loading quiz products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_BASE_URL]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/signin");
      return;
    }

    // Gửi đúng các field mà addToCart createAsyncThunk yêu cầu
    dispatch(
      addToCart({
        productId: product._id,
        quantity: 1,
        price: product.price,
        name: product.title,
        image: product.image, // Gửi tên file gốc để server xử lý
        stock: product.stock || 0,
      }),
    );
  };

  const handleProductClick = (product) => {
    navigate(`/auth/product/${product._id}`, { state: { item: product } });
  };

  const selectedConfig = selectedAnswer
    ? ANSWER_CONFIG.find((a) => a.id === selectedAnswer)
    : null;
  const selectedProduct = selectedConfig
    ? products.find((p) => p._id === selectedConfig.productId)
    : null;

  return (
    <section className="max-w-6xl px-4 py-16 mx-auto md:pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Quiz UI (Ẩn khi đã chọn xong) */}
        {!selectedAnswer && (
          <div className="text-center animate-fadeIn">
            <p className="mb-3 text-xs font-semibold tracking-widest text-green-600 uppercase">
              {QUIZ_META.label}
            </p>
            <h2 className="mb-4 font-serif text-4xl font-bold text-gray-900">
              {QUIZ_META.question}
            </h2>
            <p className="max-w-2xl mx-auto mb-12 text-gray-600">
              {QUIZ_META.subtitle}
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-40 bg-gray-100 rounded-2xl animate-pulse"
                    />
                  ))
                : ANSWER_CONFIG.map((answer) => (
                    <button
                      key={answer.id}
                      onClick={() => setSelectedAnswer(answer.id)}
                      className="p-8 text-left transition-all bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl hover:-translate-y-1"
                    >
                      <span className="block mb-4 text-3xl">{answer.icon}</span>
                      <h3 className="mb-2 text-lg font-bold text-gray-900">
                        {answer.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {answer.description}
                      </p>
                    </button>
                  ))}
            </div>
          </div>
        )}

        {/* Result UI */}
        {selectedAnswer && selectedProduct && (
          <div className="animate-fadeIn">
            <div className="flex flex-col overflow-hidden bg-white border shadow-2xl md:flex-row rounded-3xl border-gray-50">
              <div className="md:w-1/2">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover min-h-[400px]"
                />
              </div>
              <div className="flex flex-col justify-center p-8 md:w-1/2 md:p-12">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold tracking-widest text-green-600 uppercase">
                  <Sparkles size={16} /> Gợi ý dành cho bạn
                </div>
                <h3 className="mb-4 font-serif text-3xl font-bold md:text-4xl">
                  {selectedProduct.title}
                </h3>
                <p className="mb-6 leading-relaxed text-gray-600">
                  {selectedProduct.description ||
                    "Một sự lựa chọn tuyệt vời mang lại trải nghiệm hương vị cân bằng và thư thái."}
                </p>
                <div className="mb-8 text-3xl font-bold text-[#2D4F3E]">
                  {selectedProduct.price?.toLocaleString("vi-VN")}.000đ
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    variant="contained"
                    onClick={() => handleAddToCart(selectedProduct)}
                    sx={{
                      bgcolor: "#2D4F3E",
                      "&:hover": { bgcolor: "#2D4F3E" },
                      borderRadius: "9999px",
                      px: 4,
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: "bold",
                    }}
                    startIcon={<ShoppingCart size={20} />}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleProductClick(selectedProduct)}
                    sx={{
                      borderRadius: "9999px",
                      px: 4,
                      py: 1.5,
                      textTransform: "none",
                      color: "#374151",
                      borderColor: "#d1d5db",
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={() => setSelectedAnswer(null)}
                className="text-sm text-gray-500 underline hover:text-gray-800"
              >
                ← Quay lại chọn lại
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

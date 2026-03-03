import axios from "axios";
import { Heart, Leaf, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { addToCart } from "../../features/cart/cartSlice";

const WellnessHomepage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const isAuthenticated = authState?.isAuthenticated || false;
  const user = authState?.user || null;
  const token = authState?.token || null;

  const API_BASE_URL = (
    process.env.REACT_APP_API_URL || API_BASE_URL
  ).trim();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/products?page=1&limit=3`,
      );
      const { data } = response.data;

      const formattedProducts = data.map((product) => {
        let imageUrl;
        const img = String(product.image || "").trim();

        if (img.startsWith("http://") || img.startsWith("https://")) {
          imageUrl = img;
        } else if (img) {
          imageUrl = `${API_BASE_URL}/uploads/${img}`;
        } else {
          imageUrl = "https://via.placeholder.com/400?text=No+Image";
        }
        return {
          ...product,
          imageUrl,
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId, product) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to add products to cart");
      navigate("/signin");
      return;
    }

    dispatch(addToCart({ productId, quantity: 1 }));
  };

  const handleProductClick = (product) => {
    navigate(`/auth/product/${product._id}`, { state: { item: product } });
  };

  const benefits = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "GLOWING SKIN",
      description: "Nourishes from within for a radiant complexion.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "BOOSTED ENERGY",
      description: "Revitalizes your body and mind for lasting vitality.",
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "GENTLE DETOX",
      description: "Supports natural cleansing to feel lighter and refreshed.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "HEART WELLNESS",
      description: "Promotes cardiovascular health for a stronger you.",
    },
  ];

  return (
    <div className=" bg-cream">
      {/* Benefits Section */}
      {/* <section className="px-4 py-16 mx-auto max-w-7xl">
        <h2 className="mb-4 text-4xl text-center font-titleFont text-charcoal">
          BENEFITS:
        </h2>
        <h3 className="mb-12 text-3xl text-center font-titleFont text-forest-green">
          DISCOVER YOUR GLOW
        </h3>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-soft-gold/10">
                <div className="text-soft-gold">{benefit.icon}</div>
              </div>
              <h4 className="mb-2 text-lg font-bold font-bodyFont text-charcoal">
                {benefit.title}
              </h4>
              <p className="text-sm font-bodyFont text-charcoal/90 max-w-[200px]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section> */}

      <section className="px-4 pb-16 mx-auto max-w-7xl">
        <h2 className="mb-4 text-4xl text-center font-titleFont text-charcoal">
          Sản phẩm nổi bật
        </h2>
        <h3 className="mb-12 text-3xl text-center font-titleFont text-forest-green"></h3>

        {loading ? (
          <div className="text-center text-charcoal/90">
            Loading products...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="overflow-hidden transition-transform duration-300 border shadow-md bg-cream hover:scale-102 rounded-xl border-black/5"
                  style={{ borderColor: "#C5A059" }}
                >
                  <div
                    className="h-64 overflow-hidden cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full p-2 transition-transform duration-500 rounded-xl hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/400?text=No+Image";
                      }}
                    />
                  </div>

                  <div className="p-4 text-center">
                    <h4
                      className="mb-1 text-lg cursor-pointer font-bodyFont text-charcoal hover:text-forest-green line-clamp-1"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.title}
                    </h4>

                    <p className="mb-3 text-lg font-bold text-forest-green">
                      {product.price?.toLocaleString("vi-VN")}.000đ
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product._id, product);
                      }}
                      disabled={addingToCart[product._id]}
                      className="w-full px-4 py-2 text-sm font-bold transition-colors rounded-lg font-bodyFont bg-forest-green text-cream hover:bg-forest-green/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {addingToCart[product._id]
                        ? "Đang thêm..."
                        : "Thêm vào giỏ hàng"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Explore All Button */}
            <div className="flex justify-center">
              <button
                onClick={() => (window.location.href = "/products")}
                className="px-12 py-4 text-lg font-semibold transition-colors rounded-full shadow-lg font-bodyFont bg-forest-green text-cream hover:bg-forest-green/90"
              >
                Tất cả sản phẩm
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default WellnessHomepage;

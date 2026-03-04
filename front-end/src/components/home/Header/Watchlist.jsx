// front-end/src/pages/Watchlist.jsx

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { FaEye, FaHeartBroken } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import WatchlistService from "../../../services/api/WatchlistService";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Watchlist = () => {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getProductImageSource = (image) => {
    if (!image) return "https://via.placeholder.com/200?text=No+Image";
    if (image.startsWith("http://") || image.startsWith("https://"))
      return image;
    return `${API_BASE_URL}/uploads/${image}`;
  };

  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await WatchlistService.getWatchlist();
      setWatchlistItems(response.watchlist);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch watchlist:", err);
      setError("Could not load your watchlist. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleRemoveFromWatchlist = async (productId) => {
    try {
      await WatchlistService.toggleWatchlist(productId);
      toast.success("Removed from your watchlist!");
      // Optimistically update UI
      setWatchlistItems((prevItems) =>
        prevItems.filter((item) => item._id !== productId),
      );
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      toast.error("Failed to remove item. Please try again.");
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/200?text=No+Image";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream font-bodyFont">
        <div className="max-w-7xl mx-auto py-10 text-center flex justify-center items-center h-[50vh]">
          <span className="w-8 h-8 mr-3 border-4 rounded-full animate-spin border-forest-green border-t-transparent"></span>
          Loading your watchlist...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream font-bodyFont">
        <div className="py-10 mx-auto text-center text-red-700 max-w-7xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-bodyFont">
      <div className="px-4 py-10 mx-auto max-w-7xl">
        <h1 className="inline-block pb-3 mb-6 text-4xl font-bold border-b-4 font-titleFont text-charcoal border-forest-green/50">
          My Watchlist ({watchlistItems.length})
        </h1>

        {watchlistItems.length === 0 ? (
          <div className="py-16 mt-8 text-center border-2 border-dashed rounded-lg text-charcoal/70 border-black/10 bg-white/50">
            <FaHeartBroken className="mx-auto mb-4 text-5xl text-soft-gold" />
            <h2 className="mb-2 text-2xl font-semibold font-titleFont text-charcoal">
              A Quiet Heart...
            </h2>
            <p className="text-lg text-charcoal/80">
              Browse our products and add your favorites!
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence>
              {watchlistItems.map((product) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  key={product._id}
                  className="relative flex flex-col overflow-hidden transition-all duration-300 bg-white border shadow-md border-black/10 rounded-xl hover:shadow-lg"
                >
                  <button
                    onClick={() => handleRemoveFromWatchlist(product._id)}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-white rounded-full text-charcoal/60 hover:text-soft-gold hover:bg-soft-gold/10 transition-colors duration-200 shadow"
                    aria-label="Remove from watchlist"
                  >
                    <MdOutlineClose size={20} />
                  </button>

                  <Link to={`/auth/product/${product._id}`} className="block">
                    <div className="flex items-center justify-center w-full h-48 p-4 overflow-hidden bg-cream">
                      {product.image ? (
                        <img
                          src={getProductImageSource(product.image)}
                          alt={product.title}
                          className="object-contain max-w-full max-h-full transition-transform duration-500 hover:scale-105"
                          onError={handleImageError}
                        />
                      ) : (
                        <span className="text-charcoal/40">No Image</span>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-col flex-grow p-4">
                    <Link
                      to={`/auth/product/${product._id}`}
                      className="transition-colors duration-200 hover:text-forest-green"
                    >
                      <h2 className="text-lg font-bold font-titleFont text-charcoal line-clamp-2">
                        {product.title}
                      </h2>
                    </Link>
                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-black/5">
                      <p className="text-xl font-bold text-forest-green">
                        ${product.price ? product.price.toFixed(2) : "N/A"}
                      </p>

                      <div className="flex gap-2">
                        <Link to={`/auth/product/${product._id}`}>
                          <button
                            className="p-2 transition-colors rounded-full text-forest-green hover:bg-forest-green/10"
                            title="View Details"
                          >
                            <FaEye size={18} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;

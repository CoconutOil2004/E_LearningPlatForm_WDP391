// front-end/src/pages/Watchlist.jsx

import React, { useState, useEffect, useCallback } from 'react'; 
import WatchlistService from '../../../services/api/WatchlistService'; 
import { MdOutlineClose } from "react-icons/md"; 
import { toast } from 'react-toastify'; 
import { Link } from 'react-router-dom';
import { FaEye, FaHeartBroken } from "react-icons/fa"; 
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = process.env.REACT_APP_API_URL || API_BASE_URL;

const Watchlist = () => {
    const [watchlistItems, setWatchlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const getProductImageSource = (image) => {
        if (!image) return "https://via.placeholder.com/200?text=No+Image";
        if (image.startsWith('http://') || image.startsWith('https://')) return image;
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
            setWatchlistItems(prevItems => prevItems.filter(item => item._id !== productId));
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
            <div className="bg-cream font-bodyFont min-h-screen">
                <div className="max-w-7xl mx-auto py-10 text-center flex justify-center items-center h-[50vh]">
                    <span className="animate-spin h-8 w-8 border-4 border-forest-green border-t-transparent rounded-full mr-3"></span>
                    Loading your watchlist...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-cream font-bodyFont min-h-screen">
                <div className="max-w-7xl mx-auto py-10 text-red-700 text-center">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-cream font-bodyFont min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <h1 className="text-4xl font-bold font-titleFont mb-6 text-charcoal border-b-4 border-forest-green/50 pb-3 inline-block">
                    My Watchlist ({watchlistItems.length})
                </h1>

                {watchlistItems.length === 0 ? (
                    <div className="text-charcoal/70 text-center py-16 border-2 border-dashed border-black/10 rounded-lg bg-white/50 mt-8">
                        <FaHeartBroken className="mx-auto text-5xl text-soft-gold mb-4" />
                        <h2 className="text-2xl font-semibold font-titleFont text-charcoal mb-2">A Quiet Heart...</h2>
                        <p className="text-lg text-charcoal/80">Browse our products and add your favorites!</p>
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                        <AnimatePresence>
                            {watchlistItems.map((product) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    key={product._id} 
                                    className="relative bg-white border border-black/10 rounded-xl shadow-md flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300"
                                >
                                    <button 
                                        onClick={() => handleRemoveFromWatchlist(product._id)}
                                        className="absolute top-3 right-3 z-10 p-1.5 bg-white rounded-full text-charcoal/60 hover:text-soft-gold hover:bg-soft-gold/10 transition-colors duration-200 shadow"
                                        aria-label="Remove from watchlist"
                                    >
                                        <MdOutlineClose size={20} />
                                    </button>

                                    <Link to={`/auth/product/${product._id}`} className="block">
                                        <div className="w-full h-48 flex items-center justify-center overflow-hidden bg-cream p-4">
                                            {product.image ? (
                                                <img 
                                                    src={getProductImageSource(product.image)} 
                                                    alt={product.title} 
                                                    className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-105" 
                                                    onError={handleImageError}
                                                />
                                            ) : (
                                                <span className="text-charcoal/40">No Image</span>
                                            )}
                                        </div>
                                    </Link>

                                    <div className="p-4 flex flex-col flex-grow">
                                        <Link to={`/auth/product/${product._id}`} className="hover:text-forest-green transition-colors duration-200">
                                            <h2 className="text-lg font-bold font-titleFont text-charcoal line-clamp-2">{product.title}</h2>
                                        </Link>
                                        <div className="mt-auto flex justify-between items-center pt-3 border-t border-black/5">
                                            <p className="text-forest-green text-xl font-bold">${product.price ? product.price.toFixed(2) : 'N/A'}</p>
                                            
                                            <div className="flex gap-2">
                                                <Link to={`/auth/product/${product._id}`}>
                                                    <button className="p-2 text-forest-green hover:bg-forest-green/10 rounded-full transition-colors" title="View Details">
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
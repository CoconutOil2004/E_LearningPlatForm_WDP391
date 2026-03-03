import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VerifiedIcon from "@mui/icons-material/Verified";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { motion } from "framer-motion";

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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      className="group bg-[#E8EFD8] rounded-3xl overflow-hidden shadow-sm
      transition-all duration-300 ease-out
      hover:bg-[#A7C685] hover:shadow-md"
    >
      {/* Top Rated Badge */}
      {product.rating >= 4.5 && (
        <div className="absolute z-20 flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#6B8F4C] rounded-full shadow-lg top-3 left-3">
          <VerifiedIcon style={{ fontSize: 14 }} />
          Top Rated
        </div>
      )}

      {/* Product Image */}
      <div
        className="relative h-48 bg-[#E8EFD8]
        flex items-center justify-center p-6
        transition-colors duration-300 ease-out
        group-hover:bg-[#A7C685]
        cursor-pointer"
        onClick={() => onProductClick(product)}
      >
        <img
          src={
            product.imageUrl || "https://via.placeholder.com/300?text=No+Image"
          }
          alt={product.title || "Product Image"}
          className="object-contain w-full h-full transition-transform duration-300 ease-out group-hover:scale-105"
          onError={onImageError}
        />

        {/* Action Buttons */}
        <div className="absolute flex flex-col gap-2 top-3 right-3">
          <button
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md 
            transition-all duration-300 hover:bg-[#6B8F4C] hover:text-white hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product);
            }}
            title="View Details"
          >
            <VisibilityIcon style={{ fontSize: 18 }} />
          </button>

          <button
            className={`p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md transition-all duration-300 hover:scale-110 ${
              isFavorite
                ? "text-red-500 hover:bg-red-50"
                : "hover:bg-red-50 hover:text-red-500"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product._id);
            }}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            {isFavorite ? (
              <FavoriteIcon style={{ fontSize: 18 }} />
            ) : (
              <FavoriteBorderIcon style={{ fontSize: 18 }} />
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Category and Stock Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold text-[#2C3E1F] rounded-full bg-white/60">
            {product.categoryName}
          </span>
          {product.inventory &&
            product.inventory.quantity < 5 &&
            product.inventory.quantity > 0 && (
              <span className="px-3 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">
                Low Stock
              </span>
            )}
        </div>

        {/* Product Title */}
        <h3
          className="font-semibold text-[#2C3E1F] text-base cursor-pointer line-clamp-2 
          hover:text-[#6B8F4C] transition-colors duration-200"
          onClick={() => onProductClick(product)}
        >
          {product.title || "Untitled Product"}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex text-[#6B8F4C]">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-sm">
                {i < Math.floor(product.rating || 0) ? "★" : "☆"}
              </span>
            ))}
          </div>
          <span className="text-sm text-[#6B7563] font-medium">
            {product.rating ? product.rating.toFixed(1) : "0.0"}
            {product.reviewCount > 0 && ` (${product.reviewCount})`}
          </span>
        </div>

        {/* Price and Seller */}
        <div className="flex items-baseline justify-between pt-2">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[#2C3E1F] text-2xl">
              {product.price?.toFixed(3)}
              <span className="text-sm text-[#6B7563]">/kg</span>
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product._id)}
          disabled={isAddingToCart}
          className="w-full bg-[#6B8F4C] text-white py-2.5 rounded-lg
          text-sm font-medium
          transition-colors duration-200 ease-out
          hover:bg-[#5A7A3E]
          disabled:bg-[#9DB88A] disabled:cursor-not-allowed
          flex items-center justify-center gap-2"
        >
          <AddShoppingCartIcon style={{ fontSize: 20 }} />
          {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;

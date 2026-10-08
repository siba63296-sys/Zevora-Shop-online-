import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, Heart, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUrl';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateTo, addToCart, toggleWishlist, isInWishlist, toggleComparison, isInComparison } = useStore();
  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);

  const handleOpenDetails = () => {
    navigateTo('product_detail', { productId: product.id });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenDetails();
    }
  };

  const mainImageUrl = resolveImageUrl(product.images?.[0]);

  return (
    <div
      onClick={handleOpenDetails}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/50"
    >
      {/* Top badges & Wishlist */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
        {!product.in_stock && (
          <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
            Out of Stock
          </span>
        )}
        {product.discount_percent > 0 && (
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {product.discount_percent}% OFF
          </span>
        )}
      </div>

      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
        {/* Compare Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleComparison(product);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isCompared
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs'
          }`}
          title={isCompared ? 'Remove from Compare' : 'Add to Compare (up to 3)'}
          aria-label="Compare product"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </button>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isWishlisted
              ? 'bg-pink-50 dark:bg-pink-950/70 text-pink-600 dark:text-pink-400 shadow-xs'
              : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-400 dark:text-slate-300 hover:text-pink-500 shadow-xs'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Image */}
      <div
        onClick={handleOpenDetails}
        className="w-full h-48 sm:h-52 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3 overflow-hidden relative cursor-pointer"
      >
        <img
          src={mainImageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/png?text=Product+Image';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category_name && (
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 truncate">
              {product.category_name}
            </p>
          )}

          <h3
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetails();
            }}
            className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
              <span>{Number(product.rating || 4.5)}</span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              ({(Number(product.review_count || 0)) > 1000 ? `${((Number(product.review_count || 0)) / 1000).toFixed(1)}k` : Number(product.review_count || 0)})
            </span>
            <span
              className={`text-[11px] font-bold ml-auto ${
                product.in_stock ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                ₹{(Number(product.price) || 0).toLocaleString('en-IN')}
              </span>
            </div>
            {Number(product.original_price || 0) > Number(product.price || 0) && (
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through tabular-nums">
                ₹{(Number(product.original_price) || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {product.in_stock ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-not-allowed shrink-0"
              title="Currently Out of Stock"
            >
              <span>Out of Stock</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

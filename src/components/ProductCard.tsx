import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, Heart, ShoppingCart, ArrowLeftRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateTo, addToCart, toggleWishlist, isInWishlist, toggleComparison, isInComparison } = useStore();
  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
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
              : 'bg-white/80 hover:bg-white text-slate-400 hover:text-blue-600 shadow-xs'
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
              ? 'bg-pink-50 text-pink-600 shadow-xs'
              : 'bg-white/80 hover:bg-white text-slate-400 hover:text-pink-500 shadow-xs'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Image */}
      <div
        onClick={() => navigateTo('product_detail', { productId: product.id })}
        className="w-full h-48 sm:h-52 bg-slate-50 flex items-center justify-center p-3 cursor-pointer overflow-hidden relative"
      >
        <img
          src={product.images[0] || 'https://placehold.co/400x400/png?text=Product'}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category_name && (
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 truncate">
              {product.category_name}
            </p>
          )}

          <h3
            onClick={() => navigateTo('product_detail', { productId: product.id })}
            className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
              <span>{product.rating}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              ({product.review_count > 1000 ? `${(product.review_count / 1000).toFixed(1)}k` : product.review_count})
            </span>
            <span
              className={`text-[11px] font-bold ml-auto ${
                product.in_stock ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>
            {product.original_price > product.price && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                ₹{product.original_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {product.in_stock ? (
            <button
              onClick={() => addToCart(product, 1)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </button>
          ) : (
            <button
              disabled
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-not-allowed shrink-0"
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

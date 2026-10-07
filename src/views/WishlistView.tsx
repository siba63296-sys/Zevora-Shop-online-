import React from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ShoppingCart, Heart, Star, Trash2 } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart, navigateTo, cartCount } = useStore();

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('home')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Wishlist ({wishlist.length})
          </h1>
        </div>

        <button
          onClick={() => navigateTo('cart')}
          className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Wishlist Items List (Matching Screen 8) */}
      {wishlist.length > 0 ? (
        <div className="space-y-3">
          {wishlist.map(({ product }) => (
            <div
              key={product.id}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4"
            >
              {/* Product Image */}
              <div
                onClick={() => navigateTo('product_detail', { productId: product.id })}
                className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-xl p-2 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden border border-slate-100 dark:border-slate-800"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3
                    onClick={() => navigateTo('product_detail', { productId: product.id })}
                    className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                  >
                    {product.name}
                  </h3>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className="text-pink-600 dark:text-pink-400 hover:text-pink-700 p-1"
                    title="Remove from Wishlist"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.original_price > product.price && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 line-through tabular-nums">
                      ₹{product.original_price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">
                    ({product.review_count > 1000 ? `${(product.review_count / 1000).toFixed(1)}k` : product.review_count})
                  </span>
                </div>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={() => addToCart(product, 1)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="w-14 h-14 rounded-full bg-pink-50 dark:bg-pink-950/60 text-pink-500 dark:text-pink-400 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Your Wishlist is Empty</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tap the heart icon on any product to save it here for later!
          </p>
          <button
            onClick={() => navigateTo('home')}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
          >
            Explore Catalog
          </button>
        </div>
      )}
    </div>
  );
};

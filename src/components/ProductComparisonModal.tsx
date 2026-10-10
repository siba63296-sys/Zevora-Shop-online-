import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ArrowLeftRight,
  Star,
  ShoppingCart,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  Package,
  Layers,
} from 'lucide-react';
import { isElectricalProduct } from '../utils/productWarranty';

export const ProductComparisonModal: React.FC = () => {
  const {
    comparisonList,
    categories,
    removeFromComparison,
    clearComparison,
    isCompareModalOpen,
    setIsCompareModalOpen,
    addToCart,
    navigateTo,
  } = useStore();

  if (!isCompareModalOpen) return null;

  // Collect all unique specification labels across all compared products.
  // Never display warranty labels for products that are non-electrical.
  const allSpecLabels = Array.from(
    new Set(
      comparisonList.flatMap((p) => {
        const isElect = isElectricalProduct(p, categories);
        return (p.specs || [])
          .filter((s) => isElect || !/warranty|guarantee/i.test(s.label))
          .map((s) => s.label.trim());
      })
    )
  );

  const handleProductClick = (productId: string) => {
    setIsCompareModalOpen(false);
    navigateTo('product_detail', { productId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Product Comparison
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                  {comparisonList.length}/3 Selected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare key specifications, pricing, and availability side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparisonList.length > 0 && (
              <button
                type="button"
                onClick={clearComparison}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Clear all compared products"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCompareModalOpen(false)}
              className="w-9 h-9 rounded-xl hover:bg-slate-200/80 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label="Close comparison modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {comparisonList.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <ArrowLeftRight className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No products selected</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Select up to three products using the “Compare” button on any product card or detail page to view them side-by-side.
              </p>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div
                className="grid gap-4 min-w-[620px]"
                style={{
                  gridTemplateColumns: `200px repeat(${Math.max(comparisonList.length, 2)}, minmax(220px, 1fr))`,
                }}
              >
                {/* Column 0: Row Labels (Desktop) */}
                <div className="space-y-6 pt-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:block">
                  <div className="h-64 flex items-end pb-3 text-slate-700 dark:text-slate-300 font-extrabold text-sm normal-case border-b border-slate-100 dark:border-slate-800">
                    Product Overview
                  </div>
                  <div className="py-2 border-b border-slate-100 dark:border-slate-800">Price &amp; Offers</div>
                  <div className="py-2 border-b border-slate-100 dark:border-slate-800">Stock &amp; Availability</div>
                  <div className="py-2 border-b border-slate-100 dark:border-slate-800">Customer Rating</div>
                  <div className="py-2 border-b border-slate-100 dark:border-slate-800">Category</div>

                  {allSpecLabels.length > 0 && (
                    <div className="pt-2 text-slate-800 dark:text-slate-200 font-extrabold normal-case text-sm">
                      Specifications:
                    </div>
                  )}

                  {allSpecLabels.map((label) => (
                    <div key={label} className="py-2 border-b border-slate-100 dark:border-slate-800 truncate" title={label}>
                      {label}
                    </div>
                  ))}

                  <div className="py-2 border-b border-slate-100 dark:border-slate-800">Available Colors</div>
                  <div className="py-2 border-b border-slate-100 dark:border-slate-800">Sizes</div>
                  <div className="py-3">Purchase Action</div>
                </div>

                {/* Compared Products Columns */}
                {comparisonList.map((product) => {
                  return (
                    <div
                      key={product.id}
                      className="bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-6 flex flex-col justify-between"
                    >
                      {/* Product Header / Overview */}
                      <div className="h-64 flex flex-col justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-3 relative">
                        <button
                          type="button"
                          onClick={() => removeFromComparison(product.id)}
                          className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-center transition-colors z-10"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        <div
                          onClick={() => handleProductClick(product.id)}
                          className="w-full h-36 bg-white dark:bg-slate-900 rounded-xl p-2.5 flex items-center justify-center cursor-pointer border border-slate-100 dark:border-slate-800 overflow-hidden group"
                        >
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block truncate">
                            {product.category_name}
                          </span>
                          <h4
                            onClick={() => handleProductClick(product.id)}
                            className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer mt-0.5 leading-snug"
                            title={product.name}
                          >
                            {product.name}
                          </h4>
                        </div>
                      </div>

                      {/* Price & Offers */}
                      <div className="py-2 border-b border-slate-200/60 dark:border-slate-700/60 flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.original_price > product.price && (
                          <>
                            <span className="text-xs text-slate-400 dark:text-slate-500 line-through tabular-nums">
                              ₹{product.original_price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-sm">
                              {product.discount_percent}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {/* Stock & Availability */}
                      <div className="py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                        {product.in_stock && product.stock_quantity > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                            In Stock ({product.stock_quantity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="py-2 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                          <span>{product.rating}</span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          ({product.review_count} reviews)
                        </span>
                      </div>

                      {/* Category */}
                      <div className="py-2 border-b border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                        {product.category_name || 'General Catalog'}
                      </div>

                      {/* Spacer to align with section title */}
                      {allSpecLabels.length > 0 && (
                        <div className="pt-2 text-xs font-bold text-transparent select-none">
                          Specifications
                        </div>
                      )}

                      {/* Dynamic Specs */}
                      {allSpecLabels.map((label) => {
                        const isWarrantyLabel = /warranty|guarantee/i.test(label);
                        const isProductElect = isElectricalProduct(product, categories);

                        const matchedSpec = (product.specs || []).find(
                          (s) => s.label.trim().toLowerCase() === label.toLowerCase()
                        );

                        // If it's a warranty spec and product is non-electrical, never show warranty value
                        const displayValue = (isWarrantyLabel && !isProductElect) ? null : matchedSpec?.value;

                        return (
                          <div
                            key={label}
                            className="py-2 border-b border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 font-medium truncate"
                            title={displayValue || '—'}
                          >
                            <span className="sm:hidden font-bold text-slate-400 dark:text-slate-500 block text-[10px]">
                              {label}:
                            </span>
                            {displayValue ? displayValue : <span className="text-slate-300 dark:text-slate-600">—</span>}
                          </div>
                        );
                      })}

                      {/* Colors */}
                      <div className="py-2 border-b border-slate-200/60 dark:border-slate-700/60 text-xs">
                        {product.colors && product.colors.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {product.colors.map((c, i) => (
                              <span
                                key={i}
                                className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 inline-block shadow-2xs"
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                              />
                            ))}
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              ({product.colors.length})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </div>

                      {/* Sizes */}
                      <div className="py-2 border-b border-slate-200/60 dark:border-slate-700/60 text-xs">
                        {product.sizes && product.sizes.length > 0 ? (
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {product.sizes.join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 space-y-2">
                        {product.in_stock ? (
                          <button
                            type="button"
                            onClick={() => addToCart(product, 1)}
                            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-not-allowed"
                          >
                            <span>Out of Stock</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleProductClick(product.id)}
                          className="w-full py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Empty slot placeholder if fewer than 3 products */}
                {comparisonList.length < 3 && (
                  <div className="bg-dashed border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2 min-h-[300px]">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Another Product</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[160px]">
                      You can add up to {3 - comparisonList.length} more item{3 - comparisonList.length > 1 ? 's' : ''} to compare side-by-side.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCompareModalOpen(false)}
                      className="mt-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Browse More
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Floating Bottom Comparison Bar (Dock)
export const ComparisonDock: React.FC = () => {
  const { comparisonList, removeFromComparison, clearComparison, setIsCompareModalOpen, isCompareModalOpen } = useStore();

  if (comparisonList.length === 0 || isCompareModalOpen) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-slate-800 flex items-center gap-3">
        {/* Thumbnails */}
        <div className="flex items-center gap-1.5 pl-1">
          {comparisonList.map((product) => (
            <div
              key={product.id}
              className="relative w-9 h-9 rounded-xl bg-white p-1 border border-slate-700 overflow-hidden shrink-0 group"
              title={product.name}
            >
              <img
                src={product.images[0]}
                alt=""
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromComparison(product.id);
                }}
                className="absolute inset-0 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {Array.from({ length: 3 - comparisonList.length }).map((_, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-[10px]"
            >
              +
            </div>
          ))}
        </div>

        {/* Info & Action */}
        <div className="flex items-center gap-2 pr-1">
          <div className="hidden sm:block">
            <p className="text-xs font-bold leading-none">Compare Products</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{comparisonList.length} of 3 selected</p>
          </div>

          <button
            type="button"
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Compare ({comparisonList.length})</span>
          </button>

          <button
            type="button"
            onClick={clearComparison}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Clear all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

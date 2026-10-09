import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import {
  ChevronLeft,
  ShoppingCart,
  ArrowUpDown,
  Filter,
  Check,
  Sparkles,
  Star,
  Percent,
  SlidersHorizontal,
  X,
  PackageOpen,
} from 'lucide-react';

export type SortOption =
  | 'featured'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'best_rated'
  | 'discount_desc';

interface SortConfig {
  id: SortOption;
  label: string;
  shortLabel: string;
  icon?: React.ReactNode;
}

const SORT_OPTIONS: SortConfig[] = [
  { id: 'featured', label: 'Featured / Recommended', shortLabel: 'Featured' },
  { id: 'price_asc', label: 'Price: Low to High', shortLabel: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low', shortLabel: 'Price: High to Low' },
  { id: 'newest', label: 'Newest First', shortLabel: 'Newest' },
  { id: 'best_rated', label: 'Best Rated', shortLabel: 'Best Rated' },
  { id: 'discount_desc', label: 'Biggest Discount', shortLabel: 'Discount' },
];

export const ProductListView: React.FC = () => {
  const { products, categories, selectedCategoryId, navigateTo, cartCount } = useStore();
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [localCategoryId, setLocalCategoryId] = useState<string | null>(selectedCategoryId);

  // Keep local category synced if global changes
  React.useEffect(() => {
    setLocalCategoryId(selectedCategoryId);
  }, [selectedCategoryId]);

  const currentCategory = localCategoryId
    ? categories.find((c) => c.id === localCategoryId)
    : null;

  // Filter products by category and in-stock condition
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (localCategoryId) {
        const catObj = categories.find((c) => c.id === localCategoryId || c.slug === localCategoryId);
        const targetIds = new Set([localCategoryId, catObj?.id, catObj?.slug].filter(Boolean));
        const productCatIds = [
          p.category_id,
          ...(Array.isArray(p.category_ids) ? p.category_ids : []),
        ].filter(Boolean);

        const matches = productCatIds.some((cid) => targetIds.has(cid));
        if (!matches) {
          return false;
        }
      }
      // In-stock filter
      if (inStockOnly && (!p.in_stock || p.stock_quantity <= 0)) {
        return false;
      }
      return true;
    });
  }, [products, localCategoryId, inStockOnly, categories]);

  // Sort logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return list.sort((a, b) => b.price - a.price);
      case 'newest':
        return list.sort((a, b) => {
          if (a.created_at && b.created_at) {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
              return timeB - timeA;
            }
          }
          return (b.id || '').localeCompare(a.id || '');
        });
      case 'best_rated':
        return list.sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          return (b.review_count || 0) - (a.review_count || 0);
        });
      case 'discount_desc':
        return list.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
      case 'featured':
      default:
        return list.sort((a, b) => {
          if ((b.is_featured ? 1 : 0) !== (a.is_featured ? 1 : 0)) {
            return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
          }
          return (b.rating || 0) - (a.rating || 0);
        });
    }
  }, [filteredProducts, sortBy]);

  const handleCategorySelect = (categoryId: string | null) => {
    setLocalCategoryId(categoryId);
  };

  const handleResetFilters = () => {
    setSortBy('featured');
    setInStockOnly(false);
  };

  const isFilteredOrSorted = sortBy !== 'featured' || inStockOnly;

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto px-1 sm:px-2">
      {/* Top bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('categories')}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
            title="Back to Categories"
            aria-label="Back to Categories"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {currentCategory?.name || 'All Products'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'item' : 'items'}
              {currentCategory ? ` in ${currentCategory.name}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('cart')}
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
            title="Cart"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => handleCategorySelect(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            localCategoryId === null
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              localCategoryId === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sorting & Filter Control Toolbar */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Sorting Dropdown Control */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <ArrowUpDown className="w-4 h-4 text-blue-600" />
              <span>Sort By:</span>
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl pl-3 pr-8 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer transition-colors"
                aria-label="Select product sorting order"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />
              </div>
            </div>
          </div>

          {/* Quick Filters / Toggles */}
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            {isFilteredOrSorted && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                title="Reset sort and filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Sort Tabs / Pill Buttons */}
        <div className="pt-2 border-t border-slate-200/80">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
              Quick Sort:
            </span>

            <button
              onClick={() => setSortBy('featured')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                sortBy === 'featured'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Featured</span>
            </button>

            <button
              onClick={() => setSortBy('price_asc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                sortBy === 'price_asc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Price: Low to High</span>
              <span className="text-[10px] opacity-80">↑</span>
            </button>

            <button
              onClick={() => setSortBy('price_desc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                sortBy === 'price_desc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Price: High to Low</span>
              <span className="text-[10px] opacity-80">↓</span>
            </button>

            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                sortBy === 'newest'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Newest First</span>
            </button>

            <button
              onClick={() => setSortBy('best_rated')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                sortBy === 'best_rated'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3 h-3 fill-current text-amber-400" />
              <span>Best Rated</span>
            </button>

            <button
              onClick={() => setSortBy('discount_desc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                sortBy === 'discount_desc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Percent className="w-3 h-3" />
              <span>Biggest Discount</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Sort/Filter summary */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div>
          Showing <span className="font-bold text-slate-900">{sortedProducts.length}</span> products
          {sortBy !== 'featured' && (
            <span>
              {' '}
              • Sorted by{' '}
              <span className="font-semibold text-blue-700">
                {SORT_OPTIONS.find((s) => s.id === sortBy)?.label}
              </span>
            </span>
          )}
          {inStockOnly && (
            <span className="text-emerald-700 font-semibold"> • In stock only</span>
          )}
        </div>
      </div>

      {/* Products Grid or Empty State */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              No products found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              We couldn&apos;t find any products matching your current filters. Try resetting the sort or filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            Reset Filters & Sorting
          </button>
        </div>
      )}
    </div>
  );
};

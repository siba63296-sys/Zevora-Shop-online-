import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { resolveImageUrl } from '../utils/imageUrl';
import {
  getRecentSearches,
  removeRecentSearch,
  clearRecentSearches,
  POPULAR_SEARCH_TERMS,
} from '../utils/recentSearches';
import {
  Clock,
  Flame,
  Search,
  TrendingUp,
  X,
  ArrowRight,
  Sparkles,
  Star,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onSelectQuery: (term: string) => void;
  onSelectProduct: (productId: string) => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  isOpen,
  onClose,
  query,
  onSelectQuery,
  onSelectProduct,
  onSelectCategory,
}) => {
  const { products, categories } = useStore();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Refresh recent searches whenever the dropdown opens
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
    }
  }, [isOpen]);

  const handleRemoveRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(term);
    setRecentSearches(updated);
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  // Trending products: featured, deals, or high-rated products
  const trendingProducts = useMemo(() => {
    return products
      .filter((p) => Boolean(p.is_deal || p.is_featured || (p.rating && p.rating >= 4.5)))
      .slice(0, 5);
  }, [products]);

  // Live matching products when typing
  const cleanQuery = query.trim().toLowerCase();
  const matchingProducts = useMemo(() => {
    if (!cleanQuery) return [];
    return products
      .filter((p) => {
        const matchesName = p.name.toLowerCase().includes(cleanQuery);
        const matchesCat = p.category_name?.toLowerCase().includes(cleanQuery);
        const matchesMultiCats =
          Array.isArray(p.category_names) &&
          p.category_names.some((cn) => cn.toLowerCase().includes(cleanQuery));
        const matchesBrand = p.brand?.toLowerCase().includes(cleanQuery);
        return matchesName || matchesCat || matchesMultiCats || matchesBrand;
      })
      .slice(0, 5);
  }, [products, cleanQuery]);

  // Matching categories when typing
  const matchingCategories = useMemo(() => {
    if (!cleanQuery) return [];
    return categories
      .filter((c) => c.name.toLowerCase().includes(cleanQuery) || c.slug.toLowerCase().includes(cleanQuery))
      .slice(0, 3);
  }, [categories, cleanQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto"
      onMouseDown={(e) => {
        // Prevent click inside from causing blur on the search input before action happens
        e.stopPropagation();
      }}
    >
      {/* CASE 1: USER IS TYPING IN SEARCH BAR */}
      {cleanQuery ? (
        <div className="p-3.5 sm:p-4 space-y-4">
          {/* Quick Submit CTA */}
          <button
            type="button"
            onClick={() => onSelectQuery(query)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold truncate">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">
                Search for "<span className="font-bold">{query}</span>"
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
              <span>View all results</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Matching Categories */}
          {matchingCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span>Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchingCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(cat.id);
                      } else {
                        onSelectQuery(cat.name);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Products */}
          {matchingProducts.length > 0 ? (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Products ({matchingProducts.length})</span>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {matchingProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onSelectProduct(product.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                      <img
                        src={resolveImageUrl(product.images?.[0])}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                          ₹{(Number(product.price) || 0).toLocaleString('en-IN')}
                        </span>
                        {product.discount_percent > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full">
                            {product.discount_percent}% OFF
                          </span>
                        )}
                        {product.category_name && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate hidden sm:inline">
                            · {product.category_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 dark:text-slate-400">
              <p className="text-xs font-medium">No matching products found for "{query}"</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Try searching with popular keywords below
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {POPULAR_SEARCH_TERMS.slice(0, 5).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onSelectQuery(term)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CASE 2: EMPTY SEARCH INPUT - SHOW RECENT SEARCHES & TRENDING PRODUCTS */
        <div className="p-4 space-y-5">
          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Recent Searches</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAllRecent}
                  className="text-[11px] font-medium text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    onClick={() => onSelectQuery(term)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer group"
                  >
                    <Clock className="w-3 h-3 text-slate-400 group-hover:text-blue-500 shrink-0" />
                    <span>{term}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveRecent(e, term)}
                      className="p-0.5 ml-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Remove from history"
                      aria-label={`Remove ${term} from recent searches`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>Popular Searches</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                Trending
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCH_TERMS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onSelectQuery(term)}
                  className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/80 dark:hover:bg-blue-950/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3 h-3 text-slate-400" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Products Section */}
          {trendingProducts.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Flame className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                  <span>Trending Products</span>
                </div>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  Hot Deals 🔥
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trendingProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onSelectProduct(product.id)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-blue-50/80 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-lg bg-white dark:bg-slate-900 p-1 shrink-0 flex items-center justify-center overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                      <img
                        src={resolveImageUrl(product.images?.[0])}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                          ₹{(Number(product.price) || 0).toLocaleString('en-IN')}
                        </span>
                        {product.discount_percent > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {product.discount_percent}% off
                          </span>
                        )}
                        <div className="flex items-center text-amber-500 text-[10px] font-bold ml-auto shrink-0">
                          <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                          <span>{Number(product.rating || 4.5)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

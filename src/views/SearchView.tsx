import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Search, X, ChevronLeft, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from '../utils/recentSearches';

export const SearchView: React.FC = () => {
  const { products, searchQuery, setSearchQuery, navigateTo, cartCount } = useStore();
  const [query, setQuery] = useState(searchQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
    }
    setRecentSearches(getRecentSearches());
  }, [searchQuery]);

  const handleSelectSearch = (term: string) => {
    const clean = term.trim();
    setQuery(clean);
    setSearchQuery(clean);
    if (clean) {
      const updated = addRecentSearch(clean);
      setRecentSearches(updated);
    }
  };

  const handleRemoveRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(term);
    setRecentSearches(updated);
  };

  const handleClearAllRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const filteredProducts = products.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const matchesCatNames = Array.isArray(p.category_names) && p.category_names.some((cn) => cn.toLowerCase().includes(q));
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category_name && p.category_name.toLowerCase().includes(q)) ||
      matchesCatNames
    );
  });

  const popularSearches = ['iPhone', 'Samsung S24', 'Headphones', 'Smart Watch', 'Nike', 'MacBook'];

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('home')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Search Store</h1>
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

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) {
            handleSelectSearch(query);
          }
        }}
        className="relative"
      >
        <input
          type="text"
          placeholder="Search products, brands, models..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchQuery(e.target.value);
          }}
          autoFocus
          className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSearchQuery('');
            }}
            className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center absolute right-3.5 top-3.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Recent Searches Pills (if any exist) */}
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-semibold shrink-0">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Recent:</span>
          </div>
          {recentSearches.map((term) => (
            <div
              key={term}
              onClick={() => handleSelectSearch(term)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700/80 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer group"
            >
              <span>{term}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveRecent(e, term)}
                className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleClearAllRecent}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors shrink-0 px-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Trending / Popular search tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-semibold shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
          <span>Popular:</span>
        </div>
        {popularSearches.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleSelectSearch(tag)}
            className="px-3 py-1 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
        <span>{filteredProducts.length} items found</span>
        {query && <span>Filtering for "{query}"</span>}
      </div>

      {/* Product Results Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No products found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try checking your spelling or use more general terms.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
          >
            View All Products
          </button>
        </div>
      )}
    </div>
  );
};

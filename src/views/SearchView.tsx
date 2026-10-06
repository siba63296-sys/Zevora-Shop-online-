import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Search, X, ChevronLeft, ShoppingCart, TrendingUp } from 'lucide-react';

export const SearchView: React.FC = () => {
  const { products, searchQuery, setSearchQuery, navigateTo, cartCount } = useStore();
  const [query, setQuery] = useState(searchQuery);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const filteredProducts = products.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category_name && p.category_name.toLowerCase().includes(q))
    );
  });

  const popularSearches = ['iPhone', 'Samsung S24', 'Headphones', 'Smart Watch', 'Nike', 'MacBook'];

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('home')}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Search Store</h1>
        </div>

        <button
          onClick={() => navigateTo('cart')}
          className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
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
      <div className="relative">
        <input
          type="text"
          placeholder="Search products, brands, models..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchQuery(e.target.value);
          }}
          autoFocus
          className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSearchQuery('');
            }}
            className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center absolute right-3.5 top-3.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Trending / Popular search tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold shrink-0">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Popular:</span>
        </div>
        {popularSearches.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setQuery(tag);
              setSearchQuery(tag);
            }}
            className="px-3 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded-full text-xs font-medium text-slate-600 transition-colors shrink-0"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
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
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No products found</h3>
          <p className="text-xs text-slate-500 mt-1">
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

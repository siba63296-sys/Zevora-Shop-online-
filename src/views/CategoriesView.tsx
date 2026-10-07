import React, { useState, useMemo } from 'react';
import { useStore, isDeletedCategory } from '../context/StoreContext';
import { CategoryCard } from '../components/CategoryCard';
import { Search, ChevronLeft, ShoppingCart } from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { categories, navigateTo, cartCount } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const visibleCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((cat) => {
      if (isDeletedCategory(cat)) return false;
      const cleanName = (cat.name || '').trim().toLowerCase();
      if (seen.has(cleanName)) return false;
      seen.add(cleanName);
      return true;
    });
  }, [categories]);

  const filteredCategories = visibleCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('home')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Categories</h1>
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

      {/* Search Categories input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search Categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
      </div>

      {/* Category List */}
      <div className="space-y-2.5 pt-1">
        {filteredCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No categories found matching "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-3 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

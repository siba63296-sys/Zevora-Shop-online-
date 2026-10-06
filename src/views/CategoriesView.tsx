import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CategoryCard } from '../components/CategoryCard';
import { Search, ChevronLeft, ShoppingCart } from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { categories, navigateTo, cartCount } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('home')}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Categories</h1>
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

      {/* Search Categories input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search Categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
      </div>

      {/* Category List */}
      <div className="space-y-2.5 pt-1">
        {filteredCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-sm font-semibold text-slate-600">No categories found matching "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-3 px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Category } from '../types';
import { useStore } from '../context/StoreContext';
import {
  Smartphone,
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Gamepad2,
  BookOpen,
  ShoppingBag,
  Headphones,
  ChevronRight,
} from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  compact?: boolean;
}

const ICON_MAP: Record<string, any> = {
  Smartphone,
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  Gamepad2,
  BookOpen,
  ShoppingBag,
  Headphones,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, compact = false }) => {
  const { navigateTo } = useStore();
  const IconComponent = ICON_MAP[category.icon_name] || ShoppingBag;
  const isHexOrRgb = category.color_bg && (category.color_bg.startsWith('#') || category.color_bg.startsWith('rgb'));
  const colorStyle = isHexOrRgb ? { backgroundColor: category.color_bg } : undefined;
  const colorClass = isHexOrRgb ? '' : (category.color_bg || 'bg-blue-600');

  if (compact) {
    return (
      <button
        onClick={() => navigateTo('category_products', { categoryId: category.id })}
        className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all group shrink-0 w-24 text-center"
      >
        <div
          style={colorStyle}
          className={`w-12 h-12 rounded-2xl ${colorClass} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform mb-2`}
        >
          <IconComponent className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {category.name}
        </span>
        <span className="text-[10px] text-slate-400 mt-0.5">
          {category.product_count}+
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigateTo('category_products', { categoryId: category.id })}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all group text-left"
    >
      <div className="flex items-center gap-3.5">
        <div
          style={colorStyle}
          className={`w-12 h-12 rounded-2xl ${colorClass} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}
        >
          <IconComponent className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {category.name}
          </h4>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {category.product_count}+ Products
          </p>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center transition-colors">
        <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  );
};

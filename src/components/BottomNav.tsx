import React from 'react';
import { useStore } from '../context/StoreContext';
import { Home, Search, LayoutGrid, Heart, User, Menu } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentPage, navigateTo, wishlist, cartCount } = useStore();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { id: 'profile', label: 'Account', icon: User },
    { id: 'settings', label: 'Menu', icon: Menu },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentPage === item.id ||
            (item.id === 'categories' && currentPage === 'category_products');

          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

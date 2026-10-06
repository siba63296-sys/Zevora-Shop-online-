import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Home,
  LayoutGrid,
  Tag,
  Bell,
  Settings,
  FileText,
  Lock,
  LogOut,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react';

export const MenuView: React.FC = () => {
  const { navigateTo, signOut, cartCount, showToast } = useStore();

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Menu</h1>

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

      {/* Main Menu Links (Matching Screen 13) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {/* Home */}
        <button
          onClick={() => navigateTo('home')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Home</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Categories */}
        <button
          onClick={() => navigateTo('categories')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Categories</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Deals & Offers */}
        <button
          onClick={() => navigateTo('category_products', { categoryId: 'cat-mobiles' })}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Deals &amp; Offers</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => showToast('You have 2 new unread offers in your inbox!', 'info')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Notifications</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigateTo('settings')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Terms & Conditions */}
        <button
          onClick={() => navigateTo('terms')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Terms &amp; Conditions</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Privacy Policy */}
        <button
          onClick={() => navigateTo('privacy')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Privacy Policy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Log out */}
      <button
        onClick={() => signOut()}
        className="w-full py-3.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>
    </div>
  );
};

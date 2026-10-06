import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Search,
  User,
  Menu as MenuIcon,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  ArrowLeftRight,
  ShieldCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentPage,
    navigateTo,
    cartCount,
    wishlist,
    comparisonList,
    setIsCompareModalOpen,
    user,
    searchQuery,
    setSearchQuery,
    signOut,
    storeSettings,
  } = useStore();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigateTo('search', { searchQuery: searchInput.trim() });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        {/* Slim Announcement Bar at very top */}
        <div className="bg-blue-600 text-white text-[11px] sm:text-xs py-1 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-2">
          <span>🇮🇳 All India Delivery Available</span>
        </div>

        {/* Top Announcement banner */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-white truncate">Special Offer: Free Express Delivery on orders above ₹1,999!</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
              <span className="text-slate-300 font-medium">100% Genuine Products</span>
              <span>·</span>
              <span className="text-slate-300 font-medium">Easy 7-Day Returns</span>
              <span>·</span>
              <button
                onClick={() => navigateTo('admin')}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin Panel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand Wordmark & Logo */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 text-left group shrink-0"
          >
            {storeSettings.logo_url ? (
              <img
                src={storeSettings.logo_url}
                alt={storeSettings.store_name}
                className="w-9 h-9 object-contain rounded-xl border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {storeSettings.store_name || 'Zevora'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                {storeSettings.tagline || 'Official Web Platform'}
              </span>
            </div>
          </button>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg relative items-center"
          >
            <input
              type="text"
              placeholder="Search Products, Categories, Brands..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-20 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search icon on mobile */}
            <button
              onClick={() => navigateTo('search')}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Compare Products */}
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              title="Compare Products (up to 3)"
              aria-label="Compare products"
            >
              <ArrowLeftRight className="w-5 h-5" />
              {comparisonList.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {comparisonList.length}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigateTo('wishlist')}
              className={`relative p-2 rounded-xl transition-colors ${
                currentPage === 'wishlist'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={() => navigateTo('cart')}
              className={`relative p-2 rounded-xl transition-colors ${
                currentPage === 'cart'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title="Cart"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-slate-700"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span className="hidden lg:inline text-xs font-semibold text-slate-800">
                  {user ? user.full_name : 'Sign In'}
                </span>
                <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => navigateTo('profile')}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </button>
                      <button
                        onClick={() => navigateTo('orders')}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        Order History
                      </button>
                      <button
                        onClick={() => navigateTo('settings')}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                        Settings
                      </button>
                      <button
                        onClick={() => navigateTo('admin')}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        Admin Dashboard
                      </button>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => signOut()}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigateTo('login')}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Sign In / Register
                      </button>
                      <button
                        onClick={() => navigateTo('admin')}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-500" />
                        Store Admin Login
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Menu drawer button on mobile */}
            <button
              onClick={() => navigateTo('settings')}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
              title="Menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links Strip */}
        <nav className="hidden lg:block bg-slate-50/80 border-t border-slate-100 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigateTo('home')}
                className={`transition-colors hover:text-blue-600 ${
                  currentPage === 'home' ? 'text-blue-600 font-bold' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo('categories')}
                className={`transition-colors hover:text-blue-600 ${
                  currentPage === 'categories' ? 'text-blue-600 font-bold' : ''
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => navigateTo('category_products', { categoryId: 'cat-mobiles' })}
                className="transition-colors hover:text-blue-600"
              >
                Mobiles & Tablets
              </button>
              <button
                onClick={() => navigateTo('category_products', { categoryId: 'cat-laptops' })}
                className="transition-colors hover:text-blue-600"
              >
                Laptops & Tech
              </button>
              <button
                onClick={() => navigateTo('category_products', { categoryId: 'cat-fashion' })}
                className="transition-colors hover:text-blue-600"
              >
                Fashion
              </button>
              <button
                onClick={() => navigateTo('category_products', { categoryId: 'cat-home' })}
                className="transition-colors hover:text-blue-600"
              >
                Home & Living
              </button>
              <button
                onClick={() => navigateTo('category_products', { categoryId: 'cat-beauty' })}
                className="transition-colors hover:text-blue-600"
              >
                Beauty
              </button>
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <button
                onClick={() => navigateTo('orders')}
                className="hover:text-slate-900 transition-colors"
              >
                Track Order
              </button>
              <button
                onClick={() => navigateTo('help')}
                className="hover:text-slate-900 transition-colors"
              >
                Help & Support
              </button>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

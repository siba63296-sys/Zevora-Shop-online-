import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import zevoraOfficialLogo from '../assets/images/zevora-header-logo.png';
import { SearchDropdown } from './SearchDropdown';
import { addRecentSearch } from '../utils/recentSearches';
import { PWAInstallButton } from './PWAInstallButton';
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
  Moon,
  Sun,
  X,
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
    isDarkMode,
    toggleDarkMode,
    showToast,
  } = useStore();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync internal search input with external searchQuery changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Click outside to close search dropdown and user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideDesktop = searchContainerRef.current?.contains(target);
      const clickedInsideMobile = mobileSearchContainerRef.current?.contains(target);
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setIsSearchDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchDropdownOpen(false);
        setShowMobileSearch(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleExecuteSearch = (term: string) => {
    const clean = term.trim();
    if (clean) {
      addRecentSearch(clean);
      setSearchInput(clean);
      setIsSearchDropdownOpen(false);
      setShowMobileSearch(false);
      navigateTo('search', { searchQuery: clean });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(searchInput);
  };

  const handleSelectProduct = (productId: string) => {
    if (searchInput.trim()) {
      addRecentSearch(searchInput.trim());
    }
    setIsSearchDropdownOpen(false);
    setShowMobileSearch(false);
    navigateTo('product_detail', { productId });
  };

  const handleSelectCategory = (categoryId: string) => {
    setIsSearchDropdownOpen(false);
    setShowMobileSearch(false);
    navigateTo('category_products', { categoryId });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        {/* Slim Announcement Bar at very top */}
        <div className="bg-blue-600 text-white text-[11px] sm:text-xs py-1 px-4 text-center font-semibold tracking-wide flex items-center justify-center gap-2">
          <span>🇮🇳 All India Delivery Available</span>
        </div>

        {/* Top Announcement banner */}
        <div className="bg-slate-900 dark:bg-slate-950 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800/60">
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
            className="flex items-center gap-3 text-left group shrink-0"
          >
            <div className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden bg-[#090a0d] shrink-0 border border-amber-500/30 shadow-xs flex items-center justify-center">
              <img
                src={storeSettings.logo_url && !storeSettings.logo_url.includes('zevora-logo') ? storeSettings.logo_url : zevoraOfficialLogo}
                alt={storeSettings.store_name || 'ZEVORA'}
                className="w-full h-full object-contain aspect-square"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                {storeSettings.store_name || 'ZEVORA'}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                {storeSettings.tagline || 'INDIA PREMIER ONLINE SHOPPING DESTINATION'}
              </span>
            </div>
          </button>

          {/* Desktop Search Bar with SearchDropdown */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-lg relative items-center">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative flex items-center"
            >
              <input
                type="text"
                placeholder="Search Products, Categories, Brands..."
                value={searchInput}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onClick={() => setIsSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                className="w-full pl-10 pr-24 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800 dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <div className="absolute right-1.5 flex items-center gap-1">
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setIsSearchDropdownOpen(true);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            <SearchDropdown
              isOpen={isSearchDropdownOpen}
              onClose={() => setIsSearchDropdownOpen(false)}
              query={searchInput}
              onSelectQuery={handleExecuteSearch}
              onSelectProduct={handleSelectProduct}
              onSelectCategory={handleSelectCategory}
            />
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Dark Mode Quick Toggle */}
            <button
              onClick={() => {
                toggleDarkMode();
                showToast(!isDarkMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
              }}
              className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Search icon on mobile */}
            <button
              onClick={() => {
                const next = !showMobileSearch;
                setShowMobileSearch(next);
                if (next) {
                  setIsSearchDropdownOpen(true);
                  setTimeout(() => mobileInputRef.current?.focus(), 50);
                } else {
                  setIsSearchDropdownOpen(false);
                }
              }}
              className={`md:hidden p-2 rounded-xl transition-colors ${
                showMobileSearch
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Compare Products */}
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="relative p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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

            {/* Install App button in header */}
            <PWAInstallButton variant="header" />

            {/* Shopping Cart */}
            <button
              onClick={() => navigateTo('cart')}
              className={`relative p-2 rounded-xl transition-colors ${
                currentPage === 'cart'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-slate-700 dark:text-slate-300"
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <span className="hidden lg:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {user ? user.full_name : 'Sign In'}
                </span>
                <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => navigateTo('profile')}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile
                      </button>
                      <button
                        onClick={() => navigateTo('orders')}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        Order History
                      </button>
                      <button
                        onClick={() => navigateTo('settings')}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                        Settings &amp; Dark Mode
                      </button>
                      <button
                        onClick={() => navigateTo('admin')}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Admin Dashboard
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                      <button
                        onClick={() => signOut()}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigateTo('login')}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        Sign In / Register
                      </button>
                      <button
                        onClick={() => navigateTo('settings')}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                        Settings &amp; Dark Mode
                      </button>
                      <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800">
                        <PWAInstallButton variant="header" className="w-full justify-center" />
                      </div>
                      <button
                        onClick={() => navigateTo('admin')}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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
              className="lg:hidden p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              title="Menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Row Bar (expandable) */}
        {showMobileSearch && (
          <div
            ref={mobileSearchContainerRef}
            className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center"
            >
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search Products, Categories, Brands..."
                value={searchInput}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onClick={() => setIsSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                className="w-full pl-10 pr-24 py-2.5 bg-slate-100/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <div className="absolute right-1.5 flex items-center gap-1">
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setIsSearchDropdownOpen(true);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  Search
                </button>
              </div>
            </form>

            <SearchDropdown
              isOpen={isSearchDropdownOpen}
              onClose={() => setIsSearchDropdownOpen(false)}
              query={searchInput}
              onSelectQuery={handleExecuteSearch}
              onSelectProduct={handleSelectProduct}
              onSelectCategory={handleSelectCategory}
            />
          </div>
        )}

        {/* Desktop Navigation Links Strip */}
        <nav className="hidden lg:block bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigateTo('home')}
                className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  currentPage === 'home' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo('categories')}
                className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  currentPage === 'categories' ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => navigateTo('category_products', { categoryId: 'cat-mobiles' })}
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Mobiles & Tablets
              </button>
              <button
                onClick={() => navigateTo('category_products', { categoryId: 'cat-laptops' })}
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Laptops & Tech
              </button>
              <button
                onClick={() => navigateTo('category_products', { categoryId: 'cat-fashion' })}
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Fashion
              </button>
              <button
                onClick={() => navigateTo('category_products', { categoryId: 'cat-electronics' })}
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Electronics &amp; Audio
              </button>
              <button
                onClick={() => navigateTo('category_products', { categoryId: 'cat-girls-collection' })}
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Girls Collection
              </button>
            </div>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
              <button
                onClick={() => navigateTo('orders')}
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Track Order
              </button>
              <button
                onClick={() => navigateTo('help')}
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
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

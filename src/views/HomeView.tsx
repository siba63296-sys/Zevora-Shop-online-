import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { DynamicOfferBanner } from '../components/DynamicOfferBanner';
import { AvailableCoupons } from '../components/AvailableCoupons';
import {
  ShoppingBag,
  ShoppingCart,
  Clock,
  Heart,
  Tag,
  Headphones,
  Truck,
  RotateCcw,
  CreditCard,
  ChevronRight,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { products, categories, cartCount, user, navigateTo, storeSettings, refreshCatalog } = useStore();

  // Ensure latest catalog synchronization with Supabase on customer Home Page load
  useEffect(() => {
    refreshCatalog().catch(() => {});
  }, []);

  // Fetch all products marked as Favourite / Featured in Admin, prioritizing newly featured/added products
  const featuredProducts = useMemo(() => {
    return products
      .filter((p) => Boolean(p.is_featured))
      .sort((a, b) => {
        const timeA = a.featured_at
          ? new Date(a.featured_at).getTime()
          : (a.created_at ? new Date(a.created_at).getTime() : 0);
        const timeB = b.featured_at
          ? new Date(b.featured_at).getTime()
          : (b.created_at ? new Date(b.created_at).getTime() : 0);
        return timeB - timeA;
      });
  }, [products]);

  const dealProducts = products.filter((p) => p.is_deal);

  const userName = user?.full_name ? user.full_name.split(' ')[0] : 'Shopper';

  const instagramUrl = storeSettings?.instagram_url || 'https://www.instagram.com/iam._.siba?stkn=MXJscXk1cjY3Y2RjeA==';
  const facebookUrl = storeSettings?.facebook_url || 'https://www.facebook.com/share/1BwPkL392F/';
  const twitterUrl = storeSettings?.twitter_url || 'https://x.com/SibaRajRayqf';

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & User Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Welcome, {userName}! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Find the best deals on smartphones, electronics, fashion and more.
          </p>
        </div>

        <button
          onClick={() => navigateTo('orders')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Track Order</span>
        </button>
      </div>

      {/* Dynamic Admin-Controlled Offer Banner */}
      <DynamicOfferBanner />

      {/* Promo Micro-Tiles (Tech Deals & Gaming Gear) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div
          onClick={() => navigateTo('category_products', { categoryId: 'cat-mobiles' })}
          className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-100 block">
              Featured Category
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">Tech Deals</h4>
            <p className="text-xs text-blue-100 font-medium mt-0.5">120+ Deals Active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        <div
          onClick={() => navigateTo('category_products', { categoryId: 'cat-electronics' })}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white cursor-pointer hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-100 block">
              Audio &amp; Wearables
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">Electronics &amp; Audio</h4>
            <p className="text-xs text-amber-100 font-medium mt-0.5">Premium Gear</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Tag className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Available Coupons Section */}
      <AvailableCoupons />

      {/* Main 6 Quick Action Grid Cards (Matching Screen 1 of Reference Image) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Actions
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Shop Categories */}
          <button
            onClick={() => navigateTo('categories')}
            className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center text-center shadow-xs transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Shop Categories</span>
          </button>

          {/* 2. My Cart */}
          <button
            onClick={() => navigateTo('cart')}
            className="p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white flex flex-col items-center justify-center text-center shadow-xs transition-all active:scale-95 group relative"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">
              My Cart {cartCount > 0 ? `(${cartCount})` : ''}
            </span>
          </button>

          {/* 3. Order History */}
          <button
            onClick={() => navigateTo('orders')}
            className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex flex-col items-center justify-center text-center shadow-xs transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Order History</span>
          </button>

          {/* 4. Wishlist */}
          <button
            onClick={() => navigateTo('wishlist')}
            className="p-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center justify-center text-center shadow-xs transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Wishlist</span>
          </button>

          {/* 5. Today's Deals */}
          <button
            onClick={() => navigateTo('category_products', { categoryId: 'cat-mobiles' })}
            className="p-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex flex-col items-center justify-center text-center shadow-xs transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Today's Deals</span>
          </button>

          {/* 6. Help & Customer Support */}
          <button
            onClick={() => navigateTo('help')}
            className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center text-center shadow-xs transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Help & Support</span>
          </button>
        </div>
      </div>

      {/* Quick Access Bar (Track Order, Reorder Fast, Saved Payment) */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Quick Access
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigateTo('orders')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="truncate">Track Order</span>
          </button>

          <button
            onClick={() => navigateTo('orders')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate">Reorder Fast</span>
          </button>

          <button
            onClick={() => navigateTo('profile')}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="truncate">Saved Payment</span>
          </button>
        </div>
      </div>

      {/* Top Categories Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Explore Top Categories</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Handpicked collections for you</p>
          </div>
          <button
            onClick={() => navigateTo('categories')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} compact />
          ))}
        </div>
      </div>

      {/* Featured Deals & Trending Products Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Featured Deals</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Trending picks with verified customer ratings</p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('category_products', { categoryId: 'cat-mobiles' })}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-0.5"
          >
            <span>See More</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No Featured Deals Selected</p>
            <p className="text-xs text-slate-400 mt-1">Mark products as Favourite / Featured in the Admin Panel to display them here.</p>
          </div>
        )}
      </div>

      {/* Social Media Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left space-y-1">
          <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
            Follow us on Social Media for More Offers, Mega Deals &amp; Exclusive Discounts!
          </h3>
          <p className="text-xs text-blue-200">
            Stay updated with our latest launches, mega sales, and exclusive promo codes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
          {/* Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white text-xs font-bold shadow-xs hover:opacity-95 hover:scale-105 active:scale-95 transition-all"
            title="Follow on Instagram"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram</span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all"
            title="Follow on Facebook"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </a>

          {/* Twitter / X */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-xs hover:scale-105 active:scale-95 transition-all"
            title="Follow on Twitter / X"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>Twitter/X</span>
          </a>
        </div>
      </div>
    </div>
  );
};

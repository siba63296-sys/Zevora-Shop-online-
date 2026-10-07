import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { AdsterraBanner } from './components/AdsterraBanner';
import { ProductComparisonModal, ComparisonDock } from './components/ProductComparisonModal';

// Views
import { HomeView } from './views/HomeView';
import { CategoriesView } from './views/CategoriesView';
import { ProductListView } from './views/ProductListView';
import { ProductDetailView } from './views/ProductDetailView';
import { SearchView } from './views/SearchView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { WishlistView } from './views/WishlistView';
import { OrderHistoryView } from './views/OrderHistoryView';
import { LoginView } from './views/LoginView';
import { ProfileView } from './views/ProfileView';
import { HelpSupportView } from './views/HelpSupportView';
import { MenuView } from './views/MenuView';
import { SettingsView } from './views/SettingsView';
import { TermsView, PrivacyView } from './views/LegalViews';
import { AdminView } from './views/AdminView';

// Icons
import {
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  CreditCard,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentPage, navigateTo, storeSettings } = useStore();

  const instagramUrl = storeSettings?.instagram_url || 'https://www.instagram.com/iam._.siba?stkn=MXJscXk1cjY3Y2RjeA==';
  const facebookUrl = storeSettings?.facebook_url || 'https://www.facebook.com/share/1BwPkL392F/';
  const twitterUrl = storeSettings?.twitter_url || 'https://x.com/SibaRajRayqf';

  const renderCurrentView = () => {
    switch (currentPage) {
      case 'home':
        return <HomeView />;
      case 'categories':
        return <CategoriesView />;
      case 'category_products':
        return <ProductListView />;
      case 'product_detail':
        return <ProductDetailView />;
      case 'search':
        return <SearchView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'wishlist':
        return <WishlistView />;
      case 'orders':
        return <OrderHistoryView />;
      case 'login':
        return <LoginView />;
      case 'profile':
        return <ProfileView />;
      case 'help':
        return <HelpSupportView />;
      case 'settings':
        return <SettingsView />;
      case 'terms':
        return <TermsView />;
      case 'privacy':
        return <PrivacyView />;
      case 'admin':
        return <AdminView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderCurrentView()}
      </main>

      {/* Global Footer (shown on all views except full admin) */}
      {currentPage !== 'admin' && (
        <footer className="bg-white border-t border-slate-200 mt-12 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Adsterra Banner Ad Area (Excluded on Checkout, Payment, Login, Signup, and Admin pages) */}
            {currentPage !== 'checkout' && currentPage !== 'login' && (
              <AdsterraBanner />
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Brand Col */}
              <div className="col-span-2 md:col-span-1 space-y-3">
                <div className="flex items-center gap-2">
                  {storeSettings.logo_url ? (
                    <img
                      src={storeSettings.logo_url}
                      alt={storeSettings.store_name}
                      className="w-8 h-8 rounded-xl object-contain border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  )}
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    {storeSettings.store_name || 'Zevora'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {storeSettings.tagline || 'Your trusted e-commerce destination for premier electronics, trending fashion, and home essentials.'}
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>100% Secure Shopping Guarantee</span>
                </div>
              </div>

              {/* Shop Col */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Shop Catalog
                </h4>
                <ul className="space-y-1.5 text-slate-500">
                  <li>
                    <button onClick={() => navigateTo('categories')} className="hover:text-blue-600">
                      All Categories
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('category_products', { categoryId: 'cat-mobiles' })}
                      className="hover:text-blue-600"
                    >
                      Mobiles &amp; Tablets
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('category_products', { categoryId: 'cat-laptops' })}
                      className="hover:text-blue-600"
                    >
                      Laptops &amp; Tech
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('category_products', { categoryId: 'cat-fashion' })}
                      className="hover:text-blue-600"
                    >
                      Fashion &amp; Shoes
                    </button>
                  </li>
                </ul>
              </div>

              {/* Customer Service Col */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Customer Service
                </h4>
                <ul className="space-y-1.5 text-slate-500">
                  <li>
                    <a
                      href="https://wa.me/message/7RK4DNNVB7LBB1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-600 flex items-center gap-1.5 font-medium text-slate-600 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>WhatsApp Support</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://t.me/Raju12470"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-sky-600 flex items-center gap-1.5 font-medium text-slate-600 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      <span>Telegram Support</span>
                    </a>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('orders')} className="hover:text-blue-600">
                      Order Tracking
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('help')} className="hover:text-blue-600">
                      Help &amp; Support
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('help')} className="hover:text-blue-600">
                      Return &amp; Refund Policy
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('wishlist')} className="hover:text-blue-600">
                      My Wishlist
                    </button>
                  </li>
                </ul>
              </div>

              {/* Legal & Admin Col */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Platform
                </h4>
                <ul className="space-y-1.5 text-slate-500">
                  <li>
                    <button onClick={() => navigateTo('terms')} className="hover:text-blue-600">
                      Terms &amp; Conditions
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('privacy')} className="hover:text-blue-600">
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigateTo('settings')} className="hover:text-blue-600">
                      Settings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo('admin')}
                      className="hover:text-blue-600 font-bold text-blue-600 flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <span>🔒 Store Admin Panel</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Social Media Follow Section */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  Follow us on Social Media for More Offers, Mega Deals &amp; Exclusive Discounts!
                </p>
                <p className="text-[11px] text-slate-500">
                  Stay connected on Instagram, Facebook &amp; Twitter/X for daily flash sales and promotions.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {/* Instagram */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs hover:opacity-90 hover:scale-105 active:scale-95 transition-all"
                  title="Follow us on Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                  title="Follow us on Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
                  title="Follow us on Twitter / X"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="border-t border-slate-100 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
              <p>© {new Date().getFullYear()} {storeSettings.store_name || 'Zevora'}. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <span>100% Secure Checkout</span>
                <span>·</span>
                <span>Genuine Products</span>
                <span>·</span>
                <span>Fast Delivery</span>
                <span>·</span>
                <button
                  onClick={() => navigateTo('admin')}
                  className="hover:text-blue-600 font-semibold text-slate-500 cursor-pointer transition-colors"
                >
                  Admin Portal
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Product Comparison Floating Dock & Modal */}
      <ComparisonDock />
      <ProductComparisonModal />

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Interactive Notification Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}

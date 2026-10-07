import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ChevronLeft,
  Globe,
  Bell,
  Trash2,
  HelpCircle,
  Smartphone,
  ChevronRight,
  User,
  ShoppingBag,
  MapPin,
  FileText,
  Lock,
  CheckCircle2,
  Mail,
  MessageSquare,
  Moon,
  Sun,
  Palette,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    navigateTo,
    user,
    showToast,
    themeMode,
    isDarkMode,
    setThemeMode,
    toggleDarkMode,
  } = useStore();
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(false);
  const [currency, setCurrency] = useState('INR (₹)');
  const [language, setLanguage] = useState('English');

  const handleClearCache = () => {
    // Clear temporary local storage items while preserving essential app state
    try {
      localStorage.removeItem('the_online_store_recently_viewed');
      localStorage.removeItem('the_online_store_search_history');
      showToast('Browsing history and app cache cleared successfully!', 'success');
    } catch {
      showToast('Cache cleared', 'info');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 py-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigateTo('home')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Back to home"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Settings &amp; Preferences</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Manage display theme, currency, notifications, and store experience</p>
        </div>
      </div>

      {/* Account Overview Card */}
      {user ? (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.full_name || 'Valued Customer'}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('profile')}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 rounded-3xl border border-blue-100 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sign In to Your Account</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track shipments, view invoices, and sync wishlist</p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('login')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Theme & Night Mode Preferences (Site-Wide Dark Mode) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            Appearance &amp; Display
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isDarkMode
              ? 'bg-indigo-950/70 text-indigo-300 border-indigo-800/70'
              : 'bg-amber-50 text-amber-700 border-amber-200/60'
          }`}>
            {isDarkMode ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}
          </span>
        </div>

        {/* Interactive Site-Wide Dark Mode Toggle */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-xs ${
              isDarkMode
                ? 'bg-indigo-950/90 text-indigo-300 border border-indigo-800/80'
                : 'bg-amber-50 text-amber-600 border border-amber-200/60'
            }`}>
              {isDarkMode ? <Moon className="w-4 h-4 fill-indigo-400/30" /> : <Sun className="w-4 h-4 fill-amber-500/20" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Dark Mode</h4>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                  Night View
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                Comfortable viewing experience at night with reduced screen glare and high-contrast dark surfaces
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isDarkMode}
            aria-label="Toggle site-wide dark mode"
            onClick={() => {
              toggleDarkMode();
              showToast(
                !isDarkMode
                  ? '🌙 Dark mode enabled · Comfortable night view'
                  : '☀️ Light mode enabled',
                'info'
              );
            }}
            className={`w-12 h-6.5 rounded-full transition-all duration-300 p-0.5 flex items-center cursor-pointer shadow-inner shrink-0 ${
              isDarkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5.5 h-5.5 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200">
              {isDarkMode ? (
                <Moon className="w-3 h-3 text-indigo-600 fill-indigo-600" />
              ) : (
                <Sun className="w-3 h-3 text-amber-500 fill-amber-500" />
              )}
            </div>
          </button>
        </div>

        {/* 3-Way Mode Segment Selector */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
            Theme Mode Preference
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setThemeMode('light');
                showToast('☀️ Light mode enabled', 'info');
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-white text-blue-600 border-blue-500 shadow-xs'
                  : 'bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setThemeMode('dark');
                showToast('🌙 Dark mode enabled · Comfortable night view', 'info');
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setThemeMode('system');
                showToast('⚙️ System preference mode active', 'info');
              }}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                themeMode === 'system'
                  ? 'bg-slate-800 text-white dark:bg-slate-700 border-slate-700 dark:border-slate-600 shadow-xs'
                  : 'bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>System</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Account Shortcuts */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        <button
          onClick={() => navigateTo('orders')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">My Orders &amp; Shipments</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">View real-time delivery status and receipts</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </button>

        <button
          onClick={() => navigateTo('checkout')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Delivery Addresses</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Manage home and office shipping locations</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </button>
      </div>

      {/* Regional & Currency Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Regional Preferences
          </span>
        </div>

        {/* Currency */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Display Currency</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Default prices across the store</p>
            </div>
          </div>
          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              showToast(`Currency set to ${e.target.value}`, 'info');
            }}
            className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-hidden cursor-pointer"
          >
            <option value="INR (₹)">INR (₹) - Indian Rupee</option>
            <option value="USD ($)">USD ($) - US Dollar</option>
            <option value="EUR (€)">EUR (€) - Euro</option>
            <option value="GBP (£)">GBP (£) - British Pound</option>
            <option value="AED (د.إ)">AED (د.إ) - UAE Dirham</option>
          </select>
        </div>

        {/* Language */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Store Language</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Preferred reading language</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              showToast(`Language set to ${e.target.value}`, 'info');
            }}
            className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-hidden cursor-pointer"
          >
            <option value="English">English</option>
            <option value="हिन्दी">हिन्दी (Hindi)</option>
            <option value="বাংলা">বাংলা (Bengali)</option>
            <option value="తెలుగు">తెలుగు (Telugu)</option>
            <option value="தமிழ்">தமிழ் (Tamil)</option>
            <option value="मराठी">मराठी (Marathi)</option>
          </select>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Alerts &amp; Notifications
          </span>
        </div>

        {/* Order tracking alerts */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Order &amp; Delivery Updates</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Receive live shipment tracking alerts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setOrderAlerts(!orderAlerts);
              showToast(
                !orderAlerts ? 'Order tracking notifications enabled' : 'Order tracking notifications disabled',
                'info'
              );
            }}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
              orderAlerts ? 'bg-blue-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
          </button>
        </div>

        {/* Deals & discounts */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Special Offers &amp; Discounts</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Exclusive coupon codes and seasonal sales</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setDealAlerts(!dealAlerts);
              showToast(!dealAlerts ? 'Promotional alerts enabled' : 'Promotional alerts disabled', 'info');
            }}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
              dealAlerts ? 'bg-blue-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
          </button>
        </div>

        {/* WhatsApp updates */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">WhatsApp Updates</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Receive dispatch &amp; invoice notices on WhatsApp</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setWhatsappUpdates(!whatsappUpdates);
              showToast(!whatsappUpdates ? 'WhatsApp notifications enabled' : 'WhatsApp notifications disabled', 'info');
            }}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
              whatsappUpdates ? 'bg-emerald-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
          </button>
        </div>
      </div>

      {/* Privacy, Storage & Cache */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Privacy &amp; Data
          </span>
        </div>

        {/* Clear Cache */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Clear Search &amp; Browsing History</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Reset local recommendations and search suggestions</p>
            </div>
          </div>
          <button
            onClick={handleClearCache}
            className="px-3.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Customer Support & Legal */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Help &amp; Policies
          </span>
        </div>

        <button
          onClick={() => navigateTo('help')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Customer Support &amp; FAQ</h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">24/7 order assistance, returns &amp; warranty</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </button>

        <button
          onClick={() => navigateTo('terms')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Terms of Service</h4>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </button>

        <button
          onClick={() => navigateTo('privacy')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Privacy Policy</h4>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </button>
      </div>

      {/* Trust Footer */}
      <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">The Online Store · Version 2.4.0</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">All transactions are encrypted and secured with SSL encryption.</p>
      </div>
    </div>
  );
};

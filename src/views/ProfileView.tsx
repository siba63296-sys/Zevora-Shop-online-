import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  HelpCircle,
  Settings,
  ChevronRight,
  LogOut,
  Edit2,
  X,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, signOut, navigateTo, updateProfile } = useStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: name, phone });
    setShowEditModal(false);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to Your Account</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          Sign in or create an account to view your order history, manage saved delivery addresses, and access your wishlist.
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigateTo('login')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
          >
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
        <button
          onClick={() => navigateTo('settings')}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* User Card matching Screen 11 */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner">
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900">{user?.full_name || 'Guest User'}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'Not logged in'}</p>
          {user?.phone && <p className="text-xs text-slate-400 mt-0.5">{user.phone}</p>}

          <button
            onClick={() => setShowEditModal(true)}
            className="mt-3 px-4 py-1.5 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Profile Navigation Links */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {/* My Orders */}
        <button
          onClick={() => navigateTo('orders')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">My Orders</h4>
              <p className="text-[11px] text-slate-400">View real-time shipments &amp; order history</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Wishlist */}
        <button
          onClick={() => navigateTo('wishlist')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Wishlist</h4>
              <p className="text-[11px] text-slate-400">Your saved favorites</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Saved Addresses */}
        <button
          onClick={() => navigateTo('checkout')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Saved Addresses</h4>
              <p className="text-[11px] text-slate-400">Manage delivery locations</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Payment Methods */}
        <button
          onClick={() => navigateTo('settings')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Payment Methods</h4>
              <p className="text-[11px] text-slate-400">UPI, Saved cards &amp; net banking</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Help & Support */}
        <button
          onClick={() => navigateTo('help')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Help &amp; Support</h4>
              <p className="text-[11px] text-slate-400">Customer care, FAQs, and returns</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Log out button */}
      <button
        onClick={() => signOut()}
        className="w-full py-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

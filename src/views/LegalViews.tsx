import React from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, FileText, Shield } from 'lucide-react';

export const TermsView: React.FC = () => {
  const { navigateTo } = useStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-3 py-2 border-b border-slate-200">
        <button
          onClick={() => navigateTo('home')}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Terms &amp; Conditions</h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p className="text-slate-400 text-xs">Last updated: October 2026</p>

        <h3 className="text-base font-bold text-slate-900 pt-2">1. Agreement to Terms</h3>
        <p>
          By accessing or using The Online Store website, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you may not access the service.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">2. Products and Pricing</h3>
        <p>
          All prices are listed in Indian Rupees (₹) inclusive of applicable goods and services taxes unless specified otherwise. We reserve the right to correct any typographical pricing errors or modify item details at any time before order fulfillment.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">3. Orders and Shipping</h3>
        <p>
          Orders placed on the website are subject to item availability and acceptance. Standard delivery typically completes within 3-5 business days across serviceable postal codes. You will receive an official order confirmation identifier upon checkout.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">4. Returns &amp; Warranty</h3>
        <p>
          We provide a 7-day hassle-free replacement guarantee for eligible products in their original factory packaging. Manufacturer warranties apply as specified on product technical sheets.
        </p>
      </div>
    </div>
  );
};

export const PrivacyView: React.FC = () => {
  const { navigateTo } = useStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-3 py-2 border-b border-slate-200">
        <button
          onClick={() => navigateTo('home')}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p className="text-slate-400 text-xs">Last updated: October 2026</p>

        <h3 className="text-base font-bold text-slate-900 pt-2">1. Information We Collect</h3>
        <p>
          When you register, place orders, or save delivery addresses on The Online Store, we collect information such as your name, email address, shipping phone number, and delivery addresses to fulfill purchases securely.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">2. Data Security &amp; Supabase Storage</h3>
        <p>
          Your account data, order histories, and shopping preferences are secured with Supabase Authentication and PostgreSQL Row Level Security (RLS). We never sell your personal data to third-party advertisers.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">3. Payment Information</h3>
        <p>
          Payment transactions are processed through encrypted payment gateways. We do not store full payment card numbers or banking passwords on our public servers.
        </p>

        <h3 className="text-base font-bold text-slate-900 pt-2">4. Your Rights</h3>
        <p>
          You have the right to review, update, or request the deletion of your personal account information at any time from your profile settings or by contacting customer support.
        </p>
      </div>
    </div>
  );
};

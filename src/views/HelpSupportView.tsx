import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ChevronLeft,
  Headphones,
  HelpCircle,
  Truck,
  RotateCcw,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Mail,
  Phone,
} from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const { navigateTo, orders, showToast } = useStore();
  const [orderQuery, setOrderQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How can I track my shipment?',
      a: 'You can enter your Order ID (e.g. ORD123456) in the tracking box above or visit the "Order History" page from your profile to see live real-time status and delivery updates.',
    },
    {
      q: 'What is your return & replacement policy?',
      a: 'We offer a hassle-free 7-day return policy for electronics, gadgets, and apparel. Items must be in their original packaging with all included accessories and tags.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay), Net Banking across 50+ banks, and Cash on Delivery (COD).',
    },
    {
      q: 'How do I cancel an order?',
      a: 'You can cancel an order directly from the Order History page while the order status is in "Processing". Once an order is shipped, you can refuse the parcel at delivery or initiate a return.',
    },
  ];

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    const clean = orderQuery.trim().replace('#', '').toUpperCase();
    const found = orders.find(
      (o) => o.order_number.toUpperCase() === clean || o.id.toUpperCase() === clean
    );

    if (found) {
      setTrackedOrder(found);
    } else {
      showToast('Order not found. Please verify the order number.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 py-2 border-b border-slate-200">
        <button
          onClick={() => navigateTo('home')}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Help &amp; Support</h1>
      </div>

      {/* Hero Banner matching Screen 12 */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
          <Headphones className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">We're here to help!</h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Get instant support for your orders, refunds, payments, and product inquiries.
          </p>
        </div>
      </div>

      {/* Track Your Order Tool */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Track Your Shipment</h3>
        </div>
        <p className="text-xs text-slate-500">
          Enter your order tracking number (e.g. ORD123456)
        </p>

        <form onSubmit={handleTrackOrder} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. ORD123456"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Track
          </button>
        </form>

        {trackedOrder && (
          <div className="mt-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-emerald-900">
              <span>Order #{trackedOrder.order_number}</span>
              <span className="capitalize bg-emerald-200/60 px-2 py-0.5 rounded text-[11px]">
                {trackedOrder.status}
              </span>
            </div>
            <p className="text-emerald-800">
              Estimated Delivery: <strong>{trackedOrder.delivery_option}</strong>
            </p>
            <p className="text-emerald-700">Shipping to: {trackedOrder.shipping_address.city}</p>
          </div>
        )}
      </div>

      {/* Quick Help Options matching Screen 12 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">FAQs</h4>
              <p className="text-xs text-slate-400">Find answers to common questions</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50" onClick={() => navigateTo('orders')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Track Your Order</h4>
              <p className="text-xs text-slate-400">View live shipment courier status</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-600">Open</span>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Return &amp; Refund</h4>
              <p className="text-xs text-slate-400">7 days easy replacement policy</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500">7-Day Guarantee</span>
        </div>

        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Customer Service</h4>
              <p className="text-xs text-slate-400">Reach us on WhatsApp or Telegram for instant support</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/message/7RK4DNNVB7LBB1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
              title="Chat on WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
            <a
              href="https://t.me/Raju12470"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
              title="Chat on Telegram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.195 1.006.128.832.946z"/>
              </svg>
              <span>Telegram</span>
            </a>
            <a
              href="mailto:support@onlinestore.example"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              title="Email support"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Dedicated Customer Service Quick-Connect Cards */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Customer Service Channels</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click below to chat with our executive directly on WhatsApp or Telegram:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* WhatsApp option */}
          <a
            href="https://wa.me/message/7RK4DNNVB7LBB1"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">WhatsApp Support</h4>
                <p className="text-xs text-emerald-700 font-medium">Quick 24/7 Chat</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Chat Now →
            </span>
          </a>

          {/* Telegram option */}
          <a
            href="https://t.me/Raju12470"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/70 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.195 1.006.128.832.946z"/>
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Telegram Support</h4>
                <p className="text-xs text-sky-700 font-medium">@Raju12470</p>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Message →
            </span>
          </a>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, X, Check, Ticket } from 'lucide-react';
import { getColorImages } from '../utils/variants';

export const CartView: React.FC = () => {
  const {
    cart,
    cartCount,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    navigateTo,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    activeCoupons,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [showCouponList, setShowCouponList] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponInput('');
      setShowCouponList(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Looks like you haven't added anything to your cart yet. Explore our top products and find great deals!
        </p>
        <button
          onClick={() => navigateTo('home')}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex items-center gap-3 py-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigateTo('home')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          My Cart ({cartCount})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex gap-4 items-center"
            >
              {/* Thumbnail */}
              <div
                onClick={() => navigateTo('product_detail', { productId: item.product.id })}
                className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-xl p-2 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden border border-slate-100 dark:border-slate-800"
              >
                <img
                  src={
                    getColorImages(item.product, item.selected_color)[0] ||
                    item.product.images[0] ||
                    'https://placehold.co/100x100/png?text=Photo'
                  }
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3
                  onClick={() => navigateTo('product_detail', { productId: item.product.id })}
                  className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  {item.product.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {item.selected_color && (
                    <span>
                      Color: <strong className="text-slate-700 dark:text-slate-300">{item.selected_color}</strong>
                    </span>
                  )}
                  {item.selected_size && (
                    <span className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                      Size: {item.selected_size}
                    </span>
                  )}
                  {item.selected_variant_sku && (
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      ({item.selected_variant_sku})
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                    ₹{((item.variant_price ?? item.product.price) * item.quantity).toLocaleString('en-IN')}
                  </span>
                  {(item.variant_original_price ?? item.product.original_price) > (item.variant_price ?? item.product.price) && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 line-through tabular-nums">
                      ₹{((item.variant_original_price ?? item.product.original_price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  )}
                  {item.product.discount_percent > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                      {item.product.discount_percent}% OFF
                    </span>
                  )}
                  {item.quantity > 1 && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums block sm:inline">
                      (₹{(item.variant_price ?? item.product.price).toLocaleString('en-IN')} each)
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Stepper & Delete */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-l-lg transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-r-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary Breakdown */}
        <div className="lg:col-span-4 space-y-4">
          {/* Apply Coupon Widget */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Apply Coupon</span>
              </span>
              {activeCoupons.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCouponList(!showCouponList)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  {showCouponList ? 'Hide Coupons' : `View Coupons (${activeCoupons.length})`}
                </button>
              )}
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 tracking-wide font-mono">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                      Saving ₹{couponDiscount.toLocaleString('en-IN')} with this coupon
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-xs font-mono font-bold uppercase placeholder:normal-case placeholder:font-normal focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!couponInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Quick Pick Available Coupons List */}
            {showCouponList && !appliedCoupon && activeCoupons.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 max-h-48 overflow-y-auto">
                {activeCoupons.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => applyCoupon(c.code)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 border border-slate-200/80 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400">{c.code}</span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
                          {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{c.description}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Apply</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Price Details
            </h2>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex justify-between">
                <span>Price ({cartCount} items)</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {cartDiscount > couponDiscount && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Offer Savings</span>
                  <span className="tabular-nums">- ₹{(cartDiscount - couponDiscount).toLocaleString('en-IN')}</span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/60 dark:bg-blue-950/60 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon?.code})</span>
                  </span>
                  <span className="tabular-nums">- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Total Amount</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => navigateTo('checkout')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Safe and Secure Payments. 100% Authentic Products.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Tag, Copy, Check, Sparkles, Clock, AlertCircle } from 'lucide-react';

export const AvailableCoupons: React.FC = () => {
  const { activeCoupons, appliedCoupon, applyCoupon, showToast } = useStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!activeCoupons || activeCoupons.length === 0) {
    return null;
  }

  const handleCopy = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast(`Copied coupon code "${code}" to clipboard!`, 'success');
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      showToast(`Coupon code: ${code}`, 'info');
    }
  };

  const handleApply = (code: string) => {
    applyCoupon(code);
  };

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Exclusive Coupons &amp; Promo Codes
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Apply coupons at cart or checkout to unlock additional savings on your order.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {activeCoupons.map((coupon) => {
          const isApplied = appliedCoupon?.code === coupon.code;
          const isCopied = copiedCode === coupon.code;

          return (
            <div
              key={coupon.id}
              className={`relative bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border ${
                isApplied
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-xs'
              } p-4 flex flex-col justify-between transition-all`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-xs tracking-wider font-mono">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>{coupon.code}</span>
                  </div>

                  <span className="text-xs font-black text-emerald-600 tabular-nums">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}% OFF`
                      : `₹${coupon.discount_value} OFF`}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                  {coupon.description || (coupon.discount_type === 'percentage'
                    ? `Get ${coupon.discount_value}% off your order`
                    : `Flat ₹${coupon.discount_value} discount`)}
                </p>

                <div className="mt-2.5 space-y-1 text-[11px] text-slate-500">
                  {coupon.min_cart_value > 0 && (
                    <p className="flex items-center gap-1">
                      <span>• Min order:</span>
                      <strong className="text-slate-700">₹{coupon.min_cart_value.toLocaleString('en-IN')}</strong>
                    </p>
                  )}
                  {coupon.max_discount_amount && coupon.max_discount_amount > 0 && (
                    <p className="flex items-center gap-1">
                      <span>• Max discount:</span>
                      <strong className="text-slate-700">₹{coupon.max_discount_amount.toLocaleString('en-IN')}</strong>
                    </p>
                  )}
                  {coupon.end_at && (
                    <p className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Expires: {new Date(coupon.end_at).toLocaleDateString()}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(coupon.code)}
                  className="flex-1 py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy coupon code"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleApply(coupon.code)}
                  className={`flex-1 py-1.5 px-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isApplied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <span>Apply</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

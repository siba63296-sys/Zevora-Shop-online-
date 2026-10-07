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
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Exclusive Coupons &amp; Promo Codes
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
              className={`relative bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/80 rounded-2xl border ${
                isApplied
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-2xs hover:shadow-xs'
              } p-4 flex flex-col justify-between transition-all`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-extrabold text-xs tracking-wider font-mono">
                    <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{coupon.code}</span>
                  </div>

                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}% OFF`
                      : `₹${coupon.discount_value} OFF`}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                  {coupon.description || (coupon.discount_type === 'percentage'
                    ? `Get ${coupon.discount_value}% off your order`
                    : `Flat ₹${coupon.discount_value} discount`)}
                </p>

                <div className="mt-2.5 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {coupon.min_cart_value > 0 && (
                    <p className="flex items-center gap-1">
                      <span>• Min order:</span>
                      <strong className="text-slate-700 dark:text-slate-300">₹{coupon.min_cart_value.toLocaleString('en-IN')}</strong>
                    </p>
                  )}
                  {coupon.max_discount_amount && coupon.max_discount_amount > 0 && (
                    <p className="flex items-center gap-1">
                      <span>• Max discount:</span>
                      <strong className="text-slate-700 dark:text-slate-300">₹{coupon.max_discount_amount.toLocaleString('en-IN')}</strong>
                    </p>
                  )}
                  {coupon.end_at && (
                    <p className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>Expires: {new Date(coupon.end_at).toLocaleDateString()}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(coupon.code)}
                  className="flex-1 py-1.5 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy coupon code"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400">Copied!</span>
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

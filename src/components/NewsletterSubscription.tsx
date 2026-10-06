import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { validateEmail } from '../lib/supabase';

export const NewsletterSubscription: React.FC = () => {
  const { subscribeNewsletter } = useStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const result = await subscribeNewsletter(trimmed);
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-6 sm:p-10 mb-10 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Copy & Value Proposition */}
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Join 25,000+ Smart Shoppers</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
            Subscribe &amp; Get ₹500 Off Your Next Order
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Stay in the loop with weekly flash sales, exclusive discount vouchers, and early access to new tech &amp; fashion releases.
          </p>
        </div>

        {/* Right: Subscription Form & Feedback */}
        <div className="w-full lg:max-w-md">
          {status === 'success' ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl flex items-start gap-3 text-emerald-200 animate-in fade-in zoom-in-95 duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-300">You're Subscribed!</p>
                <p className="text-xs text-emerald-200/90 leading-relaxed">{message}</p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-xs text-emerald-400 font-semibold hover:underline pt-1 inline-block"
                >
                  Subscribe another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') {
                        setStatus('idle');
                        setMessage('');
                      }
                    }}
                    placeholder="Enter your email address..."
                    disabled={status === 'loading'}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder-slate-400 border rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all ${
                      status === 'error'
                        ? 'border-rose-400/80 focus:ring-rose-500'
                        : 'border-white/15'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all shrink-0 disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Error Alert */}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-rose-300 text-xs px-2 pt-0.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>{message}</span>
                </div>
              )}

              {/* Privacy Notice */}
              <p className="text-[11px] text-slate-400 px-2 leading-relaxed">
                By subscribing, you agree to our Terms and receive marketing emails. Unsubscribe anytime in 1-click.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

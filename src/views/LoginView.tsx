import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  X,
  KeyRound,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { signIn, signUp, resetPassword, navigateTo, isSupabaseConnected, storeSettings } = useStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-type your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUp(email, password, fullName);
        if (res.success) {
          setSuccessNotice(`Account created successfully! Welcome to ${storeSettings.store_name || 'The Online Store'}.`);
          setTimeout(() => {
            navigateTo('home');
          }, 1200);
        } else {
          setErrorMsg(res.error || 'Failed to create account. Please try again.');
        }
      } else {
        const res = await signIn(email, password);
        if (res.success) {
          navigateTo('home');
        } else {
          setErrorMsg(res.error || 'Invalid email or password.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await resetPassword(forgotEmail.trim());
      if (res.success) {
        setForgotSuccess(res.message);
      } else {
        setForgotError(res.message);
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      {/* Brand Header matching Screen 10 */}
      <div className="text-center space-y-2">
        {storeSettings.logo_url ? (
          <img
            src={storeSettings.logo_url}
            alt={storeSettings.store_name}
            className="w-14 h-14 object-contain rounded-2xl mx-auto border border-slate-200 shadow-md shadow-blue-600/10"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-600/30">
            <ShoppingBag className="w-6 h-6" />
          </div>
        )}
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {storeSettings.store_name || 'The Online Store'}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {storeSettings.tagline || 'Your one stop shop for everything'}
        </p>
      </div>

      {/* Login / Sign Up Segmented Control */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => {
            setIsSignUp(false);
            setErrorMsg('');
            setSuccessNotice('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            !isSignUp ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => {
            setIsSignUp(true);
            setErrorMsg('');
            setSuccessNotice('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            isSignUp ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Main Authentication Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs"
      >
        {isSignUp && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            {!isSignUp && (
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotError('');
                  setForgotSuccess('');
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isSignUp && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        {/* Information badge */}
        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
          {isSignUp
            ? 'Your account credentials and details are encrypted and securely stored.'
            : 'Sign in with your registered email and password to access your orders.'}
        </p>
      </form>

      <div className="text-center text-xs text-slate-500">
        {isSignUp ? (
          <span>
            Already have an account?{' '}
            <button
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg('');
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Log in
            </button>
          </span>
        ) : (
          <span>
            Don't have an account?{' '}
            <button
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg('');
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Sign Up
            </button>
          </span>
        )}
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Reset Password</span>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered email address and we'll send you instructions to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {forgotError && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {forgotError}
                </p>
              )}

              {forgotSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

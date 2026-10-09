import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  CheckCircle2,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  Info,
  Laptop,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'button' | 'card' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed standalone PWA, hide install buttons or show confirmed state
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-3.5 p-4 sm:p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 shadow-2xs">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-100">
                Zevora App Installed
              </h4>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200">
                Active
              </span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              You are currently using the official standalone Zevora Progressive Web App with offline catalog caching.
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    // If native prompt is captured (supported Android browsers / desktop Chromium), trigger it
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const result = await install();
        if (result === 'unavailable') {
          // Fallback to instructions modal if prompt expired or became unavailable
          setShowInstructionsModal(true);
        }
      } finally {
        setIsInstalling(false);
      }
    } else {
      // If beforeinstallprompt is unavailable (iOS Safari, Firefox, or browser already handled prompt),
      // show accurate instructions to install through the browser menu.
      // Do NOT pretend the native prompt was triggered.
      setShowInstructionsModal(true);
    }
  };

  // 1. Header variant (for top bar / user dropdown menu)
  if (variant === 'header') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer ${className}`}
          title={isInstallable ? 'Install Zevora App' : 'How to install Zevora App'}
        >
          <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
          <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
        </button>

        {showInstructionsModal && (
          <InstallInstructionsModal
            isAndroid={isAndroid}
            isIOS={isIOS}
            onClose={() => setShowInstructionsModal(false)}
          />
        )}
      </>
    );
  }

  // 2. Card variant (used in SettingsView and MenuView banners)
  if (variant === 'card') {
    return (
      <>
        <div
          className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-amber-500/35 shadow-xl relative overflow-hidden ${className}`}
        >
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Banner Header Info */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-black border border-amber-500/40 p-1 flex items-center justify-center shrink-0 shadow-inner">
                <img
                  src="/pwa-192x192.png"
                  alt="Zevora Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                    Install Zevora App
                  </h3>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    PWA
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Fast, instant loading, offline catalog caching &amp; seamless 1-tap checkout.
                </p>
              </div>
            </div>
          </div>

          {/* Banner Action Row - Always displaying the Install Zevora App button */}
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
            <div className="flex flex-col gap-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Under 2MB · No App Store account required</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                {isInstallable ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Native 1-tap install ready on your browser
                  </span>
                ) : (
                  <span className="text-amber-300/90 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Browser menu install available via (⋮) or share
                  </span>
                )}
              </div>
            </div>

            {/* Clearly visible Install Zevora App button inside existing banner */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isInstalling ? 'Installing...' : 'Install Zevora App'}</span>
              </button>
            </div>
          </div>

          {/* If beforeinstallprompt is unavailable, show clear hint below with manual steps link */}
          {!isInstallable && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between gap-2 text-[11px] text-slate-400 relative z-10">
              <p className="truncate">
                {isIOS
                  ? 'Safari: Tap Share icon then "Add to Home Screen"'
                  : 'Chrome: Tap browser menu (⋮) then "Install app"'}
              </p>
              <button
                type="button"
                onClick={() => setShowInstructionsModal(true)}
                className="text-amber-400 hover:text-amber-300 font-bold underline shrink-0 cursor-pointer text-xs"
              >
                View Steps
              </button>
            </div>
          )}
        </div>

        {showInstructionsModal && (
          <InstallInstructionsModal
            isAndroid={isAndroid}
            isIOS={isIOS}
            onClose={() => setShowInstructionsModal(false)}
          />
        )}
      </>
    );
  }

  // 3. Compact / Standard Button variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4 stroke-[2.5]" />
        <span>{isInstalling ? 'Installing...' : 'Install Zevora App'}</span>
      </button>

      {showInstructionsModal && (
        <InstallInstructionsModal
          isAndroid={isAndroid}
          isIOS={isIOS}
          onClose={() => setShowInstructionsModal(false)}
        />
      )}
    </>
  );
};

// Reusable modal with accurate, step-by-step browser menu instructions
interface InstallInstructionsModalProps {
  isAndroid: boolean;
  isIOS: boolean;
  onClose: () => void;
}

const InstallInstructionsModal: React.FC<InstallInstructionsModalProps> = ({
  isAndroid,
  isIOS,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'android';
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black p-1 flex items-center justify-center border border-amber-500/40 shadow-inner">
              <img src="/pwa-192x192.png" alt="Zevora" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Install Zevora App
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Browser Menu Installation Guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Note */}
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Install via your browser menu</p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
              The automatic install prompt is not triggered directly by your current browser. You can install Zevora in seconds using the steps below.
            </p>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        {/* Step-by-Step Instructions based on selected platform */}
        {activeTab === 'android' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Chrome / Edge / Samsung Internet on Android
            </h4>
            <ol className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  1
                </div>
                <div>
                  Tap the <strong className="text-slate-900 dark:text-white font-semibold">three vertical dots (⋮)</strong> in the top-right corner of your browser.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  2
                </div>
                <div>
                  Select <strong className="text-slate-900 dark:text-white font-semibold">Install app</strong> or{' '}
                  <strong className="text-slate-900 dark:text-white font-semibold">Add to Home screen</strong>.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  3
                </div>
                <div>
                  Tap <strong className="text-slate-900 dark:text-white font-semibold">Install</strong> in the confirmation dialog. Zevora will be added to your home screen!
                </div>
              </li>
            </ol>
          </div>
        )}

        {activeTab === 'ios' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Safari on iPhone &amp; iPad
            </h4>
            <ol className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  1
                </div>
                <div>
                  Tap the <strong className="text-slate-900 dark:text-white font-semibold">Share</strong> button{' '}
                  <Share2 className="inline w-3.5 h-3.5 text-blue-500 mx-0.5" /> in the bottom Safari toolbar.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  2
                </div>
                <div>
                  Scroll down the menu and tap{' '}
                  <strong className="text-slate-900 dark:text-white font-semibold">Add to Home Screen</strong>{' '}
                  <PlusSquare className="inline w-3.5 h-3.5 text-slate-700 dark:text-slate-300 mx-0.5" />.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  3
                </div>
                <div>
                  Tap <strong className="text-slate-900 dark:text-white font-semibold">Add</strong> in the top-right corner.
                </div>
              </li>
            </ol>
          </div>
        )}

        {activeTab === 'desktop' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Google Chrome / Microsoft Edge on Desktop
            </h4>
            <ol className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  1
                </div>
                <div>
                  Look at the right side of the address bar for the{' '}
                  <strong className="text-slate-900 dark:text-white font-semibold">Install icon (⊕)</strong>.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  2
                </div>
                <div>
                  Alternatively, click the browser menu <strong className="text-slate-900 dark:text-white font-semibold">(⋮)</strong> &gt;{' '}
                  <strong className="text-slate-900 dark:text-white font-semibold">Install Zevora</strong>.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  3
                </div>
                <div>
                  Click <strong className="text-slate-900 dark:text-white font-semibold">Install</strong> to complete setup.
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Footer Close Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-xs transition-colors cursor-pointer"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

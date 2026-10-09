import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle2, X, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'button' | 'card' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed standalone PWA, hide install buttons
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Zevora App Installed</p>
            <p className="text-emerald-700 dark:text-emerald-300">You are running the official standalone app.</p>
          </div>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // Header button variant (compact pill for top header / drawer)
  if (variant === 'header') {
    // Chromium / Android flow
    if (isInstallable) {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer ${className}`}
          title="Install Zevora App on your device"
        >
          <Download className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
          <span>Install App</span>
        </button>
      );
    }

    // iOS Safari flow
    if (isIOS) {
      return (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 ${className}`}
            title="Install Zevora on iPhone / iPad"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-500" />
            <span>Install on iOS</span>
          </button>

          {showIOSGuide && (
            <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
          )}
        </>
      );
    }

    return null;
  }

  // Card variant (for SettingsView or ProfileView)
  if (variant === 'card') {
    return (
      <>
        <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-amber-500/30 shadow-lg ${className}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-black border border-amber-500/40 p-1 flex items-center justify-center shrink-0 shadow-inner">
                <img
                  src="/pwa-192x192.png"
                  alt="Zevora Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                  <span>Install Zevora App</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    PWA
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Fast, instant loading, offline catalog caching &amp; seamless 1-tap checkout.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>No App Store required · Under 2MB</span>
            </div>

            {isInstallable && (
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isInstalling ? 'Installing...' : 'Install Now'}</span>
              </button>
            )}

            {!isInstallable && isIOS && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Add to Home Screen</span>
              </button>
            )}

            {!isInstallable && !isIOS && (
              <div className="text-xs text-slate-400 italic">
                Use your browser menu (⋮) to tap &quot;Install app&quot; or &quot;Add to Home screen&quot;.
              </div>
            )}
          </div>
        </div>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  // Standard Button flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer ${className}`}
      >
        <Download className="w-4 h-4 stroke-[2.5]" />
        <span>{isInstalling ? 'Installing...' : 'Install Zevora App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer ${className}`}
        >
          <Smartphone className="w-4 h-4 text-slate-500" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  return null;
};

// Reusable iOS Safari Installation Guide Modal
const IOSInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 p-1 flex items-center justify-center border border-amber-500/30">
              <img src="/pwa-192x192.png" alt="Zevora" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Install on iOS</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">iPhone &amp; iPad Safari Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
              Scroll down and tap{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">Add to Home Screen</strong>{' '}
              <PlusSquare className="inline w-3.5 h-3.5 text-slate-700 dark:text-slate-300 mx-0.5" />.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              3
            </div>
            <div>
              Tap <strong className="text-slate-900 dark:text-white font-semibold">Add</strong> in the top right.
              Zevora is now ready on your home screen!
            </div>
          </li>
        </ol>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

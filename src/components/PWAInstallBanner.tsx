import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Sparkles } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('zevora_pwa_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {}
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('zevora_pwa_banner_dismissed', 'true');
    } catch {}
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Install App Banner"
      className="fixed bottom-16 lg:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-45 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-amber-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-black border border-amber-500/40 p-1 flex items-center justify-center shrink-0 shadow-inner">
            <img
              src="/pwa-192x192.png"
              alt="Zevora Logo"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">
                Install Zevora App
              </h4>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-2.5 h-2.5" />
                Fast
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              Instant access, offline catalog &amp; faster orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isInstalling ? 'Installing...' : 'Install'}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

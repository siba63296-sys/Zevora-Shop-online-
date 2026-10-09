import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __zevora_pwa_prompt?: BeforeInstallPromptEvent | null;
  }
}

// Global shared state across components so no events are lost across route navigation
let globalPrompt: BeforeInstallPromptEvent | null =
  typeof window !== 'undefined' ? window.__zevora_pwa_prompt || null : null;
let globalIsInstalled: boolean = false;

const promptSubscribers = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();
const installSubscribers = new Set<(installed: boolean) => void>();

function notifyPromptSubscribers(p: BeforeInstallPromptEvent | null) {
  globalPrompt = p;
  promptSubscribers.forEach((cb) => cb(p));
}

function notifyInstalledSubscribers(installed: boolean) {
  globalIsInstalled = installed;
  installSubscribers.forEach((cb) => cb(installed));
}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    (typeof document !== 'undefined' && document.referrer.includes('android-app://'))
  );
}

// Module-level singleton listener initialization
if (typeof window !== 'undefined') {
  globalIsInstalled = checkIsStandalone();

  if (window.__zevora_pwa_prompt) {
    globalPrompt = window.__zevora_pwa_prompt;
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    const bipEvent = e as BeforeInstallPromptEvent;
    window.__zevora_pwa_prompt = bipEvent;
    notifyPromptSubscribers(bipEvent);
  });

  window.addEventListener('zevora:pwa-prompt-ready', ((e: CustomEvent<BeforeInstallPromptEvent>) => {
    if (e.detail) {
      notifyPromptSubscribers(e.detail);
    }
  }) as EventListener);

  window.addEventListener('appinstalled', () => {
    window.__zevora_pwa_prompt = null;
    notifyPromptSubscribers(null);
    notifyInstalledSubscribers(true);
  });

  window.addEventListener('zevora:pwa-installed', () => {
    window.__zevora_pwa_prompt = null;
    notifyPromptSubscribers(null);
    notifyInstalledSubscribers(true);
  });

  try {
    const mq = window.matchMedia('(display-mode: standalone)');
    if (mq.addEventListener) {
      mq.addEventListener('change', (e) => {
        if (e.matches) {
          notifyInstalledSubscribers(true);
        }
      });
    }
  } catch {}
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return globalPrompt || (typeof window !== 'undefined' ? window.__zevora_pwa_prompt || null : null);
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    return globalIsInstalled || checkIsStandalone();
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect device platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/.test(userAgent);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Initial check
    setIsInstalled(globalIsInstalled || checkIsStandalone());
    setDeferredPrompt(globalPrompt || window.__zevora_pwa_prompt || null);

    // Register subscribers to global state updates
    const onPromptChange = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
    };
    const onInstallChange = (installed: boolean) => {
      setIsInstalled(installed);
    };

    promptSubscribers.add(onPromptChange);
    installSubscribers.add(onInstallChange);

    return () => {
      promptSubscribers.delete(onPromptChange);
      installSubscribers.delete(onInstallChange);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptToUse =
      deferredPrompt || globalPrompt || (typeof window !== 'undefined' ? window.__zevora_pwa_prompt : null);

    if (!promptToUse) {
      return 'unavailable';
    }

    try {
      await promptToUse.prompt();
      const choice = await promptToUse.userChoice;
      if (choice.outcome === 'accepted') {
        notifyPromptSubscribers(null);
        notifyInstalledSubscribers(true);
        if (typeof window !== 'undefined') {
          window.__zevora_pwa_prompt = null;
        }
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('PWA install prompt error:', err);
      return 'unavailable';
    }
  }, [deferredPrompt]);

  return {
    isInstallable: !!(deferredPrompt || globalPrompt || (typeof window !== 'undefined' && window.__zevora_pwa_prompt)),
    isInstalled,
    isIOS,
    isAndroid,
    deferredPrompt,
    install,
  };
}

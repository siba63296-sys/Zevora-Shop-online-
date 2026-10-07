import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PageView } from '../types';

export type AdSlotSize = 'mobile' | 'medium' | 'desktop';

interface AdUnitConfig {
  key: string;
  width: number;
  height: number;
  scriptSrc: string;
  rawHtml: string;
}

/**
 * Exact Adsterra Banner Ad Configurations:
 * 1. MOBILE  — 320x50
 * 2. MEDIUM  — 300x250
 * 3. DESKTOP — 728x90
 */
export const ADSTERRA_UNITS: Record<AdSlotSize, AdUnitConfig> = {
  mobile: {
    key: '21c5f1ece4aec31f34529bb4c3474080',
    width: 320,
    height: 50,
    scriptSrc: 'https://bauval.org/22/21c5f1ece4aec31f34529bb4c3474080',
    rawHtml: `<script>
  atOptions = {
    'key' : '21c5f1ece4aec31f34529bb4c3474080',
    'format' : 'iframe',
    'height' : 50,
    'width' : 320,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/21c5f1ece4aec31f34529bb4c3474080"></script>`,
  },
  medium: {
    key: 'a200ebe7673c556472bc604b96f66aff',
    width: 300,
    height: 250,
    scriptSrc: 'https://bauval.org/22/a200ebe7673c556472bc604b96f66aff',
    rawHtml: `<script>
  atOptions = {
    'key' : 'a200ebe7673c556472bc604b96f66aff',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/a200ebe7673c556472bc604b96f66aff"></script>`,
  },
  desktop: {
    key: '5895a4f9298db38bc334259e2db4e79d',
    width: 728,
    height: 90,
    scriptSrc: 'https://bauval.org/22/5895a4f9298db38bc334259e2db4e79d',
    rawHtml: `<script>
  atOptions = {
    'key' : '5895a4f9298db38bc334259e2db4e79d',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://bauval.org/22/5895a4f9298db38bc334259e2db4e79d"></script>`,
  },
};

// Pages where advertisements must never be displayed
const EXCLUDED_PAGES: PageView[] = ['checkout', 'login', 'admin'];

function detectSlotForWidth(width: number): AdSlotSize {
  if (width >= 1024) {
    return 'desktop'; // Desktop / large screens: 728x90
  }
  if (width >= 640) {
    return 'medium'; // Tablet / medium screens: 300x250
  }
  return 'mobile'; // Mobile / small screens: 320x50
}

export interface AdsterraBannerProps {
  className?: string;
}

export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({ className = '' }) => {
  const { currentPage } = useStore();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [activeSlot, setActiveSlot] = useState<AdSlotSize>(() => {
    if (typeof window !== 'undefined') {
      return detectSlotForWidth(window.innerWidth);
    }
    return 'desktop';
  });

  // Listen for screen breakpoint changes so only ONE ad size is active at any time
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSlot = () => {
      const nextSlot = detectSlotForWidth(window.innerWidth);
      setActiveSlot((prev) => (prev !== nextSlot ? nextSlot : prev));
    };

    updateSlot();
    window.addEventListener('resize', updateSlot, { passive: true });
    return () => window.removeEventListener('resize', updateSlot);
  }, []);

  // Load ONLY the active breakpoint's Adsterra script inside the isolated iframe container
  useEffect(() => {
    if (EXCLUDED_PAGES.includes(currentPage)) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const unit = ADSTERRA_UNITS[activeSlot];
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: ${unit.width}px;
      height: ${unit.height}px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
  </style>
</head>
<body>
${unit.rawHtml}
</body>
</html>`;

    try {
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      } else {
        iframe.srcdoc = htmlContent;
      }
    } catch {
      iframe.srcdoc = htmlContent;
    }
  }, [activeSlot, currentPage]);

  // Never render ads on Admin, Login, Signup, Checkout, or Payment pages
  if (EXCLUDED_PAGES.includes(currentPage)) {
    return null;
  }

  const currentUnit = ADSTERRA_UNITS[activeSlot];

  return (
    <section
      aria-label="Sponsored Advertisement"
      className={`w-full flex flex-col items-center justify-center mb-10 overflow-hidden ${className}`}
    >
      {/* Reserved responsive ad space to prevent layout shifting:
          - Mobile (<640px): 320x50
          - Tablet/Medium (640px-1023px): 300x250
          - Desktop (>=1024px): 728x90
          Only ONE ad unit is mounted and loaded at a time. */}
      <div
        data-ad-slot={activeSlot}
        data-ad-dimensions={`${currentUnit.width}x${currentUnit.height}`}
        className="flex items-center justify-center mx-auto overflow-hidden max-w-full w-[320px] h-[50px] min-h-[50px] sm:w-[300px] sm:h-[250px] sm:min-h-[250px] lg:w-[728px] lg:h-[90px] lg:min-h-[90px]"
      >
        <iframe
          key={activeSlot}
          ref={iframeRef}
          title={`Adsterra ${activeSlot} banner (${currentUnit.width}x${currentUnit.height})`}
          width={currentUnit.width}
          height={currentUnit.height}
          scrolling="no"
          frameBorder={0}
          className="border-0 overflow-hidden block shrink-0"
        />
      </div>
    </section>
  );
};

export default AdsterraBanner;

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Offer } from '../types';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

export const DynamicOfferBanner: React.FC = () => {
  const { activeOffers, navigateTo, categories } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // If no active offers, hide the entire offer banner area cleanly (no empty space)
  if (!activeOffers || activeOffers.length === 0) {
    return null;
  }

  // Ensure index stays in range if offers list changes dynamically
  const safeIndex = currentIndex >= activeOffers.length ? 0 : currentIndex;
  const currentOffer: Offer = activeOffers[safeIndex];

  // Auto-play timer for multi-offer carousel
  useEffect(() => {
    if (activeOffers.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [activeOffers.length, isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeOffers.length) % activeOffers.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
  };

  const handleDestinationClick = () => {
    // If offer targets a specific category, directly open that category
    if (currentOffer.category_id && currentOffer.category_id !== 'all' && currentOffer.category_id !== '*') {
      navigateTo('category_products', { categoryId: currentOffer.category_id });
      return;
    }

    const targetLink = (currentOffer.button_link || 'categories').trim();
    if (!targetLink || targetLink === 'categories') {
      navigateTo('categories');
      return;
    }

    if (targetLink.startsWith('cat-')) {
      navigateTo('category_products', { categoryId: targetLink });
    } else if (targetLink === 'cart' || targetLink === 'search' || targetLink === 'orders') {
      navigateTo(targetLink as any);
    } else if (categories.some((c) => c.slug === targetLink || c.id === targetLink)) {
      const cat = categories.find((c) => c.slug === targetLink || c.id === targetLink);
      navigateTo('category_products', { categoryId: cat?.id || targetLink });
    } else if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
      window.open(targetLink, '_blank', 'noopener,noreferrer');
    } else {
      navigateTo('category_products', { categoryId: targetLink });
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swipe left -> next
        setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
      } else {
        // Swipe right -> prev
        setCurrentIndex((prev) => (prev - 1 + activeOffers.length) % activeOffers.length);
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden bg-slate-950 text-white shadow-xl min-h-[240px] sm:min-h-[290px] flex items-center group select-none transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Banner Image - Always displays the actual uploaded banner image */}
      {currentOffer.image_url ? (
        <img
          key={currentOffer.id + currentOffer.image_url}
          src={currentOffer.image_url}
          alt={currentOffer.title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700"
        />
      ) : null}

      {/* Dark Readability Gradient Overlays for High-Contrast Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

      {/* Offer Content */}
      <div className="relative z-10 p-6 sm:p-10 max-w-xl space-y-3">
        {/* Discount Badge & Category Tag */}
        <div className="flex flex-wrap items-center gap-2">
          {currentOffer.discount_text && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/90 border border-blue-400/50 text-white text-xs font-black uppercase tracking-wider shadow-md backdrop-blur-xs">
              <Tag className="w-3.5 h-3.5 text-blue-200" />
              <span>{currentOffer.discount_text}</span>
            </div>
          )}
          {currentOffer.category_name && currentOffer.category_id !== 'all' && (
            <span className="text-[11px] font-bold text-slate-200 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-xs">
              {currentOffer.category_name}
            </span>
          )}
        </div>

        {/* Offer Title */}
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
          {currentOffer.title}
        </h2>

        {/* Offer Description / Subtitle */}
        {currentOffer.description && (
          <p className="text-xs sm:text-sm text-slate-200 max-w-md line-clamp-3 leading-relaxed">
            {currentOffer.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleDestinationClick}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>{currentOffer.button_text || 'Shop Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigateTo('categories')}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-xs transition-all cursor-pointer"
          >
            Explore All
          </button>
        </div>
      </div>

      {/* Multiple Offers Carousel Controls: Navigation Arrows */}
      {activeOffers.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous offer"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/10 opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next offer"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/10 opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Navigation Dots Indicator */}
          <div className="absolute bottom-3.5 right-6 z-20 flex items-center gap-1.5 bg-slate-900/40 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
            {activeOffers.map((offer, idx) => (
              <button
                key={offer.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  idx === safeIndex
                    ? 'w-6 h-2 bg-blue-500'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

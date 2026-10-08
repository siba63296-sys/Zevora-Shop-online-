import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Offer } from '../types';
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

export const DynamicOfferBanner: React.FC = () => {
  const { activeOffers, navigateTo, categories } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // If no active offers, hide the entire offer banner area cleanly (no empty space)
  if (!activeOffers || activeOffers.length === 0) {
    return null;
  }

  // Ensure index stays in range if offers list changes dynamically
  const safeIndex = currentIndex >= activeOffers.length ? 0 : currentIndex;

  // Auto-play timer with 5-second interval for multi-offer carousel
  useEffect(() => {
    if (activeOffers.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
    }, 5000);

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

  const handleDestinationClick = (offer: Offer) => {
    // If offer targets a specific category, directly open that category
    if (offer.category_id && offer.category_id !== 'all' && offer.category_id !== '*') {
      navigateTo('category_products', { categoryId: offer.category_id });
      return;
    }

    const targetLink = (offer.button_link || 'categories').trim();
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

  // Touch swipe support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - touchEndX;
    const diffY = touchStartYRef.current !== null ? Math.abs(touchStartYRef.current - touchEndY) : 0;

    // Trigger slide change when horizontal swipe distance is sufficient and dominant
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        // Swipe left -> next slide
        setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
      } else {
        // Swipe right -> prev slide
        setCurrentIndex((prev) => (prev - 1 + activeOffers.length) % activeOffers.length);
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 text-white shadow-md sm:shadow-lg min-h-[190px] sm:min-h-[250px] md:min-h-[290px] lg:min-h-[330px] group select-none transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Horizontal Carousel Sliding Track */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${safeIndex * 100}%)` }}
      >
        {activeOffers.map((offer) => {
          const hasTitle = Boolean(offer.title && offer.title.trim().length > 0);
          const hasDescription = Boolean(offer.description && offer.description.trim().length > 0);
          const displayDiscount =
            offer.discount_text?.trim() ||
            (offer.discount_percentage ? `${offer.discount_percentage}% OFF` : '');
          const hasDiscount = Boolean(displayDiscount);

          return (
            <div
              key={offer.id}
              className="relative w-full min-w-full shrink-0 min-h-[190px] sm:min-h-[250px] md:min-h-[290px] lg:min-h-[330px] flex items-center"
            >
              {/* Background Banner Image - Displays clearly, preserving aspect ratio */}
              {offer.image_url ? (
                <img
                  src={offer.image_url}
                  alt={offer.title || 'Offer Banner'}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : null}

              {/* Subtle overlay for legibility without making the image dark */}
              {hasTitle || hasDescription ? (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/30 to-transparent pointer-events-none" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/25 via-transparent to-transparent pointer-events-none" />
              )}

              {/* Offer Content */}
              <div className="relative z-10 p-5 sm:p-8 md:p-10 max-w-xl flex flex-col justify-center items-start gap-2.5 sm:gap-3.5">
                {/* Discount Badge if available */}
                {hasDiscount && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/90 border border-blue-400/40 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-md backdrop-blur-xs">
                    <Tag className="w-3.5 h-3.5 text-blue-200" />
                    <span>{displayDiscount}</span>
                  </div>
                )}

                {/* Offer Title (rendered ONLY if title is present and non-empty) */}
                {hasTitle && (
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                    {offer.title}
                  </h2>
                )}

                {/* Offer Description / Subtitle (rendered ONLY if description is present and non-empty) */}
                {hasDescription && (
                  <p className="text-xs sm:text-sm text-slate-100 max-w-md line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-xs">
                    {offer.description}
                  </p>
                )}

                {/* Action Button: ONLY ONE CTA Button ("Shop Now") */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleDestinationClick(offer)}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl shadow-lg shadow-blue-600/40 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{offer.button_text?.trim() || 'Shop Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multiple Offers Carousel Controls: Navigation Arrows */}
      {activeOffers.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous offer"
            className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/10 opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next offer"
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/10 opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Navigation Dots Indicator */}
          <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 z-20 flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
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
                    ? 'w-5 sm:w-6 h-2 bg-blue-500'
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

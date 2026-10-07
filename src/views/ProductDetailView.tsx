import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import {
  ChevronLeft,
  Heart,
  Star,
  ShoppingCart,
  Zap,
  CheckCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Share2,
  ArrowLeftRight,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  Ruler,
  Check,
  AlertCircle,
} from 'lucide-react';
import { ProductReviews } from '../components/ProductReviews';
import { SizeChartModal } from '../components/SizeChartModal';
import {
  findVariant,
  getColorImages,
  getColorStock,
  getSizeStock,
  isSizeInStock,
} from '../utils/variants';

export const ProductDetailView: React.FC = () => {
  const {
    products,
    selectedProductId,
    navigateTo,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleComparison,
    isInComparison,
    setIsCompareModalOpen,
    getProductReviews,
    showToast,
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const isCompared = product ? isInComparison(product.id) : false;

  const productReviews = product ? getProductReviews(product.id) : [];
  const reviewCount = productReviews.length;
  const avgRating = reviewCount > 0
    ? Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
    : (product?.rating || 4.5);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [sizeErrorPrompt, setSizeErrorPrompt] = useState(false);

  // Sync state if selected product changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name || '');
      setSelectedSize('');
      setActiveImageIndex(0);
      setSizeErrorPrompt(false);
    }
  }, [product?.id]);

  // Gallery interactive zoom & fullscreen states
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenZoom, setFullscreenZoom] = useState(1);
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Dynamic image list based on selected color
  const colorImages = useMemo(() => {
    if (!product) return [];
    return getColorImages(product, selectedColor);
  }, [product, selectedColor]);

  const imageList = (colorImages && colorImages.length > 0)
    ? colorImages
    : ((product?.images && product.images.length > 0)
      ? product.images
      : ['https://placehold.co/600x600/png?text=Product']);

  // Reset active image index if out of range when color changes
  useEffect(() => {
    if (activeImageIndex >= imageList.length) {
      setActiveImageIndex(0);
    }
  }, [imageList.length]);

  // Matched variant
  const activeVariant = useMemo(() => {
    if (!product) return undefined;
    return findVariant(product, selectedColor, selectedSize);
  }, [product, selectedColor, selectedSize]);

  // Dynamic pricing
  const currentPrice = activeVariant?.price ?? product?.price ?? 0;
  const currentMrp = activeVariant?.original_price ?? product?.original_price ?? currentPrice;
  const currentDiscountPercent = currentMrp > currentPrice
    ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100)
    : (product?.discount_percent ?? 0);

  // Dynamic stock
  const currentStock = useMemo(() => {
    if (!product) return 0;
    if (activeVariant) {
      return Number(activeVariant.stock_quantity) || 0;
    }
    if (selectedSize) {
      return getSizeStock(product, selectedSize, selectedColor);
    }
    if (selectedColor && (!product.sizes || product.sizes.length === 0)) {
      return getColorStock(product, selectedColor);
    }
    return product.stock_quantity;
  }, [product, activeVariant, selectedSize, selectedColor]);

  const hasSizes = Boolean(product?.sizes && product.sizes.length > 0);
  const isAvailableToBuy = Boolean(product?.in_stock && currentStock > 0);

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Product not found.</p>
        <button
          onClick={() => navigateTo('home')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Navigation handlers
  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0));
  };

  // Mobile swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      handleNextImage();
    } else if (distance < -minSwipeDistance) {
      handlePrevImage();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Desktop hover zoom tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  // Keyboard navigation for fullscreen viewer (ESC to close, Left/Right arrows)
  useEffect(() => {
    if (!isFullscreenOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreenOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, imageList.length]);

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      setSizeErrorPrompt(true);
      showToast('Please select a size first.', 'error');
      document.getElementById('size-selector-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setSizeErrorPrompt(false), 2500);
      return;
    }

    if (!isAvailableToBuy) {
      showToast(`${product.name} is Out of Stock.`, 'error');
      return;
    }

    addToCart(product, quantity, selectedColor, selectedSize, activeVariant);
  };

  const handleBuyNow = () => {
    if (hasSizes && !selectedSize) {
      setSizeErrorPrompt(true);
      showToast('Please select a size first.', 'error');
      document.getElementById('size-selector-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setSizeErrorPrompt(false), 2500);
      return;
    }

    if (!isAvailableToBuy) {
      showToast(`${product.name} is Out of Stock.`, 'error');
      return;
    }

    addToCart(product, quantity, selectedColor, selectedSize, activeVariant);
    navigateTo('checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on The Online Store`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard', 'success');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => navigateTo('home')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => toggleWishlist(product)}
            className={`p-2 rounded-xl transition-colors ${
              isWishlisted ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery with Zoom, Swipe, Thumbnails & Fullscreen */}
        <div className="space-y-4">
          {/* Main Large Product Image */}
          <div
            className="w-full h-80 sm:h-96 md:h-[420px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center relative overflow-hidden shadow-xs select-none cursor-zoom-in group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsHoverZooming(true)}
            onMouseLeave={() => setIsHoverZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => {
              setFullscreenZoom(1);
              setIsFullscreenOpen(true);
            }}
          >
            {/* Main Image with Smooth Desktop Hover Zoom */}
            <div className="w-full h-full flex items-center justify-center p-6 overflow-hidden">
              <img
                src={imageList[activeImageIndex] || imageList[0]}
                alt={`${product.name} photo ${activeImageIndex + 1}`}
                referrerPolicy="no-referrer"
                style={
                  isHoverZooming
                    ? {
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                        transform: 'scale(1.85)',
                        transition: 'transform 0.1s ease-out',
                      }
                    : {
                        transform: 'scale(1)',
                        transition: 'transform 0.25s ease-out',
                      }
                }
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
            </div>

            {/* Top Left: Photo Counter Badge */}
            {imageList.length > 1 && (
              <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs pointer-events-none">
                {activeImageIndex + 1} / {imageList.length}
              </div>
            )}

            {/* Top Right: Fullscreen / Zoom Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenZoom(1);
                setIsFullscreenOpen(true);
              }}
              title="Open full-screen gallery with zoom"
              className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Desktop & Mobile Left Navigation Arrow */}
            {imageList.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
                title="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Desktop & Mobile Right Navigation Arrow */}
            {imageList.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
                title="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Bottom Dots Indicator */}
            {imageList.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                {imageList.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      activeImageIndex === idx ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Interactive Thumbnails Rail */}
          {imageList.length > 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-2xl border-2 overflow-hidden bg-white dark:bg-slate-900 p-1.5 transition-all cursor-pointer relative ${
                      activeImageIndex === idx
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 right-1 bg-blue-600/90 text-white text-[8px] font-extrabold text-center rounded py-0.2">
                        Cover
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                Tap photo to view • Swipe on mobile or hover to zoom
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module & Details */}
        <div className="space-y-5">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
              {product.category_name || 'Electronics'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Stock */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <a
                href="#customer-reviews"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('customer-reviews')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer group"
                title="View verified customer reviews"
              >
                <Star className="w-3.5 h-3.5 fill-current text-amber-500 group-hover:scale-110 transition-transform" />
                <span>{avgRating}</span>
                <span className="text-amber-700/80 dark:text-amber-400/80">({reviewCount} reviews)</span>
              </a>

              {isAvailableToBuy ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  In Stock ({currentStock} available)
                </span>
              ) : (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                  Out of Stock
                </span>
              )}

              {activeVariant?.sku ? (
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  SKU: {activeVariant.sku}
                </span>
              ) : product.sku ? (
                <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  SKU: {product.sku}
                </span>
              ) : null}
            </div>
          </div>

          {/* Price Block */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {currentMrp > currentPrice && (
              <>
                <span className="text-base text-slate-400 dark:text-slate-500 line-through tabular-nums">
                  ₹{currentMrp.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {currentDiscountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Spec Badges Grid */}
          {product.specs && product.specs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {product.specs.map((spec, idx) => (
                <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block truncate">
                    {spec.label}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Color: <strong className="text-slate-900 dark:text-slate-100">{selectedColor || 'Choose a color'}</strong>
                </span>
                {selectedColor && (
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {getColorStock(product, selectedColor) > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {getColorStock(product, selectedColor)} in stock
                      </span>
                    ) : (
                      <span className="text-rose-500 dark:text-rose-400 font-semibold">Out of stock</span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {product.colors.map((c) => {
                  const cStock = getColorStock(product, c.name);
                  const isOut = cStock <= 0;
                  const isSel = selectedColor.toLowerCase() === c.name.toLowerCase();

                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(c.name);
                        setActiveImageIndex(0);
                      }}
                      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSel
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 ring-2 ring-blue-500/30 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                      } ${isOut ? 'opacity-60' : ''}`}
                      title={`${c.name} (${cStock} in stock)`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shadow-2xs shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className={`text-xs font-bold ${isSel ? 'text-blue-900 dark:text-blue-200' : 'text-slate-700 dark:text-slate-300'}`}>
                        {c.name}
                      </span>
                      {isSel && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[3]" />}
                      {isOut && (
                        <span className="text-[9px] text-rose-500 dark:text-rose-400 font-medium">Sold out</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector with Size Chart */}
          {hasSizes && (
            <div
              id="size-selector-section"
              className={`space-y-2.5 p-3.5 rounded-2xl transition-all ${
                sizeErrorPrompt
                  ? 'border-2 border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 shadow-md ring-4 ring-rose-500/20'
                  : 'bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Select Size
                  </span>
                  {selectedSize ? (
                    <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                      {selectedSize}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                      Required *
                    </span>
                  )}
                </div>

                {/* Clickable Size Chart Button */}
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-800 shadow-2xs transition-all cursor-pointer group"
                >
                  <Ruler className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Size Chart</span>
                </button>
              </div>

              {/* Functional Size Buttons Grid */}
              <div className="flex flex-wrap gap-2 pt-1">
                {product.sizes!.map((sz) => {
                  const inStock = isSizeInStock(product, sz, selectedColor);
                  const szStock = getSizeStock(product, sz, selectedColor);
                  const isSelected = selectedSize.toLowerCase() === sz.toLowerCase();

                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!inStock}
                      onClick={() => {
                        if (inStock) {
                          setSelectedSize(sz);
                          setSizeErrorPrompt(false);
                        }
                      }}
                      className={`relative min-w-14 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                        !inStock
                          ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border border-slate-200/80 dark:border-slate-800 cursor-not-allowed opacity-50 line-through'
                          : isSelected
                          ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                      title={!inStock ? `${sz} is Out of stock` : `${sz} (${szStock} available)`}
                    >
                      <span className="text-xs">{sz}</span>
                      {!inStock && (
                        <span className="text-[8px] no-underline font-bold text-rose-500 uppercase tracking-tighter">
                          Sold Out
                        </span>
                      )}
                      {inStock && szStock > 0 && szStock <= 5 && (
                        <span
                          className={`text-[8px] font-medium tracking-tight ${
                            isSelected ? 'text-amber-200' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          Only {szStock} left
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {sizeErrorPrompt && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Please choose your size before adding to cart or purchasing.</span>
                </p>
              )}

              {selectedSize && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Selected: <strong className="text-slate-900 dark:text-slate-100">{selectedSize}</strong>
                    {selectedColor ? ` • ${selectedColor}` : ''}
                    {activeVariant?.sku ? ` • SKU: ${activeVariant.sku}` : ''}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quantity Stepper & Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center border rounded-xl p-1 ${
                  isAvailableToBuy ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 opacity-60'
                }`}
              >
                <button
                  type="button"
                  disabled={!isAvailableToBuy}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {isAvailableToBuy ? quantity : 0}
                </span>
                <button
                  type="button"
                  disabled={!isAvailableToBuy}
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {isAvailableToBuy ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-3 px-6 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <span>Out of Stock</span>
                </button>
              )}
            </div>

            {/* Buy Now, Wishlist & Compare */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isWishlisted
                    ? 'border-pink-300 dark:border-pink-800 text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleComparison(product)}
                className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isCompared
                    ? 'border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                title="Compare up to 3 products"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{isCompared ? 'In Compare' : 'Compare'}</span>
              </button>

              {isAvailableToBuy ? (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer border border-slate-800 dark:border-slate-700"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Buy Now</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                >
                  <span>Currently Unavailable</span>
                </button>
              )}
            </div>
          </div>

          {/* Delivery & Trust highlights */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">Fast Delivery</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">2-4 Business Days</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">1 Year Warranty</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">100% Genuine</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <RotateCcw className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">7 Days Return</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Hassle Free</span>
            </div>
          </div>

          {/* 7 Days Return Policy Section */}
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-purple-950 dark:text-purple-200">7 Days Return Policy</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                Guaranteed
              </span>
            </div>
            <ul className="text-xs text-purple-900/90 dark:text-purple-300/90 space-y-1 pl-1 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                <span>Customers can request a return within <strong>7 days of delivery</strong>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                <span>
                  Return is accepted <strong>only if the original product box seal is intact and unbroken</strong>.
                </span>
              </li>
            </ul>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">About this item</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Submission Section */}
      <ProductReviews product={product} />

      {/* Full-Screen Interactive Product Photo Viewer with Zoom */}
      {isFullscreenOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsFullscreenOpen(false)}
        >
          {/* Top Bar Controls */}
          <div
            className="flex items-center justify-between gap-3 text-white z-10 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-extrabold truncate text-white/90">
                {product.name}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80 shrink-0">
                Photo {activeImageIndex + 1} of {imageList.length}
              </span>
            </div>

            {/* Zoom & Close Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setFullscreenZoom((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))))}
                  disabled={fullscreenZoom <= 1}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white disabled:opacity-30 transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono font-bold px-2 text-white/90 min-w-[36px] text-center">
                  {fullscreenZoom}x
                </span>
                <button
                  type="button"
                  onClick={() => setFullscreenZoom((prev) => Math.min(3, Number((prev + 0.5).toFixed(1))))}
                  disabled={fullscreenZoom >= 3}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white disabled:opacity-30 transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {fullscreenZoom !== 1 && (
                  <button
                    type="button"
                    onClick={() => setFullscreenZoom(1)}
                    className="p-1.5 hover:bg-white/20 rounded-lg text-amber-300 hover:text-white transition-colors"
                    title="Reset zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreenOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                title="Close fullscreen viewer (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Large High-Res Image Display */}
          <div
            className="flex-1 flex items-center justify-center relative overflow-hidden my-3 select-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={() => setFullscreenZoom((prev) => (prev > 1 ? 1 : 2))}
          >
            {/* Left Nav Arrow */}
            {imageList.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all backdrop-blur-xs hover:scale-110 cursor-pointer"
                title="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Display Image with Dynamic Zoom Scale */}
            <div
              className="max-w-full max-h-full flex items-center justify-center overflow-auto p-4 cursor-zoom-in"
              onClick={() => setFullscreenZoom((prev) => (prev >= 2 ? 1 : Number((prev + 0.5).toFixed(1))))}
            >
              <img
                src={imageList[activeImageIndex] || imageList[0]}
                alt={`${product.name} zoomed view`}
                referrerPolicy="no-referrer"
                style={{
                  transform: `scale(${fullscreenZoom})`,
                  transition: 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)',
                }}
                className="max-h-[72vh] max-w-[88vw] object-contain drop-shadow-2xl"
              />
            </div>

            {/* Right Nav Arrow */}
            {imageList.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all backdrop-blur-xs hover:scale-110 cursor-pointer"
                title="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Rail & Gesture Hints */}
          <div
            className="flex flex-col items-center gap-2 z-10 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {imageList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 px-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xs">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-slate-900 p-1 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/30'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-white/50 text-center">
              Swipe or use arrow keys to navigate • Double-click or tap to zoom in/out • Click background to exit
            </p>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        productName={product.name}
        categoryName={product.category_name}
        customChart={product.size_chart}
        selectedSize={selectedSize}
        onSelectSize={(sz) => {
          setSelectedSize(sz);
          setSizeErrorPrompt(false);
        }}
      />
    </div>
  );
};

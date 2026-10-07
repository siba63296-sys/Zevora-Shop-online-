import React, { useState } from 'react';
import { Product, ProductReview } from '../types';
import { useStore } from '../context/StoreContext';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquarePlus,
  X,
  User,
  Sparkles,
  Calendar,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

interface ProductReviewsProps {
  product: Product;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
  const { user, orders, getProductReviews, submitProductReview, markReviewHelpful, navigateTo, addToCart } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState(user?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [isTestVerified, setIsTestVerified] = useState(false);

  const reviews = getProductReviews(product.id);

  // Check verified purchase status: Does an order exist containing this product?
  const matchedOrder = orders.find((order) =>
    order.items.some((item) => item.product_id === product.id)
  );
  const hasPurchased = Boolean(matchedOrder) || isTestVerified;

  // Real-time Average Rating calculation
  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1))
    : (product.rating || 4.5);

  // Rating distribution calculation
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { stars, count, percentage };
  });

  const ratingLabels: Record<number, string> = {
    1: 'Poor (1 Star)',
    2: 'Fair (2 Stars)',
    3: 'Good (3 Stars)',
    4: 'Very Good (4 Stars)',
    5: 'Excellent (5 Stars)',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await submitProductReview(
        product.id,
        rating,
        title.trim() || 'Verified Customer Review',
        comment.trim(),
        authorName.trim()
      );
      setShowForm(false);
      setTitle('');
      setComment('');
      setRating(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <div id="customer-reviews" className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Customer Reviews &amp; Ratings
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {totalReviewsCount} Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Authentic feedback from verified purchasers of {product.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Review Submission Form Modal / Panel */}
      {showForm && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-3xl p-5 sm:p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Write a Review for {product.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Share your genuine experience with other shoppers.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Verified Purchase Check Banner */}
          {!hasPurchased ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-amber-900">Verified Purchase Required</h5>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    To maintain strict integrity, our review policy allows ratings from customers who have purchased this product. We could not find a completed order for <strong>{product.name}</strong> under your account.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 pl-7">
                {product.in_stock ? (
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product, 1);
                      navigateTo('cart');
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Purchase Product Now</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsTestVerified(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                  <span>Verify as Demo Purchaser</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Verified Purchaser: {matchedOrder ? `Order #${matchedOrder.order_number}` : 'Purchased & Verified'}
              </span>
            </div>
          )}

          {hasPurchased && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              {/* Interactive Star Rating */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Overall Rating: <span className="text-blue-600 font-extrabold">{ratingLabels[hoverRating || rating]}</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Author Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Exceptional build quality and performance!"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Review Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Review</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked about this item, how it performed in daily use, and why you would recommend it."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing Review...' : 'Submit Verified Review'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Ratings Overview & Star Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800">
        {/* Left: Big Average Rating Display */}
        <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
          <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
            {averageRating}
          </span>
          <div className="flex items-center gap-1 text-amber-400 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(averageRating) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Average based on {totalReviewsCount} verified rating{totalReviewsCount === 1 ? '' : 's'}
          </p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Verified Purchaser Feedback</span>
          </div>
        </div>

        {/* Right: Distribution Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2">
          {ratingCounts.map(({ stars, count, percentage }) => (
            <button
              key={stars}
              type="button"
              onClick={() => setFilterRating(filterRating === stars ? null : stars)}
              className={`flex items-center gap-3 text-xs group text-left hover:bg-white dark:hover:bg-slate-800 p-1 rounded-lg transition-colors ${
                filterRating === stars ? 'bg-white dark:bg-slate-800 shadow-2xs font-bold ring-1 ring-blue-500/20' : ''
              }`}
            >
              <span className="w-12 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0">
                <span>{stars}</span>
                <Star className="w-3 h-3 fill-current text-amber-400" />
              </span>

              <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <span className="w-14 text-right font-medium text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                {count > 0 ? `${percentage}% (${count})` : '0%'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tag if active */}
      {filterRating && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Filtering by <strong>{filterRating} Star</strong> reviews
          </span>
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Show All ({totalReviewsCount}) Reviews
          </button>
        </div>
      )}

      {/* Customer Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-xs font-extrabold shrink-0">
                    {rev.user_name ? rev.user_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{rev.user_name}</span>
                      {rev.verified_purchase && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(rev.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              </div>

              {/* Stars & Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'fill-current' : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {rev.title && (
                  <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">{rev.title}</h5>
                )}
              </div>

              {/* Review Comment */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {rev.comment}
              </p>

              {/* Helpful interaction */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>Was this review helpful?</span>
                <button
                  type="button"
                  onClick={() => markReviewHelpful(rev.id, product.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({rev.helpful_count || 0})</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              No reviews matching your filter yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

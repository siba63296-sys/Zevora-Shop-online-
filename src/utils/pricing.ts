import { Product, Offer } from '../types';

/**
 * Extracts a numeric discount percentage from an Offer (1-99).
 * Checks offer.discount_percentage first, then parses offer.discount_text (e.g. "30% OFF").
 */
export const getOfferDiscountPercentage = (offer: Offer): number => {
  if (typeof offer.discount_percentage === 'number' && offer.discount_percentage > 0) {
    return Math.min(99, Math.max(1, Math.round(offer.discount_percentage)));
  }

  if (offer.discount_text) {
    const match = offer.discount_text.match(/(\d+)\s*%/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (parsed > 0 && parsed < 100) {
        return parsed;
      }
    }
  }

  return 0;
};

/**
 * Checks whether an offer is active and valid at the specified time.
 */
export const isOfferCurrentlyActive = (offer: Offer, now = new Date()): boolean => {
  if (!offer.is_active) return false;

  if (offer.start_at) {
    const start = new Date(offer.start_at);
    if (!isNaN(start.getTime()) && now < start) {
      return false; // Future offer, not yet active
    }
  }

  if (offer.end_at) {
    const end = new Date(offer.end_at);
    if (!isNaN(end.getTime()) && now > end) {
      return false; // Expired offer
    }
  }

  return true;
};

/**
 * Determines whether a given active offer applies to a specific product.
 */
export const isOfferApplicableToProduct = (product: Product, offer: Offer): boolean => {
  const targetCategory = (offer.category_id || '').trim();

  // 1. Storewide discount if target category is empty or 'all' or '*'
  if (!targetCategory || targetCategory === 'all' || targetCategory === '*') {
    return true;
  }

  // 2. Direct category ID match (e.g., 'cat-fashion' === 'cat-fashion')
  if (targetCategory === product.category_id) {
    return true;
  }

  // 3. Normalized category slug match (stripping 'cat-' prefix)
  const normTarget = targetCategory.toLowerCase().replace(/^cat-/, '');
  const normProdCat = (product.category_id || '').toLowerCase().replace(/^cat-/, '');
  if (normTarget && normTarget === normProdCat) {
    return true;
  }

  // 4. Case-insensitive category name match (e.g., 'Fashion' === 'fashion')
  if (product.category_name && targetCategory.toLowerCase() === product.category_name.toLowerCase()) {
    return true;
  }

  // 5. Offer category_name matching product category_name or product category_id
  if (offer.category_name && product.category_name && offer.category_name.toLowerCase() === product.category_name.toLowerCase()) {
    return true;
  }

  // 6. Offer button link matching category ID, slug, or name
  if (offer.button_link) {
    const link = offer.button_link.trim().toLowerCase();
    if (link === product.category_id.toLowerCase() || link.replace(/^cat-/, '') === normProdCat) {
      return true;
    }
  }

  return false;
};

/**
 * Finds the highest applicable active offer for a product.
 * Avoids stacking discounts by deterministically selecting the single best offer.
 */
export const getBestActiveOfferForProduct = (
  product: Product,
  activeOffers: Offer[]
): { offer: Offer; discountPercentage: number } | null => {
  if (!activeOffers || activeOffers.length === 0) return null;

  let bestOffer: Offer | null = null;
  let maxDiscount = 0;

  for (const offer of activeOffers) {
    if (!isOfferCurrentlyActive(offer)) continue;

    const discount = getOfferDiscountPercentage(offer);
    if (discount <= 0) continue;

    if (isOfferApplicableToProduct(product, offer)) {
      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestOffer = offer;
      }
    }
  }

  return bestOffer && maxDiscount > 0 ? { offer: bestOffer, discountPercentage: maxDiscount } : null;
};

/**
 * Applies dynamic active offer discount to a product without mutating the database base price.
 * Calculates:
 * discountAmount = baseOriginalPrice * discountPercentage / 100
 * finalPrice = Math.round(baseOriginalPrice - discountAmount)
 */
export const calculateDiscountedProduct = (product: Product, activeOffers: Offer[]): Product => {
  // If no active offers, return product with its base prices
  if (!activeOffers || activeOffers.length === 0) {
    return product;
  }

  const match = getBestActiveOfferForProduct(product, activeOffers);
  if (!match) {
    return product;
  }

  const { offer, discountPercentage } = match;

  // The true base original price (never below the current base price)
  const baseOriginalPrice = product.original_price && product.original_price > product.price
    ? product.original_price
    : product.price;

  // Calculate discount amount and final selling price rounded for INR
  const discountAmount = (baseOriginalPrice * discountPercentage) / 100;
  const finalPrice = Math.max(1, Math.round(baseOriginalPrice - discountAmount));

  return {
    ...product,
    price: finalPrice,
    original_price: baseOriginalPrice,
    discount_percent: discountPercentage,
    is_deal: true,
    applied_offer_id: offer.id,
    applied_offer_title: offer.title,
  };
};

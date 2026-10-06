import { Coupon, CartItem } from '../types';

/**
 * Checks whether a coupon is within its valid date range and active.
 */
export const isCouponCurrentlyActive = (coupon: Coupon, now = new Date()): boolean => {
  if (!coupon.is_active) return false;

  if (coupon.start_at) {
    const start = new Date(coupon.start_at);
    if (!isNaN(start.getTime()) && now < start) {
      return false; // Not yet started
    }
  }

  if (coupon.end_at) {
    const end = new Date(coupon.end_at);
    if (!isNaN(end.getTime()) && now > end) {
      return false; // Expired
    }
  }

  if (typeof coupon.usage_limit === 'number' && coupon.usage_limit > 0) {
    if (typeof coupon.times_used === 'number' && coupon.times_used >= coupon.usage_limit) {
      return false; // Usage limit reached
    }
  }

  return true;
};

/**
 * Validates whether a coupon can be applied to the current cart.
 */
export const validateCouponForCart = (
  coupon: Coupon,
  cart: CartItem[],
  cartTotal: number,
  now = new Date()
): { valid: boolean; message: string; discountAmount: number } => {
  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code.', discountAmount: 0 };
  }

  if (!isCouponCurrentlyActive(coupon, now)) {
    if (coupon.end_at && new Date(coupon.end_at) < now) {
      return { valid: false, message: `Coupon "${coupon.code}" has expired.`, discountAmount: 0 };
    }
    if (typeof coupon.usage_limit === 'number' && (coupon.times_used || 0) >= coupon.usage_limit) {
      return { valid: false, message: `Coupon "${coupon.code}" has reached its maximum usage limit.`, discountAmount: 0 };
    }
    return { valid: false, message: `Coupon "${coupon.code}" is currently inactive.`, discountAmount: 0 };
  }

  if (!cart || cart.length === 0) {
    return { valid: false, message: 'Your cart is empty.', discountAmount: 0 };
  }

  // 1. Minimum cart value check
  const minRequired = Number(coupon.min_cart_value) || 0;
  if (minRequired > 0 && cartTotal < minRequired) {
    return {
      valid: false,
      message: `Minimum order value of ₹${minRequired.toLocaleString('en-IN')} is required to apply "${coupon.code}". (Current cart: ₹${cartTotal.toLocaleString('en-IN')})`,
      discountAmount: 0,
    };
  }

  // 2. Identify eligible cart items based on scope and allow_with_offers rule
  // Rule: "Offer + Coupon dono active ho to double discount tabhi ho jab admin allow kare."
  // If allow_with_offers is false, the coupon can ONLY discount items that do NOT already have an active offer discount.
  const eligibleItems = cart.filter((item) => {
    // If double discounting is not allowed and product already has an applied offer, skip this item
    if (!coupon.allow_with_offers && item.product.applied_offer_id) {
      return false;
    }

    // Check scope
    if (coupon.scope === 'all' || !coupon.scope) {
      return true;
    }

    if (coupon.scope === 'category') {
      const targetCat = (coupon.target_category_id || '').trim().toLowerCase();
      const itemCatId = (item.product.category_id || '').trim().toLowerCase();
      const itemCatName = (item.product.category_name || '').trim().toLowerCase();
      const targetCatName = (coupon.target_category_name || '').trim().toLowerCase();

      if (targetCat && (targetCat === itemCatId || targetCat.replace(/^cat-/, '') === itemCatId.replace(/^cat-/, ''))) {
        return true;
      }
      if (targetCatName && (targetCatName === itemCatName || targetCat === itemCatName)) {
        return true;
      }
      return false;
    }

    if (coupon.scope === 'products') {
      const targetProductIds = coupon.target_product_ids || [];
      return targetProductIds.includes(item.product.id) || targetProductIds.includes(item.product_id);
    }

    return true;
  });

  if (eligibleItems.length === 0) {
    if (!coupon.allow_with_offers) {
      return {
        valid: false,
        message: `Coupon "${coupon.code}" cannot be combined with existing category offer deals in your cart.`,
        discountAmount: 0,
      };
    }
    return {
      valid: false,
      message: `Coupon "${coupon.code}" is not applicable to the items currently in your cart.`,
      discountAmount: 0,
    };
  }

  // 3. Calculate eligible subtotal
  const eligibleSubtotal = eligibleItems.reduce(
    (sum, it) => sum + (it.product.price * it.quantity),
    0
  );

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    const rawDiscount = (eligibleSubtotal * (coupon.discount_value || 0)) / 100;
    discount = Math.round(rawDiscount);

    // Apply maximum cap if configured
    if (coupon.max_discount_amount && coupon.max_discount_amount > 0) {
      discount = Math.min(discount, coupon.max_discount_amount);
    }
  } else {
    // Fixed amount discount (₹)
    discount = Math.round(Number(coupon.discount_value) || 0);
  }

  // Cannot exceed the total cart value or eligible subtotal
  discount = Math.max(0, Math.min(discount, eligibleSubtotal, cartTotal));

  if (discount <= 0) {
    return {
      valid: false,
      message: `Coupon "${coupon.code}" provides no discount on your current cart items.`,
      discountAmount: 0,
    };
  }

  return {
    valid: true,
    message: `Coupon "${coupon.code}" applied! You saved ₹${discount.toLocaleString('en-IN')}.`,
    discountAmount: discount,
  };
};

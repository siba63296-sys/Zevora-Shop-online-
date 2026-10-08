import { ColorVariant, Product, ProductVariant, SizeChart } from '../types';

// Standard Curated Color Palette for Zevora Store
export const PRESET_COLORS: ColorVariant[] = [
  { name: 'Black', hex: '#0f172a' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Aqua Blue', hex: '#06b6d4' },
  { name: 'Beige', hex: '#d4b996' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Lavender', hex: '#a855f7' },
  { name: 'Maroon', hex: '#881337' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Peach', hex: '#fb923c' },
  { name: 'Gold', hex: '#d97706' },
  { name: 'Silver Gray', hex: '#94a3b8' },
];

// Standard Adult Apparel Sizes
export const PRESET_ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

// Girls & Kids Age-Based Sizes
export const PRESET_GIRLS_SIZES = [
  '2-3 Years',
  '4-5 Years',
  '6-7 Years',
  '8-9 Years',
  '10-11 Years',
  '12-13 Years',
  '14-15 Years',
  '15-16 Years',
];

// Footwear Sizes (UK / India)
export const PRESET_FOOTWEAR_SIZES = ['UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'];

// Default Adult Size Chart Preset (with both inches and cm values)
export const ADULT_APPAREL_SIZE_CHART: SizeChart = {
  type: 'standard',
  title: 'Standard Apparel Size Chart (Women & Men)',
  unit: 'inches',
  rows: [
    { size: 'XS', chest: '32 - 34', waist: '26 - 28', hips: '34 - 36', length: '38', shoulder: '14.0' },
    { size: 'S', chest: '34 - 36', waist: '28 - 30', hips: '36 - 38', length: '39', shoulder: '14.5' },
    { size: 'M', chest: '36 - 38', waist: '30 - 32', hips: '38 - 40', length: '40', shoulder: '15.0' },
    { size: 'L', chest: '38 - 40', waist: '32 - 34', hips: '40 - 42', length: '41', shoulder: '15.5' },
    { size: 'XL', chest: '40 - 42', waist: '34 - 36', hips: '42 - 44', length: '42', shoulder: '16.0' },
    { size: 'XXL', chest: '42 - 44', waist: '36 - 38', hips: '44 - 46', length: '43', shoulder: '16.5' },
    { size: '3XL', chest: '44 - 46', waist: '38 - 40', hips: '46 - 48', length: '44', shoulder: '17.0' },
    { size: '4XL', chest: '46 - 48', waist: '40 - 42', hips: '48 - 50', length: '45', shoulder: '17.5' },
    { size: '5XL', chest: '48 - 50', waist: '42 - 44', hips: '50 - 52', length: '46', shoulder: '18.0' },
  ],
  guide_tips: [
    'Bust/Chest: Measure around the fullest part of your chest with tape parallel to the floor.',
    'Waist: Measure around your natural waistline, where your body narrows.',
    'Hips: Stand with feet together and measure around the fullest part of your hips.',
    'Length: Measure from high point of shoulder straight down to hemline.',
  ],
};

// Girls & Kids Size Chart Preset
export const GIRLS_DRESS_SIZE_CHART: SizeChart = {
  type: 'girls',
  title: 'Girls & Kids Dresses Size Chart',
  unit: 'inches',
  rows: [
    { size: '2-3 Years', age_group: '2-3 Yrs', chest: '20 - 21', waist: '19 - 20', length: '21', height: '35 - 38' },
    { size: '4-5 Years', age_group: '4-5 Yrs', chest: '22 - 23', waist: '21 - 22', length: '24', height: '40 - 43' },
    { size: '6-7 Years', age_group: '6-7 Yrs', chest: '24 - 25', waist: '22 - 23', length: '27', height: '45 - 48' },
    { size: '8-9 Years', age_group: '8-9 Yrs', chest: '26 - 27', waist: '23 - 24', length: '30', height: '50 - 53' },
    { size: '10-11 Years', age_group: '10-11 Yrs', chest: '28 - 29', waist: '24 - 25', length: '33', height: '55 - 57' },
    { size: '12-13 Years', age_group: '12-13 Yrs', chest: '30 - 31', waist: '25 - 26', length: '36', height: '58 - 60' },
    { size: '14-15 Years', age_group: '14-15 Yrs', chest: '32 - 33', waist: '26 - 27', length: '39', height: '61 - 63' },
    { size: '15-16 Years', age_group: '15-16 Yrs', chest: '33 - 34', waist: '27 - 28', length: '41', height: '63 - 65' },
  ],
  guide_tips: [
    'Age Group: Age recommendations are approximate; please refer to chest and height measurements for best fit.',
    'Chest: Measure around the fullest part under armpits.',
    'Dress Length: Measure from shoulder top seam to dress bottom hem.',
    'If child is in between sizes, we recommend ordering one size up for growing room.',
  ],
};

// Helper: Convert Inches string range to CM (e.g. "32 - 34" -> "81 - 86")
export function convertRangeToCm(rangeStr?: string): string {
  if (!rangeStr) return '—';
  return rangeStr.replace(/(\d+(\.\d+)?)/g, (match) => {
    const val = parseFloat(match);
    return Math.round(val * 2.54).toString();
  });
}

// Find a specific variant by color and size
export function findVariant(
  product: Product,
  color?: string,
  size?: string
): ProductVariant | undefined {
  if (!product.variants || product.variants.length === 0) return undefined;

  // Exact match on both color and size
  if (color && size) {
    const exact = product.variants.find(
      (v) =>
        (v.color || '').toLowerCase() === color.toLowerCase() &&
        (v.size || '').toLowerCase() === size.toLowerCase()
    );
    if (exact) return exact;
  }

  // Match size only (if no color or generic)
  if (size && !color) {
    const sizeMatch = product.variants.find(
      (v) => (v.size || '').toLowerCase() === size.toLowerCase()
    );
    if (sizeMatch) return sizeMatch;
  }

  // Match color only (if no size or generic)
  if (color && !size) {
    const colorMatch = product.variants.find(
      (v) => (v.color || '').toLowerCase() === color.toLowerCase()
    );
    if (colorMatch) return colorMatch;
  }

  return undefined;
}

// Get stock for a specific size (optionally restricted to a selected color)
export function getSizeStock(product: Product, size: string, color?: string): number {
  if (!product.variants || product.variants.length === 0) {
    // Fallback to base product stock
    return product.stock_quantity;
  }

  if (color) {
    const variant = findVariant(product, color, size);
    if (variant) {
      return Number(variant.stock_quantity) || 0;
    }
  }

  // Sum of all variants with this size
  const matching = product.variants.filter(
    (v) => (v.size || '').toLowerCase() === size.toLowerCase()
  );

  if (matching.length > 0) {
    return matching.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0);
  }

  return product.stock_quantity;
}

// Check if a size is in stock
export function isSizeInStock(product: Product, size: string, color?: string): boolean {
  return getSizeStock(product, size, color) > 0;
}

// Get total stock for a specific color
export function getColorStock(product: Product, color: string): number {
  if (!product.variants || product.variants.length === 0) {
    return product.stock_quantity;
  }

  const matching = product.variants.filter(
    (v) => (v.color || '').toLowerCase() === color.toLowerCase()
  );

  if (matching.length > 0) {
    return matching.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0);
  }

  return product.stock_quantity;
}

// Get images associated with a color variant
export function getColorImages(product: Product, colorName?: string): string[] {
  if (!colorName) return product.images || [];

  // Check color_variants
  const cv = product.color_variants?.find(
    (c) => c.name.toLowerCase() === colorName.toLowerCase()
  );
  if (cv && cv.images && cv.images.length > 0) {
    return cv.images;
  }

  // Check variants for image list
  const varWithImg = product.variants?.find(
    (v) => (v.color || '').toLowerCase() === colorName.toLowerCase() && v.images && v.images.length > 0
  );
  if (varWithImg && varWithImg.images && varWithImg.images.length > 0) {
    return varWithImg.images;
  }

  return product.images || [];
}

// Generate cross-product variant combinations for Admin
export function generateVariantGrid(
  colors: { name: string; hex: string }[],
  sizes: string[],
  basePrice: number,
  baseMrp: number,
  baseStock = 10,
  skuPrefix = 'ZEV'
): ProductVariant[] {
  const result: ProductVariant[] = [];
  const cleanSku = (skuPrefix || 'ZEV').toUpperCase().replace(/[^A-Z0-9]/g, '');

  const effectiveColors = colors.length > 0 ? colors : [{ name: 'Standard', hex: '#0f172a' }];
  const effectiveSizes = sizes.length > 0 ? sizes : ['Standard'];

  for (const c of effectiveColors) {
    for (const s of effectiveSizes) {
      const colorCode = c.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
      const sizeCode = s.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
      const uniqueId = `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const sku = `${cleanSku}-${colorCode}-${sizeCode}`;

      result.push({
        id: uniqueId,
        sku: sku,
        color: c.name,
        color_hex: c.hex,
        size: s,
        price: basePrice,
        original_price: baseMrp,
        stock_quantity: baseStock,
        in_stock: baseStock > 0,
      });
    }
  }

  return result;
}

import { Product, Category } from '../types';

/**
 * Keywords and category identifiers for electrical and electronic items.
 */
const ELECTRICAL_KEYWORDS = [
  'electronic',
  'electronics',
  'electric',
  'electrical',
  'mobile',
  'mobiles',
  'tablet',
  'tablets',
  'smartphone',
  'smartphones',
  'laptop',
  'laptops',
  'computer',
  'computers',
  'audio',
  'headphone',
  'headphones',
  'earphone',
  'earphones',
  'earbud',
  'earbuds',
  'airpod',
  'speaker',
  'speakers',
  'smartwatch',
  'smart watch',
  'smartwatches',
  'wearable',
  'wearables',
  'gadget',
  'gadgets',
  'appliance',
  'appliances',
  'camera',
  'cameras',
  'television',
  'tv',
  'charger',
  'powerbank',
  'power bank',
  'monitor',
  'monitors',
  'tech',
];

/**
 * Keywords and category identifiers for non-electrical categories.
 */
const NON_ELECTRICAL_KEYWORDS = [
  'fashion',
  'clothing',
  'apparel',
  'kurti',
  'kurtis',
  'dress',
  'dresses',
  'saree',
  'sarees',
  'lehenga',
  'ethnic',
  'ethnic wear',
  'suit',
  'shirt',
  't-shirt',
  'jeans',
  'top',
  'tops',
  'bottoms',
  'trouser',
  'trousers',
  'footwear',
  'shoe',
  'shoes',
  'sandals',
  'sneaker',
  'sneakers',
  'heels',
  'slippers',
  'jewellery',
  'jewelry',
  'necklace',
  'earring',
  'earrings',
  'jhumka',
  'jhumkas',
  'bangle',
  'bangles',
  'bracelet',
  'bracelets',
  'ring',
  'rings',
  'beauty',
  'cosmetic',
  'cosmetics',
  'makeup',
  'skincare',
  'perfume',
  'fragrance',
  'home & living',
  'home living',
  'home-living',
  'home decor',
  'furniture',
  'kitchenware',
  'bedsheet',
  'curtain',
  'toy',
  'toys',
  'book',
  'books',
  'bag',
  'bags',
  'handbag',
  'handbags',
  'wallet',
  'wallets',
  'girls collection',
  'girls-collection',
  'girls-jewellery',
  "girls' jewellery",
  'shoes-footwear',
];

/**
 * Checks if a given string matches any keyword in a list.
 */
function matchesAny(text: string, keywords: string[]): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase().trim();
  return keywords.some((kw) => {
    // Check whole word or substring match
    return normalized.includes(kw);
  });
}

/**
 * Determines whether a product is electrical or electronic.
 *
 * Rules:
 * 1. Resolves all product categories (primary category_id, category_ids array, category_name, category_names).
 * 2. Matches category slugs and names against known electronic categories.
 * 3. Inspects product type / subcategory.
 * 4. Strictly checks against non-electrical categories (fashion, kurtis, dresses, footwear, jewellery, etc.).
 *    Even if a non-electrical product has a warranty field or spec, it returns false.
 */
export function isElectricalProduct(
  product: Product | null | undefined,
  categories: Category[] = []
): boolean {
  if (!product) return false;

  // 1. Gather all category identifiers and names associated with this product
  const categoryIds = new Set<string>();
  if (product.category_id) categoryIds.add(product.category_id);
  if (Array.isArray(product.category_ids)) {
    product.category_ids.forEach((id) => id && categoryIds.add(id));
  }

  const categoryTexts: string[] = [];
  if (product.category_name) categoryTexts.push(product.category_name);
  if (Array.isArray(product.category_names)) {
    product.category_names.forEach((name) => name && categoryTexts.push(name));
  }
  if (product.subcategory) {
    categoryTexts.push(product.subcategory);
  }

  // Look up full category records if available
  if (categories && categories.length > 0) {
    for (const cat of categories) {
      if (categoryIds.has(cat.id)) {
        if (cat.name) categoryTexts.push(cat.name);
        if (cat.slug) categoryTexts.push(cat.slug);
      }
    }
  }

  // Also include raw category_ids as text in case they are slugs (e.g. 'cat-mobiles', 'cat-fashion')
  categoryIds.forEach((id) => categoryTexts.push(id));

  // 2. Explicit check: If subcategory is an obvious apparel/footwear/jewellery, return false
  if (product.subcategory && matchesAny(product.subcategory, NON_ELECTRICAL_KEYWORDS)) {
    return false;
  }

  // 3. Check if ANY assigned category is electrical/electronic
  let hasElectricalCategory = false;
  let hasNonElectricalCategory = false;

  for (const text of categoryTexts) {
    if (matchesAny(text, ELECTRICAL_KEYWORDS)) {
      hasElectricalCategory = true;
    }
    if (matchesAny(text, NON_ELECTRICAL_KEYWORDS)) {
      hasNonElectricalCategory = true;
    }
  }

  // If it has an electrical category and no dominant non-electrical classification, it's electrical
  if (hasElectricalCategory && !hasNonElectricalCategory) {
    return true;
  }

  // If it has BOTH (e.g. multi-category with a general promo category or mixed),
  // verify subcategory and name to avoid classifying a dress as electrical:
  if (hasElectricalCategory) {
    // If the product name or subcategory clearly indicates non-electrical fashion, reject
    const nameCheck = product.name?.toLowerCase() || '';
    if (matchesAny(nameCheck, ['dress', 'kurti', 'saree', 'lehenga', 'jhumka', 'necklace', 'shoe', 'sandal', 'heel', 'bangle'])) {
      return false;
    }
    return true;
  }

  // 4. Fallback if category mapping was unknown or missing:
  // Inspect product name and subcategory for electrical signatures vs fashion signatures
  const productName = product.name?.toLowerCase() || '';
  if (matchesAny(productName, NON_ELECTRICAL_KEYWORDS)) {
    return false;
  }

  if (matchesAny(productName, ELECTRICAL_KEYWORDS)) {
    return true;
  }

  return false;
}

/**
 * Returns warranty information for a product if eligible.
 * Returns null if the product is non-electrical.
 * Keeps existing warranty text if present in product specs, otherwise defaults to '1 Year Warranty'.
 */
export function getProductWarrantyInfo(
  product: Product | null | undefined,
  categories: Category[] = []
): {
  isEligible: boolean;
  warrantyTitle: string;
  warrantySubtitle: string;
} | null {
  if (!product) return null;

  const eligible = isElectricalProduct(product, categories);
  if (!eligible) {
    return null;
  }

  // Check if an existing warranty period is defined in product specs or attributes
  let existingWarranty: string | null = null;

  if (Array.isArray(product.specs)) {
    const spec = product.specs.find((s) => /warranty|guarantee/i.test(s.label));
    if (spec && spec.value && spec.value.trim() && spec.value.trim() !== '—') {
      existingWarranty = spec.value.trim();
    }
  }

  if (!existingWarranty && (product as any).warranty) {
    existingWarranty = String((product as any).warranty).trim();
  }

  let warrantyTitle = '1 Year Warranty';
  if (existingWarranty) {
    // If the spec already says "1 Year Warranty" or "2 Years Brand Warranty", preserve as-is
    if (/warranty/i.test(existingWarranty)) {
      warrantyTitle = existingWarranty;
    } else {
      warrantyTitle = `${existingWarranty} Warranty`;
    }
  }

  return {
    isEligible: true,
    warrantyTitle,
    warrantySubtitle: '100% Genuine',
  };
}

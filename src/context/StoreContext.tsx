import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product,
  Category,
  CartItem,
  WishlistItem,
  Order,
  UserProfile,
  Address,
  PageView,
  OrderStatus,
  ProductReview,
  Offer,
  StoreSettings,
  Coupon,
  ProductVariant,
  ColorVariant,
  SizeChart,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ADDRESS,
  INITIAL_OFFERS,
  DEFAULT_STORE_SETTINGS,
  INITIAL_COUPONS,
} from '../data/initialData';
import { generateUniqueReviewsForProduct } from '../data/productReviewsDatabase';
import {
  getSupabase,
  isSupabaseConfigured,
  getStoredSupabaseCredentials,
  saveSupabaseCredentials,
  subscribeEmailToSupabase,
  fetchProductReviewsFromSupabase,
  submitProductReviewToSupabase,
  requestPasswordResetFromSupabase,
} from '../lib/supabase';
import { calculateDiscountedProduct, isOfferCurrentlyActive } from '../utils/pricing';
import { isCouponCurrentlyActive, validateCouponForCart } from '../utils/coupons';
import { resolveImageUrl } from '../utils/imageUrl';
import { PRESET_COLORS } from '../utils/variants';

interface StoreContextType {
  // Navigation
  currentPage: PageView;
  navigateTo: (page: PageView, options?: { productId?: string; categoryId?: string; searchQuery?: string }) => void;
  selectedProductId: string | null;
  selectedCategoryId: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Catalog
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  refreshCatalog: () => Promise<void>;

  // Cart
  cart: CartItem[];
  cartCount: number;
  addToCart: (product: Product, quantity?: number, color?: string, size?: string, variant?: ProductVariant | null) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;

  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Comparison
  comparisonList: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  toggleComparison: (product: Product) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;

  // Orders
  orders: Order[];
  placeOrder: (options: {
    address: Address;
    deliveryOption: string;
    deliveryFee: number;
    paymentMethod: string;
    orderId?: string;
    orderNumber?: string;
    status?: OrderStatus;
    customTotal?: number;
    customDiscount?: number;
    advancePaidAmount?: number;
    remainingCodAmount?: number;
    advancePaymentStatus?: string;
    paymentReference?: string;
    clearCartAfter?: boolean;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;

  // User & Auth
  user: UserProfile | null;
  addresses: Address[];
  selectedAddress: Address;
  setSelectedAddress: (addr: Address) => void;
  addAddress: (addr: Omit<Address, 'id'>) => void;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Admin
  isAdmin: boolean;
  adminEmail: string | null;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<boolean>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Offers & Dynamic Banners
  offers: Offer[];
  activeOffers: Offer[];
  addOffer: (offer: Omit<Offer, 'id'>) => Promise<boolean>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<boolean>;
  deleteOffer: (id: string) => Promise<boolean>;
  toggleOfferActive: (id: string, isActive: boolean) => Promise<boolean>;
  refreshOffers: () => Promise<void>;

  // Customers (from Supabase profiles)
  customers: UserProfile[];
  refreshCustomers: () => Promise<void>;

  // Supabase Configuration
  isSupabaseConnected: boolean;
  connectSupabase: (url: string, key: string) => Promise<{ success: boolean; message: string }>;

  // Newsletter
  subscribeNewsletter: (email: string) => Promise<{ success: boolean; message: string }>;

  // Product Reviews
  getProductReviews: (productId: string) => ProductReview[];
  submitProductReview: (
    productId: string,
    rating: number,
    title: string,
    comment: string,
    userName?: string
  ) => Promise<{ success: boolean; message: string }>;
  markReviewHelpful: (reviewId: string, productId: string) => void;

  // Website Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<boolean>;

  // Coupons
  coupons: Coupon[];
  activeCoupons: Coupon[];
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Omit<Coupon, 'id'>) => Promise<boolean>;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => Promise<boolean>;
  deleteCoupon: (id: string) => Promise<boolean>;
  toggleCouponActive: (id: string, isActive: boolean) => Promise<boolean>;

  // Toasts
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Theme & Dark Mode
  themeMode: 'light' | 'dark' | 'system';
  isDarkMode: boolean;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  toggleDarkMode: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_PRODUCTS = 'online_store_products_v1';
const LOCAL_STORAGE_CATEGORIES = 'online_store_categories_v1';
const LOCAL_STORAGE_CART = 'online_store_cart_v1';
const LOCAL_STORAGE_WISHLIST = 'online_store_wishlist_v1';
const LOCAL_STORAGE_ORDERS = 'online_store_orders_v1';
const LOCAL_STORAGE_ADMIN = 'online_store_admin_creds_v1';
const LOCAL_STORAGE_USER = 'online_store_user_v1';
const LOCAL_STORAGE_ADDRESSES = 'online_store_addresses_v1';
const LOCAL_STORAGE_REVIEWS = 'online_store_reviews_v1';
const LOCAL_STORAGE_OFFERS = 'online_store_offers_v1';
const LOCAL_STORAGE_STORE_SETTINGS = 'online_store_settings_v1';
const LOCAL_STORAGE_COUPONS = 'online_store_coupons_v1';
const LOCAL_STORAGE_APPLIED_COUPON = 'online_store_applied_coupon_v1';

// Strictly deleted categories from store catalog
const DELETED_CATEGORY_IDS = new Set([
  'cat-home',
  'cat-beauty',
  'cat-toys',
  'cat-books',
  'cat-sports',
  'c382d277-a0e1-4544-96d4-7e0d24af953b',
  '32b45cf6-7834-487c-8f00-14b5aafb7325',
  'd0e0e416-e7d5-479f-a0b6-6c40d0e9aa0b',
  '70b67742-1959-4303-a108-490514df9228',
  'b68942ba-e1c6-4184-9047-c97198ff0b55',
  '64d0605e-ef7d-4c8c-9b66-2390fb723978',
]);

const DELETED_CATEGORY_NAMES = new Set([
  'home & living',
  'beauty & personal care',
  'toys & games',
  'books & stationery',
  'sports & fitness',
  'sports',
]);

const DELETED_CATEGORY_SLUGS = new Set([
  'home-living',
  'beauty',
  'beauty-personal-care',
  'toys-games',
  'books-stationery',
  'sports-fitness',
  'sports',
]);

export function isDeletedCategory(cat: { id?: string; name?: string; slug?: string }): boolean {
  if (cat.id && DELETED_CATEGORY_IDS.has(cat.id)) return true;
  if (cat.slug && DELETED_CATEGORY_SLUGS.has(cat.slug.toLowerCase().trim())) return true;
  if (cat.name && DELETED_CATEGORY_NAMES.has(cat.name.toLowerCase().trim())) return true;
  return false;
}

export function isDeletedProduct(p: { category_id?: string; category_name?: string; is_featured?: boolean }): boolean {
  // Never filter out products that are marked as Favourite / Featured
  if (Boolean(p.is_featured)) return false;
  if (p.category_id && DELETED_CATEGORY_IDS.has(p.category_id)) return true;
  if (p.category_name && DELETED_CATEGORY_NAMES.has(p.category_name.toLowerCase().trim())) return true;
  return false;
}

export function sanitizeCategories(rawList: Category[]): Category[] {
  const seenNames = new Set<string>();
  const seenSlugs = new Set<string>();
  const result: Category[] = [];

  for (const cat of rawList) {
    if (isDeletedCategory(cat)) continue;
    const normName = (cat.name || '').trim().toLowerCase();
    const normSlug = (cat.slug || '').trim().toLowerCase();
    if (seenNames.has(normName) || (normSlug && seenSlugs.has(normSlug))) continue;
    if (normName) seenNames.add(normName);
    if (normSlug) seenSlugs.add(normSlug);
    result.push(cat);
  }
  return result;
}

export function sanitizeProducts(rawList: Product[]): Product[] {
  return rawList.filter((p) => !isDeletedProduct(p));
}

const DEFAULT_REVIEWS: Record<string, ProductReview[]> = {
  'prod-iphone15': [
    {
      id: 'rev-iphone-1',
      product_id: 'prod-iphone15',
      user_name: 'Rahul Sharma',
      rating: 5,
      title: 'Flawless performance and camera upgrade!',
      comment: 'Dynamic Island is super useful for Live Activities and delivery tracking. The 48MP main camera with 2x Telephoto takes portraits with stunning natural depth.',
      verified_purchase: true,
      created_at: '2026-03-24T14:20:00Z',
      helpful_count: 24,
    },
    {
      id: 'rev-iphone-2',
      product_id: 'prod-iphone15',
      user_name: 'Priya Patel',
      rating: 5,
      title: 'Beautiful color and lightweight aluminum frame',
      comment: 'The frosted color-infused back glass feels premium and does not catch fingerprints. USB-C charging makes traveling so much simpler.',
      verified_purchase: true,
      created_at: '2026-03-18T10:15:00Z',
      helpful_count: 16,
    },
    {
      id: 'rev-iphone-3',
      product_id: 'prod-iphone15',
      user_name: 'Amit Verma',
      rating: 4,
      title: 'Great battery life and OLED brightness',
      comment: 'Peak 2000 nits display brightness outdoors is incredible. A16 Bionic handles multi-tasking without getting warm.',
      verified_purchase: true,
      created_at: '2026-03-10T18:45:00Z',
      helpful_count: 9,
    },
  ],
  'prod-s24': [
    {
      id: 'rev-s24-1',
      product_id: 'prod-s24',
      user_name: 'Vikram Singh',
      rating: 5,
      title: 'Galaxy AI is genuinely game-changing',
      comment: 'Circle to Search and real-time live call translate work exceptionally well. Compact form factor with flat edges is very comfortable.',
      verified_purchase: true,
      created_at: '2026-03-22T09:30:00Z',
      helpful_count: 19,
    },
    {
      id: 'rev-s24-2',
      product_id: 'prod-s24',
      user_name: 'Neha Gupta',
      rating: 4,
      title: 'Stunning Dynamic AMOLED display',
      comment: 'Battery easily lasts 1.5 days on normal usage. The 50MP ProVisual Engine takes crisp photos in low light.',
      verified_purchase: true,
      created_at: '2026-03-15T16:00:00Z',
      helpful_count: 11,
    },
  ],
  'prod-headphones': [
    {
      id: 'rev-head-1',
      product_id: 'prod-headphones',
      user_name: 'Arjun Mehta',
      rating: 5,
      title: 'Industry-leading Active Noise Cancellation',
      comment: 'Silences airplane engine rumble and noisy coffee shops completely. Extremely plush and lightweight headband.',
      verified_purchase: true,
      created_at: '2026-03-25T11:00:00Z',
      helpful_count: 32,
    },
  ],
};

const getInitialPageInfo = (): {
  page: PageView;
  productId?: string;
  categoryId?: string;
  searchQuery?: string;
} => {
  if (typeof window !== 'undefined') {
    const search = window.location.search.toLowerCase();
    const pathname = window.location.pathname;
    const hash = window.location.hash.toLowerCase();

    if (search.includes('cf_order_id')) {
      return { page: 'checkout' };
    }
    if (
      search.includes('view=admin') ||
      search.includes('page=admin') ||
      search.includes('admin=true') ||
      search.includes('admin=1') ||
      pathname === '/admin' ||
      pathname.startsWith('/admin') ||
      hash === '#admin' ||
      hash.startsWith('#admin')
    ) {
      return { page: 'admin' };
    }

    // Check /product/{product-id} or /product-detail/{product-id}
    const productMatch = pathname.match(/^\/(?:product|product-detail)\/([a-zA-Z0-9_-]+)/i);
    if (productMatch && productMatch[1]) {
      return { page: 'product_detail', productId: productMatch[1] };
    }

    // Also support query param: ?product={id} or ?productId={id}
    const urlParams = new URLSearchParams(window.location.search);
    const queryProdId = urlParams.get('product') || urlParams.get('productId') || urlParams.get('id');
    if (queryProdId) {
      return { page: 'product_detail', productId: queryProdId };
    }

    // Check /category/{category-id}
    const categoryMatch = pathname.match(/^\/category\/([a-zA-Z0-9_-]+)/i);
    if (categoryMatch && categoryMatch[1]) {
      return { page: 'category_products', categoryId: categoryMatch[1] };
    }

    if (pathname === '/categories' || pathname.startsWith('/categories')) return { page: 'categories' };
    if (pathname === '/cart' || pathname.startsWith('/cart')) return { page: 'cart' };
    if (pathname === '/checkout' || pathname.startsWith('/checkout')) return { page: 'checkout' };
    if (pathname === '/wishlist' || pathname.startsWith('/wishlist')) return { page: 'wishlist' };
    if (pathname === '/orders' || pathname.startsWith('/orders')) return { page: 'orders' };
    if (pathname === '/search' || pathname.startsWith('/search')) {
      const q = urlParams.get('q') || '';
      return { page: 'search', searchQuery: q };
    }
    if (pathname === '/login' || pathname.startsWith('/login')) return { page: 'login' };
    if (pathname === '/profile' || pathname.startsWith('/profile')) return { page: 'profile' };
    if (pathname === '/help' || pathname.startsWith('/help')) return { page: 'help' };
    if (pathname === '/settings' || pathname.startsWith('/settings')) return { page: 'settings' };
    if (pathname === '/terms' || pathname.startsWith('/terms')) return { page: 'terms' };
    if (pathname === '/privacy' || pathname.startsWith('/privacy')) return { page: 'privacy' };
  }
  return { page: 'home' };
};

const getInitialPage = (): PageView => getInitialPageInfo().page;

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme & Dark Mode State
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('zevora_theme_mode') || localStorage.getItem('zevora_theme');
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved as 'light' | 'dark' | 'system';
      }
    } catch {}
    return 'light';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemPrefersDark;
  }, [themeMode, systemPrefersDark]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('zevora_theme_mode', themeMode);
      localStorage.setItem('zevora_theme', themeMode);
    } catch {}
  }, [isDarkMode, themeMode]);

  const setThemeMode = (mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
  };

  const toggleDarkMode = () => {
    setThemeModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Navigation State
  const initialNavInfo = useMemo(() => getInitialPageInfo(), []);
  const [currentPage, setCurrentPage] = useState<PageView>(initialNavInfo.page);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialNavInfo.productId || null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialNavInfo.categoryId || 'cat-mobiles');
  const [searchQuery, setSearchQuery] = useState<string>(initialNavInfo.searchQuery || '');

  // Base Catalog State (Original database prices preserved untouched)
  const [baseProducts, setBaseProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeProducts(parsed);
          return sanitized.map((p: Product) => {
            if (p.category_id === 'cat-footwear' || p.category_name === 'Shoes & Footwear') {
              const positiveStock = Number(p.stock_quantity) > 0 ? Number(p.stock_quantity) : 25;
              const updatedSpecs = Array.isArray(p.specs)
                ? p.specs.map((s) => (s.label === 'Stock Status' ? { ...s, value: 'In Stock' } : s))
                : p.specs;
              const updatedVariants = Array.isArray(p.variants)
                ? p.variants.map((v) => ({
                    ...v,
                    stock_quantity: Number(v.stock_quantity) > 0 ? Number(v.stock_quantity) : 25,
                    in_stock: true,
                  }))
                : p.variants;
              return {
                ...p,
                in_stock: true,
                stock_quantity: positiveStock,
                specs: updatedSpecs,
                variants: updatedVariants,
              };
            }
            return p;
          });
        }
      }
      return sanitizeProducts(INITIAL_PRODUCTS);
    } catch {
      return sanitizeProducts(INITIAL_PRODUCTS);
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeCategories(parsed);
        }
      }
      return sanitizeCategories(INITIAL_CATEGORIES);
    } catch {
      return sanitizeCategories(INITIAL_CATEGORIES);
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured());
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(isSupabaseConfigured());

  // Registered Customers state (fetched from Supabase profiles table)
  const [customers, setCustomers] = useState<UserProfile[]>([]);

  // User state
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (isSupabaseConfigured()) {
      return null;
    }
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default logged in user Rahul Sharma matching reference image only in demo/offline mode
    return {
      id: 'usr-rahul-01',
      email: 'rahul@example.com',
      full_name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      role: 'customer',
      avatar_url: '',
    };
  });

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ADDRESSES);
      return saved ? JSON.parse(saved) : [INITIAL_ADDRESS];
    } catch {
      return [INITIAL_ADDRESS];
    }
  });
  const [selectedAddress, setSelectedAddress] = useState<Address>(addresses[0] || INITIAL_ADDRESS);

  // Cart state (initialized with 3 items matching reference screen 1 & 6)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART);
      if (saved) return JSON.parse(saved);
    } catch {}

    const iphone = INITIAL_PRODUCTS.find((p) => p.id === 'prod-iphone15') || INITIAL_PRODUCTS[0];
    const s24 = INITIAL_PRODUCTS.find((p) => p.id === 'prod-s24') || INITIAL_PRODUCTS[1];
    const redmi = INITIAL_PRODUCTS.find((p) => p.id === 'prod-redmi13') || INITIAL_PRODUCTS[3];

    return [
      { id: 'cart-1', product_id: iphone.id, product: iphone, quantity: 1, selected_color: 'Black' },
      { id: 'cart-2', product_id: s24.id, product: s24, quantity: 1, selected_color: 'Gray' },
      { id: 'cart-3', product_id: redmi.id, product: redmi, quantity: 1, selected_color: 'Blue' },
    ];
  });

  // Wishlist state (initialized with saved items matching reference screen 8)
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WISHLIST);
      if (saved) return JSON.parse(saved);
    } catch {}

    const s24 = INITIAL_PRODUCTS.find((p) => p.id === 'prod-s24') || INITIAL_PRODUCTS[1];
    const shoes = INITIAL_PRODUCTS.find((p) => p.id === 'prod-nike-shoes') || INITIAL_PRODUCTS[4];
    const watch = INITIAL_PRODUCTS.find((p) => p.id === 'prod-smartwatch') || INITIAL_PRODUCTS[5];
    const backpack = INITIAL_PRODUCTS.find((p) => p.id === 'prod-backpack') || INITIAL_PRODUCTS[6];

    return [
      { id: 'wish-1', product_id: s24.id, product: s24 },
      { id: 'wish-2', product_id: shoes.id, product: shoes },
      { id: 'wish-3', product_id: watch.id, product: watch },
      { id: 'wish-4', product_id: backpack.id, product: backpack },
    ];
  });

  // Comparison state (up to 3 products)
  const [comparisonList, setComparisonList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('the_online_store_comparison');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('the_online_store_comparison', JSON.stringify(comparisonList));
    } catch {}
  }, [comparisonList]);

  // Dynamic Offers / Banners state
  const [offers, setOffers] = useState<Offer[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_OFFERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_OFFERS;
  });

  // Website Settings state
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_STORE_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.store_name) {
          const merged = { ...DEFAULT_STORE_SETTINGS, ...parsed };
          if (!merged.logo_url || merged.logo_url.includes('zevora-logo')) {
            merged.logo_url = DEFAULT_STORE_SETTINGS.logo_url;
          }
          if (!merged.favicon_url || merged.favicon_url.includes('zevora-logo')) {
            merged.favicon_url = DEFAULT_STORE_SETTINGS.favicon_url;
          }
          return merged;
        }
      }
    } catch {}
    return DEFAULT_STORE_SETTINGS;
  });

  // Dynamically synchronize Browser Tab Title and Favicon with Website Settings
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const titleName = storeSettings.store_name || 'Zevora';
      const tagline = storeSettings.tagline ? ` - ${storeSettings.tagline}` : '';
      document.title = `${titleName}${tagline}`;

      const rawFavicon = storeSettings.favicon_url || '/zevora-header-logo.png';
      const faviconUrl =
        rawFavicon.startsWith('http://') ||
        rawFavicon.startsWith('https://') ||
        rawFavicon.startsWith('/') ||
        rawFavicon.startsWith('data:')
          ? rawFavicon
          : resolveImageUrl(rawFavicon);

      if (faviconUrl) {
        // 1. Standard <link rel="icon">
        let iconLink = document.querySelector<HTMLLinkElement>("link[rel='icon']:not([sizes])") ||
                       document.querySelector<HTMLLinkElement>("link[rel='icon']");
        if (!iconLink) {
          iconLink = document.createElement('link');
          iconLink.rel = 'icon';
          document.head.appendChild(iconLink);
        }
        iconLink.href = faviconUrl;
        if (faviconUrl.endsWith('.png')) {
          iconLink.type = 'image/png';
        } else if (faviconUrl.endsWith('.svg')) {
          iconLink.type = 'image/svg+xml';
        } else if (faviconUrl.endsWith('.ico')) {
          iconLink.type = 'image/x-icon';
        }

        // 2. Shortcut icon
        let shortcutLink = document.querySelector<HTMLLinkElement>("link[rel='shortcut icon']");
        if (!shortcutLink) {
          shortcutLink = document.createElement('link');
          shortcutLink.rel = 'shortcut icon';
          document.head.appendChild(shortcutLink);
        }
        shortcutLink.href = faviconUrl;

        // 3. Apple touch icon
        let appleLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.head.appendChild(appleLink);
        }
        appleLink.href = faviconUrl;

        // 4. Update any existing sized icon links so browsers don't favor older icons
        const sizedIcons = document.querySelectorAll<HTMLLinkElement>("link[rel='icon'][sizes]");
        sizedIcons.forEach((el) => {
          el.href = faviconUrl;
        });
      }
    }
  }, [storeSettings.store_name, storeSettings.tagline, storeSettings.favicon_url]);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_COUPONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_COUPONS;
  });

  // Applied Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = sessionStorage.getItem(LOCAL_STORAGE_APPLIED_COUPON);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.code) return parsed;
      }
    } catch {}
    return null;
  });

  // Periodic clock to auto-refresh active offers and coupons the exact second they expire or activate
  const [offerClock, setOfferClock] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setOfferClock(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Derived Active Offers: is_active = true and current time within [start_at, end_at], sorted by display_order
  const activeOffers = useMemo(() => {
    const now = new Date(offerClock);
    return offers
      .filter((offer) => isOfferCurrentlyActive(offer, now))
      .sort((a, b) => (a.display_order ?? 1) - (b.display_order ?? 1));
  }, [offers, offerClock]);

  // Derived Active Coupons
  const activeCoupons = useMemo(() => {
    const now = new Date(offerClock);
    return coupons.filter((c) => isCouponCurrentlyActive(c, now));
  }, [coupons, offerClock]);

  // Derived Products with End-to-End Dynamic Category Offer Discounts applied
  // Original product base prices in database remain 100% intact and untouched
  const products = useMemo(() => {
    return baseProducts.map((p) => calculateDiscountedProduct(p, activeOffers));
  }, [baseProducts, activeOffers]);

  // Orders state (initialized matching reference screen 9 only in demo mode)
  const [orders, setOrders] = useState<Order[]>(() => {
    if (isSupabaseConfigured()) {
      return [];
    }
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {}

    const iphone = INITIAL_PRODUCTS[0];
    const s24 = INITIAL_PRODUCTS[1];
    const headphones = INITIAL_PRODUCTS[2];
    const shoes = INITIAL_PRODUCTS[4];
    const watch = INITIAL_PRODUCTS[5];

    return [
      {
        id: 'ord-101',
        order_number: 'ORD123456',
        user_id: 'usr-rahul-01',
        user_email: 'rahul@example.com',
        user_name: 'Rahul Sharma',
        items: [
          {
            id: 'item-1',
            product_id: iphone.id,
            product_name: iphone.name,
            product_image: iphone.images[0],
            price: iphone.price,
            quantity: 1,
            color: 'Black',
          },
        ],
        subtotal: 79900,
        discount_amount: 10000,
        delivery_fee: 0,
        total_amount: 79900,
        status: 'delivered',
        shipping_address: INITIAL_ADDRESS,
        delivery_option: 'Standard Delivery',
        payment_method: 'UPI',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ord-102',
        order_number: 'ORD123455',
        user_id: 'usr-rahul-01',
        user_email: 'rahul@example.com',
        user_name: 'Rahul Sharma',
        items: [
          {
            id: 'item-2',
            product_id: s24.id,
            product_name: s24.name,
            product_image: s24.images[0],
            price: s24.price,
            quantity: 1,
            color: 'Gray',
          },
        ],
        subtotal: 74999,
        discount_amount: 8000,
        delivery_fee: 0,
        total_amount: 74999,
        status: 'processing',
        shipping_address: INITIAL_ADDRESS,
        delivery_option: 'Express Delivery',
        payment_method: 'Credit Card',
        created_at: '2025-04-14T14:15:00Z',
      },
      {
        id: 'ord-103',
        order_number: 'ORD123454',
        user_id: 'usr-rahul-01',
        user_email: 'rahul@example.com',
        user_name: 'Rahul Sharma',
        items: [
          {
            id: 'item-3',
            product_id: shoes.id,
            product_name: shoes.name,
            product_image: shoes.images[0],
            price: shoes.price,
            quantity: 1,
            size: 'UK 9',
          },
        ],
        subtotal: 4999,
        discount_amount: 4000,
        delivery_fee: 0,
        total_amount: 4999,
        status: 'delivered',
        shipping_address: INITIAL_ADDRESS,
        delivery_option: 'Standard Delivery',
        payment_method: 'Cash on Delivery',
        created_at: '2025-04-05T09:00:00Z',
      },
      {
        id: 'ord-104',
        order_number: 'ORD123453',
        user_id: 'usr-rahul-01',
        user_email: 'rahul@example.com',
        user_name: 'Rahul Sharma',
        items: [
          {
            id: 'item-4',
            product_id: watch.id,
            product_name: watch.name,
            product_image: watch.images[0],
            price: watch.price,
            quantity: 1,
            color: 'Matte Black',
          },
        ],
        subtotal: 9999,
        discount_amount: 5000,
        delivery_fee: 0,
        total_amount: 9999,
        status: 'cancelled',
        shipping_address: INITIAL_ADDRESS,
        delivery_option: 'Standard Delivery',
        payment_method: 'UPI',
        created_at: '2025-04-02T16:20:00Z',
      },
      {
        id: 'ord-105',
        order_number: 'ORD123450',
        user_id: 'usr-rahul-01',
        user_email: 'rahul@example.com',
        user_name: 'Rahul Sharma',
        items: [
          {
            id: 'item-5',
            product_id: headphones.id,
            product_name: headphones.name,
            product_image: headphones.images[0],
            price: headphones.price,
            quantity: 1,
            color: 'Silver',
          },
        ],
        subtotal: 24990,
        discount_amount: 5000,
        delivery_fee: 0,
        total_amount: 24990,
        status: 'returned',
        shipping_address: INITIAL_ADDRESS,
        delivery_option: 'Express Delivery',
        payment_method: 'UPI',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  });

  // Admin state (persists across page refreshes)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('online_store_is_admin_v1') === 'true' ||
        localStorage.getItem('online_store_is_admin_v1') === 'true'
      );
    } catch {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    try {
      return (
        sessionStorage.getItem('online_store_admin_email_v1') ||
        localStorage.getItem('online_store_admin_email_v1')
      );
    } catch {
      return null;
    }
  });
  const [adminConfig, setAdminConfig] = useState<{ email: string; passwordHash: string } | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ADMIN);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Sync route / path from URL on first mount & popstate
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setCurrentPage('admin');
      }
    };
    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Save states to localStorage (only in demo mode, never overwrite/cache production data when Supabase is configured)
  useEffect(() => {
    if (isSupabaseConfigured()) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    if (isSupabaseConfigured()) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WISHLIST, JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    if (isSupabaseConfigured()) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  // Product Reviews state
  const [reviews, setReviews] = useState<Record<string, ProductReview[]>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_REVIEWS);
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  });

  useEffect(() => {
    if (isSupabaseConfigured()) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_REVIEWS, JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER);
      }
    } catch {}
  }, [user]);

  // One-time cleanup of any legacy cached deleted categories or products from localStorage
  useEffect(() => {
    try {
      const savedCats = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed)) {
          localStorage.setItem(LOCAL_STORAGE_CATEGORIES, JSON.stringify(sanitizeCategories(parsed)));
        }
      }
      const savedProds = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
      if (savedProds) {
        const parsed = JSON.parse(savedProds);
        if (Array.isArray(parsed)) {
          localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(sanitizeProducts(parsed)));
        }
      }
    } catch {}
  }, []);

  // Load real data from existing Supabase database
  const refreshCatalog = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    setIsLoading(true);
    try {
      // 1. Fetch categories directly from Supabase categories table
      const { data: catData, error: catError } = await supabase.from('categories').select('*').order('created_at');
      let catMap = new Map<string, string>();
      if (!catError && catData && catData.length > 0) {
        catMap = new Map(catData.map((c: any) => [c.id, c.name]));
        const formattedCats: Category[] = catData.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
          description: c.description || '',
          icon_name: c.icon_name || c.icon || 'ShoppingBag',
          color_bg: c.color_bg || c.color || 'bg-blue-500',
          color_text: c.color_text || 'text-blue-500',
          product_count: Number(c.product_count) || 0,
          image_url: c.image_url || '',
        }));
        setCategories(sanitizeCategories(formattedCats));
      } else {
        setCategories((prev) => sanitizeCategories(prev.length > 0 ? prev : INITIAL_CATEGORIES));
      }

      // 2. Fetch products directly from Supabase products table (with API fallback)
      let prodData: any[] | null = null;
      let prodError: any = null;
      try {
        const res = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        prodData = res.data;
        prodError = res.error;
      } catch (e) {
        prodError = e;
      }

      // Fallback to server endpoint /api/products if direct client query had error or returned empty
      if (prodError || !prodData || prodData.length === 0) {
        try {
          const apiRes = await fetch('/api/products');
          if (apiRes.ok) {
            const apiJson = await apiRes.json();
            if (apiJson.success && Array.isArray(apiJson.products) && apiJson.products.length > 0) {
              prodData = apiJson.products;
              prodError = null;
            }
          }
        } catch {}
      }

      if (!prodError && prodData && prodData.length > 0) {
        const formattedProds: Product[] = prodData.map((p: any) => {
          let formattedSpecs: { label: string; value: string }[] = [];
          const rawSpecs = p.specs;

          if (Array.isArray(rawSpecs)) {
            formattedSpecs = rawSpecs;
          } else if (rawSpecs && typeof rawSpecs === 'object') {
            if (Array.isArray(rawSpecs.items)) {
              formattedSpecs = rawSpecs.items;
            } else {
              formattedSpecs = Object.entries(rawSpecs)
                .filter(([k]) => !['variants', 'colors', 'sizes', 'size_chart', 'brand', 'sku', 'subcategory', 'color_variants', 'featured_at'].includes(k))
                .map(([label, value]) => ({
                  label,
                  value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                }));
            }
          }

          // Extract featured_at timestamp if present
          let featuredAt: string | undefined = undefined;
          if (rawSpecs && typeof rawSpecs === 'object' && !Array.isArray(rawSpecs) && rawSpecs.featured_at) {
            featuredAt = String(rawSpecs.featured_at);
          } else if (Array.isArray(rawSpecs)) {
            const match = rawSpecs.find((s: any) => s && s.label === 'featured_at');
            if (match) featuredAt = String(match.value);
          }
          if (!featuredAt && Boolean(p.is_featured)) {
            featuredAt = p.created_at;
          }

          const price = Number(p.price) || 0;
          const originalPrice = Number(p.original_price ?? p.mrp ?? p.price) || price;
          const resolvedCategoryName = p.category_name || catMap.get(p.category_id) || 'General';
          const isFootwearCategory =
            resolvedCategoryName === 'Shoes & Footwear' || p.category_id === 'cat-footwear';
          const rawStockQty = Number(p.stock_quantity ?? p.stock ?? 0);
          const stockQty = isFootwearCategory ? (rawStockQty > 0 ? rawStockQty : 25) : rawStockQty;
          const inStock = isFootwearCategory
            ? true
            : p.in_stock !== undefined
              ? Boolean(p.in_stock)
              : stockQty > 0;

          if (isFootwearCategory && Array.isArray(formattedSpecs)) {
            formattedSpecs = formattedSpecs.map((s) =>
              s.label === 'Stock Status' ? { ...s, value: 'In Stock' } : s
            );
          }

          // Parse variants from p.variants or p.specs?.variants
          let parsedVariants: ProductVariant[] = [];
          if (Array.isArray(p.variants)) {
            parsedVariants = p.variants;
          } else if (rawSpecs && typeof rawSpecs === 'object' && Array.isArray(rawSpecs.variants)) {
            parsedVariants = rawSpecs.variants;
          } else if (typeof p.variants === 'string') {
            try { parsedVariants = JSON.parse(p.variants); } catch {}
          }

          if (isFootwearCategory && parsedVariants.length > 0) {
            parsedVariants = parsedVariants.map((v) => ({
              ...v,
              stock_quantity: Number(v.stock_quantity) > 0 ? Number(v.stock_quantity) : 25,
              in_stock: true,
            }));
          }

          // Parse colors
          let rawColors = Array.isArray(p.colors)
            ? p.colors
            : (rawSpecs && typeof rawSpecs === 'object' && Array.isArray(rawSpecs.colors)
              ? rawSpecs.colors
              : (typeof p.colors === 'string' ? JSON.parse(p.colors || '[]') : []));

          if (rawColors.length === 0 && parsedVariants.length > 0) {
            const uniqueColors = Array.from(new Set(parsedVariants.map((v) => v.color).filter(Boolean)));
            rawColors = uniqueColors.map((cName) => {
              const match = parsedVariants.find((v) => v.color === cName);
              return { name: cName as string, hex: match?.color_hex || '#0f172a' };
            });
          }

          const parsedColors: ColorVariant[] = rawColors.map((c: any) => {
            if (typeof c === 'string') {
              const preset = PRESET_COLORS.find((pr) => pr.name.toLowerCase() === c.toLowerCase());
              return { name: c, hex: preset?.hex || '#2563eb' };
            }
            if (c && typeof c === 'object') {
              const name = c.name || c.color || 'Color';
              const preset = PRESET_COLORS.find((pr) => pr.name.toLowerCase() === name.toLowerCase());
              return { name, hex: c.hex || preset?.hex || '#2563eb' };
            }
            return { name: String(c), hex: '#2563eb' };
          });

          // Parse sizes
          let parsedSizes = Array.isArray(p.sizes)
            ? p.sizes
            : (rawSpecs && typeof rawSpecs === 'object' && Array.isArray(rawSpecs.sizes)
              ? rawSpecs.sizes
              : (typeof p.sizes === 'string' ? JSON.parse(p.sizes || '[]') : []));

          if (parsedSizes.length === 0 && parsedVariants.length > 0) {
            parsedSizes = Array.from(new Set(parsedVariants.map((v) => v.size).filter(Boolean))) as string[];
          }

          const parsedSizeChart = p.size_chart || (rawSpecs && typeof rawSpecs === 'object' ? rawSpecs.size_chart : undefined);
          const parsedColorVariants = p.color_variants || (rawSpecs && typeof rawSpecs === 'object' ? rawSpecs.color_variants : undefined);
          const brand = p.brand || (rawSpecs && typeof rawSpecs === 'object' ? rawSpecs.brand : 'Zevora');
          const sku = (rawSpecs && typeof rawSpecs === 'object' ? rawSpecs.sku : undefined);
          const subcategory = (rawSpecs && typeof rawSpecs === 'object' ? rawSpecs.subcategory : undefined);

          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            category_id: p.category_id,
            category_name: p.category_name || catMap.get(p.category_id) || 'General',
            price,
            original_price: originalPrice,
            discount_percent: Number(p.discount_percent) || 0,
            rating: Number(p.rating) || 4.5,
            review_count: Number(p.review_count ?? p.rating_count ?? 0),
            stock_quantity: stockQty,
            in_stock: inStock,
            images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images || '[]') : []),
            specs: formattedSpecs,
            colors: parsedColors,
            sizes: parsedSizes,
            brand: brand,
            sku: sku,
            subcategory: subcategory,
            variants: parsedVariants,
            color_variants: parsedColorVariants,
            size_chart: parsedSizeChart,
            is_featured: Boolean(p.is_featured),
            featured_at: featuredAt,
            is_deal: Boolean(p.is_deal),
            created_at: p.created_at,
          };
        });
        const sanitized = sanitizeProducts(formattedProds);
        setBaseProducts(sanitized);
        try {
          localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(sanitized));
        } catch {}
      } else {
        setBaseProducts((prev) => sanitizeProducts(prev.length > 0 ? prev : INITIAL_PRODUCTS));
      }

      // 3. Fetch orders from Supabase orders table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!orderError && orderData) {
        const mappedOrders: Order[] = orderData.map((o: any) => {
          const codAdvance = typeof o.address === 'object' && o.address !== null && o.address.advance_paid_amount !== undefined
            ? Number(o.address.advance_paid_amount)
            : (o.payment_method?.includes('Advance Paid: ₹99') || o.payment_method?.includes('Advance Paid: ₹') ? 99 : 0);
          const remainingCod = typeof o.address === 'object' && o.address !== null && o.address.remaining_cod_amount !== undefined
            ? Number(o.address.remaining_cod_amount)
            : (codAdvance > 0 ? Math.max(0, Number(o.total) - codAdvance) : 0);
          const paymentRef = typeof o.address === 'object' && o.address !== null && o.address.cf_payment_id
            ? o.address.cf_payment_id
            : (o.payment_method?.match(/CF-Pay: ([a-zA-Z0-9_-]+)/)?.[1] || '');
          const advanceStatus = typeof o.address === 'object' && o.address !== null && o.address.advance_status
            ? o.address.advance_status
            : (codAdvance > 0 ? 'paid' : (o.status === 'payment_pending' ? 'payment_pending' : ''));

          return {
            id: o.id,
            order_number: `ORD-${o.id.substring(0, 8).toUpperCase()}`,
            user_id: o.user_id || 'guest',
            user_email: (o.address && typeof o.address === 'object' && o.address.email) || '',
            user_name: (o.address && typeof o.address === 'object' && o.address.full_name) || 'Customer',
            items: Array.isArray(o.order_items)
              ? o.order_items.map((it: any) => ({
                  id: it.id,
                  product_id: it.product_id,
                  product_name: it.product_name,
                  product_image: it.product_image || '',
                  price: Number(it.price) || 0,
                  quantity: Number(it.quantity) || 1,
                  color: '',
                  size: '',
                }))
              : [],
            subtotal: Number(o.total) || 0,
            discount_amount: Number(o.discount) || 0,
            delivery_fee: 0,
            total_amount: Number(o.total) || 0,
            advance_paid_amount: codAdvance,
            remaining_cod_amount: remainingCod,
            advance_payment_status: advanceStatus,
            payment_reference: paymentRef,
            status: o.status || 'pending',
            shipping_address:
              typeof o.address === 'object' && o.address !== null
                ? o.address
                : {
                    full_name: 'Customer',
                    phone: '',
                    street: String(o.address || ''),
                    apartment: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    country: 'India',
                  },
            delivery_option: 'Standard Delivery',
            payment_method: o.payment_method || 'Online Payment',
            created_at: o.created_at,
          };
        });
        setOrders(mappedOrders);
      }

      // 4. Fetch registered customers from Supabase profiles table
      const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!profilesError && profilesData) {
        setCustomers(profilesData as UserProfile[]);
      }

      // 5. Fetch dynamic offers from Supabase offers table
      try {
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*')
          .order('display_order', { ascending: true });

        if (!offersError && offersData && offersData.length > 0) {
          setOffers(offersData as Offer[]);
          localStorage.setItem(LOCAL_STORAGE_OFFERS, JSON.stringify(offersData));
        }
      } catch (offersErr) {
        console.warn('Supabase offers query note:', offersErr);
      }

      // 6. Fetch store settings from Supabase Storage
      try {
        const { data: stData, error: stErr } = await supabase.storage
          .from('product-images')
          .download('settings/site_settings.json');
        if (!stErr && stData) {
          const text = await stData.text();
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object') {
            setStoreSettings((prev) => {
              const merged = { ...prev, ...parsed };
              try {
                localStorage.setItem(LOCAL_STORAGE_STORE_SETTINGS, JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        }
      } catch (settingsErr) {
        console.warn('Supabase site_settings download note:', settingsErr);
      }

      setIsSupabaseConnected(true);
    } catch (err) {
      console.warn('Supabase fetch issue:', err);
      setCategories((prev) => (prev.length > 0 ? prev : INITIAL_CATEGORIES));
      setBaseProducts((prev) => (prev.length > 0 ? prev : INITIAL_PRODUCTS));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOffers = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setOffers(data as Offer[]);
        localStorage.setItem(LOCAL_STORAGE_OFFERS, JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Failed to refresh offers from Supabase:', err);
    }
  };

  const refreshCustomers = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setCustomers(data as UserProfile[]);
      }
    } catch (err) {
      console.warn('Failed to refresh customers from Supabase profiles:', err);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured()) {
      refreshCatalog();
    }
  }, []);

  // Real-time synchronization for offers and products from Supabase
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const channel = supabase
        .channel('realtime_store_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'offers' },
          () => {
            refreshOffers();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            refreshCatalog();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (realtimeErr) {
      console.warn('Realtime sync subscription note:', realtimeErr);
    }
  }, [isSupabaseConnected]);

  // Load profile linked to authenticated Supabase user
  const loadUserProfile = async (authUser: any) => {
    const supabase = getSupabase();
    let profileData: UserProfile | null = null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!error && data) {
          profileData = {
            id: data.id,
            email: data.email,
            full_name: data.full_name || authUser.user_metadata?.full_name || data.email.split('@')[0],
            phone: data.phone || '',
            role: 'customer', // Normal users are always customer role
            avatar_url: data.avatar_url || '',
            addresses: data.addresses || [],
          };
          if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setAddresses(data.addresses);
            setSelectedAddress(data.addresses[0]);
          }
        }
      } catch (err) {
        console.warn('Error fetching user profile from Supabase:', err);
      }
    }

    if (!profileData) {
      profileData = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Customer',
        phone: '',
        role: 'customer',
        addresses: [],
      };
    }

    setUser(profileData);

    // Fetch user-specific orders
    if (supabase) {
      try {
        const { data: userOrders } = await supabase
          .from('orders')
          .select('*')
          .or(`user_id.eq.${authUser.id},user_email.eq.${authUser.email}`)
          .order('created_at', { ascending: false });

        if (userOrders && userOrders.length > 0) {
          setOrders(userOrders as Order[]);
        }
      } catch (err) {}
    }
  };

  // Restore session on app load & listen for auth state changes
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // 1. Restore existing session across page refreshes
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      }
    });

    // 2. Active listener for sign in / sign out / token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isSupabaseConnected]);

  // Synchronize route if user navigates via browser history or URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const info = getInitialPageInfo();
      setSelectedProductId(info.productId || null);
      setSelectedCategoryId(info.categoryId || null);
      if (info.searchQuery !== undefined) {
        setSearchQuery(info.searchQuery);
      } else if (info.page !== 'search') {
        setSearchQuery('');
      }
      setCurrentPage(info.page);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Navigation helper
  const navigateTo = (page: PageView, options?: { productId?: string; categoryId?: string; searchQuery?: string }) => {
    if (options?.productId) setSelectedProductId(options.productId);
    if (options?.categoryId) setSelectedCategoryId(options.categoryId);
    if (options?.searchQuery !== undefined) setSearchQuery(options.searchQuery);

    setCurrentPage(page);

    // Sync window history with proper route
    let targetUrl = '/';
    if (page === 'admin') {
      targetUrl = '/admin';
    } else if (page === 'product_detail' && options?.productId) {
      targetUrl = `/product/${options.productId}`;
    } else if (page === 'category_products' && options?.categoryId) {
      targetUrl = `/category/${options.categoryId}`;
    } else if (page === 'categories') {
      targetUrl = '/categories';
    } else if (page === 'cart') {
      targetUrl = '/cart';
    } else if (page === 'checkout') {
      targetUrl = '/checkout';
    } else if (page === 'wishlist') {
      targetUrl = '/wishlist';
    } else if (page === 'orders') {
      targetUrl = '/orders';
    } else if (page === 'search') {
      targetUrl = options?.searchQuery ? `/search?q=${encodeURIComponent(options.searchQuery)}` : '/search';
    } else if (page === 'login') {
      targetUrl = '/login';
    } else if (page === 'profile') {
      targetUrl = '/profile';
    } else if (page === 'help') {
      targetUrl = '/help';
    } else if (page === 'settings') {
      targetUrl = '/settings';
    } else if (page === 'terms') {
      targetUrl = '/terms';
    } else if (page === 'privacy') {
      targetUrl = '/privacy';
    } else {
      targetUrl = '/';
    }

    if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
      window.history.pushState({ page, productId: options?.productId, categoryId: options?.categoryId }, '', targetUrl);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const addToCart = (
    product: Product,
    quantity = 1,
    color?: string,
    size?: string,
    variant?: ProductVariant | null
  ) => {
    // Check variant stock if provided
    if (variant && variant.stock_quantity <= 0) {
      showToast(`${product.name} (${[color, size].filter(Boolean).join(' • ')}) is Out of Stock.`, 'error');
      return;
    }

    if (!product.in_stock || product.stock_quantity <= 0) {
      showToast(`${product.name} is Out of Stock and cannot be purchased.`, 'error');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product_id === product.id &&
          (!color || item.selected_color === color) &&
          (!size || item.selected_size === size)
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        product_id: product.id,
        product,
        quantity,
        selected_color: color || product.colors?.[0]?.name,
        selected_size: size || product.sizes?.[0],
        selected_variant_id: variant?.id,
        selected_variant_sku: variant?.sku,
        variant_price: variant?.price,
        variant_original_price: variant?.original_price,
      };
      return [...prev, newItem];
    });

    const variantDesc = [color, size].filter(Boolean).join(' • ');
    showToast(`Added ${product.name}${variantDesc ? ` (${variantDesc})` : ''} to cart`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Derived syncedCart: dynamically syncs cart items with current active product offer pricing & variants
  const syncedCart = useMemo(() => {
    return cart.map((item) => {
      const activeProd = products.find((p) => p.id === item.product_id);
      if (activeProd) {
        const v = activeProd.variants?.find(
          (varItem) =>
            (item.selected_variant_id && varItem.id === item.selected_variant_id) ||
            ((!item.selected_color || varItem.color === item.selected_color) &&
              (!item.selected_size || varItem.size === item.selected_size))
        );
        return {
          ...item,
          product: activeProd,
          variant_price: v?.price ?? item.variant_price,
          variant_original_price: v?.original_price ?? item.variant_original_price,
        };
      }
      return item;
    });
  }, [cart, products]);

  const cartCount = syncedCart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = syncedCart.reduce(
    (sum, item) =>
      sum +
      (item.variant_original_price ??
        item.product.original_price ??
        item.variant_price ??
        item.product.price) *
        item.quantity,
    0
  );
  const cartItemsDiscountedTotal = syncedCart.reduce(
    (sum, item) => sum + (item.variant_price ?? item.product.price) * item.quantity,
    0
  );
  const cartOfferDiscount = Math.max(0, cartSubtotal - cartItemsDiscountedTotal);

  // Validate applied coupon dynamically against current cart
  const couponValidation = useMemo(() => {
    if (!appliedCoupon) return { valid: false, discountAmount: 0, message: '' };
    return validateCouponForCart(appliedCoupon, syncedCart, cartItemsDiscountedTotal, new Date(offerClock));
  }, [appliedCoupon, syncedCart, cartItemsDiscountedTotal, offerClock]);

  const couponDiscount = couponValidation.valid ? couponValidation.discountAmount : 0;
  const cartTotal = Math.max(0, cartItemsDiscountedTotal - couponDiscount);
  const cartDiscount = cartOfferDiscount + couponDiscount;

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) {
      showToast('Please enter a coupon code', 'error');
      return { success: false, message: 'Please enter a coupon code' };
    }

    const found = coupons.find((c) => c.code.trim().toUpperCase() === clean);
    if (!found) {
      showToast(`Coupon code "${clean}" not found`, 'error');
      return { success: false, message: `Coupon code "${clean}" not found` };
    }

    const res = validateCouponForCart(found, syncedCart, cartItemsDiscountedTotal, new Date(offerClock));
    if (!res.valid) {
      showToast(res.message, 'error');
      return { success: false, message: res.message };
    }

    setAppliedCoupon(found);
    try {
      sessionStorage.setItem(LOCAL_STORAGE_APPLIED_COUPON, JSON.stringify(found));
    } catch {}
    showToast(res.message, 'success');
    return { success: true, message: res.message };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    try {
      sessionStorage.removeItem(LOCAL_STORAGE_APPLIED_COUPON);
    } catch {}
    showToast('Coupon removed', 'info');
  };

  // Wishlist operations
  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.product_id === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      setWishlist((prev) => prev.filter((item) => item.product_id !== product.id));
      showToast(`Removed from Wishlist`, 'info');
    } else {
      const newItem: WishlistItem = {
        id: `wish-${Date.now()}`,
        product_id: product.id,
        product,
      };
      setWishlist((prev) => [...prev, newItem]);
      showToast(`Added to Wishlist ❤️`, 'success');
    }
  };

  // Comparison operations (up to 3 products)
  const isInComparison = (productId: string) => {
    return comparisonList.some((item) => item.id === productId);
  };

  const addToComparison = (product: Product) => {
    if (isInComparison(product.id)) {
      showToast(`${product.name} is already in comparison`, 'info');
      return;
    }
    if (comparisonList.length >= 3) {
      showToast('You can compare up to 3 products at a time.', 'error');
      return;
    }
    setComparisonList((prev) => [...prev, product]);
    showToast(`Added to comparison (${comparisonList.length + 1}/3)`, 'success');
  };

  const removeFromComparison = (productId: string) => {
    setComparisonList((prev) => prev.filter((item) => item.id !== productId));
    showToast('Removed from comparison', 'info');
  };

  const toggleComparison = (product: Product) => {
    if (isInComparison(product.id)) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product);
    }
  };

  const clearComparison = () => {
    setComparisonList([]);
    showToast('Cleared comparison list', 'info');
  };

  // Place Order
  const placeOrder = async ({
    address,
    deliveryOption,
    deliveryFee,
    paymentMethod,
    orderId,
    orderNumber,
    status = 'processing',
    customTotal,
    customDiscount,
    advancePaidAmount = 0,
    remainingCodAmount = 0,
    advancePaymentStatus = '',
    paymentReference = '',
    clearCartAfter = true,
  }: {
    address: Address;
    deliveryOption: string;
    deliveryFee: number;
    paymentMethod: string;
    orderId?: string;
    orderNumber?: string;
    status?: OrderStatus;
    customTotal?: number;
    customDiscount?: number;
    advancePaidAmount?: number;
    remainingCodAmount?: number;
    advancePaymentStatus?: string;
    paymentReference?: string;
    clearCartAfter?: boolean;
  }): Promise<Order> => {
    const id = orderId && orderId.length === 36 ? orderId : crypto.randomUUID();
    const finalOrderNumber = orderNumber || `ORD-${id.substring(0, 8).toUpperCase()}`;
    const finalSubtotal = cartSubtotal;
    const finalDisc = customDiscount !== undefined ? customDiscount : cartDiscount;
    const finalTot = customTotal !== undefined ? customTotal : (cartTotal + deliveryFee);

    const enrichedAddress = {
      ...address,
      advance_paid_amount: advancePaidAmount,
      remaining_cod_amount: remainingCodAmount,
      advance_status: advancePaymentStatus,
      total_order_amount: finalTot,
      cf_payment_id: paymentReference,
      coupon_code: appliedCoupon?.code || null,
      coupon_discount: couponDiscount || 0,
    };

    const newOrder: Order = {
      id: id,
      order_number: finalOrderNumber,
      user_id: user?.id || 'guest',
      user_email: user?.email || (address as any)?.email || 'guest@example.com',
      user_name: user?.full_name || address.full_name,
      items: syncedCart.map((item) => ({
        id: crypto.randomUUID(),
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.images[0] || '',
        price: item.variant_price ?? item.product.price,
        original_price: item.variant_original_price ?? item.product.original_price ?? item.product.price,
        discount_amount: Math.max(0, (item.variant_original_price ?? item.product.original_price ?? item.product.price) - (item.variant_price ?? item.product.price)),
        discount_percent: item.product.discount_percent || 0,
        quantity: item.quantity,
        color: item.selected_color,
        size: item.selected_size,
        variant_sku: item.selected_variant_sku,
        variant_id: item.selected_variant_id,
      })),
      subtotal: finalSubtotal,
      discount_amount: finalDisc,
      delivery_fee: deliveryFee,
      total_amount: finalTot,
      advance_paid_amount: advancePaidAmount,
      remaining_cod_amount: remainingCodAmount,
      advance_payment_status: advancePaymentStatus,
      payment_reference: paymentReference,
      coupon_code: appliedCoupon?.code,
      coupon_discount: couponDiscount,
      status: status,
      shipping_address: enrichedAddress,
      delivery_option: deliveryOption,
      payment_method: paymentMethod,
      created_at: new Date().toISOString(),
    };

    // Save to Supabase if connected
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (!supabase) {
        showToast('Database connection unavailable', 'error');
        throw new Error('Database connection unavailable');
      }

      const { error: orderError } = await supabase.from('orders').insert([
        {
          id: newOrder.id,
          user_id: user?.id || null,
          total: newOrder.total_amount,
          discount: newOrder.discount_amount,
          address: enrichedAddress,
          status: newOrder.status,
          payment_method: newOrder.payment_method,
          created_at: newOrder.created_at,
        },
      ]);

      if (orderError) {
        console.warn('Supabase orders insert notice (RLS/Auth):', orderError.message);
      } else {
        // Also record items in order_items table in Supabase
        if (newOrder.items && newOrder.items.length > 0) {
          try {
            await supabase.from('order_items').insert(
              newOrder.items.map((it) => ({
                id: it.id,
                order_id: newOrder.id,
                product_id: it.product_id,
                product_name: it.product_name,
                product_image: it.product_image,
                price: it.price,
                quantity: it.quantity,
                created_at: newOrder.created_at,
              }))
            );
          } catch (itemErr) {
            console.warn('Order items insert note:', itemErr);
          }
        }
      }
    }

    // Automatically decrement stock for each purchased item & variant
    for (const it of syncedCart) {
      const prod = products.find((p) => p.id === it.product_id);
      if (prod) {
        let updatedVariants = prod.variants ? [...prod.variants] : [];
        if (updatedVariants.length > 0) {
          updatedVariants = updatedVariants.map((v) => {
            const isMatch =
              (it.selected_variant_id && v.id === it.selected_variant_id) ||
              ((!it.selected_color || (v.color || '').toLowerCase() === it.selected_color.toLowerCase()) &&
               (!it.selected_size || (v.size || '').toLowerCase() === it.selected_size.toLowerCase()));
            if (isMatch) {
              const newVarStock = Math.max(0, (Number(v.stock_quantity) || 0) - it.quantity);
              return {
                ...v,
                stock_quantity: newVarStock,
                in_stock: newVarStock > 0,
              };
            }
            return v;
          });
        }

        const newBaseStock = Math.max(0, (Number(prod.stock_quantity) || 0) - it.quantity);
        const newInStock = updatedVariants.length > 0
          ? updatedVariants.some((v) => (Number(v.stock_quantity) || 0) > 0)
          : newBaseStock > 0;

        setBaseProducts((prev) =>
          prev.map((p) =>
            p.id === prod.id
              ? {
                  ...p,
                  stock_quantity: newBaseStock,
                  in_stock: newInStock,
                  variants: updatedVariants,
                }
              : p
          )
        );

        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          if (supabase) {
            const rawSpecs: any = prod.specs;
            const updatedSpecsPayload = typeof rawSpecs === 'object' && rawSpecs !== null && !Array.isArray(rawSpecs)
              ? { ...(rawSpecs as Record<string, any>), variants: updatedVariants }
              : { items: Array.isArray(rawSpecs) ? rawSpecs : [], variants: updatedVariants };

            try {
              const query = supabase
                .from('products')
                .update({
                  stock: newBaseStock,
                  specs: updatedSpecsPayload,
                })
                .eq('id', prod.id);

              if (query && typeof (query as any).then === 'function') {
                (query as any).then(
                  () => {},
                  (err: any) => console.warn('Supabase stock decrement notice:', err)
                );
              }
            } catch (err) {
              console.warn('Supabase stock decrement notice:', err);
            }
          }
        }
      }
    }

    // Increment coupon usage count if a coupon was used
    if (appliedCoupon) {
      setCoupons((prev) => {
        const updated = prev.map((c) =>
          c.id === appliedCoupon.id ? { ...c, times_used: (c.times_used || 0) + 1 } : c
        );
        localStorage.setItem(LOCAL_STORAGE_COUPONS, JSON.stringify(updated));
        return updated;
      });
      removeCoupon();
    }

    setOrders((prev) => [newOrder, ...prev]);
    if (clearCartAfter) {
      clearCart();
    }
    showToast(`Order #${finalOrderNumber} placed successfully!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (!supabase) {
        showToast('Database connection unavailable', 'error');
        return false;
      }
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) {
        showToast(`Failed to update order in Supabase: ${error.message}`, 'error');
        return false;
      }
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o))
    );
    showToast(`Order status updated to ${status}`, 'success');
    return true;
  };

  // Addresses
  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    setAddresses((prev) => [newAddr, ...prev]);
    setSelectedAddress(newAddr);
    showToast('New shipping address saved', 'success');
  };

  // User Auth using Supabase Authentication & Profiles table
  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabase();

    if (isSupabaseConfigured()) {
      if (!supabase) {
        return { success: false, error: 'Database connection unavailable' };
      }
      if (!password) {
        return { success: false, error: 'Password is required' };
      }
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          await loadUserProfile(data.user);
          showToast(`Welcome back, ${data.user.user_metadata?.full_name || cleanEmail.split('@')[0]}!`, 'success');
          return { success: true };
        }
        return { success: false, error: 'Unable to authenticate with Supabase' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Login failed. Please check your credentials.' };
      }
    }

    // Local synchronized fallback only when Supabase credentials are NOT configured
    const fallbackUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: cleanEmail.split('@')[0],
      phone: '+91 98765 43210',
      role: 'customer',
    };
    setUser(fallbackUser);
    showToast(`Logged in as ${cleanEmail}`, 'success');
    return { success: true };
  };

  const signUp = async (
    email: string,
    password?: string,
    fullName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = fullName?.trim() || cleanEmail.split('@')[0];
    const supabase = getSupabase();

    if (isSupabaseConfigured()) {
      if (!supabase) {
        return { success: false, error: 'Database connection unavailable' };
      }
      if (!password) {
        return { success: false, error: 'Password is required' };
      }
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: displayName,
              role: 'customer', // Strict customer role, NEVER admin
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Immediately create/upsert the user's profile in the Supabase 'profiles' table
          try {
            await supabase.from('profiles').upsert(
              [
                {
                  id: data.user.id,
                  email: cleanEmail,
                  full_name: displayName,
                  role: 'customer',
                  created_at: new Date().toISOString(),
                },
              ],
              { onConflict: 'id' }
            );
          } catch (profileErr) {
            console.warn('Note on Supabase profile creation:', profileErr);
          }

          if (data.session) {
            await loadUserProfile(data.user);
            showToast(`Welcome to The Online Store, ${displayName}!`, 'success');
          } else {
            showToast('Account created! Please check your email to verify your account.', 'info');
          }
          return { success: true };
        }
        return { success: false, error: 'Unable to create user in Supabase' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to create account. Please try again.' };
      }
    }

    // Local fallback only when Supabase is NOT configured
    const fallbackUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: displayName,
      phone: '+91 98765 43210',
      role: 'customer',
    };
    setUser(fallbackUser);
    showToast(`Account created for ${cleanEmail}!`, 'success');
    return { success: true };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {}
    }
    setUser(null);
    showToast('You have been logged out', 'info');
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const res = await requestPasswordResetFromSupabase(email);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  const updateProfile = async (profileUpdate: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...profileUpdate } : null));

    const supabase = getSupabase();
    if (supabase && user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: profileUpdate.full_name,
            phone: profileUpdate.phone,
            avatar_url: profileUpdate.avatar_url,
            addresses: profileUpdate.addresses,
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Failed to update profile in Supabase:', err);
      }
    }

    showToast('Profile updated successfully', 'success');
  };

  // Admin Authentication (Existing Admin Login Only - Setup and public admin registration are disabled)
  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check local adminConfig credentials if present
    if (adminConfig && adminConfig.email.toLowerCase() === cleanEmail && adminConfig.passwordHash === btoa(password)) {
      setIsAdmin(true);
      setAdminEmail(cleanEmail);
      localStorage.setItem('online_store_is_admin_v1', 'true');
      localStorage.setItem('online_store_admin_email_v1', cleanEmail);
      sessionStorage.setItem('online_store_is_admin_v1', 'true');
      sessionStorage.setItem('online_store_admin_email_v1', cleanEmail);
      showToast('Welcome, Administrator!', 'success');
      return { success: true };
    }

    // 2. Authenticate against Supabase Auth (server-side verification)
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!error && data.user) {
          setIsAdmin(true);
          setAdminEmail(cleanEmail);
          const config = { email: cleanEmail, passwordHash: btoa(password) };
          setAdminConfig(config);
          localStorage.setItem(LOCAL_STORAGE_ADMIN, JSON.stringify(config));
          localStorage.setItem('online_store_is_admin_v1', 'true');
          localStorage.setItem('online_store_admin_email_v1', cleanEmail);
          sessionStorage.setItem('online_store_is_admin_v1', 'true');
          sessionStorage.setItem('online_store_admin_email_v1', cleanEmail);
          showToast('Welcome, Administrator!', 'success');
          return { success: true };
        } else if (error) {
          return { success: false, message: error.message || 'Invalid administrator email or password.' };
        }
      } catch (err: any) {
        console.warn('Supabase admin login error:', err);
      }
    }

    if (adminConfig && adminConfig.email.toLowerCase() === cleanEmail) {
      return { success: false, message: 'Incorrect admin password.' };
    }

    return { success: false, message: 'Invalid admin credentials. Please verify your email and password.' };
  };

  const logoutAdmin = async () => {
    setIsAdmin(false);
    setAdminEmail(null);
    try {
      localStorage.removeItem('online_store_is_admin_v1');
      localStorage.removeItem('online_store_admin_email_v1');
      sessionStorage.removeItem('online_store_is_admin_v1');
      sessionStorage.removeItem('online_store_admin_email_v1');
      const supabase = getSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {}
    showToast('Admin logged out successfully', 'info');
  };

  // Product Admin Actions
  const addProduct = async (productData: Omit<Product, 'id'>): Promise<boolean> => {
    // 1. Resolve UUID category_id
    let validCatId = productData.category_id;
    const isCatUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validCatId);
    if (!isCatUuid) {
      const found = categories.find(
        (c) => c.id === validCatId || c.slug === validCatId || c.name.toLowerCase() === (validCatId || '').toLowerCase()
      );
      if (found && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(found.id)) {
        validCatId = found.id;
      } else if (categories[0]?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categories[0].id)) {
        validCatId = categories[0].id;
      }
    }

    // 2. Generate valid UUID
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });

    const price = Number(productData.price) || 0;
    const mrp = Number(productData.original_price ?? (productData as any).mrp ?? productData.price) || price;
    const discount = Number(productData.discount_percent) || 0;
    const stock = Number(productData.stock_quantity ?? (productData as any).stock ?? 10);
    const images = Array.isArray(productData.images) && productData.images.length > 0
      ? productData.images
      : (productData as any).image_url
      ? [(productData as any).image_url]
      : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'];

    // Rich specifications bundle (variants, colors, sizes, size_chart, brand, sku) inside specs JSONB column
    const specsItems = Array.isArray(productData.specs)
      ? productData.specs
      : (productData.specs && typeof productData.specs === 'object' && Array.isArray((productData.specs as any).items)
        ? (productData.specs as any).items
        : [{ label: 'Brand', value: productData.brand || 'Zevora' }]);

    const richSpecs = {
      items: specsItems,
      variants: productData.variants || [],
      colors: productData.colors || [],
      sizes: productData.sizes || [],
      size_chart: productData.size_chart || null,
      brand: productData.brand || 'Zevora',
      sku: productData.sku || '',
      subcategory: productData.subcategory || '',
      color_variants: productData.color_variants || [],
    };

    // EXACT Supabase products table columns: id, name, description, price, mrp, discount_percent, stock, category_id, images, rating, rating_count, brand, is_featured, specs
    // Absolutely NO category_name column (matches real Supabase schema cache)
    const dbPayload = {
      id: newId,
      name: String(productData.name || 'New Product').trim(),
      description: String(productData.description || '').trim(),
      price: price,
      mrp: mrp,
      discount_percent: discount,
      stock: stock,
      category_id: validCatId,
      images: images,
      rating: Number(productData.rating) || 4.7,
      rating_count: Number(productData.review_count ?? (productData as any).rating_count ?? 1),
      brand: productData.brand || 'Zevora',
      is_featured: Boolean(productData.is_featured),
      specs: richSpecs,
    };

    let savedSuccessfully = false;

    // Try server API first (which has service role key)
    try {
      const resp = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload),
      });
      if (resp.ok) {
        const result = await resp.json();
        if (result.success) {
          savedSuccessfully = true;
        }
      }
    } catch {
      // Fallback to direct client
    }

    if (!savedSuccessfully && isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from('products').insert([dbPayload]);
        if (error) {
          showToast(`Failed to add product to Supabase: ${error.message}`, 'error');
          return false;
        }
        savedSuccessfully = true;
      }
    }

    const catName = categories.find((c) => c.id === validCatId)?.name || productData.category_name || 'General';
    const newProduct: Product = {
      ...productData,
      id: newId,
      category_id: validCatId,
      category_name: catName,
      price: dbPayload.price,
      original_price: dbPayload.mrp,
      discount_percent: dbPayload.discount_percent,
      stock_quantity: dbPayload.stock,
      in_stock: dbPayload.stock > 0,
      rating: dbPayload.rating,
      review_count: dbPayload.rating_count,
      images: dbPayload.images,
      specs: specsItems,
      brand: richSpecs.brand,
      sku: richSpecs.sku,
      subcategory: richSpecs.subcategory,
      variants: richSpecs.variants,
      colors: richSpecs.colors,
      sizes: richSpecs.sizes,
      size_chart: richSpecs.size_chart || undefined,
      color_variants: richSpecs.color_variants,
      created_at: new Date().toISOString(),
    };

    setBaseProducts((prev) => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" created!`, 'success');
    return true;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    let validCatId = updates.category_id;
    if (validCatId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validCatId)) {
      const found = categories.find(
        (c) => c.id === validCatId || c.slug === validCatId || c.name.toLowerCase() === (validCatId || '').toLowerCase()
      );
      if (found && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(found.id)) {
        validCatId = found.id;
      }
    }

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = String(updates.name).trim();
    if (updates.description !== undefined) dbUpdates.description = String(updates.description).trim();
    if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
    if (updates.original_price !== undefined || (updates as any).mrp !== undefined) {
      dbUpdates.mrp = Number(updates.original_price ?? (updates as any).mrp ?? updates.price);
    }
    if (updates.discount_percent !== undefined) dbUpdates.discount_percent = Number(updates.discount_percent);
    if (updates.stock_quantity !== undefined || (updates as any).stock !== undefined) {
      dbUpdates.stock = Number(updates.stock_quantity ?? (updates as any).stock);
    }
    if (validCatId !== undefined) dbUpdates.category_id = validCatId;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.rating !== undefined) dbUpdates.rating = Number(updates.rating);
    if (updates.review_count !== undefined || (updates as any).rating_count !== undefined) {
      dbUpdates.rating_count = Number(updates.review_count ?? (updates as any).rating_count);
    }
    if ((updates as any).brand !== undefined) dbUpdates.brand = (updates as any).brand;
    if (updates.is_featured !== undefined) {
      dbUpdates.is_featured = Boolean(updates.is_featured);
      if (updates.is_featured) {
        dbUpdates.featured_at = (updates as any).featured_at || new Date().toISOString();
      }
    }
    if (updates.specs !== undefined) dbUpdates.specs = updates.specs;

    if (
      updates.variants !== undefined ||
      updates.colors !== undefined ||
      updates.sizes !== undefined ||
      updates.size_chart !== undefined ||
      updates.sku !== undefined ||
      updates.subcategory !== undefined ||
      updates.color_variants !== undefined
    ) {
      const existingProd = baseProducts.find((p) => p.id === id);
      const prevSpecs = existingProd?.specs;
      const specsItems = Array.isArray(prevSpecs)
        ? prevSpecs
        : (prevSpecs && typeof prevSpecs === 'object' && Array.isArray((prevSpecs as any).items)
          ? (prevSpecs as any).items
          : []);

      dbUpdates.specs = {
        items: updates.specs !== undefined && Array.isArray(updates.specs) ? updates.specs : specsItems,
        variants: updates.variants !== undefined ? updates.variants : (existingProd?.variants || []),
        colors: updates.colors !== undefined ? updates.colors : (existingProd?.colors || []),
        sizes: updates.sizes !== undefined ? updates.sizes : (existingProd?.sizes || []),
        size_chart: updates.size_chart !== undefined ? updates.size_chart : (existingProd?.size_chart || null),
        brand: updates.brand !== undefined ? updates.brand : (existingProd?.brand || 'Zevora'),
        sku: updates.sku !== undefined ? updates.sku : (existingProd?.sku || ''),
        subcategory: updates.subcategory !== undefined ? updates.subcategory : (existingProd?.subcategory || ''),
        color_variants: updates.color_variants !== undefined ? updates.color_variants : (existingProd?.color_variants || []),
      };
    }

    // Never include category_name in dbUpdates
    let updatedRemotely = false;
    try {
      const resp = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbUpdates),
      });
      if (resp.ok) {
        const res = await resp.json();
        if (res.success) updatedRemotely = true;
      }
    } catch {}

    if (!updatedRemotely && isSupabaseConfigured() && Object.keys(dbUpdates).length > 0) {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
        if (error) {
          showToast(`Failed to update product in Supabase: ${error.message}`, 'error');
          return false;
        }
      }
    }

    setBaseProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        const newCatId = validCatId || p.category_id;
        const newCatName = categories.find((c) => c.id === newCatId)?.name || p.category_name;
        const mergedSpecs = dbUpdates.specs
          ? (typeof p.specs === 'object' && !Array.isArray(p.specs) ? { ...(p.specs as Record<string, any>), ...dbUpdates.specs } : p.specs)
          : p.specs;
        const isFeaturedVal = updates.is_featured !== undefined ? Boolean(updates.is_featured) : p.is_featured;
        const featuredAtVal = updates.is_featured !== undefined
          ? (updates.is_featured ? (dbUpdates.featured_at || new Date().toISOString()) : undefined)
          : p.featured_at;
        return {
          ...p,
          ...updates,
          specs: mergedSpecs,
          is_featured: isFeaturedVal,
          featured_at: featuredAtVal,
          category_id: newCatId,
          category_name: newCatName,
        };
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(sanitizeProducts(updated)));
      } catch {}
      return updated;
    });

    // Invalidate and refetch catalog to ensure persistent 100% sync with Supabase
    await refreshCatalog().catch(() => {});

    showToast('Product updated successfully', 'success');
    return true;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    let deletedRemotely = false;
    try {
      const resp = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        const res = await resp.json();
        if (res.success) deletedRemotely = true;
      }
    } catch {}

    if (!deletedRemotely && isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          showToast(`Failed to delete product from Supabase: ${error.message}`, 'error');
          return false;
        }
      }
    }

    setBaseProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product deleted', 'info');
    return true;
  };

  // Category Admin Actions
  const addCategory = async (catData: Omit<Category, 'id'>): Promise<boolean> => {
    const newId = `cat-${Date.now()}`;
    const newCategory: Category = {
      ...catData,
      id: newId,
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (!supabase) {
        showToast('Database connection unavailable', 'error');
        return false;
      }
      const { error } = await supabase.from('categories').insert([newCategory]);
      if (error) {
        showToast(`Failed to add category to Supabase: ${error.message}`, 'error');
        return false;
      }
    }

    setCategories((prev) => [...prev, newCategory]);
    showToast(`Category "${newCategory.name}" added`, 'success');
    return true;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (!supabase) {
        showToast('Database connection unavailable', 'error');
        return false;
      }
      const { error } = await supabase.from('categories').update(updates).eq('id', id);
      if (error) {
        showToast(`Failed to update category in Supabase: ${error.message}`, 'error');
        return false;
      }
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Category updated', 'success');
    return true;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (!supabase) {
        showToast('Database connection unavailable', 'error');
        return false;
      }
      await supabase.from('products').delete().eq('category_id', id);
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        showToast(`Failed to delete category from Supabase: ${error.message}`, 'error');
        return false;
      }
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    setBaseProducts((prev) => prev.filter((p) => p.category_id !== id));
    showToast('Category deleted', 'info');
    return true;
  };

  // Offers Admin CRUD Actions
  const addOffer = async (offerData: Omit<Offer, 'id'>): Promise<boolean> => {
    const newId = `offer-${Date.now()}`;
    const newOffer: Offer = {
      ...offerData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { error } = await supabase.from('offers').insert([newOffer]);
          if (error) {
            console.warn('Supabase offer insert note:', error.message);
          }
        } catch (err) {
          console.warn('Supabase offer insert exception:', err);
        }
      }
    }

    setOffers((prev) => {
      const updated = [newOffer, ...prev];
      localStorage.setItem(LOCAL_STORAGE_OFFERS, JSON.stringify(updated));
      return updated;
    });
    const toastMsg = newOffer.title?.trim()
      ? `Offer "${newOffer.title}" created successfully!`
      : 'Offer banner created successfully!';
    showToast(toastMsg, 'success');
    return true;
  };

  const updateOffer = async (id: string, updates: Partial<Offer>): Promise<boolean> => {
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { error } = await supabase.from('offers').update(payload).eq('id', id);
          if (error) {
            console.warn('Supabase offer update note:', error.message);
          }
        } catch (err) {
          console.warn('Supabase offer update exception:', err);
        }
      }
    }

    setOffers((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, ...payload } : o));
      localStorage.setItem(LOCAL_STORAGE_OFFERS, JSON.stringify(updated));
      return updated;
    });
    showToast('Offer updated successfully!', 'success');
    return true;
  };

  const deleteOffer = async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { error } = await supabase.from('offers').delete().eq('id', id);
          if (error) {
            console.warn('Supabase offer delete note:', error.message);
          }
        } catch (err) {
          console.warn('Supabase offer delete exception:', err);
        }
      }
    }

    setOffers((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      localStorage.setItem(LOCAL_STORAGE_OFFERS, JSON.stringify(updated));
      return updated;
    });
    showToast('Offer deleted', 'info');
    return true;
  };

  const toggleOfferActive = async (id: string, isActive: boolean): Promise<boolean> => {
    return await updateOffer(id, { is_active: isActive });
  };

  // Connect Supabase runtime handler
  const connectSupabase = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
    if (!url || !key) {
      return { success: false, message: 'URL and Anon Key are required.' };
    }

    saveSupabaseCredentials(url, key);
    setIsSupabaseConnected(true);
    await refreshCatalog();
    showToast('Connected to Supabase project!', 'success');
    return { success: true, message: 'Supabase credentials saved and synced.' };
  };

  const subscribeNewsletter = async (email: string): Promise<{ success: boolean; message: string }> => {
    const res = await subscribeEmailToSupabase(email);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  // Product Reviews methods
  const getProductReviews = (productId: string): ProductReview[] => {
    if (reviews[productId] && reviews[productId].length > 0) {
      return reviews[productId];
    }
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      return generateUniqueReviewsForProduct(prod);
    }
    return [];
  };

  const submitProductReview = async (
    productId: string,
    rating: number,
    title: string,
    comment: string,
    userName?: string
  ): Promise<{ success: boolean; message: string }> => {
    const author = userName?.trim() || user?.full_name || 'Verified Customer';

    const result = await submitProductReviewToSupabase({
      product_id: productId,
      user_id: user?.id || 'guest',
      user_name: author,
      rating,
      title,
      comment,
      verified_purchase: true,
    });

    const newRev: ProductReview = result.review || {
      id: `rev-${Date.now()}`,
      product_id: productId,
      user_id: user?.id || 'guest',
      user_name: author,
      rating,
      title,
      comment,
      verified_purchase: true,
      created_at: new Date().toISOString(),
      helpful_count: 0,
    };

    const currentProdsReviews = getProductReviews(productId);
    const updatedReviewsList = [newRev, ...currentProdsReviews];

    setReviews((prev) => ({
      ...prev,
      [productId]: updatedReviewsList,
    }));

    // Recalculate product rating & review_count
    const totalRatingSum = updatedReviewsList.reduce((sum, r) => sum + r.rating, 0);
    const newAverage = Number((totalRatingSum / updatedReviewsList.length).toFixed(1));

    setBaseProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          return {
            ...prod,
            rating: newAverage,
            review_count: updatedReviewsList.length,
          };
        }
        return prod;
      })
    );

    showToast('Your review has been published!', 'success');
    return { success: true, message: 'Review submitted successfully.' };
  };

  const markReviewHelpful = (reviewId: string, productId: string) => {
    setReviews((prev) => {
      const prodRevs = prev[productId] || [];
      const updated = prodRevs.map((r) =>
        r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r
      );
      return { ...prev, [productId]: updated };
    });
    showToast('Thank you for your feedback!', 'info');
  };

  // Website Settings management
  const updateStoreSettings = async (settings: Partial<StoreSettings>): Promise<boolean> => {
    let updatedPayload: StoreSettings = { ...storeSettings, ...settings };
    setStoreSettings((prev) => {
      const updated = { ...prev, ...settings };
      updatedPayload = updated;
      try {
        localStorage.setItem(LOCAL_STORAGE_STORE_SETTINGS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
    } catch {}

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const blob = new Blob([JSON.stringify(updatedPayload, null, 2)], { type: 'application/json' });
          await supabase.storage.from('product-images').upload('settings/site_settings.json', blob, {
            contentType: 'application/json',
            upsert: true,
          });
        } catch (err) {
          console.warn('Supabase storage site_settings save note:', err);
        }
      }
    }

    showToast('Website settings saved successfully!', 'success');
    return true;
  };

  // Coupons management
  const addCoupon = async (couponData: Omit<Coupon, 'id'>): Promise<boolean> => {
    const cleanCode = couponData.code.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Please provide a coupon code', 'error');
      return false;
    }

    // Check duplicate code
    if (coupons.some((c) => c.code.trim().toUpperCase() === cleanCode)) {
      showToast(`Coupon code "${cleanCode}" already exists`, 'error');
      return false;
    }

    const newId = `cpn-${Date.now()}`;
    const newCoupon: Coupon = {
      ...couponData,
      id: newId,
      code: cleanCode,
      times_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.from('coupons').insert([newCoupon]);
        } catch (err) {
          console.warn('Supabase coupons insert note:', err);
        }
      }
    }

    setCoupons((prev) => {
      const updated = [newCoupon, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_COUPONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showToast(`Coupon "${cleanCode}" created successfully!`, 'success');
    return true;
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<boolean> => {
    const payload = {
      ...updates,
      ...(updates.code ? { code: updates.code.trim().toUpperCase() } : {}),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.from('coupons').update(payload).eq('id', id);
        } catch (err) {
          console.warn('Supabase coupons update note:', err);
        }
      }
    }

    setCoupons((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...payload } : c));
      try {
        localStorage.setItem(LOCAL_STORAGE_COUPONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // If currently applied coupon was edited, update appliedCoupon
    if (appliedCoupon && appliedCoupon.id === id) {
      setAppliedCoupon((prev) => (prev ? { ...prev, ...payload } : null));
    }

    showToast('Coupon updated successfully!', 'success');
    return true;
  };

  const deleteCoupon = async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          await supabase.from('coupons').delete().eq('id', id);
        } catch (err) {
          console.warn('Supabase coupons delete note:', err);
        }
      }
    }

    setCoupons((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_COUPONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (appliedCoupon?.id === id) {
      removeCoupon();
    }

    showToast('Coupon deleted', 'info');
    return true;
  };

  const toggleCouponActive = async (id: string, isActive: boolean): Promise<boolean> => {
    return await updateCoupon(id, { is_active: isActive });
  };

  return (
    <StoreContext.Provider
      value={{
        currentPage,
        navigateTo,
        selectedProductId,
        selectedCategoryId,
        searchQuery,
        setSearchQuery,
        products,
        categories,
        isLoading,
        refreshCatalog,
        cart: syncedCart,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        comparisonList,
        addToComparison,
        removeFromComparison,
        toggleComparison,
        clearComparison,
        isInComparison,
        isCompareModalOpen,
        setIsCompareModalOpen,
        orders,
        placeOrder,
        updateOrderStatus,
        user,
        addresses,
        selectedAddress,
        setSelectedAddress,
        addAddress,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        isAdmin,
        adminEmail,
        loginAdmin,
        logoutAdmin,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        offers,
        activeOffers,
        addOffer,
        updateOffer,
        deleteOffer,
        toggleOfferActive,
        refreshOffers,
        customers,
        refreshCustomers,
        isSupabaseConnected,
        connectSupabase,
        subscribeNewsletter,
        getProductReviews,
        submitProductReview,
        markReviewHelpful,
        storeSettings,
        updateStoreSettings,
        coupons,
        activeCoupons,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponActive,
        toast,
        showToast,
        themeMode,
        isDarkMode,
        setThemeMode,
        toggleDarkMode,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

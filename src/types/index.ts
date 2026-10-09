export interface ProductVariant {
  id: string;
  sku?: string;
  color?: string;
  color_hex?: string;
  size?: string;
  price?: number;
  original_price?: number;
  stock_quantity: number;
  images?: string[];
  in_stock?: boolean;
}

export interface ColorVariant {
  name: string;
  hex: string;
  images?: string[];
}

export interface SizeChartRow {
  size: string;
  chest?: string;
  waist?: string;
  hips?: string;
  length?: string;
  shoulder?: string;
  age_group?: string;
  height?: string;
}

export interface SizeChart {
  type: 'standard' | 'girls' | 'footwear' | 'custom';
  title?: string;
  unit: 'inches' | 'cm';
  rows: SizeChartRow[];
  guide_tips?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name?: string;
  category_ids?: string[];
  category_names?: string[];
  price: number;
  original_price: number;
  discount_percent: number;
  rating: number;
  review_count: number;
  in_stock: boolean;
  stock_quantity: number;
  images: string[];
  specs: { label: string; value: string }[];
  colors: { name: string; hex: string; images?: string[] }[];
  sizes?: string[];
  brand?: string;
  subcategory?: string;
  sku?: string;
  variants?: ProductVariant[];
  color_variants?: ColorVariant[];
  size_chart?: SizeChart;
  size_chart_type?: string;
  is_featured?: boolean;
  featured_at?: string;
  is_deal?: boolean;
  applied_offer_id?: string;
  applied_offer_title?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  color_bg: string;
  color_text: string;
  product_count: number;
  image_url?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  selected_color?: string;
  selected_size?: string;
  selected_variant_id?: string;
  selected_variant_sku?: string;
  variant_price?: number;
  variant_original_price?: number;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  product: Product;
}

export interface Address {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  original_price?: number;
  discount_amount?: number;
  discount_percent?: number;
  quantity: number;
  color?: string;
  size?: string;
  variant_sku?: string;
  variant_id?: string;
}

export type OrderStatus =
  | 'payment_pending'
  | 'paid'
  | 'confirmed'
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'failed';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_email: string;
  user_name: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  advance_paid_amount?: number;
  remaining_cod_amount?: number;
  advance_payment_status?: string;
  payment_reference?: string;
  coupon_code?: string;
  coupon_discount?: number;
  status: OrderStatus;
  shipping_address: Address;
  delivery_option: string;
  payment_method: string;
  created_at: string;
  updated_at?: string;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  contact_email: string;
  contact_phone: string;
  currency_symbol: string;
  announcement_text?: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_cart_value: number;
  max_discount_amount?: number;
  scope: 'all' | 'category' | 'products';
  target_category_id?: string;
  target_category_name?: string;
  target_product_ids?: string[];
  start_at?: string | null;
  end_at?: string | null;
  usage_limit?: number;
  times_used?: number;
  allow_with_offers: boolean;
  is_active: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'customer';
  avatar_url?: string;
  addresses?: Address[];
  order_email_updates?: boolean;
  created_at?: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  verified_purchase?: boolean;
  created_at: string;
  helpful_count?: number;
}

export interface Offer {
  id: string;
  title?: string;
  discount_text?: string;
  discount_percentage?: number;
  category_id?: string;
  category_name?: string;
  description?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export type PageView =
  | 'home'
  | 'categories'
  | 'category_products'
  | 'product_detail'
  | 'search'
  | 'cart'
  | 'checkout'
  | 'wishlist'
  | 'login'
  | 'profile'
  | 'orders'
  | 'help'
  | 'settings'
  | 'terms'
  | 'privacy'
  | 'admin';

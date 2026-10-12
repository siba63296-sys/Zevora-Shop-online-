export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name?: string;
  price: number;
  original_price: number;
  discount_percent: number;
  rating: number;
  review_count: number;
  in_stock: boolean;
  stock_quantity: number;
  images: string[];
  specs: { label: string; value: string }[];
  colors: { name: string; hex: string }[];
  sizes?: string[];
  is_featured?: boolean;
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
  title: string;
  discount_text: string;
  discount_percentage?: number;
  category_id?: string;
  category_name?: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
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

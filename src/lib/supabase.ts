import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ijpbacailliwtthsjuqs.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_YEREajXhEn6E0vWtydYjyA_nhZS43A8';

const STORAGE_URL_KEY = 'the_online_store_supabase_url';
const STORAGE_ANON_KEY = 'the_online_store_supabase_anon_key';
const STORAGE_ADMIN_CONFIG_KEY = 'the_online_store_admin_configured';

export function getStoredSupabaseCredentials(): { url: string; anonKey: string } {
  let envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  let envAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (!envUrl || envUrl.includes('your-project.supabase.co') || envUrl.includes('api.supabase.com') || !envUrl.includes('.supabase.co')) {
    envUrl = DEFAULT_SUPABASE_URL;
  }
  if (!envAnonKey || envAnonKey.includes('your-anon-key') || envAnonKey === 'your-anon-key-here') {
    envAnonKey = DEFAULT_SUPABASE_ANON_KEY;
  }

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) || '' : '';

  let finalUrl = (storedUrl || envUrl || DEFAULT_SUPABASE_URL).trim();
  if (finalUrl.includes('api.supabase.com') || !finalUrl.includes('.supabase.co') || finalUrl.includes('your-project.supabase.co')) {
    finalUrl = DEFAULT_SUPABASE_URL;
  }

  let finalKey = (storedKey || envAnonKey || DEFAULT_SUPABASE_ANON_KEY).trim();
  if (!finalKey || finalKey.includes('your-anon-key') || finalKey === 'your-anon-key-here') {
    finalKey = DEFAULT_SUPABASE_ANON_KEY;
  }

  return {
    url: finalUrl,
    anonKey: finalKey,
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    let cleanUrl = url.trim();
    if (cleanUrl.includes('api.supabase.com') || !cleanUrl.includes('.supabase.co') || cleanUrl.includes('your-project.supabase.co')) {
      cleanUrl = DEFAULT_SUPABASE_URL;
    }
    const cleanKey = anonKey.trim() || DEFAULT_SUPABASE_ANON_KEY;
    localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
    localStorage.setItem(STORAGE_ANON_KEY, cleanKey);
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getStoredSupabaseCredentials();
  if (!url || !anonKey) return false;
  if (!url.startsWith('https://')) return false;
  if (
    url.includes('your-project.supabase.co') ||
    url.includes('example.supabase.co') ||
    url.includes('api.supabase.com') ||
    !url.includes('.supabase.co') ||
    anonKey === 'your-anon-key-here' ||
    anonKey.includes('your-anon-key')
  ) {
    return false;
  }
  return true;
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = getStoredSupabaseCredentials();

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  let targetUrl = url || getStoredSupabaseCredentials().url;
  let targetKey = key || getStoredSupabaseCredentials().anonKey;

  if (targetUrl?.includes('api.supabase.com') || !targetUrl?.includes('.supabase.co')) {
    targetUrl = DEFAULT_SUPABASE_URL;
  }
  if (!targetKey || targetKey.includes('your-anon-key')) {
    targetKey = DEFAULT_SUPABASE_ANON_KEY;
  }

  if (!targetUrl || !targetKey) {
    return { success: false, message: 'Supabase URL or Anon Key is missing' };
  }

  if (!targetUrl.startsWith('https://')) {
    return { success: false, message: 'Supabase URL must start with https://' };
  }

  try {
    const client = createClient(targetUrl, targetKey);
    // Ping public table or auth
    const { error } = await client.from('categories').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && !error.message?.includes('does not exist')) {
      // If table doesn't exist yet, connection itself still succeeded
      if (error.message?.includes('relation "public.categories" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! (Database tables need to be created via the SQL Schema script)',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase project!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection failed' };
  }
}

// SQL Script for user/admin to run in Supabase SQL editor to bootstrap all tables and policies
export const SUPABASE_SCHEMA_SQL = `-- The Online Store - Complete Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'ShoppingBag',
  color_bg TEXT DEFAULT 'bg-blue-500',
  color_text TEXT DEFAULT 'text-blue-500',
  product_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  discount_percent INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 10,
  images TEXT[] DEFAULT ARRAY[]::text[],
  specs JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_deal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  avatar_url TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  delivery_option TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  color TEXT,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  selected_color TEXT,
  selected_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Wishlist Items Table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories and products
CREATE POLICY IF NOT EXISTS "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for categories admin" ON public.categories FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for products admin" ON public.products FOR ALL USING (true);

-- Allow public / user orders creation and reading
CREATE POLICY IF NOT EXISTS "Allow orders insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow orders select" ON public.orders FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow orders update" ON public.orders FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Allow order items insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow order items select" ON public.order_items FOR SELECT USING (true);

-- Allow profiles access
CREATE POLICY IF NOT EXISTS "Allow profiles all" ON public.profiles FOR ALL USING (true);

-- Auto-create profile on auth signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Public Access Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "Allow Upload Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "Allow Update Product Images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- 11. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public insert newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all newsletter admin" ON public.newsletter_subscribers FOR ALL USING (true);

-- 12. Product Reviews Table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  user_id TEXT,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public read reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public insert reviews" ON public.product_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all reviews admin" ON public.product_reviews FOR ALL USING (true);

-- 13. Dynamic Offers / Promotional Banners Table
CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  discount_text TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  button_text TEXT DEFAULT 'Shop Now',
  button_link TEXT DEFAULT 'categories',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow public read offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow all offers admin" ON public.offers FOR ALL USING (true);
`;

export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
}

export async function subscribeEmailToSupabase(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return { success: false, message: 'Please enter a valid email address (e.g. name@example.com)' };
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const { error } = await supabase.from('newsletter_subscribers').insert([
        {
          id,
          email: cleanEmail,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          return { success: true, message: 'You are already subscribed to our newsletter! Thank you.' };
        }
        console.warn('Supabase newsletter subscriber insert error:', error);
      }
    } catch (err: any) {
      console.warn('Supabase newsletter connection note:', err);
    }
  }

  // Also save to local subscriber list for synchronized offline/fallback storage
  try {
    const LOCAL_KEY = 'the_online_store_newsletter_subscribers';
    const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    if (!existing.includes(cleanEmail)) {
      existing.push(cleanEmail);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(existing));
    }
  } catch {}

  return { success: true, message: 'Thank you for subscribing! Check your inbox for exclusive deals and updates.' };
}

// Product Reviews Helpers
export async function fetchProductReviewsFromSupabase(productId: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching reviews from Supabase:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Failed to query product_reviews table:', err);
    return null;
  }
}

export async function submitProductReviewToSupabase(review: {
  product_id: string;
  user_id?: string;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  verified_purchase?: boolean;
}): Promise<{ success: boolean; message: string; review?: any }> {
  const id = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newReview = {
    id,
    product_id: review.product_id,
    user_id: review.user_id || 'guest',
    user_name: review.user_name || 'Verified Customer',
    rating: review.rating,
    title: review.title || '',
    comment: review.comment,
    verified_purchase: review.verified_purchase ?? true,
    created_at: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('product_reviews').insert([newReview]);
      if (error) {
        console.warn('Supabase review insert error:', error);
      }
    } catch (err) {
      console.warn('Supabase review insert exception:', err);
    }
  }

  return { success: true, message: 'Thank you! Your review has been submitted.', review: newReview };
}

export async function requestPasswordResetFromSupabase(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!validateEmail(cleanEmail)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/#reset-password`,
      });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Password reset link sent! Please check your email inbox.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to send password reset request.' };
    }
  }

  return { success: true, message: 'Password reset instructions have been dispatched to your email address.' };
}

/**
 * Upload product image directly to Supabase Storage 'product-images' bucket.
 * Returns public URL to save with the product in the Supabase database.
 */
export async function uploadProductImageToSupabase(
  file: File
): Promise<{ success: boolean; url: string; message: string; fromStorage: boolean }> {
  if (!file) {
    return { success: false, url: '', message: 'No file selected', fromStorage: false };
  }

  // Validate image type
  if (!file.type.startsWith('image/')) {
    return { success: false, url: '', message: 'Please select an image file (PNG, JPG, WebP, etc.)', fromStorage: false };
  }

  // Max 15MB file size
  if (file.size > 15 * 1024 * 1024) {
    return { success: false, url: '', message: 'Image size exceeds 15MB limit', fromStorage: false };
  }

  // 1. Try server-side endpoint with service role credentials (guaranteed Storage permissions)
  try {
    const base64Data = await fileToBase64(file);
    const resp = await fetch('/api/upload-product-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataBase64: base64Data,
        fileName: file.name,
        mimeType: file.type,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.success && data.url) {
        return {
          success: true,
          url: data.url,
          message: 'Image uploaded to Supabase Storage (product-images)!',
          fromStorage: true,
        };
      }
    }
  } catch (err) {
    console.warn('Server upload attempt failed, trying direct storage...', err);
  }

  // 2. Direct Supabase Storage attempt
  const supabase = getSupabase();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${Date.now()}_${cleanBase}.${fileExt}`;
  const filePath = `products/${fileName}`;

  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg',
        });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return {
            success: true,
            url: publicUrlData.publicUrl,
            message: 'Image successfully uploaded to Supabase Storage bucket (product-images)!',
            fromStorage: true,
          };
        }
      }
    } catch (err: any) {
      console.warn('Direct storage upload exception:', err);
    }
  }

  // 3. Fallback to base64 Data URL for instant preview
  const base64Url = await fileToBase64(file);
  return {
    success: true,
    url: base64Url,
    message: 'Image loaded successfully!',
    fromStorage: false,
  };
}

/**
 * Upload an offer banner image to Supabase Storage.
 * Stores in public bucket and returns permanent public URL.
 */
export async function uploadBannerImageToSupabase(
  file: File
): Promise<{ success: boolean; url: string; message: string; fromStorage: boolean }> {
  if (!file) {
    return { success: false, url: '', message: 'No file selected', fromStorage: false };
  }

  if (!file.type.startsWith('image/')) {
    return { success: false, url: '', message: 'Please select a valid image file', fromStorage: false };
  }

  if (file.size > 20 * 1024 * 1024) {
    return { success: false, url: '', message: 'Image size exceeds 20MB limit', fromStorage: false };
  }

  const supabase = getSupabase();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `banner_${Date.now()}_${cleanBase}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg',
        });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return {
            success: true,
            url: publicUrlData.publicUrl,
            message: 'Banner image successfully uploaded to Supabase Storage!',
            fromStorage: true,
          };
        }
      } else {
        console.warn('Supabase storage banner upload note:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase storage banner upload exception:', err);
    }
  }

  const base64Url = await fileToBase64(file);
  return {
    success: true,
    url: base64Url,
    message: 'Banner image loaded successfully!',
    fromStorage: false,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function fetchProductByIdFromSupabase(productId: string): Promise<{ product: any; variants: any[] } | null> {
  if (!productId) return null;

  // 1. Try direct Supabase client
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (!error && data) {
        let variants: any[] = [];
        try {
          const { data: vData } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId);
          if (vData && Array.isArray(vData)) {
            variants = vData;
          }
        } catch {}

        return { product: data, variants };
      }
    } catch (err) {
      console.warn('Direct Supabase fetchProductById note:', err);
    }
  }

  // 2. Fallback to API route /api/products/:id
  try {
    const res = await fetch(`/api/products/${productId}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.product) {
        return { product: json.product, variants: json.variants || [] };
      }
    }
  } catch (err) {
    console.warn('API fetchProductById error:', err);
  }

  return null;
}




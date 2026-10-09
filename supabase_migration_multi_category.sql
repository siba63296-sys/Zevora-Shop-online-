-- ==============================================================================
-- ZEVORA MULTI-CATEGORY PRODUCT ASSIGNMENT MIGRATION
-- Creates product_categories junction table with foreign keys, unique constraint,
-- indexes, RLS policies, and migrates existing product assignments safely.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_product_category UNIQUE (product_id, category_id)
);

-- Indexes for high-performance category & product lookups
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON public.product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON public.product_categories(category_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read product_categories" ON public.product_categories;
CREATE POLICY "Allow public read product_categories"
  ON public.product_categories FOR SELECT
  USING (true);

-- Allow full access for service_role and authenticated users
DROP POLICY IF EXISTS "Allow service role all product_categories" ON public.product_categories;
CREATE POLICY "Allow service role all product_categories"
  ON public.product_categories FOR ALL
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert product_categories" ON public.product_categories;
CREATE POLICY "Allow anon insert product_categories"
  ON public.product_categories FOR ALL
  TO anon
  USING (true);

-- Safe migration of existing single-category relationships into junction table
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id
FROM public.products
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

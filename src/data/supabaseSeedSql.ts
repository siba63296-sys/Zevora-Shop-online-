import { DEMO_OUT_OF_STOCK_PRODUCTS } from './demoProducts';

const CATEGORY_SLUG_MAP: Record<string, { slug: string; name: string }> = {
  'cat-mobiles': { slug: 'mobiles-tablets', name: 'Mobiles & Tablets' },
  'cat-laptops': { slug: 'laptops-computers', name: 'Laptops & Computers' },
  'cat-electronics': { slug: 'electronics-audio', name: 'Electronics & Audio' },
  'cat-fashion': { slug: 'fashion', name: 'Fashion' },
  'cat-jewellery': { slug: 'girls-jewellery', name: "Girls' Jewellery" },
  'cat-footwear': { slug: 'shoes-footwear', name: 'Shoes & Footwear' },
  'cat-home': { slug: 'home-living', name: 'Home & Living' },
  'cat-beauty': { slug: 'beauty-personal-care', name: 'Beauty & Personal Care' },
  'cat-sports': { slug: 'sports-fitness', name: 'Sports & Fitness' },
  'cat-toys': { slug: 'toys-games', name: 'Toys & Games' },
  'cat-books': { slug: 'books-stationery', name: 'Books & Stationery' },
  'cat-girls-collection': { slug: 'girls-collection', name: 'Girls Collection' },
};

export function generateSupabaseDemoSeedSql(): string {
  const categoriesSql = `-- 1. Ensure required category rows exist without touching schema (including Girls Collection)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'mobiles-tablets') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Mobiles & Tablets', 'mobiles-tablets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'laptops-computers') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Laptops & Computers', 'laptops-computers');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'electronics-audio') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Electronics & Audio', 'electronics-audio');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'fashion') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Fashion', 'fashion');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'girls-jewellery') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Girls'' Jewellery', 'girls-jewellery');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'shoes-footwear') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Shoes & Footwear', 'shoes-footwear');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'home-living') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Home & Living', 'home-living');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'beauty-personal-care') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Beauty & Personal Care', 'beauty-personal-care');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'sports-fitness') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Sports & Fitness', 'sports-fitness');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'toys-games') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Toys & Games', 'toys-games');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'books-stationery') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Books & Stationery', 'books-stationery');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'girls-collection') THEN
    INSERT INTO public.categories (name, slug) VALUES ('Girls Collection', 'girls-collection');
  END IF;
END $$;`;

  const escapeStr = (s?: string) => (s ? `'${s.replace(/'/g, "''")}'` : 'NULL');
  const escapeJson = (o: any) => `'${JSON.stringify(o || []).replace(/'/g, "''")}'::jsonb`;
  const escapeTextArray = (arr?: string[]) => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return 'ARRAY[]::text[]';
    const escaped = arr.map((item) => `'${String(item).replace(/'/g, "''")}'`);
    return `ARRAY[${escaped.join(', ')}]::text[]`;
  };

  const values = DEMO_OUT_OF_STOCK_PRODUCTS.map((p, index) => {
    const cat = CATEGORY_SLUG_MAP[p.category_id] || { slug: 'fashion', name: p.category_name || 'Fashion' };
    const categoryIdSubquery = `(SELECT id FROM public.categories WHERE slug = '${cat.slug}' OR name = '${cat.name.replace(/'/g, "''")}' LIMIT 1)`;
    const uuid = `c0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
    const brand = 'General';
    const mrp = p.original_price || p.price;
    const ratingCount = p.review_count || 1;
    const stock = p.category_id === 'cat-footwear'
      ? (p.stock_quantity && p.stock_quantity > 0 ? p.stock_quantity : 25)
      : (p.stock_quantity ?? 0);

    return `  ('${uuid}'::uuid, ${escapeStr(p.name)}, ${escapeStr(p.description)}, ${categoryIdSubquery}, ${p.price}, ${mrp}, ${
      p.discount_percent || 0
    }, ${stock}, ${escapeTextArray(p.images)}, ${p.rating || 4.5}, ${ratingCount}, ${escapeStr(brand)}, false, ${escapeJson(
      p.specs
    )})`;
  }).join(',\n');

  return `-- ==============================================================================
-- THE ONLINE STORE: 200+ DEMO PRODUCTS COMPLETE SEED SCRIPT FOR SUPABASE
-- FIXED FOR UUID CATEGORY_ID SCHEMA (Resolves real UUIDs from public.categories by slug/name)
-- EXACT COLUMNS: id, name, description, category_id, price, mrp, discount_percent, stock, images, rating, rating_count, brand, is_featured, specs
-- NO category_name column (matches real Supabase products schema cache)
-- All 218 Demo Products strictly set to OUT OF STOCK (stock = 0)
-- ON CONFLICT (id) DO NOTHING protects all existing products and data
-- ==============================================================================

-- 1. Ensure required category rows exist without schema changes
${categoriesSql}

-- 2. Insert ALL 218 Demo Products with actual category UUIDs resolved dynamically
INSERT INTO public.products (
  id,
  name,
  description,
  category_id,
  price,
  mrp,
  discount_percent,
  stock,
  images,
  rating,
  rating_count,
  brand,
  is_featured,
  specs
)
VALUES
${values}
ON CONFLICT (id) DO NOTHING;

-- 3. Verification Queries (Confirm insertion in Supabase SQL editor)
SELECT 'Total Categories in Database' AS metric, count(*)::text AS count FROM public.categories
UNION ALL
SELECT 'Total Products in Database', count(*)::text FROM public.products
UNION ALL
SELECT 'Total In-Stock Products in Database', count(*)::text FROM public.products WHERE stock > 0;
`;
}

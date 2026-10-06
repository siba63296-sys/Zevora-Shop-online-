import { createClient } from '@supabase/supabase-js';

// Realistic fashion photo image pools for Girls / Women (Indian + Western)
const GIRLS_INDIAN_IMAGES = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80', // Saree
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80', // Lehenga
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80', // Kurti
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=700&auto=format&fit=crop&q=80', // Salwar
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&auto=format&fit=crop&q=80', // Anarkali
  'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=700&auto=format&fit=crop&q=80', // Silk
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&auto=format&fit=crop&q=80', // Party wear
];

const GIRLS_WESTERN_IMAGES = [
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=700&auto=format&fit=crop&q=80', // Fashion dress
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=700&auto=format&fit=crop&q=80', // Gown
  'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=700&auto=format&fit=crop&q=80', // Western
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&auto=format&fit=crop&q=80', // Summer dress
  'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=700&auto=format&fit=crop&q=80', // Cocktail
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700&auto=format&fit=crop&q=80', // Jeans
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&auto=format&fit=crop&q=80', // Co-ord
];

// Realistic fashion photo image pools for Boys / Men (Indian + Western)
const BOYS_INDIAN_IMAGES = [
  'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=700&auto=format&fit=crop&q=80', // Kurta
  'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=700&auto=format&fit=crop&q=80', // Nehru jacket
  'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=700&auto=format&fit=crop&q=80', // Sherwani
  'https://images.unsplash.com/photo-1583391733975-207d722d4f3b?w=700&auto=format&fit=crop&q=80', // Ethnic
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=700&auto=format&fit=crop&q=80', // Jodhpuri
];

const BOYS_WESTERN_IMAGES = [
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=80', // Shirt
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=80', // T-Shirt
  'https://images.unsplash.com/photo-1542272604-780c96856592?w=700&auto=format&fit=crop&q=80', // Jeans
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop&q=80', // Suit / Blazer
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&auto=format&fit=crop&q=80', // Hoodie
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=80', // Jacket
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=700&auto=format&fit=crop&q=80', // Casual wear
];

// 105 Distinct Girls / Women Dresses (Indian + Western)
export const GIRLS_DRESSES = [
  // Indian Traditional - Sarees
  { name: 'Kanjeevaram Pure Zari Silk Saree', style: 'Indian', type: 'Saree', brand: 'Kalamandir', price: 4499, mrp: 8999 },
  { name: 'Banarasi Brocade Silk Saree with Blouse', style: 'Indian', type: 'Saree', brand: 'FabIndia', price: 3499, mrp: 6999 },
  { name: 'Chanderi Handloom Woven Saree', style: 'Indian', type: 'Saree', brand: 'FabIndia', price: 2199, mrp: 4499 },
  { name: 'Royal Georgette Sequins Embroidered Saree', style: 'Indian', type: 'Saree', brand: 'Biba', price: 2799, mrp: 5499 },
  { name: 'Organza Floral Print Pastel Saree', style: 'Indian', type: 'Saree', brand: 'Meena Bazaar', price: 2499, mrp: 4999 },
  { name: 'Tussar Silk Traditional Festive Saree', style: 'Indian', type: 'Saree', brand: 'Nalli', price: 3899, mrp: 7499 },
  { name: 'Bandhani Bandhej Tie-Dye Silk Saree', style: 'Indian', type: 'Saree', brand: 'Global Desi', price: 1999, mrp: 3999 },
  { name: 'Paithani Zari Border Traditional Saree', style: 'Indian', type: 'Saree', brand: 'Kalamandir', price: 4999, mrp: 9999 },
  { name: 'Soft Linen Cotton Daily Wear Saree', style: 'Indian', type: 'Saree', brand: 'FabIndia', price: 1299, mrp: 2499 },
  { name: 'Ready-to-Wear Pleated Cocktail Saree', style: 'Indian', type: 'Saree', brand: 'W for Woman', price: 3299, mrp: 6599 },

  // Indian Traditional - Lehengas
  { name: 'Bridal Velvet Heavy Zardozi Embroidered Lehenga', style: 'Indian', type: 'Lehenga', brand: 'Manyavar Mohey', price: 8499, mrp: 16999 },
  { name: 'Floral Printed Organza Party Lehenga Choli', style: 'Indian', type: 'Lehenga', brand: 'Biba', price: 4999, mrp: 9999 },
  { name: 'Mirror Work Georgette Festive Lehenga Set', style: 'Indian', type: 'Lehenga', brand: 'Aurelia', price: 3999, mrp: 7999 },
  { name: 'Sequinned Net Flared Semi-Stitched Lehenga', style: 'Indian', type: 'Lehenga', brand: 'Biba', price: 4499, mrp: 8999 },
  { name: 'Pastel Chikankari Georgette Reception Lehenga', style: 'Indian', type: 'Lehenga', brand: 'Meena Bazaar', price: 5999, mrp: 11999 },
  { name: 'Art Silk Foil Print Festive Lehenga Choli', style: 'Indian', type: 'Lehenga', brand: 'Global Desi', price: 2999, mrp: 5999 },
  { name: 'Ruffle Tiered Contemporary Fusion Lehenga', style: 'Indian', type: 'Lehenga', brand: 'W for Woman', price: 3799, mrp: 7499 },
  { name: 'Banarasi Brocade Traditional Heritage Lehenga', style: 'Indian', type: 'Lehenga', brand: 'FabIndia', price: 5499, mrp: 10999 },

  // Indian Traditional - Salwar Suits & Anarkalis
  { name: 'Embroidered Silk Blend Anarkali Kurta Set', style: 'Indian', type: 'Anarkali', brand: 'Biba', price: 2999, mrp: 5999 },
  { name: 'Lucknowi Chikankari Pure Georgette Anarkali', style: 'Indian', type: 'Anarkali', brand: 'FabIndia', price: 3499, mrp: 6999 },
  { name: 'Gota Patti Chanderi Flared Anarkali Suit', style: 'Indian', type: 'Anarkali', brand: 'W for Woman', price: 3199, mrp: 6299 },
  { name: 'Chanderi Silk Straight Kurta with Dupatta Set', style: 'Indian', type: 'Salwar Suit', brand: 'Aurelia', price: 2299, mrp: 4599 },
  { name: 'Floral Print Georgette Sharara Suit Set', style: 'Indian', type: 'Salwar Suit', brand: 'Biba', price: 2799, mrp: 5499 },
  { name: 'Velvet Winter Festive Kurta with Embroidered Pants', style: 'Indian', type: 'Salwar Suit', brand: 'W for Woman', price: 3499, mrp: 6999 },
  { name: 'Pure Cotton Printed Daily Wear Salwar Suit', style: 'Indian', type: 'Salwar Suit', brand: 'FabIndia', price: 1499, mrp: 2999 },
  { name: 'Punjabi Patiala Suit Set with Phulkari Dupatta', style: 'Indian', type: 'Salwar Suit', brand: 'Biba', price: 2399, mrp: 4799 },
  { name: 'Flared Peplum Kurta with Gharara Bottoms', style: 'Indian', type: 'Salwar Suit', brand: 'Aurelia', price: 2899, mrp: 5799 },
  { name: 'Embroidered Chiffon A-Line Festive Suit', style: 'Indian', type: 'Salwar Suit', brand: 'Global Desi', price: 2599, mrp: 5199 },

  // Indian Traditional - Kurtis & Tunics
  { name: 'Handmade Lucknowi Chikankari Cotton Kurti', style: 'Indian', type: 'Kurti', brand: 'FabIndia', price: 1199, mrp: 2299 },
  { name: 'A-Line Flared Block Print Anarkali Kurti', style: 'Indian', type: 'Kurti', brand: 'Biba', price: 1499, mrp: 2999 },
  { name: 'Embroidered Rayon Straight Daily Kurti', style: 'Indian', type: 'Kurti', brand: 'Aurelia', price: 799, mrp: 1599 },
  { name: 'Denim Front-Slit Long Casual Kurti', style: 'Indian', type: 'Kurti', brand: 'Global Desi', price: 1299, mrp: 2599 },
  { name: 'Festive Jacquard Silk Knee-Length Kurti', style: 'Indian', type: 'Kurti', brand: 'W for Woman', price: 1699, mrp: 3399 },
  { name: 'Bandhani Print Flared Short Kurti Tunic', style: 'Indian', type: 'Kurti', brand: 'Biba', price: 999, mrp: 1999 },
  { name: 'Boho Tassel Cotton Embroidered Kurti', style: 'Indian', type: 'Kurti', brand: 'Global Desi', price: 1099, mrp: 2199 },
  { name: 'Kalamkari Handblock Print Khadi Kurti', style: 'Indian', type: 'Kurti', brand: 'FabIndia', price: 1399, mrp: 2799 },
  { name: 'Mandarin Collar Office Formal Kurti', style: 'Indian', type: 'Kurti', brand: 'W for Woman', price: 899, mrp: 1799 },
  { name: 'Layered Angrakha Style Festive Kurti', style: 'Indian', type: 'Kurti', brand: 'Aurelia', price: 1599, mrp: 3199 },

  // Western Fashion - Evening Gowns & Cocktail Dresses
  { name: 'Satin Silk Slit High-Neck Evening Gown', style: 'Western', type: 'Gown', brand: 'Vero Moda', price: 3499, mrp: 6999 },
  { name: 'Embroidered Off-Shoulder Tulle Ball Gown', style: 'Western', type: 'Gown', brand: 'Forever New', price: 4999, mrp: 9999 },
  { name: 'Velvet Bodycon Split Long Maxi Gown', style: 'Western', type: 'Gown', brand: 'Zara', price: 3999, mrp: 7999 },
  { name: 'Backless Mermaid Sequin Cocktail Gown', style: 'Western', type: 'Gown', brand: 'H&M', price: 4299, mrp: 8599 },
  { name: 'Pleated Chiffon Halter-Neck Prom Gown', style: 'Western', type: 'Gown', brand: 'Mango', price: 3799, mrp: 7599 },
  { name: 'One-Shoulder Ruched Party Cocktail Dress', style: 'Western', type: 'Western Dress', brand: 'Zara', price: 2499, mrp: 4999 },
  { name: 'Little Black Dress with Sweetheart Neckline', style: 'Western', type: 'Western Dress', brand: 'H&M', price: 1999, mrp: 3999 },
  { name: 'Satin Cowl Neck Sleeveless Slip Dress', style: 'Western', type: 'Western Dress', brand: 'Mango', price: 2199, mrp: 4399 },
  { name: 'Velvet Bodycon Long Sleeve Mini Dress', style: 'Western', type: 'Western Dress', brand: 'Vero Moda', price: 2299, mrp: 4599 },
  { name: 'Metallic Glitter Wrap Party Dress', style: 'Western', type: 'Western Dress', brand: 'Forever New', price: 2799, mrp: 5599 },

  // Western Fashion - Casual & Summer Dresses / Frocks
  { name: 'Tiered Cotton Eyelet Puff Sleeve Frock Dress', style: 'Western', type: 'Frock', brand: 'Zara', price: 2299, mrp: 4599 },
  { name: 'Floral Print Ruffle Bohemian Maxi Dress', style: 'Western', type: 'Western Dress', brand: 'Mango', price: 2699, mrp: 5399 },
  { name: 'Linen Button-Down Belted Shirt Dress', style: 'Western', type: 'Western Dress', brand: 'H&M', price: 1899, mrp: 3799 },
  { name: 'Ribbed Knit Bodycon Sleeveless Midi Dress', style: 'Western', type: 'Western Dress', brand: 'Vero Moda', price: 1499, mrp: 2999 },
  { name: 'Denim Pinafore A-Line Dungaree Dress', style: 'Western', type: 'Western Dress', brand: 'Levi\'s', price: 2499, mrp: 4999 },
  { name: 'Smocked Bodice Cottagecore Summer Dress', style: 'Western', type: 'Western Dress', brand: 'Forever New', price: 2399, mrp: 4799 },
  { name: 'Polka Dot Fit & Flare Retro Midi Dress', style: 'Western', type: 'Western Dress', brand: 'Marks & Spencer', price: 2599, mrp: 5199 },
  { name: 'Lace Overlay Vintage Tea Party Dress', style: 'Western', type: 'Western Dress', brand: 'Forever New', price: 2999, mrp: 5999 },
  { name: 'Chambray Cotton Casual Shirt Dress', style: 'Western', type: 'Western Dress', brand: 'H&M', price: 1699, mrp: 3399 },
  { name: 'Tiered Smocked Sundress with Adjustable Straps', style: 'Western', type: 'Frock', brand: 'Zara', price: 1999, mrp: 3999 },

  // Western Fashion - Co-ord Sets & Jumpsuits
  { name: 'Ribbed Knit Crop Top & Wide Leg Trousers Co-ord', style: 'Western', type: 'Co-ord Set', brand: 'Zara', price: 2499, mrp: 4999 },
  { name: 'Linen Blend Blazer & High-Waist Shorts Co-ord', style: 'Western', type: 'Co-ord Set', brand: 'Mango', price: 3499, mrp: 6999 },
  { name: 'Satin Floral Printed Shirt & Trouser Set', style: 'Western', type: 'Co-ord Set', brand: 'Vero Moda', price: 2799, mrp: 5599 },
  { name: 'Cotton Waffle Knit Sweatshirt & Joggers Set', style: 'Western', type: 'Co-ord Set', brand: 'H&M', price: 1999, mrp: 3999 },
  { name: 'Tailored Wide-Leg Sleeveless Belted Jumpsuit', style: 'Western', type: 'Jumpsuit', brand: 'Forever New', price: 3299, mrp: 6599 },
  { name: 'Casual Denim Utility Boiler Suit Jumpsuit', style: 'Western', type: 'Jumpsuit', brand: 'Levi\'s', price: 3699, mrp: 7399 },
  { name: 'Floral Halter Neck Crepe Evening Jumpsuit', style: 'Western', type: 'Jumpsuit', brand: 'Zara', price: 2899, mrp: 5799 },
  { name: 'Monochrome Striped Culotte Jumpsuit', style: 'Western', type: 'Jumpsuit', brand: 'Mango', price: 2499, mrp: 4999 },

  // Western Fashion - Tops, Shirts & Sweaters
  { name: 'Oversized Boyfriend Cotton Poplin Shirt', style: 'Western', type: 'Shirt', brand: 'Zara', price: 1599, mrp: 3199 },
  { name: 'Silk Satin Button-Up Office Blouse', style: 'Western', type: 'Shirt', brand: 'Mango', price: 1999, mrp: 3999 },
  { name: 'Cropped Cable Knit Crewneck Sweater', style: 'Western', type: 'Sweater', brand: 'H&M', price: 1799, mrp: 3599 },
  { name: 'Fleece Lined Relaxed Fit Graphic Hoodie', style: 'Western', type: 'Hoodie', brand: 'Zara', price: 1899, mrp: 3799 },
  { name: 'Chiffon Ruffle V-Neck Floral Peplum Top', style: 'Western', type: 'Top', brand: 'Forever New', price: 1299, mrp: 2599 },
  { name: 'Square Neck Ribbed Stretch Cotton Top', style: 'Western', type: 'Top', brand: 'Vero Moda', price: 799, mrp: 1599 },
  { name: 'Broderie Anglaise Cotton Puff Sleeve Top', style: 'Western', type: 'Top', brand: 'Zara', price: 1399, mrp: 2799 },
  { name: 'Classic Striped French Boatneck T-Shirt', style: 'Western', type: 'T-Shirt', brand: 'Marks & Spencer', price: 999, mrp: 1999 },

  // Western Fashion - Jeans, Pants & Skirts
  { name: 'High-Rise Wide-Leg Full-Length Jeans', style: 'Western', type: 'Jeans', brand: 'Levi\'s', price: 2799, mrp: 5599 },
  { name: 'Classic 501 Straight Fit Ankle Jeans', style: 'Western', type: 'Jeans', brand: 'Levi\'s', price: 2999, mrp: 5999 },
  { name: 'Mom Fit High-Waist Vintage Washed Jeans', style: 'Western', type: 'Jeans', brand: 'Zara', price: 2299, mrp: 4599 },
  { name: 'Skinny Fit Super Stretch Midnight Jeans', style: 'Western', type: 'Jeans', brand: 'H&M', price: 1799, mrp: 3599 },
  { name: 'Pleated Satin High-Waist Midi Skirt', style: 'Western', type: 'Skirt', brand: 'Mango', price: 1999, mrp: 3999 },
  { name: 'A-Line Button-Front Denim Mini Skirt', style: 'Western', type: 'Skirt', brand: 'Zara', price: 1499, mrp: 2999 },
  { name: 'Tailored High-Waist Wide-Leg Formal Trousers', style: 'Western', type: 'Trousers', brand: 'Vero Moda', price: 2199, mrp: 4399 },
  { name: 'Relaxed Parachute Cargo Pants with Drawstring', style: 'Western', type: 'Cargo', brand: 'H&M', price: 1899, mrp: 3799 },

  // Western Fashion - Jackets, Blazers & Outerwear
  { name: 'Faux Leather Asymmetrical Biker Jacket', style: 'Western', type: 'Jacket', brand: 'Zara', price: 3499, mrp: 6999 },
  { name: 'Oversized Distressed Denim Trucker Jacket', style: 'Western', type: 'Jacket', brand: 'Levi\'s', price: 2999, mrp: 5999 },
  { name: 'Double-Breasted Tailored Office Blazer', style: 'Western', type: 'Blazer', brand: 'Mango', price: 3999, mrp: 7999 },
  { name: 'Classic Double-Breasted Trench Coat', style: 'Western', type: 'Coat', brand: 'Marks & Spencer', price: 4999, mrp: 9999 },
  { name: 'Quilted Lightweight Puffer Winter Jacket', style: 'Western', type: 'Jacket', brand: 'H&M', price: 2799, mrp: 5599 },
  { name: 'Boucle Tweed Collarless Cropped Jacket', style: 'Western', type: 'Jacket', brand: 'Zara', price: 3299, mrp: 6599 },

  // Additional Special Fusion & Modern Styles (to reach 105 total)
  { name: 'Indo-Western Cape Style Embroidered Dress', style: 'Indian', type: 'Western Dress', brand: 'Global Desi', price: 2899, mrp: 5799 },
  { name: 'Draped Saree Gown with Pre-Stitched Pallu', style: 'Indian', type: 'Gown', brand: 'Biba', price: 4299, mrp: 8599 },
  { name: 'Kalamkari Print Tiered Boho Fusion Dress', style: 'Indian', type: 'Western Dress', brand: 'FabIndia', price: 2199, mrp: 4399 },
  { name: 'Brocade Peplum Top with Dhoti Pants Set', style: 'Indian', type: 'Co-ord Set', brand: 'Aurelia', price: 2699, mrp: 5399 },
  { name: 'Chanderi Shrug & Slip Dress Contemporary Set', style: 'Indian', type: 'Co-ord Set', brand: 'W for Woman', price: 3199, mrp: 6399 },
  { name: 'Modal Silk Flared A-Line Festive Gown', style: 'Indian', type: 'Gown', brand: 'Biba', price: 3499, mrp: 6999 },
  { name: 'Handcrafted Ajrakh Modal Maxi Dress', style: 'Indian', type: 'Western Dress', brand: 'FabIndia', price: 2599, mrp: 5199 },
  { name: 'Cutwork Embroidered Organza Summer Dress', style: 'Western', type: 'Western Dress', brand: 'Forever New', price: 3299, mrp: 6599 },
  { name: 'Velvet Slip Party Dress with Rhinestone Straps', style: 'Western', type: 'Western Dress', brand: 'Zara', price: 2699, mrp: 5399 },
  { name: 'Smocked Off-Shoulder Gingham Frock Dress', style: 'Western', type: 'Frock', brand: 'Mango', price: 1899, mrp: 3799 },
  { name: 'Linen Buttoned Midi Sundress in Olive', style: 'Western', type: 'Western Dress', brand: 'H&M', price: 2199, mrp: 4399 },
  { name: 'Chiffon Pleated Fit & Flare Cocktail Dress', style: 'Western', type: 'Western Dress', brand: 'Vero Moda', price: 2399, mrp: 4799 },
  { name: 'Tiered Cotton Broderie Midi Sun Dress', style: 'Western', type: 'Western Dress', brand: 'Zara', price: 2499, mrp: 4999 },
  { name: 'High-Neck Pleated Metallic Party Gown', style: 'Western', type: 'Gown', brand: 'Mango', price: 3999, mrp: 7999 },
  { name: 'Sweetheart Neck Velvet Mini Skater Dress', style: 'Western', type: 'Western Dress', brand: 'Forever New', price: 2499, mrp: 4999 },
  { name: 'Cotton Poplin Tiered Ruffle Smock Frock', style: 'Western', type: 'Frock', brand: 'H&M', price: 1699, mrp: 3399 },
  { name: 'Satin Drape One-Shoulder Formal Gown', style: 'Western', type: 'Gown', brand: 'Zara', price: 3699, mrp: 7399 },
  { name: 'Crochet Knit Fringe Hem Summer Tunic Dress', style: 'Western', type: 'Western Dress', brand: 'Mango', price: 2299, mrp: 4599 },
  { name: 'Embroidered Mirror Georgette Kurti with Pants', style: 'Indian', type: 'Salwar Suit', brand: 'Aurelia', price: 2499, mrp: 4999 },
  { name: 'Jacquard Silk Festival Kurti & Dupatta Set', style: 'Indian', type: 'Salwar Suit', brand: 'W for Woman', price: 2799, mrp: 5599 },
  { name: 'Classic Chanderi Anarkali Suit with Zari Border', style: 'Indian', type: 'Anarkali', brand: 'FabIndia', price: 3299, mrp: 6599 },
];

// 105 Distinct Boys / Men Dresses (Indian + Western)
export const BOYS_DRESSES = [
  // Indian Traditional - Kurta Sets & Sherwanis
  { name: 'Royal Jodhpuri Bandhgala Suit Set', style: 'Indian', type: 'Suit', brand: 'Manyavar', price: 5999, mrp: 11999 },
  { name: 'Festive Embroidered Raw Silk Sherwani Ensemble', style: 'Indian', type: 'Sherwani', brand: 'Manyavar', price: 7999, mrp: 15999 },
  { name: 'Pure Dupion Silk Kurta Pajama with Stole', style: 'Indian', type: 'Kurta Set', brand: 'Manyavar', price: 2999, mrp: 5999 },
  { name: 'Jacquard Woven Nehru Jacket with Kurta Set', style: 'Indian', type: 'Kurta Set', brand: 'FabIndia', price: 3499, mrp: 6999 },
  { name: 'Lucknowi Chikankari Hand-Embroidered Kurta', style: 'Indian', type: 'Kurta', brand: 'FabIndia', price: 1999, mrp: 3999 },
  { name: 'Traditional Pathani Kurta Salwar Suit Set', style: 'Indian', type: 'Kurta Set', brand: 'Manyavar', price: 2499, mrp: 4999 },
  { name: 'Mandarin Collar Pure Linen Short Kurta', style: 'Indian', type: 'Kurta', brand: 'FabIndia', price: 1499, mrp: 2999 },
  { name: 'Embroidered Floral Modi Nehru Jacket', style: 'Indian', type: 'Nehru Jacket', brand: 'Raymond', price: 2299, mrp: 4599 },
  { name: 'Tussar Silk Festive Kurta with Churidar', style: 'Indian', type: 'Kurta Set', brand: 'Manyavar', price: 2799, mrp: 5599 },
  { name: 'Dhoti Kurta Set with Zari Border for Weddings', style: 'Indian', type: 'Kurta Set', brand: 'Kalamandir', price: 2899, mrp: 5799 },
  { name: 'Printed Cotton Casual Everyday Short Kurta', style: 'Indian', type: 'Kurta', brand: 'FabIndia', price: 999, mrp: 1999 },
  { name: 'Velvet Embroidered Achkan Wedding Coat', style: 'Indian', type: 'Sherwani', brand: 'Manyavar', price: 6999, mrp: 13999 },
  { name: 'Bandhani Print Festive Silk Kurta', style: 'Indian', type: 'Kurta', brand: 'FabIndia', price: 1699, mrp: 3399 },
  { name: 'Angrakha Style Traditional Overlap Kurta Set', style: 'Indian', type: 'Kurta Set', brand: 'Manyavar', price: 3199, mrp: 6399 },
  { name: 'Brocade Silk Indo-Western Asymmetric Kurta', style: 'Indian', type: 'Kurta', brand: 'Raymond', price: 2499, mrp: 4999 },

  // Western Fashion - Formal Suits & Blazers
  { name: 'Super 120s Pure Wool Slim Fit Two-Piece Suit', style: 'Western', type: 'Suit', brand: 'Raymond', price: 6999, mrp: 13999 },
  { name: 'Classic Navy Double-Breasted Formal Blazer', style: 'Western', type: 'Blazer', brand: 'Louis Philippe', price: 4499, mrp: 8999 },
  { name: 'Textured Tweed Winter Single-Breasted Blazer', style: 'Western', type: 'Blazer', brand: 'Zara', price: 4999, mrp: 9999 },
  { name: 'Slim Fit Black Tie Tuxedo Suit with Satin Lapel', style: 'Western', type: 'Suit', brand: 'Raymond', price: 7499, mrp: 14999 },
  { name: 'Lightweight Linen Summer Unstructured Blazer', style: 'Western', type: 'Blazer', brand: 'Zara', price: 3899, mrp: 7799 },
  { name: 'Houndstooth Check Casual Smart Blazer', style: 'Western', type: 'Blazer', brand: 'Peter England', price: 3299, mrp: 6599 },
  { name: 'Velvet Midnight Evening Party Blazer', style: 'Western', type: 'Blazer', brand: 'Zara', price: 4299, mrp: 8599 },
  { name: 'Tailored Stretch Poly-Viscose Formal Suit', style: 'Western', type: 'Suit', brand: 'Allen Solly', price: 5499, mrp: 10999 },

  // Western Fashion - Shirts (Formal & Casual)
  { name: 'Premium Egyptian Cotton Oxford Formal Shirt', style: 'Western', type: 'Shirt', brand: 'Louis Philippe', price: 1899, mrp: 3799 },
  { name: '100% Pure French Linen Casual Shirt', style: 'Western', type: 'Shirt', brand: 'Zara', price: 2199, mrp: 4399 },
  { name: 'Slim Fit Wrinkle-Free Executive Dress Shirt', style: 'Western', type: 'Shirt', brand: 'Van Heusen', price: 1599, mrp: 3199 },
  { name: 'Heavyweight Flannel Buffalo Plaid Work Shirt', style: 'Western', type: 'Shirt', brand: 'Levi\'s', price: 2299, mrp: 4599 },
  { name: 'Denim Western Snap-Button Trucker Shirt', style: 'Western', type: 'Shirt', brand: 'Levi\'s', price: 2399, mrp: 4799 },
  { name: 'Resort Collar Printed Hawaiian Vacation Shirt', style: 'Western', type: 'Shirt', brand: 'Zara', price: 1499, mrp: 2999 },
  { name: 'Classic White Poplin Spread Collar Shirt', style: 'Western', type: 'Shirt', brand: 'Peter England', price: 1199, mrp: 2399 },
  { name: 'Striped Cotton Button-Down Oxford Shirt', style: 'Western', type: 'Shirt', brand: 'Tommy Hilfiger', price: 2499, mrp: 4999 },
  { name: 'Corduroy Long Sleeve Casual Overshirt', style: 'Western', type: 'Shirt', brand: 'H&M', price: 1999, mrp: 3999 },
  { name: 'Mandarin Band Collar Soft Twill Casual Shirt', style: 'Western', type: 'Shirt', brand: 'Allen Solly', price: 1399, mrp: 2799 },

  // Western Fashion - T-Shirts & Polos
  { name: '280 GSM Heavyweight Oversized Drop-Shoulder Tee', style: 'Western', type: 'T-Shirt', brand: 'Zara', price: 1199, mrp: 2399 },
  { name: 'Mercerised Cotton Pique Classic Polo Shirt', style: 'Western', type: 'Polo', brand: 'Lacoste', price: 2499, mrp: 4999 },
  { name: 'Supima Cotton Crewneck Essential T-Shirt', style: 'Western', type: 'T-Shirt', brand: 'Uniqlo', price: 899, mrp: 1799 },
  { name: 'Vintage Acid Wash Retro Graphic T-Shirt', style: 'Western', type: 'T-Shirt', brand: 'H&M', price: 999, mrp: 1999 },
  { name: 'Striped Knitted Cotton Short Sleeve Polo', style: 'Western', type: 'Polo', brand: 'Zara', price: 1699, mrp: 3399 },
  { name: 'Waffle Knit Thermal Long Sleeve T-Shirt', style: 'Western', type: 'T-Shirt', brand: 'H&M', price: 1299, mrp: 2599 },
  { name: 'Streetwear Boxy Fit Minimalist Typography Tee', style: 'Western', type: 'T-Shirt', brand: 'Roadster', price: 699, mrp: 1399 },
  { name: 'Performance Quick-Dry Athletic Gym T-Shirt', style: 'Western', type: 'T-Shirt', brand: 'Nike', price: 1499, mrp: 2999 },
  { name: 'Classic Henley Neck Long Sleeve Cotton Tee', style: 'Western', type: 'T-Shirt', brand: 'Levi\'s', price: 1399, mrp: 2799 },

  // Western Fashion - Hoodies, Sweatshirts & Sweaters
  { name: 'Heavyweight French Terry Pullover Hoodie', style: 'Western', type: 'Hoodie', brand: 'Zara', price: 2299, mrp: 4599 },
  { name: 'Full-Zip Fleece Winter Lined Hoodie', style: 'Western', type: 'Hoodie', brand: 'Nike', price: 2799, mrp: 5599 },
  { name: 'Crewneck Embroidered Monogram Sweatshirt', style: 'Western', type: 'Sweatshirt', brand: 'Tommy Hilfiger', price: 2999, mrp: 5999 },
  { name: 'Merino Wool V-Neck Formal Office Sweater', style: 'Western', type: 'Sweater', brand: 'Marks & Spencer', price: 2499, mrp: 4999 },
  { name: 'Chunky Cable Knit Fisherman Turtleneck Sweater', style: 'Western', type: 'Sweater', brand: 'H&M', price: 2199, mrp: 4399 },
  { name: 'Quarter-Zip Knit Cotton Casual Pullover', style: 'Western', type: 'Sweater', brand: 'Louis Philippe', price: 2299, mrp: 4599 },
  { name: 'Varsity Colorblock Chenille Patch Sweatshirt', style: 'Western', type: 'Sweatshirt', brand: 'Roadster', price: 1499, mrp: 2999 },

  // Western Fashion - Jackets & Outerwear
  { name: 'Genuine Lambskin Leather Biker Jacket', style: 'Western', type: 'Jacket', brand: 'Zara', price: 6499, mrp: 12999 },
  { name: 'Classic Sherpa Lined Denim Trucker Jacket', style: 'Western', type: 'Jacket', brand: 'Levi\'s', price: 3999, mrp: 7999 },
  { name: 'Water-Resistant Down Puffer Winter Jacket', style: 'Western', type: 'Jacket', brand: 'Uniqlo', price: 3499, mrp: 6999 },
  { name: 'Wool Blend Double-Breasted Long Overcoat', style: 'Western', type: 'Coat', brand: 'Zara', price: 5499, mrp: 10999 },
  { name: 'Sateen MA-1 Flight Bomber Jacket', style: 'Western', type: 'Jacket', brand: 'H&M', price: 2499, mrp: 4999 },
  { name: 'Corduroy Collar Waxed Canvas Field Jacket', style: 'Western', type: 'Jacket', brand: 'Levi\'s', price: 4299, mrp: 8599 },
  { name: 'Lightweight Packable Windbreaker Jacket', style: 'Western', type: 'Jacket', brand: 'Nike', price: 2199, mrp: 4399 },
  { name: 'Suede Finish Trucker Jacket in Tan Brown', style: 'Western', type: 'Jacket', brand: 'Zara', price: 3699, mrp: 7399 },

  // Western Fashion - Jeans, Cargos & Trousers
  { name: 'Levi\'s 511 Slim Fit Stretch Dark Indigo Jeans', style: 'Western', type: 'Jeans', brand: 'Levi\'s', price: 2699, mrp: 5399 },
  { name: 'Raw Selvedge Denim Straight Cut Heavyweight Jeans', style: 'Western', type: 'Jeans', brand: 'Levi\'s', price: 3999, mrp: 7999 },
  { name: 'Loose Fit 90s Vintage Light Blue Baggy Jeans', style: 'Western', type: 'Jeans', brand: 'Zara', price: 2499, mrp: 4999 },
  { name: 'Tapered Fit Ripped Distressed Black Jeans', style: 'Western', type: 'Jeans', brand: 'H&M', price: 1999, mrp: 3999 },
  { name: 'Multi-Pocket Tactical Utility Cargo Pants', style: 'Western', type: 'Cargo', brand: 'Zara', price: 2299, mrp: 4599 },
  { name: 'Relaxed Fit Cotton Ripstop Parachute Cargos', style: 'Western', type: 'Cargo', brand: 'H&M', price: 1899, mrp: 3799 },
  { name: 'Slim Fit Stretch Cotton Chino Trousers', style: 'Western', type: 'Chino', brand: 'Tommy Hilfiger', price: 2399, mrp: 4799 },
  { name: 'Pleated Formal Flat Front Office Trousers', style: 'Western', type: 'Trousers', brand: 'Raymond', price: 1799, mrp: 3599 },
  { name: 'Heavyweight Loopback Cotton Sweatpants Joggers', style: 'Western', type: 'Joggers', brand: 'Nike', price: 1699, mrp: 3399 },
  { name: 'Linen Blend Drawstring Easy Summer Trousers', style: 'Western', type: 'Trousers', brand: 'Zara', price: 1999, mrp: 3999 },

  // Co-ords, Activewear & Streetwear
  { name: 'Streetwear Acid Wash T-Shirt & Cargo Shorts Co-ord', style: 'Western', type: 'Co-ord Set', brand: 'Zara', price: 2299, mrp: 4599 },
  { name: 'Fleece Hoodie & Matching Joggers Tracksuit Set', style: 'Western', type: 'Co-ord Set', brand: 'Nike', price: 3799, mrp: 7599 },
  { name: 'Textured Resort Shirt & Chino Shorts Vacation Set', style: 'Western', type: 'Co-ord Set', brand: 'H&M', price: 2199, mrp: 4399 },
  { name: 'Waffle Knit Oversized Tee & Shorts Lounge Set', style: 'Western', type: 'Co-ord Set', brand: 'Roadster', price: 1499, mrp: 2999 },

  // Additional Special Styles (to reach 105 total)
  { name: 'Brocade Silk Men\'s Wedding Kurta Churidar Set', style: 'Indian', type: 'Kurta Set', brand: 'Manyavar', price: 3299, mrp: 6599 },
  { name: 'Embroidered Mirror Work Silk Kurta for Diwali', style: 'Indian', type: 'Kurta', brand: 'FabIndia', price: 2199, mrp: 4399 },
  { name: 'South Silk Mundu & Zari Shirt Traditional Set', style: 'Indian', type: 'Traditional', brand: 'Ramraj', price: 1799, mrp: 3599 },
  { name: 'Cotton Khadi Asymmetric Draped Men\'s Kurta', style: 'Indian', type: 'Kurta', brand: 'FabIndia', price: 1499, mrp: 2999 },
  { name: 'Linen Embroidered Formal Bandhgala Waistcoat', style: 'Indian', type: 'Nehru Jacket', brand: 'Raymond', price: 2499, mrp: 4999 },
  { name: 'Satin Silk Festive Kurta with Golden Embroidery', style: 'Indian', type: 'Kurta', brand: 'Manyavar', price: 2699, mrp: 5399 },
  { name: 'Raw Silk Wedding Sherwani with Royal Buttons', style: 'Indian', type: 'Sherwani', brand: 'Manyavar', price: 8999, mrp: 17999 },
  { name: 'Indigo Dabu Print Handloom Men\'s Shirt', style: 'Indian', type: 'Shirt', brand: 'FabIndia', price: 1299, mrp: 2599 },
  { name: 'Kalamkari Handblock Print Summer Men\'s Shirt', style: 'Indian', type: 'Shirt', brand: 'FabIndia', price: 1399, mrp: 2799 },
  { name: 'Textured Knitted Button-Up Polo Cardigan', style: 'Western', type: 'Polo', brand: 'Zara', price: 2299, mrp: 4599 },
  { name: 'Double-Pocket Military Utility Overshirt', style: 'Western', type: 'Shirt', brand: 'Levi\'s', price: 2599, mrp: 5199 },
  { name: 'Fleece-Lined Sherpa Zip Casual Jacket', style: 'Western', type: 'Jacket', brand: 'H&M', price: 2499, mrp: 4999 },
  { name: 'Retro Colorblocked Track Jacket in White & Navy', style: 'Western', type: 'Jacket', brand: 'Nike', price: 2799, mrp: 5599 },
  { name: 'Relaxed Fit Carpenter Denim Utility Pants', style: 'Western', type: 'Jeans', brand: 'Levi\'s', price: 2899, mrp: 5799 },
  { name: 'Wide-Leg Pleated Tailored Wool Trousers', style: 'Western', type: 'Trousers', brand: 'Zara', price: 2799, mrp: 5599 },
  { name: 'Organic Cotton Breton Striped Crewneck Tee', style: 'Western', type: 'T-Shirt', brand: 'Marks & Spencer', price: 1099, mrp: 2199 },
  { name: 'Heavy Cotton Washed Vintage Muscle Tank Top', style: 'Western', type: 'T-Shirt', brand: 'H&M', price: 799, mrp: 1599 },
  { name: 'Classic Harrington Lightweight Jacket', style: 'Western', type: 'Jacket', brand: 'Tommy Hilfiger', price: 3499, mrp: 6999 },
  { name: 'Checked Brushed Cotton Flannel Winter Shirt', style: 'Western', type: 'Shirt', brand: 'Uniqlo', price: 1899, mrp: 3799 },
  { name: 'Smart Casual Slim Fit Stretch Formal Blazer', style: 'Western', type: 'Blazer', brand: 'Van Heusen', price: 3999, mrp: 7999 },
  { name: 'Padded Diamond Quilted Winter Gilet Vest', style: 'Western', type: 'Jacket', brand: 'Zara', price: 2399, mrp: 4799 },
  { name: 'Pure Mulberry Silk Festive Kurta with Zari Work', style: 'Indian', type: 'Kurta', brand: 'Manyavar', price: 3499, mrp: 6999 },
  { name: 'Embroidered Velvet Sherwani Stole & Kurta Set', style: 'Indian', type: 'Sherwani', brand: 'Manyavar', price: 8499, mrp: 16999 },
  { name: 'Cotton Silk Dhoti Kurta Traditional Wedding Ensemble', style: 'Indian', type: 'Traditional', brand: 'Ramraj', price: 2499, mrp: 4999 },
  { name: 'Bandhgala Embroidered Silk Nehru Waistcoat', style: 'Indian', type: 'Nehru Jacket', brand: 'FabIndia', price: 2799, mrp: 5599 },
  { name: 'Khadi Cotton Short Summer Kurta Shirt', style: 'Indian', type: 'Kurta', brand: 'FabIndia', price: 1199, mrp: 2399 },
  { name: 'Classic Double-Breasted Wool Camel Trench Overcoat', style: 'Western', type: 'Coat', brand: 'Zara', price: 5999, mrp: 11999 },
  { name: 'Relaxed Fit Techwear Multi-Zip Tactical Cargo Pants', style: 'Western', type: 'Cargo', brand: 'Zara', price: 2499, mrp: 4999 },
  { name: 'Heavyweight Loopback French Terry Graphic Skater Hoodie', style: 'Western', type: 'Hoodie', brand: 'H&M', price: 2199, mrp: 4399 },
  { name: 'Japanese Selvedge Denim Straight Fit Raw Jeans', style: 'Western', type: 'Jeans', brand: 'Levi\'s', price: 4499, mrp: 8999 },
  { name: 'Striped Camp Collar Cuban Vacation Silk Shirt', style: 'Western', type: 'Shirt', brand: 'Zara', price: 1799, mrp: 3599 },
  { name: 'Cable Knit Wool Blend Preppy V-Neck Sweater Vest', style: 'Western', type: 'Sweater', brand: 'Marks & Spencer', price: 1999, mrp: 3999 },
  { name: 'Slim Fit Tailored Stretch Tuxedo Dress Trousers', style: 'Western', type: 'Trousers', brand: 'Raymond', price: 2299, mrp: 4599 },
  { name: 'Vintage Washed Corduroy Button-Down Overshirt', style: 'Western', type: 'Shirt', brand: 'Levi\'s', price: 2699, mrp: 5399 },
  { name: 'Varsity Wool Bomber Jacket with Faux Leather Sleeves', style: 'Western', type: 'Jacket', brand: 'Tommy Hilfiger', price: 4799, mrp: 9599 },
  { name: 'Premium Heavy Cotton Relaxed Fit Pocket Tee in Olive', style: 'Western', type: 'T-Shirt', brand: 'Uniqlo', price: 999, mrp: 1999 },
];

export async function runDressesSeed() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ijpbacailliwtthsjuqs.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to seed database.');
  }

  const supabase = createClient(
    supabaseUrl.includes('your-project') || !supabaseUrl.includes('.supabase.co')
      ? 'https://ijpbacailliwtthsjuqs.supabase.co'
      : supabaseUrl,
    supabaseKey
  );

  console.log('Resolving categories from Supabase...');
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError || !categories) {
    throw new Error('Failed to query categories: ' + catError?.message);
  }

  const girlsCat = categories.find((c) => c.slug === 'girls-collection' || c.name.toLowerCase() === 'girls collection');
  const fashionCat = categories.find((c) => c.slug === 'fashion' || c.name.toLowerCase() === 'fashion');

  if (!girlsCat) {
    throw new Error('Girls Collection category not found in Supabase!');
  }
  if (!fashionCat) {
    throw new Error('Fashion category not found in Supabase!');
  }

  console.log(`Found categories: Girls Collection (${girlsCat.id}), Fashion (${fashionCat.id})`);

  // Build 105 Girls Dresses
  const girlsProducts = GIRLS_DRESSES.map((item, idx) => {
    const i = idx + 1;
    const uuid = `d1000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
    const isIndian = item.style === 'Indian';
    const primaryImg = isIndian
      ? GIRLS_INDIAN_IMAGES[idx % GIRLS_INDIAN_IMAGES.length]
      : GIRLS_WESTERN_IMAGES[idx % GIRLS_WESTERN_IMAGES.length];
    const secondaryImg = isIndian
      ? GIRLS_INDIAN_IMAGES[(idx + 1) % GIRLS_INDIAN_IMAGES.length]
      : GIRLS_WESTERN_IMAGES[(idx + 1) % GIRLS_WESTERN_IMAGES.length];
    const thirdImg = isIndian
      ? GIRLS_WESTERN_IMAGES[idx % GIRLS_WESTERN_IMAGES.length]
      : GIRLS_INDIAN_IMAGES[idx % GIRLS_INDIAN_IMAGES.length];

    const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
    const stock = 20 + ((idx * 7) % 65); // Stock always between 20 and 85 (> 0)
    const rating = Number((4.1 + ((idx * 3) % 9) * 0.1).toFixed(1));
    const ratingCount = 40 + ((idx * 17) % 600);

    return {
      id: uuid,
      name: item.name,
      description: `${item.name} crafted with premium quality fabric for women. Perfect for ${
        isIndian ? 'festivals, weddings, and traditional celebrations' : 'parties, casual outings, and modern styling'
      }. Features elegant finishing, breathable fit, and designer appeal.`,
      price: item.price,
      mrp: item.mrp,
      discount_percent: discount,
      stock: stock,
      category_id: girlsCat.id,
      images: [primaryImg, secondaryImg, thirdImg],
      rating: rating,
      rating_count: ratingCount,
      brand: item.brand,
      is_featured: idx % 10 === 0,
      specs: {
        Style: item.style,
        Type: item.type,
        Fabric: isIndian ? 'Silk / Georgette / Cotton Blend' : 'Cotton / Satin / Linen Blend',
        Occasion: isIndian ? 'Festive & Party' : 'Casual & Evening',
        WashCare: 'Dry Clean or Gentle Machine Wash',
      },
    };
  });

  // Build 105 Boys Dresses
  const boysProducts = BOYS_DRESSES.map((item, idx) => {
    const i = idx + 1;
    const uuid = `d2000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
    const isIndian = item.style === 'Indian';
    const primaryImg = isIndian
      ? BOYS_INDIAN_IMAGES[idx % BOYS_INDIAN_IMAGES.length]
      : BOYS_WESTERN_IMAGES[idx % BOYS_WESTERN_IMAGES.length];
    const secondaryImg = isIndian
      ? BOYS_INDIAN_IMAGES[(idx + 1) % BOYS_INDIAN_IMAGES.length]
      : BOYS_WESTERN_IMAGES[(idx + 1) % BOYS_WESTERN_IMAGES.length];
    const thirdImg = isIndian
      ? BOYS_WESTERN_IMAGES[idx % BOYS_WESTERN_IMAGES.length]
      : BOYS_INDIAN_IMAGES[idx % BOYS_INDIAN_IMAGES.length];

    const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
    const stock = 25 + ((idx * 5) % 60); // Stock always between 25 and 85 (> 0)
    const rating = Number((4.2 + ((idx * 2) % 8) * 0.1).toFixed(1));
    const ratingCount = 50 + ((idx * 23) % 750);

    return {
      id: uuid,
      name: item.name,
      description: `${item.name} designed with premium tailoring for men. High durability, exceptional comfort, and tailored fit for ${
        isIndian ? 'wedding festivities, cultural ceremonies, and pooja' : 'everyday luxury, office, and smart casual occasions'
      }.`,
      price: item.price,
      mrp: item.mrp,
      discount_percent: discount,
      stock: stock,
      category_id: fashionCat.id,
      images: [primaryImg, secondaryImg, thirdImg],
      rating: rating,
      rating_count: ratingCount,
      brand: item.brand,
      is_featured: idx % 10 === 0,
      specs: {
        Style: item.style,
        Type: item.type,
        Fabric: isIndian ? 'Pure Silk / Linen / Jacquard' : '100% Cotton / Denim / Wool Blend',
        Occasion: isIndian ? 'Traditional & Festive' : 'Casual, Work & Streetwear',
        Fit: 'Regular / Slim Contemporary Fit',
      },
    };
  });

  console.log(`Generated ${girlsProducts.length} Girls dresses and ${boysProducts.length} Boys dresses. Total: ${girlsProducts.length + boysProducts.length}`);

  // Insert Girls Products in batches of 25 with upsert
  console.log('Inserting Girls products into "Girls Collection"...');
  for (let i = 0; i < girlsProducts.length; i += 25) {
    const batch = girlsProducts.slice(i, i + 25);
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id' });
    if (error) {
      throw new Error(`Girls batch insert error at offset ${i}: ${error.message}`);
    }
  }
  console.log('Girls products inserted successfully.');

  // Insert Boys Products in batches of 25 with upsert
  console.log('Inserting Boys products into "Fashion"...');
  for (let i = 0; i < boysProducts.length; i += 25) {
    const batch = boysProducts.slice(i, i + 25);
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id' });
    if (error) {
      throw new Error(`Boys batch insert error at offset ${i}: ${error.message}`);
    }
  }
  console.log('Boys products inserted successfully.');

  // Verification
  console.log('\n--- VERIFICATION ---');
  const { count: finalGirlsCount, error: vGirlsErr } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', girlsCat.id);

  const { count: finalFashionCount, error: vFashionErr } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', fashionCat.id);

  const { count: totalProds, error: vTotalErr } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: zeroStockCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .lte('stock', 0);

  console.log(`Total Products in Supabase: ${totalProds}`);
  console.log(`Girls Collection products count: ${finalGirlsCount} (should be >= 105)`);
  console.log(`Fashion (Boys) products count: ${finalFashionCount} (should be >= 105)`);
  console.log(`Products with stock <= 0: ${zeroStockCount || 0} (MUST be 0)`);

  return {
    success: true,
    girlsAdded: girlsProducts.length,
    boysAdded: boysProducts.length,
    totalProds,
    finalGirlsCount,
    finalFashionCount,
  };
}

if (process.argv[1]?.endsWith('seedDemoDresses.ts')) {
  runDressesSeed()
    .then((res) => {
      console.log('Done successfully!', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal error during seed:', err);
      process.exit(1);
    });
}

import { Product, ProductReview } from '../types';

// Curated authentic Indian reviewer names
const REVIEWER_NAMES = [
  'Rahul Sharma',
  'Priya Sengupta',
  'Vikram Joshi',
  'Sneha Rao',
  'Ananya Patel',
  'Amit Verma',
  'Pooja Malhotra',
  'Harish Nair',
  'Simran Kaur',
  'Tanmay Das',
  'Neha Gupta',
  'Rohan Kulkarni',
  'Divya Iyer',
  'Arjun Mehta',
  'Kavita Deshmukh',
  'Siddharth Roy',
  'Meera Menon',
  'Aditya Chawla',
  'Shalini Pandey',
  'Gaurav Bhatia',
];

// Simple deterministic hash code generator from string
function stringHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate unique, product-specific review templates based on product category & attributes
export function generateUniqueReviewsForProduct(product: Product): ProductReview[] {
  const hash = stringHashCode(product.id || product.name);
  const name = product.name;
  const cat = (product.category_name || '').toLowerCase();
  const catId = product.category_id || '';

  // Determine review count (2 to 4 reviews per product)
  const count = 2 + (hash % 3);
  const reviews: ProductReview[] = [];

  // Tailored review generation based on category
  if (cat.includes('mobile') || catId.includes('mobile')) {
    const templates = [
      {
        title: `Impressive battery backup and display on the ${name}`,
        comment: `Bought this ${name} last month. The battery comfortably lasts over a full day of heavy gaming and video streaming. Display is bright and vivid outdoors.`,
        rating: 5,
        daysAgo: 12 + (hash % 15),
      },
      {
        title: 'Camera quality and UI smoothness are top tier',
        comment: `Portraits and low-light photos come out crisp and detailed. Apps switch seamlessly with zero lag. Very happy with the purchase.`,
        rating: 4,
        daysAgo: 25 + (hash % 20),
      },
      {
        title: 'Fast charging is a lifesaver',
        comment: `Charges from 15% to 85% in about 25 minutes. Hand feel and ergonomics are very comfortable during long phone calls.`,
        rating: 5,
        daysAgo: 40 + (hash % 30),
      },
      {
        title: 'Solid build and reliable network reception',
        comment: `5G speeds are consistent even in basement parking. Sound quality from the stereo speakers is loud and clear.`,
        rating: 4,
        daysAgo: 60 + (hash % 40),
      },
    ];
    reviews.push(...buildReviewsFromTemplates(product.id, templates.slice(0, count), hash));
  } else if (cat.includes('laptop') || catId.includes('laptop')) {
    const templates = [
      {
        title: `Exceptional performance and thermals on the ${name}`,
        comment: `Handles software development, multi-tab browsing, and video rendering effortlessly. Keyboard travel is tactile and whisper quiet.`,
        rating: 5,
        daysAgo: 10 + (hash % 14),
      },
      {
        title: 'Crisp display and solid all-day battery',
        comment: `The anti-glare screen is easy on the eyes during 8+ hour work sessions. Build quality is robust yet lightweight enough for daily commute.`,
        rating: 4,
        daysAgo: 22 + (hash % 25),
      },
      {
        title: 'Great value for money workstation',
        comment: `Boot time is under 5 seconds. Speakers are loud with decent bass and webcam clarity is great for client Zoom meetings.`,
        rating: 5,
        daysAgo: 45 + (hash % 30),
      },
    ];
    reviews.push(...buildReviewsFromTemplates(product.id, templates.slice(0, count), hash));
  } else if (cat.includes('electronic') || cat.includes('audio') || cat.includes('headphone') || catId.includes('electronic')) {
    const templates = [
      {
        title: `Crystal clear sound & deep bass with the ${name}`,
        comment: `Active noise cancellation shuts out background traffic and office chatter completely. Vocal clarity on phone calls is top notch.`,
        rating: 5,
        daysAgo: 8 + (hash % 16),
      },
      {
        title: 'Comfortable fit for long listening sessions',
        comment: `Ear cushions are soft and breathe well. Battery life easily exceeded my expectations—only need to charge it once a week!`,
        rating: 4,
        daysAgo: 20 + (hash % 22),
      },
      {
        title: 'Seamless Bluetooth connectivity and punchy audio',
        comment: `Pairs instantly when opened. Low latency mode works great for gaming without noticeable audio lag.`,
        rating: 5,
        daysAgo: 38 + (hash % 28),
      },
    ];
    reviews.push(...buildReviewsFromTemplates(product.id, templates.slice(0, count), hash));
  } else if (cat.includes('jewel') || catId.includes('jewel')) {
    const templates = [
      {
        title: `Exquisite craftsmanship on the ${name}`,
        comment: `Wore this to a family wedding and received endless compliments! The stone setting and finish look genuinely royal and luxurious.`,
        rating: 5,
        daysAgo: 9 + (hash % 12),
      },
      {
        title: 'Sparkles beautifully and very comfortable to wear',
        comment: `Lightweight on the skin without any irritation. Packaging was beautiful and secure. Exactly as shown in the product pictures.`,
        rating: 5,
        daysAgo: 24 + (hash % 18),
      },
      {
        title: 'Great gift choice with premium gold polish',
        comment: `Bought this as a gift for my sister and she absolutely loved it. The clasp is sturdy and the detailing is immaculate.`,
        rating: 4,
        daysAgo: 42 + (hash % 30),
      },
    ];
    reviews.push(...buildReviewsFromTemplates(product.id, templates.slice(0, count), hash));
  } else if (cat.includes('shoes') || cat.includes('footwear') || catId.includes('footwear')) {
    const templates = [
      {
        title: `Superb arch support and cushion on ${name}`,
        comment: `Ran a 5K race in these right out of the box with zero blisters. The sole cushioning absorbs shocks and gives great energy return.`,
        rating: 5,
        daysAgo: 11 + (hash % 15),
      },
      {
        title: 'Durable grip and true to size fit',
        comment: `Rubber tread grips wet surfaces confidently. Upper mesh keeps feet cool during hot afternoon walks. Very stylish with jeans.`,
        rating: 4,
        daysAgo: 28 + (hash % 20),
      },
      {
        title: 'Worth every rupee, premium quality finish',
        comment: `Stitching and insole comfort are top tier. Wearing them for 10-hour hospital shifts and my feet never feel fatigued.`,
        rating: 5,
        daysAgo: 50 + (hash % 35),
      },
    ];
    reviews.push(...buildReviewsFromTemplates(product.id, templates.slice(0, count), hash));
  } else if (cat.includes('fashion') || cat.includes('apparel') || cat.includes('dress') || cat.includes('shirt') || catId.includes('fashion')) {
    const templates = [
      {
        title: `Gorgeous fabric and flawless stitching on ${name}`,
        comment: `Pure breathable fabric that drapes beautifully. Color didn't bleed after machine wash and the fit is perfectly true to size.`,
        rating: 5,
        daysAgo: 14 + (hash % 18),
      },
      {
        title: 'Comfortable fit for both casual and formal outings',
        comment: `Fabric feels premium against the skin and doesn't wrinkle easily. Got great compliments at dinner last weekend.`,
        rating: 4,
        daysAgo: 30 + (hash % 24),
      },
      {
        title: 'High quality tailoring and elegant finish',
        comment: `Pattern and color match the website photos exactly. Buttons and hems are firmly stitched. Will definitely order more colors.`,
        rating: 5,
        daysAgo: 55 + (hash % 20),
      },
    ];
    reviews.push(...buildReviewsFromTemplates(product.id, templates.slice(0, count), hash));
  } else if (cat.includes('led') || cat.includes('home') || catId.includes('home')) {
    const templates = [
      {
        title: `Vibrant brightness and aesthetic ambient lighting`,
        comment: `Completely transformed the vibe of my living room! App connectivity and voice assistant integration work seamlessly.`,
        rating: 5,
        daysAgo: 15 + (hash % 20),
      },
      {
        title: 'Easy setup and wide range of color modes',
        comment: `Installed it in under 5 minutes. The warm white mode is perfect for late night reading and party modes sync to music nicely.`,
        rating: 4,
        daysAgo: 32 + (hash % 25),
      },
      {
        title: 'Energy efficient and excellent diffusion',
        comment: `Even light spread with no harsh hotspots. Build quality feels sturdy and premium.`,
        rating: 5,
        daysAgo: 48 + (hash % 30),
      },
    ];
    reviews.push(...buildReviewsFromTemplates(product.id, templates.slice(0, count), hash));
  } else {
    // Generic fallback with product name
    const templates = [
      {
        title: `Exceeded my expectations - great quality ${name}`,
        comment: `Very satisfied with this ${name}. It arrived securely packaged, matches the description accurately, and functions flawlessly.`,
        rating: 5,
        daysAgo: 16 + (hash % 22),
      },
      {
        title: 'Dependable quality and great customer value',
        comment: `Build quality is sturdy and well engineered. I use it regularly and have had zero complaints. Highly recommended!`,
        rating: 4,
        daysAgo: 35 + (hash % 28),
      },
    ];
    reviews.push(...buildReviewsFromTemplates(product.id, templates.slice(0, count), hash));
  }

  return reviews;
}

function buildReviewsFromTemplates(
  productId: string,
  templates: { title: string; comment: string; rating: number; daysAgo: number }[],
  hash: number
): ProductReview[] {
  return templates.map((tmpl, idx) => {
    const nameIndex = (hash + idx * 7) % REVIEWER_NAMES.length;
    const date = new Date(Date.now() - tmpl.daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const helpful = 4 + ((hash + idx * 13) % 38);

    return {
      id: `rev-${productId}-${idx + 1}`,
      product_id: productId,
      user_name: REVIEWER_NAMES[nameIndex],
      rating: tmpl.rating,
      title: tmpl.title,
      comment: tmpl.comment,
      verified_purchase: true,
      created_at: date,
      helpful_count: helpful,
    };
  });
}

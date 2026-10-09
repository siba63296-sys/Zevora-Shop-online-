/**
 * LocalStorage utility to manage user's recent search queries.
 */

const STORAGE_KEY = 'zevora_recent_searches';
const MAX_RECENT_SEARCHES = 8;

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
    return [];
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string): string[] {
  if (typeof window === 'undefined') return [];
  const cleanTerm = term.trim();
  if (!cleanTerm) return getRecentSearches();

  try {
    const existing = getRecentSearches();
    // Move to front and eliminate duplicates (case-insensitive)
    const filtered = existing.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
    const updated = [cleanTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeRecentSearch(term: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getRecentSearches();
    const updated = existing.filter((item) => item.toLowerCase() !== term.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export const POPULAR_SEARCH_TERMS = [
  'iPhone',
  'Smart Watch',
  'Wireless Earbuds',
  'Floral Dress',
  'MacBook',
  'Gaming Laptops',
  'Sneakers',
  'Ethnic Wear',
];

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Category } from '../types';
import { Check, X, Search, CheckSquare, Square, ChevronDown, ChevronUp, Layers, Tag } from 'lucide-react';

interface MultiCategorySelectorProps {
  categories: Category[];
  selectedCategoryIds: string[];
  onChange: (categoryIds: string[]) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export const MultiCategorySelector: React.FC<MultiCategorySelectorProps> = ({
  categories = [],
  selectedCategoryIds = [],
  onChange,
  label = 'Assigned Categories',
  required = true,
  disabled = false,
  helperText,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const safeCategories = useMemo(() => {
    return Array.isArray(categories) ? categories.filter(Boolean) : [];
  }, [categories]);

  const safeSelectedIds = useMemo(() => {
    if (!Array.isArray(selectedCategoryIds)) return [];
    return selectedCategoryIds
      .filter(Boolean)
      .map((item) =>
        typeof item === 'string'
          ? item
          : typeof item === 'object' && ('id' in item || 'category_id' in item)
          ? ((item as any).id || (item as any).category_id)
          : String(item)
      );
  }, [selectedCategoryIds]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtered categories by search query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return safeCategories;
    return safeCategories.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.slug && c.slug.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [safeCategories, searchQuery]);

  // Selected category objects, resolving by both ID and slug
  const selectedCategories = useMemo(() => {
    const seen = new Set<string>();
    const list: Category[] = [];

    for (const rawId of safeSelectedIds) {
      if (!rawId) continue;
      const cat = safeCategories.find((c) => c.id === rawId || c.slug === rawId);
      if (cat && !seen.has(cat.id)) {
        seen.add(cat.id);
        list.push(cat);
      }
    }
    return list;
  }, [safeCategories, safeSelectedIds]);

  const isCategorySelected = (cat: Category): boolean => {
    return safeSelectedIds.includes(cat.id) || (cat.slug ? safeSelectedIds.includes(cat.slug) : false);
  };

  const handleToggle = (cat: Category) => {
    if (disabled) return;
    const isSelected = isCategorySelected(cat);
    let next: string[];

    if (isSelected) {
      // Remove both ID and slug matches
      next = safeSelectedIds.filter((id) => id !== cat.id && id !== cat.slug);
    } else {
      // Add primary canonical ID
      next = Array.from(new Set([...safeSelectedIds, cat.id]));
    }
    onChange(next);
  };

  const handleRemove = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(safeSelectedIds.filter((id) => id !== cat.id && id !== cat.slug));
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const allIds = Array.from(new Set(safeCategories.map((c) => c.id)));
    onChange(allIds);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {selectedCategories.length} of {categories.length} selected
        </span>
      </div>

      {/* Primary Input Container with Removable Tags */}
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full min-h-[42px] p-2 bg-white dark:bg-slate-900 border rounded-xl text-xs transition-all cursor-pointer flex flex-wrap items-center gap-1.5 ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : ''}`}
      >
        {selectedCategories.length === 0 ? (
          <span className="text-slate-400 dark:text-slate-500 font-medium py-1 px-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Select multiple categories (e.g. Women Kurtis, Ethnic Wear, Best Sellers)...</span>
          </span>
        ) : (
          selectedCategories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[11px] shadow-2xs group animate-in fade-in duration-100"
            >
              <span>{cat.name}</span>
              <button
                type="button"
                onClick={(e) => handleRemove(e, cat)}
                className="p-0.5 hover:bg-blue-200/60 dark:hover:bg-blue-800/60 rounded text-blue-500 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors cursor-pointer"
                title={`Remove ${cat.name}`}
                aria-label={`Remove ${cat.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}

        <div className="ml-auto pl-2 flex items-center gap-1 text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Helper text or validation hint */}
      {helperText ? (
        <p className="text-[10px] text-slate-400 dark:text-slate-500">{helperText}</p>
      ) : required && selectedCategoryIds.length === 0 ? (
        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Please assign at least one category.</p>
      ) : null}

      {/* Dropdown Options & Checkbox List */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 space-y-2.5 z-50 transition-all animate-in fade-in duration-150">
          {/* Header controls: Search & Quick Actions (Select All, Clear All) */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories (e.g. Kurtis, Ethnic, Festive)..."
                className="w-full pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-0.5 px-0.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Available Categories
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>Select All</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>

          {/* Categories List with Functional Checkboxes */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1 space-y-0.5">
            {filteredCategories.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs font-medium">No matching categories found</p>
                <p className="text-[10px] mt-0.5 text-slate-400">Try adjusting your search query</p>
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = isCategorySelected(cat);
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleToggle(cat)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-950 dark:text-blue-200 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggle(cat)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="text-xs block truncate">{cat.name}</span>
                        {cat.description && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate font-normal">
                            {cat.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 ml-2">
                      {cat.slug || cat.id.slice(0, 8)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with done button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Assigned to {selectedCategories.length} categories
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

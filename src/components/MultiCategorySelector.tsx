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
  categories,
  selectedCategoryIds,
  onChange,
  label = 'Assigned Categories',
  required = true,
  disabled = false,
  helperText,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  // Selected category objects
  const selectedCategories = useMemo(() => {
    return selectedCategoryIds
      .map((id) => categories.find((c) => c.id === id || c.slug === id))
      .filter((c): c is Category => Boolean(c));
  }, [categories, selectedCategoryIds]);

  const handleToggle = (categoryId: string) => {
    if (disabled) return;
    const isSelected = selectedCategoryIds.includes(categoryId);
    let next: string[];
    if (isSelected) {
      next = selectedCategoryIds.filter((id) => id !== categoryId);
    } else {
      next = [...selectedCategoryIds, categoryId];
    }
    onChange(next);
  };

  const handleRemove = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedCategoryIds.filter((id) => id !== categoryId));
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const allIds = Array.from(new Set(categories.map((c) => c.id)));
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
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
        <span className="text-[11px] font-semibold text-slate-500">
          {selectedCategoryIds.length} of {categories.length} selected
        </span>
      </div>

      {/* Primary Input Container with Removable Tags */}
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full min-h-[42px] p-2 bg-white border rounded-xl text-xs transition-all cursor-pointer flex flex-wrap items-center gap-1.5 ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
      >
        {selectedCategories.length === 0 ? (
          <span className="text-slate-400 font-medium py-1 px-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Select one or more categories...</span>
          </span>
        ) : (
          selectedCategories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] shadow-2xs group animate-fadeIn"
            >
              <span>{cat.name}</span>
              <button
                type="button"
                onClick={(e) => handleRemove(e, cat.id)}
                className="p-0.5 hover:bg-blue-200/60 rounded text-blue-500 hover:text-blue-800 transition-colors cursor-pointer"
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
        <p className="text-[10px] text-slate-400">{helperText}</p>
      ) : required && selectedCategoryIds.length === 0 ? (
        <p className="text-[10px] text-amber-600 font-medium">Please assign at least one category.</p>
      ) : null}

      {/* Dropdown Options & Checkbox List */}
      {isOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-2.5 z-50 transition-all animate-fadeIn">
          {/* Header controls: Search & Quick Actions (Select All, Clear All) */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories (e.g. Kurtis, Ethnic, Fashion)..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
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
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Available Categories
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>Select All</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>

          {/* Categories List with Checkboxes */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-0.5">
            {filteredCategories.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <p className="text-xs font-medium">No matching categories found</p>
                <p className="text-[10px] mt-0.5 text-slate-400">Try adjusting your search query</p>
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id) || selectedCategoryIds.includes(cat.slug);
                return (
                  <label
                    key={cat.id}
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50/70 text-blue-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors border ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                            : 'border-slate-300 bg-white hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <span className="text-xs block truncate">{cat.name}</span>
                        {cat.description && (
                          <span className="text-[10px] text-slate-400 block truncate font-normal">
                            {cat.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                      {cat.slug}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* Footer with done button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              Assigned to {selectedCategoryIds.length} categories
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

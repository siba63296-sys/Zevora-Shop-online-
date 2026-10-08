import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant, ColorVariant, SizeChart } from '../types';
import { uploadProductImageToSupabase } from '../lib/supabase';
import {
  PRESET_COLORS,
  PRESET_ADULT_SIZES,
  PRESET_GIRLS_SIZES,
  PRESET_FOOTWEAR_SIZES,
  ADULT_APPAREL_SIZE_CHART,
  GIRLS_DRESS_SIZE_CHART,
  generateVariantGrid,
} from '../utils/variants';
import { SizeChartModal } from './SizeChartModal';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Check,
  Package,
  Ruler,
  Sparkles,
  Loader2,
  ImagePlus,
  ArrowLeft,
  ArrowRight,
  Star,
  AlertCircle,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  Box,
  Layers,
  Palette,
  CheckSquare,
  Square,
  Tag,
} from 'lucide-react';

export const ProductVariantDashboard: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    showToast,
  } = useStore();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [hasSizesFilter, setHasSizesFilter] = useState<'all' | 'with_sizes' | 'without_sizes'>('all');
  const [hasColorsFilter, setHasColorsFilter] = useState<'all' | 'with_colors' | 'without_colors'>('all');

  // Bulk Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Size Chart Preview Modal State
  const [previewChartOpen, setPreviewChartOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('Zevora');
  const [formCategoryId, setFormCategoryId] = useState(categories[0]?.id || '');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formMrp, setFormMrp] = useState(0);
  const [formDiscount, setFormDiscount] = useState(0);
  const [formStock, setFormStock] = useState(10);
  const [formSku, setFormSku] = useState('');
  const [formInStock, setFormInStock] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Images State
  const [formImages, setFormImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Colors State
  const [formColors, setFormColors] = useState<{ name: string; hex: string }[]>([]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#0f172a');

  // Sizes State
  const [formSizes, setFormSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Variants State
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);

  // Size Chart State
  const [formSizeChartType, setFormSizeChartType] = useState<'none' | 'adult' | 'girls' | 'custom'>('adult');
  const [formCustomSizeChart, setFormCustomSizeChart] = useState<SizeChart | null>(null);

  // Unique Brands for Filter
  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(query);
        const matchesBrand = (prod.brand || '').toLowerCase().includes(query);
        const matchesSku = (prod.sku || '').toLowerCase().includes(query);
        const matchesCat = (prod.category_name || '').toLowerCase().includes(query);
        const matchesVariant = prod.variants?.some(
          (v) => (v.sku || '').toLowerCase().includes(query) || (v.size || '').toLowerCase().includes(query)
        );
        if (!matchesName && !matchesBrand && !matchesSku && !matchesCat && !matchesVariant) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && prod.category_id !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && (prod.brand || 'Zevora') !== selectedBrand) {
        return false;
      }

      // Stock status filter
      if (stockFilter === 'in_stock' && (!prod.in_stock || prod.stock_quantity <= 0)) {
        return false;
      }
      if (stockFilter === 'out_of_stock' && prod.in_stock && prod.stock_quantity > 0) {
        return false;
      }

      // Has sizes filter
      const hasSizes = prod.sizes && prod.sizes.length > 0;
      if (hasSizesFilter === 'with_sizes' && !hasSizes) return false;
      if (hasSizesFilter === 'without_sizes' && hasSizes) return false;

      // Has colors filter
      const hasColors = prod.colors && prod.colors.length > 0;
      if (hasColorsFilter === 'with_colors' && !hasColors) return false;
      if (hasColorsFilter === 'without_colors' && hasColors) return false;

      return true;
    });
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedBrand,
    stockFilter,
    hasSizesFilter,
    hasColorsFilter,
  ]);

  // Overall Stats
  const stats = useMemo(() => {
    let inStockCount = 0;
    let outOfStockCount = 0;
    let totalVariantsCount = 0;
    let valuation = 0;

    products.forEach((p) => {
      if (p.in_stock && p.stock_quantity > 0) {
        inStockCount++;
      } else {
        outOfStockCount++;
      }
      totalVariantsCount += p.variants?.length || (p.sizes?.length || 1);
      valuation += p.price * (p.stock_quantity || 0);
    });

    return {
      total: products.length,
      inStock: inStockCount,
      outOfStock: outOfStockCount,
      variants: totalVariantsCount,
      valuation,
    };
  }, [products]);

  // Reset form
  const resetForm = () => {
    setEditingProductId(null);
    setFormName('');
    setFormBrand('Zevora');
    setFormCategoryId(categories[0]?.id || '');
    setFormSubcategory('');
    setFormDescription('');
    setFormPrice(0);
    setFormMrp(0);
    setFormDiscount(0);
    setFormStock(10);
    setFormSku(`ZEV-${Date.now().toString().slice(-4)}`);
    setFormInStock(true);
    setFormIsFeatured(false);
    setFormImages([]);
    setCustomImageUrl('');
    setFormColors([]);
    setCustomColorName('');
    setCustomColorHex('#0f172a');
    setFormSizes([]);
    setCustomSizeInput('');
    setFormVariants([]);
    setFormSizeChartType('adult');
    setFormCustomSizeChart(null);
    setUploadError('');
  };

  // Open modal for editing
  const openEditModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormBrand(prod.brand || 'Zevora');
    setFormCategoryId(prod.category_id);
    setFormSubcategory(prod.subcategory || '');
    setFormDescription(prod.description || '');
    setFormPrice(prod.price);
    setFormMrp(prod.original_price || prod.price);
    setFormDiscount(prod.discount_percent || 0);
    setFormStock(prod.stock_quantity);
    setFormSku(prod.sku || `ZEV-${prod.id.slice(0, 4).toUpperCase()}`);
    setFormInStock(prod.in_stock);
    setFormIsFeatured(Boolean(prod.is_featured));
    setFormImages(prod.images || []);
    setCustomImageUrl('');
    setFormColors(prod.colors ? [...prod.colors] : []);
    setFormSizes(prod.sizes ? [...prod.sizes] : []);
    setFormVariants(prod.variants ? [...prod.variants] : []);

    if (prod.size_chart) {
      setFormCustomSizeChart(prod.size_chart);
      setFormSizeChartType(prod.size_chart.type as any || 'custom');
    } else if (
      prod.category_name?.toLowerCase().includes('girl') ||
      prod.name.toLowerCase().includes('girl')
    ) {
      setFormSizeChartType('girls');
    } else if (prod.sizes && prod.sizes.length > 0) {
      setFormSizeChartType('adult');
    } else {
      setFormSizeChartType('none');
    }

    setUploadError('');
    setIsModalOpen(true);
  };

  // Auto calculate discount percent when price or mrp changes
  const handlePriceChange = (val: number) => {
    setFormPrice(val);
    if (formMrp > 0 && formMrp >= val) {
      setFormDiscount(Math.round(((formMrp - val) / formMrp) * 100));
    }
  };

  const handleMrpChange = (val: number) => {
    setFormMrp(val);
    if (val > 0 && val >= formPrice) {
      setFormDiscount(Math.round(((val - formPrice) / val) * 100));
    }
  };

  // Image Upload Handling
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setUploadError('');
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading photo ${i + 1} of ${files.length}...`);
      try {
        const uploadRes = await uploadProductImageToSupabase(file);
        if (uploadRes && uploadRes.success && uploadRes.url) {
          newUrls.push(uploadRes.url);
        } else if (uploadRes && !uploadRes.success) {
          setUploadError(`Failed to upload ${file.name}: ${uploadRes.message || 'Storage error'}`);
        }
      } catch (err: any) {
        console.error('Photo upload failed:', err);
        setUploadError(`Failed to upload ${file.name}: ${err?.message || 'Error'}`);
      }
    }

    if (newUrls.length > 0) {
      setFormImages((prev) => [...prev, ...newUrls]);
      showToast(`Uploaded ${newUrls.length} image(s) to Supabase Storage`, 'success');
    }

    setIsUploadingImage(false);
    setUploadProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (!trimmed) return;
    setFormImages((prev) => [...prev, trimmed]);
    setCustomImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= formImages.length) return;
    const next = [...formImages];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setFormImages(next);
  };

  // Color Management
  const handleAddPresetColor = (preset: ColorVariant) => {
    if (formColors.some((c) => c.name.toLowerCase() === preset.name.toLowerCase())) {
      showToast(`Color "${preset.name}" is already added`, 'info');
      return;
    }
    setFormColors((prev) => [...prev, { name: preset.name, hex: preset.hex }]);
  };

  const handleAddCustomColor = () => {
    const name = customColorName.trim();
    if (!name) return;
    if (formColors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      showToast(`Color "${name}" is already added`, 'info');
      return;
    }
    setFormColors((prev) => [...prev, { name, hex: customColorHex }]);
    setCustomColorName('');
  };

  const handleRemoveColor = (name: string) => {
    setFormColors((prev) => prev.filter((c) => c.name !== name));
    // Also remove from variants
    setFormVariants((prev) => prev.filter((v) => v.color?.toLowerCase() !== name.toLowerCase()));
  };

  // Size Management
  const handleAddSizeBatch = (batch: string[]) => {
    const next = new Set(formSizes);
    batch.forEach((sz) => next.add(sz));
    setFormSizes(Array.from(next));
  };

  const handleAddCustomSize = () => {
    const val = customSizeInput.trim();
    if (!val) return;
    if (formSizes.includes(val)) {
      showToast(`Size "${val}" is already added`, 'info');
      return;
    }
    setFormSizes((prev) => [...prev, val]);
    setCustomSizeInput('');
  };

  const handleRemoveSize = (sz: string) => {
    setFormSizes((prev) => prev.filter((s) => s !== sz));
    setFormVariants((prev) => prev.filter((v) => v.size?.toLowerCase() !== sz.toLowerCase()));
  };

  // Variant Grid Auto-Generation
  const handleAutoGenerateVariants = () => {
    if (formColors.length === 0 && formSizes.length === 0) {
      showToast('Please add at least 1 color or 1 size first', 'error');
      return;
    }

    const generated = generateVariantGrid(
      formColors,
      formSizes,
      formPrice,
      formMrp,
      formStock,
      formSku || 'ZEV'
    );

    // Merge or replace
    setFormVariants(generated);
    showToast(`Generated ${generated.length} variant combinations!`, 'success');
  };

  const handleAddCustomVariantRow = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sku: `${(formSku || 'ZEV').toUpperCase()}-${Date.now().toString().slice(-4)}`,
      color: formColors[0]?.name || 'Standard',
      color_hex: formColors[0]?.hex || '#0f172a',
      size: formSizes[0] || 'Standard',
      price: formPrice,
      original_price: formMrp,
      stock_quantity: formStock,
      in_stock: formStock > 0,
    };
    setFormVariants((prev) => [...prev, newVariant]);
  };

  const handleUpdateVariantField = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    setFormVariants((prev) => {
      const next = [...prev];
      const updated = { ...next[index], [field]: value };
      if (field === 'stock_quantity') {
        updated.in_stock = Number(value) > 0;
      }
      next[index] = updated;
      return next;
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkMarkStock = async (inStock: boolean) => {
    if (selectedProductIds.length === 0) return;
    for (const id of selectedProductIds) {
      await updateProduct(id, { in_stock: inStock, stock_quantity: inStock ? 15 : 0 });
    }
    showToast(
      `Marked ${selectedProductIds.length} products as ${inStock ? 'In Stock' : 'Out of Stock'}`,
      'success'
    );
    setSelectedProductIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedProductIds.length} selected products? This cannot be undone.`
      )
    ) {
      return;
    }
    for (const id of selectedProductIds) {
      await deleteProduct(id);
    }
    showToast(`Deleted ${selectedProductIds.length} products`, 'info');
    setSelectedProductIds([]);
  };

  // Save / Update Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    if (formImages.length === 0) {
      showToast('Please add at least one product image', 'error');
      return;
    }

    // Determine final size chart
    let finalSizeChart: SizeChart | undefined = undefined;
    if (formSizeChartType === 'adult') {
      finalSizeChart = ADULT_APPAREL_SIZE_CHART;
    } else if (formSizeChartType === 'girls') {
      finalSizeChart = GIRLS_DRESS_SIZE_CHART;
    } else if (formSizeChartType === 'custom') {
      finalSizeChart = formCustomSizeChart || undefined;
    }

    // Sum stock across variants if variants exist
    let calculatedStock = formStock;
    if (formVariants.length > 0) {
      calculatedStock = formVariants.reduce((sum, v) => sum + (Number(v.stock_quantity) || 0), 0);
    }

    const payload: Partial<Product> = {
      name: formName.trim(),
      brand: formBrand.trim(),
      category_id: formCategoryId,
      subcategory: formSubcategory.trim(),
      description: formDescription.trim(),
      price: Number(formPrice) || 0,
      original_price: Number(formMrp) || Number(formPrice) || 0,
      discount_percent: Number(formDiscount) || 0,
      stock_quantity: calculatedStock,
      in_stock: formInStock && calculatedStock > 0,
      sku: formSku.trim(),
      is_featured: formIsFeatured,
      images: formImages,
      colors: formColors,
      sizes: formSizes,
      variants: formVariants,
      size_chart: finalSizeChart,
    };

    if (editingProductId) {
      const success = await updateProduct(editingProductId, payload);
      if (success) {
        setIsModalOpen(false);
        resetForm();
      }
    } else {
      const success = await addProduct(payload as any);
      if (success) {
        setIsModalOpen(false);
        resetForm();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{stats.total}</p>
          <span className="text-[11px] text-slate-400">In catalog</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              In Stock
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">{stats.inStock}</p>
          <span className="text-[11px] text-slate-400">Available to buy</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Out of Stock
            </span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700 mt-2">{stats.outOfStock}</p>
          <span className="text-[11px] text-slate-400">Needs restock</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Total Variants
            </span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-700 mt-2">{stats.variants}</p>
          <span className="text-[11px] text-slate-400">Color/Size SKUs</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Catalog Value
            </span>
            <Box className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 truncate tabular-nums">
            ₹{stats.valuation.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400">Inventory valuation</span>
        </div>
      </div>

      {/* 2. Search & Multi-Filter Control Panel */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search product name, SKU, brand, or variant size/color..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product / Dress</span>
          </button>
        </div>

        {/* Filter Pills Grid */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-bold mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs focus:bg-white"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          {uniqueBrands.length > 0 && (
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs focus:bg-white"
            >
              <option value="all">All Brands ({uniqueBrands.length})</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          {/* Stock Filter */}
          <div className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                stockFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Stock
            </button>
            <button
              onClick={() => setStockFilter('in_stock')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                stockFilter === 'in_stock'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                stockFilter === 'out_of_stock'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Out of Stock
            </button>
          </div>

          {/* Has Sizes Filter */}
          <select
            value={hasSizesFilter}
            onChange={(e) => setHasSizesFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs focus:bg-white"
          >
            <option value="all">Sizes: All Products</option>
            <option value="with_sizes">Has Sizes Only</option>
            <option value="without_sizes">No Sizes</option>
          </select>

          {/* Has Colors Filter */}
          <select
            value={hasColorsFilter}
            onChange={(e) => setHasColorsFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs focus:bg-white"
          >
            <option value="all">Colors: All Products</option>
            <option value="with_colors">Has Colors Only</option>
            <option value="without_colors">No Colors</option>
          </select>

          {/* Clear Filters */}
          {(selectedCategory !== 'all' ||
            selectedBrand !== 'all' ||
            stockFilter !== 'all' ||
            hasSizesFilter !== 'all' ||
            hasColorsFilter !== 'all' ||
            searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                setStockFilter('all');
                setHasSizesFilter('all');
                setHasColorsFilter('all');
                setSearchTerm('');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Bulk Action Bar (When 1+ items selected) */}
      {selectedProductIds.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs flex-wrap gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>{selectedProductIds.length} products selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkMarkStock(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-2xs"
            >
              Mark In Stock
            </button>
            <button
              onClick={() => handleBulkMarkStock(false)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-2xs"
            >
              Mark Out of Stock
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl font-bold transition-colors"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedProductIds([])}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 4. Products & Variants Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="p-1 hover:text-slate-900 cursor-pointer"
                    title="Select All"
                  >
                    {selectedProductIds.length === filteredProducts.length &&
                    filteredProducts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Product & SKU</th>
                <th className="p-3.5">Category & Brand</th>
                <th className="p-3.5">Price / MRP</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5">Variants & Sizes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-slate-700 text-sm">No products found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your filters or search keywords.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isSelected = selectedProductIds.includes(prod.id);
                  const hasSizes = prod.sizes && prod.sizes.length > 0;
                  const hasColors = prod.colors && prod.colors.length > 0;
                  const variantCount = prod.variants?.length || 0;

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(prod.id)}
                          className="p-1 hover:text-slate-900 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Product & SKU */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden relative">
                            <img
                              src={
                                prod.images && prod.images[0]
                                  ? prod.images[0]
                                  : 'https://placehold.co/100x100/png?text=Photo'
                              }
                              alt=""
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://placehold.co/100x100/png?text=Photo';
                              }}
                            />
                            {prod.images && prod.images.length > 1 && (
                              <span className="absolute bottom-0.5 right-0.5 bg-slate-900/80 text-white text-[8px] font-bold px-1 rounded">
                                +{prod.images.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {prod.sku && (
                                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {prod.sku}
                                </span>
                              )}
                              {prod.is_featured && (
                                <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="p-3.5">
                        <p className="font-bold text-slate-800">
                          {prod.category_name || 'General'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Brand: <span className="text-slate-600 font-medium">{prod.brand || 'Zevora'}</span>
                          {prod.subcategory ? ` • ${prod.subcategory}` : ''}
                        </p>
                      </td>

                      {/* Price / MRP */}
                      <td className="p-3.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-extrabold text-slate-900 tabular-nums">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                          {prod.original_price > prod.price && (
                            <span className="text-[11px] text-slate-400 line-through tabular-nums">
                              ₹{prod.original_price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {prod.discount_percent > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            {prod.discount_percent}% OFF
                          </span>
                        )}
                      </td>

                      {/* Stock Status */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prod.in_stock && prod.stock_quantity > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                prod.in_stock && prod.stock_quantity > 0
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {prod.in_stock && prod.stock_quantity > 0
                              ? `In Stock (${prod.stock_quantity})`
                              : 'Out of Stock'}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateProduct(prod.id, {
                                in_stock: !prod.in_stock,
                                stock_quantity: !prod.in_stock ? 10 : 0,
                              })
                            }
                            className="block text-[10px] text-slate-400 hover:text-blue-600 underline font-medium"
                          >
                            Toggle status
                          </button>
                        </div>
                      </td>

                      {/* Variants & Sizes */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {/* Colors Swatches */}
                          {hasColors && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {prod.colors!.slice(0, 4).map((c) => (
                                <span
                                  key={c.name}
                                  className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}
                              {prod.colors!.length > 4 && (
                                <span className="text-[9px] font-bold text-slate-500">
                                  +{prod.colors!.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Sizes Pills */}
                          {hasSizes ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              {prod.sizes!.slice(0, 4).map((sz) => (
                                <span
                                  key={sz}
                                  className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {sz}
                                </span>
                              ))}
                              {prod.sizes!.length > 4 && (
                                <span className="text-[9px] font-bold text-slate-500">
                                  +{prod.sizes!.length - 4}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No sizes</span>
                          )}

                          {variantCount > 0 && (
                            <p className="text-[10px] text-indigo-600 font-bold">
                              {variantCount} matrix SKU{variantCount > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(prod)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer"
                            title="Edit Product & Variants"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete product "${prod.name}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Complete Product & Variant Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                    {editingProductId ? 'Edit Product & Variants' : 'Add New Product / Dress'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure dress details, colors, size chart, and variant SKUs
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* SECTION 1: General Info */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. General Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Elegant Floral Party Gown / Formal Linen Shirt"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      placeholder="e.g. Zevora / Bella Chic"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={formSubcategory}
                      onChange={(e) => setFormSubcategory(e.target.value)}
                      placeholder="e.g. Dresses, Partywear, Ethnic, Western"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Master SKU / Product Code
                    </label>
                    <input
                      type="text"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="e.g. ZEV-DRS-101"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description & Fabric Specifications
                    </label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Detailed product details, fabric, wash instructions, styling tips..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200/60 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={formInStock}
                      onChange={(e) => setFormInStock(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Product Status: In Stock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-800">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>Featured On Homepage Banner & Deals</span>
                  </label>
                </div>
              </div>

              {/* SECTION 2: Pricing & Master Stock */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Pricing & Master Inventory</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      MRP / Original (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formMrp}
                      onChange={(e) => handleMrpChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPrice}
                      onChange={(e) => handlePriceChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Master Stock
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Multi-Photo Gallery & Supabase Storage */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <ImagePlus className="w-3.5 h-3.5 text-blue-600" />
                      <span>3. Product Images Gallery</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload multiple high-resolution photos (Front, Back, Detail, Model). First photo is the primary cover.
                    </p>
                  </div>

                  {formImages.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {formImages.length} {formImages.length === 1 ? 'Photo' : 'Photos'}
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{uploadProgress || 'Uploading to Supabase...'}</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-4 h-4" />
                        <span>Upload Photos from Device (Supabase Storage)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="Or paste direct image URL..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!customImageUrl.trim()}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </p>
                )}

                {/* Thumbnails list */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
                    {formImages.map((img, idx) => (
                      <div
                        key={`${img}-${idx}`}
                        className={`relative rounded-xl border-2 bg-white overflow-hidden p-1 flex flex-col group ${
                          idx === 0
                            ? 'border-blue-600 ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="h-20 w-full bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                          <img
                            src={img}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/150x150/png?text=Photo';
                            }}
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] font-extrabold px-1 rounded shadow-xs">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded bg-rose-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer shadow-xs"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, idx - 1)}
                            className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                            title="Move Earlier"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <span className="text-slate-400 font-bold">#{idx + 1}</span>
                          <button
                            type="button"
                            disabled={idx === formImages.length - 1}
                            onClick={() => handleMoveImage(idx, idx + 1)}
                            className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                            title="Move Later"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: Color Variants Management */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-pink-600" />
                      <span>4. Color Management</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Add colors for this dress (e.g. Black, White, Pink, Aqua Blue, Beige).
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {formColors.length} Color{formColors.length === 1 ? '' : 's'} Active
                  </span>
                </div>

                {/* Quick Presets Palette */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600">Quick Preset Swatches:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((pc) => {
                      const isAdded = formColors.some(
                        (c) => c.name.toLowerCase() === pc.name.toLowerCase()
                      );
                      return (
                        <button
                          key={pc.name}
                          type="button"
                          onClick={() => handleAddPresetColor(pc)}
                          disabled={isAdded}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:shadow-2xs'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/15 shadow-2xs"
                            style={{ backgroundColor: pc.hex }}
                          />
                          <span>{pc.name}</span>
                          {isAdded && <Check className="w-3 h-3 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                    title="Pick Color Swatch"
                  />
                  <input
                    type="text"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomColor();
                      }
                    }}
                    placeholder="Custom color name (e.g. Royal Maroon, Pastel Lilac)..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomColor}
                    disabled={!customColorName.trim()}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Add Color
                  </button>
                </div>

                {/* Added Colors List */}
                {formColors.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formColors.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-bold text-slate-800"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(c.name)}
                          className="text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                          title="Remove color"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 5: Size Variants Management */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-blue-600" />
                      <span>5. Size Management</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Add standard adult sizes, kids/girls ages, or custom dimensions.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {formSizes.length} Size{formSizes.length === 1 ? '' : 's'} Active
                  </span>
                </div>

                {/* Quick Size Batch Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddSizeBatch(PRESET_ADULT_SIZES)}
                    className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    + Add Standard Adult (XS, S, M, L, XL, XXL, 3XL, 4XL, 5XL)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSizeBatch(PRESET_GIRLS_SIZES)}
                    className="px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50/70 hover:bg-pink-100 text-pink-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    + Add Girls Dresses (2-3 Yrs to 15-16 Yrs)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddSizeBatch(PRESET_FOOTWEAR_SIZES)}
                    className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    + Add Footwear (UK 4 - UK 10)
                  </button>
                </div>

                {/* Custom Size Input */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                    placeholder="Custom size (e.g. Free Size, One Size, 18-24 Months, 4XL)..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    disabled={!customSizeInput.trim()}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Add Size
                  </button>
                </div>

                {/* Added Sizes Pills */}
                {formSizes.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formSizes.map((sz) => (
                      <span
                        key={sz}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <span>{sz}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(sz)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 6: Variant Matrix Table (Color × Size SKU Grid) */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>6. Variant Matrix (Color & Size Wise Stock & Price)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Set specific stock and price for each color + size combination.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoGenerateVariants}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Generate Matrix</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomVariantRow}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Row
                    </button>
                  </div>
                </div>

                {formVariants.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider sticky top-0">
                          <tr>
                            <th className="p-2.5">Color</th>
                            <th className="p-2.5">Size</th>
                            <th className="p-2.5">SKU</th>
                            <th className="p-2.5">Price (₹)</th>
                            <th className="p-2.5">MRP (₹)</th>
                            <th className="p-2.5">Stock</th>
                            <th className="p-2.5 text-center">In Stock?</th>
                            <th className="p-2.5 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {formVariants.map((v, idx) => (
                            <tr key={v.id || idx} className="hover:bg-slate-50/50">
                              <td className="p-2">
                                <div className="flex items-center gap-1.5">
                                  {v.color_hex && (
                                    <span
                                      className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                                      style={{ backgroundColor: v.color_hex }}
                                    />
                                  )}
                                  <input
                                    type="text"
                                    value={v.color || ''}
                                    onChange={(e) =>
                                      handleUpdateVariantField(idx, 'color', e.target.value)
                                    }
                                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                                  />
                                </div>
                              </td>

                              <td className="p-2">
                                <input
                                  type="text"
                                  value={v.size || ''}
                                  onChange={(e) =>
                                    handleUpdateVariantField(idx, 'size', e.target.value)
                                  }
                                  className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                />
                              </td>

                              <td className="p-2">
                                <input
                                  type="text"
                                  value={v.sku || ''}
                                  onChange={(e) =>
                                    handleUpdateVariantField(idx, 'sku', e.target.value)
                                  }
                                  className="w-28 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                                />
                              </td>

                              <td className="p-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={v.price ?? formPrice}
                                  onChange={(e) =>
                                    handleUpdateVariantField(idx, 'price', Number(e.target.value))
                                  }
                                  className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold tabular-nums"
                                />
                              </td>

                              <td className="p-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={v.original_price ?? formMrp}
                                  onChange={(e) =>
                                    handleUpdateVariantField(
                                      idx,
                                      'original_price',
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs tabular-nums"
                                />
                              </td>

                              <td className="p-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={v.stock_quantity ?? 0}
                                  onChange={(e) =>
                                    handleUpdateVariantField(
                                      idx,
                                      'stock_quantity',
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold tabular-nums"
                                />
                              </td>

                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={Boolean(v.in_stock && v.stock_quantity > 0)}
                                  onChange={(e) =>
                                    handleUpdateVariantField(idx, 'in_stock', e.target.checked)
                                  }
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                              </td>

                              <td className="p-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariantRow(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                  title="Delete variant row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400">
                    <Layers className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs font-bold text-slate-700">No variants generated yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click <strong>"Auto-Generate Matrix"</strong> above to instantly create SKUs for all colors & sizes.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 7: Size Chart Selection */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-blue-600" />
                    <span>7. Size Chart Guide</span>
                  </h4>

                  {formSizeChartType !== 'none' && (
                    <button
                      type="button"
                      onClick={() => setPreviewChartOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Size Chart</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      formSizeChartType === 'adult'
                        ? 'bg-blue-50/50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sizeChartType"
                      checked={formSizeChartType === 'adult'}
                      onChange={() => setFormSizeChartType('adult')}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="text-xs leading-tight">Standard Adult Chart</p>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Bust, Waist, Hips, Length (XS - 5XL)
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      formSizeChartType === 'girls'
                        ? 'bg-pink-50/50 border-pink-600 text-pink-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sizeChartType"
                      checked={formSizeChartType === 'girls'}
                      onChange={() => setFormSizeChartType('girls')}
                      className="text-pink-600"
                    />
                    <div>
                      <p className="text-xs leading-tight">Girls & Kids Dress Chart</p>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Age-based (2-3 Yrs - 15-16 Yrs)
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      formSizeChartType === 'none'
                        ? 'bg-slate-100 border-slate-400 text-slate-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sizeChartType"
                      checked={formSizeChartType === 'none'}
                      onChange={() => setFormSizeChartType('none')}
                      className="text-slate-600"
                    />
                    <div>
                      <p className="text-xs leading-tight">No Size Chart</p>
                      <span className="text-[10px] text-slate-400 font-normal">
                        For accessories or free size
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {editingProductId ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete product "${formName}" permanently?`)) {
                        deleteProduct(editingProductId);
                        setIsModalOpen(false);
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Delete Product
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    {editingProductId ? 'Update Product & Variants' : 'Save & Publish Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Size Chart Preview Modal */}
      <SizeChartModal
        isOpen={previewChartOpen}
        onClose={() => setPreviewChartOpen(false)}
        productName={formName || 'Product Preview'}
        categoryName={formCategoryId}
        customChart={
          formSizeChartType === 'girls'
            ? GIRLS_DRESS_SIZE_CHART
            : formSizeChartType === 'adult'
            ? ADULT_APPAREL_SIZE_CHART
            : undefined
        }
      />
    </div>
  );
};

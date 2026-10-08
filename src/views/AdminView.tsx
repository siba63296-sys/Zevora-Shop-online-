import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Category, OrderStatus, Order, Offer, Coupon, StoreSettings } from '../types';
import { uploadProductImageToSupabase, uploadBannerImageToSupabase } from '../lib/supabase';
import { generateSupabaseDemoSeedSql } from '../data/supabaseSeedSql';
import { ProductVariantDashboard } from '../components/ProductVariantDashboard';
import {
  ShieldCheck,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Database,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Image,
  Upload,
  X,
  Search,
  Loader2,
  Download,
  Copy,
  Sparkles,
  Tag,
  Calendar,
  Settings,
  Globe,
  Check,
  Percent,
  ArrowLeft,
  ArrowRight,
  Star,
  GripVertical,
  ImagePlus,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    isAdmin,
    adminEmail,
    loginAdmin,
    logoutAdmin,
    products,
    categories,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    offers,
    addOffer,
    updateOffer,
    deleteOffer,
    toggleOfferActive,
    updateOrderStatus,
    customers,
    isSupabaseConnected,
    navigateTo,
    showToast,
    storeSettings,
    updateStoreSettings,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponActive,
  } = useStore();

  // Admin Login state (Setup/Registration removed for security)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<'products' | 'variant_manager' | 'categories' | 'offers' | 'orders' | 'customers' | 'coupons' | 'settings' | 'database'>('products');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

  // Modals & Forms
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category_id: categories[0]?.id || '',
    price: 0,
    original_price: 0,
    discount_percent: 0,
    stock_quantity: 10,
    in_stock: true,
    image_url: '',
    images: [] as string[],
    rating: 4.5,
    review_count: 10,
    is_featured: false,
  });

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle direct multiple image upload to Supabase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setUploadError('');

    try {
      const fileList = Array.from(files);
      const newUrls: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(`Uploading ${i + 1} of ${fileList.length}: ${file.name}...`);
        const res = await uploadProductImageToSupabase(file);
        if (res.success && res.url) {
          newUrls.push(res.url);
        } else {
          setUploadError(res.message || `Failed to upload ${file.name}`);
        }
      }

      if (newUrls.length > 0) {
        setProductForm((prev) => {
          const combined = [...(prev.images || []), ...newUrls];
          return {
            ...prev,
            images: combined,
            image_url: combined[0] || '',
          };
        });
        showToast(`${newUrls.length} image(s) uploaded to Supabase Storage!`, 'success');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error uploading images.');
      showToast('Error uploading images', 'error');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress('');
      if (e.target) e.target.value = '';
    }
  };

  const handleAddCustomImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setUploadError('Please enter a valid HTTP/HTTPS image URL');
      return;
    }
    setProductForm((prev) => {
      const combined = [...(prev.images || []), trimmed];
      return {
        ...prev,
        images: combined,
        image_url: combined[0] || '',
      };
    });
    setCustomImageUrl('');
    setUploadError('');
    showToast('Photo URL added to gallery', 'success');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProductForm((prev) => {
      const remaining = (prev.images || []).filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        images: remaining,
        image_url: remaining[0] || '',
      };
    });
    showToast('Photo removed', 'info');
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    setProductForm((prev) => {
      const current = [...(prev.images || [])];
      if (toIndex < 0 || toIndex >= current.length) return prev;
      const [item] = current.splice(fromIndex, 1);
      current.splice(toIndex, 0, item);
      return {
        ...prev,
        images: current,
        image_url: current[0] || '',
      };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setProductForm((prev) => {
      const current = [...(prev.images || [])];
      if (index === 0 || index >= current.length) return prev;
      const [item] = current.splice(index, 1);
      current.unshift(item);
      return {
        ...prev,
        images: current,
        image_url: current[0] || '',
      };
    });
    showToast('Set as main cover image!', 'success');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = Number(sourceIndexStr);
    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      handleMoveImage(sourceIndex, targetIndex);
    }
    setDraggedImageIndex(null);
  };

  // New Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon_name: 'ShoppingBag',
    color_bg: 'bg-blue-500',
    color_text: 'text-blue-500',
    product_count: 0,
  });

  // Handle Admin Login (Existing Admin Only)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await loginAdmin(loginEmail, loginPassword);
      if (!res.success) {
        setLoginError(res.message || 'Invalid administrator email or password.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCatId = productForm.category_id || categories[0]?.id || '';
    const cat = categories.find((c) => c.id === targetCatId);
    const finalImages = (productForm.images && productForm.images.length > 0)
      ? productForm.images
      : (productForm.image_url ? [productForm.image_url] : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80']);

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: productForm.name,
        description: productForm.description,
        category_id: targetCatId,
        category_name: cat?.name || 'General',
        price: Number(productForm.price),
        original_price: Number(productForm.original_price || productForm.price),
        discount_percent: Number(productForm.discount_percent),
        stock_quantity: Number(productForm.stock_quantity),
        in_stock: Number(productForm.stock_quantity) > 0,
        images: finalImages,
        is_featured: Boolean(productForm.is_featured),
      });
      setEditingProduct(null);
    } else {
      await addProduct({
        name: productForm.name,
        description: productForm.description,
        category_id: targetCatId,
        category_name: cat?.name || 'General',
        price: Number(productForm.price),
        original_price: Number(productForm.original_price || productForm.price),
        discount_percent: Number(productForm.discount_percent),
        rating: 4.7,
        review_count: 1,
        stock_quantity: Number(productForm.stock_quantity),
        in_stock: Number(productForm.stock_quantity) > 0,
        images: finalImages,
        specs: [{ label: 'Standard', value: 'Original' }],
        colors: [{ name: 'Default', hex: '#0f172a' }],
        is_featured: Boolean(productForm.is_featured),
      });
    }

    setShowAddProductModal(false);
    resetProductForm();
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      category_id: categories[0]?.id || '',
      price: 0,
      original_price: 0,
      discount_percent: 0,
      stock_quantity: 10,
      in_stock: true,
      image_url: '',
      images: [],
      rating: 4.5,
      review_count: 10,
      is_featured: false,
    });
    setUploadError('');
    setUploadProgress('');
    setCustomImageUrl('');
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    const prodImages = Array.isArray(prod.images) && prod.images.length > 0
      ? [...prod.images]
      : (prod.images?.[0] ? [prod.images[0]] : []);

    setProductForm({
      name: prod.name,
      description: prod.description,
      category_id: prod.category_id,
      price: prod.price,
      original_price: prod.original_price,
      discount_percent: prod.discount_percent,
      stock_quantity: prod.stock_quantity,
      in_stock: prod.in_stock,
      image_url: prodImages[0] || '',
      images: prodImages,
      rating: prod.rating,
      review_count: prod.review_count,
      is_featured: Boolean(prod.is_featured),
    });
    setUploadError('');
    setUploadProgress('');
    setCustomImageUrl('');
    setShowAddProductModal(true);
  };

  // Handle Category Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      await updateCategory(editingCategory.id, categoryForm);
      setEditingCategory(null);
    } else {
      await addCategory({
        ...categoryForm,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
      });
    }
    setShowAddCategoryModal(false);
  };

  // Offer Form State & Modal Handlers
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerForm, setOfferForm] = useState({
    title: '',
    discount_percentage: 30,
    discount_text: '30% OFF',
    category_id: 'all',
    description: '',
    image_url: '',
    button_text: 'Shop Now',
    button_link: 'categories',
    start_at: '',
    end_at: '',
    is_active: true,
    display_order: 1,
  });
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState('');
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);

  const resetOfferForm = () => {
    const firstCat = categories[0]?.id || 'all';
    setOfferForm({
      title: '',
      discount_percentage: 30,
      discount_text: '30% OFF',
      category_id: firstCat,
      description: '',
      image_url: '',
      button_text: 'Shop Now',
      button_link: firstCat,
      start_at: '',
      end_at: '',
      is_active: true,
      display_order: (offers.length || 0) + 1,
    });
    setBannerUploadError('');
    setEditingOffer(null);
  };

  const openEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    const formatDateTimeForInput = (iso?: string | null) => {
      if (!iso) return '';
      try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch {
        return '';
      }
    };

    const discPct = offer.discount_percentage || (parseInt((offer.discount_text || '').replace(/\D/g, ''), 10) || 30);

    setOfferForm({
      title: offer.title || '',
      discount_percentage: discPct,
      discount_text: offer.discount_text || `${discPct}% OFF`,
      category_id: offer.category_id || 'all',
      description: offer.description || '',
      image_url: offer.image_url || '',
      button_text: offer.button_text || 'Shop Now',
      button_link: offer.button_link || offer.category_id || 'categories',
      start_at: formatDateTimeForInput(offer.start_at),
      end_at: formatDateTimeForInput(offer.end_at),
      is_active: offer.is_active ?? true,
      display_order: offer.display_order ?? 1,
    });
    setBannerUploadError('');
    setShowAddOfferModal(true);
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    setBannerUploadError('');

    try {
      const res = await uploadBannerImageToSupabase(file);
      if (res.success && res.url) {
        setOfferForm((prev) => ({ ...prev, image_url: res.url }));
        showToast(res.message, 'success');
      } else {
        setBannerUploadError(res.message || 'Failed to upload banner.');
        showToast(res.message || 'Banner upload failed', 'error');
      }
    } catch (err: any) {
      setBannerUploadError(err?.message || 'Error uploading banner image.');
      showToast('Error uploading banner image', 'error');
    } finally {
      setIsUploadingBanner(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.image_url.trim()) {
      showToast('Please upload or provide a banner image URL', 'error');
      return;
    }

    const discPct = Math.min(99, Math.max(1, Number(offerForm.discount_percentage) || 30));
    const discText = offerForm.discount_text.trim() || `${discPct}% OFF`;
    const targetCat = categories.find((c) => c.id === offerForm.category_id);
    const categoryName = targetCat ? targetCat.name : (offerForm.category_id === 'all' ? 'All Categories' : '');

    const payload = {
      title: offerForm.title.trim(),
      discount_percentage: discPct,
      discount_text: discText,
      category_id: offerForm.category_id || 'all',
      category_name: categoryName,
      description: offerForm.description.trim(),
      image_url: offerForm.image_url.trim(),
      button_text: offerForm.button_text.trim() || 'Shop Now',
      button_link: offerForm.button_link.trim() || offerForm.category_id || 'categories',
      start_at: offerForm.start_at ? new Date(offerForm.start_at).toISOString() : null,
      end_at: offerForm.end_at ? new Date(offerForm.end_at).toISOString() : null,
      is_active: Boolean(offerForm.is_active),
      display_order: Number(offerForm.display_order) || 1,
    };

    if (editingOffer) {
      await updateOffer(editingOffer.id, payload);
    } else {
      await addOffer(payload);
    }

    setShowAddOfferModal(false);
    resetOfferForm();
  };

  // ==========================================
  // WEBSITE SETTINGS STATE & HANDLERS
  // ==========================================
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({
    store_name: storeSettings.store_name || 'Zevora',
    tagline: storeSettings.tagline || '',
    logo_url: storeSettings.logo_url || '',
    favicon_url: storeSettings.favicon_url || '',
    contact_email: storeSettings.contact_email || '',
    contact_phone: storeSettings.contact_phone || '',
    currency_symbol: storeSettings.currency_symbol || '₹',
    announcement_text: storeSettings.announcement_text || '',
    instagram_url: storeSettings.instagram_url || '',
    facebook_url: storeSettings.facebook_url || '',
    twitter_url: storeSettings.twitter_url || '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);

  React.useEffect(() => {
    setSettingsForm({
      store_name: storeSettings.store_name || 'Zevora',
      tagline: storeSettings.tagline || '',
      logo_url: storeSettings.logo_url || '',
      favicon_url: storeSettings.favicon_url || '',
      contact_email: storeSettings.contact_email || '',
      contact_phone: storeSettings.contact_phone || '',
      currency_symbol: storeSettings.currency_symbol || '₹',
      announcement_text: storeSettings.announcement_text || '',
      instagram_url: storeSettings.instagram_url || '',
      facebook_url: storeSettings.facebook_url || '',
      twitter_url: storeSettings.twitter_url || '',
    });
  }, [storeSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm.store_name.trim()) {
      showToast('Store name is required', 'error');
      return;
    }
    setIsSavingSettings(true);
    try {
      await updateStoreSettings(settingsForm);
      showToast('Website settings saved and applied everywhere!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save website settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      if (isSupabaseConnected) {
        const res = await uploadBannerImageToSupabase(file);
        if (res.success && res.url) {
          setSettingsForm((prev) => ({ ...prev, logo_url: res.url }));
          showToast('Logo uploaded to Supabase Storage!', 'success');
          return;
        }
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSettingsForm((prev) => ({ ...prev, logo_url: reader.result as string }));
        showToast('Logo updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('Failed to upload logo', 'error');
    } finally {
      setLogoUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconUploading(true);
    try {
      if (isSupabaseConnected) {
        const res = await uploadBannerImageToSupabase(file);
        if (res.success && res.url) {
          setSettingsForm((prev) => ({ ...prev, favicon_url: res.url }));
          showToast('Favicon uploaded to Supabase Storage!', 'success');
          return;
        }
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSettingsForm((prev) => ({ ...prev, favicon_url: reader.result as string }));
        showToast('Favicon updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('Failed to upload favicon', 'error');
    } finally {
      setFaviconUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // ==========================================
  // COUPON MANAGEMENT STATE & HANDLERS
  // ==========================================
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponSearchTerm, setCouponSearchTerm] = useState('');
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_cart_value: 0,
    max_discount_amount: '' as number | '',
    scope: 'all' as 'all' | 'category' | 'products',
    target_category_id: '',
    target_product_ids: [] as string[],
    start_at: '',
    end_at: '',
    usage_limit: '' as number | '',
    allow_with_offers: true,
    is_active: true,
  });

  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_cart_value: 0,
      max_discount_amount: '',
      scope: 'all',
      target_category_id: categories[0]?.id || '',
      target_product_ids: [],
      start_at: '',
      end_at: '',
      usage_limit: '',
      allow_with_offers: true,
      is_active: true,
    });
    setEditingCoupon(null);
  };

  const openAddCoupon = () => {
    resetCouponForm();
    setShowAddCouponModal(true);
  };

  const openEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code,
      description: c.description || '',
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_cart_value: c.min_cart_value || 0,
      max_discount_amount: typeof c.max_discount_amount === 'number' ? c.max_discount_amount : '',
      scope: c.scope,
      target_category_id: c.target_category_id || categories[0]?.id || '',
      target_product_ids: c.target_product_ids || [],
      start_at: c.start_at ? new Date(c.start_at).toISOString().slice(0, 16) : '',
      end_at: c.end_at ? new Date(c.end_at).toISOString().slice(0, 16) : '',
      usage_limit: typeof c.usage_limit === 'number' ? c.usage_limit : '',
      allow_with_offers: Boolean(c.allow_with_offers),
      is_active: Boolean(c.is_active),
    });
    setShowAddCouponModal(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponForm.code.trim().toUpperCase();
    if (!cleanCode) {
      showToast('Please enter a coupon code', 'error');
      return;
    }

    const payload: Omit<Coupon, 'id'> = {
      code: cleanCode,
      description: couponForm.description.trim() || undefined,
      discount_type: couponForm.discount_type,
      discount_value: Number(couponForm.discount_value) || 0,
      min_cart_value: Number(couponForm.min_cart_value) || 0,
      max_discount_amount: couponForm.max_discount_amount !== '' ? Number(couponForm.max_discount_amount) : undefined,
      scope: couponForm.scope,
      target_category_id: couponForm.scope === 'category' ? couponForm.target_category_id : undefined,
      target_category_name: couponForm.scope === 'category' ? categories.find((c) => c.id === couponForm.target_category_id)?.name : undefined,
      target_product_ids: couponForm.scope === 'products' ? couponForm.target_product_ids : undefined,
      start_at: couponForm.start_at ? new Date(couponForm.start_at).toISOString() : null,
      end_at: couponForm.end_at ? new Date(couponForm.end_at).toISOString() : null,
      usage_limit: couponForm.usage_limit !== '' ? Number(couponForm.usage_limit) : undefined,
      allow_with_offers: Boolean(couponForm.allow_with_offers),
      is_active: Boolean(couponForm.is_active),
    };

    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, payload);
    } else {
      await addCoupon(payload);
    }

    setShowAddCouponModal(false);
    resetCouponForm();
  };

  // KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      productCategoryFilter === 'all' || p.category_id === productCategoryFilter;

    const matchesStock =
      productStockFilter === 'all' ||
      (productStockFilter === 'in_stock'
        ? (p.in_stock && (p.stock_quantity ?? 1) > 0)
        : (!p.in_stock || (p.stock_quantity ?? 0) <= 0));

    return matchesSearch && matchesCategory && matchesStock;
  });

  // SCREEN: ADMIN LOGIN (When not authenticated - Setup and Public Registration Removed)
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-blue-400 flex items-center justify-center mx-auto shadow-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-500 font-medium">
            Enter your administrator credentials to access the management dashboard.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Password</label>
            <div className="relative">
              <input
                type={showLoginPwd ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowLoginPwd(!showLoginPwd)}
                className="absolute right-3 top-3 text-slate-400 cursor-pointer"
                title={showLoginPwd ? 'Hide password' : 'Show password'}
              >
                {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {loginError && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/20 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Access Admin Dashboard</span>
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            &larr; Return to Public Store
          </button>
        </div>
      </div>
    );
  }

  // 3. SCREEN: ADMIN DASHBOARD (When authenticated)
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Admin Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-3xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">Store Admin Dashboard</h1>
            <p className="text-xs text-slate-400">
              Logged in as <span className="text-blue-300 font-semibold">{adminEmail || 'Administrator'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
              isSupabaseConnected
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
            <span>{isSupabaseConnected ? 'Supabase Backend Connected' : 'Local Storage Mode'}</span>
          </div>

          <button
            onClick={() => navigateTo('home')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>View Public Store</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-medium transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </span>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">From verified orders</p>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
            {totalOrdersCount}
          </span>
          <p className="text-[11px] text-blue-600 mt-1 font-semibold">
            {orders.filter((o) => o.status === 'processing').length} processing
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Items</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
            {totalProductsCount}
          </span>
          <p className="text-[11px] text-purple-600 mt-1 font-semibold">Across {categories.length} categories</p>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Backend Status</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-sm font-extrabold text-slate-900 block truncate">
            {isSupabaseConnected ? 'Live Supabase Sync' : 'Local Storage Mode'}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">PostgreSQL Ready</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('variant_manager')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'variant_manager'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Product &amp; Variant Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'offers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Offers / Banners ({offers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Orders &amp; Status ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customers</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Coupons ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Website Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'database'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase Seed SQL</span>
        </button>
      </div>

      {/* 1. PRODUCTS TAB (Original Product Management with List, Search, Edit, Delete) */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage Store Products</h3>
              <p className="text-xs text-slate-500">
                View, search, edit and delete catalog products. For multi-size/color variant matrix &amp; custom size charts, use the dedicated{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('variant_manager')}
                  className="text-blue-600 hover:underline font-bold inline cursor-pointer"
                >
                  Product &amp; Variant Manager
                </button>{' '}
                tab.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('variant_manager')}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Open advanced variants manager"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Variant Manager</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  resetProductForm();
                  setEditingProduct(null);
                  setShowAddProductModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by title, brand, category, SKU..."
                className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={productStockFilter}
                onChange={(e) => setProductStockFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock Only</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4 text-center">Home Favourite</th>
                    <th className="py-3 px-4">Variants</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => {
                    const primaryImg = (Array.isArray(prod.images) && prod.images[0]) || (prod as any).image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80';
                    const stockQty = prod.stock_quantity ?? 0;
                    const inStock = prod.in_stock && stockQty > 0;
                    const hasVars = (prod.variants && prod.variants.length > 0) || (prod.sizes && prod.sizes.length > 0) || (prod.colors && prod.colors.length > 0);

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={primaryImg}
                                alt={prod.name}
                                referrerPolicy="no-referrer"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p
                                className="font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                                onClick={() => navigateTo('product_detail', { productId: prod.id })}
                              >
                                {prod.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                {prod.brand && <span>{prod.brand}</span>}
                                {prod.sku && (
                                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                                    SKU: {prod.sku}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-700">
                            {prod.category_name || categories.find((c) => c.id === prod.category_id)?.name || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 tabular-nums">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </div>
                          {prod.original_price > prod.price && (
                            <div className="text-[11px] text-slate-400 line-through tabular-nums">
                              ₹{prod.original_price.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {inStock ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              In Stock ({stockQty})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={async () => {
                              const nextState = !prod.is_featured;
                              await updateProduct(prod.id, { is_featured: nextState });
                              showToast(
                                nextState
                                  ? `"${prod.name}" marked as Favourite & Featured on Home Page!`
                                  : `"${prod.name}" removed from Home Page Featured Deals.`,
                                nextState ? 'success' : 'info'
                              );
                            }}
                            className={`px-2.5 py-1 rounded-xl border transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold ${
                              prod.is_featured
                                ? 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100 shadow-2xs'
                                : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-amber-600 hover:border-amber-300'
                            }`}
                            title={prod.is_featured ? 'Click to remove from Home Page Featured Deals' : 'Click to mark as Favourite / Featured on Home Page'}
                          >
                            <Star className={`w-3.5 h-3.5 ${prod.is_featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                            <span>{prod.is_featured ? 'Featured' : 'Mark'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500">
                          {hasVars ? (
                            <div className="space-y-0.5">
                              {prod.sizes && prod.sizes.length > 0 && (
                                <p className="text-[10px] text-blue-700 font-medium">
                                  {prod.sizes.length} sizes ({prod.sizes.slice(0, 3).join(', ')}{prod.sizes.length > 3 ? '...' : ''})
                                </p>
                              )}
                              {prod.colors && prod.colors.length > 0 && (
                                <p className="text-[10px] text-purple-700 font-medium">
                                  {prod.colors.length} colors
                                </p>
                              )}
                              {prod.variants && prod.variants.length > 0 && (
                                <p className="text-[10px] text-slate-500">
                                  {prod.variants.length} variant rows
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">Single</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => navigateTo('product_detail', { productId: prod.id })}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View in store"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditProduct(prod)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                                  deleteProduct(prod.id);
                                  showToast(`Product "${prod.name}" deleted.`, 'info');
                                }
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-600 text-sm">No products found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try clearing your search query or filters.
                        </p>
                        {searchTerm && (
                          <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="mt-3 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer"
                          >
                            Clear Search
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
              </span>
              <span>Sorted by latest added</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCT & VARIANT MANAGER TAB (Dedicated Advanced Variant Dashboard) */}
      {activeTab === 'variant_manager' && (
        <ProductVariantDashboard />
      )}

      {/* 2. CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Manage Store Categories</h3>
            <button
              onClick={() => {
                setCategoryForm({
                  name: '',
                  slug: '',
                  description: '',
                  icon_name: 'ShoppingBag',
                  color_bg: 'bg-blue-500',
                  color_text: 'text-blue-500',
                  product_count: 0,
                });
                setEditingCategory(null);
                setShowAddCategoryModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cat.color_bg} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                    {cat.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                    <p className="text-xs text-slate-400">{cat.product_count}+ products listed</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setCategoryForm({
                        name: cat.name,
                        slug: cat.slug,
                        description: cat.description,
                        icon_name: cat.icon_name,
                        color_bg: cat.color_bg,
                        color_text: cat.color_text,
                        product_count: cat.product_count,
                      });
                      setShowAddCategoryModal(true);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete category "${cat.name}"?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. OFFERS & BANNERS TAB */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Homepage Offer Banners</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage promotional banners in real-time. Changes to discounts, titles, or active dates immediately update the homepage banner carousel.
              </p>
            </div>

            <button
              onClick={() => {
                resetOfferForm();
                setShowAddOfferModal(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Offer</span>
            </button>
          </div>

          {/* Offers List / Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">Banner Thumbnail</th>
                    <th className="p-3.5">Title &amp; Subtitle</th>
                    <th className="p-3.5">Target Category</th>
                    <th className="p-3.5">Discount</th>
                    <th className="p-3.5">Dates (Start &rarr; End)</th>
                    <th className="p-3.5">Button &amp; Link</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {offers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600 text-sm">No promotional offers created yet</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click "+ Add Offer" above to create your first dynamic homepage banner!
                        </p>
                      </td>
                    </tr>
                  ) : (
                    offers.map((offer) => {
                      const now = new Date();
                      const hasStarted = !offer.start_at || new Date(offer.start_at) <= now;
                      const hasEnded = offer.end_at && new Date(offer.end_at) < now;
                      const isCurrentlyLive = offer.is_active && hasStarted && !hasEnded;

                      return (
                        <tr key={offer.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Banner Thumbnail */}
                          <td className="p-3.5">
                            <div className="w-20 h-12 rounded-xl bg-slate-900 overflow-hidden relative border border-slate-200 shrink-0 shadow-2xs">
                              {offer.image_url ? (
                                <img
                                  src={offer.image_url}
                                  alt={offer.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                  <Image className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Title & Description */}
                          <td className="p-3.5 max-w-xs">
                            <p className="font-bold text-slate-900 truncate">
                              {offer.title?.trim() || <span className="text-slate-400 font-normal italic">No Title</span>}
                            </p>
                            {offer.description && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{offer.description}</p>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">ID: {offer.id}</span>
                          </td>

                          {/* Target Category */}
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                              {offer.category_name || (offer.category_id && offer.category_id !== 'all' ? offer.category_id : 'All Categories (Storewide)')}
                            </span>
                          </td>

                          {/* Discount Text */}
                          <td className="p-3.5">
                            {offer.discount_text || offer.discount_percentage ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
                                <Tag className="w-3 h-3 text-blue-600" />
                                <span>{offer.discount_text || `${offer.discount_percentage}% OFF`}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">None</span>
                            )}
                          </td>

                          {/* Dates */}
                          <td className="p-3.5 text-slate-600">
                            <div className="space-y-0.5 text-[11px]">
                              <div>
                                <span className="text-slate-400 font-medium">Start: </span>
                                <span className="font-semibold text-slate-800">
                                  {offer.start_at ? new Date(offer.start_at).toLocaleDateString() : 'Immediate'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium">End: </span>
                                <span className="font-semibold text-slate-800">
                                  {offer.end_at ? new Date(offer.end_at).toLocaleDateString() : 'No Expiry'}
                                </span>
                              </div>
                              {hasEnded && (
                                <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 rounded">
                                  Expired
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Button text & Link */}
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800 block text-xs">{offer.button_text || 'Shop Now'}</span>
                            <span className="text-[11px] text-slate-400 font-mono truncate max-w-[120px] block">
                              &rarr; {offer.button_link || 'categories'}
                            </span>
                          </td>

                          {/* Priority / Display Order */}
                          <td className="p-3.5">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs">
                              {offer.display_order ?? 1}
                            </span>
                          </td>

                          {/* Active / Inactive Status */}
                          <td className="p-3.5">
                            <button
                              type="button"
                              onClick={() => toggleOfferActive(offer.id, !offer.is_active)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                offer.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${offer.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              <span>{offer.is_active ? 'Active' : 'Inactive'}</span>
                            </button>
                            {isCurrentlyLive && (
                              <span className="block text-[10px] text-emerald-600 font-bold mt-1">Live on Homepage</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditOffer(offer)}
                                title="Edit Offer"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const confirmMsg = offer.title?.trim()
                                    ? `Delete offer "${offer.title}"?`
                                    : 'Delete this offer banner?';
                                  if (confirm(confirmMsg)) {
                                    deleteOffer(offer.id);
                                  }
                                }}
                                title="Delete Offer"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
        </div>
      )}

      {/* 4. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Manage Customer Orders</h3>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Total Amount</th>
                    <th className="p-3.5">Payment Details</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const isCod = order.payment_method?.toLowerCase().includes('cash on delivery') || (order.advance_paid_amount !== undefined && order.advance_paid_amount > 0);
                    const advancePaid = order.advance_paid_amount ?? (order.payment_method?.includes('Advance Paid: ₹99') || order.payment_method?.includes('Advance Paid: ₹') ? 99 : 0);
                    const remainingCod = order.remaining_cod_amount ?? (advancePaid > 0 ? Math.max(0, order.total_amount - advancePaid) : 0);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-900">
                          <button
                            type="button"
                            onClick={() => setSelectedAdminOrder(order)}
                            className="text-blue-600 hover:underline font-mono text-xs font-bold"
                          >
                            #{order.order_number}
                          </button>
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-900">{order.user_name}</p>
                          <p className="text-[10px] text-slate-400">{order.user_email}</p>
                        </td>
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 tabular-nums">
                          ₹{order.total_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <p className="font-medium text-xs">{order.payment_method}</p>
                          {isCod && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-amber-100 text-amber-900">
                                Advance: ₹{advancePaid}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-slate-100 text-slate-700">
                                Due: ₹{remainingCod}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              order.status === 'paid' || order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700'
                                : order.status === 'processing' || order.status === 'shipped' || order.status === 'confirmed'
                                ? 'bg-blue-50 text-blue-700'
                                : order.status === 'payment_pending' || order.status === 'pending'
                                ? 'bg-amber-50 text-amber-700'
                                : order.status === 'returned'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {order.status === 'payment_pending' ? 'Payment Pending' : order.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedAdminOrder(order)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-hidden"
                            >
                              <option value="payment_pending">Payment Pending</option>
                              <option value="paid">Paid</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="returned">Returned</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="failed">Failed</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. CUSTOMERS & AUDIENCE TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Registered Customers</h3>
              <span className="text-xs font-semibold text-slate-500">
                {customers.length} {customers.length === 1 ? 'Customer' : 'Customers'}
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {customers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No registered customer profiles found in database.
                </div>
              ) : (
                customers.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {c.full_name ? c.full_name.charAt(0).toUpperCase() : (c.email?.charAt(0).toUpperCase() || 'U')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{c.full_name || 'Customer'}</h4>
                        <p className="text-xs text-slate-400">
                          {c.email} {c.phone ? `· ${c.phone}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                        {c.role || 'Customer'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Newsletter Subscribers (Supabase newsletter_subscribers table) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Newsletter Subscribers</h3>
                <p className="text-xs text-slate-400">Saved to Supabase <code>newsletter_subscribers</code> table</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                Audience
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden p-4">
              {(() => {
                let subs: string[] = [];
                try {
                  subs = JSON.parse(localStorage.getItem('the_online_store_newsletter_subscribers') || '[]');
                } catch {}

                if (subs.length === 0) {
                  return (
                    <p className="text-xs text-slate-400 italic py-2 text-center">
                      No newsletter subscribers yet. Visitors can subscribe via the website footer!
                    </p>
                  );
                }

                return (
                  <div className="divide-y divide-slate-100">
                    {subs.map((email, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{email}</span>
                        <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          Active Subscriber
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 5. SUPABASE SEED SQL TAB */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span>200+ Demo Products Supabase Seed Script</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  100% compatible with your existing Supabase schema (safe INSERT with zero schema modifications, no categories.description column).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sql = generateSupabaseDemoSeedSql();
                    navigator.clipboard.writeText(sql);
                    showToast('Copied complete 218 products SQL seed script to clipboard!', 'success');
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Script</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sql = generateSupabaseDemoSeedSql();
                    const blob = new Blob([sql], { type: 'text/sql' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'supabase_seed_200_demo_products.sql';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('Downloaded supabase_seed_200_demo_products.sql!', 'success');
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .sql File</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Products Count</span>
                <span className="text-lg font-black text-slate-900">218 Products</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Mobiles, Laptops, Audio, LED, Dresses, etc.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Stock Status</span>
                <span className="text-lg font-black text-emerald-600">In Stock</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Live in-stock inventory active</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Data Safety</span>
                <span className="text-lg font-black text-emerald-600">Non-Destructive</span>
                <p className="text-[11px] text-slate-400 mt-0.5">ON CONFLICT (id) DO NOTHING</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-800">How to execute in Supabase:</h4>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4">
                <li>Click <strong>Copy SQL Script</strong> (or download the <code>.sql</code> file above).</li>
                <li>Go to your <strong>Supabase Dashboard &rarr; SQL Editor</strong>.</li>
                <li>Click <strong>New query</strong>, paste the script, and click <strong>Run</strong>.</li>
                <li>Reload your store, and all 218 demo products will appear with live Supabase sync.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* 7. COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search coupons by code or description..."
                value={couponSearchTerm}
                onChange={(e) => setCouponSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={openAddCoupon}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Coupon</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Coupons</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">{coupons.length}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Configured in store</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Coupons</span>
              <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
                {coupons.filter((c) => c.is_active).length}
              </span>
              <p className="text-[11px] text-emerald-700 mt-0.5">Shown on homepage</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Redemptions</span>
              <span className="text-xl font-extrabold text-blue-600 mt-1 block">
                {coupons.reduce((sum, c) => sum + (c.times_used || 0), 0)}
              </span>
              <p className="text-[11px] text-blue-700 mt-0.5">Across all orders</p>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">Coupon Code</th>
                    <th className="p-3.5">Discount</th>
                    <th className="p-3.5">Scope &amp; Min Order</th>
                    <th className="p-3.5">Offer Stacking</th>
                    <th className="p-3.5">Usage / Limits</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons
                    .filter(
                      (c) =>
                        c.code.toLowerCase().includes(couponSearchTerm.toLowerCase()) ||
                        (c.description && c.description.toLowerCase().includes(couponSearchTerm.toLowerCase()))
                    )
                    .map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-xs">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(coupon.code);
                                showToast(`Copied ${coupon.code}!`, 'success');
                              }}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy code"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {coupon.description && (
                            <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">{coupon.description}</p>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {coupon.discount_type === 'percentage' ? (
                            <span>
                              {coupon.discount_value}% OFF
                              {coupon.max_discount_amount ? (
                                <span className="text-[11px] text-slate-500 font-normal block">
                                  Max ₹{coupon.max_discount_amount}
                                </span>
                              ) : null}
                            </span>
                          ) : (
                            <span>Flat ₹{coupon.discount_value} OFF</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <div className="font-semibold text-slate-800">
                            {coupon.scope === 'all' && 'All Products'}
                            {coupon.scope === 'category' && `Category: ${coupon.target_category_name || coupon.target_category_id}`}
                            {coupon.scope === 'products' && `${coupon.target_product_ids?.length || 0} Products`}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Min: {coupon.min_cart_value > 0 ? `₹${coupon.min_cart_value}` : 'None'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {coupon.allow_with_offers ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              Double Discount Allowed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Exclusive (No Double Discount)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <span className="font-semibold">
                            {coupon.times_used || 0} / {coupon.usage_limit || '∞'}
                          </span>
                          {coupon.end_at && (
                            <span className="text-[11px] text-slate-400 block">
                              Exp: {new Date(coupon.end_at).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => toggleCouponActive(coupon.id, !coupon.is_active)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                              coupon.is_active
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${coupon.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            <span>{coupon.is_active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => openEditCoupon(coupon)}
                            className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
                                deleteCoupon(coupon.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {coupons.length === 0 && (
                <div className="text-center py-12 px-4">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No Coupons Created Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click "Create New Coupon" to set up your first promo discount code with flexible rules and customer visibility.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. WEBSITE SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Website &amp; Brand Settings</h3>
                  <p className="text-xs text-slate-500">
                    Control store name, logos, favicons, and branding. Updates browser title, header, footer, checkout &amp; login everywhere.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Core Store Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Store Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.store_name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, store_name: e.target.value })}
                    placeholder="e.g. Zevora or The Online Store"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Used in browser tab title, header, footer, invoice, login and checkout screens.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    placeholder="e.g. India's Premier Online Store"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Displayed below the logo in the header and alongside browser title.
                  </p>
                </div>
              </div>

              {/* Logo & Favicon Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
                {/* Store Logo */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Store Logo</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl border border-slate-700 bg-[#090a0d] flex items-center justify-center overflow-hidden shrink-0">
                      {settingsForm.logo_url ? (
                        <img
                          src={settingsForm.logo_url}
                          alt="Logo Preview"
                          className="max-w-full max-h-full object-contain p-1"
                        />
                      ) : (
                        <ShoppingBag className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={settingsForm.logo_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                        placeholder="Paste Image URL (https://...)"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{logoUploading ? 'Uploading...' : 'Upload Logo Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={logoUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Favicon */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Browser Favicon</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                      {settingsForm.favicon_url ? (
                        <img
                          src={settingsForm.favicon_url}
                          alt="Favicon Preview"
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Globe className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={settingsForm.favicon_url}
                        onChange={(e) => setSettingsForm({ ...settingsForm, favicon_url: e.target.value })}
                        placeholder="Paste Favicon URL (https://...)"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{faviconUploading ? 'Uploading...' : 'Upload Favicon Icon'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          disabled={faviconUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Announcements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Support Email</label>
                  <input
                    type="email"
                    value={settingsForm.contact_email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })}
                    placeholder="support@yourstore.in"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Support Phone</label>
                  <input
                    type="text"
                    value={settingsForm.contact_phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Top Announcement Banner Text</label>
                <input
                  type="text"
                  value={settingsForm.announcement_text || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcement_text: e.target.value })}
                  placeholder="e.g. Free Express Delivery across India on orders over ₹499"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                />
              </div>

              {/* Social Media Links Section */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Social Media Links</span>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      Homepage &amp; Footer Synced
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize your official social media URLs. All follow buttons across the Homepage and Footer update dynamically.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Instagram URL */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <label className="text-xs font-bold text-slate-800">Instagram URL</label>
                    </div>
                    <input
                      type="url"
                      value={settingsForm.instagram_url || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/yourprofile"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                    {settingsForm.instagram_url && (
                      <a
                        href={settingsForm.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-[11px] font-semibold text-rose-600 hover:underline"
                      >
                        Preview Instagram Link ↗
                      </a>
                    )}
                  </div>

                  {/* Facebook URL */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <label className="text-xs font-bold text-slate-800">Facebook URL</label>
                    </div>
                    <input
                      type="url"
                      value={settingsForm.facebook_url || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    {settingsForm.facebook_url && (
                      <a
                        href={settingsForm.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        Preview Facebook Link ↗
                      </a>
                    )}
                  </div>

                  {/* Twitter / X URL */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <label className="text-xs font-bold text-slate-800">X / Twitter URL</label>
                    </div>
                    <input
                      type="url"
                      value={settingsForm.twitter_url || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, twitter_url: e.target.value })}
                      placeholder="https://x.com/yourprofile"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                    />
                    {settingsForm.twitter_url && (
                      <a
                        href={settingsForm.twitter_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-[11px] font-semibold text-slate-800 hover:underline"
                      >
                        Preview X / Twitter Link ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Live Brand Preview
                </span>
                <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    {settingsForm.logo_url ? (
                      <img
                        src={settingsForm.logo_url}
                        alt="Logo"
                        className="w-9 h-9 object-contain rounded-xl border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                        {settingsForm.store_name || 'Store Name'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {settingsForm.tagline || 'Official Web Platform'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Browser Title: {settingsForm.store_name || 'Store'} {settingsForm.tagline ? `- ${settingsForm.tagline}` : ''}
                  </span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{isSavingSettings ? 'Saving...' : 'Save Website Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. iPhone 15 Pro Max"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={productForm.discount_percent}
                    onChange={(e) => setProductForm({ ...productForm, discount_percent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm({ ...productForm, stock_quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Home Page Featured / Favourite Selection */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.is_featured)}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${productForm.is_featured ? 'fill-amber-500 text-amber-500' : 'text-amber-600'}`} />
                      <span>Featured / Favourite Product on Home Page</span>
                    </span>
                    <p className="text-[11px] text-amber-700/80 mt-0.5">
                      Showcase this product on the Home Page "Featured Deals" section in real-time.
                    </p>
                  </div>
                </label>
              </div>

              {/* Product Photos Section (Multi-Image Gallery & Supabase Storage) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Product Photos Gallery
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload multiple images. First photo is automatically the primary cover image.
                    </p>
                  </div>
                  {productForm.images && productForm.images.length > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {productForm.images.length} {productForm.images.length === 1 ? 'Photo' : 'Photos'}
                    </span>
                  )}
                </div>

                {/* Hidden multiple file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {/* Upload Buttons & URL Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{uploadProgress || 'Uploading to Supabase...'}</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-4 h-4" />
                        <span>Upload Photos from Device</span>
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
                          handleAddCustomImageUrl();
                        }
                      }}
                      placeholder="Or paste photo URL..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomImageUrl}
                      disabled={!customImageUrl.trim()}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 transition-colors"
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

                {/* Image Previews / Thumbnails Grid */}
                {productForm.images && productForm.images.length > 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Drag cards or use arrows below to reorder.</span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Supabase Storage Synced
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {productForm.images.map((imgUrl, idx) => (
                        <div
                          key={`${imgUrl}-${idx}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, idx)}
                          className={`group relative rounded-xl border-2 bg-white overflow-hidden shadow-2xs transition-all flex flex-col ${
                            idx === 0
                              ? 'border-blue-600 ring-2 ring-blue-500/20'
                              : draggedImageIndex === idx
                              ? 'border-dashed border-slate-400 opacity-60'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Image Box */}
                          <div className="h-28 w-full bg-slate-100 flex items-center justify-center p-1.5 relative overflow-hidden">
                            <img
                              src={imgUrl}
                              alt={`Product photo ${idx + 1}`}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/png?text=Photo+Error';
                              }}
                            />

                            {/* Badge */}
                            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                              {idx === 0 ? (
                                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                                  <Star className="w-2.5 h-2.5 fill-current" />
                                  <span>Cover</span>
                                </span>
                              ) : (
                                <span className="bg-slate-900/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                                  #{idx + 1}
                                </span>
                              )}
                            </div>

                            {/* Quick Delete Overlay Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              title="Delete photo"
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Card Controls */}
                          <div className="p-1.5 bg-white border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, idx - 1)}
                                disabled={idx === 0}
                                title="Move left / earlier"
                                className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, idx + 1)}
                                disabled={idx === productForm.images.length - 1}
                                title="Move right / later"
                                className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>

                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                title="Make this the primary cover image"
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 px-1 py-0.5 rounded hover:bg-blue-50"
                              >
                                Set Cover
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Empty State */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-center cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-2">
                      <ImagePlus className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No photos added yet</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Click to upload photos (front, back, details, size-chart) to Supabase Storage
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Write clear product specs and description..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Smart Watches"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Category overview..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Theme Color</label>
                <select
                  value={categoryForm.color_bg}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color_bg: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="bg-blue-500">Blue</option>
                  <option value="bg-indigo-500">Indigo</option>
                  <option value="bg-emerald-500">Emerald</option>
                  <option value="bg-pink-500">Pink</option>
                  <option value="bg-amber-500">Amber</option>
                  <option value="bg-purple-500">Purple</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  {editingCategory ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT OFFER MODAL */}
      {showAddOfferModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>{editingOffer ? 'Edit Offer Banner' : 'Create New Offer Banner'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddOfferModal(false);
                  resetOfferForm();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4 text-xs">
              {/* Offer Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Offer Title <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mega Clearance Sale or Festival Special (Optional)"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Target Category & Discount Percentage in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={offerForm.category_id}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setOfferForm({
                        ...offerForm,
                        category_id: newCat,
                        button_link: newCat === 'all' ? 'categories' : newCat,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white font-semibold"
                  >
                    <option value="all">All Categories (Storewide Discount)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Every product in this category receives the discount automatically.
                  </p>
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Percentage (%) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      required
                      placeholder="e.g. 30"
                      value={offerForm.discount_percentage}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setOfferForm({
                          ...offerForm,
                          discount_percentage: val,
                          discount_text: val > 0 ? `${val}% OFF` : '',
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold text-blue-600 pr-8"
                    />
                    <span className="absolute right-3 top-2 font-bold text-slate-400 text-xs">%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Example: 30 for 30% OFF, 50 for 50% OFF.
                  </p>
                </div>
              </div>

              {/* Discount Badge Display Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discount Badge Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. 30% OFF or Flat ₹500 OFF"
                  value={offerForm.discount_text}
                  onChange={(e) => setOfferForm({ ...offerForm, discount_text: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-bold text-emerald-600"
                />
              </div>

              {/* Description / Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Offer Description / Subtitle <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description of the deal or products covered (Optional)"
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400"
                />
              </div>

              {/* Banner Image Upload & URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Banner Image <span className="text-rose-500">*</span>
                </label>

                <input
                  type="file"
                  ref={bannerFileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleBannerFileChange}
                  className="hidden"
                />

                {offerForm.image_url ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-14 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden shrink-0 shadow-xs">
                        <img
                          src={offerForm.image_url}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Banner Image Ready</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {offerForm.image_url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => bannerFileInputRef.current?.click()}
                        disabled={isUploadingBanner}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isUploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        <span>Change Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOfferForm({ ...offerForm, image_url: '' })}
                        className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="p-5 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/20 rounded-2xl cursor-pointer text-center transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        {isUploadingBanner ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {isUploadingBanner ? 'Uploading to Supabase Storage...' : 'Upload Banner Image from Computer'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Stores image in Supabase Storage and returns permanent public URL
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">or use image URL</span>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={offerForm.image_url}
                      onChange={(e) => setOfferForm({ ...offerForm, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400"
                    />
                  </div>
                )}

                {bannerUploadError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{bannerUploadError}</p>
                )}
              </div>

              {/* Button Text & Button Link */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    placeholder="Shop Now"
                    value={offerForm.button_text}
                    onChange={(e) => setOfferForm({ ...offerForm, button_text: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Button Destination / Link</label>
                  <select
                    value={offerForm.button_link}
                    onChange={(e) => setOfferForm({ ...offerForm, button_link: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white"
                  >
                    <option value="categories">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        Category: {c.name}
                      </option>
                    ))}
                    <option value="cart">Cart</option>
                    <option value="orders">Orders</option>
                  </select>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date &amp; Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={offerForm.start_at}
                    onChange={(e) => setOfferForm({ ...offerForm, start_at: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Leave empty for immediate activation</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date &amp; Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={offerForm.end_at}
                    onChange={(e) => setOfferForm({ ...offerForm, end_at: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Leave empty for no expiration</p>
                </div>
              </div>

              {/* Display Priority & Active Checkbox */}
              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Priority (Order)</label>
                  <input
                    type="number"
                    min="1"
                    value={offerForm.display_order}
                    onChange={(e) => setOfferForm({ ...offerForm, display_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={offerForm.is_active}
                      onChange={(e) => setOfferForm({ ...offerForm, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-800">Set as Active</span>
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5">Inactive offers won't show on homepage</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddOfferModal(false);
                    resetOfferForm();
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingBanner}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editingOffer ? 'Save Changes' : 'Publish Offer Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Order Details Modal (Requirement 19) */}
      {selectedAdminOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Order #{selectedAdminOrder.order_number}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      selectedAdminOrder.status === 'paid' || selectedAdminOrder.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedAdminOrder.status === 'confirmed' || selectedAdminOrder.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedAdminOrder.status === 'payment_pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {selectedAdminOrder.status === 'payment_pending' ? 'Payment Pending' : selectedAdminOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {selectedAdminOrder.id} · Placed {new Date(selectedAdminOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdminOrder(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment & Financial Details (Requirement 19) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Payment &amp; Financial Breakdown
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Total Order Amount */}
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Total Order Amount</span>
                  <span className="text-base font-extrabold text-blue-600 tabular-nums">
                    ₹{selectedAdminOrder.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Payment Method */}
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Payment Method</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {selectedAdminOrder.payment_method}
                  </span>
                </div>

                {/* Advance Paid */}
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Advance Paid</span>
                  <span className="text-sm font-bold text-emerald-700 tabular-nums">
                    ₹{selectedAdminOrder.advance_paid_amount ?? (selectedAdminOrder.payment_method.includes('Advance Paid: ₹99') || selectedAdminOrder.payment_method.includes('Advance Paid: ₹') ? 99 : 0)}
                  </span>
                </div>

                {/* Remaining COD Amount */}
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Remaining COD Amount</span>
                  <span className="text-sm font-bold text-amber-700 tabular-nums">
                    ₹{selectedAdminOrder.remaining_cod_amount ?? (
                      (selectedAdminOrder.advance_paid_amount ?? (selectedAdminOrder.payment_method.includes('Advance Paid') ? 99 : 0)) > 0
                        ? Math.max(0, selectedAdminOrder.total_amount - (selectedAdminOrder.advance_paid_amount ?? 99))
                        : 0
                    )}
                  </span>
                </div>

                {/* Advance Payment Status */}
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Advance Payment Status</span>
                  <span className="text-xs font-bold text-slate-900 capitalize flex items-center gap-1.5 mt-0.5">
                    {selectedAdminOrder.advance_payment_status === 'paid' || (selectedAdminOrder.advance_paid_amount && selectedAdminOrder.advance_paid_amount > 0) ? (
                      <span className="text-emerald-700 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Paid (Verified via Cashfree)</span>
                      </span>
                    ) : selectedAdminOrder.status === 'payment_pending' ? (
                      <span className="text-amber-700 font-bold">Pending Payment</span>
                    ) : (
                      <span className="text-slate-600 font-semibold">{selectedAdminOrder.advance_payment_status || 'N/A'}</span>
                    )}
                  </span>
                </div>

                {/* Cashfree Payment Reference */}
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Cashfree Payment Reference</span>
                  <span className="text-xs font-mono font-bold text-slate-800 break-all">
                    {selectedAdminOrder.payment_reference ||
                      selectedAdminOrder.payment_method.match(/CF-Pay: ([a-zA-Z0-9_-]+)/)?.[1] ||
                      selectedAdminOrder.payment_method.match(/Txn: ([a-zA-Z0-9_-]+)/)?.[1] ||
                      (selectedAdminOrder.shipping_address as any)?.cf_payment_id ||
                      'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 block">Customer Information</span>
                <p className="font-semibold text-slate-900">{selectedAdminOrder.user_name}</p>
                <p className="text-slate-500">{selectedAdminOrder.user_email}</p>
                <p className="text-slate-500">User ID: {selectedAdminOrder.user_id}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 block">Shipping Address</span>
                <p className="font-semibold text-slate-900">{selectedAdminOrder.shipping_address.full_name}</p>
                <p className="text-slate-600">
                  {selectedAdminOrder.shipping_address.street}, {selectedAdminOrder.shipping_address.city} - {selectedAdminOrder.shipping_address.postal_code}
                </p>
                <p className="text-slate-500">Phone: {selectedAdminOrder.shipping_address.phone}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Order Items ({selectedAdminOrder.items.length})
              </span>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {selectedAdminOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 shrink-0 flex items-center justify-center">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.product_name}</p>
                        <p className="text-slate-400">Qty: {item.quantity} · Price: ₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with Status Update */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700">Change Status:</label>
                <select
                  value={selectedAdminOrder.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as OrderStatus;
                    await updateOrderStatus(selectedAdminOrder.id, newStatus);
                    setSelectedAdminOrder({ ...selectedAdminOrder, status: newStatus });
                  }}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                >
                  <option value="payment_pending">Payment Pending</option>
                  <option value="paid">Paid</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="returned">Returned</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAdminOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddCouponModal(false);
                  resetCouponForm();
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              {/* Coupon Code & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coupon Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUPER50"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Codes are automatically converted to uppercase.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description / Promo Label</label>
                  <input
                    type="text"
                    value={couponForm.description}
                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                    placeholder="e.g. Flat ₹200 OFF on orders above ₹1,499"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Shown to customers on the homepage banner.</p>
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="font-bold text-slate-700 block">Discount Configuration</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Discount Type</label>
                    <select
                      value={couponForm.discount_type}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discount_type: e.target.value as 'percentage' | 'fixed',
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-semibold"
                    >
                      <option value="percentage">Percentage (%) Discount</option>
                      <option value="fixed">Fixed Amount (₹) Discount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {couponForm.discount_type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={couponForm.discount_type === 'percentage' ? 100 : 100000}
                      value={couponForm.discount_value}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, discount_value: Math.max(1, Number(e.target.value)) })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Minimum Cart Value (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={couponForm.min_cart_value}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, min_cart_value: Math.max(0, Number(e.target.value)) })
                      }
                      placeholder="0 for no minimum"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Leave 0 to allow on any cart total.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Maximum Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      disabled={couponForm.discount_type !== 'percentage'}
                      value={couponForm.max_discount_amount}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          max_discount_amount: e.target.value === '' ? '' : Math.max(1, Number(e.target.value)),
                        })
                      }
                      placeholder={couponForm.discount_type === 'percentage' ? 'e.g. 500 (Optional)' : 'N/A for fixed'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Optional maximum limit for percentage discounts.</p>
                  </div>
                </div>
              </div>

              {/* Applicability Scope */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Applies To (Scope)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCouponForm({ ...couponForm, scope: 'all' })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      couponForm.scope === 'all'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Products
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponForm({ ...couponForm, scope: 'category' })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      couponForm.scope === 'category'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Specific Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponForm({ ...couponForm, scope: 'products' })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      couponForm.scope === 'products'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Specific Products
                  </button>
                </div>

                {couponForm.scope === 'category' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Category</label>
                    <select
                      value={couponForm.target_category_id}
                      onChange={(e) => setCouponForm({ ...couponForm, target_category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-semibold"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {couponForm.scope === 'products' && (
                  <div className="pt-2 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-600">
                      Select Eligible Products ({couponForm.target_product_ids.length} selected)
                    </label>
                    <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-white">
                      {products.map((p) => {
                        const checked = couponForm.target_product_ids.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCouponForm({
                                    ...couponForm,
                                    target_product_ids: [...couponForm.target_product_ids, p.id],
                                  });
                                } else {
                                  setCouponForm({
                                    ...couponForm,
                                    target_product_ids: couponForm.target_product_ids.filter((id) => id !== p.id),
                                  });
                                }
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs text-slate-800 flex-1 truncate">{p.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">₹{p.price.toLocaleString('en-IN')}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates & Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Start Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={couponForm.start_at}
                    onChange={(e) => setCouponForm({ ...couponForm, start_at: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={couponForm.end_at}
                    onChange={(e) => setCouponForm({ ...couponForm, end_at: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Usage Limit (Total)</label>
                  <input
                    type="number"
                    min={1}
                    value={couponForm.usage_limit}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        usage_limit: e.target.value === '' ? '' : Math.max(1, Number(e.target.value)),
                      })
                    }
                    placeholder="Unlimited"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              {/* Stacking Rule & Active Checkbox */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={couponForm.allow_with_offers}
                    onChange={(e) => setCouponForm({ ...couponForm, allow_with_offers: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">
                      Allow Double Discount with Category Offers
                    </span>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      When enabled, this coupon can be stacked on top of items that already have an active category offer discount. When unchecked, coupon only discounts items with no category deal.
                    </p>
                  </div>
                </label>

                <div className="border-t border-slate-200/80 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={couponForm.is_active}
                      onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-slate-800 text-xs">
                      Activate Coupon Immediately (Visible on homepage coupons section)
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCouponModal(false);
                    resetCouponForm();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

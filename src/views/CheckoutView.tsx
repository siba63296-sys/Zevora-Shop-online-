import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Address } from '../types';
import confetti from 'canvas-confetti';
import {
  createCashfreeOrderSession,
  launchCashfreeCheckout,
  verifyCashfreePayment,
  getCashfreeConfigStatus,
  CashfreeConfigStatus,
} from '../lib/cashfree';
import {
  ChevronLeft,
  CheckCircle2,
  Plus,
  ShieldCheck,
  CreditCard,
  Truck,
  Check,
  Building,
  Phone,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Lock,
  X,
  Loader2,
  Tag,
  Info,
  Smartphone,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartCount,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    addresses,
    selectedAddress,
    setSelectedAddress,
    addAddress,
    placeOrder,
    navigateTo,
    showToast,
    user,
    clearCart,
    refreshCatalog,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    activeCoupons,
    storeSettings,
  } = useStore();

  const [checkoutCouponInput, setCheckoutCouponInput] = useState('');
  const [showCheckoutCoupons, setShowCheckoutCoupons] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express' | 'same_day'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Cashfree Gateway Status & Return Verification
  const [cfConfig, setCfConfig] = useState<CashfreeConfigStatus | null>(null);
  const [isCheckingCfConfig, setIsCheckingCfConfig] = useState(true);
  const [verifyingCfOrder, setVerifyingCfOrder] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('cf_order_id');
    }
    return null;
  });
  const [cfVerificationState, setCfVerificationState] = useState<'verifying' | 'success' | 'failed' | null>(null);
  const [cfPaymentResult, setCfPaymentResult] = useState<any>(null);

  const refreshCfConfig = async () => {
    setIsCheckingCfConfig(true);
    try {
      const cfg = await getCashfreeConfigStatus();
      setCfConfig(cfg);
    } finally {
      setIsCheckingCfConfig(false);
    }
  };

  useEffect(() => {
    refreshCfConfig();
  }, []);

  useEffect(() => {
    if (!verifyingCfOrder) return;

    let isMounted = true;
    const isCodReturn = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('is_cod') === 'true';

    const verifyPayment = async () => {
      setCfVerificationState('verifying');
      try {
        const res = await verifyCashfreePayment(verifyingCfOrder, isCodReturn);
        if (!isMounted) return;
        setCfPaymentResult(res);

        if (res.isPaid) {
          setCfVerificationState('success');
          clearCart();
          await refreshCatalog();
          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });
          } catch {}
          showToast(res.isCod ? '₹99 COD Advance verified! Order confirmed.' : 'Payment confirmed & verified by Cashfree!', 'success');
        } else {
          setCfVerificationState('failed');
          showToast(res.error || `Payment status: ${res.order_status || 'Incomplete'}`, 'error');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setCfVerificationState('failed');
        showToast(err?.message || 'Failed to verify Cashfree payment.', 'error');
      }
    };

    verifyPayment();
    return () => {
      isMounted = false;
    };
  }, [verifyingCfOrder]);

  // COD policy agreement
  const [codPolicyAgreed, setCodPolicyAgreed] = useState(true);

  // New Address Form State
  const [newAddr, setNewAddr] = useState({
    full_name: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });

  const deliveryFees = {
    standard: 0,
    express: 99,
    same_day: 199,
  };

  const deliveryTitles = {
    standard: 'Standard Delivery (3-5 days)',
    express: 'Express Delivery (1-2 days)',
    same_day: 'Same Day Delivery (Today before 2 PM)',
  };

  const currentDeliveryFee = deliveryFees[deliveryOption];

  // Payment rules
  const isOnlinePayment = paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'netbanking';
  const isCod = paymentMethod === 'cod';

  // Base Total for items and chosen delivery fee
  const productTotal = cartTotal + currentDeliveryFee;

  // UPI/Card online payment → automatically give 20% OFF
  const onlineDiscount = isOnlinePayment ? Math.round(cartTotal * 0.2) : 0;

  // Final Order Value
  const finalOrderValue = isOnlinePayment
    ? Math.max(0, productTotal - onlineDiscount)
    : productTotal;

  // COD Advance & Remaining Due on Delivery
  // The ₹99 is NOT an additional COD fee.
  // It is an ADVANCE PAYMENT that is deducted from the product's total price.
  // Example: Product price = ₹999, COD advance = ₹99, Remaining on delivery = ₹900, Final Order Value = ₹999.
  // If product/order total is less than ₹99, handle safely and do not allow a negative remaining amount:
  const codAdvance = isCod ? Math.min(99, finalOrderValue) : 0;
  const codRemainingOnDelivery = isCod ? Math.max(0, finalOrderValue - codAdvance) : 0;
  const payNowAmount = isCod ? codAdvance : finalOrderValue;
  const finalTotal = finalOrderValue;

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.full_name || !newAddr.street || !newAddr.city || !newAddr.postal_code) {
      showToast('Please fill all required address fields', 'error');
      return;
    }
    addAddress(newAddr);
    setShowAddressModal(false);
    setNewAddr({
      full_name: '',
      phone: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India',
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!selectedAddress) {
      showToast('Please select or add a delivery address', 'error');
      return;
    }

    // Cash on Delivery Flow with Real ₹99 Cashfree Advance Payment
    if (isCod) {
      if (!codPolicyAgreed) {
        showToast('Please agree to the COD advance payment policy.', 'error');
        return;
      }

      if (!cfConfig?.configured) {
        showToast('Cashfree Payment Gateway is not configured. Please add CASHFREE_APP_ID and CASHFREE_SECRET_KEY in server environment variables.', 'error');
        return;
      }

      setIsSubmitting(true);
      try {
        const orderId = crypto.randomUUID();
        const displayOrderNumber = `ORD-${orderId.substring(0, 8).toUpperCase()}`;

        // 1. DO NOT confirm the COD order yet.
        // Create payment-pending COD order in Supabase with Product Total (e.g. ₹999, NOT ₹1,098)
        await placeOrder({
          address: selectedAddress,
          deliveryOption: deliveryTitles[deliveryOption],
          deliveryFee: currentDeliveryFee,
          paymentMethod: `Cash on Delivery (₹${codAdvance} Advance Pending)`,
          orderId,
          orderNumber: displayOrderNumber,
          status: 'payment_pending',
          customTotal: finalTotal, // Exactly Product Total (e.g. ₹999) - never ₹1,098
          customDiscount: 0,
          advancePaidAmount: 0,
          remainingCodAmount: codRemainingOnDelivery,
          advancePaymentStatus: 'payment_pending',
          clearCartAfter: false, // Keep cart until ₹99 advance payment is verified by Cashfree
        });

        // 2. Create Cashfree payment session for EXACTLY ₹99 (or codAdvance)
        const returnUrl = `${window.location.origin}/?cf_order_id=${orderId}&view=checkout_status&is_cod=true`;
        const session = await createCashfreeOrderSession({
          orderId,
          orderAmount: codAdvance, // EXACTLY ₹99 advance payment
          customerName: selectedAddress.full_name || user?.full_name || 'Customer',
          customerEmail: user?.email || (selectedAddress as any)?.email || 'customer@example.com',
          customerPhone: selectedAddress.phone || '9876543210',
          returnUrl,
          userId: user?.id || null,
          discountAmount: 0,
          shippingAddress: selectedAddress,
          paymentMethod: 'Cash on Delivery',
          isCod: true,
          totalOrderAmount: finalTotal,
          remainingCodAmount: codRemainingOnDelivery,
          couponCode: appliedCoupon?.code,
          couponDiscount: couponDiscount,
          items: cart.map((it) => ({
            product_id: it.product_id,
            product_name: it.product.name,
            product_image: it.product.images[0] || '',
            price: it.variant_price ?? it.product.price,
            original_price: it.variant_original_price ?? it.product.original_price,
            color: it.selected_color,
            size: it.selected_size,
            variant_sku: it.selected_variant_sku,
            variant_id: it.selected_variant_id,
            applied_offer_id: it.product.applied_offer_id,
            category_id: it.product.category_id,
            quantity: it.quantity,
          })),
        });

        if (session.missingCredentials) {
          showToast('Cashfree App ID & Secret Key are missing on the server.', 'error');
          setIsSubmitting(false);
          return;
        }

        if (!session.success || !session.payment_session_id) {
          showToast(session.error || 'Failed to initiate Cashfree ₹99 advance session.', 'error');
          setIsSubmitting(false);
          return;
        }

        // 3. Open Cashfree payment checkout for ₹99
        showToast('Redirecting to Cashfree to pay ₹99 COD advance...', 'info');
        const checkoutRes = await launchCashfreeCheckout(session.payment_session_id, session.environment);
        if (!checkoutRes.success) {
          showToast(checkoutRes.error || 'Failed to open Cashfree payment window.', 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Error processing COD advance payment.', 'error');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Real Cashfree Full Online Payment Flow (UPI, Card, Netbanking)
    if (isOnlinePayment) {
      if (!cfConfig?.configured) {
        showToast('Cashfree Payment Gateway is not configured. Please add CASHFREE_APP_ID and CASHFREE_SECRET_KEY in server environment variables.', 'error');
        return;
      }

      setIsSubmitting(true);
      try {
        const orderId = crypto.randomUUID();
        const displayOrderNumber = `ORD-${orderId.substring(0, 8).toUpperCase()}`;

        // 1. Create order in Supabase with 'payment_pending' status
        await placeOrder({
          address: selectedAddress,
          deliveryOption: deliveryTitles[deliveryOption],
          deliveryFee: currentDeliveryFee,
          paymentMethod: `Cashfree ${paymentMethod.toUpperCase()} (Pending Payment)`,
          orderId,
          orderNumber: displayOrderNumber,
          status: 'payment_pending',
          customTotal: finalTotal,
          customDiscount: onlineDiscount,
          advancePaidAmount: 0,
          remainingCodAmount: 0,
          advancePaymentStatus: '',
          clearCartAfter: false, // Keep cart until payment is verified by Cashfree
        });

        // 2. Call server-side proxy to create real Cashfree payment session
        const returnUrl = `${window.location.origin}/?cf_order_id=${orderId}&view=checkout_status`;
        const session = await createCashfreeOrderSession({
          orderId,
          orderAmount: finalTotal,
          customerName: selectedAddress.full_name || user?.full_name || 'Customer',
          customerEmail: user?.email || (selectedAddress as any)?.email || 'customer@example.com',
          customerPhone: selectedAddress.phone || '9876543210',
          returnUrl,
          userId: user?.id || null,
          discountAmount: onlineDiscount,
          shippingAddress: selectedAddress,
          paymentMethod: `Cashfree ${paymentMethod.toUpperCase()}`,
          isCod: false,
          totalOrderAmount: finalTotal,
          couponCode: appliedCoupon?.code,
          couponDiscount: couponDiscount,
          items: cart.map((it) => ({
            product_id: it.product_id,
            product_name: it.product.name,
            product_image: it.product.images[0] || '',
            price: it.variant_price ?? it.product.price,
            original_price: it.variant_original_price ?? it.product.original_price,
            color: it.selected_color,
            size: it.selected_size,
            variant_sku: it.selected_variant_sku,
            variant_id: it.selected_variant_id,
            applied_offer_id: it.product.applied_offer_id,
            category_id: it.product.category_id,
            quantity: it.quantity,
          })),
        });

        if (session.missingCredentials) {
          showToast('Cashfree App ID & Secret Key are missing on the server.', 'error');
          setIsSubmitting(false);
          return;
        }

        if (!session.success || !session.payment_session_id) {
          showToast(session.error || 'Failed to initiate Cashfree payment session.', 'error');
          setIsSubmitting(false);
          return;
        }

        // 3. Launch real Cashfree Checkout flow
        showToast('Redirecting to Cashfree secure payment...', 'info');
        const checkoutRes = await launchCashfreeCheckout(session.payment_session_id, session.environment);
        if (!checkoutRes.success) {
          showToast(checkoutRes.error || 'Failed to launch Cashfree checkout.', 'error');
        }
      } catch (err: any) {
        showToast(err?.message || 'Error processing online payment.', 'error');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  // Cashfree Order Return Verification Screen
  if (verifyingCfOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          {cfVerificationState === 'verifying' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Verifying Payment with Cashfree...</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Please wait while our server verifies the transaction with Cashfree payment gateway. Do not close or refresh this page.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-600">
                Order Reference: {verifyingCfOrder}
              </div>
            </div>
          )}

          {cfVerificationState === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {cfPaymentResult?.isCod ? '₹99 COD Advance Verified ✓' : 'Payment Verified by Cashfree ✓'}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight pt-2">
                  {cfPaymentResult?.isCod ? 'COD Order Confirmed!' : 'Payment Successful!'}
                </h2>
                <p className="text-xs text-slate-500">
                  {cfPaymentResult?.isCod
                    ? 'Your ₹99 COD advance payment has been verified by Cashfree. Your COD order has been confirmed!'
                    : 'Your payment has been verified server-side with Cashfree and your order is marked as paid.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-bold text-slate-900">{verifyingCfOrder}</span>
                </div>
                {cfPaymentResult?.cf_order_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cashfree Order ID:</span>
                    <span className="font-mono font-medium text-slate-700">{cfPaymentResult.cf_order_id}</span>
                  </div>
                )}
                {cfPaymentResult?.payment?.cf_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cashfree Payment Ref:</span>
                    <span className="font-mono font-medium text-slate-700">{cfPaymentResult.payment.cf_payment_id}</span>
                  </div>
                )}

                {cfPaymentResult?.isCod ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Advance Status:</span>
                      <span className="font-bold text-emerald-600">PAID (Verified via Cashfree)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">COD Advance Paid Now:</span>
                      <span className="font-bold text-emerald-700">₹{cfPaymentResult.advancePaid ?? 99}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Remaining Due on Delivery:</span>
                      <span className="font-bold text-amber-700">₹{cfPaymentResult.remainingCod ?? 0}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                      <span className="text-slate-800">Total Order Amount:</span>
                      <span className="text-base text-blue-600">
                        ₹{cfPaymentResult.totalOrderAmount?.toLocaleString('en-IN') || finalTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Status:</span>
                      <span className="font-bold text-emerald-600">PAID (Verified)</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                      <span className="text-slate-700 font-semibold">Total Paid:</span>
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{cfPaymentResult?.order_amount?.toLocaleString('en-IN') || finalTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  window.history.replaceState({}, '', '/');
                  navigateTo('orders');
                }}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                View My Orders &amp; Track Shipment
              </button>
            </div>
          )}

          {cfVerificationState === 'failed' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {cfPaymentResult?.isCod ? 'COD Advance Payment Incomplete' : 'Payment Not Completed'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  {cfPaymentResult?.isCod
                    ? `The ₹99 advance payment was not completed, failed, or was cancelled at Cashfree. Your COD order has NOT been confirmed.`
                    : `The payment transaction was cancelled, expired, or declined at Cashfree gateway. Your order #${verifyingCfOrder} remains unpaid.`}
                </p>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 text-left space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Gateway Status:</span>
                  <span className="font-bold text-rose-700 uppercase">{cfPaymentResult?.order_status || 'FAILED / PENDING'}</span>
                </div>
                {cfPaymentResult?.error && (
                  <p className="text-rose-600 text-[11px]">{cfPaymentResult.error}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setVerifyingCfOrder(null);
                    setCfVerificationState(null);
                    window.history.replaceState({}, '', '/');
                    navigateTo('checkout');
                  }}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {cfPaymentResult?.isCod ? 'Retry ₹99 Advance Payment' : 'Retry Payment'}
                </button>
                <button
                  onClick={() => {
                    setVerifyingCfOrder(null);
                    setCfVerificationState(null);
                    window.history.replaceState({}, '', '/');
                    navigateTo('cart');
                  }}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Return to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 py-2 border-b border-slate-200">
        <button
          onClick={() => {
            if (step > 1) setStep((s) => (s - 1) as any);
            else navigateTo('cart');
          }}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {storeSettings.store_name || 'The Online Store'} Secure Checkout
          </span>
        </div>
      </div>

      {/* Step Wizard Progress (Matching Reference Screen 7) */}
      <div className="flex items-center justify-between px-6 py-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 text-xs font-bold transition-colors ${
            step >= 1 ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
              step >= 1 ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            1
          </span>
          <span>Address</span>
        </button>

        <div className={`h-0.5 flex-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>

        <button
          onClick={() => setStep(2)}
          className={`flex items-center gap-2 text-xs font-bold transition-colors ${
            step >= 2 ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
              step >= 2 ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            2
          </span>
          <span>Delivery</span>
        </button>

        <div className={`h-0.5 flex-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>

        <button
          onClick={() => setStep(3)}
          className={`flex items-center gap-2 text-xs font-bold transition-colors ${
            step >= 3 ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
              step >= 3 ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            3
          </span>
          <span>Payment</span>
        </button>
      </div>

      {/* STEP 1: SHIPPING ADDRESS */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Shipping Address</h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="space-y-3">
            {addresses.map((addr) => {
              const isSelected = selectedAddress.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 bg-white ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{addr.full_name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddressModal(true);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {addr.street}
                      {addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}, {addr.state} -{' '}
                      {addr.postal_code}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Phone: {addr.phone}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
          >
            <span>Continue to Delivery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: DELIVERY OPTIONS */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Delivery Options</h2>

          <div className="space-y-3">
            {/* Standard */}
            <div
              onClick={() => setDeliveryOption('standard')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between bg-white ${
                deliveryOption === 'standard'
                  ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    deliveryOption === 'standard'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {deliveryOption === 'standard' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Standard Delivery</h4>
                  <p className="text-xs text-slate-500">Delivered within 3-5 business days</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600">FREE (₹0)</span>
            </div>

            {/* Express */}
            <div
              onClick={() => setDeliveryOption('express')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between bg-white ${
                deliveryOption === 'express'
                  ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    deliveryOption === 'express'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {deliveryOption === 'express' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Express Delivery</h4>
                  <p className="text-xs text-slate-500">Delivered within 1-2 business days</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900 tabular-nums">₹99</span>
            </div>

            {/* Same Day */}
            <div
              onClick={() => setDeliveryOption('same_day')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between bg-white ${
                deliveryOption === 'same_day'
                  ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    deliveryOption === 'same_day'
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {deliveryOption === 'same_day' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Same Day Delivery</h4>
                  <p className="text-xs text-slate-500">Delivered today (ordered before 2 PM)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900 tabular-nums">₹199</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT METHOD & REVIEW */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Payment Method</h2>
            {isOnlinePayment && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>20% OFF Applied</span>
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* UPI */}
            <div
              onClick={() => setPaymentMethod('upi')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between bg-white ${
                paymentMethod === 'upi'
                  ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'upi' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'upi' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">UPI Instant Pay</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                      20% OFF
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600">Extra 20% Discount</span>
            </div>

            {/* Credit / Debit Card */}
            <div
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between bg-white ${
                paymentMethod === 'card'
                  ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'card' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'card' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Credit / Debit Card</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                      20% OFF
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Visa, MasterCard, RuPay, Amex</p>
                </div>
              </div>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>

            {/* Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod('cod')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white space-y-3 ${
                paymentMethod === 'cod'
                  ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-xs'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'cod' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">Cash on Delivery (COD)</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        ₹{codAdvance} Advance (Deducted from Total)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Pay ₹{codAdvance} online advance now · Pay remaining ₹{codRemainingOnDelivery.toLocaleString('en-IN')} in cash on delivery
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-600">Available</span>
              </div>

              {/* COD Advance Policy Agreement */}
              {isCod && (
                <div
                  className="mt-3 pt-3 border-t border-slate-200 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <p className="font-bold text-amber-900 leading-snug">
                        COD Advance Payment of ₹{codAdvance}
                      </p>
                    </div>
                    <p className="text-[11px] text-amber-800/90 pl-6 leading-relaxed">
                      To confirm your COD order, an advance of <strong>₹{codAdvance}</strong> is paid online now via Cashfree and deducted from your total. The remaining <strong>₹{codRemainingOnDelivery.toLocaleString('en-IN')}</strong> will be paid in cash to the delivery agent. Final order value is strictly <strong>₹{finalTotal.toLocaleString('en-IN')}</strong> (no extra charge).
                    </p>
                  </div>

                  <label className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={codPolicyAgreed}
                      onChange={(e) => setCodPolicyAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      I agree to the COD Advance Payment policy (₹{codAdvance} paid now, ₹{codRemainingOnDelivery.toLocaleString('en-IN')} at delivery).
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Apply / Change Coupon Card in Checkout */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Promo / Coupon Code</span>
              </span>
              {activeCoupons.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCheckoutCoupons(!showCheckoutCoupons)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {showCheckoutCoupons ? 'Hide Coupons' : `Available (${activeCoupons.length})`}
                </button>
              )}
            </div>

            {appliedCoupon ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-xs text-emerald-800">{appliedCoupon.code}</span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    (₹{couponDiscount.toLocaleString('en-IN')} saved)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={checkoutCouponInput}
                  onChange={(e) => setCheckoutCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase placeholder:normal-case placeholder:font-normal focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (checkoutCouponInput.trim()) {
                      const res = applyCoupon(checkoutCouponInput.trim());
                      if (res.success) setCheckoutCouponInput('');
                    }
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}

            {showCheckoutCoupons && !appliedCoupon && activeCoupons.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5 max-h-36 overflow-y-auto">
                {activeCoupons.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      applyCoupon(c.code);
                      setShowCheckoutCoupons(false);
                    }}
                    className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-700 text-xs">{c.code}</span>
                      <span className="text-[10px] text-slate-500 ml-2">{c.description}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600">Apply</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Order Summary</h3>
              <span className="font-semibold text-slate-500 text-xs">{cartCount} items</span>
            </div>

            {/* Ordered Items Preview */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map((it) => {
                const itemPrice = it.variant_price ?? it.product.price;
                const itemOriginal = it.variant_original_price ?? it.product.original_price;

                return (
                  <div key={it.id} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 flex items-center justify-center shrink-0 border border-slate-100">
                      <img
                        src={it.product.images[0]}
                        alt={it.product.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate text-xs">{it.product.name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 mt-0.5">
                        <span>Qty: {it.quantity}</span>
                        {it.selected_color && <span>• {it.selected_color}</span>}
                        {it.selected_size && (
                          <span className="font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                            Size: {it.selected_size}
                          </span>
                        )}
                        {it.selected_variant_sku && (
                          <span className="font-mono text-[10px] text-slate-400">
                            ({it.selected_variant_sku})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-slate-900 tabular-nums">
                        ₹{(itemPrice * it.quantity).toLocaleString('en-IN')}
                      </div>
                      {itemOriginal > itemPrice && (
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-[10px] text-slate-400 line-through tabular-nums">
                            ₹{(itemOriginal * it.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculation Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
              {/* Original Product Price */}
              <div className="flex justify-between text-slate-600">
                <span>Original Product Price:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Offer Savings */}
              {cartDiscount > couponDiscount && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    <span>Category Offer Savings:</span>
                  </span>
                  <span className="tabular-nums">- ₹{(cartDiscount - couponDiscount).toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Coupon Discount */}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-blue-600 font-semibold bg-blue-50/70 px-2 py-1 rounded-lg border border-blue-200">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon ({appliedCoupon?.code}):</span>
                  </span>
                  <span className="tabular-nums">- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Final Product Price / Subtotal */}
              <div className="flex justify-between font-medium text-slate-700">
                <span>Subtotal (Discounted Items):</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Delivery / Shipping Fee */}
              <div className="flex justify-between">
                <span>Shipping / Delivery ({deliveryOption}):</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {currentDeliveryFee === 0 ? 'FREE' : `₹${currentDeliveryFee}`}
                </span>
              </div>

              {/* UPI/Card 20% Discount */}
              {isOnlinePayment && (
                <div className="flex justify-between items-center text-emerald-700 font-semibold bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-200 mt-1">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>20% Online Payment Discount:</span>
                  </span>
                  <span className="tabular-nums font-bold text-emerald-700">
                    -₹{onlineDiscount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* COD Specific Flow Breakdown Required by User */}
            {isCod && (
              <div className="pt-2 border-t border-dashed border-amber-200/80 space-y-1.5 bg-amber-50/50 p-2.5 rounded-xl">
                <div className="flex justify-between text-slate-700">
                  <span className="font-medium">• Final Order Total:</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-amber-900">
                  <span className="font-medium">• COD Advance Paid Now:</span>
                  <span className="font-bold tabular-nums">₹{codAdvance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span className="font-medium">• Remaining Cash on Delivery:</span>
                  <span className="font-bold tabular-nums">₹{codRemainingOnDelivery.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* Total Payable Amount */}
            <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-bold text-sm text-slate-900">
              <span>Total Payable Amount:</span>
              <div className="text-right">
                {isOnlinePayment && (
                  <span className="text-xs line-through text-slate-400 font-normal mr-2">
                    ₹{(cartTotal + currentDeliveryFee).toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-lg font-extrabold text-blue-600 tabular-nums">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Cashfree Status Information */}
          {isOnlinePayment && !isCheckingCfConfig && cfConfig && !cfConfig.configured && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block text-xs">
                    Cashfree Credentials Required on Server
                  </span>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Please provide your Cashfree <code>CASHFREE_APP_ID</code> and <code>CASHFREE_SECRET_KEY</code> in server environment variables to activate live payments.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={refreshCfConfig}
                className="shrink-0 px-2.5 py-1.5 rounded-xl bg-amber-200/70 hover:bg-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Re-check server credentials"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-check</span>
              </button>
            </div>
          )}

          {cfConfig?.configured && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Cashfree Secure Gateway Active ({cfConfig.environment})</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                256-Bit SSL
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Back
            </button>

            {isCod ? (
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Cashfree...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-emerald-200" />
                    <span>Confirm COD &amp; Pay ₹{codAdvance}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Cashfree...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-emerald-200" />
                    <span>Pay ₹{finalTotal.toLocaleString('en-IN')} via Cashfree</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add New Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Shipping Address</h3>

            <form onSubmit={handleCreateAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddr.full_name}
                  onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  placeholder="e.g. Flat 302, Green Park Apartments"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    placeholder="e.g. Noida"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN / Postal Code</label>
                <input
                  type="text"
                  required
                  value={newAddr.postal_code}
                  onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })}
                  placeholder="e.g. 201301"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

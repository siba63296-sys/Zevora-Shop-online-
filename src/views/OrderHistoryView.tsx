import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  MapPin,
  Calendar,
  X,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const OrderHistoryView: React.FC = () => {
  const { orders, user, updateOrderStatus, navigateTo, showToast } = useStore();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Return Request Modal State
  const [returnOrderModal, setReturnOrderModal] = useState<Order | null>(null);
  const [sealIntactConfirmed, setSealIntactConfirmed] = useState(false);
  const [returnReason, setReturnReason] = useState('Changed mind (box seal intact)');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Check if an order is eligible for return (delivered and within 7 days)
  const isEligibleForReturn = (order: Order): boolean => {
    if (order.status !== 'delivered') return false;
    const orderTime = new Date(order.created_at).getTime();
    const daysSinceDelivery = (Date.now() - orderTime) / (1000 * 60 * 60 * 24);
    return daysSinceDelivery <= 7;
  };

  // Filter orders for logged-in user
  const userOrders = orders.filter((o) => {
    if (!user) return true;
    return (
      o.user_id === user.id ||
      o.user_email?.toLowerCase() === user.email?.toLowerCase()
    );
  });

  const filteredOrders = userOrders.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Paid (Processing)',
          icon: CheckCircle2,
        };
      case 'payment_pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Payment Pending',
          icon: Clock,
        };
      case 'failed':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Payment Failed',
          icon: XCircle,
        };
      case 'delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Delivered',
          icon: CheckCircle2,
        };
      case 'processing':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Processing',
          icon: Clock,
        };
      case 'shipped':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Shipped',
          icon: Truck,
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Cancelled',
          icon: XCircle,
        };
      case 'returned':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Returned',
          icon: RotateCcw,
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: status,
          icon: Clock,
        };
    }
  };

  const handleInitiateReturn = (order: Order) => {
    setReturnOrderModal(order);
    setSealIntactConfirmed(false);
    setReturnReason('Changed mind (box seal intact)');
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderModal) return;

    if (!sealIntactConfirmed) {
      showToast('Please confirm that the product box seal is intact and unbroken.', 'error');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      await updateOrderStatus(returnOrderModal.id, 'returned');
      showToast('Return request accepted! Order status updated to Returned.', 'success');

      // Update local modal if currently viewing details
      if (selectedOrder && selectedOrder.id === returnOrderModal.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: 'returned' } : null));
      }

      setReturnOrderModal(null);
    } catch {
      showToast('Failed to submit return request', 'error');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      {/* Top Header */}
      <div className="flex items-center gap-3 py-2 border-b border-slate-200">
        <button
          onClick={() => navigateTo('home')}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
      </div>

      {/* Filter Tabs (All, Delivered, Processing, Cancelled, Returned) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'delivered', 'processing', 'cancelled', 'returned'] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const BadgeIcon = badge.icon;
            const primaryItem = order.items[0];
            const canReturn = isEligibleForReturn(order);

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                {/* Item Thumbnail */}
                <div className="w-16 h-16 bg-slate-50 rounded-xl p-1.5 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                  {primaryItem?.product_image ? (
                    <img
                      src={primaryItem.product_image}
                      alt={primaryItem.product_name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                {/* Order Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      #{order.order_number}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 truncate mt-1">
                    {primaryItem ? primaryItem.product_name : 'Order items'}
                    {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                  </p>

                  {primaryItem && (primaryItem.size || primaryItem.color) && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5 text-[10px] text-slate-500">
                      {primaryItem.size && (
                        <span className="font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                          Size: {primaryItem.size}
                        </span>
                      )}
                      {primaryItem.color && (
                        <span className="text-slate-600">
                          Color: <strong>{primaryItem.color}</strong>
                        </span>
                      )}
                      {primaryItem.variant_sku && (
                        <span className="font-mono text-[9px] text-slate-400">
                          ({primaryItem.variant_sku})
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Return option or Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  {canReturn && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInitiateReturn(order);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return</span>
                    </button>
                  )}

                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No orders found</h3>
          <p className="text-xs text-slate-500 mt-1">You have no {filter} orders.</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Order #{selectedOrder.order_number}
                  </h3>
                  {(() => {
                    const badge = getStatusBadge(selectedOrder.status);
                    const BadgeIcon = badge.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}
                </div>
                <p className="text-xs text-slate-500">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tracking timeline */}
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Status:</span>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Order Confirmed
                </span>
                <span
                  className={
                    ['shipped', 'delivered', 'returned'].includes(selectedOrder.status)
                      ? 'text-emerald-600 flex items-center gap-1'
                      : 'text-slate-400'
                  }
                >
                  <Truck className="w-4 h-4" /> Shipped
                </span>
                <span
                  className={
                    ['delivered', 'returned'].includes(selectedOrder.status)
                      ? 'text-emerald-600 flex items-center gap-1'
                      : 'text-slate-400'
                  }
                >
                  <CheckCircle2 className="w-4 h-4" /> Delivered
                </span>
                {selectedOrder.status === 'returned' && (
                  <span className="text-purple-600 flex items-center gap-1">
                    <RotateCcw className="w-4 h-4" /> Returned
                  </span>
                )}
              </div>
            </div>

            {/* 7 Days Return Policy Section on Order Details */}
            <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-purple-950 text-xs sm:text-sm">7 Days Return Policy</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                  7-Day Window
                </span>
              </div>

              <ul className="text-purple-900/90 space-y-1 pl-1 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Customers can request a return within <strong>7 days of delivery</strong>.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>
                    Return is accepted <strong>only if the original product box seal is intact and unbroken</strong>.
                  </span>
                </li>
              </ul>

              {/* Action based on status */}
              {selectedOrder.status === 'delivered' && (
                <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between">
                  {isEligibleForReturn(selectedOrder) ? (
                    <>
                      <span className="text-[11px] text-purple-700 font-medium">
                        Delivered within 7 days · Eligible for return
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInitiateReturn(selectedOrder)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Return</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Return period expired (7 days past delivery).
                    </span>
                  )}
                </div>
              )}

              {selectedOrder.status === 'returned' && (
                <div className="pt-2 border-t border-purple-200/60 flex items-center gap-2 text-purple-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Return Request Approved. Courier pickup scheduled with full refund on inspection.</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order Items ({selectedOrder.items.length})
              </span>
              <div className="divide-y divide-slate-100">
                {selectedOrder.items.map((item) => (
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
                        <p className="text-slate-500 text-[11px] flex items-center gap-1.5 flex-wrap">
                          <span>Qty: {item.quantity}</span>
                          {item.color && <span>· Color: <strong className="text-slate-700">{item.color}</strong></span>}
                          {item.size && (
                            <span className="font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                              Size: {item.size}
                            </span>
                          )}
                          {item.variant_sku && (
                            <span className="font-mono text-[10px] text-slate-400">
                              ({item.variant_sku})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-700 block">Delivery Address:</span>
              <p className="font-semibold text-slate-900">{selectedOrder.shipping_address.full_name}</p>
              <p className="text-slate-600">
                {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.city} - {selectedOrder.shipping_address.postal_code}
              </p>
              <p className="text-slate-500">Phone: {selectedOrder.shipping_address.phone}</p>
            </div>

            {/* Price Details */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 tabular-nums">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-semibold text-emerald-600 tabular-nums">
                  {selectedOrder.delivery_fee === 0 ? 'FREE' : `₹${selectedOrder.delivery_fee}`}
                </span>
              </div>

              {selectedOrder.payment_method?.toLowerCase().includes('cash on delivery') || (selectedOrder.advance_paid_amount !== undefined && selectedOrder.advance_paid_amount > 0) ? (
                <>
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-dashed border-slate-200">
                    <span>COD Advance Paid Now:</span>
                    <span className="tabular-nums font-bold">₹{selectedOrder.advance_paid_amount || 99} (Paid via Cashfree ✓)</span>
                  </div>
                  <div className="flex justify-between text-amber-800 font-semibold">
                    <span>Payable in Cash on Delivery:</span>
                    <span className="tabular-nums font-bold">
                      ₹{selectedOrder.remaining_cod_amount ?? Math.max(0, selectedOrder.total_amount - (selectedOrder.advance_paid_amount || 99))}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Order Value:</span>
                    <span className="text-blue-600 tabular-nums">₹{selectedOrder.total_amount.toLocaleString('en-IN')}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total Amount Paid:</span>
                  <span className="text-blue-600 tabular-nums">₹{selectedOrder.total_amount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return Request Confirmation Modal */}
      {returnOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Request Order Return</h3>
                  <p className="text-[11px] text-slate-500">Order #{returnOrderModal.order_number}</p>
                </div>
              </div>
              <button
                onClick={() => setReturnOrderModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 7 Days Policy Reminder Card */}
            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-purple-950">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>7 Days Return Policy</span>
              </div>
              <ul className="text-purple-900 text-[11px] space-y-1 pl-1 leading-relaxed">
                <li>• Customers can request a return within <strong>7 days of delivery</strong>.</li>
                <li>• Return is accepted <strong>only if the original product box seal is intact and unbroken</strong>.</li>
              </ul>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  <option value="Changed mind (box seal intact)">Changed mind (box seal intact)</option>
                  <option value="Defective or not functioning">Defective or not functioning</option>
                  <option value="Received wrong item or size">Received wrong item or size</option>
                  <option value="Packaging damaged on arrival">Packaging damaged on arrival</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Mandatory Seal Intact Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-purple-200 bg-purple-50/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={sealIntactConfirmed}
                  onChange={(e) => setSealIntactConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-bold text-purple-950 leading-snug">
                  I confirm that the original product box seal is intact and unbroken.
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReturnOrderModal(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!sealIntactConfirmed || isSubmittingReturn}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isSubmittingReturn ? 'Submitting...' : 'Confirm Return Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

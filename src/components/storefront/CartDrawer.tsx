import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { CartItem, Coupon } from '../../types/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalSavings = items.reduce((acc, item) => {
    const diff = item.product.originalPrice - item.product.price;
    return acc + Math.max(0, diff) * item.quantity;
  }, 0);

  // Calculate discount based on applied coupon
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      couponDiscount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = Math.max(0, subtotal - couponDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const success = onApplyCoupon(couponInput.trim().toUpperCase());
    if (success) {
      setCouponSuccess(`Coupon code '${couponInput.toUpperCase()}' applied successfully!`);
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try KVKFARMER10 or AGRI50');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="bg-[#133e1b] text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-700/60 flex items-center justify-center text-emerald-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  Shopping Cart
                  <span className="bg-[#f37021] text-white text-xs px-2 py-0.5 rounded-full font-extrabold">
                    {items.reduce((sum, item) => sum + item.quantity, 0)} Items
                  </span>
                </h2>
                <p className="text-xs text-emerald-200">Krishi Vigyan Kendra Direct Store</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content / Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Your Cart is Empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">
                  Add cattle feed, organic fertilizers, seeds, or farm tools from the products section to get started.
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#1e7e34] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#1b6d2d] transition-colors shadow-sm cursor-pointer"
                >
                  Explore Our Products
                </button>
              </div>
            ) : (
              <>
                {/* Free Shipping Alert Bar */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 text-xs text-emerald-800">
                  <Truck className="w-5 h-5 text-[#1e7e34] flex-shrink-0" />
                  <div>
                    {subtotal >= 999 ? (
                      <span className="font-semibold text-emerald-900">
                        🎉 Congratulations! You unlocked <strong>FREE Shipping</strong> on this order.
                      </span>
                    ) : (
                      <span>
                        Add <strong>₹{(999 - subtotal).toLocaleString('en-IN')}</strong> more to get <strong>FREE Local Express Delivery</strong>!
                      </span>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3.5 divide-y divide-gray-100">
                  {items.map((item) => {
                    const lineTotal = item.product.price * item.quantity;
                    return (
                      <div key={item.product.id} className="pt-3.5 first:pt-0 flex gap-3.5 items-start">
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-gray-900 leading-snug line-clamp-1">
                                {item.product.name}
                              </h4>
                              <span className="inline-block bg-green-50 text-[#1e7e34] text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 border border-green-200">
                                {item.selectedWeight}
                              </span>
                            </div>
                            <button
                              onClick={() => onRemoveItem(item.product.id)}
                              className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                              title="Remove Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {/* Price */}
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-extrabold text-[#133e1b]">
                                ₹{item.product.price.toLocaleString('en-IN')}
                              </span>
                              {item.product.originalPrice > item.product.price && (
                                <span className="text-[11px] text-gray-400 line-through">
                                  ₹{item.product.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, -1)}
                                className="p-1.5 hover:bg-gray-200 text-gray-600 rounded-l-lg transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-xs font-bold text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, 1)}
                                className="p-1.5 hover:bg-gray-200 text-gray-600 rounded-r-lg transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Section */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#f37021]" />
                      Apply Promo / Farmer Coupon
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">Use code: KVKFARMER10</span>
                  </label>

                  {appliedCoupon ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <Tag className="w-4 h-4 text-[#1e7e34]" />
                        <div>
                          <strong className="text-emerald-900">{appliedCoupon.code}</strong>
                          <p className="text-[11px] text-emerald-700">{appliedCoupon.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={onRemoveCoupon}
                        className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. KVKFARMER10"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs uppercase bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e7e34] focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-[#133e1b] hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-red-600 mt-1">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-700 mt-1">{couponSuccess}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout CTA */}
          {items.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 p-6 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>



                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span>Delivery Charge</span>
                  <span className="text-xs italic text-gray-400">Calculated at checkout</span>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-extrabold text-gray-900">Total Payable</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">+ Delivery charge at checkout</p>
                  </div>
                  <span className="text-lg font-black text-[#133e1b]">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-[#1e7e34] hover:bg-[#1b6d2d] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

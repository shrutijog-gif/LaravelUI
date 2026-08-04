import React from 'react';
import { CheckCircle2, Download, Package, ArrowRight, ShieldCheck, MapPin, Phone, CreditCard, ExternalLink } from 'lucide-react';
import { Order } from '../../types/store';

interface OrderSuccessPageProps {
  order: Order;
  onContinueShopping: () => void;
  onViewInAdmin?: () => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  order,
  onContinueShopping,
  onViewInAdmin,
}) => {
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-200 text-center space-y-8 animate-fade-in">
        
        {/* Animated Checkmark Badge */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 text-[#1e7e34] mx-auto flex items-center justify-center border-4 border-emerald-200 shadow-inner">
          <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 stroke-[2.5]" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <span className="bg-emerald-100 text-[#133e1b] text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight">
            Thank You! Your Order Has Been Placed.
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            We have received your order. A confirmation SMS with tracking link has been sent to{' '}
            <strong className="text-gray-900">{order.customerPhone}</strong>.
          </p>
        </div>

        {/* Order Details Banner Box */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#133e1b] text-white rounded-2xl p-6 shadow-md text-left grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <span className="text-[11px] text-emerald-300 font-medium block uppercase tracking-wider">Order ID</span>
            <strong className="text-lg font-black text-white">{order.orderId}</strong>
            <p className="text-[11px] text-emerald-200 mt-0.5">{order.orderDate}</p>
          </div>

          <div>
            <span className="text-[11px] text-emerald-300 font-medium block uppercase tracking-wider">Total Amount</span>
            <strong className="text-lg font-black text-white">₹{order.grandTotal.toLocaleString('en-IN')}</strong>
            <p className="text-[11px] text-emerald-200 mt-0.5">{order.paymentMethod}</p>
          </div>

          <div>
            <span className="text-[11px] text-emerald-300 font-medium block uppercase tracking-wider">Estimated Delivery</span>
            <strong className="text-base font-bold text-amber-300">Within 2 - 3 Days</strong>
            <p className="text-[11px] text-emerald-200 mt-0.5">Tracking: {order.trackingNumber}</p>
          </div>
        </div>

        {/* Customer Address & Summary Recap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          
          {/* Shipping Address */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 text-xs space-y-2">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5 border-b border-gray-200 pb-2 text-sm">
              <MapPin className="w-4 h-4 text-[#1e7e34]" /> Delivery Address
            </h3>
            <p className="font-bold text-gray-800">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600">{order.shippingAddress.houseNo}, {order.shippingAddress.streetVillage}</p>
            <p className="text-gray-600">Taluka: {order.shippingAddress.taluka}, District: {order.shippingAddress.district}</p>
            <p className="text-gray-600">Pincode: {order.shippingAddress.pincode} ({order.shippingAddress.state})</p>
            <p className="text-emerald-800 font-semibold flex items-center gap-1 pt-1">
              <Phone className="w-3.5 h-3.5" /> Mobile: {order.customerPhone}
            </p>
          </div>

          {/* Payment & Items Brief */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 text-xs space-y-2">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5 border-b border-gray-200 pb-2 text-sm">
              <CreditCard className="w-4 h-4 text-[#1e7e34]" /> Payment & Items
            </h3>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <strong className="text-gray-900">{order.paymentMethod}</strong>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.couponApplied && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Applied:</span>
                <span>{order.couponApplied} (-₹{order.discountAmount})</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200">
              <p className="font-bold text-gray-800 mb-1">Ordered Products:</p>
              <ul className="space-y-1 text-[11px] text-gray-600">
                {order.items.map((it) => (
                  <li key={it.product.id} className="flex justify-between">
                    <span>{it.quantity} × {it.product.name} ({it.selectedWeight})</span>
                    <strong className="text-gray-800">₹{(it.product.price * it.quantity).toLocaleString('en-IN')}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={handlePrintInvoice}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Print Invoice / Save PDF</span>
          </button>

          {onViewInAdmin && (
            <button
              onClick={onViewInAdmin}
              className="bg-[#133e1b] hover:bg-emerald-900 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-amber-300" />
              <span>View Order in Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={onContinueShopping}
            className="bg-[#1e7e34] hover:bg-[#1b6d2d] text-white text-xs font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>MSM Krishi Vigyan Kendra • Quality Certified Farm Products</span>
        </div>

      </div>
    </div>
  );
};

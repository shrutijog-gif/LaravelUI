import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  Printer, 
  MapPin, 
  Phone, 
  Tag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Filter,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Order } from '../../types/store';

interface AdminOrdersModuleProps {
  orders: Order[];
  onUpdateOrderStatus?: (orderId: string, newStatus: Order['orderStatus']) => void;
  onSwitchToStorefront?: () => void;
}

export const AdminOrdersModule: React.FC<AdminOrdersModuleProps> = ({
  orders,
  onUpdateOrderStatus,
  onSwitchToStorefront,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredOrders = orders.filter((o) => {
    const matchesQuery = 
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.shippingAddress.pincode.includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Bar inside Admin Module */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <span className="text-[11px] font-bold text-[#1e7e34] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            E-Commerce Dashboard Module
          </span>
          <h1 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            Store Orders Management
            <span className="bg-[#133e1b] text-white text-xs font-black px-2.5 py-0.5 rounded-full">
              {orders.length} Total
            </span>
          </h1>
          <p className="text-xs text-gray-500">
            Real-time customer orders placed on MSM Krishi Vigyan Kendra Storefront.
          </p>
        </div>

        {onSwitchToStorefront && (
          <button
            onClick={onSwitchToStorefront}
            className="bg-[#1e7e34] hover:bg-[#1b6d2d] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <span>🌐 Open Public Storefront</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Grid: Orders List Left (3/5), Active Order Detail Right (2/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left Column: Filterable Orders List */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Filter Controls */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, Phone, Pincode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e7e34] focus:bg-white text-gray-800"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-[#133e1b] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Cards List */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-200">
                <ShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold">No orders found matching filters.</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Place an order on the public storefront to see it sync here in real time!
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.orderId === order.orderId;
                return (
                  <div
                    key={order.orderId}
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1e7e34] ring-2 ring-emerald-100 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-extrabold text-[#133e1b]">{order.orderId}</strong>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            order.orderStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{order.orderDate}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-gray-900">
                          ₹{order.grandTotal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] block text-gray-500 font-medium">
                          {order.paymentMethod} ({order.paymentStatus})
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 flex flex-wrap items-center justify-between text-xs text-gray-700 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{order.customerName}</span>
                        <span className="text-gray-400">|</span>
                        <span>{order.customerPhone}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-[#1e7e34]" />
                        <span>{order.shippingAddress.district} ({order.shippingAddress.pincode})</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column: Detailed View of Selected Order */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-24 space-y-5">
              
              {/* Card Header & Status Selector */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Active Order Detail</span>
                  <h3 className="text-base font-extrabold text-[#133e1b]">{selectedOrder.orderId}</h3>
                </div>

                <button
                  onClick={handlePrint}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
              </div>

              {/* Status Update Control */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Update Order Status:</label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value as Order['orderStatus'];
                    if (onUpdateOrderStatus) {
                      onUpdateOrderStatus(selectedOrder.orderId, newStatus);
                    }
                    setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
                  }}
                  className="w-full text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#1e7e34]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Customer Shipping Address Box */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 text-xs space-y-1.5">
                <h4 className="font-bold text-[#133e1b] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1e7e34]" /> Delivery Address
                </h4>
                <p className="font-bold text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                <p className="text-gray-700">{selectedOrder.shippingAddress.houseNo}, {selectedOrder.shippingAddress.streetVillage}</p>
                <p className="text-gray-700">Taluka: {selectedOrder.shippingAddress.taluka}, District: {selectedOrder.shippingAddress.district}</p>
                <p className="text-gray-700">Pincode: {selectedOrder.shippingAddress.pincode} ({selectedOrder.shippingAddress.state})</p>
                <p className="text-emerald-900 font-semibold pt-1">Phone: {selectedOrder.customerPhone}</p>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 mb-2">Ordered Line Items</h4>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden text-xs">
                  {selectedOrder.items.map((item) => (
                    <div key={item.product.id} className="p-3 bg-white flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{item.product.name}</p>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                          {item.selectedWeight}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500">{item.quantity} × ₹{item.product.price}</span>
                        <p className="font-extrabold text-[#133e1b]">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {selectedOrder.couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount ({selectedOrder.couponApplied})</span>
                    <span>-₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{selectedOrder.shippingFee}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="font-extrabold text-gray-900 text-xs">Grand Total</span>
                  <span className="text-base font-black text-[#133e1b]">
                    ₹{selectedOrder.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-200">
              Select an order from the list to view full details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

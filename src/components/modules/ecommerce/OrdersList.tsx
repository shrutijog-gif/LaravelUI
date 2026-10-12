import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar,
  FileText
} from 'lucide-react';
import { Order } from '../../../types/ecommerce';

interface OrdersListProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['fulfillmentStatus']) => void;
}

export const OrdersList: React.FC<OrdersListProps> = ({ orders, onUpdateOrderStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || o.fulfillmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getFulfillmentBadge = (status: Order['fulfillmentStatus']) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
    }
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Paid</span>;
      case 'pending':
        return <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Payment Pending</span>;
      case 'refunded':
        return <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">Refunded</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders & Invoices</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track customer purchases, payment verification, and order shipping status
          </p>
        </div>
      </div>

      {/* Top Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search by Order #, Customer, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 text-sm rounded-lg pl-9 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  statusFilter === st ? 'bg-white shadow-xs text-blue-700 font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order Details</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      <div className="font-mono font-bold text-blue-600">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">{order.items.length} item(s) ordered</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      {order.date}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>

                    <td className="py-3.5 px-4">
                      {getFulfillmentBadge(order.fulfillmentStatus)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>      {/* Order Details / Invoice Right Slide-Over Drawer */}
      {selectedOrder && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          {/* Right Slide-over Panel */}
          <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-2xl bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Order Invoice Details</span>
                <h3 className="text-base font-bold font-mono text-gray-900">{selectedOrder.orderNumber}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Status Updater Bar */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Fulfillment Status</p>
                  <p className="text-xs text-blue-600">Update current shipping status for customer tracking</p>
                </div>
                <div className="flex gap-1">
                  {(['processing', 'shipped', 'delivered', 'cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateOrderStatus(selectedOrder.id, st);
                        setSelectedOrder({ ...selectedOrder, fulfillmentStatus: st });
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                        selectedOrder.fulfillmentStatus === st 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <div className="space-y-1.5">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Customer Details
                  </span>
                  <p className="font-semibold text-gray-800 text-sm">{selectedOrder.customerName}</p>
                  <p className="text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {selectedOrder.customerEmail}</p>
                  <p className="text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {selectedOrder.customerPhone}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Delivery Address
                  </span>
                  <p className="text-gray-700 leading-relaxed">{selectedOrder.shippingAddress}</p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-gray-500">Date: {selectedOrder.date}</span>
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" /> Line Items
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Unit Price</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 flex items-center gap-2">
                            <img src={item.image} alt={item.productName} className="w-8 h-8 rounded object-cover border" />
                            <span className="font-semibold text-gray-900">{item.productName}</span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-700">₹{item.unitPrice} / {item.unit}</td>
                          <td className="py-2.5 px-3 font-semibold text-gray-800">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900">₹{item.unitPrice * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200 font-bold text-sm">
                      <tr>
                        <td colSpan={3} className="py-3 px-3 text-right text-gray-700">Total Order Amount:</td>
                        <td className="py-3 px-3 text-right text-blue-700 text-base">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Drawer Footer matching screenshot */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

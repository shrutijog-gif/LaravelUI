import React from 'react';
import { 
  Home,
  DollarSign, 
  ShoppingBag, 
  Package, 
  Tag, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Layers
} from 'lucide-react';
import { Product, OfferCoupon, Order } from '../../../types/ecommerce';
import { mockCategories } from '../../../data/mockEcommerceData';

interface EcommerceDashboardProps {
  products: Product[];
  coupons: OfferCoupon[];
  orders: Order[];
}

export const EcommerceDashboard: React.FC<EcommerceDashboardProps> = ({
  products,
  coupons,
  orders,
}) => {
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.fulfillmentStatus === 'processing');
  const lowStockProducts = products.filter(p => p.stock <= 10);
  const activeCoupons = coupons.filter(c => c.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-900">E-Commerce Dashboard</h1>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +12.4%
            </span>
          </div>
          <p className="text-xs text-gray-400">Paid customer orders</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{orders.length}</h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {pendingOrders.length} Pending
            </span>
          </div>
          <p className="text-xs text-gray-400">Processed order receipts</p>
        </div>

        {/* Products in Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Products</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              5 Categories
            </span>
          </div>
          <p className="text-xs text-gray-400">Listed across agri store</p>
        </div>

        {/* Active Offers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Offers</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{activeCoupons.length}</h3>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Kisan Specials
            </span>
          </div>
          <p className="text-xs text-gray-400">Promotions active now</p>
        </div>
      </div>

      {/* 2 Column Main Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide): Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Recent Customer Orders</h3>
              <p className="text-xs text-gray-500">Latest store transactions and shipping status</p>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {order.customerName}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {order.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      {order.fulfillmentStatus === 'processing' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Processing
                        </span>
                      )}
                      {order.fulfillmentStatus === 'shipped' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                          Shipped
                        </span>
                      )}
                      {order.fulfillmentStatus === 'delivered' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1 col wide): Inventory & Stock Alerts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts
              </h3>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                {lowStockProducts.length} Items
              </span>
            </div>

            <div className="divide-y divide-gray-100 mt-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-9 h-9 rounded-lg object-cover border border-gray-200" 
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xs line-clamp-1">{product.name}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">{product.sku}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-extrabold ${
                      product.stock === 0 ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60 text-xs space-y-1">
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Active Store Sectors
              </span>
              <p className="text-gray-500 text-[11px]">
                Fresh Produce (14), Bio-Pesticides (8), Hybrid Seeds (22), Books (12), Tools (6).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

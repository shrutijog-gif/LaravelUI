import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Home,
  Tag, 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Percent, 
  DollarSign, 
  Trash2, 
  Edit2,
  Users
} from 'lucide-react';
import { OfferCoupon } from '../../../types/ecommerce';

interface OffersListProps {
  coupons: OfferCoupon[];
  onAddCoupon: (coupon: Omit<OfferCoupon, 'id' | 'usedCount'>) => void;
  onDeleteCoupon: (id: string) => void;
}

export const OffersList: React.FC<OffersListProps> = ({
  coupons,
  onAddCoupon,
  onDeleteCoupon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'scheduled'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderAmount: 500,
    usageLimit: 100,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active' as 'active' | 'expired' | 'scheduled',
  });

  const handleOpenModal = () => {
    setFormData({
      code: '',
      title: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 500,
      usageLimit: 100,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.title) return;

    onAddCoupon({
      ...formData,
      code: formData.code.toUpperCase().trim(),
    });
    setIsModalOpen(false);
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = coupons.filter(c => c.status === 'active').length;
  const expiredCount = coupons.filter(c => c.status === 'expired').length;
  const totalRedeemed = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <Home className="w-3.5 h-3.5 text-gray-600" />
        <span>/</span>
        <span>E-Commerce</span>
        <span>/</span>
        <span className="text-gray-800 font-semibold">Offers & Discount Coupons</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Offers & Discount Coupons</h1>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Offers</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Coupons Used</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{totalRedeemed}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Expired Offers</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{expiredCount}</h3>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search offer code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 text-sm rounded-lg pl-9 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'active', 'expired', 'scheduled'] as const).map((st) => (
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

        <button
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-xs flex items-center gap-2 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New</span>
        </button>
      </div>

      {/* Grid of Offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Tag className="w-3.5 h-3.5" /> {coupon.code}
                  </span>
                  <h4 className="font-bold text-gray-900 text-base mt-2.5">{coupon.title}</h4>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                  coupon.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : coupon.status === 'expired' 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {coupon.status}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Discount Value:</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Min Order Value:</span>
                  <span className="font-semibold text-gray-800">₹{coupon.minOrderAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Usage Count:</span>
                  <span className="font-semibold text-gray-800">{coupon.usedCount} / {coupon.usageLimit}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Valid: {coupon.validFrom} to {coupon.validUntil}</span>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => onDeleteCoupon(coupon.id)}
                className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Offer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Slide-Over Drawer */}
      {isModalOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Right Slide-over Panel */}
          <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-lg bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h3 className="text-base font-bold text-gray-900">Add Discount Coupon</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer Form (Scrollable) */}
            <form id="coupon-drawer-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KISAN20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Offer Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kisan Special 20% Off"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Value ({formData.discountType === 'percentage' ? '%' : '₹'}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </form>

            {/* Drawer Footer matching screenshot */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 shadow-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="coupon-drawer-form"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-xs transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  Phone, 
  User, 
  Building, 
  Home, 
  QrCode, 
  Banknote, 
  Lock,
  Tag
} from 'lucide-react';
import { CartItem, Coupon, DeliveryOption, PaymentMethod, ShippingAddress, Order } from '../../types/store';

interface CheckoutFlowProps {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  onPlaceOrder: (order: Order) => void;
  onBackToShopping: () => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  items,
  appliedCoupon,
  onPlaceOrder,
  onBackToShopping,
}) => {
  // Current active step in checkout (1: Address, 2: Delivery, 3: Payment, 4: Review)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Address Form State
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: 'Ramesh Patil',
    mobile: '9822012345',
    pincode: '431007',
    houseNo: 'Plot No. 45, Near Gram Panchayat',
    streetVillage: 'Gandheli Village, Paithan Road',
    landmark: 'Opposite Secondary School',
    taluka: 'Chhatrapati Sambhajinagar',
    district: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    addressType: 'farm',
  });

  // Selected Delivery Method
  const deliveryOptions: DeliveryOption[] = [
    {
      id: 'standard',
      title: 'Standard Local Delivery',
      description: 'Delivered directly to your village/farm via local agri courier.',
      price: 60,
      estimatedDays: '2 - 3 Business Days',
    },
    {
      id: 'express-freight',
      title: 'Agri Express Freight (Heavy Vehicles)',
      description: 'Recommended for bulk bags (Cattle Feed / Fertilizers > 100kg).',
      price: 120,
      estimatedDays: '1 - 2 Days Direct Transport',
    },
    {
      id: 'kvk-pickup',
      title: 'Self Pickup at KVK Center',
      description: 'Collect directly from MSM Krishi Vigyan Kendra Campus, Gandheli.',
      price: 0,
      estimatedDays: 'Ready Next Day (Free)',
      isFree: true,
    },
  ];
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption>(deliveryOptions[0]);

  // Selected Payment Method
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      title: 'UPI / QR Code (GPay, PhonePe, Paytm, BHIM)',
      description: 'Instant zero-fee payment via mobile scanner.',
      iconName: 'qr',
    },
    {
      id: 'card',
      title: 'Credit / Debit Card',
      description: 'Visa, MasterCard, RuPay cards accepted.',
      iconName: 'card',
    },
    {
      id: 'netbanking',
      title: 'NetBanking',
      description: 'SBI, HDFC, ICICI, Bank of Maharashtra & 50+ Banks.',
      iconName: 'bank',
    },
    {
      id: 'cod',
      title: 'Cash on Delivery (COD)',
      description: 'Pay cash to delivery person upon receiving goods.',
      iconName: 'cash',
    },
  ];
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(paymentMethods[0]);

  // UPI App Selection for UPI view
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm'>('gpay');

  // Order notes
  const [orderNotes, setOrderNotes] = useState('');

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      couponDiscount = appliedCoupon.discountValue;
    }
  }

  const shippingFee = selectedDelivery.price;
  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  const handleFinalPlaceOrder = () => {
    const newOrder: Order = {
      orderId: `KVK-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      orderDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customerName: address.fullName,
      customerPhone: address.mobile,
      shippingAddress: address,
      items: [...items],
      subtotal,
      discountAmount: couponDiscount,
      shippingFee,
      grandTotal,
      paymentMethod: selectedPayment.title,
      paymentStatus: selectedPayment.id === 'cod' ? 'Pending COD' : 'Paid',
      orderStatus: 'Pending',
      couponApplied: appliedCoupon ? appliedCoupon.code : undefined,
      trackingNumber: `TRK-KVK-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onPlaceOrder(newOrder);
  };

  const steps = [
    { num: 1, label: 'Shipping Address' },
    { num: 2, label: 'Delivery Method' },
    { num: 3, label: 'Payment Method' },
    { num: 4, label: 'Order Review' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToShopping}
          className="flex items-center gap-2 text-xs font-bold text-[#1e7e34] hover:text-[#133e1b] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-[#133e1b] flex items-center gap-2">
          Checkout & Place Order
        </h1>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-200 mb-8">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-[#1e7e34] -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => {
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <div 
                key={s.num} 
                onClick={() => {
                  if (isDone) setCurrentStep(s.num);
                }}
                className={`relative z-10 flex flex-col items-center cursor-pointer ${
                  isDone || isCurrent ? 'text-[#1e7e34]' : 'text-gray-400'
                }`}
              >
                <div 
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all ${
                    isDone 
                      ? 'bg-[#1e7e34] text-white border-[#1e7e34]' 
                      : isCurrent 
                      ? 'bg-white text-[#1e7e34] border-[#1e7e34] ring-4 ring-emerald-100' 
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-[11px] sm:text-xs font-semibold mt-2 hidden sm:block ${
                  isCurrent ? 'text-gray-900 font-bold' : ''
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Step Content Left (2/3), Summary Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Current Step Forms */}
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 1: Shipping Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-fade-in space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#1e7e34] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Step 1: Shipping & Delivery Address</h2>
                  <p className="text-xs text-gray-500">Provide complete farmer/home address for prompt delivery</p>
                </div>
              </div>

              {/* Address Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name / Farmer Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e7e34] focus:bg-white text-gray-800 font-medium"
                      placeholder="e.g. Ramesh Patil"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile Number (For Delivery SMS/Calls) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address.mobile}
                      onChange={(e) => setAddress({ ...address, mobile: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e7e34] focus:bg-white text-gray-800 font-medium"
                      placeholder="e.g. 9822012345"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e7e34] focus:bg-white text-gray-800 font-medium"
                    placeholder="e.g. 431007"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Address Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAddress({ ...address, addressType: 'farm' })}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        address.addressType === 'farm'
                          ? 'bg-emerald-50 border-[#1e7e34] text-[#1e7e34]'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>Farm / Field</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddress({ ...address, addressType: 'home' })}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        address.addressType === 'home'
                          ? 'bg-emerald-50 border-[#1e7e34] text-[#1e7e34]'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Home</span>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    House / Plot No. / Gat No. *
                  </label>
                  <input
                    type="text"
                    value={address.houseNo}
                    onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e7e34] focus:bg-white text-gray-800 font-medium"
                    placeholder="e.g. Gat No. 45, Near Water Tank"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Street Name / Village / Area *
                  </label>
                  <input
                    type="text"
                    value={address.streetVillage}
                    onChange={(e) => setAddress({ ...address, streetVillage: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e7e34] focus:bg-white text-gray-800 font-medium"
                    placeholder="e.g. Gandheli Village, Paithan Road"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Taluka *
                  </label>
                  <input
                    type="text"
                    value={address.taluka}
                    onChange={(e) => setAddress({ ...address, taluka: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e7e34] focus:bg-white text-gray-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    District & State *
                  </label>
                  <input
                    type="text"
                    value={`${address.district}, ${address.state}`}
                    readOnly
                    className="w-full px-3 py-2 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#1e7e34] hover:bg-[#1b6d2d] text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Continue to Delivery Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Method */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-fade-in space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#1e7e34] flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Step 2: Choose Delivery Method</h2>
                  <p className="text-xs text-gray-500">Select how you would like to receive your agricultural products</p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {deliveryOptions.map((option) => {
                  const isSelected = selectedDelivery.id === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setSelectedDelivery(option)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'border-[#1e7e34] bg-emerald-50/60 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => setSelectedDelivery(option)}
                          className="mt-1 accent-[#1e7e34] w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                            {option.title}
                            {option.isFree && (
                              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.2 rounded-full uppercase font-black">
                                Free
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-gray-600 mt-0.5">{option.description}</p>
                          <span className="inline-block text-[11px] text-[#1e7e34] font-semibold mt-1">
                            ⏱ Estimated: {option.estimatedDays}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-[#133e1b]">
                          {option.price === 0 ? 'FREE' : `₹${option.price}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Back to Address
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-[#1e7e34] hover:bg-[#1b6d2d] text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Continue to Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-fade-in space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#1e7e34] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Step 3: Select Payment Method</h2>
                  <p className="text-xs text-gray-500">Choose your preferred secure payment option</p>
                </div>
              </div>

              {/* Payment Radio Cards */}
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedPayment.id === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPayment(method)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#1e7e34] bg-emerald-50/60 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setSelectedPayment(method)}
                            className="mt-1 accent-[#1e7e34] w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                              {method.title}
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">{method.description}</p>
                          </div>
                        </div>

                        {method.id === 'upi' && <QrCode className="w-5 h-5 text-emerald-700" />}
                        {method.id === 'card' && <CreditCard className="w-5 h-5 text-blue-700" />}
                        {method.id === 'netbanking' && <Building className="w-5 h-5 text-purple-700" />}
                        {method.id === 'cod' && <Banknote className="w-5 h-5 text-amber-700" />}
                      </div>

                      {/* Expandable sub-options for UPI */}
                      {isSelected && method.id === 'upi' && (
                        <div className="mt-4 pt-3 border-t border-emerald-200 flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold text-gray-700">Select UPI App:</span>
                          {(['gpay', 'phonepe', 'paytm'] as const).map((app) => (
                            <button
                              key={app}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUpiApp(app);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                selectedUpiApp === app
                                  ? 'bg-[#133e1b] text-white border-[#133e1b]'
                                  : 'bg-white text-gray-700 border-gray-300'
                              }`}
                            >
                              {app === 'gpay' && 'Google Pay'}
                              {app === 'phonepe' && 'PhonePe'}
                              {app === 'paytm' && 'Paytm / BHIM'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Back to Delivery
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="bg-[#1e7e34] hover:bg-[#1b6d2d] text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Proceed to Final Order Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Order Review & Confirmation */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-fade-in space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#1e7e34] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Step 4: Final Order Review</h2>
                  <p className="text-xs text-gray-500">Please verify all information before placing your order</p>
                </div>
              </div>

              {/* Shipping & Payment Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shipping Box */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-gray-900 mb-1">
                    <span className="flex items-center gap-1 text-[#1e7e34]">
                      <MapPin className="w-3.5 h-3.5" /> Shipping Address
                    </span>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] text-[#1e7e34] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                  <p className="font-bold text-gray-800">{address.fullName} ({address.mobile})</p>
                  <p className="text-gray-600">{address.houseNo}, {address.streetVillage}</p>
                  <p className="text-gray-600">Taluka: {address.taluka}, {address.district} - {address.pincode}</p>
                </div>

                {/* Payment & Delivery Box */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
                  <div>
                    <div className="flex items-center justify-between font-bold text-gray-900 mb-0.5">
                      <span className="flex items-center gap-1 text-[#1e7e34]">
                        <Truck className="w-3.5 h-3.5" /> Delivery Mode
                      </span>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-[11px] text-[#1e7e34] hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-gray-700 font-semibold">{selectedDelivery.title}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between font-bold text-gray-900 mb-0.5">
                      <span className="flex items-center gap-1 text-[#1e7e34]">
                        <CreditCard className="w-3.5 h-3.5" /> Payment Method
                      </span>
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="text-[11px] text-[#1e7e34] hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-gray-700 font-semibold">{selectedPayment.title}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-xs font-bold text-gray-800 mb-2">Order Items ({items.length})</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.product.id} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 object-contain rounded bg-gray-50 border p-1"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{item.product.name}</p>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                            {item.selectedWeight}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-gray-500 font-medium">Qty: {item.quantity} × ₹{item.product.price}</span>
                        <p className="font-extrabold text-[#133e1b] text-xs">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farmer Note / Instructions */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Optional Farmer / Delivery Instructions
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Call before arrival / Keep near grain shed"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e7e34] focus:bg-white text-gray-800"
                />
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Back to Payment
                </button>
                <button
                  onClick={handleFinalPlaceOrder}
                  className="bg-[#1e7e34] hover:bg-[#1b6d2d] text-white text-sm font-extrabold px-8 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>PLACE ORDER (₹{grandTotal.toLocaleString('en-IN')})</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Persistent Order Pricing Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-36 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-gray-500">{items.length} Items</span>
            </h3>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Coupon ({appliedCoupon.code})
                  </span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping ({selectedDelivery.title.split(' ')[0]})</span>
                <span className="font-semibold text-gray-900">
                  {selectedDelivery.price === 0 ? (
                    <strong className="text-emerald-700 uppercase">FREE</strong>
                  ) : (
                    `₹${selectedDelivery.price}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-gray-900">Grand Total</span>
                <span className="text-xl font-black text-[#133e1b]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
              <div className="font-bold flex items-center gap-1 text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-[#1e7e34]" />
                <span>KVK Assurance</span>
              </div>
              <p>Direct supply from MSM Krishi Vigyan Kendra farm research unit with invoice guarantee.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  originalPrice: number;
  discountBadge?: string;
  rating: number;
  reviewsCount: number;
  weightOptions: string[];
  selectedWeight: string;
  inStock: boolean;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight: string;
}

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  pincode: string;
  houseNo: string;
  streetVillage: string;
  landmark?: string;
  taluka: string;
  district: string;
  state: string;
  addressType: 'home' | 'farm' | 'office';
}

export interface DeliveryOption {
  id: string;
  title: string;
  description: string;
  price: number;
  estimatedDays: string;
  isFree?: boolean;
}

export interface PaymentMethod {
  id: 'upi' | 'card' | 'netbanking' | 'cod';
  title: string;
  description: string;
  iconName: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  description: string;
}

export interface Order {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending COD';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  couponApplied?: string;
  trackingNumber?: string;
}

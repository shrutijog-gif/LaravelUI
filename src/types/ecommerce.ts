export type ProductUnit = 'kg' | 'g' | 'L' | 'ml' | 'pack' | 'piece' | 'box';

export type CategorySlug = 'vegetables' | 'pesticides' | 'seeds' | 'tools';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: CategorySlug;
  categoryName: string;
  unit: ProductUnit;
  regularPrice: number;
  salePrice?: number;
  stock: number;
  status: 'published' | 'draft' | 'out_of_stock';
  description: string;
  image: string;
  createdAt: string;
}

export interface OfferCoupon {
  id: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'expired' | 'scheduled';
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: CategorySlug;
  itemCount: number;
  description: string;
  iconName: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: ProductUnit;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  fulfillmentStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
}

import React, { useState } from 'react';
import { StorefrontHeader } from './StorefrontHeader';
import { StorefrontHomepage, initialProducts } from './StorefrontHomepage';
import { CartDrawer } from './CartDrawer';
import { CheckoutFlow } from './CheckoutFlow';
import { OrderSuccessPage } from './OrderSuccessPage';
import { AdminOrdersModule } from '../modules/AdminOrdersModule';
import { CartItem, Coupon, Order, Product } from '../../types/store';

export const availableCoupons: Coupon[] = [
  {
    code: 'KVKFARMER10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 500,
    description: '10% Discount for Farmers on orders above ₹500',
  },
  {
    code: 'AGRI50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 300,
    description: 'Flat ₹50 Off on organic bio-fertilizers & seeds',
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 60,
    minOrderValue: 0,
    description: 'Free Shipping Coupon',
  },
];

// Initial mock synced orders for demonstration
export const initialOrdersList: Order[] = [
  {
    orderId: 'KVK-ORD-98421',
    orderDate: '03 Aug 2026, 02:30 PM',
    customerName: 'Ganesh Deshmukh',
    customerPhone: '9822098765',
    shippingAddress: {
      fullName: 'Ganesh Deshmukh',
      mobile: '9822098765',
      pincode: '431107',
      houseNo: 'Gat No. 112, Near Sugar Factory',
      streetVillage: 'Paithan Road, Paithan',
      taluka: 'Paithan',
      district: 'Chhatrapati Sambhajinagar',
      state: 'Maharashtra',
      addressType: 'farm',
    },
    items: [
      {
        product: initialProducts[0], // MSM Cattle Feed
        quantity: 2,
        selectedWeight: '50kg Bag',
      },
    ],
    subtotal: 1500,
    discountAmount: 150,
    shippingFee: 0,
    grandTotal: 1350,
    paymentMethod: 'UPI / QR Code (Google Pay)',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    couponApplied: 'KVKFARMER10',
    trackingNumber: 'TRK-KVK-9842',
  },
];

export const PublicStoreApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'checkout' | 'success' | 'admin-orders'>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: initialProducts[0], // Pre-populate MSM Cattle Feed in cart for immediate review
      quantity: 1,
      selectedWeight: '50kg Bag',
    },
    {
      product: initialProducts[1], // Pre-populate NPK Fertilizer
      quantity: 2,
      selectedWeight: '5kg Bag',
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(availableCoupons[0]); // KVKFARMER10 applied by default
  const [placedOrders, setPlacedOrders] = useState<Order[]>(initialOrdersList);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);

  // Cart Handlers
  const handleAddToCart = (product: Product, selectedWeight?: string) => {
    const weight = selectedWeight || product.selectedWeight;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedWeight === weight
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, { product, quantity: 1, selectedWeight: weight }];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleApplyCoupon = (code: string): boolean => {
    const found = availableCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (found) {
      setAppliedCoupon(found);
      return true;
    }
    return false;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Place Order Handler
  const handlePlaceOrder = (order: Order) => {
    setPlacedOrders((prev) => [order, ...prev]);
    setLatestOrder(order);
    setCartItems([]);
    setIsCartOpen(false);
    setCurrentView('success');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['orderStatus']) => {
    setPlacedOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o))
    );
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Header Bar */}
      <StorefrontHeader
        cartItemsCount={totalCartCount}
        cartTotalAmount={totalCartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onGoHome={() => setCurrentView('home')}
        onViewAdminModule={() => setCurrentView('admin-orders')}
        currentView={currentView}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <StorefrontHomepage
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutFlow
            items={cartItems}
            appliedCoupon={appliedCoupon}
            onPlaceOrder={handlePlaceOrder}
            onBackToShopping={() => setCurrentView('home')}
          />
        )}

        {currentView === 'success' && latestOrder && (
          <OrderSuccessPage
            order={latestOrder}
            onContinueShopping={() => setCurrentView('home')}
            onViewInAdmin={() => setCurrentView('admin-orders')}
          />
        )}

        {currentView === 'admin-orders' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-8">
            <AdminOrdersModule
              orders={placedOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onSwitchToStorefront={() => setCurrentView('home')}
            />
          </div>
        )}
      </main>

      {/* Cart Drawer Component */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setCurrentView('checkout')}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />
    </div>
  );
};

export default PublicStoreApp;

import React, { useState } from 'react';
import { Product, OfferCoupon, Order } from '../../../types/ecommerce';
import { 
  initialProducts, 
  initialCoupons, 
  mockCategories, 
  initialOrders 
} from '../../../data/mockEcommerceData';
import { EcommerceDashboard } from './EcommerceDashboard';
import { ProductsList } from './ProductsList';
import { OffersList } from './OffersList';
import { CategoriesList } from './CategoriesList';
import { OrdersList } from './OrdersList';

interface EcommerceContainerProps {
  initialSubTab?: 'dashboard' | 'products' | 'offers' | 'categories' | 'orders';
}

export const EcommerceContainer: React.FC<EcommerceContainerProps> = ({
  initialSubTab = 'dashboard'
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'offers' | 'categories' | 'orders'>(initialSubTab);

  // Global module state
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [coupons, setCoupons] = useState<OfferCoupon[]>(initialCoupons);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Sync prop changes if user switches sidebar items directly
  React.useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  // Product actions
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'createdAt'>) => {
    const product: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts(prev => [product, ...prev]);
  };

  const handleUpdateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Coupon actions
  const handleAddCoupon = (newCoup: Omit<OfferCoupon, 'id' | 'usedCount'>) => {
    const coupon: OfferCoupon = {
      ...newCoup,
      id: `coup-${Date.now()}`,
      usedCount: 0,
    };
    setCoupons(prev => [coupon, ...prev]);
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  // Order actions
  const handleUpdateOrderStatus = (orderId: string, status: Order['fulfillmentStatus']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, fulfillmentStatus: status } : o));
  };

  return (
    <div className="space-y-6">
      {activeTab === 'dashboard' && (
        <EcommerceDashboard 
          products={products}
          coupons={coupons}
          orders={orders}
        />
      )}

      {activeTab === 'products' && (
        <ProductsList 
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeTab === 'offers' && (
        <OffersList 
          coupons={coupons}
          onAddCoupon={handleAddCoupon}
          onDeleteCoupon={handleDeleteCoupon}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesList 
          categories={mockCategories}
        />
      )}

      {activeTab === 'orders' && (
        <OrdersList 
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}
    </div>
  );
};

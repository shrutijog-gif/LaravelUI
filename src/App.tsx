import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import CollegeStorefront from './components/storefront/CollegeStorefront';
import PublicStoreApp from './components/storefront/PublicStoreApp';

export function App() {
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>(() => {
    return window.location.search.includes('mode=storefront') ? 'storefront' : 'admin';
  });

  const isEcommerceStorefront = window.location.search.includes('view=ecommerce');

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.search.includes('mode=storefront')) {
        setViewMode('storefront');
      } else {
        setViewMode('admin');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openStorefrontInNewTab = () => {
    const storefrontUrl = `${window.location.origin}${window.location.pathname}?mode=storefront`;
    window.open(storefrontUrl, '_blank');
  };

  const returnToAdmin = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = `${window.location.origin}${window.location.pathname}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {viewMode === 'storefront' ? (
          isEcommerceStorefront ? (
            <PublicStoreApp onToggleViewMode={returnToAdmin} />
          ) : (
            <CollegeStorefront onToggleViewMode={returnToAdmin} />
          )
        ) : (
          <Layout onToggleViewMode={openStorefrontInNewTab} />
        )}
      </div>
    </div>
  );
}

export default App;

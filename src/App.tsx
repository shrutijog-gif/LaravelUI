import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import CollegeStorefront from './components/storefront/CollegeStorefront';
import PublicStoreApp from './components/storefront/PublicStoreApp';
import { LoginPage } from './components/auth/LoginPage';
import { isAuthenticated, logout } from './services/authService';

export function App() {
  const isDirectPagePath = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    return path !== '/' && path !== '' && !path.startsWith('/@') && !path.startsWith('/src') && !path.includes('.');
  };

  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>(() => {
    return (window.location.search.includes('mode=storefront') || window.location.search.includes('page=') || isDirectPagePath()) 
      ? 'storefront' 
      : 'admin';
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => isAuthenticated());

  const isEcommerceStorefront = window.location.search.includes('view=ecommerce');

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.search.includes('mode=storefront') || window.location.search.includes('page=') || isDirectPagePath()) {
        setViewMode('storefront');
      } else {
        setViewMode('admin');
      }
    };

    const handleAuthChange = () => {
      setIsLoggedIn(isAuthenticated());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
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

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
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
        ) : !isLoggedIn ? (
          <LoginPage 
            onLoginSuccess={() => setIsLoggedIn(true)} 
            onVisitStorefront={openStorefrontInNewTab} 
          />
        ) : (
          <Layout 
            onToggleViewMode={openStorefrontInNewTab} 
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}

export default App;

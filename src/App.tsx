import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import CollegeStorefront from './components/storefront/CollegeStorefront';
import PublicStoreApp from './components/storefront/PublicStoreApp';
import { PortalLandingPage, PortalType } from './components/auth/PortalLandingPage';
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
  const [selectedPortal, setSelectedPortal] = useState<PortalType | null>(null);
  const [activePortalRole, setActivePortalRole] = useState<'superadmin' | 'collegeadmin'>('collegeadmin');

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
      const auth = isAuthenticated();
      setIsLoggedIn(auth);
      if (!auth) {
        setSelectedPortal(prev => prev || 'college');
      }
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
    try {
      const win = window.open(storefrontUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = storefrontUrl;
      }
    } catch {
      window.location.href = storefrontUrl;
    }
  };

  const returnToAdmin = () => {
    if (window.opener) {
      window.close();
    } else {
      window.location.href = `${window.location.origin}${window.location.pathname}`;
    }
  };

  const handleLoginSuccess = (portal?: PortalType) => {
    if (portal === 'superadmin') {
      setActivePortalRole('superadmin');
    } else {
      setActivePortalRole('collegeadmin');
    }
    if (portal) {
      localStorage.setItem('college_cms_portal_type', portal);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setSelectedPortal(null);
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
          !selectedPortal ? (
            <PortalLandingPage 
              onSelectPortal={(portal) => setSelectedPortal(portal)}
            />
          ) : (
            <LoginPage 
              portalType={selectedPortal}
              onBackToPortals={() => setSelectedPortal(null)}
              onLoginSuccess={handleLoginSuccess} 
              onVisitStorefront={openStorefrontInNewTab} 
            />
          )
        ) : (
          <Layout 
            initialPortalRole={activePortalRole}
            onToggleViewMode={openStorefrontInNewTab} 
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}

export default App;

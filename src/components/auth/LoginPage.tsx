import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowLeft, Globe, CheckCircle2, Building2, GraduationCap, ShieldCheck, School, FileCheck2 } from 'lucide-react';
import { login } from '../../services/authService';
import { getActiveTenant } from '../../data/tenantData';
import { PortalType } from './PortalLandingPage';

interface LoginPageProps {
  portalType?: PortalType;
  onLoginSuccess: (portal?: PortalType) => void;
  onBackToPortals?: () => void;
  onVisitStorefront?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  portalType = 'college', 
  onLoginSuccess, 
  onBackToPortals,
  onVisitStorefront 
}) => {
  const activeTenant = getActiveTenant();
  
  const getDefaultUsername = () => {
    if (portalType === 'naac-university') return 'univ.coordinator';
    if (portalType === 'naac-school') return 'school.coordinator';
    if (portalType === 'naac-program') return 'program.coordinator';
    if (portalType === 'society') return 'society.admin';
    if (portalType === 'superadmin') return 'superadmin';
    return 'admin';
  };

  const [username, setUsername] = useState(() => getDefaultUsername());
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    setUsername(getDefaultUsername());
    setPassword('admin');
  }, [portalType]);

  const isSuperadmin = portalType === 'superadmin';
  const isSociety = portalType === 'society';

  const getPortalInfo = () => {
    if (portalType === 'naac-university') {
      return {
        parentTitle: 'ITM SKILLS UNIVERSITY',
        parentClass: 'text-purple-600',
        title: 'University NAAC / IQAC Portal',
        subtitle: 'Sign in as University Coordinator to monitor all 5 schools and consolidate master SSR records.',
        iconBg: 'bg-gradient-to-br from-purple-900 to-indigo-900 text-white',
        renderIcon: () => <Building2 className="w-9 h-9 text-white" />,
      };
    }
    if (portalType === 'naac-school') {
      return {
        parentTitle: 'ITM SKILLS UNIVERSITY',
        parentClass: 'text-blue-600',
        title: 'School Coordinator Portal',
        subtitle: 'Sign in as School Coordinator to review and approve submissions across departmental programs.',
        iconBg: 'bg-gradient-to-br from-blue-900 to-indigo-950 text-white',
        renderIcon: () => <School className="w-9 h-9 text-white" />,
      };
    }
    if (portalType === 'naac-program') {
      return {
        parentTitle: 'ITM SKILLS UNIVERSITY',
        parentClass: 'text-emerald-600',
        title: 'Program Coordinator Portal',
        subtitle: 'Sign in as Program Coordinator to compile and submit Criteria 1–7 evidence proofs.',
        iconBg: 'bg-gradient-to-br from-emerald-900 to-teal-950 text-white',
        renderIcon: () => <FileCheck2 className="w-9 h-9 text-white" />,
      };
    }
    if (isSuperadmin) {
      return {
        parentTitle: 'WHITECODE TECHNOLOGIES',
        parentClass: 'text-amber-600',
        title: 'WhiteCode Master Console',
        subtitle: 'Sign in to access platform operations.',
        iconBg: 'bg-gradient-to-br from-gray-900 via-indigo-950 to-slate-900 text-amber-400',
        renderIcon: () => (
          <ShieldCheck className="w-9 h-9 text-amber-400" />
        ),
      };
    }
    if (isSociety) {
      return {
        parentTitle: 'CENTRAL TRUST GOVERNANCE',
        parentClass: 'text-indigo-600',
        title: 'Elite Multi-College Educational Society',
        subtitle: 'Sign in to access society administration.',
        iconBg: 'bg-gradient-to-br from-indigo-950 to-blue-900 text-white',
        renderIcon: () => (
          <Building2 className="w-9 h-9 text-white" />
        ),
      };
    }
    return {
      parentTitle: 'ELITE MULTI-COLLEGE EDUCATIONAL SOCIETY',
      parentClass: 'text-blue-600',
      title: 'Elite College of Arts, Science and Commerce (Autonomous)',
      subtitle: 'Sign in to continue.',
      iconBg: 'bg-[#0f2748] text-white',
      renderIcon: () => (
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-9 h-9 text-white"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    };
  };

  const portalInfo = getPortalInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password, portalType);
      setIsLoading(false);
      if (result.success) {
        onLoginSuccess(portalType);
      } else {
        setError(result.error || 'Invalid credentials');
      }
    }, 300);
  };

  return (
    <div 
      className="min-h-screen w-full relative flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat font-sans"
      style={{
               backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.55)), url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop')`,

      }}
    >
      {/* Top Bar Quick Links */}
      <div className="absolute top-5 left-5 flex items-center gap-2 z-20">
        {onBackToPortals && (
          <button
            onClick={onBackToPortals}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Select Portal</span>
          </button>
        )}
        {onVisitStorefront && (
          <a
            href="?mode=storefront"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer border border-white/10 no-underline"
            title="Visit Website"
          >
            <Globe className="w-3.5 h-3.5 text-blue-300" />
            <span>Visit Website</span>
          </a>
        )}
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-2xl p-8 sm:p-9 border border-gray-100/80 backdrop-blur-sm relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Emblem / Logo */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 rounded-2xl ${portalInfo.iconBg} flex items-center justify-center shadow-md p-3 transition-transform hover:scale-105`}>
            {portalInfo.renderIcon()}
          </div>
        </div>

        {/* Institution Title with Society Name First */}
        <div className="text-center mb-6">
          <p className={`text-[11px] font-black uppercase tracking-wider mb-1 ${portalInfo.parentClass}`}>
            {portalInfo.parentTitle}
          </p>
          <h1 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight leading-snug px-2">
            {portalInfo.title}
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {portalInfo.subtitle}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email */}
          <div>
            <div className="relative">
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Username or email"
                required
                className="w-full text-sm px-4 py-3 bg-[#eef4ff] hover:bg-[#e6eeff] focus:bg-white border border-blue-200/60 focus:border-blue-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Password"
                required
                className="w-full text-sm pl-4 pr-11 py-3 bg-[#eef4ff] hover:bg-[#e6eeff] focus:bg-white border border-blue-200/60 focus:border-blue-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>SIGN IN</span>
            )}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Reset Credentials</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              For security, administrator password resets are managed by the institution IT cell.
              Please contact your system administrator to reset your login credentials.
            </p>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

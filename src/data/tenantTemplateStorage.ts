// Tenant Template & Custom Code Storage (Header, Footer, Global CSS)
import { getStoredTenantId } from './tenantData';

export interface TenantTemplateData {
  headerHtml: string;
  footerHtml: string;
  customCss: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// MULTI-TENANT CONFIGURATION PROFILES (Pure Elite Palettes, Zero Vaze Remnants)
// -------------------------------------------------------------

export interface TenantHeaderConfig {
  id: string;
  societyName: string;
  collegeName: string;
  isAutonomous: boolean;
  autonomousText: string;
  accreditationLine: string;
  phone: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  anniversaryYears: string;
  anniversaryLabel: string;
  anniversarySub: string;
  logoSvg: string;
  footerAddress: string;
  copyrightText: string;
  tickerItems: string[];
}

export const TENANT_HEADER_CONFIGS: Record<string, TenantHeaderConfig> = {
  'elite-autonomous': {
    id: 'elite-autonomous',
    societyName: "Elite Multi-College Educational Society",
    collegeName: "Elite College of Arts, Science and Commerce",
    isAutonomous: true,
    autonomousText: "Autonomous",
    accreditationLine: 'Elite Academic City, Knowledge Park, Powai, Mumbai - 400 076 <span class="mx-1 text-gray-400">|</span> Autonomous College Accredited with &ldquo;A+&rdquo; Grade by NAAC',
    phone: "+91 (022) 2854 6000",
    email: "admissions@elite-autonomous.edu.in",
    primaryColor: "#0f2748",
    secondaryColor: "#2563eb",
    accentColor: "#f59e0b",
    anniversaryYears: "40",
    anniversaryLabel: "Years of Excellence",
    anniversarySub: "Teaching • Learning • Research",
    footerAddress: "Elite Academic City, Knowledge Park, Powai, Mumbai - 400 076",
    copyrightText: "© 2026 Elite College of Arts, Science and Commerce (Autonomous). All rights reserved.",
    logoSvg: `
      <svg viewBox="0 0 100 100" class="w-[70px] h-[70px] drop-shadow-sm shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#0f2748" stroke-width="3"/>
        <circle cx="50" cy="50" r="44" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="2 2"/>
        <path d="M50 14 L76 27 V52 C76 69 50 84 50 84 C50 84 24 69 24 52 V27 Z" fill="#0f2748"/>
        <path d="M50 18 L72 29 V50 C72 64 50 78 50 78 C50 78 28 64 28 50 V29 Z" fill="#1e40af" stroke="#f59e0b" stroke-width="1.5"/>
        <path d="M50 32 V54 M36 44 C42 41 47 42 50 45 C53 42 58 41 64 44 V33 C58 30 53 31 50 34 C47 31 42 30 36 33 Z" fill="#ffffff" stroke="#f59e0b" stroke-width="1"/>
        <path d="M50 22 C48 25 47 27 50 30 C53 27 52 25 50 22 Z" fill="#f59e0b"/>
        <circle cx="38" cy="62" r="2" fill="#fbbf24"/>
        <circle cx="50" cy="66" r="2.5" fill="#fbbf24"/>
        <circle cx="62" cy="62" r="2" fill="#fbbf24"/>
        <path d="M30 76 Q50 72 70 76 L66 82 Q50 78 34 82 Z" fill="#2563eb"/>
        <text x="50" y="80.5" font-size="5" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">ESTD 1984</text>
      </svg>
    `,
    tickerItems: [
      "Entrance Examination 2026-27 (Updated) FYBA FYBSc FYBVoc FYBCom",
      "Application Notice for academic year 2026-27 M.A. and M.Sc. Programs",
      "Summer Internship On Job Training (OJT) Schedule Released",
      "Updated M.Sc. Biotech Eligibility M.A. and M.Sc. Merit Lists"
    ],
  },
  'elite-tech': {
    id: 'elite-tech',
    societyName: "Elite Multi-College Educational Society",
    collegeName: "Elite Institute of Technology & Engineering",
    isAutonomous: true,
    autonomousText: "Autonomous",
    accreditationLine: 'Technology Innovation Corridor, Sector 4, Navi Mumbai - 400 708 <span class="mx-1 text-gray-400">|</span> Approved by AICTE, NBA & NAAC &ldquo;A++&rdquo; Grade',
    phone: "+91 (022) 2778 5500",
    email: "admissions@elite-tech.edu.in",
    primaryColor: "#0f172a",
    secondaryColor: "#4f46e5",
    accentColor: "#06b6d4",
    anniversaryYears: "25",
    anniversaryLabel: "Years of Innovation",
    anniversarySub: "Engineering • AI • Research",
    footerAddress: "Technology Innovation Corridor, Sector 4, Navi Mumbai - 400 708",
    copyrightText: "© 2026 Elite Institute of Technology & Engineering. All rights reserved.",
    logoSvg: `
      <svg viewBox="0 0 100 100" class="w-[70px] h-[70px] drop-shadow-sm shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
        <circle cx="50" cy="50" r="44" fill="#f8fafc" stroke="#4f46e5" stroke-width="1.5" stroke-dasharray="2 2"/>
        <polygon points="50,14 78,30 78,68 50,84 22,68 22,30" fill="#0f172a"/>
        <polygon points="50,18 74,32 74,66 50,80 26,66 26,32" fill="#312e81" stroke="#06b6d4" stroke-width="1.5"/>
        <circle cx="50" cy="48" r="15" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-dasharray="5 3"/>
        <circle cx="50" cy="48" r="7" fill="#4f46e5"/>
        <path d="M52 35 L44 48 H52 L48 61 L58 46 H50 L54 35 Z" fill="#fbbf24"/>
        <circle cx="34" cy="35" r="2" fill="#06b6d4"/>
        <circle cx="66" cy="35" r="2.5" fill="#06b6d4"/>
        <line x1="34" y1="35" x2="42" y2="42" stroke="#06b6d4" stroke-width="1.5"/>
        <line x1="66" y1="35" x2="58" y2="42" stroke="#06b6d4" stroke-width="1.5"/>
        <path d="M30 76 Q50 72 70 76 L66 82 Q50 78 34 82 Z" fill="#4f46e5"/>
        <text x="50" y="80.5" font-size="5" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">ESTD 1999</text>
      </svg>
    `,
    tickerItems: [
      "B.Tech Admissions 2026-27 via MHT-CET / JEE Main Applications Open",
      "AI & Data Science National Innovation Hackathon 2026 Registration Live",
      "Final Year Capstone Project Reviews & Industry Evaluations Scheduled",
      "IEEE International Conference on Emerging Computing Call for Papers"
    ],
  },
  'elite-agri': {
    id: 'elite-agri',
    societyName: "Elite Multi-College Educational Society",
    collegeName: "Elite Institute of Agricultural & Environmental Sciences",
    isAutonomous: true,
    autonomousText: "Autonomous",
    accreditationLine: 'Agro-Sciences Research Valley, Green Biosphere Campus, Maharashtra - 413 720 <span class="mx-1 text-gray-400">|</span> Recognized by ICAR & NAAC &ldquo;A+&rdquo; Grade',
    phone: "+91 (0240) 248 9911",
    email: "admissions@elite-agri.edu.in",
    primaryColor: "#14532d",
    secondaryColor: "#16a34a",
    accentColor: "#eab308",
    anniversaryYears: "30",
    anniversaryLabel: "Years in Agriculture",
    anniversarySub: "Agronomy • Biotech • Sustainability",
    footerAddress: "Agro-Sciences Research Valley, Green Biosphere Campus, Maharashtra - 413 720",
    copyrightText: "© 2026 Elite Institute of Agricultural & Environmental Sciences. All rights reserved.",
    logoSvg: `
      <svg viewBox="0 0 100 100" class="w-[70px] h-[70px] drop-shadow-sm shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#14532d" stroke-width="3"/>
        <circle cx="50" cy="50" r="44" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="2 2"/>
        <path d="M50 14 L76 27 V52 C76 69 50 84 50 84 C50 84 24 69 24 52 V27 Z" fill="#14532d"/>
        <path d="M50 18 L72 29 V50 C72 64 50 78 50 78 C50 78 28 64 28 50 V29 Z" fill="#166534" stroke="#86efac" stroke-width="1.5"/>
        <circle cx="50" cy="36" r="8" fill="#fef08a" opacity="0.8"/>
        <path d="M50 62 C50 48 40 40 34 42 C34 50 42 58 50 62 Z" fill="#4ade80"/>
        <path d="M50 62 C50 48 60 40 66 42 C66 50 58 58 50 62 Z" fill="#86efac"/>
        <path d="M50 62 V38" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
        <circle cx="50" cy="34" r="2.5" fill="#facc15"/>
        <circle cx="47" cy="37" r="2" fill="#facc15"/>
        <circle cx="53" cy="37" r="2" fill="#facc15"/>
        <path d="M30 76 Q50 72 70 76 L66 82 Q50 78 34 82 Z" fill="#16a34a"/>
        <text x="50" y="80.5" font-size="5" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">ESTD 1994</text>
      </svg>
    `,
    tickerItems: [
      "B.Sc (Hons) Agriculture & Precision Farming Enrollment 2026-27 Live",
      "Soil Health Testing & Organic Fertilizer Technology Workshop",
      "ICAR Accredited Research Fellowship Applications Now Open",
      "Annual National Agro-Tech & Sustainable Farming Expo 2026"
    ],
  },
};

export const getTenantHeaderConfig = (tenantId?: string): TenantHeaderConfig => {
  const tId = tenantId || getStoredTenantId();
  if (TENANT_HEADER_CONFIGS[tId]) {
    return TENANT_HEADER_CONFIGS[tId];
  }
  return TENANT_HEADER_CONFIGS['elite-autonomous'];
};

export const generateTenantHeaderHtml = (config: TenantHeaderConfig): string => {
  return `
<header class="elite-header-root w-full bg-white font-sans antialiased select-none">
  <!-- 1. TOP UTILITY BAR (Left: Contact with secondary underline | Right: Primary Color Bar with rounded-bl curve) -->
  <div class="top-utility-bar w-full flex items-stretch justify-between h-[38px] text-[13px] bg-white relative">
    <!-- Left: Phone & Email with matching underline -->
    <div class="flex items-center pl-6 sm:pl-12 shrink-0">
      <div class="inline-flex items-center gap-4 text-gray-800 text-[13px] border-b-2 pb-0.5" style="border-color: ${config.secondaryColor};">
        <a href="tel:${config.phone.replace(/[^0-9+]/g, '')}" class="flex items-center gap-1.5 hover:opacity-80 transition-opacity text-gray-800">
          <svg class="w-3.5 h-3.5 text-gray-800 fill-current" viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          <span class="font-normal text-gray-800 text-[13px]">${config.phone}</span>
        </a>
        <span class="text-gray-400 font-light text-xs">|</span>
        <a href="mailto:${config.email}" class="flex items-center gap-1.5 hover:opacity-80 transition-opacity text-gray-800">
          <svg class="w-3.5 h-3.5 text-gray-800 fill-current" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <span class="font-normal text-gray-800 text-[13px]">${config.email}</span>
        </a>
      </div>
    </div>

    <!-- Right: Curved Bar matching tenant primary color -->
    <div class="hidden md:flex items-center gap-7 text-white pl-9 pr-12 h-full text-[13px] font-normal shadow-xs rounded-bl-[35px]" style="background-color: ${config.primaryColor};">
      <div class="flex items-center gap-1 cursor-pointer hover:text-amber-300 transition-colors">
        <span>Student Portal</span>
        <svg class="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>
      <div class="flex items-center gap-1 cursor-pointer hover:text-amber-300 transition-colors">
        <span>NEP 2020</span>
        <svg class="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>
      <div class="flex items-center gap-1 cursor-pointer hover:text-amber-300 transition-colors">
        <span>Alumni</span>
        <svg class="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>
      <div class="flex items-center gap-1 cursor-pointer hover:text-amber-300 transition-colors">
        <span>Feedback</span>
        <svg class="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>
      <div class="flex items-center gap-1 cursor-pointer hover:text-amber-300 transition-colors">
        <span>App Links</span>
        <svg class="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>
      <a href="#contact" class="hover:text-amber-300 transition-colors">
        Contact
      </a>
    </div>
  </div>

  <!-- 2. MAIN BRANDING ROW (Authentic Tenant Emblem Logo, Serif Title, Stars, Anniversary Badge) -->
  <div class="header-main-branding py-3.5 px-6 sm:px-12 flex items-center justify-between gap-6 bg-white">
    <!-- Left: Authentic Emblem Logo + Society Name + College Serif Title -->
    <div class="flex items-center gap-4 sm:gap-5">
      <div class="shrink-0 flex items-center justify-center">
        ${config.logoSvg}
      </div>

      <div class="space-y-0.5">
        <p class="text-[12px] font-bold text-gray-600 tracking-wide uppercase">
          ${config.societyName}
        </p>
        <h1 class="text-xl sm:text-2xl md:text-[25px] font-bold leading-tight flex flex-wrap items-center gap-2 font-serif" style="font-family: 'DM Serif Display', 'Playfair Display', Georgia, serif; color: ${config.primaryColor};">
          <span>${config.collegeName}</span>
          ${config.isAutonomous ? `
            <span class="text-amber-500 text-lg leading-none">★</span>
            <span class="font-serif font-bold text-xl sm:text-2xl" style="color: ${config.primaryColor};">${config.autonomousText}</span>
            <span class="text-amber-500 text-lg leading-none">★</span>
          ` : ''}
        </h1>
        <p class="text-[12px] sm:text-[13px] text-gray-600 font-normal">
          ${config.accreditationLine}
        </p>
      </div>
    </div>

    <!-- Right: Authentic Anniversary Badge -->
    <div class="hidden lg:flex items-center shrink-0 pr-4">
      <div class="flex items-center gap-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-2xl px-3.5 py-2 shadow-xs">
        <div class="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-lg shadow-xs" style="background-color: ${config.primaryColor};">
          ${config.anniversaryYears}
        </div>
        <div class="text-left leading-tight">
          <p class="text-[10px] font-black tracking-widest uppercase text-blue-900">${config.anniversaryLabel}</p>
          <p class="text-[11px] font-bold text-gray-700">${config.anniversarySub}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 3. MAIN NAVIGATION BAR (Secondary Color with Active Primary Color Home Tab) -->
  <nav class="elite-navbar text-white px-6 sm:px-12 flex items-center shadow-xs" style="background-color: ${config.secondaryColor};">
    <div class="flex items-center overflow-x-auto scrollbar-none text-[13px] font-semibold tracking-wide">
      <!-- Active Home Button -->
      <a href="?mode=storefront" class="text-white px-5 py-3 flex items-center font-bold tracking-wider hover:opacity-90 transition-opacity" style="background-color: ${config.primaryColor};">
        Home
      </a>

      <a href="#academics" class="px-4 py-3 hover:bg-black/10 transition-colors whitespace-nowrap">
        Academics
      </a>

      <div class="group relative px-4 py-3 hover:bg-black/10 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Programs</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <div class="group relative px-4 py-3 hover:bg-black/10 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Departments</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <a href="#admission" class="px-4 py-3 hover:bg-black/10 transition-colors whitespace-nowrap">
        Admission
      </a>

      <div class="group relative px-4 py-3 hover:bg-black/10 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Procedures</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <a href="#library" class="px-4 py-3 hover:bg-black/10 transition-colors whitespace-nowrap">
        Library
      </a>

      <div class="group relative px-4 py-3 hover:bg-black/10 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Associations</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <div class="group relative px-4 py-3 hover:bg-black/10 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Students' Corner</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <div class="group relative px-4 py-3 hover:bg-black/10 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>NAAC</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <div class="group relative px-4 py-3 hover:bg-black/10 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>IQAC</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <div class="group relative px-4 py-3 hover:bg-black/10 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Research</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>
    </div>
  </nav>

  <!-- 4. SCROLLING NEWS TICKER -->
  <div class="news-ticker-strip bg-white py-1.5 px-6 sm:px-12 flex items-center text-[12.5px] text-gray-700 overflow-hidden border-b-2" style="border-color: ${config.accentColor};">
    <div class="flex items-center gap-6 whitespace-nowrap">
      ${config.tickerItems.map((item, idx) => `
        <span class="text-gray-700 font-normal">${item}</span>
        ${idx < config.tickerItems.length - 1 ? `<span class="w-2 h-2 rounded-full inline-block shrink-0" style="background-color: ${config.secondaryColor};"></span>` : ''}
      `).join('')}
    </div>
  </div>
</header>
  `;
};

export const generateTenantFooterHtml = (config: TenantHeaderConfig): string => {
  return `
<footer class="footer-custom text-white font-sans antialiased relative overflow-hidden select-none border-t-4" style="background-color: ${config.primaryColor}; border-color: ${config.secondaryColor};">
  <div class="w-full flex flex-col lg:flex-row items-stretch justify-between relative min-h-[340px]">
    <!-- Left Columns inside Container -->
    <div class="w-full lg:w-[60%] xl:w-[62%] py-10 px-6 sm:px-12 z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-[13px]">
      
      <!-- Col 1: Trust & College Details -->
      <div class="space-y-2.5">
        <div class="flex items-start gap-3.5">
          <div class="w-14 h-14 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center shadow-xs">
            ${config.logoSvg}
          </div>
          <div>
            <p class="text-[12px] font-normal text-white/90">${config.societyName}</p>
            <h3 class="font-bold text-white text-[15px] leading-snug font-serif">
              ${config.collegeName}
            </h3>
            <p class="text-[11px] text-amber-300 font-serif">(${config.autonomousText})</p>
          </div>
        </div>

        <div class="border-t border-white/20 pt-2.5 mt-2">
          <p class="text-white/90 text-xs leading-relaxed">
            ${config.footerAddress}
          </p>
        </div>

        <div class="border-t border-white/20 pt-2.5">
          <p class="text-white/90 text-xs">
            ${config.phone} <span class="mx-1 text-white/50">|</span> ${config.email}
          </p>
        </div>
      </div>

      <!-- Col 2: Important Links with Chevron icons -->
      <div class="space-y-3 pl-0 md:pl-2">
        <h4 class="font-medium text-white text-base tracking-wide">Important Links</h4>
        <ul class="space-y-2.5 text-white/90 text-xs mt-3">
          <li><a href="#admissions" class="hover:text-amber-300 flex items-center gap-2 transition-colors"><span class="font-bold">›</span> Admissions 2026</a></li>
          <li><a href="#academic-calendar" class="hover:text-amber-300 flex items-center gap-2 transition-colors"><span class="font-bold">›</span> Academic Calendar</a></li>
          <li><a href="#research" class="hover:text-amber-300 flex items-center gap-2 transition-colors"><span class="font-bold">›</span> Research & Publications</a></li>
          <li><a href="#scholarships" class="hover:text-amber-300 flex items-center gap-2 transition-colors"><span class="font-bold">›</span> Government Scholarships</a></li>
        </ul>
      </div>

      <!-- Col 3: Time For Contact & Visitors Counter -->
      <div class="space-y-3">
        <h4 class="font-medium text-white text-base tracking-wide">Time For Contact</h4>
        <div class="text-white/90 text-xs space-y-1.5 mt-3">
          <p>10:00 AM to 01:00 PM</p>
          <p>02:00 PM to 04:00 PM</p>
        </div>

        <div class="pt-3">
          <span class="text-white/80 text-[13px] font-normal block mb-2">Visitors Counter</span>
          <div class="flex items-center gap-2 text-white font-mono text-sm tracking-widest">
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/25 rounded">0</span>
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/25 rounded">0</span>
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/25 rounded">4</span>
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/25 rounded">2</span>
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/25 rounded">9</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side Institutional Accreditation & Campus Quick Desk -->
    <div class="hidden lg:flex flex-col justify-between w-[40%] xl:w-[38%] py-10 px-8 bg-black/20 border-l border-white/10 shrink-0">
      <div>
        <h4 class="font-bold text-white text-base tracking-wide flex items-center gap-2 mb-3">
          <span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: ${config.accentColor};"></span>
          Institutional Accreditations
        </h4>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <span class="text-[10px] uppercase font-black text-amber-300 block mb-0.5">NAAC Rating</span>
            <span class="text-white font-bold">Grade A+ (Cycle 4)</span>
          </div>
          <div class="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <span class="text-[10px] uppercase font-black text-amber-300 block mb-0.5">Status</span>
            <span class="text-white font-bold">UGC Autonomous</span>
          </div>
          <div class="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <span class="text-[10px] uppercase font-black text-amber-300 block mb-0.5">National Ranking</span>
            <span class="text-white font-bold">NIRF Ranked #32</span>
          </div>
          <div class="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <span class="text-[10px] uppercase font-black text-amber-300 block mb-0.5">Standards</span>
            <span class="text-white font-bold">ISO 9001:2015</span>
          </div>
        </div>
      </div>

      <div class="pt-6 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
        <div>
          <span class="block text-[11px] text-white/60">Admission Desk</span>
          <span class="font-bold text-white text-sm">${config.phone}</span>
        </div>
        <a href="#admissions" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-white/25 hover:bg-white/10 transition-colors">
          <span>Apply Online</span>
          <span>→</span>
        </a>
      </div>
    </div>
  </div>

  <!-- Copyright Bar -->
  <div class="w-full bg-black/30 text-white/80 py-3.5 px-6 sm:px-12 flex items-center justify-between text-xs border-t border-white/10">
    <p>${config.copyrightText}</p>
    <p class="text-white/60 text-[11px]">Powered by WhiteCode CMS Platform</p>
  </div>
</footer>
  `;
};

export const generateTenantCss = (config: TenantHeaderConfig): string => {
  return `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap');

:root {
  --font-primary: "DM Serif Display", serif;
  --font-secondary: "Manrope", sans-serif;
  --color-primary: ${config.primaryColor};
  --color-heading: ${config.primaryColor};
  --color-secondary: ${config.secondaryColor};
  --color-accent: ${config.accentColor};
}

body {
  color: #1f2937;
  font-family: var(--font-secondary);
}

.font-serif {
  font-family: var(--font-primary) !important;
}

.top-nav-curved-banner {
  background-color: var(--color-primary);
}

.elite-navbar {
  background-color: var(--color-secondary);
}
`;
};

// Backward compatibility exports for existing developer studio views
export const DEFAULT_VAZE_HEADER_HTML = generateTenantHeaderHtml(TENANT_HEADER_CONFIGS['elite-autonomous']);
export const DEFAULT_VAZE_FOOTER_HTML = generateTenantFooterHtml(TENANT_HEADER_CONFIGS['elite-autonomous']);
export const DEFAULT_GLOBAL_CSS = generateTenantCss(TENANT_HEADER_CONFIGS['elite-autonomous']);

// Helper to get storage key
const getTenantStorageKey = (tenantId: string) => `tenant_cms_template_${tenantId}`;

const TEMPLATE_VERSION_KEY = 'tenant_cms_template_version_v20_pure_elite_custom_colors';

export const getTenantTemplateData = (tenantId?: string): TenantTemplateData => {
  const tId = tenantId || getStoredTenantId();
  const config = getTenantHeaderConfig(tId);

  try {
    const storedVer = localStorage.getItem(TEMPLATE_VERSION_KEY);
    if (storedVer !== TEMPLATE_VERSION_KEY) {
      // Clear out outdated cached versions across tenants so dynamic tenant headers take effect immediately
      localStorage.removeItem(getTenantStorageKey('elite-autonomous'));
      localStorage.removeItem(getTenantStorageKey('elite-tech'));
      localStorage.removeItem(getTenantStorageKey('elite-agri'));
      localStorage.removeItem(getTenantStorageKey('tenant_vaze'));
      localStorage.setItem(TEMPLATE_VERSION_KEY, TEMPLATE_VERSION_KEY);
    }
    const raw = localStorage.getItem(getTenantStorageKey(tId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading tenant template data', e);
  }

  // Tenant-specific fallback
  const fallback: TenantTemplateData = {
    headerHtml: generateTenantHeaderHtml(config),
    footerHtml: generateTenantFooterHtml(config),
    customCss: generateTenantCss(config),
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(getTenantStorageKey(tId), JSON.stringify(fallback));
  } catch (e) {}
  return fallback;
};

export const saveTenantTemplateData = (data: Partial<TenantTemplateData>, tenantId?: string) => {
  const tId = tenantId || getStoredTenantId();
  const current = getTenantTemplateData(tId);
  const updated: TenantTemplateData = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(getTenantStorageKey(tId), JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('tenant-template-updated', { detail: { tenantId: tId, data: updated } }));
  return updated;
};

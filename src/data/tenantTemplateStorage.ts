// Tenant Template & Custom Code Storage (Header, Footer, Global CSS)
import { getStoredTenantId } from './tenantData';

export interface TenantTemplateData {
  headerHtml: string;
  footerHtml: string;
  customCss: string;
  updatedAt?: string;
}

// 100% Pixel-perfect Header matching the Designer's Screenshot
export const DEFAULT_VAZE_HEADER_HTML = `
<header class="vaze-header-root w-full bg-white font-sans antialiased select-none">
  <!-- 1. TOP UTILITY BAR (Left: Contact with teal underline | Right: Authentic Deep Navy Bar with rounded-bl curve) -->
  <div class="top-utility-bar w-full flex items-stretch justify-between h-[38px] text-[13px] bg-white relative">
    <!-- Left: Phone & Email with authentic teal underline matching designer mockup -->
    <div class="flex items-center pl-6 sm:pl-12 shrink-0">
      <div class="inline-flex items-center gap-4 text-gray-800 text-[13px] border-b-2 border-[#168884] pb-0.5">
        <a href="tel:+919876543210" class="flex items-center gap-1.5 hover:text-[#0c2367] transition-colors text-gray-800">
          <svg class="w-3.5 h-3.5 text-gray-800 fill-current" viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          <span class="font-normal text-gray-800 text-[13px]">+91 9876543210</span>
        </a>
        <span class="text-gray-400 font-light text-xs">|</span>
        <a href="mailto:vazecollege@gmail.com" class="flex items-center gap-1.5 hover:text-[#0c2367] transition-colors text-gray-800">
          <svg class="w-3.5 h-3.5 text-gray-800 fill-current" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <span class="font-normal text-gray-800 text-[13px]">vazecollege@gmail.com</span>
        </a>
      </div>
    </div>

    <!-- Right: Authentic Deep Navy Bar with rounded bottom-left corner matching designer screenshot -->
    <div class="hidden md:flex items-center gap-7 bg-[#0c2367] text-white pl-9 pr-12 h-full text-[13px] font-normal shadow-xs rounded-bl-[35px]">
      <div class="flex items-center gap-1 cursor-pointer hover:text-amber-300 transition-colors">
        <span>Junior College</span>
        <svg class="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>
      <div class="flex items-center gap-1 cursor-pointer hover:text-amber-300 transition-colors">
        <span>NEP</span>
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

  <!-- 2. MAIN BRANDING ROW (Authentic Emblem, Serif Title with Yellow Stars, 40-Years Badge - NO accessibility icon) -->
  <div class="header-main-branding py-3.5 px-6 sm:px-12 flex items-center justify-between gap-6 bg-white">
    <!-- Left: Authentic Blue Emblem Logo + Trust Name + College Serif Title -->
    <div class="flex items-center gap-4 sm:gap-5">
      <!-- Authentic Blue College Emblem -->
      <div class="shrink-0">
        <img 
          src="/website-assets/vaze_emblem_logo.png" 
          alt="V. G. Vaze College Official Emblem" 
          class="w-[70px] h-[70px] object-contain"
        />
      </div>

      <div class="space-y-0.5">
        <p class="text-[12px] font-semibold text-gray-800 tracking-wide uppercase">
          The Kelkar Education Trust's
        </p>
        <h1 class="text-xl sm:text-2xl md:text-[26px] font-bold text-[#0c2367] leading-tight flex flex-wrap items-center gap-2 font-serif" style="font-family: 'DM Serif Display', 'Playfair Display', Georgia, serif;">
          <span>V. G. Vaze College of Arts, Science and Commerce</span>
          <span class="text-amber-400 text-lg leading-none">★</span>
          <span class="text-[#0c2367] font-serif font-bold text-xl sm:text-2xl">Autonomous</span>
          <span class="text-amber-400 text-lg leading-none">★</span>
        </h1>
        <p class="text-[12px] sm:text-[13px] text-gray-600 font-normal">
          Mithagar Road, Mulund (East), Mumbai - 400 081 <span class="mx-1 text-gray-400">|</span> Reaccredited (4th cycle) by NAAC with &ldquo;A&rdquo; Grade
        </p>
      </div>
    </div>

    <!-- Right: Authentic 40-Years Anniversary Badge with building illustration & tagline (Exact scale matching designer) -->
    <div class="hidden lg:flex items-center shrink-0 pr-4">
      <img 
        src="/website-assets/vaze_40years_pure.png" 
        alt="40 Years of Excellence Teaching Learning Research" 
        class="h-[58px] sm:h-[62px] w-auto object-contain"
      />
    </div>
  </div>

  <!-- 3. MAIN NAVIGATION BAR (Teal Green with Active Navy Home Pill & Dropdown Carets) -->
  <nav class="vaze-navbar bg-[#168884] text-white px-6 sm:px-12 flex items-center shadow-xs">
    <div class="flex items-center overflow-x-auto scrollbar-none text-[13px] font-semibold tracking-wide">
      <!-- Active Home Button (Deep Navy Rectangular tab) -->
      <a href="?mode=storefront" class="bg-[#0c2367] text-white px-5 py-3 flex items-center font-bold tracking-wider hover:bg-[#081847] transition-colors">
        Home
      </a>

      <a href="#academics" class="px-4 py-3 hover:bg-[#12726f] transition-colors whitespace-nowrap">
        Academics
      </a>

      <div class="group relative px-4 py-3 hover:bg-[#12726f] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Programs</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <div class="group relative px-4 py-3 hover:bg-[#12726f] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Departments</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <a href="#admission" class="px-4 py-3 hover:bg-[#12726f] transition-colors whitespace-nowrap">
        Admission
      </a>

      <div class="group relative px-4 py-3 hover:bg-[#12726f] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Procedures</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <a href="#library" class="px-4 py-3 hover:bg-[#12726f] transition-colors whitespace-nowrap">
        Library
      </a>

      <div class="group relative px-4 py-3 hover:bg-[#12726f] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Associations</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <div class="group relative px-4 py-3 hover:bg-[#12726f] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Students' Corner</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <div class="group relative px-4 py-3 hover:bg-[#12726f] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>NAAC</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <div class="group relative px-4 py-3 hover:bg-[#12726f] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>IQAC</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>

      <div class="group relative px-4 py-3 hover:bg-[#12726f] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap">
        <span>Research</span>
        <svg class="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
      </div>
    </div>
  </nav>

  <!-- 4. SCROLLING NEWS TICKER WITH MUSTARD YELLOW BOTTOM BORDER (Matching screenshot exactly) -->
  <div class="news-ticker-strip bg-white py-1.5 px-6 sm:px-12 flex items-center text-[12.5px] text-gray-700 overflow-hidden border-b-2 border-[#f4c430]">
    <div class="flex items-center gap-6 whitespace-nowrap">
      <span class="text-gray-700 font-normal">Entrance Examination 2025-26 (Updated on 13/05/2025) FYBA FYBSc FYBVoc</span>
      <span class="w-2 h-2 rounded-full bg-[#0c2367] inline-block shrink-0"></span>
      <span class="text-gray-700 font-normal">Application Notice for the year 2025-26 M.A. and M.Sc.</span>
      <span class="w-2 h-2 rounded-full bg-[#0c2367] inline-block shrink-0"></span>
      <span class="text-gray-700 font-normal">Summer Internship On Job Training (OJT)</span>
      <span class="w-2 h-2 rounded-full bg-[#0c2367] inline-block shrink-0"></span>
      <span class="text-gray-700 font-normal">Updated M.Sc. Biotech Eligibility M.A. and M.Sc. Merit Lists</span>
    </div>
  </div>
</header>
`;

// Pixel-perfect Footer matching Designer's Figma & Homepage Screenshot
export const DEFAULT_VAZE_FOOTER_HTML = `
<footer class="footer-custom bg-[#0d2366] text-white font-sans antialiased relative overflow-hidden select-none border-t-4 border-[#168884]">
  <div class="w-full flex flex-col lg:flex-row items-stretch justify-between relative min-h-[340px]">
    <!-- Left 3 Columns inside Navy Container -->
    <div class="w-full lg:w-[58%] xl:w-[60%] py-10 px-6 sm:px-12 z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-[13px]">
      
      <!-- Col 1: Trust & College Details with horizontal rule dividers -->
      <div class="space-y-2.5">
        <div class="flex items-start gap-3.5">
          <img 
            src="/website-assets/vaze_emblem_logo.png" 
            alt="V. G. Vaze College Logo" 
            class="w-14 h-14 object-contain bg-white rounded-lg p-1 shrink-0"
          />
          <div>
            <p class="text-[12px] font-normal text-white">The Kelkar Education Trust's</p>
            <h3 class="font-bold text-white text-[16px] leading-snug font-serif">
              V. G. Vaze College of Arts, Science and Commerce
            </h3>
            <p class="text-[12px] text-white font-serif">(Empowered Autonomous)</p>
          </div>
        </div>

        <div class="border-t border-white/40 pt-2.5 mt-2">
          <p class="text-white text-xs leading-relaxed">
            Mithagar Road, Mulund (East.), Mumbai - 400 081
          </p>
        </div>

        <div class="border-t border-white/40 pt-2.5">
          <p class="text-white text-xs">
            +91 9876543210 <span class="mx-1 text-white/60">|</span> Email: vazecollege@gmail.com
          </p>
        </div>
      </div>

      <!-- Col 2: Important Links with Chevron icons -->
      <div class="space-y-3 pl-0 md:pl-2">
        <h4 class="font-medium text-white text-base tracking-wide">Important Links</h4>
        <ul class="space-y-2.5 text-white text-xs mt-3">
          <li><a href="#admissions" class="hover:text-amber-300 flex items-center gap-2 transition-colors"><span class="font-bold">›</span> Admissions</a></li>
          <li><a href="#special-cell" class="hover:text-amber-300 flex items-center gap-2 transition-colors"><span class="font-bold">›</span> Special Cell</a></li>
          <li><a href="#research" class="hover:text-amber-300 flex items-center gap-2 transition-colors"><span class="font-bold">›</span> Research</a></li>
          <li><a href="#scholarship" class="hover:text-amber-300 flex items-center gap-2 transition-colors"><span class="font-bold">›</span> Scholarship</a></li>
        </ul>
      </div>

      <!-- Col 3: Time For Contact & Visitors Counter -->
      <div class="space-y-3">
        <h4 class="font-medium text-white text-base tracking-wide">Time For Contact</h4>
        <div class="text-white text-xs space-y-1.5 mt-3">
          <p>10:00 AM to 01:00 PM</p>
          <p>02:00 PM to 04:00 PM</p>
        </div>

        <div class="pt-3">
          <span class="text-white text-[13px] font-normal block mb-2">Visitors Counter</span>
          <div class="flex items-center gap-2 text-white font-mono text-sm tracking-widest">
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/20">0</span>
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/20">0</span>
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/20">0</span>
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/20">0</span>
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/20">6</span>
            <span class="border border-white/30 px-1.5 py-0.5 bg-black/20">6</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Right Side Map & Diagonal Cut using exact designer crop -->
    <div class="hidden lg:block w-[42%] xl:w-[40%] relative min-h-[320px] shrink-0 overflow-hidden">
      <img 
        src="/website-assets/vaze_footer_map_side.png" 
        alt="Mulund East Campus Location Map" 
        class="w-full h-full object-cover object-left"
      />
    </div>
  </div>

  <!-- Copyright Bar -->
  <div class="w-full bg-[#f3f4f6] text-gray-700 py-3.5 px-6 sm:px-12 flex items-center justify-between text-xs border-t border-gray-200">
    <p>© 2026 VGVCASC. All rights reserved.</p>
    <p class="text-gray-500 text-[11px]">Powered by WhiteCode CMS Platform</p>
  </div>
</footer>
`;

export const DEFAULT_GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap');

:root {
  --font-primary: "DM Serif Display", serif;
  --font-secondary: "Manrope", sans-serif;
  --color-primary: #0c2367;
  --color-heading: #0c2367;
  --color-secondary: #168884;
  --color-accent: #f4c430;
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

.vaze-navbar {
  background-color: var(--color-secondary);
}
`;

// Helper to get storage key
const getTenantStorageKey = (tenantId: string) => `tenant_cms_template_${tenantId}`;

const TEMPLATE_VERSION_KEY = 'tenant_cms_template_version_v12';

export const getTenantTemplateData = (tenantId?: string): TenantTemplateData => {
  const tId = tenantId || getStoredTenantId();
  try {
    const storedVer = localStorage.getItem(TEMPLATE_VERSION_KEY);
    if (!storedVer) {
      // Clear out outdated cached versions across tenants
      localStorage.removeItem(getTenantStorageKey(tId));
      localStorage.removeItem(getTenantStorageKey('tenant_vaze'));
      localStorage.setItem(TEMPLATE_VERSION_KEY, 'v11_exact_specs');
    }
    const raw = localStorage.getItem(getTenantStorageKey(tId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading tenant template data', e);
  }

  // Default fallback
  const fallback: TenantTemplateData = {
    headerHtml: DEFAULT_VAZE_HEADER_HTML,
    footerHtml: DEFAULT_VAZE_FOOTER_HTML,
    customCss: DEFAULT_GLOBAL_CSS,
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

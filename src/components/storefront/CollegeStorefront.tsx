import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  FileText, 
  Award, 
  Users, 
  ChevronRight, 
  Download, 
  ArrowUpRight, 
  Quote, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Sparkles,
  Building2,
  Globe
} from 'lucide-react';
import { getActiveTenant, CollegeTenant, collegeTenantsList, setActiveTenantId } from '../../data/tenantData';
import { TimetableBlock } from './blocks/TimetableBlock';
import { DynamicModuleBlock } from './blocks/DynamicModuleBlock';

interface CollegeStorefrontProps {
  onToggleViewMode?: () => void;
}

export const CollegeStorefront: React.FC<CollegeStorefrontProps> = ({ onToggleViewMode }) => {
  const [tenant, setTenant] = useState<CollegeTenant>(getActiveTenant());

  useEffect(() => {
    const handleTenantChange = () => {
      setTenant(getActiveTenant());
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Dynamic Storefront Section for Studio Modules */}
      <div className="bg-amber-50/40 border-b border-amber-100 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <DynamicModuleBlock moduleSlug="awards" titleOverride={`Institutional Awards & Honors (${tenant.name})`} />
        </div>
      </div>
      
      {/* 1. Top Utility Header Bar */}
      <div 
        className="text-white text-xs py-2 px-4 sm:px-8 border-b border-black/10 transition-colors sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: tenant.primaryColor }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-6 text-white/90">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <a href="tel:+911123456789" className="hover:underline">+91 (011) 2345 6789</a>
            </span>
            <span className="hidden md:flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>admissions@{tenant.id}.edu.in</span>
            </span>
            <span className="hidden lg:flex items-center gap-1 text-white/80 font-semibold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>NAAC Accredited Grade A++ Institution</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Tenant Switcher */}
            <div className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1 rounded-lg border border-white/20 transition-all">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <select
                value={tenant.id}
                onChange={(e) => setActiveTenantId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white cursor-pointer outline-none border-none p-0 pr-2"
              >
                {collegeTenantsList.map(t => (
                  <option key={t.id} value={t.id} className="text-gray-900 font-semibold">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {onToggleViewMode && (
              <button
                onClick={onToggleViewMode}
                className="flex items-center gap-1.5 text-xs text-white hover:text-amber-200 transition-colors cursor-pointer bg-black/25 hover:bg-black/40 px-3 py-1 rounded-lg border border-white/20 shadow-2xs font-semibold"
                title="Return to Admin Dashboard"
              >
                <Globe className="w-3.5 h-3.5 text-amber-300" />
                <span>Return to <strong>Admin Dashboard</strong></span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. Main College Branding Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-9 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & Institution Name */}
          <div className="flex items-center gap-3.5">
            <div 
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tenant.badgeGradient} p-2 flex items-center justify-center text-white shadow-md`}
            >
              {tenant.logoType === 'lady-irwin' && (
                <span className="font-extrabold text-lg tracking-wider">LI</span>
              )}
              {tenant.logoType === 'kvk-leaf' && (
                <GraduationCap className="w-7 h-7 text-emerald-200" />
              )}
              {tenant.logoType === 'university-crest' && (
                <span className="font-extrabold text-lg tracking-wider">SX</span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest block leading-none mb-1">
                Autonomous University Portal
              </span>
              <h1 
                className="text-xl sm:text-2xl font-black tracking-tight leading-tight"
                style={{ color: tenant.primaryColor }}
              >
                {tenant.name}
              </h1>
              <p className="text-xs text-gray-500 font-medium">{tenant.subtitle}</p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-bold text-gray-700">
            <a href="#hero" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#principal-message" className="hover:text-blue-600 transition-colors">Principal's Message</a>
            <a href="#timetables-section" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
              Timetables
              <span className="bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">Live</span>
            </a>
            <a href="#alumni-section" className="hover:text-blue-600 transition-colors">Alumni Network</a>
            <a href="#notices" className="hover:text-blue-600 transition-colors">Notices</a>
          </div>
        </div>
      </nav>

      {/* 3. Hero Banner Section */}
      <section 
        id="hero" 
        className="relative bg-cover bg-center text-white py-20 sm:py-28 px-4 sm:px-8 overflow-hidden shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.52), rgba(0, 0, 0, 0.72)), url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85')`
        }}
      >
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/30 text-xs font-semibold text-amber-300 shadow-md">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Admissions Open for Academic Year 2026–27</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight drop-shadow-md">
              Empowering Future Leaders through <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                Academic Excellence &amp; Innovation
              </span>
            </h2>

            <p className="text-base sm:text-lg text-gray-100 max-w-2xl leading-relaxed drop-shadow-xs font-medium">
              Welcome to <strong>{tenant.name}</strong>. A premier seat of higher education dedicated to research, technological advancement, and holistic student development.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#timetables-section"
                className="bg-amber-500 hover:bg-amber-600 text-gray-900 text-sm font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>View Academic Timetables</span>
              </a>

              <a
                href="#principal-message"
                className="bg-black/50 hover:bg-black/70 text-white text-sm font-bold px-6 py-3 rounded-xl border border-white/30 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md shadow-md"
              >
                <Quote className="w-4 h-4 text-amber-300" />
                <span>Principal's Message</span>
              </a>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="lg:col-span-4 bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-400" /> Key Campus Highlights
            </h3>
            <ul className="space-y-3 text-xs text-gray-200">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>State-of-the-Art Research Laboratories &amp; Digital Library</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>100% Placement Assistance &amp; Corporate Partnerships</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>Scholarship Grants for Merit &amp; Economically Weaker Students</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Principal's Message Section */}
      <section id="principal-message" className="py-16 sm:py-20 px-4 sm:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Principal Photo Container */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative group">
              <div 
                className="w-64 h-72 sm:w-72 sm:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-gray-100 flex items-center justify-center text-white"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                <div className="text-center p-6 space-y-3">
                  <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/40 mx-auto flex items-center justify-center text-4xl font-bold">
                    🎓
                  </div>
                  <h4 className="text-lg font-extrabold text-white">Dr. Ananya Sharma</h4>
                  <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Principal &amp; Dean</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-gray-900 font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                <Quote className="w-4 h-4" /> 25+ Yrs Academic Leadership
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Quote className="w-3.5 h-3.5" /> Message from Leadership
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              "Fostering Academic Rigor, Character &amp; Global Competence"
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed">
              Welcome to <strong>{tenant.name}</strong>. Education is not merely the acquisition of knowledge; it is the empowerment to think critically, innovate fearlessly, and serve society with integrity.
            </p>

            <p className="text-sm text-gray-600 leading-relaxed">
              Our faculty members are world-class researchers and mentors who guide students through rigorous curriculum, practical industry projects, and holistic co-curricular growth. We invite you to explore our academic programs and join our vibrant community.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <div>
                <h5 className="text-sm font-bold text-gray-900">Dr. Ananya Sharma, Ph.D.</h5>
                <p className="text-xs text-gray-500">Principal, {tenant.name}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Academic Timetables Section (Live Multi-Tenant Timetable Block) */}
      <section id="timetables-section" className="py-16 sm:py-20 px-4 sm:px-8 bg-gray-50/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Academic Downloads
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-gray-900">
              Class &amp; Examination Timetables ({tenant.name})
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Download official examination schedules, lecture timetables, and lab rotation notices.
            </p>
          </div>

          {/* Render TimetableBlock Component */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <TimetableBlock
              title=""
              description=""
              view="card"
              cardStyle="style-1"
              columns={3}
              showFields={{ title: true, file: true, branch: true, semester: true, download: true, year: true }}
            />
          </div>
        </div>
      </section>

      {/* 6. Alumni Spotlight Section */}
      <section id="alumni-section" className="py-16 sm:py-20 px-4 sm:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Wall of Fame
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                Distinguished Alumni Network
              </h3>
            </div>
            <p className="text-xs text-gray-500 max-w-md">
              Our graduates lead global technology firms, research institutions, healthcare organizations, and public enterprises worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Alumni Card 1 */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4 hover:border-amber-400 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-900 text-white flex items-center justify-center text-xl font-bold border-2 border-white shadow-md">
                  👨‍💼
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-gray-900">Rajesh V. Kulkarni</h4>
                  <p className="text-xs text-blue-600 font-semibold">VP of Engineering, Microsoft</p>
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
                    Batch of 2012
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 italic leading-relaxed">
                "The academic foundation and practical lab exposure at {tenant.name} gave me the confidence to build world-scale cloud products."
              </p>
            </div>

            {/* Alumni Card 2 */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4 hover:border-amber-400 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xl font-bold border-2 border-white shadow-md">
                  👩‍🔬
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-gray-900">Dr. Sunita Deshmukh</h4>
                  <p className="text-xs text-emerald-700 font-semibold">Senior Research Fellow, ISRO</p>
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
                    Batch of 2015
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 italic leading-relaxed">
                "Guidance from our professors instilled a deep passion for scientific inquiry and research excellence that guides my work today."
              </p>
            </div>

            {/* Alumni Card 3 */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4 hover:border-amber-400 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-rose-900 text-white flex items-center justify-center text-xl font-bold border-2 border-white shadow-md">
                  👨‍⚖️
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-gray-900">Amitabh Mukherjee</h4>
                  <p className="text-xs text-rose-700 font-semibold">Founder &amp; CEO, AgriTech India</p>
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
                    Batch of 2018
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 italic leading-relaxed">
                "The campus incubation center backed our startup idea and helped us scale to serve over 50,000 farmers across Maharashtra."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. College Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-8 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800 text-xs">
          
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400">{tenant.name}</h4>
            <p className="text-gray-400 leading-relaxed">{tenant.subtitle}</p>
            <p className="text-gray-400">NAAC Grade A++ Accredited University Campus</p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-gray-200">Quick Links</h5>
            <ul className="space-y-1.5 text-gray-400">
              <li><a href="#hero" className="hover:text-white">Academic Calendar</a></li>
              <li><a href="#timetables-section" className="hover:text-white">Timetables &amp; Downloads</a></li>
              <li><a href="#principal-message" className="hover:text-white">Principal's Message</a></li>
              <li><a href="#alumni-section" className="hover:text-white">Alumni Association</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-gray-200">Academics</h5>
            <ul className="space-y-1.5 text-gray-400">
              <li><span>School of Computer Science &amp; IT</span></li>
              <li><span>School of Home Science &amp; Nutrition</span></li>
              <li><span>School of Agriculture &amp; Agronomy</span></li>
              <li><span>School of Business Management</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-gray-200">Campus Contact</h5>
            <p className="text-gray-400">Central Administrative Block</p>
            <p className="text-gray-400">Helpline: 1800 123 4567</p>
            <p className="text-gray-400">Email: registrar@{tenant.id}.edu.in</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© 2026 {tenant.name}. Powered by College CMS SaaS Platform.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 font-bold text-amber-400" onClick={onToggleViewMode}>
              ⚙️ Admin Dashboard
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default CollegeStorefront;

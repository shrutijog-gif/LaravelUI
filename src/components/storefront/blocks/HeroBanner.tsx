import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { getActiveTenant } from '../../../data/tenantData';

export interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  tagline?: string;
  bgImageUrl?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  admissionTitle?: string;
  admissionStatus?: string;
  highlight1?: string;
  highlight2?: string;
  highlight3?: string;
  anchorId?: string;
  className?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title = "Empowering Generations Through Excellence & Innovation",
  subtitle = "Discover cutting-edge academic curricula, world-class laboratory infrastructure, renowned faculty mentorship, and a thriving campus ecosystem designed for visionary leaders of tomorrow.",
  tagline = "Premier Centre of Higher Learning & Research",
  bgImageUrl = "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop",
  primaryCtaText = "Explore Academic Programs",
  primaryCtaLink = "#admissions",
  secondaryCtaText = "View Timetables",
  secondaryCtaLink = "#timetables-section",
  admissionTitle = "Apply for Academic Year 2026-27",
  admissionStatus = "Open",
  highlight1 = "State-of-the-Art Research Laboratories & Digital Library",
  highlight2 = "100% Placement Assistance & Corporate Partnerships",
  highlight3 = "Scholarship Grants for Merit & Economically Weaker Students",
  anchorId = "hero",
  className = "",
}) => {
  const tenant = getActiveTenant();

  return (
    <section id={anchorId} className={`relative text-white overflow-hidden ${className}`}>
      {/* Background Image & Gradient Overlays */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImageUrl}')` }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0.78))',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Heading, Subtitle & Action Buttons */}
        <div className="lg:col-span-8 space-y-6">
          {tagline && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tagline}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-md">
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm sm:text-base text-gray-100 max-w-2xl leading-relaxed drop-shadow">
              {subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {primaryCtaText && (
              <a
                href={primaryCtaLink}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <span>{primaryCtaText}</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            )}

            {secondaryCtaText && (
              <a
                href={secondaryCtaLink}
                className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md border border-white/30 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                {secondaryCtaText}
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Admission Enquiry Highlight Card */}
        <div className="lg:col-span-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Admission Enquiries</span>
            {admissionStatus && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                {admissionStatus}
              </span>
            )}
          </div>

          <h3 className="text-xl font-black text-white leading-snug">
            {admissionTitle}
          </h3>

          <ul className="space-y-3 text-xs text-gray-200">
            {highlight1 && (
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{highlight1}</span>
              </li>
            )}
            {highlight2 && (
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{highlight2}</span>
              </li>
            )}
            {highlight3 && (
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{highlight3}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};

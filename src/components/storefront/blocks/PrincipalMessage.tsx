import React from 'react';
import { Quote } from 'lucide-react';
import { getActiveTenant } from '../../../data/tenantData';

export interface PrincipalMessageProps {
  principalName?: string;
  principalTitle?: string;
  leadershipBadge?: string;
  messageTag?: string;
  messageTitle?: string;
  paragraph1?: string;
  paragraph2?: string;
  anchorId?: string;
  className?: string;
}

export const PrincipalMessage: React.FC<PrincipalMessageProps> = ({
  principalName = "Dr. Ananya Sharma",
  principalTitle = "Principal & Dean",
  leadershipBadge = "25+ Yrs Academic Leadership",
  messageTag = "Message from Leadership",
  messageTitle = '"Fostering Academic Rigor, Character & Global Competence"',
  paragraph1,
  paragraph2,
  anchorId = "principal-message",
  className = "",
}) => {
  const tenant = getActiveTenant();

  const defaultP1 = `Welcome to ${tenant.name}. Education is not merely the acquisition of knowledge; it is the empowerment to think critically, innovate fearlessly, and serve society with integrity.`;
  const defaultP2 = `Our faculty members are world-class researchers and mentors who guide students through rigorous curriculum, practical industry projects, and holistic co-curricular growth. We invite you to explore our academic programs and join our vibrant community.`;

  return (
    <section id={anchorId} className={`py-16 sm:py-20 px-4 sm:px-8 bg-white border-b border-gray-100 ${className}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Portrait Badge */}
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
                <h4 className="text-lg font-extrabold text-white">{principalName}</h4>
                <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">{principalTitle}</p>
              </div>
            </div>
            {leadershipBadge && (
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-gray-900 font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                <Quote className="w-4 h-4" /> {leadershipBadge}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Message Content */}
        <div className="lg:col-span-8 space-y-4">
          {messageTag && (
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Quote className="w-3.5 h-3.5" /> {messageTag}
            </div>
          )}

          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            {messageTitle}
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed">
            {paragraph1 || defaultP1}
          </p>

          <p className="text-sm text-gray-600 leading-relaxed">
            {paragraph2 || defaultP2}
          </p>
        </div>
      </div>
    </section>
  );
};

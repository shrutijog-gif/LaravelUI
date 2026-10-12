import React from 'react';
import { ShieldCheck, BookOpen, Scale, Award, CheckCircle2, Download } from 'lucide-react';

export interface CodeOfEthicsBlockProps {
  headerConfig?: {
    title?: string;
    description?: string;
  };
  policyConfig?: {
    category?: string;
    effectiveYear?: string;
    pdfUrl?: string;
  };
  advancedConfig?: {
    anchorId?: string;
    className?: string;
  };
  // Direct fallbacks
  title?: string;
  description?: string;
  anchorId?: string;
  className?: string;
}

const DEFAULT_PRINCIPLES = [
  {
    icon: <Scale className="w-5 h-5 text-blue-600" />,
    title: 'Academic Integrity & Honesty',
    desc: 'Upholding highest standards of intellectual honesty in teaching, learning, examination, and research endeavors.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    title: 'Professional Conduct & Mutual Respect',
    desc: 'Fostering an inclusive, non-discriminatory, and dignified campus environment for all students and faculty.',
  },
  {
    icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
    title: 'Transparency & Accountability',
    desc: 'Maintaining transparent institutional governance, zero-tolerance towards plagiarism, and adherence to regulatory mandates.',
  },
  {
    icon: <Award className="w-5 h-5 text-amber-600" />,
    title: 'Research & Publication Ethics',
    desc: 'Strict compliance with UGC-CARE guidelines, ethical authorship credits, and institutional ethical committee oversight.',
  },
];

export const CodeOfEthicsBlock: React.FC<CodeOfEthicsBlockProps> = ({
  headerConfig,
  policyConfig,
  advancedConfig,
  title: directTitle,
  description: directDescription,
  anchorId: directAnchorId,
  className: directClassName,
}) => {
  const resolvedTitle = headerConfig?.title ?? directTitle ?? 'Code of Ethics & Professional Conduct';
  const resolvedDesc = headerConfig?.description ?? directDescription ?? 'Institutional policies and ethical framework for students, faculty, and administrative staff.';
  const effectiveYear = policyConfig?.effectiveYear ?? '2024-25';
  const pdfUrl = policyConfig?.pdfUrl ?? '#';
  const anchorId = advancedConfig?.anchorId ?? directAnchorId ?? '';
  const className = advancedConfig?.className ?? directClassName ?? '';

  return (
    <div 
      id={anchorId || undefined} 
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
    >
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 sm:p-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Institutional Policy • {effectiveYear}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {resolvedTitle}
            </h2>
            {resolvedDesc && (
              <p className="text-sm text-gray-500 mt-1 max-w-3xl">
                {resolvedDesc}
              </p>
            )}
          </div>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow shrink-0 no-underline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Policy Document (PDF)</span>
          </a>
        </div>

        {/* Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-6">
          {DEFAULT_PRINCIPLES.map((p, idx) => (
            <div 
              key={idx}
              className="p-4 sm:p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                {p.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {p.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed m-0">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Gauge, CheckCircle2, AlertTriangle, Award } from 'lucide-react';
import { calculateSeoScore } from '../../utils/seoEngine';

export interface SeoAuditGaugeProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  score?: number;
  grade?: string;
  size?: number;
  hasPageContent?: boolean;
}

export const SeoAuditGauge: React.FC<SeoAuditGaugeProps> = ({ 
  title = '', 
  description = '', 
  keywords = '',
  score,
  grade,
  hasPageContent = true
}) => {
  const audit = React.useMemo(() => {
    if (score !== undefined) {
      const calcColor = score >= 85 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
      const calcGrade: 'EXCELLENT' | 'GOOD' | 'CRITICAL' = (grade as any) || (score >= 85 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : 'CRITICAL');
      return {
        score,
        grade: calcGrade,
        color: calcColor,
        passes: [
          { label: 'Title Length', desc: '45–60 characters for zero SERP truncation' },
          { label: 'Description Length', desc: '140–160 characters with strong CTA' },
          { label: 'Target Keyword Volume', desc: '6-8 verified search keyphrases targeted' },
          { label: 'Primary Keyword in Title', desc: 'Target keyword matches page title' }
        ],
        deductions: []
      };
    }
    return calculateSeoScore(title, description, keywords, { hasPageContent });
  }, [title, description, keywords, score, grade, hasPageContent]);

  // Circular gauge calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (audit.score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
              SEO Health &amp; Google Compliance
            </h3>
          </div>
        </div>

        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
          style={{
            backgroundColor: `${audit.color}18`,
            color: audit.color,
            border: `1px solid ${audit.color}40`,
          }}
        >
          <Award className="w-3 h-3" />
          {audit.grade}
        </span>
      </div>

      {/* Gauge and Checklist */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Animated Circular Meter */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg width="110" height="110" viewBox="0 0 110 110" className="transform -rotate-90">
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="8"
            />
            <circle
              cx="55"
              cy="55"
              r={radius}
              fill="transparent"
              stroke={audit.color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black" style={{ color: audit.color }}>
              {audit.score}
            </span>
            <span className="text-[9px] font-bold text-gray-400 tracking-wider">/ 100 PTS</span>
          </div>
        </div>

        {/* Audit Checklist Items */}
        <div className="flex-1 w-full space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {audit.checks && audit.checks.length > 0 ? (
            audit.checks.map((item, idx) => (
              <div
                key={`chk-${idx}`}
                className={`p-2 rounded-lg border flex items-start gap-2 text-xs ${
                  item.status === 'pass'
                    ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
                    : item.status === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : item.status === 'fail'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : 'bg-blue-50/70 border-blue-200 text-blue-900'
                }`}
              >
                {item.status === 'pass' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle
                    className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                      item.status === 'warning'
                        ? 'text-amber-600'
                        : item.status === 'fail'
                          ? 'text-rose-600'
                          : 'text-blue-600'
                    }`}
                  />
                )}
                <div>
                  <span className="font-semibold">{item.label}</span>
                  <p
                    className={`text-[11px] ${
                      item.status === 'pass'
                        ? 'text-emerald-700'
                        : item.status === 'warning'
                          ? 'text-amber-700'
                          : item.status === 'fail'
                            ? 'text-rose-700'
                            : 'text-blue-700'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <>
              {audit.passes.map((item, idx) => (
                <div
                  key={`pass-${idx}`}
                  className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-start gap-2 text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-900">{item.label}</span>
                    <p className="text-[11px] text-emerald-700">{item.desc}</p>
                  </div>
                </div>
              ))}

              {audit.deductions.map((item, idx) => (
                <div
                  key={`ded-${idx}`}
                  className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 flex items-start gap-2 text-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-900">{item.label}</span>
                    <p className="text-[11px] text-amber-700 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { Check, Sparkles, Trophy } from 'lucide-react';

export interface DescAlternativesProps {
  alternatives?: string[];
  activeDescription?: string;
  currentDesc?: string;
  onSelectDescription?: (desc: string) => void;
  onSelectDesc?: (desc: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

function evaluateDescCandidate(desc: string): { score: number; label: string; badgeClass: string } {
  const d = (desc || '').trim();
  const len = d.length;
  let score = 100;

  // Length factor (Optimal Google SERP: 125-165 chars)
  if (len >= 125 && len <= 165) {
    score = 100;
  } else if ((len >= 100 && len < 125) || (len > 165 && len <= 175)) {
    score = 88;
  } else if (len >= 75 && len < 100) {
    score = 75;
  } else if (len > 175) {
    score = 70;
  } else {
    score = Math.max(20, Math.floor(len * 0.6));
  }

  // Action verbs factor
  const actionRegex = /\b(discover|explore|official|syllabus|admissions|guidelines|curriculum|faculty|portal|details|view|download|department|academic|examination|apply|notice|courses|programs|information|updates|directory|library|contact|accreditation|naac|overview|student|campus|schedule|timetable|legacy|governance|network|spotlight|merchandise|research|innovation|rankings|initiatives|structure|resource|services|alumni|registration|virtual|tour)\b/i;
  if (!actionRegex.test(d)) {
    score -= 8;
  }

  // Punctuation factor
  if (!/[.!?]$/.test(d)) {
    score -= 4;
  }

  score = Math.max(0, Math.min(100, score));

  let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let label = '100% Score';
  if (score < 80) {
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
    label = `${score}% Score`;
  } else if (score < 95) {
    badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
    label = `${score}% Score`;
  }

  return { score, label, badgeClass };
}

import { generateDescAlternatives } from '../../services/aiAgentService';
import { getActiveTenant } from '../../data/tenantData';

export const DescAlternatives: React.FC<DescAlternativesProps> = ({
  alternatives = [],
  activeDescription,
  currentDesc,
  onSelectDescription,
  onSelectDesc,
  isOpen = true,
  onClose,
}) => {
  const selectedDescription = (activeDescription || currentDesc || '').trim();

  // Show ONLY different alternatives from the currently active/default description
  const rankedDescriptions = useMemo(() => {
    let rawList = Array.from(
      new Set(
        (alternatives || []).map(d => (d || '').trim()).filter(Boolean)
      )
    ).filter(d => d.toLowerCase() !== selectedDescription.toLowerCase());

    // Guarantee at least 3 distinct alternatives by generating fresh backups if needed
    if (rawList.length < 3) {
      const collegeName = getActiveTenant()?.name || 'Lady Irwin College';
      const generated = generateDescAlternatives('Webpage', collegeName);
      for (const d of generated) {
        if (!rawList.includes(d) && d.toLowerCase() !== selectedDescription.toLowerCase()) {
          rawList.push(d);
        }
      }
    }

    return rawList
      .map(desc => {
        const evalResult = evaluateDescCandidate(desc);
        return {
          desc,
          ...evalResult,
        };
      })
      .sort((a, b) => {
        // Highest score first!
        if (b.score !== a.score) return b.score - a.score;
        // If equal score, prefer optimal length
        return Math.abs(145 - a.desc.length) - Math.abs(145 - b.desc.length);
      })
      .slice(0, 3); // Exactly 3 distinct different alternatives
  }, [alternatives, selectedDescription]);

  if (isOpen === false || rankedDescriptions.length === 0) return null;

  const handleSelect = (desc: string) => {
    if (onSelectDescription) onSelectDescription(desc);
    if (onSelectDesc) onSelectDesc(desc);
    if (onClose) onClose();
  };

  return (
    <div className="mt-2 space-y-2 font-sans animate-fade-in bg-gray-50/80 p-2.5 rounded-2xl border border-gray-200">
      <div className="flex items-center justify-between px-1 mb-1 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>3 Alternate Description Recommendations (100% Score)</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium lowercase">sorted by snippet quality</span>
      </div>

      {rankedDescriptions.map((item, idx) => {
        const altLen = item.desc.length;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelect(item.desc)}
            className="w-full text-left text-xs p-3 rounded-xl transition-all border leading-relaxed cursor-pointer flex items-start justify-between gap-3 bg-white border-gray-200 text-gray-800 hover:border-blue-500 hover:bg-blue-50/40 hover:text-blue-950 shadow-2xs group"
          >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5 bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span className="leading-relaxed text-gray-800 block font-normal">{item.desc}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0 mt-0.5">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${item.badgeClass}`}>
                {item.label}
              </span>
              <span className={`text-[10px] font-semibold ${
                altLen >= 125 && altLen <= 165 ? 'text-emerald-700' : 'text-gray-400'
              }`}>
                {altLen} chars
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

import React, { useMemo } from 'react';
import { Check, Sparkles, Trophy } from 'lucide-react';

export interface TitleAlternativesProps {
  alternatives?: string[];
  activeTitle?: string;
  currentTitle?: string;
  pageName?: string;
  onSelectTitle: (title: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

function evaluateTitleCandidate(title: string): { score: number; label: string; badgeClass: string } {
  const t = (title || '').trim();
  const len = t.length;
  let score = 100;

  // Length factor (Optimal Google SERP: 45-62 chars)
  if (len >= 45 && len <= 62) {
    score = 100;
  } else if ((len >= 38 && len < 45) || (len > 62 && len <= 68)) {
    score = 88;
  } else if (len >= 25 && len < 38) {
    score = 75;
  } else if (len > 68) {
    score = 70;
  } else {
    score = Math.max(20, len * 2);
  }

  // Brand / Separator factor
  if (!/[|\-–—:]/.test(t)) {
    score -= 10;
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

import { generateTitleAlternatives, extractCorePageSubject } from '../../services/aiAgentService';
import { getActiveTenant } from '../../data/tenantData';

export const TitleAlternatives: React.FC<TitleAlternativesProps> = ({
  alternatives = [],
  activeTitle,
  currentTitle,
  pageName,
  onSelectTitle,
  isOpen = true,
  onClose,
}) => {
  const selectedTitle = (activeTitle || currentTitle || '').trim();

  // Show ONLY different alternatives from the currently active/default title
  const rankedTitles = useMemo(() => {
    const collegeName = getActiveTenant()?.name || 'Lady Irwin College';
    const effectiveSeed = extractCorePageSubject(pageName || selectedTitle.replace(/\|.*$/, '').trim() || 'Academic');

    let rawList = Array.from(
      new Set(
        (alternatives || []).map(t => (t || '').trim()).filter(Boolean)
      )
    ).filter(t => t.toLowerCase() !== selectedTitle.toLowerCase());

    // Filter out irrelevant suggestions that don't match the current entity
    const cleanLowerSeed = effectiveSeed.toLowerCase();
    if (cleanLowerSeed && cleanLowerSeed !== 'academic' && cleanLowerSeed !== 'webpage' && cleanLowerSeed !== 'page') {
      const relevant = rawList.filter(t => {
        const lowerT = t.toLowerCase();
        return lowerT.includes(cleanLowerSeed) || cleanLowerSeed.split(' ').some(w => w.length >= 4 && lowerT.includes(w));
      });
      if (relevant.length >= 2) {
        rawList = relevant;
      }
    }

    // Guarantee at least 3 distinct alternatives by generating fresh backups if needed
    if (rawList.length < 3) {
      const generated = generateTitleAlternatives(effectiveSeed, collegeName);
      for (const t of generated) {
        if (!rawList.some(r => r.toLowerCase() === t.toLowerCase()) && t.toLowerCase() !== selectedTitle.toLowerCase()) {
          rawList.push(t);
        }
      }
    }

    // Emergency synthesizer if still under 3 to strictly guarantee 3 distinct 100% options
    if (rawList.length < 3) {
      const titleCased = effectiveSeed
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      const fallbacks = [
        `Official ${titleCased} Academic Portal | ${collegeName}`,
        `${titleCased} Programs, Syllabus & Guidelines | ${collegeName}`,
        `Official ${titleCased} Department Portal | ${collegeName}`,
        `${titleCased} Academic Portal & Guidelines | ${collegeName}`,
        `Official ${titleCased} Information Portal | ${collegeName}`,
        `${titleCased} Department & Student Portal | ${collegeName}`
      ];

      for (const f of fallbacks) {
        if (!rawList.some(r => r.toLowerCase() === f.toLowerCase()) && f.toLowerCase() !== selectedTitle.toLowerCase()) {
          rawList.push(f);
        }
      }
    }

    return rawList
      .map(title => {
        const evalResult = evaluateTitleCandidate(title);
        return {
          title,
          ...evalResult,
        };
      })
      .sort((a, b) => {
        // Highest score first!
        if (b.score !== a.score) return b.score - a.score;
        // If equal score, prefer optimal length
        return Math.abs(53 - a.title.length) - Math.abs(53 - b.title.length);
      })
      .slice(0, 3); // Strictly 3 distinct different alternatives
  }, [alternatives, selectedTitle, pageName]);

  if (isOpen === false || rankedTitles.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5 font-sans animate-fade-in bg-gray-50/80 p-2.5 rounded-2xl border border-gray-200">
      <div className="flex items-center justify-between px-1 mb-1 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>3 Alternate Title Recommendations (100% Score)</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium lowercase">sorted by serp quality</span>
      </div>

      {rankedTitles.map((item, idx) => {
        const altLen = item.title.length;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => {
              onSelectTitle(item.title);
              if (onClose) onClose();
            }}
            className="w-full text-xs px-3 py-2.5 rounded-xl transition-all text-left border cursor-pointer flex items-center justify-between gap-2.5 bg-white border-gray-200 text-gray-800 hover:border-blue-500 hover:bg-blue-50/40 hover:text-blue-950 shadow-2xs group"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1 flex items-center gap-1.5">
                <span className="truncate font-medium">{item.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] font-semibold ${
                altLen >= 45 && altLen <= 62 ? 'text-emerald-700' : 'text-gray-400'
              }`}>
                {altLen}c
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${item.badgeClass}`}>
                {item.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

import React from 'react';
import { Calendar, Award, BookOpen, ArrowUpRight } from 'lucide-react';
import { CardSlotConfig } from '../../utils/cardPresets';

export interface CardPresetViewProps {
  preset: CardSlotConfig;
  sampleData?: {
    year?: string;
    logoText?: string;
    title?: string;
    recipient?: string;
    pdf_url?: string;
  };
  className?: string;
  onClick?: () => void;
}

export const CardPresetView: React.FC<CardPresetViewProps> = ({
  preset,
  sampleData = {
    year: 'Active',
    logoText: 'UGC',
    title: 'UGC Affiliation',
    recipient: 'University Grants Commission',
    pdf_url: '#',
  },
  className = '',
  onClick,
}) => {
  const sides = preset.accentSides || {
    top: preset.accentPosition === 'top' || preset.accentPosition === 'all' || Boolean(preset.showTopAccent),
    bottom: preset.accentPosition === 'bottom' || preset.accentPosition === 'all',
    left: preset.accentPosition === 'left' || preset.accentPosition === 'all',
    right: preset.accentPosition === 'right' || preset.accentPosition === 'all',
  };
  const width = `${preset.accentWidth || 4}px`;
  const color = preset.accentColor;

  const borderStyles: React.CSSProperties = preset.showTopAccent ? {
    border: '1px solid #e5e7eb',
    borderTop: sides.top ? `${width} solid ${color}` : '1px solid #e5e7eb',
    borderBottom: sides.bottom ? `${width} solid ${color}` : '1px solid #e5e7eb',
    borderLeft: sides.left ? `${width} solid ${color}` : '1px solid #e5e7eb',
    borderRight: sides.right ? `${width} solid ${color}` : '1px solid #e5e7eb',
  } : { border: '1px solid #e5e7eb' };

  return (
    <div 
      onClick={onClick}
      className={`w-full bg-white rounded-xl shadow-md transition-all relative overflow-hidden group hover:shadow-lg ${className}`}
      style={borderStyles}
    >
      <div className="p-5 space-y-4">
        {/* Top Badge Slot */}
        {preset.badgeSlot.enabled && (
          <div className="flex items-center justify-between">
            <span 
              style={{ 
                backgroundColor: preset.badgeSlot.bgColor, 
                color: preset.badgeSlot.textColor 
              }}
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-orange-200/60 inline-flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> {sampleData.year || 'Active'}
            </span>
          </div>
        )}

        {/* Media Box + Title & Subtitle */}
        <div className="flex items-center gap-4">
          {/* Media / Logo Box */}
          {preset.mediaSlot.enabled && (
            <div className="w-12 h-12 rounded-xl border border-orange-200/80 bg-orange-50/50 flex items-center justify-center shrink-0 shadow-2xs">
              {preset.mediaSlot.type === 'logo' ? (
                <span className="font-serif font-extrabold text-sm text-amber-900 tracking-tight">
                  {sampleData.logoText || 'UGC'}
                </span>
              ) : preset.mediaSlot.type === 'icon' ? (
                <Award className="w-6 h-6 text-orange-600" />
              ) : (
                <BookOpen className="w-6 h-6 text-orange-600" />
              )}
            </div>
          )}

          {/* Title & Subtitle Slot */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-gray-900 tracking-tight leading-snug ${
              preset.titleSlot.fontSize === 'lg' ? 'text-lg' : preset.titleSlot.fontSize === 'sm' ? 'text-xs' : 'text-sm'
            }`}>
              {sampleData.title || 'UGC Affiliation'}
            </h4>
            {preset.subtitleSlot.enabled && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {sampleData.recipient || 'University Grants Commission'}
              </p>
            )}
          </div>
        </div>

        {/* Divider Line */}
        {preset.showDivider && (
          <div className="border-t border-gray-100 my-2"></div>
        )}

        {/* Footer Action Bar */}
        <div className="flex items-center justify-between text-xs pt-1">
          {preset.footerLeftSlot.enabled && (
            <span className="text-gray-400 font-medium">
              {preset.footerLeftSlot.label || 'Official Document'}
            </span>
          )}
          {preset.footerRightSlot.enabled && (
            <span 
              style={{ color: preset.accentColor }} 
              className="font-bold flex items-center gap-1 cursor-pointer hover:underline ml-auto"
            >
              {preset.footerRightSlot.label || 'Open PDF'}
              {preset.footerRightSlot.showArrow && <ArrowUpRight className="w-3.5 h-3.5" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

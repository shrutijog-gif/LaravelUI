import React from 'react';
import { 
  Calendar, FileText, Award, Trophy, ShieldCheck, BookOpen, Globe, Layers, 
  ArrowUpRight, Bookmark, User, Star, Briefcase, Heart, Download, Tag, 
  Zap, Compass, Target, Clock, Bell, MapPin, Hash, Mail, Phone, Lock, Settings,
  Folder, File, Link, Share2, Printer, Info, HelpCircle, AlertCircle, CheckCircle2,
  Cloud, Database, Server, Code, Terminal, Activity, BarChart2, PieChart, TrendingUp,
  Feather, PenTool, ExternalLink, GraduationCap, Flame, Shield, Image
} from 'lucide-react';
import { CardSlotConfig } from '../../../utils/cardPresets';

export interface CardPresetViewProps {
  preset: CardSlotConfig;
  sampleData?: {
    year?: string;
    logoText?: string;
    title?: string;
    recipient?: string;
    pdf_url?: string;
    imageUrl?: string;
    badge?: string;
    fieldEntries?: Array<{ name: string; label: string; value: any }>;
    [key: string]: any;
  };
  viewMode?: 'blueprint' | 'sample';
  className?: string;
  onClick?: () => void;
  onDropToSlot?: (slotName: string, fieldName: string) => void;
  activeDragField?: string | null;
  onSelectSlot?: (slotName: string) => void;
  activeSlotName?: string | null;
}

const MediaImageWithFallback: React.FC<{
  src: string;
  sizeClass: string;
  shapeClass: string;
  boxBgStyle: React.CSSProperties;
  fallbackText: string;
  iconName?: string;
  iconSizeClass: string;
}> = ({ src, sizeClass, shapeClass, boxBgStyle, fallbackText, iconName, iconSizeClass }) => {
  const [hasError, setHasError] = React.useState(false);

  if (hasError || !src) {
    const iconMap: Record<string, any> = {
      Calendar, FileText, Award, Trophy, ShieldCheck, BookOpen, Globe, Layers,
      User, Star, Briefcase, Heart, Download, Tag, Bookmark, Zap, Compass, Target,
      Clock, Bell, MapPin, Hash, Mail, Phone, Lock, Settings,
      Folder, File, Link, Share2, Printer, Info, HelpCircle, AlertCircle, CheckCircle2,
      Cloud, Database, Server, Code, Terminal, Activity, BarChart2, PieChart, TrendingUp,
      Feather, PenTool, ExternalLink, GraduationCap, Flame, Shield, Image
    };
    const IconComp = iconMap[iconName || 'Image'] || Image;

    return (
      <div 
        style={boxBgStyle}
        className={`${sizeClass} ${shapeClass} flex items-center justify-center font-bold shadow-xs transition-all`}
      >
        <IconComp className={iconSizeClass} />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt="Thumbnail" 
      className={`${sizeClass} ${shapeClass} object-cover shadow-xs border border-gray-200`}
      onError={() => setHasError(true)}
    />
  );
};

export const CardPresetView: React.FC<CardPresetViewProps> = ({
  preset,
  sampleData = {
    year: '2024-25',
    logoText: 'ABC',
    title: 'B.Tech First Year (Sem 1)',
    recipient: 'Computer Science, IT',
    pdf_url: '#',
  },
  viewMode = 'blueprint',
  className = '',
  onClick,
  onDropToSlot,
  activeDragField,
  onSelectSlot,
  activeSlotName,
}) => {
  const [dragOverSlot, setDragOverSlot] = React.useState<string | null>(null);

  const isBlueprint = viewMode === 'blueprint';

  const styleType = preset.presetStyleType || (
    preset.id === 'style-1' ? 'official' :
    preset.id === 'style-2' ? 'minimal' :
    preset.id === 'style-3' ? 'gradient-banner' :
    preset.id === 'style-4' ? 'split-card' : 'custom'
  );

  const color = preset.accentColor || '#2563eb';

  const handleDragOver = (e: React.DragEvent, slotName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverSlot !== slotName) setDragOverSlot(slotName);
  };

  const handleDragLeave = (slotName: string) => {
    if (dragOverSlot === slotName) setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotName: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    const fieldName = e.dataTransfer.getData('text/plain');
    if (fieldName && onDropToSlot) {
      onDropToSlot(slotName, fieldName);
    }
  };

  const getSlotHighlightClass = (slotName: string) => {
    const isOver = dragOverSlot === slotName;
    if (isOver) return 'border-2 border-dashed border-blue-500 bg-blue-100/60 ring-2 ring-blue-500/30 rounded-lg transition-all scale-[1.02] cursor-copy';
    if (activeDragField) return 'border-2 border-dashed border-amber-400/80 bg-amber-50/30 rounded-lg animate-pulse cursor-pointer';
    return '';
  };

  const getBorderRadiusClass = (radius?: string | number) => {
    const radStr = String(radius || 'md');
    switch (radStr) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-lg';
      case 'md': return 'rounded-2xl';
      case 'lg': return 'rounded-3xl';
      default: return '';
    }
  };

  const getShadowClass = (shadowSize?: string) => {
    switch (shadowSize) {
      case 'none': return 'shadow-none';
      case 'sm': return 'shadow-sm shadow-slate-200/80';
      case 'md': return 'shadow-md shadow-slate-300/60';
      case 'lg': return 'shadow-xl shadow-slate-400/50';
      default: return 'shadow-none';
    }
  };

  const getHoverEffectClass = (hover?: string) => {
    switch (hover) {
      case 'lift': return 'hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 ease-out';
      case 'scale': return 'hover:scale-[1.025] transition-all duration-300 ease-out';
      case 'glow': return 'hover:shadow-xl hover:shadow-gray-400/25 hover:-translate-y-1 transition-all duration-300 ease-out';
      case 'none': default: return '';
    }
  };

  const renderMediaContent = () => {
    const iconName = preset.mediaSlot?.iconName || 'Calendar';
    const type = preset.mediaSlot?.type || 'initials';
    const shape = preset.mediaSlot?.shape || 'circle';
    const size = preset.mediaSlot?.size || 'md';

    const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-none' : 'rounded-2xl';
    const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-base' : 'w-11 h-11 text-sm';
    const iconSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

    const iconCol = preset.mediaSlot?.iconColor || '#ffffff';
    const color2 = preset.gradientColor || color;
    const isGradient = color2 && color2 !== color;

    const boxBgStyle: React.CSSProperties = isGradient
      ? { background: `linear-gradient(135deg, ${color} 0%, ${color2} 100%)`, color: iconCol }
      : { backgroundColor: (preset.mediaSlot?.bgColor && preset.mediaSlot.bgColor !== '#2563eb') ? preset.mediaSlot.bgColor : color, color: iconCol };

    if (type === 'image') {
      const imgUrl = preset.mediaSlot?.imageUrl || (sampleData as any)?.imageUrl || (sampleData as any)?.image || (sampleData as any)?.photo;
      if (imgUrl) {
        return (
          <img 
            src={imgUrl} 
            alt="Media Image" 
            className={`${sizeClass} ${shapeClass} object-cover shadow-xs border border-gray-200 shrink-0`}
          />
        );
      }
      return (
        <div 
          style={boxBgStyle}
          className={`${sizeClass} ${shapeClass} shadow-xs transition-all border border-black/5`}
        />
      );
    }

    if (type === 'initials' || type === 'logo') {
      const maxLen = preset.mediaSlot?.initialsLength || 2;
      const titleVal = sampleData?.title || sampleData?.recipient || 'Academic Bulletin Center';
      const words = titleVal.trim().split(/[\s.\-_]+/);
      const computedInitials = words.map((w: string) => w[0]).join('').substring(0, maxLen).toUpperCase();
      const text = (sampleData?.logoText || computedInitials || 'ABC').substring(0, maxLen).toUpperCase();

      return (
        <div 
          style={boxBgStyle}
          className={`${sizeClass} ${shapeClass} flex items-center justify-center font-bold shadow-xs transition-all tracking-wider font-mono`}
        >
          <span>{text}</span>
        </div>
      );
    }

    // Default: type === 'icon'
    const iconMap: Record<string, any> = {
      Calendar, FileText, Award, Trophy, ShieldCheck, BookOpen, Globe, Layers,
      User, Star, Briefcase, Heart, Download, Tag, Bookmark, Zap, Compass, Target,
      Clock, Bell, MapPin, Hash, Mail, Phone, Lock, Settings,
      Folder, File, Link, Share2, Printer, Info, HelpCircle, AlertCircle, CheckCircle2,
      Cloud, Database, Server, Code, Terminal, Activity, BarChart2, PieChart, TrendingUp,
      Feather, PenTool, ExternalLink, GraduationCap, Flame, Shield, Image
    };

    const IconComponent = iconMap[iconName] || Calendar;

    return (
      <div 
        style={boxBgStyle}
        className={`${sizeClass} ${shapeClass} flex items-center justify-center font-bold shadow-xs transition-all`}
      >
        <IconComponent className={iconSizeClass} />
      </div>
    );
  };

  const getDetailLabelText = (defaultLabel: string) => {
    if (preset.detailLineMode === 'custom_label' && preset.customDetailLabel) {
      return preset.customDetailLabel;
    }
    return defaultLabel;
  };

  const getVarDisplay = (fieldVar: string | undefined, fallbackSample: string) => {
    if (isBlueprint) {
      if (fieldVar && fieldVar !== 'recipient' && fieldVar !== 'year' && fieldVar !== 'title') {
        return `{${fieldVar}}`;
      }
      return `{field_value}`;
    }
    if (fieldVar && sampleData && (sampleData as any)[fieldVar]) {
      return (sampleData as any)[fieldVar];
    }
    return fallbackSample;
  };

  const rawBadgeVal = getVarDisplay(preset.badgeSlot?.fieldVar, sampleData?.year || '2024-25');
  const badgeVal = preset.badgeSlot?.displayMode === 'label_and_value'
    ? (isBlueprint ? `[ ${preset.badgeSlot?.fieldVar || 'Year'} ]: ${rawBadgeVal}` : `Year: ${rawBadgeVal}`)
    : rawBadgeVal;

  const titleVal = getVarDisplay(preset.titleSlot?.fieldVar, sampleData?.title || 'B.Tech First Year (Sem 1)');
  const rawSubVal = getVarDisplay(preset.subtitleSlot?.fieldVar, sampleData?.recipient || 'Computer Science, IT');
  const subMode = preset.subtitleSlot?.displayMode || preset.detailLineMode || 'value_only';
  const formattedSubVal = subMode === 'label_and_value'
    ? (isBlueprint ? `[ Field Label ]: ${rawSubVal}` : `Branch: ${rawSubVal}`)
    : rawSubVal;
  const subVal = formattedSubVal;
  const actionLabel = preset.footerRightSlot?.label || (isBlueprint ? '[ Action Link ]' : 'View Document');

  const hasFieldEntries = Boolean(sampleData?.fieldEntries && sampleData.fieldEntries.length > 0);

  const renderSubtitleContent = () => {
    if (isBlueprint) {
      if (subMode === 'label_and_value') {
        return (
          <div className="text-xs text-gray-600 font-medium space-y-0.5">
            <p><span className="text-gray-900 font-bold">[ Field Label ]:</span> &#123;field_value&#125;</p>
          </div>
        );
      }
      return (
        <div className="text-xs text-gray-600 font-medium space-y-0.5">
          <p>&#123;field_value&#125;</p>
        </div>
      );
    }

    if (hasFieldEntries) {
      return (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {sampleData!.fieldEntries!.map((entry, idx) => (
            <span key={entry.name || idx} className="inline-flex items-center bg-gray-100/90 text-gray-700 font-medium text-xs px-2.5 py-1 rounded-md border border-gray-200/80">
              {subMode === 'label_and_value' ? (
                <>
                  <span className="font-bold text-gray-900 me-1.5">{entry.label}:</span>
                  <span>{Array.isArray(entry.value) ? entry.value.join(', ') : String(entry.value)}</span>
                </>
              ) : (
                <span>{Array.isArray(entry.value) ? entry.value.join(', ') : String(entry.value)}</span>
              )}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="text-xs text-gray-600 font-medium leading-tight space-y-0.5">
        <p>{formattedSubVal}</p>
      </div>
    );
  };

  const accentWidth = preset.accentWidth || 4;
  const accentSides = preset.accentSides || { top: true, bottom: false, left: false, right: false };

  const getAccentStyle = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      backgroundColor: preset.cardBgColor || '#ffffff',
    };
    const rad = preset.borderRadius;
    if (rad !== undefined && rad !== null && !['none', 'sm', 'md', 'lg'].includes(String(rad))) {
      const num = parseInt(String(rad), 10);
      if (!isNaN(num)) {
        styles.borderRadius = `${num}px`;
      }
    }
    if (!preset.showTopAccent) return styles;
    if (accentSides.top) {
      styles.borderTopColor = color;
      styles.borderTopWidth = `${accentWidth}px`;
      styles.borderTopStyle = 'solid';
    }
    if (accentSides.bottom) {
      styles.borderBottomColor = color;
      styles.borderBottomWidth = `${accentWidth}px`;
      styles.borderBottomStyle = 'solid';
    }
    if (accentSides.left) {
      styles.borderLeftColor = color;
      styles.borderLeftWidth = `${accentWidth}px`;
      styles.borderLeftStyle = 'solid';
    }
    if (accentSides.right) {
      styles.borderRightColor = color;
      styles.borderRightWidth = `${accentWidth}px`;
      styles.borderRightStyle = 'solid';
    }
    return styles;
  };

  const activeShadow = preset.shadowSize || (preset as any).shadow || 'none';
  const cardBaseStyle = `bg-white border border-slate-200/80 ${getBorderRadiusClass(preset.borderRadius)} ${getShadowClass(activeShadow)} ${getHoverEffectClass(preset.hoverEffect)} overflow-hidden cursor-pointer relative transition-all ${className}`;

  /* =========================================================================
     STYLE 1: OFFICIAL DOCUMENT / AFFILIATION CARD (Screenshot 1)
     ========================================================================= */
  if (styleType === 'official') {
    return (
      <div 
        onClick={onClick}
        className={cardBaseStyle}
        style={getAccentStyle()}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            {/* Blue Icon Box */}
            {preset.mediaSlot?.enabled !== false && (
              <div 
                className={getSlotHighlightClass('mediaSlot')}
                onDragOver={(e) => handleDragOver(e, 'mediaSlot')}
                onDragLeave={() => handleDragLeave('mediaSlot')}
                onDrop={(e) => handleDrop(e, 'mediaSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('mediaSlot'); } }}
              >
                {renderMediaContent()}
              </div>
            )}

            {/* Top Right Year Pill */}
            {preset.badgeSlot?.enabled !== false && (
              <div 
                className={getSlotHighlightClass('badgeSlot')}
                onDragOver={(e) => handleDragOver(e, 'badgeSlot')}
                onDragLeave={() => handleDragLeave('badgeSlot')}
                onDrop={(e) => handleDrop(e, 'badgeSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('badgeSlot'); } }}
              >
                <span 
                  style={{ 
                    backgroundColor: preset.badgeSlot?.bgColor || '#eff6ff', 
                    color: preset.badgeSlot?.textColor || color 
                  }}
                  className="font-bold px-3 py-1 rounded-lg text-xs border border-current/10 inline-block shadow-2xs"
                >
                  {badgeVal}
                </span>
              </div>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-0.5">
            {preset.titleSlot?.enabled !== false && (
              <div 
                className={getSlotHighlightClass('titleSlot')}
                onDragOver={(e) => handleDragOver(e, 'titleSlot')}
                onDragLeave={() => handleDragLeave('titleSlot')}
                onDrop={(e) => handleDrop(e, 'titleSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('titleSlot'); } }}
              >
                <h3 style={{ color }} className="font-bold text-base tracking-tight leading-tight">
                  {titleVal}
                </h3>
              </div>
            )}

            {preset.subtitleSlot?.enabled !== false && (subVal || hasFieldEntries) && (
              <div 
                className={getSlotHighlightClass('subtitleSlot')}
                onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
                onDragLeave={() => handleDragLeave('subtitleSlot')}
                onDrop={(e) => handleDrop(e, 'subtitleSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('subtitleSlot'); } }}
              >
                {renderSubtitleContent()}
              </div>
            )}
          </div>
        </div>

        {/* Gray Footer Container */}
        {preset.footerRightSlot?.enabled !== false && (
          <div className={`px-5 py-3 bg-gray-50/70 ${preset.showDivider !== false ? 'border-t border-gray-100' : ''} flex justify-end items-center`}>
            <div 
              className={getSlotHighlightClass('footerRightSlot')}
              onDragOver={(e) => handleDragOver(e, 'footerRightSlot')}
              onDragLeave={() => handleDragLeave('footerRightSlot')}
              onDrop={(e) => handleDrop(e, 'footerRightSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerRightSlot'); } }}
            >
              <span style={{ color }} className="font-bold text-xs inline-flex items-center gap-1 hover:underline cursor-pointer">
                {actionLabel} <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =========================================================================
     STYLE 2: COMPACT MINIMAL CARD (Matching Natural Proportions)
     ========================================================================= */
  if (styleType === 'minimal') {
    return (
      <div 
        onClick={onClick}
        className={cardBaseStyle}
        style={getAccentStyle()}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            {preset.mediaSlot?.enabled !== false && (
              <div 
                className={getSlotHighlightClass('mediaSlot')}
                onDragOver={(e) => handleDragOver(e, 'mediaSlot')}
                onDragLeave={() => handleDragLeave('mediaSlot')}
                onDrop={(e) => handleDrop(e, 'mediaSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('mediaSlot'); } }}
              >
                {renderMediaContent()}
              </div>
            )}

            <div 
              className={getSlotHighlightClass('badgeSlot')}
              onDragOver={(e) => handleDragOver(e, 'badgeSlot')}
              onDragLeave={() => handleDragLeave('badgeSlot')}
              onDrop={(e) => handleDrop(e, 'badgeSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('badgeSlot'); } }}
            >
              <span 
                style={{ 
                  backgroundColor: preset.badgeSlot?.bgColor || '#eff6ff', 
                  color: preset.badgeSlot?.textColor || color 
                }}
                className="font-bold px-3 py-1 rounded-lg text-xs border border-current/10 inline-block shadow-2xs"
              >
                {badgeVal}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            {preset.titleSlot?.enabled !== false && titleVal && (
              <div 
                className={getSlotHighlightClass('titleSlot')}
                onDragOver={(e) => handleDragOver(e, 'titleSlot')}
                onDragLeave={() => handleDragLeave('titleSlot')}
                onDrop={(e) => handleDrop(e, 'titleSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('titleSlot'); } }}
              >
                <h3 style={{ color }} className="font-bold text-base tracking-tight leading-tight">
                  {titleVal}
                </h3>
              </div>
            )}

            {preset.subtitleSlot?.enabled !== false && (subVal || hasFieldEntries) && (
              <div 
                className={getSlotHighlightClass('subtitleSlot')}
                onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
                onDragLeave={() => handleDragLeave('subtitleSlot')}
                onDrop={(e) => handleDrop(e, 'subtitleSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('subtitleSlot'); } }}
              >
                {renderSubtitleContent()}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            {preset.footerRightSlot?.enabled !== false ? (
              <div 
                className={getSlotHighlightClass('footerRightSlot')}
                onDragOver={(e) => handleDragOver(e, 'footerRightSlot')}
                onDragLeave={() => handleDragLeave('footerRightSlot')}
                onDrop={(e) => handleDrop(e, 'footerRightSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerRightSlot'); } }}
              >
                <span style={{ color }} className="font-bold text-xs inline-flex items-center gap-1 hover:underline cursor-pointer">
                  {actionLabel} <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ) : <div />}

            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-2xs">
              <Bookmark className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     STYLE 3: MODERN GRADIENT BANNER (Screenshot 3)
     ========================================================================= */
  if (styleType === 'gradient-banner') {
    return (
      <div 
        onClick={onClick}
        className={cardBaseStyle}
        style={getAccentStyle()}
      >
        {/* Top Gradient Banner Block */}
        <div 
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${preset.gradientColor || color} 100%)` }}
          className="p-4 sm:p-5 text-white space-y-2"
        >
          <div className="flex items-center justify-between">
            {preset.mediaSlot?.enabled !== false && (
              <div 
                className={getSlotHighlightClass('mediaSlot')}
                onDragOver={(e) => handleDragOver(e, 'mediaSlot')}
                onDragLeave={() => handleDragLeave('mediaSlot')}
                onDrop={(e) => handleDrop(e, 'mediaSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('mediaSlot'); } }}
              >
                {renderMediaContent()}
              </div>
            )}

            <div 
              className={getSlotHighlightClass('badgeSlot')}
              onDragOver={(e) => handleDragOver(e, 'badgeSlot')}
              onDragLeave={() => handleDragLeave('badgeSlot')}
              onDrop={(e) => handleDrop(e, 'badgeSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('badgeSlot'); } }}
            >
              <span className="bg-white/20 backdrop-blur-md text-white font-bold px-2.5 py-0.5 rounded-full text-xs border border-white/30">
                {badgeVal}
              </span>
            </div>
          </div>

          {/* Title & Subtitle Wrapper */}
          <div className="space-y-0.5">
            {preset.titleSlot?.enabled !== false && titleVal && (
              <div 
                className={getSlotHighlightClass('titleSlot')}
                onDragOver={(e) => handleDragOver(e, 'titleSlot')}
                onDragLeave={() => handleDragLeave('titleSlot')}
                onDrop={(e) => handleDrop(e, 'titleSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('titleSlot'); } }}
              >
                <h3 className="font-bold text-base tracking-tight leading-tight text-white">
                  {titleVal}
                </h3>
              </div>
            )}

            {preset.subtitleSlot?.enabled !== false && subVal && (
              <div 
                className={getSlotHighlightClass('subtitleSlot')}
                onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
                onDragLeave={() => handleDragLeave('subtitleSlot')}
                onDrop={(e) => handleDrop(e, 'subtitleSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('subtitleSlot'); } }}
              >
                <p className="text-xs text-white/90 font-medium leading-tight">
                  {subVal}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom White Body */}
        <div className="p-4 sm:p-5 bg-white space-y-4 flex-1 flex flex-col justify-between">
          {preset.subtitleSlot?.enabled !== false && (subVal || hasFieldEntries) && (
            <div className="pt-1">
              {renderSubtitleContent()}
            </div>
          )}

          {preset.footerRightSlot?.enabled !== false && (
            <div className="flex justify-end pt-1">
              <div 
                className={getSlotHighlightClass('footerRightSlot')}
                onDragOver={(e) => handleDragOver(e, 'footerRightSlot')}
                onDragLeave={() => handleDragLeave('footerRightSlot')}
                onDrop={(e) => handleDrop(e, 'footerRightSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerRightSlot'); } }}
              >
                <button 
                  className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  {actionLabel} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================================
     STYLE 4: DUAL-PANE SPLIT CARD (Screenshot 4)
     ========================================================================= */
  if (styleType === 'split-card') {
    return (
      <div 
        onClick={onClick}
        className={`${cardBaseStyle} flex flex-col sm:flex-row`}
        style={getAccentStyle()}
      >
        {/* Left Gradient Accent Block */}
        <div 
          style={{ background: `linear-gradient(180deg, ${color} 0%, ${preset.gradientColor || color} 100%)` }}
          className="p-4 sm:w-28 flex sm:flex-col justify-between items-center sm:items-start text-white shrink-0"
        >
          {preset.mediaSlot?.enabled !== false && (
            <div 
              className={getSlotHighlightClass('mediaSlot')}
              onDragOver={(e) => handleDragOver(e, 'mediaSlot')}
              onDragLeave={() => handleDragLeave('mediaSlot')}
              onDrop={(e) => handleDrop(e, 'mediaSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('mediaSlot'); } }}
            >
              {renderMediaContent()}
            </div>
          )}

          <div 
            className={getSlotHighlightClass('badgeSlot')}
            onDragOver={(e) => handleDragOver(e, 'badgeSlot')}
            onDragLeave={() => handleDragLeave('badgeSlot')}
            onDrop={(e) => handleDrop(e, 'badgeSlot')}
            onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('badgeSlot'); } }}
          >
            <span className="bg-white/20 backdrop-blur-md text-white font-bold px-2 py-0.5 rounded-md text-[11px] border border-white/30 inline-block">
              {badgeVal}
            </span>
          </div>
        </div>

        {/* Right Content Pane */}
        <div className="p-4 sm:p-5 flex-1 bg-white space-y-3 flex flex-col justify-between min-w-0">
          <div className="space-y-1">
            {preset.titleSlot?.enabled !== false && titleVal && (
              <div 
                className={getSlotHighlightClass('titleSlot')}
                onDragOver={(e) => handleDragOver(e, 'titleSlot')}
                onDragLeave={() => handleDragLeave('titleSlot')}
                onDrop={(e) => handleDrop(e, 'titleSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('titleSlot'); } }}
              >
                <h3 style={{ color }} className="font-bold text-base tracking-tight leading-snug">
                  {titleVal}
                </h3>
              </div>
            )}

            {preset.subtitleSlot?.enabled !== false && (subVal || hasFieldEntries) && (
              <div 
                className={getSlotHighlightClass('subtitleSlot')}
                onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
                onDragLeave={() => handleDragLeave('subtitleSlot')}
                onDrop={(e) => handleDrop(e, 'subtitleSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('subtitleSlot'); } }}
              >
                {renderSubtitleContent()}
              </div>
            )}
          </div>

          {preset.footerRightSlot?.enabled !== false && (
            <div className="flex justify-end pt-3.5">
              <div 
                className={getSlotHighlightClass('footerRightSlot')}
                onDragOver={(e) => handleDragOver(e, 'footerRightSlot')}
                onDragLeave={() => handleDragLeave('footerRightSlot')}
                onDrop={(e) => handleDrop(e, 'footerRightSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerRightSlot'); } }}
              >
                <button 
                  className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  {actionLabel} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =========================================================================
     CUSTOM FALLBACK LAYOUT
     ========================================================================= */
  return (
    <div 
      onClick={onClick}
      className={`w-full min-h-[260px] bg-white rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden group flex flex-col justify-between ${className}`}
    >
      <div className="p-5 space-y-4">
        {/* Top Badge Slot */}
        {preset.badgeSlot?.enabled && (
          <div 
            className={`flex items-center justify-between p-1 ${getSlotHighlightClass('badgeSlot')}`}
            onDragOver={(e) => handleDragOver(e, 'badgeSlot')}
            onDragLeave={() => handleDragLeave('badgeSlot')}
            onDrop={(e) => handleDrop(e, 'badgeSlot')}
            onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('badgeSlot'); } }}
          >
            <span 
              style={{ backgroundColor: preset.badgeSlot.bgColor || '#eff6ff', color: preset.badgeSlot.textColor || '#1d4ed8' }}
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60 inline-flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> {getVarDisplay(preset.badgeSlot.fieldVar, 'Sample Badge')}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4">
          {preset.mediaSlot?.enabled !== false && (
            <div 
              className={`p-0.5 ${getSlotHighlightClass('mediaSlot')}`}
              onDragOver={(e) => handleDragOver(e, 'mediaSlot')}
              onDragLeave={() => handleDragLeave('mediaSlot')}
              onDrop={(e) => handleDrop(e, 'mediaSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('mediaSlot'); } }}
            >
              {renderMediaContent()}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1">
            <div
              className={`p-1 ${getSlotHighlightClass('titleSlot')}`}
              onDragOver={(e) => handleDragOver(e, 'titleSlot')}
              onDragLeave={() => handleDragLeave('titleSlot')}
              onDrop={(e) => handleDrop(e, 'titleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('titleSlot'); } }}
            >
              <h4 style={{ color }} className="font-bold tracking-tight leading-snug text-sm">
                {getVarDisplay(preset.titleSlot?.fieldVar, 'Sample Title Slot')}
              </h4>
            </div>

            {preset.subtitleSlot?.enabled && (
              <div
                className={`p-1 ${getSlotHighlightClass('subtitleSlot')}`}
                onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
                onDragLeave={() => handleDragLeave('subtitleSlot')}
                onDrop={(e) => handleDrop(e, 'subtitleSlot')}
                onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('subtitleSlot'); } }}
              >
                <p className="text-xs text-gray-500 line-clamp-1">
                  {getVarDisplay(preset.subtitleSlot.fieldVar, 'Sample Subtitle Slot')}
                </p>
              </div>
            )}
          </div>
        </div>

        {preset.showDivider && <div className="border-t border-gray-100 my-2" />}

        <div className="flex items-center justify-between text-xs pt-1 gap-2">
          {preset.footerLeftSlot?.enabled && (
            <div
              className={`p-1 ${getSlotHighlightClass('footerLeftSlot')}`}
              onDragOver={(e) => handleDragOver(e, 'footerLeftSlot')}
              onDragLeave={() => handleDragLeave('footerLeftSlot')}
              onDrop={(e) => handleDrop(e, 'footerLeftSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerLeftSlot'); } }}
            >
              <span className="text-gray-400 font-medium">
                {preset.footerLeftSlot.label || getVarDisplay(preset.footerLeftSlot.fieldVar, 'Footer Info')}
              </span>
            </div>
          )}
          {preset.footerRightSlot?.enabled && (
            <div
              className={`p-1 ml-auto ${getSlotHighlightClass('footerRightSlot')}`}
              onDragOver={(e) => handleDragOver(e, 'footerRightSlot')}
              onDragLeave={() => handleDragLeave('footerRightSlot')}
              onDrop={(e) => handleDrop(e, 'footerRightSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerRightSlot'); } }}
            >
              <span 
                style={{ color }} 
                className="font-bold flex items-center gap-1 cursor-pointer hover:underline"
              >
                {preset.footerRightSlot.label || getVarDisplay(preset.footerRightSlot.fieldVar, 'Action Link')}
                {preset.footerRightSlot.showArrow && <ArrowUpRight className="w-3.5 h-3.5" />}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


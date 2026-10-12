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
  isMappingMode?: boolean;
  wizardStep?: 1 | 2 | 3;
  availableFields?: Array<{ name: string; label: string }>;
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
  isMappingMode = false,
  wizardStep,
  availableFields,
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

    let mediaEl: React.ReactNode = null;

    if (type === 'image') {
      const imgUrl = preset.mediaSlot?.imageUrl || (sampleData as any)?.imageUrl || (sampleData as any)?.image || (sampleData as any)?.photo;
      if (imgUrl) {
        mediaEl = (
          <img 
            src={imgUrl} 
            alt="Media Image" 
            className={`${sizeClass} ${shapeClass} object-cover shadow-xs border border-gray-200 shrink-0`}
          />
        );
      } else {
        mediaEl = (
          <div 
            style={boxBgStyle}
            className={`${sizeClass} ${shapeClass} shadow-xs transition-all border border-black/5`}
          />
        );
      }
    } else if (type === 'initials' || type === 'logo') {
      const maxLen = preset.mediaSlot?.initialsLength || 2;
      const titleVal = sampleData?.title || sampleData?.recipient || 'Academic Bulletin Center';
      const words = titleVal.trim().split(/[\s.\-_]+/);
      const computedInitials = words.map((w: string) => w[0]).join('').substring(0, maxLen).toUpperCase();
      const text = isStep1Gallery 
        ? 'LI'
        : (sampleData?.logoText || computedInitials || 'ABC').substring(0, maxLen).toUpperCase();

      mediaEl = (
        <div 
          style={boxBgStyle}
          className={`${sizeClass} ${shapeClass} flex items-center justify-center font-bold shadow-xs transition-all tracking-wider font-mono`}
        >
          <span>{text}</span>
        </div>
      );
    } else {
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

      mediaEl = (
        <div 
          style={boxBgStyle}
          className={`${sizeClass} ${shapeClass} flex items-center justify-center font-bold shadow-xs transition-all`}
        >
          <IconComponent className={iconSizeClass} />
        </div>
      );
    }

    if (wizardStep === 2) {
      // Media/Logo box is NOT a droppable field-mapping slot.
      // Its content (initials from title, icon, image, count) is configured
      // in Step 3 style controls, so we render it read-only with a lock badge.
      return (
        <div className="flex items-center gap-1.5">
          {mediaEl}
          <span className="text-[11px] text-gray-300 cursor-help" title="Not a droppable area">
            🔒
          </span>
        </div>
      );
    }

    return mediaEl;
  };

  const getDetailLabelText = (defaultLabel: string) => {
    if (preset.detailLineMode === 'custom_label' && preset.customDetailLabel) {
      return preset.customDetailLabel;
    }
    return defaultLabel;
  };

  const effectiveFields = (availableFields && availableFields.length > 0)
    ? availableFields
    : [
        { name: 'title', label: 'Main Title / Schedule' },
        { name: 'year', label: 'Academic Year / Status' },
        { name: 'recipient', label: 'Program / Branch / Recipient' },
        { name: 'branch', label: 'Program / Branch' },
        { name: 'semester', label: 'Semester' },
        { name: 'section', label: 'Section' },
        { name: 'pdf_url', label: 'File / Document Link' },
      ];

  const isStep1Gallery = wizardStep === 1;

  const getVarDisplay = (fieldVar: string | undefined, fallbackSample: string, slotLabel?: string) => {
    if (isStep1Gallery) {
      return fallbackSample;
    }
    if (isBlueprint) {
      if (fieldVar && fieldVar !== 'recipient' && fieldVar !== 'year' && fieldVar !== 'title') {
        return `{${fieldVar}}`;
      }
      return slotLabel ? `[ ${slotLabel} ]` : `[ Field Value ]`;
    }
    if (fieldVar && sampleData && (sampleData as any)[fieldVar]) {
      return (sampleData as any)[fieldVar];
    }
    if (fieldVar) {
      const found = effectiveFields.find(f => f.name === fieldVar);
      if (found) return found.label;
      return fieldVar.charAt(0).toUpperCase() + fieldVar.slice(1);
    }
    return fallbackSample;
  };

  const rawBadgeVal = isStep1Gallery
    ? 'Lorem ipsum'
    : getVarDisplay(preset.badgeSlot?.fieldVar, sampleData?.year || '2026-2027', 'Year / Badge');
  const badgeVal = preset.badgeSlot?.displayMode === 'label_and_value' && !isStep1Gallery
    ? `Year: ${rawBadgeVal}`
    : rawBadgeVal;

  const titleVal = isStep1Gallery
    ? 'Lorem ipsum dolor sit amet'
    : getVarDisplay(preset.titleSlot?.fieldVar, sampleData?.title || 'B.Sc Home Science & Food Technology Schedule', 'Main Title');
  const rawSubVal = isStep1Gallery
    ? 'Consectetur adipiscing elit, sed do eiusmod'
    : getVarDisplay(preset.subtitleSlot?.fieldVar, sampleData?.recipient || 'Food Technology • Semester 1', 'Branch & Semester');
  const subMode = preset.subtitleSlot?.displayMode || preset.detailLineMode || 'value_only';
  const formattedSubVal = subMode === 'label_and_value' && !isStep1Gallery
    ? `Branch: ${rawSubVal}`
    : rawSubVal;
  const subVal = formattedSubVal;
  const actionLabel = isStep1Gallery
    ? 'Lorem ipsum'
    : (preset.footerRightSlot?.label || (isBlueprint ? 'Download PDF ↗' : 'View Document'));

  const hasFieldEntries = Boolean(sampleData?.fieldEntries && sampleData.fieldEntries.length > 0);

  const renderSubtitleContent = () => {
    if (isStep1Gallery) {
      return (
        <div className="text-xs text-gray-500 font-normal leading-relaxed">
          <p>Consectetur adipiscing elit, sed do eiusmod tempor</p>
        </div>
      );
    }

    if (isBlueprint) {
      if (subMode === 'label_and_value') {
        return (
          <div className="text-xs text-gray-600 font-medium space-y-0.5">
            <p><span className="text-gray-900 font-bold">Branch:</span> [ Program / Branch • Sem ]</p>
          </div>
        );
      }
      return (
        <div className="text-xs text-gray-600 font-medium space-y-0.5">
          <p>[ Program / Branch • Semester ]</p>
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

  const getFieldLabel = (fieldName?: string) => {
    if (!fieldName) return '';
    const found = effectiveFields.find(f => f.name === fieldName);
    return found ? found.label : (fieldName.charAt(0).toUpperCase() + fieldName.slice(1));
  };

  /* =========================================================================
     IN-PLACE CARD SLOTS (Authentic cards for Steps 1 & 3, Dashed droppable slots for Step 2)
     ========================================================================= */
  const renderBadgeSlot = (isDark = false) => {
    const isEnabled = preset.badgeSlot?.enabled !== false;

    // Steps 1 & 3 or Clean Preview: Final authentic badge pill
    if (!isMappingMode && wizardStep !== 2) {
      if (!isEnabled) return null;
      return (
        <span 
          style={{ 
            backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : (preset.badgeSlot?.bgColor || '#eff6ff'), 
            color: isDark ? '#ffffff' : (preset.badgeSlot?.textColor || color) 
          }}
          className={`font-bold px-3 py-1 rounded-lg text-xs inline-block ${
            isDark ? 'backdrop-blur-md border border-white/30 text-white' : 'border border-current/10 shadow-2xs'
          }`}
        >
          {badgeVal}
        </span>
      );
    }

    // Step 2 (Decide Fields): Dashed droppable Slot 2 Box
    const fieldVar = preset.badgeSlot?.fieldVar;
    const isMapped = Boolean(fieldVar && fieldVar !== '' && isEnabled);
    const mappedLabel = getFieldLabel(fieldVar);
    const sampleValue = isMapped && sampleData ? (sampleData as any)[fieldVar] : '';
    const isOver = dragOverSlot === 'badgeSlot';

    return (
      <div 
        onDragOver={(e) => handleDragOver(e, 'badgeSlot')}
        onDragLeave={() => handleDragLeave('badgeSlot')}
        onDrop={(e) => handleDrop(e, 'badgeSlot')}
        onClick={(e) => e.stopPropagation()}
        className={`px-3 py-1.5 rounded-xl border-2 border-dashed transition-all flex items-center gap-2 cursor-pointer ${
          isOver
            ? 'border-blue-600 bg-blue-100 ring-4 ring-blue-500/30 scale-105 shadow-md'
            : activeDragField
              ? 'border-amber-400 bg-amber-50/70 animate-pulse'
              : isMapped
                ? 'border-blue-400 bg-blue-50/40 hover:border-blue-500 shadow-2xs'
                : 'border-gray-300 bg-gray-50/60 hover:border-gray-400'
        }`}
        title="Slot 2: Drag field from right and drop here"
      >
        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-tight uppercase shrink-0 ${
          isMapped ? 'text-blue-700 bg-blue-200/80' : 'text-gray-500 bg-gray-200'
        }`}>
          Slot 2:
        </span>
        {isMapped ? (
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-blue-950">
              {sampleValue || mappedLabel}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDropToSlot && onDropToSlot('badgeSlot', '');
              }}
              title="Clear field"
              className="w-4 h-4 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 flex items-center justify-center text-[11px] font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        ) : (
          <span className="font-semibold text-xs text-gray-400 italic">
            Drop field
          </span>
        )}
      </div>
    );
  };

  const renderTitleSlot = (isDark = false) => {
    const isEnabled = preset.titleSlot?.enabled !== false;

    // Steps 1 & 3 or Clean Preview: Final authentic title
    if (!isMappingMode && wizardStep !== 2) {
      if (!isEnabled) return null;
      return (
        <h3 style={{ color: isDark ? '#ffffff' : color }} className="font-bold text-base tracking-tight leading-tight">
          {titleVal}
        </h3>
      );
    }

    // Step 2 (Decide Fields): Dashed droppable Slot 3 Box (Title)
    const fieldVar = preset.titleSlot?.fieldVar;
    const isMapped = Boolean(fieldVar && fieldVar !== '');
    const mappedLabel = getFieldLabel(fieldVar);
    const sampleValue = isMapped && sampleData ? (sampleData as any)[fieldVar] : '';
    const isOver = dragOverSlot === 'titleSlot';

    return (
      <div 
        onDragOver={(e) => handleDragOver(e, 'titleSlot')}
        onDragLeave={() => handleDragLeave('titleSlot')}
        onDrop={(e) => handleDrop(e, 'titleSlot')}
        onClick={(e) => e.stopPropagation()}
        className={`w-full px-3 py-2.5 rounded-xl border-2 border-dashed transition-all flex items-center justify-between gap-2 cursor-pointer ${
          isOver
            ? 'border-blue-600 bg-blue-100 ring-4 ring-blue-500/30 scale-[1.02] shadow-md'
            : activeDragField
              ? 'border-amber-400 bg-amber-50/70 animate-pulse'
              : isMapped
                ? 'border-blue-400 bg-blue-50/40 hover:border-blue-500 shadow-2xs'
                : 'border-gray-300 bg-gray-50/60 hover:border-gray-400'
        }`}
        title="Slot 3: Drag Title field from right and drop here"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded tracking-tight uppercase shrink-0 ${
            isMapped ? 'text-blue-700 bg-blue-200/80' : 'text-gray-500 bg-gray-200'
          }`}>
            Slot 3:
          </span>
          {isMapped ? (
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-blue-600 uppercase block leading-none">
                [{mappedLabel}]
              </span>
              <span className="font-extrabold text-sm text-blue-950 truncate block mt-0.5">
                {sampleValue || mappedLabel}
              </span>
            </div>
          ) : (
            <span className="font-semibold text-xs text-gray-400 italic truncate">
              Drop field
            </span>
          )}
        </div>
        {isMapped && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDropToSlot && onDropToSlot('titleSlot', '');
            }}
            title="Clear field"
            className="w-5 h-5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  const renderSubtitleSlot = (isDark = false) => {
    const isEnabled = preset.subtitleSlot?.enabled !== false;

    // Steps 1 & 3 or Clean Preview: Final authentic subtitle
    if (!isMappingMode && wizardStep !== 2) {
      if (!isEnabled || (!subVal && !hasFieldEntries)) return null;
      if (isDark) {
        return <p className="text-xs text-white/90 font-medium leading-tight">{subVal}</p>;
      }
      return renderSubtitleContent();
    }

    // Step 2 (Decide Fields): Dashed droppable Slot 4 Box (Subtitle / Details)
    const fieldVar = preset.subtitleSlot?.fieldVar;
    const isMapped = Boolean(fieldVar && fieldVar !== '' && isEnabled);
    const mappedLabel = getFieldLabel(fieldVar);
    const sampleValue = isMapped && sampleData ? (sampleData as any)[fieldVar] : '';
    const isOver = dragOverSlot === 'subtitleSlot';

    return (
      <div 
        onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
        onDragLeave={() => handleDragLeave('subtitleSlot')}
        onDrop={(e) => handleDrop(e, 'subtitleSlot')}
        onClick={(e) => e.stopPropagation()}
        className={`w-full px-3 py-2 rounded-xl border-2 border-dashed transition-all flex items-center justify-between gap-2 cursor-pointer ${
          isOver
            ? 'border-blue-600 bg-blue-100 ring-4 ring-blue-500/30 scale-[1.02] shadow-md'
            : activeDragField
              ? 'border-amber-400 bg-amber-50/70 animate-pulse'
              : isMapped
                ? 'border-blue-400 bg-blue-50/40 hover:border-blue-500 shadow-2xs'
                : 'border-gray-300 bg-gray-50/60 hover:border-gray-400'
        }`}
        title="Slot 4: Drag Subtitle field from right and drop here"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-tight uppercase shrink-0 ${
            isMapped ? 'text-blue-700 bg-blue-200/80' : 'text-gray-500 bg-gray-200'
          }`}>
            Slot 4:
          </span>
          {isMapped ? (
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-blue-600 uppercase block leading-none">
                [{mappedLabel}]
              </span>
              <span className="font-semibold text-xs text-blue-900 truncate block mt-0.5">
                {sampleValue || mappedLabel}
              </span>
            </div>
          ) : (
            <span className="font-semibold text-xs text-gray-400 italic truncate">
              Drop field
            </span>
          )}
        </div>
        {isMapped && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDropToSlot && onDropToSlot('subtitleSlot', '');
            }}
            title="Clear field"
            className="w-5 h-5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  const renderFooterRightSlot = (isButton = false) => {
    const isEnabled = preset.footerRightSlot?.enabled !== false;

    // Steps 1 & 3 or Clean Preview: Final authentic action button or link
    if (!isMappingMode && wizardStep !== 2) {
      if (!isEnabled) return null;
      if (isButton) {
        return (
          <button 
            type="button"
            className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {actionLabel} <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        );
      }
      return (
        <span style={{ color }} className="font-bold text-xs inline-flex items-center gap-1 hover:underline cursor-pointer">
          {actionLabel} <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      );
    }

    // Step 2 (Decide Fields): Locked — action link URL is auto-resolved,
    // label text is configurable in Step 3 style controls.
    return (
      <span style={{ color }} className="font-bold text-xs inline-flex items-center gap-1">
        {preset.footerRightSlot?.label || 'View Document'} <ArrowUpRight className="w-3.5 h-3.5" />
        <span className="text-[11px] text-gray-300 cursor-help" title="Not a droppable area">
          🔒
        </span>
      </span>
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
  const hasCustomBorder = className.includes('border-0') || className.includes('border-none');
  const hasCustomRadius = className.includes('rounded-none');
  const hasCustomShadow = className.includes('shadow-none');

  const borderClass = hasCustomBorder ? '' : 'border border-slate-200/80';
  const radiusClass = hasCustomRadius ? '' : getBorderRadiusClass(preset.borderRadius);
  const shadowClass = hasCustomShadow ? '' : getShadowClass(activeShadow);

  const cardBaseStyle = `bg-white ${borderClass} ${radiusClass} ${shadowClass} ${getHoverEffectClass(preset.hoverEffect)} overflow-hidden cursor-pointer relative transition-all ${className}`;

  /* =========================================================================
     STYLE 1: OFFICIAL DOCUMENT / AFFILIATION CARD
     ========================================================================= */
  if (styleType === 'official') {
    return (
      <div 
        onClick={onClick}
        className={cardBaseStyle}
        style={getAccentStyle()}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
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

            {/* Top Right Badge Pill / Mapping */}
            <div 
              className={getSlotHighlightClass('badgeSlot')}
              onDragOver={(e) => handleDragOver(e, 'badgeSlot')}
              onDragLeave={() => handleDragLeave('badgeSlot')}
              onDrop={(e) => handleDrop(e, 'badgeSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('badgeSlot'); } }}
            >
              {renderBadgeSlot(false)}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <div 
              className={getSlotHighlightClass('titleSlot')}
              onDragOver={(e) => handleDragOver(e, 'titleSlot')}
              onDragLeave={() => handleDragLeave('titleSlot')}
              onDrop={(e) => handleDrop(e, 'titleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('titleSlot'); } }}
            >
              {renderTitleSlot(false)}
            </div>

            <div 
              className={getSlotHighlightClass('subtitleSlot')}
              onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
              onDragLeave={() => handleDragLeave('subtitleSlot')}
              onDrop={(e) => handleDrop(e, 'subtitleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('subtitleSlot'); } }}
            >
              {renderSubtitleSlot(false)}
            </div>
          </div>
        </div>

        {/* Gray Footer Container */}
        <div className={`px-5 py-3 bg-gray-50/70 ${preset.showDivider !== false ? 'border-t border-gray-100' : ''} flex justify-end items-center`}>
          <div 
            className={`w-full flex justify-end ${getSlotHighlightClass('footerRightSlot')}`}
            onDragOver={(e) => handleDragOver(e, 'footerRightSlot')}
            onDragLeave={() => handleDragLeave('footerRightSlot')}
            onDrop={(e) => handleDrop(e, 'footerRightSlot')}
            onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerRightSlot'); } }}
          >
            {renderFooterRightSlot(false)}
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     STYLE 2: COMPACT MINIMAL CARD
     ========================================================================= */
  if (styleType === 'minimal') {
    return (
      <div 
        onClick={onClick}
        className={cardBaseStyle}
        style={getAccentStyle()}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
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
              {renderBadgeSlot(false)}
            </div>
          </div>

          <div className="space-y-2">
            <div 
              className={getSlotHighlightClass('titleSlot')}
              onDragOver={(e) => handleDragOver(e, 'titleSlot')}
              onDragLeave={() => handleDragLeave('titleSlot')}
              onDrop={(e) => handleDrop(e, 'titleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('titleSlot'); } }}
            >
              {renderTitleSlot(false)}
            </div>

            <div 
              className={getSlotHighlightClass('subtitleSlot')}
              onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
              onDragLeave={() => handleDragLeave('subtitleSlot')}
              onDrop={(e) => handleDrop(e, 'subtitleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('subtitleSlot'); } }}
            >
              {renderSubtitleSlot(false)}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-2">
            <div 
              className={`flex-1 ${getSlotHighlightClass('footerRightSlot')}`}
              onDragOver={(e) => handleDragOver(e, 'footerRightSlot')}
              onDragLeave={() => handleDragLeave('footerRightSlot')}
              onDrop={(e) => handleDrop(e, 'footerRightSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerRightSlot'); } }}
            >
              {renderFooterRightSlot(false)}
            </div>

            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-2xs shrink-0">
              <Bookmark className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     STYLE 3: MODERN GRADIENT BANNER
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
          className="p-4 sm:p-5 text-white space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
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
              {renderBadgeSlot(true)}
            </div>
          </div>

          {/* Title & Subtitle Wrapper */}
          <div className="space-y-2">
            <div 
              className={getSlotHighlightClass('titleSlot')}
              onDragOver={(e) => handleDragOver(e, 'titleSlot')}
              onDragLeave={() => handleDragLeave('titleSlot')}
              onDrop={(e) => handleDrop(e, 'titleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('titleSlot'); } }}
            >
              {renderTitleSlot(true)}
            </div>

            <div 
              className={getSlotHighlightClass('subtitleSlot')}
              onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
              onDragLeave={() => handleDragLeave('subtitleSlot')}
              onDrop={(e) => handleDrop(e, 'subtitleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('subtitleSlot'); } }}
            >
              {renderSubtitleSlot(true)}
            </div>
          </div>
        </div>

        {/* Bottom White Body */}
        <div className="p-4 sm:p-5 bg-white space-y-4 flex-1 flex flex-col justify-between">
          <div className="flex justify-end pt-1">
            <div 
              className={`w-full flex justify-end ${getSlotHighlightClass('footerRightSlot')}`}
              onDragOver={(e) => handleDragOver(e, 'footerRightSlot')}
              onDragLeave={() => handleDragLeave('footerRightSlot')}
              onDrop={(e) => handleDrop(e, 'footerRightSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerRightSlot'); } }}
            >
              {renderFooterRightSlot(true)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     STYLE 4: DUAL-PANE SPLIT CARD
     ========================================================================= */
  if (styleType === 'split-card') {
    return (
      <div 
        onClick={onClick}
        className={`${cardBaseStyle} flex flex-col justify-between h-full`}
        style={{ 
          ...getAccentStyle(), 
          borderLeftColor: color, 
          borderLeftWidth: '5px',
          borderLeftStyle: 'solid'
        }}
      >
        <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
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
              {renderBadgeSlot(false)}
            </div>
          </div>

          <div className="space-y-1.5 my-auto">
            <div 
              className={getSlotHighlightClass('titleSlot')}
              onDragOver={(e) => handleDragOver(e, 'titleSlot')}
              onDragLeave={() => handleDragLeave('titleSlot')}
              onDrop={(e) => handleDrop(e, 'titleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('titleSlot'); } }}
            >
              {renderTitleSlot(false)}
            </div>

            <div 
              className={getSlotHighlightClass('subtitleSlot')}
              onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
              onDragLeave={() => handleDragLeave('subtitleSlot')}
              onDrop={(e) => handleDrop(e, 'subtitleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('subtitleSlot'); } }}
            >
              {renderSubtitleSlot(false)}
            </div>
          </div>

          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-400">
              Official Document
            </span>
            <div 
              className={getSlotHighlightClass('footerRightSlot')}
              onDragOver={(e) => handleDragOver(e, 'footerRightSlot')}
              onDragLeave={() => handleDragLeave('footerRightSlot')}
              onDrop={(e) => handleDrop(e, 'footerRightSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerRightSlot'); } }}
            >
              {renderFooterRightSlot(false)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     CUSTOM FALLBACK LAYOUT
     ========================================================================= */
  if (preset.htmlTemplate && (preset.isCustom || styleType === 'custom')) {
    return (
      <div 
        onClick={onClick}
        className={`w-full ${className}`}
        dangerouslySetInnerHTML={{ __html: preset.htmlTemplate }}
      />
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`w-full min-h-[260px] bg-white rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden group flex flex-col justify-between ${className}`}
    >
      <div className="p-5 space-y-4">
        {/* Top Badge Slot */}
        <div 
          className={getSlotHighlightClass('badgeSlot')}
          onDragOver={(e) => handleDragOver(e, 'badgeSlot')}
          onDragLeave={() => handleDragLeave('badgeSlot')}
          onDrop={(e) => handleDrop(e, 'badgeSlot')}
          onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('badgeSlot'); } }}
        >
          {renderBadgeSlot(false)}
        </div>

        <div className="flex items-start gap-4">
          {preset.mediaSlot?.enabled !== false && (
            <div 
              className={`p-0.5 shrink-0 ${getSlotHighlightClass('mediaSlot')}`}
              onDragOver={(e) => handleDragOver(e, 'mediaSlot')}
              onDragLeave={() => handleDragLeave('mediaSlot')}
              onDrop={(e) => handleDrop(e, 'mediaSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('mediaSlot'); } }}
            >
              {renderMediaContent()}
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-2">
            <div
              className={getSlotHighlightClass('titleSlot')}
              onDragOver={(e) => handleDragOver(e, 'titleSlot')}
              onDragLeave={() => handleDragLeave('titleSlot')}
              onDrop={(e) => handleDrop(e, 'titleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('titleSlot'); } }}
            >
              {renderTitleSlot(false)}
            </div>

            <div
              className={getSlotHighlightClass('subtitleSlot')}
              onDragOver={(e) => handleDragOver(e, 'subtitleSlot')}
              onDragLeave={() => handleDragLeave('subtitleSlot')}
              onDrop={(e) => handleDrop(e, 'subtitleSlot')}
              onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('subtitleSlot'); } }}
            >
              {renderSubtitleSlot(false)}
            </div>
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

          <div
            className={`ml-auto ${getSlotHighlightClass('footerRightSlot')}`}
            onDragOver={(e) => handleDragOver(e, 'footerRightSlot')}
            onDragLeave={() => handleDragLeave('footerRightSlot')}
            onDrop={(e) => handleDrop(e, 'footerRightSlot')}
            onClick={(e) => { if (onSelectSlot) { e.stopPropagation(); onSelectSlot('footerRightSlot'); } }}
          >
            {renderFooterRightSlot(false)}
          </div>
        </div>
      </div>
    </div>
  );
};


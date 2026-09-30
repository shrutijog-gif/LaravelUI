import React, { useState, useEffect } from 'react';
import { getStoredCardPresets } from '../../../utils/cardPresets';
import { CardPresetView } from '../../modules/developer/CardPresetView';
import {
  Department,
  DepartmentTab,
  DepartmentStaffMember,
  getStoredDepartments,
  getDepartmentTabs,
  getDepartmentStaff,
} from '../../../data/mockDepartmentData';
import { Mail, Phone, GraduationCap, Award, ExternalLink, Calendar, BookOpen, Clock } from 'lucide-react';

export interface DynamicSectionStaffConfig {
  showPhoto?: boolean;
  showDesignation?: boolean;
  gridCols?: number;
  cardStyle?: string;
}

export interface DynamicGalleryConfig {
  gridCols?: number;
  aspectRatio?: 'video' | 'square' | 'tall';
}

export interface DepartmentsBlockProps {
  departmentId: string;
  title?: string;
  description?: string;
  defaultTab?: string;
  teachingConfig?: DynamicSectionStaffConfig;
  nonTeachingConfig?: DynamicSectionStaffConfig;
  alumnaeConfig?: DynamicSectionStaffConfig;
  galleryConfig?: DynamicGalleryConfig;
  // Fallbacks for backward compatibility
  showPhoto?: boolean;
  showDesignation?: boolean;
  gridCols?: number;
  cardStyle?: string;
  className?: string;
  anchorId?: string;
}

export const DepartmentsBlock: React.FC<DepartmentsBlockProps> = ({
  departmentId,
  title,
  description,
  defaultTab,
  teachingConfig,
  nonTeachingConfig,
  alumnaeConfig,
  galleryConfig,
  showPhoto = true,
  showDesignation = true,
  gridCols = 2,
  cardStyle = '',
  className = '',
  anchorId = '',
}) => {
  const departments = getStoredDepartments();
  const department: Department = departments.find(d => d.id === departmentId) ?? departments[0];

  const [tabs, setTabs] = useState<DepartmentTab[]>(() =>
    department ? getDepartmentTabs(department.id) : []
  );
  const [staff, setStaff] = useState<DepartmentStaffMember[]>(() =>
    department ? getDepartmentStaff(department.id) : []
  );

  useEffect(() => {
    if (department) {
      setTabs(getDepartmentTabs(department.id));
      setStaff(getDepartmentStaff(department.id));
    }
  }, [departmentId, department?.id]);

  const visibleTabs = tabs.filter(t => t.visible);
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    if (defaultTab && visibleTabs.some(t => t.id === defaultTab)) {
      return defaultTab;
    }
    return visibleTabs[0]?.id || 'tab-overview';
  });

  // Ensure active tab remains valid if tabs change
  useEffect(() => {
    if (!visibleTabs.some(t => t.id === activeTabId) && visibleTabs.length > 0) {
      setActiveTabId(visibleTabs[0].id);
    }
  }, [tabs, activeTabId, visibleTabs]);

  const activeTab = visibleTabs.find(t => t.id === activeTabId) || visibleTabs[0];
  const presets = getStoredCardPresets();

  const renderStaffCategory = (category: 'teaching' | 'non-teaching' | 'alumnae') => {
    const list = staff.filter(s => s.category === category).sort((a, b) => a.order - b.order);

    // Section-specific configuration
    const activeCfg =
      category === 'teaching'
        ? (teachingConfig || { showPhoto, showDesignation, gridCols, cardStyle })
        : category === 'non-teaching'
        ? (nonTeachingConfig || { showPhoto, showDesignation, gridCols, cardStyle })
        : (alumnaeConfig || { showPhoto, showDesignation, gridCols, cardStyle });

    const activeShowPhoto = activeCfg.showPhoto ?? true;
    const activeShowDesignation = activeCfg.showDesignation ?? true;
    const activeCols = activeCfg.gridCols ?? 2;
    const activeStyle = activeCfg.cardStyle || '';
    const activePreset = presets.find(p => p.id === activeStyle);

    if (list.length === 0) {
      return (
        <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm font-medium">No personnel records added in this category yet.</p>
        </div>
      );
    }

    const colsClass =
      activeCols === 1
        ? 'grid-cols-1'
        : activeCols === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2';

    return (
      <div className={`grid ${colsClass} gap-4`}>
        {list.map(member => {
          // If a custom card preset from Card Builder Studio is selected
          if (activePreset) {
            return (
              <div key={member.id} className="w-full">
                <CardPresetView
                  preset={activePreset}
                  sampleData={{
                    year: member.experience || '',
                    logoText: member.name
                      .split(' ')
                      .map(w => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase(),
                    title: member.name,
                    recipient: activeShowDesignation ? member.designation : '',
                    pdf_url: '#',
                    imageUrl: activeShowPhoto ? member.imageUrl : undefined,
                    badge: member.specialization || (member.category === 'teaching' ? 'Faculty' : member.category === 'alumnae' ? 'Alumna' : 'Staff'),
                  }}
                  viewMode="sample"
                />
              </div>
            );
          }

          // Fallback rich card
          return (
            <div
              key={member.id}
              className="flex items-start gap-3.5 p-4 bg-white border border-gray-200 rounded-xl shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all"
            >
              {activeShowPhoto && (
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-700 flex-shrink-0 flex items-center justify-center border-2 border-white shadow-2xs">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {member.name
                        .split(' ')
                        .map(w => w[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </span>
                  )}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{member.name}</h4>
                  {member.experience && (
                    <span className="text-[10px] font-semibold px-2 py-0.2 bg-blue-50 text-blue-700 rounded-full">
                      {member.experience}
                    </span>
                  )}
                </div>

                {activeShowDesignation && (
                  <p className="text-xs font-semibold text-blue-800 mt-0.5">{member.designation}</p>
                )}

                {member.qualification && (
                  <p className="text-[11px] text-gray-600 flex items-center gap-1 mt-1 truncate">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {member.qualification}
                  </p>
                )}

                {member.specialization && (
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                    <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    {member.specialization}
                  </p>
                )}

                {member.email && (
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    {member.email}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id={anchorId || undefined} className={`py-8 w-full ${className}`}>
      {/* Optional Puck Block Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
          {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
        </div>
      )}

      {/* Two-panel */}
      <div className="flex bg-white rounded-lg shadow border border-gray-200 overflow-hidden min-h-[320px]">
        {/* Left tab list */}
        <div className="w-52 flex-shrink-0 border-r border-gray-200 bg-gray-50">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`w-full text-left px-4 py-3.5 text-sm border-b border-gray-100 transition-colors font-medium ${
                tab.id === activeTabId
                  ? 'bg-white border-l-4 border-l-blue-600 text-gray-900 font-semibold pl-3'
                  : 'bg-gray-50 border-l-4 border-l-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 p-6 min-w-0">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            {activeTab?.label}
          </h3>
          <hr className="mb-5 border-gray-200" />

            {/* Dynamic Rendering Based on Tab Type */}
            {activeTab?.id === 'tab-teaching-staff' ? (
              renderStaffCategory('teaching')
            ) : activeTab?.id === 'tab-non-teaching-staff' ? (
              renderStaffCategory('non-teaching')
            ) : activeTab?.id === 'tab-distinguished-alumnae' ? (
              renderStaffCategory('alumnae')
            ) : activeTab?.id === 'tab-photo-gallery' ? (
              <div className={`grid ${
                (galleryConfig?.gridCols ?? 2) === 4
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : (galleryConfig?.gridCols ?? 2) === 3
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2'
              } gap-4`}>
                {[
                  { title: 'Advanced Computing Lab', url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80' },
                  { title: 'National Hackathon 2025', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80' },
                  { title: 'Robotics Workshop', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80' },
                  { title: 'Alumni Felicitation Ceremony', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80' },
                ].map((img, i) => {
                  const aspectClass =
                    galleryConfig?.aspectRatio === 'square'
                      ? 'aspect-square'
                      : galleryConfig?.aspectRatio === 'tall'
                      ? 'aspect-[3/4]'
                      : 'aspect-video';
                  return (
                    <div key={i} className={`group relative rounded-xl overflow-hidden border border-gray-200 shadow-2xs ${aspectClass}`}>
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3.5">
                        <span className="text-xs font-semibold text-white">{img.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Rich Text Display */
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-sm bg-gray-50/40 p-6 rounded-xl border border-gray-100">
                {activeTab?.content || (
                  <p className="text-gray-400 italic">Information for this section will be updated shortly.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

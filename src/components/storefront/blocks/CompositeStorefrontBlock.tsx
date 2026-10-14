import React, { useState } from 'react';
import { DynamicEntityItem, ModuleSchema, DynamicTabItemData } from '../../../types/moduleStudio';
import { ChevronRight, FileText, Download, Mail, Phone, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface CompositeStorefrontBlockProps {
  items: DynamicEntityItem[];
  schema: ModuleSchema;
  defaultEntityId?: string;
  className?: string;
  showHeroBanner?: boolean;
  layoutStyle?: 'horizontal_tabs' | 'vertical_tabs' | 'runny_page' | string;
  showJumpStrip?: boolean;
  dynamicTabSettings?: Record<string, any>;
}

export const CompositeStorefrontBlock: React.FC<CompositeStorefrontBlockProps> = ({
  items,
  schema,
  defaultEntityId,
  className = '',
  showHeroBanner = false,
  layoutStyle = 'vertical_tabs',
  showJumpStrip = true,
  dynamicTabSettings,
}) => {
  // Normalize layout style: support 'horizontal_tabs' / 'horizontal-tabs', 'vertical_tabs' / 'vertical-tabs', 'runny_page' / 'runny-page'
  const normalizedLayout = 
    layoutStyle === 'horizontal_tabs' || layoutStyle === 'horizontal-tabs' ? 'horizontal_tabs'
    : layoutStyle === 'runny_page' || layoutStyle === 'runny-page' ? 'runny_page'
    : 'vertical_tabs';

  // Currently selected entity (e.g. Food Nutrition and Food Tech or Physics)
  const [selectedEntityId, setSelectedEntityId] = useState<string>(
    defaultEntityId || (items[0]?.id || '')
  );

  const selectedEntity = items.find(i => i.id === selectedEntityId) || items[0];

  // Resolve available tabs for the selected entity
  const resolveTabs = (): DynamicTabItemData[] => {
    if (!selectedEntity) return [];
    if (selectedEntity.tabsData && Object.keys(selectedEntity.tabsData).length > 0) {
      return Object.values(selectedEntity.tabsData).filter(t => t.visible !== false);
    }
    const blueprints = schema.tabsConfig?.defaultTabs || [];
    return blueprints
      .filter(bp => bp.visible !== false)
      .map(bp => ({
        id: bp.id,
        label: bp.label,
        componentType: bp.componentType,
        visible: true,
        content: bp.defaultContent || '',
      }));
  };

  const tabs = resolveTabs();
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || 'tab-overview');
  const [expandedAccordions, setExpandedAccordions] = useState<Record<string, boolean>>({});

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const entityTitle = selectedEntity?.data?.name || selectedEntity?.data?.title || 'Academic Department';

  const toggleAccordion = (id: string) => {
    setExpandedAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Reusable tab content renderer
  const renderTabContent = (tab: DynamicTabItemData) => {
    if (!tab) return null;
    return (
      <div>
        {/* 1. Rich Text View (Overview, Vision, Mission) */}
        {(tab.componentType === 'rich_text' || (tab.componentType === 'ui_section' && !Array.isArray(tab.content))) && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex-1 text-sm text-stone-700 leading-relaxed space-y-4 font-normal">
                {typeof tab.content === 'string' && tab.content.trim() ? (
                  tab.content.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))
                ) : (
                  <p className="text-stone-400 italic">No narrative content provided for this section.</p>
                )}
              </div>

              {/* Department Badge/Logo illustration */}
              <div className="w-full lg:w-64 shrink-0 bg-stone-50 border border-stone-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs">
                <div className="w-32 h-32 rounded-full border-4 border-stone-800 flex items-center justify-center mb-4 p-2 bg-white shadow-xs">
                  <span className="font-serif text-2xl font-bold text-stone-800 tracking-wider">
                    {(entityTitle || 'DP').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  {entityTitle}
                </span>
                <span className="text-[11px] text-stone-500 mt-1">Center of Excellence</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Faculty & Staff Directory Grid / List View */}
        {tab.componentType === 'faculty_grid' && (
          <div>
            {Array.isArray(tab.content) && tab.content.length > 0 ? (
              (() => {
                const fSettings = dynamicTabSettings?.faculty || {};
                const viewMode = fSettings.viewMode || 'card';
                const cols = fSettings.columns || 3;
                const showPhoto = fSettings.showPhoto !== false;
                const showDesignation = fSettings.showDesignation !== false;
                const showDept = fSettings.showDepartment !== false;
                const showProfileLink = fSettings.showProfileLink !== false;

                const gridColsClass = cols === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : cols === 4
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

                if (viewMode === 'list') {
                  return (
                    <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                      {tab.content.map((member: any) => (
                        <div
                          key={member.id}
                          className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors group"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {showPhoto && (
                              <img
                                src={member.imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'}
                                alt={member.name}
                                className="w-12 h-12 rounded-full object-cover shrink-0 border border-stone-200 shadow-2xs group-hover:scale-105 transition-transform"
                              />
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-stone-900 truncate font-serif">{member.name}</h4>
                              {showDesignation && (
                                <p className="text-xs text-[#a1402c] font-semibold truncate mt-0.5">{member.designation}</p>
                              )}
                              {showDept && (
                                <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5 uppercase tracking-wide">
                                  {member.department || entityTitle}
                                </p>
                              )}
                            </div>
                          </div>
                          {showProfileLink && (
                            <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#781d0d] bg-[#781d0d]/10 hover:bg-[#781d0d]/20 rounded-lg transition-colors cursor-pointer">
                              View profile →
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <div className={`grid ${gridColsClass} gap-6`}>
                    {tab.content.map((member: any) => (
                      <div
                        key={member.id}
                        className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-all hover:border-[#781d0d]/40 group"
                      >
                        {showPhoto && (
                          <img
                            src={member.imageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'}
                            alt={member.name}
                            className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-stone-100 shadow-2xs group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-stone-900 truncate font-serif">{member.name}</h4>
                          {showDesignation && (
                            <p className="text-xs text-[#a1402c] font-semibold truncate mt-0.5">{member.designation}</p>
                          )}
                          {showDept && (
                            <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5 uppercase tracking-wide">
                              {member.department || entityTitle}
                            </p>
                          )}
                          {showProfileLink && (
                            <span className="inline-block mt-2 text-[11px] font-bold text-[#781d0d] hover:underline cursor-pointer">
                              View profile →
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <p className="text-sm text-stone-400 italic">No faculty records published in this category yet.</p>
            )}
          </div>
        )}

        {/* 3. Accordion View (Courses Offered, Syllabi) */}
        {(tab.componentType === 'accordion' || (tab.componentType === 'ui_section' && Array.isArray(tab.content))) && (
          <div className="space-y-3">
            {Array.isArray(tab.content) && tab.content.length > 0 ? (
              tab.content.map((panel: any) => {
                const isExpanded = expandedAccordions[panel.id] ?? true;
                return (
                  <div key={panel.id} className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(panel.id)}
                      className="w-full text-left px-5 py-4 font-bold text-sm text-stone-800 bg-stone-50/70 hover:bg-stone-100 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{panel.title}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
                    </button>
                    {isExpanded && (
                      <div className="p-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 bg-white">
                        {panel.content}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-stone-400 italic">No accordion panels configured yet.</p>
            )}
          </div>
        )}

        {/* 4. Document / Circular List */}
        {tab.componentType === 'document_list' && (
          <div>
            {Array.isArray(tab.content) && tab.content.length > 0 ? (
              (() => {
                const docSettings = dynamicTabSettings?.documents || {};
                const viewMode = docSettings.viewMode || 'list';
                const showDownloadBtn = docSettings.showDownloadBtn !== false;
                const showIcon = docSettings.showIcon !== false;

                if (viewMode === 'grid') {
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tab.content.map((doc: any) => (
                        <div key={doc.id} className="p-4 bg-white border border-stone-200 rounded-xl hover:shadow-md transition-shadow flex flex-col justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {showIcon && (
                              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            <span className="text-xs font-bold text-stone-800 line-clamp-2">{doc.title}</span>
                          </div>
                          {showDownloadBtn && (
                            <button
                              type="button"
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#781d0d] hover:bg-[#60170a] text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Download PDF
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
                    {tab.content.map((doc: any) => (
                      <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {showIcon && (
                            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}
                          <span className="text-xs font-bold text-stone-800">{doc.title}</span>
                        </div>
                        {showDownloadBtn && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#781d0d] hover:bg-[#60170a] text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download PDF
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <p className="p-6 text-sm text-stone-400 italic">No document attachments published yet.</p>
            )}
          </div>
        )}

        {/* 5. Photo / Media Gallery */}
        {tab.componentType === 'media_gallery' && (
          <div>
            {Array.isArray(tab.content) && tab.content.length > 0 ? (
              (() => {
                const gSettings = dynamicTabSettings?.gallery || {};
                const cols = gSettings.columns || 3;
                const showCaption = gSettings.showCaption !== false;
                const colClass = cols === 2
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : cols === 4
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

                return (
                  <div className={`grid ${colClass} gap-4`}>
                    {tab.content.map((img: any, idx: number) => (
                      <div key={img.id || idx} className="group relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs aspect-4/3">
                        <img
                          src={img.imageUrl || img.url || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80'}
                          alt={img.title || img.caption || 'Gallery photo'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {showCaption && (img.title || img.caption) && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6">
                            <p className="text-xs font-medium text-white truncate">{img.title || img.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <p className="p-6 text-sm text-stone-400 italic">No gallery photos uploaded yet.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!selectedEntity) {
    return (
      <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
        No records available for this composite module.
      </div>
    );
  }

  return (
    <div className={`w-full bg-[#f8f6f0] text-gray-800 ${className}`}>
      {/* Optional Department Selector if multiple exist */}
      {items.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-end gap-2 text-xs">
          <span className="text-gray-500 font-semibold">Select Department:</span>
          <select
            value={selectedEntityId}
            onChange={e => {
              setSelectedEntityId(e.target.value);
              const newEntity = items.find(i => i.id === e.target.value);
              if (newEntity?.tabsData) {
                const firstTab = Object.values(newEntity.tabsData).find(t => t.visible !== false);
                if (firstTab) setActiveTabId(firstTab.id);
              }
            }}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-700 shadow-2xs cursor-pointer"
          >
            {items.map(it => (
              <option key={it.id} value={it.id}>
                {it.data.name || it.data.title} ({it.data.stream || 'General'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Hero Banner with Campus Backdrop (Only rendered if showHeroBanner is true) */}
      {showHeroBanner && (
        <div className="relative w-full h-64 sm:h-80 bg-stone-900 overflow-hidden flex items-end">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1800&q=80"
            alt={entityTitle}
            className="absolute inset-0 w-full h-full object-cover opacity-55 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10">
            <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-wide font-normal drop-shadow-md">
              {entityTitle}
            </h1>
            {selectedEntity.data.stream && (
              <span className="inline-block mt-3 px-3 py-1 bg-white/20 backdrop-blur-xs text-white text-xs font-medium rounded-md tracking-wider uppercase">
                Stream: {selectedEntity.data.stream}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Layout Rendering based on layoutStyle dropdown */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${showHeroBanner ? 'py-10' : 'py-6 sm:py-8'}`}>
        {/* Layout 1: Horizontal Tabs */}
        {normalizedLayout === 'horizontal_tabs' && (
          <div className="space-y-6">
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-stone-200 shadow-2xs">
              <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {tabs.map(tab => {
                  const isActive = tab.id === activeTab?.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTabId(tab.id)}
                      className={`px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                        isActive
                          ? 'bg-[#781d0d] text-white shadow-xs font-extrabold ring-2 ring-[#781d0d]/15'
                          : 'bg-stone-50/80 text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/60 font-medium'
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-stone-200/80 min-h-[450px]">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#781d0d] font-normal mb-8 pb-4 border-b border-stone-100">
                {activeTab?.label}
              </h2>
              {activeTab && renderTabContent(activeTab)}
            </div>
          </div>
        )}

        {/* Layout 2: Runny Page (continuous vertical long scroll with all sections) */}
        {normalizedLayout === 'runny_page' && (
          <div className="space-y-6">
            {/* Sticky Anchor Quick-Jump Header */}
            {showJumpStrip !== false && (
              <div className="sticky top-4 z-10 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-3 shrink-0">
                  Jump To:
                </span>
                {tabs.map(tab => (
                  <a
                    key={tab.id}
                    href={`#section-${tab.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`section-${tab.id}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-[#781d0d] hover:bg-stone-100 whitespace-nowrap transition-colors border border-transparent hover:border-stone-200"
                  >
                    {tab.label}
                  </a>
                ))}
              </div>
            )}

            {/* Continuous Running Sections */}
            <div className="space-y-8">
              {tabs.map(tab => (
                <section
                  key={tab.id}
                  id={`section-${tab.id}`}
                  className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-stone-200/80 scroll-mt-24 transition-all"
                >
                  <h2 className="text-2xl sm:text-3xl font-serif text-[#781d0d] font-normal mb-8 pb-4 border-b border-stone-100">
                    {tab.label}
                  </h2>
                  {renderTabContent(tab)}
                </section>
              ))}
            </div>
          </div>
        )}

        {/* Layout 3: Vertical Tabs (Classic College Sidebar on Left) */}
        {normalizedLayout === 'vertical_tabs' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Dark Red / College Themed Tabs Sidebar */}
            <div className="md:col-span-3">
              <div className="bg-[#781d0d] rounded-2xl overflow-hidden shadow-md">
                <nav className="divide-y divide-white/10">
                  {tabs.map(tab => {
                    const isActive = tab.id === activeTab?.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTabId(tab.id)}
                        className={`w-full text-left px-5 py-4 text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                          isActive
                            ? 'bg-[#5b1408] text-white pl-6 border-l-4 border-amber-400 font-extrabold'
                            : 'text-stone-200 hover:bg-[#6c190a] hover:text-white'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isActive ? 'text-amber-400 translate-x-1' : 'text-stone-400 group-hover:translate-x-0.5'
                          }`}
                        />
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Right Column: Tab Content Body (White Rounded Card) */}
            <div className="md:col-span-9">
              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-stone-200/80 min-h-[500px]">
                <h2 className="text-2xl sm:text-3xl font-serif text-[#781d0d] font-normal mb-8 pb-4 border-b border-stone-100">
                  {activeTab?.label}
                </h2>
                {activeTab && renderTabContent(activeTab)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

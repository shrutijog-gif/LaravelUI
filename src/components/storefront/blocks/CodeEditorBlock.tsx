import React, { useEffect, useRef } from 'react';
import { Code2, Sparkles, FileCode, Layers } from 'lucide-react';

export interface CodeEditorBlockProps {
  codeConfig?: {
    code?: string;
    editorHeight?: string;
    containerStyle?: 'default' | 'full' | 'card' | 'raw';
  };
  advancedConfig?: {
    anchorId?: string;
    className?: string;
  };
  // Fallbacks for direct props
  code?: string;
  containerStyle?: 'default' | 'full' | 'card' | 'raw';
  anchorId?: string;
  className?: string;
  isPreview?: boolean;
}

export const CodeEditorBlock: React.FC<CodeEditorBlockProps> = ({
  codeConfig,
  advancedConfig,
  code: directCode,
  containerStyle: directContainerStyle,
  anchorId: directAnchorId,
  className: directClassName,
  isPreview = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const rawCode = codeConfig?.code ?? directCode ?? '';
  const resolvedContainerStyle = codeConfig?.containerStyle ?? directContainerStyle ?? 'default';
  const resolvedAnchorId = advancedConfig?.anchorId ?? directAnchorId ?? '';
  const resolvedClassName = advancedConfig?.className ?? directClassName ?? '';

  // Execute embedded <script> tags when HTML content updates
  useEffect(() => {
    if (!containerRef.current || !rawCode) return;

    // Look for any <script> tags inside the container
    const scripts = containerRef.current.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [rawCode]);

  // Wrapper styling according to containerStyle option
  const getContainerWrapperClasses = () => {
    switch (resolvedContainerStyle) {
      case 'full':
        return 'w-full px-0 py-2';
      case 'card':
        return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-4 bg-white border border-gray-200/80 rounded-2xl shadow-sm';
      case 'raw':
        return 'w-full';
      case 'default':
      default:
        return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4';
    }
  };

  // If code is empty
  if (!rawCode.trim()) {
    return (
      <div 
        id={resolvedAnchorId || undefined} 
        className={`${getContainerWrapperClasses()} ${resolvedClassName}`}
      >
        <div className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-slate-50 rounded-2xl p-8 sm:p-12 text-center transition-all hover:border-blue-400 group">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <Code2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100/80 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>System Component • Code Editor</span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-1">
            HTML Code Editor Block
          </h3>
          <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            Write or paste custom HTML, CSS stylesheets, Google Maps, YouTube embeds, or interactive widgets using the inspector panel on the right.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={resolvedAnchorId || undefined} 
      className={`${getContainerWrapperClasses()} ${resolvedClassName}`}
    >
      <div 
        ref={containerRef}
        className="custom-html-content w-full overflow-hidden"
        dangerouslySetInnerHTML={{ __html: rawCode }}
      />
    </div>
  );
};

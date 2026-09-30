import React from 'react';

export interface RichTextBlockProps {
  content?: string;
  richTextConfig?: {
    content?: string;
  };
  advancedConfig?: {
    anchorId?: string;
    className?: string;
  };
  // Fallbacks
  anchorId?: string;
  className?: string;
}

export const RichTextBlock: React.FC<RichTextBlockProps> = ({
  content: directContent,
  richTextConfig,
  advancedConfig,
  anchorId: directAnchorId,
  className: directClassName,
}) => {
  const rawContent = richTextConfig?.content ?? directContent ?? '<p>Please Edit This</p>';
  const anchorId = advancedConfig?.anchorId ?? directAnchorId ?? '';
  const className = advancedConfig?.className ?? directClassName ?? '';

  return (
    <div 
      id={anchorId || undefined} 
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}
    >
      <div 
        className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800 leading-relaxed font-sans prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 prose-a:underline prose-img:rounded-2xl prose-img:shadow-md prose-table:border-collapse prose-th:border prose-th:border-gray-200 prose-td:border prose-td:border-gray-200 prose-th:p-3 prose-td:p-3"
        dangerouslySetInnerHTML={{ __html: rawContent }}
      />
    </div>
  );
};

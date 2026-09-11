import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Trash2, 
  ChevronDown, 
  FileCode
} from 'lucide-react';

export interface HtmlCodeEditorValue {
  code?: string;
  editorHeight?: string;
  containerStyle?: 'default' | 'full' | 'card' | 'raw';
}

interface HtmlCodeEditorFieldProps {
  value?: HtmlCodeEditorValue | string;
  onChange: (newValue: HtmlCodeEditorValue) => void;
}

const SAMPLE_TEMPLATES = [
  {
    name: '📢 Important Notice / Circular Alert',
    code: `<div style="padding: 1.25rem; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0.5rem; margin: 1rem 0; font-family: inherit;">
  <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
    <span style="font-size: 1.5rem; line-height: 1;">📢</span>
    <div>
      <h4 style="margin: 0; font-size: 1rem; font-weight: 700; color: #92400e;">Academic Examination Circular 2024-25</h4>
      <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #b45309; line-height: 1.4;">
        Semester End examination forms and timetable revisions have been released.
      </p>
    </div>
  </div>
</div>`,
  },
  {
    name: '🏆 NAAC Grade A++ Accreditation Card',
    code: `<div style="padding: 1.5rem; background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: #ffffff; border-radius: 0.75rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 1rem 0;">
  <div>
    <div style="font-size: 0.75rem; font-weight: 800; color: #34d399; text-transform: uppercase;">Accredited Cycle-3</div>
    <h3 style="margin: 0.25rem 0 0 0; font-size: 1.2rem; font-weight: 800; color: #ffffff;">NAAC Grade 'A++' (CGPA 3.68)</h3>
    <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: #d1fae5;">Recognized by UGC as College with Potential for Excellence</p>
  </div>
  <a href="#" style="padding: 0.5rem 1rem; background: #ffffff; color: #065f46; font-size: 0.75rem; font-weight: 700; border-radius: 0.375rem; text-decoration: none; text-transform: uppercase;">View Certificate</a>
</div>`,
  },
  {
    name: '🗺️ Google Maps Responsive Frame',
    code: `<div style="position: relative; width: 100%; padding-bottom: 45%; height: 0; overflow: hidden; border-radius: 0.75rem; border: 1px solid #e5e7eb; margin: 1rem 0;">
  <iframe 
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.504264669894!2d74.57723917519131!3d18.506109982585253!2m3!1f0!2f0!3f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc3440e6fa6e771%3A0x2a14e9f7823b1c67!2sVidya%20Pratishthan's%20Arts%2C%20Science%20and%20Commerce%20College!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
    allowfullscreen="" 
    loading="lazy">
  </iframe>
</div>`,
  },
  {
    name: '📊 University Statistics Highlights',
    code: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 1rem 0;">
  <div style="padding: 1.25rem; background: #1e3a8a; color: #ffffff; border-radius: 0.75rem; text-align: center;">
    <div style="font-size: 2rem; font-weight: 900; color: #93c5fd;">50+</div>
    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #bfdbfe; margin-top: 0.25rem;">Years of Legacy</div>
  </div>
  <div style="padding: 1.25rem; background: #047857; color: #ffffff; border-radius: 0.75rem; text-align: center;">
    <div style="font-size: 2rem; font-weight: 900; color: #a7f3d0;">12,500+</div>
    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #d1fae5; margin-top: 0.25rem;">Students</div>
  </div>
  <div style="padding: 1.25rem; background: #6b21a8; color: #ffffff; border-radius: 0.75rem; text-align: center;">
    <div style="font-size: 2rem; font-weight: 900; color: #e9d5ff;">98.4%</div>
    <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #f3e8ff; margin-top: 0.25rem;">Placements</div>
  </div>
</div>`,
  },
  {
    name: '🎬 YouTube Video Embed',
    code: `<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 0.75rem; margin: 1rem 0;">
  <iframe 
    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" 
    title="College Campus Video" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>`,
  },
];

export const HtmlCodeEditorField: React.FC<HtmlCodeEditorFieldProps> = ({
  value,
  onChange,
}) => {
  const parsedValue: HtmlCodeEditorValue = typeof value === 'string' 
    ? { code: value, editorHeight: '500px', containerStyle: 'default' } 
    : { code: value?.code ?? '', editorHeight: value?.editorHeight ?? '500px', containerStyle: value?.containerStyle ?? 'default' };

  const [code, setCode] = useState<string>(parsedValue.code || '');
  const [editorHeight, setEditorHeight] = useState<string>(parsedValue.editorHeight || '500px');
  const [containerStyle, setContainerStyle] = useState<'default' | 'full' | 'card' | 'raw'>(parsedValue.containerStyle || 'default');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isHeightDropdownOpen, setIsHeightDropdownOpen] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    const nextCode = typeof value === 'string' ? value : value?.code ?? '';
    const nextHeight = typeof value === 'object' ? value?.editorHeight ?? '500px' : '500px';
    const nextStyle = typeof value === 'object' ? value?.containerStyle ?? 'default' : 'default';
    setCode(nextCode);
    setEditorHeight(nextHeight);
    setContainerStyle(nextStyle);
  }, [value]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onChange({
      code: newCode,
      editorHeight,
      containerStyle,
    });
  };

  const handleHeightChange = (height: string) => {
    setEditorHeight(height);
    setIsHeightDropdownOpen(false);
    onChange({
      code,
      editorHeight: height,
      containerStyle,
    });
  };

  const handleApplyTemplate = (templateCode: string) => {
    handleCodeChange(templateCode);
    setIsTemplatesOpen(false);
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updatedCode = code.substring(0, start) + '  ' + code.substring(end);
      handleCodeChange(updatedCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const linesCount = Math.max(1, (code ? code.split('\n').length : 1));
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  const heightOptions = ['300px', '400px', '500px', '600px', '700px', '800px', 'auto'];

  return (
    <div className="space-y-2">
      {/* 1. Top Breadcrumb & Expand Header (Page > Code Editor) */}
      <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg flex items-center justify-between text-xs select-none shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-blue-600 hover:underline cursor-pointer">Page</span>
          <span className="text-gray-400 font-normal">›</span>
          <span className="text-gray-900 font-bold">Code Editor</span>
        </div>

        {/* Fullscreen / Expand Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. HTML Code Editor Accordion Container */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
        {/* Accordion Header (Matching exact screenshot styling: "HTML Code Editor" on left, "500px —" on right) */}
        <div className="w-full bg-[#f3f4f6] px-3.5 py-2.5 border-b border-gray-200 flex items-center justify-between select-none">
          <span className="text-xs font-semibold text-gray-800 tracking-tight">
            HTML Code Editor
          </span>

          <div className="flex items-center gap-2.5 text-xs text-gray-500 font-mono relative">
            {/* Height Selector / Indicator: e.g. "500px" */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsHeightDropdownOpen(!isHeightDropdownOpen)}
                className="text-[11px] text-gray-500 font-mono hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-0.5"
                title="Click to change editor height"
              >
                <span>{editorHeight}</span>
              </button>

              {isHeightDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsHeightDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-1 w-28 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-40">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      Editor Height
                    </div>
                    {heightOptions.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleHeightChange(h)}
                        className={`w-full px-2.5 py-1 text-left text-xs font-mono transition-colors cursor-pointer ${
                          editorHeight === h 
                            ? 'bg-blue-50 text-blue-700 font-bold' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Minus / Collapse Button: "—" */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer text-sm font-bold leading-none px-0.5"
              title={isExpanded ? 'Collapse Code Editor' : 'Expand Code Editor'}
            >
              {isExpanded ? '—' : '+'}
            </button>
          </div>
        </div>

        {/* Expanded Editor Body */}
      {isExpanded && (
        <div className="bg-white flex flex-col">
          {/* Code Editor Body */}
          <div 
            className="relative flex bg-white font-mono text-[13px] overflow-hidden"
            style={{ 
              height: editorHeight === 'auto' ? '500px' : editorHeight,
              minHeight: '200px',
            }}
          >
            {/* Line Numbers Gutter */}
            <div
              ref={gutterRef}
              className="w-8 bg-white text-gray-400 py-2.5 text-right pr-2 select-none border-r border-gray-200 overflow-hidden text-[13px] font-mono leading-6 shrink-0"
            >
              {lineNumbers.map((num) => (
                <div key={num} className="leading-6">
                  {num}
                </div>
              ))}
            </div>

            {/* Code Input Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              spellCheck={false}
              placeholder=""
              className="flex-1 w-full bg-white text-gray-900 py-2.5 px-2.5 outline-none resize-none overflow-auto font-mono text-[13px] leading-6 whitespace-pre"
              style={{
                tabSize: 2,
              }}
            />
          </div>
        </div>
      )}
      </div>

      {/* 3. Fullscreen Code Editor Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex flex-col p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
            {/* Fullscreen Header */}
            <div className="px-5 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">HTML Code Editor (Fullscreen)</h3>
                  <p className="text-xs text-gray-500">Edit custom HTML, inline CSS, or interactive widgets</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </div>
            </div>

            {/* Fullscreen Editor Body */}
            <div className="flex-1 flex bg-white overflow-hidden font-mono">
              <div className="w-12 bg-gray-50 text-gray-400 py-3 text-right pr-3 select-none shrink-0 border-r border-gray-200 overflow-hidden text-xs font-mono leading-6">
                {lineNumbers.map((num) => (
                  <div key={num}>{num}</div>
                ))}
              </div>

              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                placeholder=""
                className="flex-1 w-full bg-white text-gray-900 p-3 outline-none resize-none overflow-auto font-mono text-sm leading-6"
                style={{ tabSize: 2 }}
              />
            </div>

            {/* Fullscreen Footer */}
            <div className="px-5 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 font-mono">
              <span>{linesCount} lines • {code.length} characters</span>
              <span>Press Done to save</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

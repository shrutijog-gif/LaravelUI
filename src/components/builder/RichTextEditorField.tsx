import React, { useState, useRef, useEffect } from 'react';
import { 
  Undo, 
  Redo, 
  Code, 
  Bold, 
  Italic, 
  Underline, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Table, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Maximize2, 
  Minimize2,
  ChevronDown,
  Quote,
  Sparkles,
  Type,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';

interface RichTextEditorFieldProps {
  value?: string | { content?: string };
  onChange: (newValue: any) => void;
}

export const RichTextEditorField: React.FC<RichTextEditorFieldProps> = ({
  value,
  onChange,
}) => {
  const initialContent = typeof value === 'string' 
    ? value 
    : (typeof value === 'object' && value?.content !== undefined ? value.content : '<p>Please Edit This</p>');

  const [content, setContent] = useState<string>(initialContent || '<p>Please Edit This</p>');
  const [isSourceMode, setIsSourceMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdateRef = useRef<boolean>(false);

  // Sync state when external value changes
  useEffect(() => {
    const nextContent = typeof value === 'string' 
      ? value 
      : (typeof value === 'object' && value?.content !== undefined ? value.content : '<p>Please Edit This</p>');
    
    if (nextContent !== content && !isInternalUpdateRef.current) {
      setContent(nextContent || '<p>Please Edit This</p>');
      if (editorRef.current && !isSourceMode) {
        editorRef.current.innerHTML = nextContent || '<p>Please Edit This</p>';
      }
    }
    isInternalUpdateRef.current = false;
  }, [value, isSourceMode]);

  // Execute formatting command on contentEditable
  const executeCommand = (command: string, value: string = '') => {
    if (isSourceMode) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      isInternalUpdateRef.current = true;
      setContent(html);
      onChange(typeof value === 'object' ? { content: html } : html);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      isInternalUpdateRef.current = true;
      setContent(html);
      onChange(typeof value === 'object' ? { content: html } : html);
    }
  };

  const handleSourceChange = (newHtml: string) => {
    setContent(newHtml);
    isInternalUpdateRef.current = true;
    onChange(typeof value === 'object' ? { content: newHtml } : newHtml);
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #e2e8f0;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-weight: 600;">Header 1</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-weight: 600;">Header 2</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-weight: 600;">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Data 1</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Data 2</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Data 3</td>
          </tr>
        </tbody>
      </table>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter the link URL:', 'https://');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter Image URL:', 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden my-1 bg-white shadow-2xs">
      {/* 1. Top Breadcrumb & Expand Header (Page > Rich Text) */}
      <div className="bg-white px-3 py-2 border-b border-gray-200 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-blue-600 hover:underline cursor-pointer">Page</span>
          <span className="text-gray-400 font-normal">›</span>
          <span className="text-gray-900 font-bold">Rich Text</span>
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

      {/* 2. Editor Menu Bar (Edit, View, Insert, Format, Help) */}
      <div className="bg-[#fafafa] px-2.5 py-1 border-b border-gray-200 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-0.5 text-gray-700 font-medium">
          {['Edit', 'View', 'Insert', 'Format', 'Help'].map((menuItem) => (
            <div key={menuItem} className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === menuItem ? null : menuItem)}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  activeMenu === menuItem ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-200/80 text-gray-700'
                }`}
              >
                {menuItem}
              </button>

              {activeMenu === menuItem && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)} />
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                    {menuItem === 'Edit' && (
                      <>
                        <button type="button" onClick={() => { executeCommand('undo'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 flex items-center justify-between">
                          <span>Undo</span><span className="text-gray-400 text-[10px]">Ctrl+Z</span>
                        </button>
                        <button type="button" onClick={() => { executeCommand('redo'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 flex items-center justify-between">
                          <span>Redo</span><span className="text-gray-400 text-[10px]">Ctrl+Y</span>
                        </button>
                        <button type="button" onClick={() => { executeCommand('selectAll'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 flex items-center justify-between border-t border-gray-100">
                          <span>Select All</span><span className="text-gray-400 text-[10px]">Ctrl+A</span>
                        </button>
                      </>
                    )}
                    {menuItem === 'View' && (
                      <>
                        <button type="button" onClick={() => { setIsSourceMode(!isSourceMode); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 flex items-center justify-between">
                          <span>{isSourceMode ? 'WYSIWYG View' : 'Source Code'}</span>
                        </button>
                        <button type="button" onClick={() => { setIsFullscreen(true); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 flex items-center justify-between">
                          <span>Fullscreen</span>
                        </button>
                      </>
                    )}
                    {menuItem === 'Insert' && (
                      <>
                        <button type="button" onClick={() => { handleInsertLink(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50">Insert Link</button>
                        <button type="button" onClick={() => { handleInsertImage(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50">Insert Image</button>
                        <button type="button" onClick={() => { handleInsertTable(); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50">Insert Table</button>
                        <button type="button" onClick={() => { executeCommand('insertHorizontalRule'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 border-t border-gray-100">Horizontal Line</button>
                      </>
                    )}
                    {menuItem === 'Format' && (
                      <>
                        <button type="button" onClick={() => { executeCommand('bold'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 font-bold">Bold</button>
                        <button type="button" onClick={() => { executeCommand('italic'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 italic">Italic</button>
                        <button type="button" onClick={() => { executeCommand('underline'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 underline">Underline</button>
                        <button type="button" onClick={() => { executeCommand('removeFormat'); setActiveMenu(null); }} className="w-full px-3 py-1.5 text-left hover:bg-blue-50 border-t border-gray-100 text-gray-500">Clear Formatting</button>
                      </>
                    )}
                    {menuItem === 'Help' && (
                      <div className="px-3 py-2 text-xs text-gray-500 leading-relaxed">
                        Full WYSIWYG Rich Text editor. Use toolbar buttons or keyboard shortcuts to format text.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Formatting Toolbar Row (Matches Screenshot Icon Strip) */}
      <div className="bg-white px-2.5 py-1.5 border-b border-gray-200 flex flex-wrap items-center gap-1 text-gray-700 text-xs select-none">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => executeCommand('undo')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600 hover:text-black transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('redo')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-600 hover:text-black transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        {/* Source Code Toggle */}
        <button
          type="button"
          onClick={() => setIsSourceMode(!isSourceMode)}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer font-medium ${
            isSourceMode ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Toggle HTML Source View"
        >
          <Code className="w-3.5 h-3.5" />
          <span className="text-[11px]">Source</span>
        </button>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        {/* Heading Dropdown / Pill */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              executeCommand('formatBlock', `<${e.target.value}>`);
              e.target.value = '';
            }
          }}
          defaultValue=""
          className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-bold px-1.5 py-0.5 rounded text-[11px] outline-none cursor-pointer"
          title="Paragraph / Heading Format"
        >
          <option value="" disabled>H1 ▼</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code / Pre</option>
        </select>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        {/* Bold, Italic */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 px-2 hover:bg-gray-200 rounded font-black text-gray-800 transition-colors cursor-pointer text-xs"
          title="Bold (Ctrl+B)"
        >
          <span className="font-extrabold text-sm">B</span>
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 px-2 hover:bg-gray-200 rounded italic text-gray-800 transition-colors cursor-pointer text-xs"
          title="Italic (Ctrl+I)"
        >
          <span className="italic font-serif font-bold text-sm">I</span>
        </button>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        {/* Link, Image, Table */}
        <button
          type="button"
          onClick={handleInsertLink}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
          title="Insert Link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleInsertImage}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
          title="Insert Image"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleInsertTable}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
          title="Insert Table"
        >
          <Table className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors cursor-pointer"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors cursor-pointer"
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors cursor-pointer"
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors cursor-pointer"
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors cursor-pointer"
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Editor Body Area (White Background, Matching Screenshot) */}
      <div className="bg-white p-4">
        {isSourceMode ? (
          <textarea
            value={content}
            onChange={(e) => handleSourceChange(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[350px] p-3 font-mono text-xs text-gray-900 bg-gray-50 border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:bg-white resize-y"
            placeholder="<p>Please Edit This</p>"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            dangerouslySetInnerHTML={{ __html: content }}
            className="min-h-[350px] outline-none text-sm text-gray-900 leading-relaxed font-sans focus:ring-0 prose prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl"
            style={{ minHeight: '350px' }}
          />
        )}
      </div>

      {/* 4. Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-xs flex flex-col p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-5 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Rich Text Editor (Fullscreen)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* Editor body */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div
                contentEditable
                onInput={handleEditorInput}
                dangerouslySetInnerHTML={{ __html: content }}
                className="min-h-full outline-none text-base text-gray-900 leading-relaxed font-sans prose max-w-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

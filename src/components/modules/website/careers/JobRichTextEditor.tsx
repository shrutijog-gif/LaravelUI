import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';

import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent,
  Link2, Highlighter, Palette,
  Undo2, Redo2, Minus,
  ChevronDown,
} from 'lucide-react';

interface JobRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────
const ToolBtn: React.FC<{
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, active, title, disabled, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={`flex items-center justify-center w-7 h-7 rounded transition-all text-xs
      ${active
        ? 'bg-blue-100 text-blue-700 border border-blue-300'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
      }
      ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {children}
  </button>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => <div className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />;

// ─── Heading Select ───────────────────────────────────────────────────────────
const HeadingSelect: React.FC<{ editor: ReturnType<typeof useEditor> }> = ({ editor }) => {
  if (!editor) return null;

  const getCurrentLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    if (editor.isActive('heading', { level: 5 })) return 'Heading 5';
    return 'Paragraph';
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        className="flex items-center gap-1 px-2 h-7 rounded border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors min-w-[96px] justify-between"
      >
        <span>{getCurrentLabel()}</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      <div className="absolute left-0 top-full mt-0.5 z-50 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[140px]">
        {[
          { label: 'Paragraph', action: () => editor.chain().focus().setParagraph().run() },
          { label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
          { label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
          { label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
          { label: 'Heading 4', action: () => editor.chain().focus().toggleHeading({ level: 4 }).run() },
          { label: 'Heading 5', action: () => editor.chain().focus().toggleHeading({ level: 5 }).run() },
        ].map(({ label, action }) => (
          <button
            key={label}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); action(); }}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Main Editor ──────────────────────────────────────────────────────────────
export const JobRichTextEditor: React.FC<JobRichTextEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'Enter detailed job overview, responsibilities, eligibility requirements…',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'job-rte-content focus:outline-none p-4 text-sm text-gray-800 leading-relaxed',
      },
    },
  });

  // Sync external value changes (when drawer resets/loads a job)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* ── Toolbar Row 1 ── */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex flex-wrap items-center gap-1">
        {/* Undo / Redo */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}>
          <Undo2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}>
          <Redo2 className="w-3.5 h-3.5" />
        </ToolBtn>

        <Divider />

        {/* Heading select */}
        <HeadingSelect editor={editor} />

        <Divider />

        {/* Bold / Italic / Underline */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>

        <Divider />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <AlignJustify className="w-3.5 h-3.5" />
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>

        <Divider />

        {/* Indent / Outdent */}
        <ToolBtn onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Indent" disabled={!editor.can().sinkListItem('listItem')}>
          <Indent className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Outdent" disabled={!editor.can().liftListItem('listItem')}>
          <Outdent className="w-3.5 h-3.5" />
        </ToolBtn>

        <Divider />

        {/* Link */}
        <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Insert Link">
          <Link2 className="w-3.5 h-3.5" />
        </ToolBtn>

        <Divider />

        {/* Highlight */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} active={editor.isActive('highlight')} title="Highlight">
          <Highlighter className="w-3.5 h-3.5" />
        </ToolBtn>

        {/* Horizontal Rule */}
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>

        <Divider />

        {/* Text Color */}
        <div className="relative flex items-center" title="Text Color">
          <label className="flex items-center justify-center w-7 h-7 rounded border border-transparent hover:bg-gray-100 cursor-pointer transition-colors">
            <Palette className="w-3.5 h-3.5 text-gray-600" />
            <input
              type="color"
              className="absolute opacity-0 w-0 h-0"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              title="Text Color"
            />
          </label>
        </div>
      </div>

      {/* ── Editor Content ── */}
      <EditorContent editor={editor} />
    </div>
  );
};

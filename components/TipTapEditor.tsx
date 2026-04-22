'use client';

import './TipTapEditor.css';
import { useEffect, useRef, useState } from 'react';
import { Tiptap, useEditor, useTiptap, useTiptapState } from '@tiptap/react';
import type { Editor, Extensions } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import {
  BackgroundColor,
  Color,
  FontSize,
  TextStyle,
} from '@tiptap/extension-text-style';
import { ResizableImage } from '@/lib/resizable-image-extension';
import { Link } from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TableKit } from '@tiptap/extension-table';
import {
  ExtendedTable,
  ExtendedTableCell,
  ExtendedTableHeader,
} from '@/lib/table-extensions';
import { ResizableVideoExtensions } from '@/lib/resizable-video-extensions';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  Video,
  List,
  ListOrdered,
  Palette,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// ─── Public style tokens ──────────────────────────────────────────────────────
// Re-exported so custom toolbar buttons look consistent with built-in ones.
export const toolbarBtn =
  'rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-600 dark:hover:text-neutral-100';
export const toolbarBtnActive =
  'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100';
export const toolbarSeparator =
  'mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-600';

// ─── Built-in extension bundles ───────────────────────────────────────────────
// Exported so consumers can spread them into their own extension arrays.
export const MINIMAL_EXTENSIONS: Extensions = [
  StarterKit.configure({ link: false }),
  Link.extend({ inclusive: false }).configure({
    openOnClick: false,
    HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
  }),
];

export const FULL_EXTENSIONS: Extensions = [
  StarterKit.configure({ link: false }),
  TextStyle,
  FontSize,
  Color,
  BackgroundColor,
  Link.extend({ inclusive: false }).configure({
    openOnClick: false,
    HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
  }),
  ResizableImage,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TableKit.configure({
    table: false,
    tableCell: false,
    tableHeader: false,
  }),
  ExtendedTable.configure({ resizable: true }),
  ExtendedTableCell,
  ExtendedTableHeader,
  ...ResizableVideoExtensions,
];

// ─── Internal helpers ─────────────────────────────────────────────────────────

type VideoChain = {
  setYoutubeVideo: (o: { src: string; width?: number; height?: number }) => { run: () => boolean };
  setVimeoVideo: (o: { src: string; width?: number; height?: number }) => { run: () => boolean };
  setTiktokVideo: (o: { src: string; width?: number; height?: number }) => { run: () => boolean };
  setFacebookVideo: (o: { src: string; width?: number; height?: number }) => { run: () => boolean };
};

const BLOCK_OPTIONS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: '1', label: 'Heading 1' },
  { value: '2', label: 'Heading 2' },
  { value: '3', label: 'Heading 3' },
  { value: '4', label: 'Heading 4' },
  { value: '5', label: 'Heading 5' },
  { value: '6', label: 'Heading 6' },
] as const;

const FONT_SIZE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: '12', label: '12 px' },
  { value: '14', label: '14 px' },
  { value: '16', label: '16 px' },
  { value: '20', label: '20 px' },
  { value: '24', label: '24 px' },
  { value: '28', label: '28 px' },
  { value: '32', label: '32 px' },
  { value: '36', label: '36 px' },
  { value: '40', label: '40 px' },
] as const;

const selectClass =
  'rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-neutral-500';

// Keep internal shorthands
const btn = toolbarBtn;
const btnActive = toolbarBtnActive;

// ─── Minimal toolbar ──────────────────────────────────────────────────────────

function MinimalToolbar({
  disabled,
  toolbarEnd,
}: {
  disabled?: boolean;
  toolbarEnd?: React.ReactNode;
}) {
  const { editor } = useTiptap();
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    if (linkPopoverOpen && editor) {
      setUrlInput((editor.getAttributes('link').href as string) || '');
    }
  }, [linkPopoverOpen, editor]);

  const normalizeUrl = (url: string) => {
    const t = url.trim();
    if (!t) return '';
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(t)) return t;
    return `https://${t}`;
  };

  if (!editor) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-neutral-200 bg-neutral-50 p-1.5 dark:border-neutral-700 dark:bg-neutral-800',
        disabled && 'pointer-events-none opacity-60'
      )}
    >
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`${btn} ${editor.isActive('bold') ? btnActive : ''}`} aria-pressed={editor.isActive('bold')} aria-label="Bold">
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btn} ${editor.isActive('italic') ? btnActive : ''}`} aria-pressed={editor.isActive('italic')} aria-label="Italic">
        <Italic className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`${btn} ${editor.isActive('strike') ? btnActive : ''}`} aria-pressed={editor.isActive('strike')} aria-label="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btn} ${editor.isActive('underline') ? btnActive : ''}`} aria-pressed={editor.isActive('underline')} aria-label="Underline">
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <span className={toolbarSeparator} aria-hidden />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btn} ${editor.isActive('bulletList') ? btnActive : ''}`} aria-pressed={editor.isActive('bulletList')} aria-label="Bullet list">
        <List className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btn} ${editor.isActive('orderedList') ? btnActive : ''}`} aria-pressed={editor.isActive('orderedList')} aria-label="Numbered list">
        <ListOrdered className="h-4 w-4" />
      </button>
      <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={`${btn} ${editor.isActive('link') ? btnActive : ''}`} aria-pressed={editor.isActive('link')} aria-label="Link">
            <Link2 className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-700 dark:bg-neutral-900" align="start" sideOffset={4}>
          <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com" className="mb-2 w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-neutral-500" aria-label="Link URL" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { const href = normalizeUrl(urlInput); if (href) editor.chain().focus().setLink({ href }).run(); setLinkPopoverOpen(false); }} className="rounded border border-neutral-200 bg-neutral-100 px-2 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600">Apply</button>
            {editor.isActive('link') && <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkPopoverOpen(false); }} className="rounded border border-neutral-200 bg-transparent px-2 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800">Remove link</button>}
          </div>
        </PopoverContent>
      </Popover>
      {toolbarEnd && (
        <>
          <span className={cn(toolbarSeparator, 'ml-auto')} aria-hidden />
          {toolbarEnd}
        </>
      )}
    </div>
  );
}

// ─── Full toolbar ─────────────────────────────────────────────────────────────

function FullToolbar({
  disabled,
  showRawHtml,
  onToggleHtmlView,
  toolbarEnd,
}: {
  disabled?: boolean;
  showRawHtml?: boolean;
  onToggleHtmlView?: () => void;
  toolbarEnd?: React.ReactNode;
}) {
  const { editor } = useTiptap();
  const blockValue = useTiptapState(
    (state) => {
      if (!state.editor) return 'paragraph';
      const ed = state.editor;
      if (ed.isActive('paragraph')) return 'paragraph';
      const level = [1, 2, 3, 4, 5, 6].find((l) => ed.isActive('heading', { level: l }));
      return level != null ? String(level) : 'paragraph';
    },
    (a, b) => a === b
  );
  const fontSizeValue = useTiptapState(
    (state) => {
      if (!state.editor) return 'default';
      const fontSize = state.editor.getAttributes('textStyle').fontSize;
      if (!fontSize || typeof fontSize !== 'string') return 'default';
      const match = fontSize.match(/^(\d+)px$/);
      const num = match ? match[1] : null;
      return num && FONT_SIZE_OPTIONS.some((o) => o.value === num) ? num : 'default';
    },
    (a, b) => a === b
  );
  const strikeUnderlineState = useTiptapState(
    (state) => {
      if (!state.editor) return { strike: false, underline: false };
      return { strike: state.editor.isActive('strike'), underline: state.editor.isActive('underline') };
    },
    (a, b) => a?.strike === b?.strike && a?.underline === b?.underline
  );
  const linkState = useTiptapState(
    (state) => {
      if (!state.editor) return { isActive: false, href: '' };
      return { isActive: state.editor.isActive('link'), href: (state.editor.getAttributes('link').href as string) || '' };
    },
    (a, b) => a?.isActive === b?.isActive && a?.href === b?.href
  );
  const listState = useTiptapState(
    (state) => {
      if (!state.editor) return { bulletList: false, orderedList: false };
      return { bulletList: state.editor.isActive('bulletList'), orderedList: state.editor.isActive('orderedList') };
    },
    (a, b) => a?.bulletList === b?.bulletList && a?.orderedList === b?.orderedList
  );
  const isInTable = useTiptapState((state) => (state.editor ? state.editor.isActive('table') : false), (a, b) => a === b);
  const cellAttrs = useTiptapState(
    (state) => {
      if (!state.editor) return { backgroundColor: '', textAlign: '' };
      const fromCell = state.editor.getAttributes('tableCell');
      const fromHeader = state.editor.getAttributes('tableHeader');
      const attrs = { ...fromCell, ...fromHeader };
      return { backgroundColor: (attrs.backgroundColor as string) || '', textAlign: (attrs.textAlign as string) || '' };
    },
    (a, b) => a?.backgroundColor === b?.backgroundColor && a?.textAlign === b?.textAlign
  );
  const textAlignValue = useTiptapState(
    (state) => {
      if (!state.editor) return null;
      const p = state.editor.getAttributes('paragraph').textAlign as string | undefined;
      const h = state.editor.getAttributes('heading').textAlign as string | undefined;
      return p ?? h ?? null;
    },
    (a, b) => a === b
  );
  const colorState = useTiptapState(
    (state) => {
      if (!state.editor) return { color: '', backgroundColor: '' };
      const attrs = state.editor.getAttributes('textStyle');
      return { color: (attrs.color as string) || '', backgroundColor: (attrs.backgroundColor as string) || '' };
    },
    (a, b) => a?.color === b?.color && a?.backgroundColor === b?.backgroundColor
  );

  const toHexForInput = (val: string) => (/^#[0-9A-Fa-f]{6}$/.test(val) ? val : '#000000');

  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [tablePopoverOpen, setTablePopoverOpen] = useState(false);
  const [tableOptionsPopoverOpen, setTableOptionsPopoverOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableWithHeaderRow, setTableWithHeaderRow] = useState(true);
  const [cellColorPopoverOpen, setCellColorPopoverOpen] = useState(false);
  const [cellColorInput, setCellColorInput] = useState('#ffffff');
  const [textColorPopoverOpen, setTextColorPopoverOpen] = useState(false);
  const [bgColorPopoverOpen, setBgColorPopoverOpen] = useState(false);
  const [textColorInput, setTextColorInput] = useState('#000000');
  const [bgColorInput, setBgColorInput] = useState('#ffff00');
  const [urlInput, setUrlInput] = useState('');
  const [videoPopoverOpen, setVideoPopoverOpen] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoWidth, setVideoWidth] = useState(640);
  const [videoHeight, setVideoHeight] = useState(480);

  useEffect(() => { if (textColorPopoverOpen) setTextColorInput(toHexForInput(colorState.color || '#000000')); }, [textColorPopoverOpen, colorState.color]);
  useEffect(() => { if (bgColorPopoverOpen) setBgColorInput(toHexForInput(colorState.backgroundColor || '#ffff00')); }, [bgColorPopoverOpen, colorState.backgroundColor]);
  useEffect(() => { if (linkPopoverOpen) setUrlInput(linkState.href); }, [linkPopoverOpen, linkState.href]);
  useEffect(() => { if (imagePopoverOpen) setImageUrlInput(''); }, [imagePopoverOpen]);
  useEffect(() => { if (videoPopoverOpen) { setVideoUrlInput(''); setVideoWidth(640); setVideoHeight(480); } }, [videoPopoverOpen]);
  useEffect(() => { if (cellColorPopoverOpen) setCellColorInput(toHexForInput(cellAttrs.backgroundColor || '#ffffff')); }, [cellColorPopoverOpen, cellAttrs.backgroundColor]);

  const imageActive = useTiptapState((state) => (state.editor ? state.editor.isActive('image') : false), (a, b) => a === b);

  const normalizeUrl = (url: string) => {
    const t = url.trim();
    if (!t) return '';
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(t)) return t;
    return `https://${t}`;
  };

  const getVideoProvider = (url: string): 'youtube' | 'vimeo' | 'tiktok' | 'facebook' | null => {
    const u = url.trim().toLowerCase();
    if (/youtube\.com|youtu\.be/.test(u)) return 'youtube';
    if (/vimeo\.com/.test(u)) return 'vimeo';
    if (/tiktok\.com/.test(u)) return 'tiktok';
    if (/facebook\.com/.test(u)) return 'facebook';
    return null;
  };

  const insertVideo = () => {
    if (!editor) return;
    const url = normalizeUrl(videoUrlInput);
    if (!url) return;
    const provider = getVideoProvider(url);
    if (!provider) return;
    const opts = { src: url, width: videoWidth, height: videoHeight };
    const ch = (editor as unknown as { chain: () => { focus: () => VideoChain } }).chain().focus();
    if (provider === 'youtube') ch.setYoutubeVideo(opts).run();
    else if (provider === 'vimeo') ch.setVimeoVideo(opts).run();
    else if (provider === 'tiktok') ch.setTiktokVideo(opts).run();
    else if (provider === 'facebook') ch.setFacebookVideo(opts).run();
    setVideoPopoverOpen(false);
    setVideoUrlInput('');
  };

  if (!editor) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-neutral-200 bg-neutral-50 p-1.5 dark:border-neutral-700 dark:bg-neutral-800', disabled && 'pointer-events-none opacity-60')}>
      <select value={blockValue} onChange={(e) => { const v = e.target.value; if (v === 'paragraph') { editor.chain().focus().setParagraph().run(); } else { editor.chain().focus().toggleHeading({ level: Number(v) as 1 | 2 | 3 | 4 | 5 | 6 }).run(); } }} className={selectClass} aria-label="Block format">
        {BLOCK_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <select value={fontSizeValue} onChange={(e) => { const v = e.target.value; if (v === 'default') { editor.chain().focus().unsetFontSize().run(); } else { editor.chain().focus().setFontSize(`${v}px`).run(); } }} className={selectClass} aria-label="Font size">
        {FONT_SIZE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <span className={toolbarSeparator} aria-hidden />
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`${btn} ${editor.isActive('bold') ? btnActive : ''}`} aria-pressed={editor.isActive('bold')} aria-label="Bold"><Bold className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btn} ${editor.isActive('italic') ? btnActive : ''}`} aria-pressed={editor.isActive('italic')} aria-label="Italic"><Italic className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`${btn} ${strikeUnderlineState.strike ? btnActive : ''}`} aria-pressed={strikeUnderlineState.strike} aria-label="Strikethrough"><Strikethrough className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btn} ${strikeUnderlineState.underline ? btnActive : ''}`} aria-pressed={strikeUnderlineState.underline} aria-label="Underline"><UnderlineIcon className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} className={btn} aria-label="Clear formatting"><Eraser className="h-4 w-4" /></button>
      {/* Link */}
      <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={`${btn} ${linkState.isActive ? btnActive : ''}`} aria-pressed={linkState.isActive} aria-label="Link"><Link2 className="h-4 w-4" /></button>
        </PopoverTrigger>
        <PopoverContent className="w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-700 dark:bg-neutral-900" align="start" sideOffset={4}>
          <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://example.com" className="mb-2 w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-neutral-500" aria-label="Link URL" />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { const href = normalizeUrl(urlInput); if (href) editor.chain().focus().setLink({ href }).run(); setLinkPopoverOpen(false); }} className="rounded border border-neutral-200 bg-neutral-100 px-2 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600">Apply</button>
            {linkState.isActive && <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkPopoverOpen(false); }} className="rounded border border-neutral-200 bg-transparent px-2 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800">Remove link</button>}
          </div>
        </PopoverContent>
      </Popover>
      {/* Image */}
      <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={`${btn} ${imageActive ? btnActive : ''}`} aria-pressed={imageActive} aria-label="Image"><ImageIcon className="h-4 w-4" /></button>
        </PopoverTrigger>
        <PopoverContent className="w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-700 dark:bg-neutral-900" align="start" sideOffset={4}>
          <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">Image URL</p>
          <input type="url" value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="https://example.com/image.png" className="mb-2 w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-neutral-500" aria-label="Image URL" />
          <button type="button" onClick={() => { const url = normalizeUrl(imageUrlInput); if (url) { editor.chain().focus().setImage({ src: url }).run(); setImagePopoverOpen(false); setImageUrlInput(''); } }} className="w-full rounded border border-neutral-200 bg-neutral-100 px-2 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600">Apply</button>
        </PopoverContent>
      </Popover>
      {/* Video */}
      <Popover open={videoPopoverOpen} onOpenChange={setVideoPopoverOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={btn} aria-label="Video"><Video className="h-4 w-4" /></button>
        </PopoverTrigger>
        <PopoverContent className="w-72 rounded-md border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-700 dark:bg-neutral-900" align="start" sideOffset={4}>
          <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">Video URL (YouTube, Vimeo, TikTok, Facebook)</p>
          <input type="url" value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="mb-2 w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-neutral-500" aria-label="Video URL" />
          <div className="mb-2 flex items-center gap-2">
            <label className="min-w-[3.5rem] text-xs text-neutral-600 dark:text-neutral-400">Width</label>
            <input type="number" value={videoWidth} onChange={(e) => setVideoWidth(Number(e.target.value))} className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-neutral-500" aria-label="Video width" />
          </div>
          <div className="mb-3 flex items-center gap-2">
            <label className="min-w-[3.5rem] text-xs text-neutral-600 dark:text-neutral-400">Height</label>
            <input type="number" value={videoHeight} onChange={(e) => setVideoHeight(Number(e.target.value))} className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-neutral-500" aria-label="Video height" />
          </div>
          <button type="button" onClick={insertVideo} disabled={!normalizeUrl(videoUrlInput) || !getVideoProvider(normalizeUrl(videoUrlInput))} className="w-full rounded border border-neutral-200 bg-neutral-100 px-2 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600">Insert video</button>
        </PopoverContent>
      </Popover>
      <span className={toolbarSeparator} aria-hidden />
      {/* Alignment */}
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`${btn} ${textAlignValue === 'left' ? btnActive : ''}`} aria-pressed={textAlignValue === 'left'} aria-label="Align left"><AlignLeft className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`${btn} ${textAlignValue === 'center' ? btnActive : ''}`} aria-pressed={textAlignValue === 'center'} aria-label="Align center"><AlignCenter className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`${btn} ${textAlignValue === 'right' ? btnActive : ''}`} aria-pressed={textAlignValue === 'right'} aria-label="Align right"><AlignRight className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`${btn} ${textAlignValue === 'justify' ? btnActive : ''}`} aria-pressed={textAlignValue === 'justify'} aria-label="Justify"><AlignJustify className="h-4 w-4" /></button>
      <span className={toolbarSeparator} aria-hidden />
      {/* Lists */}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btn} ${listState.bulletList ? btnActive : ''}`} aria-pressed={listState.bulletList} aria-label="Bullet list"><List className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btn} ${listState.orderedList ? btnActive : ''}`} aria-pressed={listState.orderedList} aria-label="Numbered list"><ListOrdered className="h-4 w-4" /></button>
      {/* Table insert */}
      <Popover open={tablePopoverOpen} onOpenChange={setTablePopoverOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={btn} aria-label="Insert table"><Table2 className="h-4 w-4" /></button>
        </PopoverTrigger>
        <PopoverContent className="w-56 rounded-md border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-700 dark:bg-neutral-900" align="start" sideOffset={4}>
          <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">Insert table</p>
          <div className="mb-2 flex items-center gap-2">
            <label htmlFor="table-rows" className="min-w-[3rem] text-sm text-neutral-700 dark:text-neutral-300">Rows</label>
            <input id="table-rows" type="number" min={1} max={20} value={tableRows} onChange={(e) => setTableRows(Math.min(20, Math.max(1, Number(e.target.value) || 1)))} className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-neutral-500" />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <label htmlFor="table-cols" className="min-w-[3rem] text-sm text-neutral-700 dark:text-neutral-300">Cols</label>
            <input id="table-cols" type="number" min={1} max={20} value={tableCols} onChange={(e) => setTableCols(Math.min(20, Math.max(1, Number(e.target.value) || 1)))} className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:ring-neutral-500" />
          </div>
          <div className="mb-3 flex items-center gap-2">
            <input id="table-header-row" type="checkbox" checked={tableWithHeaderRow} onChange={(e) => setTableWithHeaderRow(e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-neutral-600 focus:ring-neutral-400 dark:border-neutral-600 dark:bg-neutral-800 dark:focus:ring-neutral-500" />
            <label htmlFor="table-header-row" className="text-sm text-neutral-700 dark:text-neutral-300">Header row</label>
          </div>
          <button type="button" onClick={() => { editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: tableWithHeaderRow }).run(); setTablePopoverOpen(false); }} className="w-full rounded border border-neutral-200 bg-neutral-100 px-2 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600">Insert</button>
        </PopoverContent>
      </Popover>
      {/* Table options (shown when cursor is inside a table) */}
      {isInTable && (
        <Popover open={tableOptionsPopoverOpen} onOpenChange={setTableOptionsPopoverOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={`${btn} ${btnActive}`} aria-label="Table options">
              <Table2 className="h-4 w-4" />
              <span className="ml-1 text-sm">Table</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-h-80 w-64 overflow-y-auto rounded-md border border-neutral-200 bg-white p-1 shadow-md dark:border-neutral-700 dark:bg-neutral-900" align="start" sideOffset={4}>
            <p className="mb-1 px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">Headers</p>
            <button type="button" onClick={() => editor.chain().focus().toggleHeaderRow().run()} disabled={!editor.can().toggleHeaderRow()} className="w-full rounded px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800">Toggle header row</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeaderColumn().run()} disabled={!editor.can().toggleHeaderColumn()} className="w-full rounded px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800">Toggle header column</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeaderCell().run()} disabled={!editor.can().toggleHeaderCell()} className="w-full rounded px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800">Toggle header cell</button>
            <button type="button" onClick={() => { editor.chain().focus().deleteTable().run(); setTableOptionsPopoverOpen(false); }} disabled={!editor.can().deleteTable()} className="w-full rounded px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30">Delete table</button>
            <span className="my-1 block h-px bg-neutral-200 dark:bg-neutral-700" />
            <p className="mb-1 px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">Rows</p>
            <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()} className="w-full rounded px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800">Insert row above</button>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()} className="w-full rounded px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800">Insert row below</button>
            <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()} className="w-full rounded px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800">Delete row</button>
            <span className="my-1 block h-px bg-neutral-200 dark:bg-neutral-700" />
            <p className="mb-1 px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">Columns</p>
            <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()} className="w-full rounded px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800">Insert column before</button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()} className="w-full rounded px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800">Insert column after</button>
            <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()} className="w-full rounded px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-200 dark:hover:bg-neutral-800">Delete column</button>
            <span className="my-1 block h-px bg-neutral-200 dark:bg-neutral-700" />
            <p className="mb-1 px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">Cell</p>
            <div className="flex flex-col gap-2">
              <Popover open={cellColorPopoverOpen} onOpenChange={setCellColorPopoverOpen}>
                <PopoverTrigger asChild>
                  <button type="button" className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800">
                    <Highlighter className="h-4 w-4" />
                    {cellAttrs.backgroundColor && <span className="h-3 w-3 rounded border border-neutral-300 dark:border-neutral-500" style={{ backgroundColor: cellAttrs.backgroundColor }} />}
                    Cell color
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto rounded-md border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-700 dark:bg-neutral-900" align="start" sideOffset={4}>
                  <input type="color" value={cellColorInput} onChange={(e) => { setCellColorInput(e.target.value); editor.chain().focus().setCellAttribute('backgroundColor', e.target.value).run(); }} className="mb-2 h-8 w-full cursor-pointer rounded border border-neutral-200 dark:border-neutral-600" />
                  <button type="button" onClick={() => { editor.chain().focus().setCellAttribute('backgroundColor', null).run(); setCellColorPopoverOpen(false); }} className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800">Default</button>
                </PopoverContent>
              </Popover>
              <div className="flex flex-col gap-0.5">
                {(['left', 'center', 'right'] as const).map((v) => (
                  <button key={v} type="button" onClick={() => editor.chain().focus().setCellAttribute('textAlign', v).run()} className={`w-full rounded px-2 py-1 text-left text-xs ${cellAttrs.textAlign === v ? 'bg-neutral-200 dark:bg-neutral-600' : ''} text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800`}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
      <span className={toolbarSeparator} aria-hidden />
      {/* Text color */}
      <Popover open={textColorPopoverOpen} onOpenChange={setTextColorPopoverOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={`${btn} ${colorState.color ? btnActive : ''}`} aria-pressed={!!colorState.color} aria-label="Text color">
            <span className="relative flex items-center gap-1">
              <Palette className="h-4 w-4" />
              {colorState.color && <span className="h-3 w-3 rounded-full border border-neutral-300 dark:border-neutral-500" style={{ backgroundColor: colorState.color }} />}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-md border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-700 dark:bg-neutral-900" align="start" sideOffset={4} onFocusOutside={(e) => e.preventDefault()}>
          <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">Text color</p>
          <input type="color" value={textColorInput} onChange={(e) => { setTextColorInput(e.target.value); editor.chain().focus().setColor(e.target.value).run(); }} className="mb-2 h-8 w-full cursor-pointer rounded border border-neutral-200 dark:border-neutral-600" />
          <button type="button" onClick={() => { editor.chain().focus().unsetColor().run(); setTextColorPopoverOpen(false); }} className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800">Default</button>
        </PopoverContent>
      </Popover>
      {/* Background color */}
      <Popover open={bgColorPopoverOpen} onOpenChange={setBgColorPopoverOpen}>
        <PopoverTrigger asChild>
          <button type="button" className={`${btn} ${colorState.backgroundColor ? btnActive : ''}`} aria-pressed={!!colorState.backgroundColor} aria-label="Background color">
            <span className="relative flex items-center gap-1">
              <Highlighter className="h-4 w-4" />
              {colorState.backgroundColor && <span className="h-3 w-3 rounded-full border border-neutral-300 dark:border-neutral-500" style={{ backgroundColor: colorState.backgroundColor }} />}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-md border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-700 dark:bg-neutral-900" align="start" sideOffset={4} onFocusOutside={(e) => e.preventDefault()}>
          <p className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">Background color</p>
          <input type="color" value={bgColorInput} onChange={(e) => { setBgColorInput(e.target.value); editor.chain().focus().setBackgroundColor(e.target.value).run(); }} className="mb-2 h-8 w-full cursor-pointer rounded border border-neutral-200 dark:border-neutral-600" />
          <button type="button" onClick={() => { editor.chain().focus().unsetBackgroundColor().run(); setBgColorPopoverOpen(false); }} className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:bg-neutral-800">Default</button>
        </PopoverContent>
      </Popover>
      {/* HTML toggle */}
      {onToggleHtmlView != null && (
        <>
          <span className={toolbarSeparator} aria-hidden />
          <button type="button" onClick={onToggleHtmlView} className={`${btn} ${showRawHtml ? btnActive : ''}`} aria-pressed={showRawHtml} aria-label="View HTML source">
            <Code className="h-4 w-4" />
          </button>
        </>
      )}
      {/* Custom slot appended at the end */}
      {toolbarEnd && (
        <>
          <span className={cn(toolbarSeparator, 'ml-auto')} aria-hidden />
          {toolbarEnd}
        </>
      )}
    </div>
  );
}

// ─── Content class strings ────────────────────────────────────────────────────

const minimalContentClass =
  'min-h-[280px] px-3 py-2 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[260px] [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_p:last-child]:mb-0 [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:hover:text-blue-700 dark:[&_.ProseMirror_a]:text-blue-400 dark:[&_.ProseMirror_a]:hover:text-blue-300 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_li]:mb-1 [&_.ProseMirror_s]:line-through [&_.ProseMirror_u]:underline [&_.ProseMirror_.is-empty:first-child::before]:text-neutral-400 [&_.ProseMirror_.is-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-empty:first-child::before]:float-left [&_.ProseMirror_.is-empty:first-child::before]:h-0 [&_.ProseMirror_.is-empty:first-child::before]:pointer-events-none';

const fullContentClass =
  'px-3 py-2 [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_p:last-child]:mb-0 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h4]:text-base [&_.ProseMirror_h4]:font-bold [&_.ProseMirror_h4]:mb-2 [&_.ProseMirror_h5]:text-sm [&_.ProseMirror_h5]:font-bold [&_.ProseMirror_h5]:mb-2 [&_.ProseMirror_h6]:text-sm [&_.ProseMirror_h6]:font-semibold [&_.ProseMirror_h6]:mb-2 [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:hover:text-blue-700 dark:[&_.ProseMirror_a]:text-blue-400 dark:[&_.ProseMirror_a]:hover:text-blue-300 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_li]:mb-1 [&_.ProseMirror_s]:line-through [&_.ProseMirror_u]:underline [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:border [&_.ProseMirror_table]:border-neutral-200 dark:[&_.ProseMirror_table]:border-neutral-600 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-neutral-200 [&_.ProseMirror_th]:p-2 [&_.ProseMirror_th]:bg-neutral-100 dark:[&_.ProseMirror_th]:border-neutral-600 dark:[&_.ProseMirror_th]:bg-neutral-800 [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-neutral-200 [&_.ProseMirror_td]:p-2 dark:[&_.ProseMirror_td]:border-neutral-600 [&_.ProseMirror_table[data-alternate-rows=\'true\']_tbody_tr:nth-child(even)_td]:bg-neutral-50 dark:[&_.ProseMirror_table[data-alternate-rows=\'true\']_tbody_tr:nth-child(even)_td]:bg-neutral-800/50 [&_.ProseMirror_table[data-dashed-borders=\'true\']_td]:border-dashed [&_.ProseMirror_table[data-dashed-borders=\'true\']_th]:border-dashed [&_.ProseMirror_td]:relative [&_.ProseMirror_th]:relative [&_.ProseMirror_.column-resize-handle]:absolute [&_.ProseMirror_.column-resize-handle]:right-[-2px] [&_.ProseMirror_.column-resize-handle]:top-0 [&_.ProseMirror_.column-resize-handle]:bottom-0 [&_.ProseMirror_.column-resize-handle]:w-1 [&_.ProseMirror_.column-resize-handle]:z-20 [&_.ProseMirror_.column-resize-handle]:bg-blue-400 [&_.ProseMirror_.column-resize-handle]:pointer-events-none [&_.ProseMirror.resize-cursor]:cursor-col-resize [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:rounded [&_.ProseMirror_img]:max-w-full';

// ─── Public API ───────────────────────────────────────────────────────────────

export interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** 'minimal' = bold/italic/lists/link only. 'full' = all features. Default: 'minimal' */
  variant?: 'minimal' | 'full';
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  /**
   * Extra Tiptap extensions merged on top of the built-in bundle.
   * Use MINIMAL_EXTENSIONS / FULL_EXTENSIONS as your base if you need full control.
   */
  additionalExtensions?: Extensions;
  /**
   * Completely replaces the built-in toolbar. Receives the active editor instance.
   * Render inside a <Tiptap> context — useTiptap() works inside this render.
   */
  renderToolbar?: (editor: Editor) => React.ReactNode;
  /**
   * Extra React node appended to the right of the built-in toolbar.
   * Great for adding one-off custom buttons without replacing the whole toolbar.
   */
  toolbarEnd?: React.ReactNode;
  /** Only for variant="full": show raw HTML toggle and callback */
  showRawHtml?: boolean;
  onToggleHtmlView?: () => void;
  /** Max height for the content area (e.g. "300px" or 300). Default: 300 */
  contentMaxHeight?: string | number;
  /**
   * Optional ref to receive a function that inserts text at the current cursor.
   * Useful for template variable / token insertion from outside the editor.
   */
  insertContentRef?: React.RefObject<((text: string) => void) | null>;
}

export function TipTapEditor({
  value,
  onChange,
  variant = 'minimal',
  placeholder = 'Write something…',
  disabled = false,
  id,
  className,
  additionalExtensions,
  renderToolbar,
  toolbarEnd,
  showRawHtml = false,
  onToggleHtmlView,
  contentMaxHeight = 300,
  insertContentRef,
}: TipTapEditorProps) {
  const prevValueRef = useRef<string>(value);
  const isInternalUpdate = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const baseExtensions = variant === 'full' ? FULL_EXTENSIONS : MINIMAL_EXTENSIONS;
  const extensions: Extensions = additionalExtensions
    ? [...baseExtensions, ...additionalExtensions]
    : baseExtensions;

  const editor = useEditor({
    extensions,
    content: value || '<p></p>',
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        'data-placeholder': placeholder,
        ...(id ? { id } : {}),
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      if (html === '<p></p>') {
        onChangeRef.current('');
        return;
      }
      isInternalUpdate.current = true;
      prevValueRef.current = html;
      onChangeRef.current(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const normalized = (value || '').trim() || '<p></p>';
    const current = editor.getHTML();
    if (normalized === current) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    prevValueRef.current = normalized;
    editor.commands.setContent(normalized, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!editor || !insertContentRef) return;
    insertContentRef.current = (text: string) => {
      editor.chain().focus().insertContent(text).run();
    };
    return () => {
      insertContentRef.current = null;
    };
  }, [editor, insertContentRef]);

  if (!editor) {
    return (
      <div className={cn('min-h-[120px] rounded-md border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800', className)}>
        <div className="flex min-h-[100px] items-center justify-center text-neutral-500 dark:text-neutral-400">
          Loading editor…
        </div>
      </div>
    );
  }

  const contentClass = variant === 'full' ? fullContentClass : minimalContentClass;
  const maxH = typeof contentMaxHeight === 'number' ? `${contentMaxHeight}px` : contentMaxHeight;

  return (
    <div className={cn('overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900', className)}>
      <Tiptap instance={editor}>
        {renderToolbar ? (
          renderToolbar(editor)
        ) : variant === 'full' ? (
          <FullToolbar disabled={disabled} showRawHtml={showRawHtml} onToggleHtmlView={onToggleHtmlView} toolbarEnd={toolbarEnd} />
        ) : (
          <MinimalToolbar disabled={disabled} toolbarEnd={toolbarEnd} />
        )}
        {showRawHtml ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full border-t border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-700 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            style={{ minHeight: '300px', maxHeight: maxH, resize: 'none' }}
            aria-label="HTML source"
          />
        ) : (
          <div
            className="overflow-y-auto border-t border-neutral-200 dark:border-neutral-700"
            style={{ minHeight: '300px', maxHeight: maxH }}
            onClick={(e) => { if (e.target === e.currentTarget) editor.chain().focus('end').run(); }}
          >
            <Tiptap.Content className={contentClass} data-placeholder={placeholder} />
          </div>
        )}
      </Tiptap>
    </div>
  );
}

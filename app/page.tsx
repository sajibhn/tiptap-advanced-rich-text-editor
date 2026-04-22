'use client';

import { useState } from 'react';
import { TipTapEditor } from '@/components/TipTapEditor';

const FEATURES = [
  { icon: '✦', label: 'Headings & paragraphs' },
  { icon: '✦', label: 'Bold, italic, underline, strike' },
  { icon: '✦', label: 'Font size & color' },
  { icon: '✦', label: 'Text & background highlight' },
  { icon: '✦', label: 'Bullet & ordered lists' },
  { icon: '✦', label: 'Text alignment' },
  { icon: '✦', label: 'Links' },
  { icon: '✦', label: 'Images (URL + upload)' },
  { icon: '✦', label: 'Resizable images' },
  { icon: '✦', label: 'Resizable tables + cell styling' },
  { icon: '✦', label: 'YouTube / Vimeo / TikTok / Facebook embeds' },
  { icon: '✦', label: 'HTML source view' },
  { icon: '✦', label: 'Dark mode' },
  { icon: '✦', label: 'Minimal & full toolbar variants' },
  { icon: '✦', label: 'Custom extensions API' },
  { icon: '✦', label: 'Custom toolbar slot' },
];

const USAGE_SNIPPET = `import { TipTapEditor } from '@/components/TipTapEditor';

export default function MyForm() {
  const [body, setBody] = useState('');

  return (
    <TipTapEditor
      value={body}
      onChange={setBody}
      variant="full"
      placeholder="Start writing…"
    />
  );
}`;

export default function Home() {
  const [fullContent, setFullContent] = useState('');
  const [minimalContent, setMinimalContent] = useState('');
  const [showHtml, setShowHtml] = useState(false);
  const [activeTab, setActiveTab] = useState<'full' | 'minimal'>('full');

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 font-sans dark:bg-neutral-950">

      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900">
              TE
            </span>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              TipTap Editor
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </header>

      <main className="flex flex-1 flex-col">

        <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 flex flex-col gap-16">
          {/* ── Live demo ── */}
          <section>
            <h2 className="mb-1 text-lg font-semibold text-neutral-800 dark:text-neutral-100">Live demo</h2>
            <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">Try the editor below. Switch between variants using the tabs.</p>

            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1 w-fit dark:border-neutral-700 dark:bg-neutral-800">
              {(['full', 'minimal'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setActiveTab(v)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === v
                      ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                      : 'text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
                >
                  {v === 'full' ? 'Full toolbar' : 'Minimal toolbar'}
                </button>
              ))}
            </div>

            {activeTab === 'full' ? (
              <TipTapEditor
                value={fullContent}
                onChange={setFullContent}
                variant="full"
                placeholder="Try headings, tables, images, videos…"
                contentMaxHeight={420}
                showRawHtml={showHtml}
                onToggleHtmlView={() => setShowHtml((v) => !v)}
              />
            ) : (
              <TipTapEditor
                value={minimalContent}
                onChange={setMinimalContent}
                variant="minimal"
                placeholder="Bold, italic, lists, links…"
                contentMaxHeight={280}
              />
            )}

            {/* HTML output — always shown below the editor */}
            {activeTab === 'full' && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">HTML output</p>
                <pre className="overflow-auto rounded-md border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300" style={{ maxHeight: 200 }}>
                  {fullContent || <span className="text-neutral-400 dark:text-neutral-600">Start typing to see the HTML output…</span>}
                </pre>
              </div>
            )}
            {activeTab === 'minimal' && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">HTML output</p>
                <pre className="overflow-auto rounded-md border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300" style={{ maxHeight: 200 }}>
                  {minimalContent || <span className="text-neutral-400 dark:text-neutral-600">Start typing to see the HTML output…</span>}
                </pre>
              </div>
            )}
          </section>

          {/* ── Features ── */}
          <section>
            <h2 className="mb-1 text-lg font-semibold text-neutral-800 dark:text-neutral-100">Features</h2>
            <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">Everything included out of the box.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-start gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800/50">
                  <span className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{f.icon}</span>
                  <span className="text-xs text-neutral-700 dark:text-neutral-300">{f.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Quick start ── */}
          <section>
            <h2 className="mb-1 text-lg font-semibold text-neutral-800 dark:text-neutral-100">Quick start</h2>
            <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">Drop the component into any React/Next.js project.</p>
            <pre className="overflow-auto rounded-md border border-neutral-200 bg-neutral-50 p-5 text-xs leading-relaxed text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
              {USAGE_SNIPPET}
            </pre>
          </section>
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-xs text-neutral-500 dark:text-neutral-500">
          <span>MIT license · built with Tiptap, Next.js & Tailwind</span>
          <a href="https://tiptap.dev" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 dark:hover:text-neutral-300">
            tiptap.dev →
          </a>
        </div>
      </footer>
    </div>
  );
}

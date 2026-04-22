# Tiptap Advanced Rich Text Editor

A production-ready, fully-featured rich text editor built on **Tiptap v3**, **Next.js 16**, **React 19**, and **Tailwind CSS v4**.

## Features

| Category | Details |
|---|---|
| Block formatting | Paragraph, Heading 1–6 |
| Inline marks | Bold, italic, underline, strikethrough |
| Font | Size picker, text color, background color / highlight |
| Layout | Text alignment (left, center, right, justify) |
| Lists | Bullet list, ordered list |
| Links | Insert / edit / remove, opens in new tab |
| Images | URL insert, file upload, resizable handles |
| Video embeds | YouTube, Vimeo, TikTok, Facebook |
| Tables | Insert, resize columns, header toggle, cell color & alignment, row/column CRUD |
| Utilities | Clear formatting, HTML source toggle |
| Variants | `minimal` (lightweight) and `full` (all features) |
| DX | Custom extensions API, toolbar slot, insert-at-cursor ref, dark mode |

---

## Getting started

```bash
# clone
git clone https://github.com/your-username/tiptap-advanced-rich-text-editor.git
cd tiptap-advanced-rich-text-editor

# install (pnpm recommended)
pnpm install

# dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the live demo.

---

## Usage

### Minimal variant

```tsx
import { useState } from 'react';
import { TipTapEditor } from '@/components/TipTapEditor';

export default function CommentBox() {
  const [value, setValue] = useState('');

  return (
    <TipTapEditor
      value={value}
      onChange={setValue}
      variant="minimal"
      placeholder="Add a comment…"
    />
  );
}
```

### Full variant

```tsx
<TipTapEditor
  value={value}
  onChange={setValue}
  variant="full"
  placeholder="Start writing…"
  contentMaxHeight={500}
/>
```

### All props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Controlled HTML string |
| `onChange` | `(html: string) => void` | — | Called on every edit |
| `variant` | `'minimal' \| 'full'` | `'minimal'` | Toolbar feature set |
| `placeholder` | `string` | `'Write something…'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disables the editor |
| `id` | `string` | — | Sets the `id` on the ProseMirror node |
| `className` | `string` | — | Extra classes on the wrapper div |
| `additionalExtensions` | `Extensions` | — | Extra Tiptap extensions merged into the built-in set |
| `renderToolbar` | `(editor: Editor) => ReactNode` | — | Completely replaces the built-in toolbar |
| `toolbarEnd` | `ReactNode` | — | Extra buttons appended to the right of the built-in toolbar |
| `showRawHtml` | `boolean` | — | Highlights the HTML source button (full only) |
| `onToggleHtmlView` | `() => void` | — | Callback for the HTML source button (full only) |
| `contentMaxHeight` | `string \| number` | `300` | Max height of the editable area before it scrolls |
| `insertContentRef` | `RefObject<((text: string) => void) \| null>` | — | Ref that receives an `insertContent(text)` function for injecting text from outside |

---

## Extending the editor

### Add a single Tiptap extension

Pass any Tiptap-compatible extension via `additionalExtensions`. It is merged on top of the
built-in bundle — you do **not** need to re-list the defaults.

```tsx
import { TipTapEditor } from '@/components/TipTapEditor';
import Mention from '@tiptap/extension-mention';

<TipTapEditor
  value={value}
  onChange={setValue}
  variant="full"
  additionalExtensions={[
    Mention.configure({ suggestion: { /* … */ } }),
  ]}
/>
```

### Build your own extension bundle

The built-in extension arrays are exported so you can compose from them:

```tsx
import {
  TipTapEditor,
  FULL_EXTENSIONS,
  MINIMAL_EXTENSIONS,
} from '@/components/TipTapEditor';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight';

const lowlight = createLowlight(all);

<TipTapEditor
  value={value}
  onChange={setValue}
  variant="full"
  additionalExtensions={[CodeBlockLowlight.configure({ lowlight })]}
/>
```

### Add a custom toolbar button

Use `toolbarEnd` to append buttons to the right of the built-in toolbar without replacing it.
Import the exported style tokens so your button looks native:

```tsx
import { TipTapEditor, toolbarBtn } from '@/components/TipTapEditor';
import { useEditor } from '@tiptap/react';
import { Smile } from 'lucide-react';

// Inside your component, after you have an editor reference:
<TipTapEditor
  value={value}
  onChange={setValue}
  variant="full"
  toolbarEnd={
    <button
      type="button"
      onClick={() => editor.chain().focus().insertContent('😊').run()}
      className={toolbarBtn}
      aria-label="Insert emoji"
    >
      <Smile className="h-4 w-4" />
    </button>
  }
/>
```

### Replace the toolbar entirely

`renderToolbar` gives you full control. The render function receives the active `Editor` instance.
Use `useTiptap()` inside child components to subscribe to reactive editor state:

```tsx
import { useTiptap } from '@tiptap/react';
import { TipTapEditor } from '@/components/TipTapEditor';

function MyToolbar() {
  const { editor } = useTiptap();
  if (!editor) return null;
  return (
    <div className="flex gap-1 border-b p-1">
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </button>
      {/* add as many buttons as you like */}
    </div>
  );
}

<TipTapEditor
  value={value}
  onChange={setValue}
  renderToolbar={() => <MyToolbar />}
/>
```

### Insert content from outside the editor

Use `insertContentRef` to get a stable function that inserts text at the current cursor position.
Useful for template variables, mention pickers, emoji selectors, etc.

```tsx
import { useRef, useState } from 'react';
import { TipTapEditor } from '@/components/TipTapEditor';

export default function EmailEditor() {
  const [value, setValue] = useState('');
  const insertRef = useRef<((text: string) => void) | null>(null);

  return (
    <>
      <TipTapEditor
        value={value}
        onChange={setValue}
        variant="full"
        insertContentRef={insertRef}
      />
      <button onClick={() => insertRef.current?.('{{first_name}}')}>
        Insert variable
      </button>
    </>
  );
}
```

---

## File structure

```
components/
  TipTapEditor.tsx      # Main editor component (all exports live here)
  ui/
    popover.tsx         # Radix-based popover used by toolbar popovers
lib/
  table-extensions.ts   # Extended table / cell / header nodes (cell color, align)
  utils.ts              # cn() helper
app/
  page.tsx              # Live demo page
  layout.tsx
  globals.css
```

---

## Tech stack

- [Tiptap v3](https://tiptap.dev) — headless rich text framework
- [Next.js 16](https://nextjs.org)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Radix UI Popover](https://www.radix-ui.com/primitives/docs/components/popover)
- [Lucide React](https://lucide.dev)
- [@nathapp/tiptap-extension-video](https://github.com/nathapp/tiptap-extension-video)

---

## License

MIT

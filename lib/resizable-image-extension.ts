import Image from '@tiptap/extension-image';
import { ResizableNodeView } from '@tiptap/core';

/**
 * Extends the built-in Image extension to fix a race condition where cached
 * images and base64 data URLs fire `onload` before the handler is assigned,
 * leaving the node permanently invisible.
 */
export const ResizableImage = Image.configure({
  allowBase64: true,
  inline: false,
}).extend({
  addNodeView() {
    return ({ node, getPos, HTMLAttributes, editor }) => {
      const el = document.createElement('img');

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value != null && key !== 'width' && key !== 'height') {
          el.setAttribute(key, String(value));
        }
      });
      el.src = HTMLAttributes.src as string;

      const nodeView = new ResizableNodeView({
        element: el,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();
          if (pos === undefined) return;
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes('image', { width, height })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          node = updatedNode;
          return true;
        },
        options: {
          directions: ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
          min: { width: 50, height: 50 },
          preserveAspectRatio: true,
        },
      });

      const dom = nodeView.dom;

      // Data URLs are already in memory — show immediately to avoid the race
      // where onload fires before the handler is assigned.
      // For remote URLs, hide until loaded to prevent layout shift.
      const isDataUrl = (HTMLAttributes.src as string)?.startsWith('data:');
      if (!isDataUrl && !el.complete) {
        dom.style.visibility = 'hidden';
        dom.style.pointerEvents = 'none';
        el.onload = () => {
          dom.style.visibility = '';
          dom.style.pointerEvents = '';
        };
        el.onerror = () => {
          dom.style.visibility = '';
          dom.style.pointerEvents = '';
        };
      }

      return nodeView;
    };
  },
});

import { Node } from '@tiptap/core';
import { Youtube, Vimeo, Tiktok, Facebook } from '@nathapp/tiptap-extension-video';

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

function youtubeEmbedUrl(src: string): string {
  if (src.includes('/embed/')) return src;
  const match = src.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : src;
}

function vimeoEmbedUrl(src: string): string {
  if (src.includes('player.vimeo.com')) return src;
  const match = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : src;
}

function tiktokEmbedUrl(src: string): string {
  if (src.includes('player/v1')) return src;
  const match = src.match(/video\/(\d+)/);
  return match ? `https://www.tiktok.com/player/v1/${match[1]}` : src;
}

function facebookEmbedUrl(src: string): string {
  if (src.includes('plugins/video.php')) return src;
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(src)}&show_text=0`;
}

type EmbedUrlFn = (src: string) => string;
type DataAttr = string;

function makeVideoExtension(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  base: Node<any, any>,
  getEmbedUrl: EmbedUrlFn,
  dataAttr: DataAttr,
  allowFullscreen = true,
) {
  return base.extend({
    addNodeView() {
      return ({ node }) => {
        const outerDiv = document.createElement('div');
        outerDiv.dataset[dataAttr] = '';

        const iframe = document.createElement('iframe');
        iframe.src = getEmbedUrl(node.attrs.src as string);
        iframe.width = String((node.attrs.width as number | null) ?? DEFAULT_WIDTH);
        iframe.height = String((node.attrs.height as number | null) ?? DEFAULT_HEIGHT);
        if (allowFullscreen) iframe.allowFullscreen = true;
        iframe.style.display = 'block';

        outerDiv.appendChild(iframe);

        return {
          dom: outerDiv,
          update: (updatedNode) => {
            if (updatedNode.type !== node.type) return false;
            iframe.src = getEmbedUrl(updatedNode.attrs.src as string);
            iframe.width = String((updatedNode.attrs.width as number | null) ?? DEFAULT_WIDTH);
            iframe.height = String((updatedNode.attrs.height as number | null) ?? DEFAULT_HEIGHT);
            return true;
          },
          ignoreMutation: () => true,
        };
      };
    },
  });
}

export const ResizableYoutube = makeVideoExtension(Youtube, youtubeEmbedUrl, 'youtubeVideo');
export const ResizableVimeo = makeVideoExtension(Vimeo, vimeoEmbedUrl, 'vimeoVideo');
export const ResizableTiktok = makeVideoExtension(Tiktok, tiktokEmbedUrl, 'tiktokVideo', false);
export const ResizableFacebook = makeVideoExtension(Facebook, facebookEmbedUrl, 'facebookVideo');

export const ResizableVideoExtensions = [
  ResizableYoutube,
  ResizableVimeo,
  ResizableTiktok,
  ResizableFacebook,
];

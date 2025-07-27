import { ClipboardItem } from './types/ClipboardItem';

export {};

declare global {
  interface Window {
    electronAPI: {
      onClipboardUpdate: (callback: (item: ClipboardItem) => void) => void;
      copyText: (text: string) => void; 
      copyImage: (base64: string) => void;  
      fixWindowToTopLeft: () => void;
      foldWindow: () => void;
      outspreadWindow: () => void;
    };
  }
}
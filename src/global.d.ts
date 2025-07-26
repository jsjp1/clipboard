import { ClipboardItem } from './types/ClipboardItem';

export {};

declare global {
  interface Window {
    electronAPI: {
      onClipboardUpdate: (callback: (item: ClipboardItem) => void) => void;
      copyText: (text: string) => void;    // 복사할 텍스트를 인자로 받음
      copyImage: (base64: string) => void;  // 복사할 이미지(base64)를 인자로 받음
    };
  }
}
import { ClipboardItem } from './types/ClipboardItem';
import { ClipboardSetting } from './ClipboardSetting';

export {};

declare global {
  interface Window {
    electronAPI: {
      onClipboardUpdate: (callback: (item: ClipboardItem) => void) => void;
      copyText: (text: string) => void; 
      copyImage: (base64: string) => void;  
      setting: () => void;
      fixWindowToTopLeft: () => void;
      foldWindow: () => void;
      outspreadWindow: () => void;
      deleteFromRedis: (timestamp: number) => void;

      // setting.html
      saveSetting: (redisHost: string, redisPort: number) => Promise<boolean>;
    };
  }
}
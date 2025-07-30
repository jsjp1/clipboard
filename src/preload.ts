import { contextBridge, ipcRenderer } from 'electron';
import { ClipboardItem } from './types/ClipboardItem';

contextBridge.exposeInMainWorld('electronAPI', {
  onClipboardUpdate: (callback: (item: ClipboardItem) => void) => {
    ipcRenderer.on('clipboard-updated', (_, item: ClipboardItem) => {
      callback(item);
    });
  },

  copyText: (text: string) => {
    ipcRenderer.send('copy-text', text);
  },

  copyImage: (base64: string) => {
    ipcRenderer.send('copy-image', base64);
  },

  setting: () => ipcRenderer.send('setting'),

  fixWindowToTopLeft: () => ipcRenderer.send('fix-window-top-left'),

  foldWindow: () => ipcRenderer.send('fold-window'),

  outspreadWindow: () => ipcRenderer.send('outspread-window'),

  deleteFromRedis: (timestamp: number) => {
    ipcRenderer.send('delete-from-redis', timestamp);
  },

  // setting.html
  saveSetting: (redisHost: string, redisPort: number) => ipcRenderer.send('save-setting', redisHost, redisPort),
});
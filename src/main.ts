import { app, BrowserWindow, clipboard, ipcMain, nativeImage } from 'electron';  // ipcMain, nativeImage 추가
import path from 'path';
import { ClipboardItem } from './types/ClipboardItem';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win: BrowserWindow;
let lastText = '';
let lastImageBase64 = '';

let lastOutspreadWidth = 0;
let lastOutspreadHeight = 0;

function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 250,
    resizable: true,
    movable: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));

  setInterval(() => {
    const text = clipboard.readText();
    const image = clipboard.readImage();

    if(text.replace(" ", "") === "") return;

    if (!image.isEmpty()) {
      const base64 = image.toPNG().toString('base64');
      if (base64 !== lastImageBase64) {
        lastImageBase64 = base64;
        lastText = text; 

        const item: ClipboardItem = {
          type: 'image',
          timestamp: Date.now(),
          data: `data:image/png;base64,${base64}`,
        };
        win.webContents.send('clipboard-updated', item);
      }
    }
    else if (text && text !== lastText) {
      lastText = text;
      lastImageBase64 = ''; 

      const item: ClipboardItem = {
        type: 'text',
        timestamp: Date.now(),
        data: text,
      };
      win.webContents.send('clipboard-updated', item);
    }
  }, 1000);

}


app.whenReady().then(() => {
  ipcMain.on('copy-text', (_, text: string) => {
    clipboard.writeText(text);
  });
  ipcMain.on('copy-image', (_, dataUrl: string) => {
    const image = nativeImage.createFromDataURL(dataUrl);
    clipboard.writeImage(image);
  });
  
  ipcMain.on('fix-window-top-left', () => {
    const win = BrowserWindow.getFocusedWindow();
    if(win) {
      win.setBounds({x: 15, y: 30, width: win.getBounds().width, height: win.getBounds().height});
    }
  });

  ipcMain.on('fold-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if(win) {
      lastOutspreadWidth = win.getBounds().width;
      lastOutspreadHeight = win.getBounds().height;
      win.setBounds({x: win.getBounds().x, y: win.getBounds().y, width: win.getBounds().width, height: 20});
    }
  });

  ipcMain.on('outspread-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if(win) {
      win.setBounds({x: win.getBounds().x, y: win.getBounds().y, width: lastOutspreadWidth, height: lastOutspreadHeight});
    }
  });

  createWindow();

  app.on('activate', function () {
    if(BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
});

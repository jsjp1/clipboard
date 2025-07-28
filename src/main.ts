import { app, BrowserWindow, clipboard, ipcMain, nativeImage } from 'electron';  // ipcMain, nativeImage 추가
import path from 'path';
import { ClipboardItem } from './types/ClipboardItem';
import { fileURLToPath } from 'url';
import { RedisClient } from './RedisClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win: BrowserWindow;
let lastText = '';
let lastImageBase64 = '';

let lastOutspreadWidth = 400;
let lastOutspreadHeight = 250;

// TODO redisClient 사용자 설정 가능하게 하기
// 현재는 localhost:6379로 고정
let redisClient: RedisClient = new RedisClient(
  'localhost', 
  6379
);

function createWindow() {
  win = new BrowserWindow({
    width: lastOutspreadWidth,
    height: lastOutspreadHeight,
    resizable: true,
    movable: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  if(!win){
    console.error("cannot create window");
    return;
  }

  lastOutspreadWidth = win.getBounds().width;
  lastOutspreadHeight = win.getBounds().height;

  redisClient.connect().then(() => {
    console.log('\n\n######################\nRedis client connected\n######################\n\n');
  }).catch(err => {
    console.error('Failed to connect to Redis:', err);
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.webContents.openDevTools();

  setInterval(() => {
    const text = clipboard.readText();
    const image = clipboard.readImage();

    if(!image && text.replace(" ", "") === "") return;

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
  // 클립보드 아이콘 버튼을 누르면 clipboard 업데이트하는 함수
  ipcMain.on('copy-text', (_, text: string) => {
    clipboard.writeText(text);
  });
  ipcMain.on('copy-image', (_, dataUrl: string) => {
    const image = nativeImage.createFromDataURL(dataUrl);
    clipboard.writeImage(image);
  });
  
  // 고정 아이콘 버튼 기능으로 누르면 좌측 상단에 고정 
  // TODO 현재 고정은 아님, 이동만.
  ipcMain.on('fix-window-top-left', () => {
    const win = BrowserWindow.getFocusedWindow();
    if(win) {
      win.setBounds({x: 15, y: 30, width: win.getBounds().width, height: win.getBounds().height});
    }
  });

  // 창 접기 기능
  ipcMain.on('fold-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if(win) {
      lastOutspreadWidth = win.getBounds().width;
      lastOutspreadHeight = win.getBounds().height;
      win.setBounds({x: win.getBounds().x, y: win.getBounds().y, width: win.getBounds().width, height: 20});
    }
  });

  // 창 펼치기 기능
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

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

  redisClient.connect();

  win.loadFile(path.join(__dirname, '..', 'index.html'));

  // renderer 준비된 이후
  // redis에 저장돼있던 클립보드 아이템들을 불러와서 renderer 프로세스에 전달
  let redisCachedDataList: ClipboardItem[] = [];
  win.webContents.once('did-finish-load', () => {
    redisClient.getAllData().then(data => {
      for (const [key, value] of Object.entries(data)) {
        let type: ClipboardItem['type'] = value.startsWith('data:image/png;base64,') ? 'image' : 'text';

        const item: ClipboardItem = {
          type: type,
          timestamp: parseInt(key),
          data: value,
        };
        redisCachedDataList.push(item);
      }

      for (const item of redisCachedDataList.reverse()) {
        win.webContents.send('clipboard-updated', item);
      }
    })
    .catch(err => {
      console.error('Failed to get all data from Redis:', err);
    });
  });

  // TODO : signal
  setInterval(() => {
    const text = clipboard.readText();
    const image = clipboard.readImage();

    if(!image && text.replace(" ", "") === "") return;

    const timestamp = Date.now();
    if (!image.isEmpty()) {
      const base64 = image.toPNG().toString('base64');
      if (base64 !== lastImageBase64) {
        lastImageBase64 = base64;
        lastText = text; 

        const item: ClipboardItem = {
          type: 'image',
          timestamp: timestamp,
          data: `data:image/png;base64,${base64}`,
        };
        win.webContents.send('clipboard-updated', item);
        redisClient.set(timestamp.toString(), item.data);
      }
    }
    else if (text && text !== lastText) {
      lastText = text;
      lastImageBase64 = ''; 

      const item: ClipboardItem = {
        type: 'text',
        timestamp: timestamp,
        data: text,
      };
      win.webContents.send('clipboard-updated', item);
      redisClient.set(timestamp.toString(), item.data);
    }
  }, 1000);

  win.on('closed', () => {
    redisClient.disconnect().then(() => {
      console.log('Redis client disconnected');
    }).catch(err => {
      console.error('Failed to disconnect Redis client:', err);
    });
  });
}


app.whenReady().then(async () => {
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

  // 레디스에서 데이터 삭제
  ipcMain.on('delete-from-redis', async (_, timestamp: number) => {
    try {
      await redisClient.delete(timestamp.toString());
      console.log(`Deleted item with timestamp ${timestamp} from Redis`);
    } catch (err) {
      console.error(`Failed to delete item with timestamp ${timestamp} from Redis:`, err);
    }
  });


  // setting.html
  // 설정하기 버튼 (redis ..)
  // TODO 설정 기능 추가
  ipcMain.on('setting', () => {
    const settingWin = new BrowserWindow({
      width: 250,
      height: 150,
      x: win.getBounds().x,
      y: win.getBounds().y,
      movable: true,
      resizable: false,
      frame: false,      
      alwaysOnTop: true,
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });
    settingWin.loadFile(path.join(__dirname, '..', 'setting.html'));
  });

  // setting 정보 변경
  // TODO setting 확장
  ipcMain.on('save-setting', async (_, redisHost: string, redisPort: number) => {
    if (redisClient) {
      await redisClient.disconnect();
    }

    redisClient = new RedisClient(redisHost, redisPort);
    await redisClient.connect(); 

    console.log('\n\n######################\nNew RedisClient configured:', redisClient, "\n######################\n\n");
  });

  createWindow();

  app.on('activate', function () {
    if(BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
});

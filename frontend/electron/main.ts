import { app, BrowserWindow } from 'electron';
let mainWindow: BrowserWindow | null = null; // 主窗口变量

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL('http://localhost:5173');
  mainWindow.maximize();
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

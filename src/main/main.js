const { app, BrowserWindow, ipcMain, dialog } = require('electron');
app.disableHardwareAcceleration();

const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile(path.join(__dirname, '../../dist/index.html'));
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

ipcMain.handle('get-network-interfaces', () => {
  const nets = os.networkInterfaces();
  const result = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        result.push({ name, address: net.address });
      }
    }
  }
  return result;
});

const isPackaged = app.isPackaged;
const loaderExe = isPackaged
  ? path.join(process.resourcesPath, 'TwinSAFE_Loader.exe')
  : 'TwinSAFE_Loader.exe';

ipcMain.handle('run-loader', async (event, args) => {
  return new Promise((resolve) => {
    const exe = args[0] === 'TwinSAFE_Loader.exe' ? loaderExe : args[0];
    execFile(exe, args.slice(1), (error, stdout, stderr) => {
      resolve({
        code: error ? error.code : 0,
        stdout: stdout,
        stderr: stderr
      });
    });
  });
});

ipcMain.handle('read-csv', async (event, filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
});

ipcMain.handle('choose-bin-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Executables', extensions: ['exe', 'bin'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});
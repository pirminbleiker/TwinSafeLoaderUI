const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getNetworkInterfaces: () => ipcRenderer.invoke('get-network-interfaces'),
  runLoader: (args) => ipcRenderer.invoke('run-loader', args),
  readCsv: (filePath) => ipcRenderer.invoke('read-csv', filePath),
  chooseBinFile: () => ipcRenderer.invoke('choose-bin-file')
});

import { app, BrowserWindow, Menu ,dialog} from 'electron';

import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
import { watchFileSeclector } from './main/nativeWatcher';
import { registerContextMenu } from './main/menu';
import shellEnv from 'shell-env';
import fixPath from 'fix-path';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) {
  enableLiveReload({ strategy: 'react-hmr' });
} else {
  // if we're running from the app package, we won't have access to env vars
  // normally loaded in a shell, so work around with the shell-env module
  const decoratedEnv = shellEnv.sync();
  process.env = { ...process.env, ...decoratedEnv };

  // and we need to do the same thing with PATH
  fixPath();
}

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: isDevMode ? 1200 : 900,
    height: 720,
    resizable: false,
    webPreferences: {
      nodeIntegrationInWorker: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS);
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  registerContextMenu(app);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
watchFileSeclector();

const { fork } = require('child_process')
const ps = fork(`${__dirname}/main/server.js`)

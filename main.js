// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const {serverLive} = require('./app.js');
const path = require('path');
const { fork } = require("child_process");
let dbData = require('./data/db.json');

function createWindow () {

  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadURL('http://localhost:8099');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('resize', function(e,x,y){
    mainWindow.setSize(x, y);
  });
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
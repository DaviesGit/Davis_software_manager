const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const message_transfer = require('./message_transfer.js');

const path = require('path')
const url = require('url')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    frame: false,
  });
  mainWindow.setAlwaysOnTop(true);
  mainWindow.maximize();
  mainWindow.hide();

  // mainWindow.webContents.openDevTools();


  const menu = new electron.Menu();
  menu.append(new electron.MenuItem({
    label: 'dev tools',
    accelerator: 'F12',
    click: function () {
      mainWindow.webContents.openDevTools();
    },
  }));
  menu.append(new electron.MenuItem({
    label: 'refresh',
    accelerator: 'CmdOrCtrl+R',
    click: function () {
      mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'Davis.html'),
        protocol: 'file:',
        slashes: true
      }));
    },
  }));
  mainWindow.setMenu(menu);

  var shortcut_show = electron.globalShortcut.register('CmdOrCtrl+shift+S', function () {
    if(mainWindow.isVisible()){
    mainWindow.hide();
    }else{
    mainWindow.show();
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'Davis.html'),
    protocol: 'file:',
    slashes: true
  }));

  message_transfer.add_new_window(mainWindow, 'main_window');

  electron.ipcMain.on('open_window', function (event, arg) {
    var window_info = Object.assign({
      parent: mainWindow,
    }, arg.window_basic_info);
    var window = new BrowserWindow(window_info);
    var parent_window = event.sender;
    window.loadURL(arg.url);
    message_transfer.add_new_window(window, arg.window_name);
    if (arg.dom_ready) {
      window.webContents.once('dom-ready', function (event) {
        parent_window.webContents.send(arg.dom_ready, event);
      });
    }
    event.returnValue = window;
  });
  //const session = mainWindow.webContents.session;

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

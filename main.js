const path = require('path');
const url = require('url');
const electronLocalshortcut = require('electron-localshortcut');
const {app, BrowserWindow, Menu, screen, globalShortcut, ipcMain, dialog} = require('electron');
const fs = require("fs");
const WIDTH_RATIO = 0.8;
const ASPECT_RATIO = 10 / 16;

function createWindow() {

  const screenWidth = screen.getPrimaryDisplay().workAreaSize.width;
  const screenHeight = screen.getPrimaryDisplay().workAreaSize.height;

  // Paths for child windows
  const settingsPath = path.join('file://', __dirname, 'windows/settings.html');
  const aboutPath = path.join('file://', __dirname, 'windows/about.html');
  const helpPath = path.join('file://', __dirname, 'windows/help');
  const specDataPath = path.join('file://', __dirname, 'windows/specimenData.html');
  const collDataPath = path.join('file://', __dirname, 'windows/collectionData.html');
  const interpretDataPath = path.join('file://', __dirname, 'windows/interpretationData.html');
  const meansDataPath = path.join('file://', __dirname, 'windows/meanData.html');
  const openFilesPath = path.join(__dirname, 'main_window/openFilesModal.html');
  const formatsPath = path.join(__dirname, 'windows/help/supportedFormats.html');
  const pcaPath = path.join('file://', __dirname, 'windows/pca.html');
  const fisherPath = path.join('file://', __dirname, 'windows/fisher.html');

  // Initialize main window
  let win = new BrowserWindow({
    width: screenWidth, //* WIDTH_RATIO,
    height: screenWidth, // * WIDTH_RATIO * ASPECT_RATIO,
    icon: __dirname + "/img/pm-tools-app-icon-dark.ico",
    // Remove the window frame from windows applications
    frame: false,
    // Hide the titlebar from MacOS applications while keeping the stop lights
    titleBarStyle: 'hidden', // or 'customButtonsOnHover',
    // Hide loading
    show: false,
    //resizable: false,
    maximizable: true,
    //minimizable: false,

    webPreferences: {
        nodeIntegration: true
    }
  });

  win.once('ready-to-show', () => {
    win.show();
  })

  win.maximize();

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'main_window/index.html'),
    protocol: 'file',
    slashes: true,
  }));

  ipcMain.on('reload-mainWin', () => { win.reload() });

  ipcMain.on('redraw-charts', (event) => {
    win.webContents.send('redraw');
  })

  // Initialize settings window
  let settingsWin = new BrowserWindow({
    // width: screenWidth / 3,
    // height: screenHeight / 2,
    icon: __dirname + "/img/pm-tools-app-icon-dark.ico",
    parent: win,
    show: false,
    // Remove the window frame from windows applications
    frame: false,
    // Hide the titlebar from MacOS applications while keeping the stop lights
    titleBarStyle: 'hidden', // or 'customButtonsOnHover',
    webPreferences: {
        nodeIntegration: true
    }
  });

  settingsWin.loadURL(settingsPath);

  settingsWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    settingsWin.hide();
    // settingsWin = null
  });

  ipcMain.on('toggle-settings', ()  => {
    if (settingsWin.isVisible()) settingsWin.hide();
    else {
      settingsWin.show();
    }
  })

  ipcMain.on('reload-settWin', () => {
    settingsWin.reload() });

  // Initialize about window
  let aboutWin = new BrowserWindow({
    width: screenWidth / 3,
    // height: screenHeight / 2,
    icon: __dirname + "/img/pm-tools-app-icon-dark.ico",
    parent: win,
    show: false,
    // Remove the window frame from windows applications
    frame: false,
    // Hide the titlebar from MacOS applications while keeping the stop lights
    titleBarStyle: 'hidden', // or 'customButtonsOnHover',
    webPreferences: {
        nodeIntegration: true
    }
  });

  aboutWin.loadURL(aboutPath);

  aboutWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    aboutWin.hide();
    // aboutWin = null
  });

  ipcMain.on('toggle-about', ()  => {
    if (aboutWin.isVisible()) aboutWin.hide();
    else {
      aboutWin.show();
    }
  })

  // Initialize help window
  let shortcutsWin = new BrowserWindow({
    // width: screenWidth / 2,
    // height: screenHeight / 2,
    icon: __dirname + "/img/pm-tools-app-icon-dark.ico",
    parent: win,
    show: false,
    // Remove the window frame from windows applications
    frame: false,
    // Hide the titlebar from MacOS applications while keeping the stop lights
    titleBarStyle: 'hidden', // or 'customButtonsOnHover',
    webPreferences: {
        nodeIntegration: true
    }
  });

  shortcutsWin.loadURL(path.join(helpPath + '/shortcuts.html'));

  ipcMain.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    shortcutsWin.hide();
  });

  ipcMain.on('toggle-shortcuts', ()  => {
    if (shortcutsWin.isVisible()) shortcutsWin.hide();
    else {
      shortcutsWin.show();
    }
  })

  // Initialize specimen data window

  let specDataWin = new BrowserWindow({
    // width: screenWidth / 3,
    // height: screenHeight / 2,
    icon: __dirname + "/img/pm-tools-app-icon-dark.ico",
    parent: win,
    show: false,
    // Remove the window frame from windows applications
    frame: false,
    // Hide the titlebar from MacOS applications while keeping the stop lights
    titleBarStyle: 'hidden', // or 'customButtonsOnHover',
    webPreferences: {
        nodeIntegration: true
    }
  });

  specDataWin.loadURL(specDataPath);

  specDataWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    specDataWin.hide();
    // settingsWin = null
  });

  ipcMain.on('toggle-specData', ()  => {
    if (specDataWin.isVisible()) specDataWin.hide();
    else specDataWin.show();
  });

  ipcMain.on('reload-specDataWin', () => { specDataWin.reload() });

  ipcMain.on('redraw-specDataWin', (event) => {
    specDataWin.webContents.send('redraw-table');
  })

  // Initialize specimen data window

  let collDataWin = new BrowserWindow({
    // width: screenWidth / 3,
    // height: screenHeight / 2,
    icon: __dirname + "/img/pm-tools-app-icon-dark.ico",
    parent: win,
    show: false,
    // Remove the window frame from windows applications
    frame: false,
    // Hide the titlebar from MacOS applications while keeping the stop lights
    titleBarStyle: 'hidden', // or 'customButtonsOnHover',
    webPreferences: {
        nodeIntegration: true
    }
  });

  collDataWin.loadURL(collDataPath);

  collDataWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    collDataWin.hide();
    // settingsWin = null
  });

  ipcMain.on('toggle-collData', ()  => {
    if (collDataWin.isVisible()) collDataWin.hide();
    else collDataWin.show();
  });

  ipcMain.on('reload-collDataWin', () => { collDataWin.reload() });

  ipcMain.on('redraw-collDataWin', (event) => {
    collDataWin.webContents.send('redraw-table');
  })

  // Initialize interpretations data window

  let interpretDataWin = new BrowserWindow({
    // width: screenWidth / 3,
    // height: screenHeight / 2,
    icon: __dirname + "/img/pm-tools-app-icon-dark.ico",
    parent: win,
    show: false,
    // Remove the window frame from windows applications
    frame: false,
    // Hide the titlebar from MacOS applications while keeping the stop lights
    titleBarStyle: 'hidden', // or 'customButtonsOnHover',
    webPreferences: {
        nodeIntegration: true
    }
  })

  interpretDataWin.loadURL(interpretDataPath);

  interpretDataWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    interpretDataWin.hide();
  });

  ipcMain.on('toggle-interpretData', () => {
    if (interpretDataWin.isVisible()) interpretDataWin.hide();
    else interpretDataWin.show();
  })

  ipcMain.on('reload-interpretDataWin', () => { interpretDataWin.reload() });

  ipcMain.on('redraw-interpretDataWin', (event) => {
    interpretDataWin.webContents.send('redraw-table');
  })

  // Initialize means data window

  let meansDataWin = new BrowserWindow({
    // width: screenWidth / 3,
    // height: screenHeight / 2,
    icon: __dirname + "/img/pm-tools-app-icon-dark.ico",
    parent: win,
    show: false,
    // Remove the window frame from windows applications
    frame: false,
    // Hide the titlebar from MacOS applications while keeping the stop lights
    titleBarStyle: 'hidden', // or 'customButtonsOnHover',
    webPreferences: {
        nodeIntegration: true
    }
  })

  meansDataWin.loadURL(meansDataPath);

  meansDataWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    meansDataWin.hide();
  });

  ipcMain.on('toggle-meansData', () => {
    if (meansDataWin.isVisible()) meansDataWin.hide();
    else meansDataWin.show();
  })

  ipcMain.on('reload-meansDataWin', () => { meansDataWin.reload() });

  ipcMain.on('redraw-meansDataWin', (event) => {
    meansDataWin.webContents.send('redraw-table');
  })

  // Initialize openFiles data window

  let openFilesWin = new BrowserWindow({
    width: screenWidth / 2,
    height: screenHeight / 2,
    icon: __dirname + "/img/pm-tools-app-icon-dark.ico",
    // parent: win,
    show: false,
    // Remove the window frame from windows applications
    frame: false,
    // Hide the titlebar from MacOS applications while keeping the stop lights
    titleBarStyle: 'hidden', // or 'customButtonsOnHover',
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  openFilesWin.loadURL(openFilesPath);

  ipcMain.on('toggle-openFilesModal', () => {
    if (openFilesWin.isVisible()) openFilesWin.hide();
    else openFilesWin.show();
  })

  ipcMain.on('open-openFilesModal', () => { win.hide(); openFilesWin.show();  })
  ipcMain.on('hide-openFilesModal', () => { openFilesWin.hide(); win.show(); })
  ipcMain.on('close-openFilesModal', () => { win.close(); })

  ipcMain.on('init-pages', () => { win.webContents.send('init'); })

  ipcMain.on('reload-openFilesModal', () => { openFilesWin.reload() });

  // Initialize formats window

  let formatsWin = new BrowserWindow({
    // width: screenWidth / 2,
    // height: screenHeight / 2,
    icon: __dirname + "/img/pm-tools-app-icon-dark.ico",
    // parent: win,
    show: false,
    // Remove the window frame from windows applications
    frame: false,
    // Hide the titlebar from MacOS applications while keeping the stop lights
    titleBarStyle: 'hidden', // or 'customButtonsOnHover',
    resizable: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  formatsWin.loadURL(formatsPath);

  ipcMain.on('toggle-formats', () => {
    if (formatsWin.isVisible()) formatsWin.hide();
    else formatsWin.show();
  })

  // Initialize pca window

  let pcaWin = new BrowserWindow({
    width: screenWidth/6,
    height: 58, // 500,
    useContentSize: true,
    x: 5 * screenWidth / 12,
    y: 5,
    center: false,
    parent: win,
    modal: true,
    show: false,
    frame: false,
    title: 'Select steps',
    resizable: false,
    webPreferences: {
        nodeIntegration: true
    }
  });

  pcaWin.loadURL(pcaPath);

  pcaWin.on('close', () => { pcaWin = null });

  ipcMain.on('toggle-pca', ()  => {
    if (pcaWin.isVisible()) pcaWin.hide();
    else {
      pcaWin.show();
    }
  })

  // Initialize fisher window

  let fisherWin = new BrowserWindow({
    width: screenWidth * 0.3,
    height: screenHeight * 0.4,
    parent: win,
    // modal: true,
    show: false,
    frame: false,
    webPreferences: {
        nodeIntegration: true
    }
  });

  fisherWin.loadURL(fisherPath);

  fisherWin.on('close', () => { fisherWin = null });

  ipcMain.on('toggle-fisher', ()  => {
    if (fisherWin.isVisible()) fisherWin.hide();
    else {
      fisherWin.show();
    }
  })

  // Initialize app shortcuts

  electronLocalshortcut.register('f5', function() {
		win.reload();
    settingsWin.reload();
    shortcutsWin.reload();
    aboutWin.reload();
    specDataWin.reload();
    collDataWin.reload();
    interpretDataWin.reload();
    meansDataWin.reload();
    openFilesWin.reload();
    formatsWin.reload();
	})

	// electronLocalshortcut.register('CommandOrControl+R', function() {
	// 	win.reload()
  //   settingsWin.reload();
  //   shortcutsWin.reload();
  //   aboutWin.reload();
  //   specDataWin.reload();
  //   interpretDataWin.reload();
	// })


  // Initialize developer tools

  // win.webContents.openDevTools();
  // openFilesWin.webContents.openDevTools();
  // formatsWin.webContents.openDevTools();
  // settingsWin.webContents.openDevTools();
  // specDataWin.webContents.openDevTools();
  // collDataWin.webContents.openDevTools();
  // interpretDataWin.webContents.openDevTools();
  // meansDataWin.webContents.openDevTools();
  // pcaWin.webContents.openDevTools();
  // shortcutsWin.webContents.openDevTools();
  // Close main window = close main process and then very program

  win.on('closed', () => {
    win.webContents.send('clear-storage');
    win = null;
  })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
})

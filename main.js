const path = require('path');
const url = require('url');
const electronLocalshortcut = require('electron-localshortcut');
const {app, BrowserWindow, Menu, screen, globalShortcut, ipcMain, dialog} = require('electron');
const fs = require("fs");
const WIDTH_RATIO = 0.8;
const ASPECT_RATIO = 10 / 16;

// require('update-electron-app')();


// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

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
  const polesMeansPath = path.join('file://', __dirname, 'windows/polesMean.html');
  const vgpDataPath = path.join('file://', __dirname, 'windows/vgpData.html');
  const openFilesPath = path.join(__dirname, 'main_window/openFilesModal.html');
  const formatsPath = path.join(__dirname, 'windows/help/supportedFormats.html');
  const fileManagerPath = path.join(__dirname, 'windows/fileManager.html');
  const pcaPath = path.join('file://', __dirname, 'windows/pca.html');
  const fisherPath = path.join('file://', __dirname, 'windows/fisher.html');
  const foldtestPath = path.join('file://', __dirname, 'windows/foldtest.html');
  const revtestPath = path.join('file://', __dirname, 'windows/revtest.html');
  const commonMeanTestPath = path.join('file://', __dirname, 'windows/commonMeanTest.html');
  const congtestPath = path.join('file://', __dirname, 'windows/congtest.html');
  const magicExportPath = path.join('file://', __dirname, 'windows/magicExport.html');


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

  // win.once('ready-to-show', () => {
  //   win.show();
  // })
  //
  // win.maximize();

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'main_window/index.html'),
    protocol: 'file',
    slashes: true,
  }));

  ipcMain.on('reload-mainWin', () => {
    win.reload()
  });

  ipcMain.on('redraw-charts', (event) => {
    win.webContents.send('redraw');
  })

  ipcMain.on('reload-mainWin-appendFiles', () => {
    win.webContents.send('reload-appendFiles')
  })

  ipcMain.on('open-in-next-tab', (event, savePath) => {
    win.webContents.send('open-in-next-tab', savePath);
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

  ipcMain.on('open-openFilesModal', (event, disableOpenPrev) => {
    // win.hide();
    openFilesWin.show();
    // if (disableOpenPrev) openFilesWin.webContents.send('disable-openPrev');
  })
  ipcMain.on('hide-openFilesModal', () => { openFilesWin.hide(); win.show(); win.maximize(); })
  ipcMain.on('close-openFilesModal', () => { win.close(); })

  ipcMain.on('init-pages', (event, formats) => { win.webContents.send('init', formats); })

  ipcMain.on('reload-openFilesModal', () => { openFilesWin.reload() });

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
    settingsWin.webContents.send('reload-win');
    // settingsWin.reload()
  });

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

  ipcMain.on('hide-interpretData', () => {
    interpretDataWin.hide();
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

  ipcMain.on('hide-meansData', () => {
    meansDataWin.hide();
  })

  ipcMain.on('reload-meansDataWin', () => { meansDataWin.reload() });

  ipcMain.on('redraw-meansDataWin', (event) => {
    meansDataWin.webContents.send('redraw-table');
  })

  // Initialize means data window

  let vgpDataWin = new BrowserWindow({
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

  vgpDataWin.loadURL(vgpDataPath);

  vgpDataWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    vgpDataWin.hide();
  });

  ipcMain.on('toggle-vgpData', () => {
    if (vgpDataWin.isVisible()) vgpDataWin.hide();
    else vgpDataWin.show();
  })

  ipcMain.on('reload-vgpDataWin', () => { vgpDataWin.reload() });

  ipcMain.on('redraw-vgpDataWin', (event) => {
    vgpDataWin.webContents.send('redraw-table');
  })

  // Initialize poles means data window

  let polesMeansWin = new BrowserWindow({
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

  polesMeansWin.loadURL(polesMeansPath);

  polesMeansWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    polesMeansWin.hide();
  });

  ipcMain.on('toggle-polesMeansData', () => {
    if (polesMeansWin.isVisible()) polesMeansWin.hide();
    else polesMeansWin.show();
  })

  ipcMain.on('reload-polesMeansWin', () => { polesMeansWin.reload() });

  ipcMain.on('redraw-polesMeansWin', (event) => {
    polesMeansWin.webContents.send('redraw-table');
  })

  // Initialize foldtest window

  let foldtestWin = new BrowserWindow({
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

  foldtestWin.loadURL(foldtestPath);

  foldtestWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    foldtestWin.hide();
  });

  ipcMain.on('toggle-foldtest', ()  => {
    if (foldtestWin.isVisible()) foldtestWin.hide();
    else foldtestWin.show();
  });

  ipcMain.on('reload-foldtest', () => { foldtestWin.reload() });

  // Initialize revtest window

  let revtestWin = new BrowserWindow({
    width: 1000,
    height: 720,
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

  revtestWin.loadURL(revtestPath);

  revtestWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    revtestWin.hide();
  });

  ipcMain.on('toggle-revtest', ()  => {
    if (revtestWin.isVisible()) revtestWin.hide();
    else revtestWin.show();
  });

  ipcMain.on('reload-revtest', () => { revtestWin.reload() });

  // Initialize revtest window

  let commonMeanTestWin = new BrowserWindow({
    width: 1000,
    height: 720,
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

  commonMeanTestWin.loadURL(commonMeanTestPath);

  commonMeanTestWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    commonMeanTestWin.hide();
  });

  ipcMain.on('toggle-commonMeanTest', ()  => {
    if (commonMeanTestWin.isVisible()) commonMeanTestWin.hide();
    else commonMeanTestWin.show();
  });

  ipcMain.on('reload-commonMeanTest', () => { commonMeanTestWin.reload() });

  // Initialize revtest window

  let congtestWin = new BrowserWindow({
    // width: screenWidth / 3,
    height: 300,
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

  congtestWin.loadURL(congtestPath);

  congtestWin.on('close', (event) => {
    event.preventDefault();    // This will cancel the close
    congtestWin.hide();
  });

  ipcMain.on('toggle-congtest', ()  => {
    if (congtestWin.isVisible()) congtestWin.hide();
    else congtestWin.show();
  });

  ipcMain.on('reload-congtest', () => { congtestWin.reload() });

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

  // Initialize formats window

  let fileManagerWin = new BrowserWindow({
    width: screenWidth / 3,
    height: screenHeight / 3,
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

  fileManagerWin.loadURL(fileManagerPath);

  ipcMain.on('toggle-file-manager', () => {
    if (fileManagerWin.isVisible()) fileManagerWin.hide();
    else fileManagerWin.show();
  })

  ipcMain.on('reload-fileManager', () => {
    fileManagerWin.webContents.send('reload-win');
  })

  // Initialize formats window

  let magicExportWin = new BrowserWindow({
    width: screenWidth / 3,
    height: 720,
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

  magicExportWin.loadURL(magicExportPath);

  ipcMain.on('open-magic-export', () => {
    magicExportWin.show();
  })

  ipcMain.on('toggle-magic-export', () => {
    if (magicExportWin.isVisible()) magicExportWin.hide();
    else fileManagerWin.show();
  })

  ipcMain.on('reload-magicExport', () => {
    magicExportWin.webContents.send('reload-win');
  })

  // Export interpretations
  ipcMain.on('export-interpretations-xlsx', () => {
    interpretDataWin.webContents.send('export-interpretation-xlsx');
  })

  ipcMain.on('export-interpretations-csv', () => {
    interpretDataWin.webContents.send('export-interpretation-csv');
  })

  // Export means
  ipcMain.on('export-means-xlsx', () => {
    meansDataWin.webContents.send('export-means-xlsx');
  })

  ipcMain.on('export-means-csv', () => {
    meansDataWin.webContents.send('export-means-csv');
  })

  // Export poles
  ipcMain.on('export-poles-xlsx', () => {
    vgpDataWin.webContents.send('export-poles-xlsx');
  })

  ipcMain.on('export-poles-csv', () => {
    vgpDataWin.webContents.send('export-poles-csv');
  })

  // Importing
  ipcMain.on('import-files', () => {
    win.webContents.send('import-files');
  })

  ipcMain.on('import-project', () => {
    win.webContents.send('import-project');
  })

  // Initialize app shortcuts

  ipcMain.on('reload-main-win', () => {
    win.webContents.send('init');
  })

  ipcMain.on('reload-wins', () => {
    win.reload();
    specDataWin.reload();
    collDataWin.reload();
    interpretDataWin.reload();
    meansDataWin.reload();
    vgpDataWin.reload();
    fileManagerWin.reload();
  })

  electronLocalshortcut.register('f5', function() {
		win.reload();
    settingsWin.reload();
    shortcutsWin.reload();
    aboutWin.reload();
    specDataWin.reload();
    collDataWin.reload();
    interpretDataWin.reload();
    meansDataWin.reload();
    vgpDataWin.reload();
    polesMeansWin.reload();
    openFilesWin.reload();
    formatsWin.reload();
    fileManagerWin.reload();
    foldtestWin.reload();
    revtestWin.reload();
    commonMeanTestWin.reload();
    congtestWin.reload();
    magicExportWin.reload();
	})

  electronLocalshortcut.register('f1', function() {
    // if (shortcutsWin.isVisible()) shortcutsWin.hide();
    // else shortcutsWin.show();
    shortcutsWin.show();
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
  //
  // win.webContents.openDevTools();
  // openFilesWin.webContents.openDevTools();
  // formatsWin.webContents.openDevTools();
  // vgpDataWin.webContents.openDevTools();
  // settingsWin.webContents.openDevTools();
  // specDataWin.webContents.openDevTools();
  // collDataWin.webContents.openDevTools();
  // interpretDataWin.webContents.openDevTools();
  // meansDataWin.webContents.openDevTools();
  // shortcutsWin.webContents.openDevTools();
  // fileManagerWin.webContents.openDevTools();
  // polesMeansWin.webContents.openDevTools();
  // foldtestWin.webContents.openDevTools();
  // revtestWin.webContents.openDevTools();
  // commonMeanTestWin.webContents.openDevTools();
  // congtestWin.webContents.openDevTools();
  // magicExportWin.webContents.openDevTools();
  // Close main window = close main process and then very program

  win.on('close', () => {
    win.webContents.send('clear-storage');
  })

  win.on('closed', () => {
    win = null;
  })
}

app.on('ready', createWindow);

// app.on('before-quit', () => {
//   win.webContents.send('clear-storage');
// })

app.on('window-all-closed', () => {
  app.quit();
})

app.allowRendererProcessReuse = false;

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};

// NB: Use this syntax within an async function, Node does not have support for
//     top-level await as of Node 12.
// try {
//   await electronInstaller.createWindowsInstaller({
//     appDirectory: 'C:\Programms\PyProjects\pmtools_beta',
//     outputDirectory: 'C:\Programms',
//     authors: 'Ivan Efremov',
//     exe: 'PMTools.exe'
//   });
//   console.log('It worked!');
// } catch (e) {
//   console.log(`No dice: ${e.message}`);
// }

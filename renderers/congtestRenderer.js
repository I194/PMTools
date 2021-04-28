const {BrowserWindow} = require('electron').remote;
const { remote, ipcRenderer } = require('electron');
const path = require('path');

const allWindows = BrowserWindow.getAllWindows();

const mainWin = allWindows[0];
const settingsWin = allWindows[1];
const aboutWin = allWindows[2];
const helpWin = allWindows[3];
const specDataWin = allWindows[4];

// Describe custom title bar functionality

const minimizeWinBtn = document.getElementById('minimize-button');
const minmaxWinBtn = document.getElementById('min-max-button');
const closeWinBtn = document.getElementById('close-button')

minimizeWinBtn.addEventListener('click', (event) => {
  remote.getCurrentWindow().minimize();
})

minmaxWinBtn.addEventListener('click', (event) => {
  const currWin = remote.getCurrentWindow();
  if (currWin.isMaximized()) currWin.unmaximize();
  else currWin.maximize();
})

closeWinBtn.addEventListener('click', (event) => {
  remote.getCurrentWindow().hide();
})

ipcRenderer.on('reload-win', (e) => {
  init();
})

// Inner scripts

function reloadWins() {
  ipcRenderer.send('reload-specDataWin');
  ipcRenderer.send('reload-mainWin');
  ipcRenderer.send('reload-interpretDataWin');
  ipcRenderer.send('reload-fileManager');
  init();
}

function init() {
  console.log('hi');
}

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

function __init__() {

  var data = [];

  var revtestData = JSON.parse(localStorage.getItem("revtest"));
  var commonMeanData = JSON.parse(localStorage.getItem("commonMeanTest"));
  // $('select').selectpicker();

  updateFileSelect("specimen", 0, 'measurements-select');
  updateFileSelect("collection", 0, 'specimens-select');
  updateFileSelect("sitesSet", 0, 'samples-select');
  updateFileSelect("sitesSet", 0, 'sites-select');
  updateFileSelect("sitesSet", 0, 'locations-select');
}


__init__();

const { BrowserWindow, app } = require('electron').remote;
const { remote, ipcRenderer } = require('electron');
const path = require('path');
const dns = require("dns");
const fs = require("fs");
const dialog = require('electron').remote.dialog

const allWindows = BrowserWindow.getAllWindows();

const mainWin = allWindows[0];
const settingsWin = allWindows[1];
const aboutWin = allWindows[2];
const helpWin = allWindows[3];
const specDataWin = allWindows[4];

const shell = require('electron').shell;

// assuming $ is jQuery
$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

// Describe custom title bar functionality

const minimizeWinBtn = document.getElementById('minimize-button');
const closeWinBtn = document.getElementById('close-button');

minimizeWinBtn.addEventListener('click', (event) => {
  remote.getCurrentWindow().minimize();
})

closeWinBtn.addEventListener('click', (event) => {
  // remote.getCurrentWindow().hide();
  // ipcRenderer.send('close-openFilesModal');
  remote.app.quit();
})

// Inner buttons

const formatBtn = document.getElementById('formats-button');

formatBtn.addEventListener('click', (event) => {
  ipcRenderer.send('toggle-formats');
})

ipcRenderer.on('disable-openPrev', () => {
  document.getElementById('open-prev').disabled = true;
})


// Some globals

var COORDINATES = {
  pca: 'specimen',
  stat: 'geographic',
  poles: 'geographic',
}

// Inner scripts

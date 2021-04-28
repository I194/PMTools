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

function saveSettings() {
  // Global
  // var blockMouseOnZoom = document.getElementById('blockMouseOnZoom').checked;
  var autoSave = document.getElementById('autoSave').checked;
  var appendFiles = document.getElementById('appendFiles').checked;
  var dashedLines = document.getElementById('dashedLines').checked;
  var themeLight = document.getElementById('themeLight').checked;
  var themeLightP = document.getElementById('themeLightP').checked;
  var themeDark = document.getElementById('themeDark').checked;
  var themeDarkP = document.getElementById('themeDarkP').checked;
  // PCA Annotations
  var zijdAnnotations = document.getElementById('zijdAnnotations').checked;
  var stereoAnnotations = document.getElementById('stereoAnnotations').checked;
  var intensityAnnotations = document.getElementById('intensityAnnotations').checked;
  var pcaNumberMode = document.getElementById('pcaNumberMode').checked;
  var pcaStepMode = document.getElementById('pcaStepMode').checked;
  var pcaAllowOverlap = document.getElementById('pcaAllowOverlap').checked;
  var pcaAddTextOutline = document.getElementById('pcaAddTextOutline').checked;
  // PCA Highlight
  var zijdHighlight = document.getElementById('zijdHighlight').checked;
  var stereoHighlight = document.getElementById('stereoHighlight').checked;
  var intensityHighlight = document.getElementById('intensityHighlight').checked;
  // PCA hover
  var zijdHover = document.getElementById('zijdHover').checked;
  var stereoHover = document.getElementById('stereoHover').checked;
  var intensityHover = document.getElementById('intensityHover').checked;
  // PCA Hide
  var zijdHide = document.getElementById('zijdHide').checked;
  var stereoHide = document.getElementById('stereoHide').checked;
  var intensityHide = document.getElementById('intensityHide').checked;
  // PCA Show ticks
  var zijdTicks = document.getElementById('zijdTicks').checked;
  var stereoTicks = document.getElementById('stereoTicks').checked;
  var intensityTicks = document.getElementById('intensityTicks').checked;
  // PCA tooltips
  var zijdTooltips = document.getElementById('zijdTooltips').checked;
  var stereoTooltips = document.getElementById('stereoTooltips').checked;
  var intensityTooltips = document.getElementById('intensityTooltips').checked;
  // PCA error
  var stereoError = document.getElementById('stereoError').checked;
  // PCA tools selet type
  var pcaToolsText = document.getElementById('pcaToolsText').checked;
  var pcaToolsSelect = document.getElementById('pcaToolsSelect').checked;

  // Stat chart
  var statError = document.getElementById('statError').checked;
  var statAnnotations = document.getElementById('statAnnotations').checked;
  var statHighlight = document.getElementById('statHighlight').checked;
  var statHover = document.getElementById('statHover').checked;
  var statHide = document.getElementById('statHide').checked;
  var statTicks = document.getElementById('statTicks').checked;
  var statTooltips = document.getElementById('statTooltips').checked;
  var statNumberMode = document.getElementById('statNumberMode').checked;
  var statStepMode = document.getElementById('statStepMode').checked;
  var statAllowOverlap = document.getElementById('statAllowOverlap').checked;
  var statAddTextOutline = document.getElementById('statAddTextOutline').checked;
  var statDir = document.getElementById('statDir').checked;
  var statGC = document.getElementById('statGC').checked;
  // Stat tools selet type
  var statToolsText = document.getElementById('statToolsText').checked;
  var statToolsSelect = document.getElementById('statToolsSelect').checked;

  // Poles chart
  var polesError = document.getElementById('polesError').checked;
  var polesAnnotations = document.getElementById('polesAnnotations').checked;
  var polesHighlight = document.getElementById('polesHighlight').checked;
  var polesHover = document.getElementById('polesHover').checked;
  var polesHide = document.getElementById('polesHide').checked;
  var polesTicks = document.getElementById('polesTicks').checked;
  var polesTooltips = document.getElementById('polesTooltips').checked;
  var polesNumberMode = document.getElementById('polesNumberMode').checked;
  var polesStepMode = document.getElementById('polesStepMode').checked;
  var polesAllowOverlap = document.getElementById('polesAllowOverlap').checked;
  var polesAddTextOutline = document.getElementById('polesAddTextOutline').checked;
  // Poles tools selet type
  var polesToolsText = document.getElementById('polesToolsText').checked;
  var polesToolsSelect = document.getElementById('polesToolsSelect').checked;

  var settings = {
    global: {
      // blockMouseOnZoom: blockMouseOnZoom,
      autoSave: autoSave,
      appendFiles: appendFiles,
      dashedLines: dashedLines,
      themeLight: themeLight,
      themeLightP: themeLightP,
      themeDark: themeDark,
      themeDarkP: themeDarkP,
    },
    pca: {
      // PCA Annotations
      zijdAnnotations: zijdAnnotations,
      stereoAnnotations: stereoAnnotations,
      intensityAnnotations: intensityAnnotations,
      pcaNumberMode: pcaNumberMode,
      pcaStepMode: pcaStepMode,
      pcaAllowOverlap: pcaAllowOverlap,
      pcaAddTextOutline: pcaAddTextOutline,
      // PCA Highlight
      zijdHighlight: zijdHighlight,
      stereoHighlight: stereoHighlight,
      intensityHighlight: intensityHighlight,
      // PCA Hover
      zijdHighlight: zijdHover,
      stereoHighlight: stereoHover,
      intensityHighlight: intensityHover,
      // PCA Hide
      zijdHide: zijdHide,
      stereoHide: stereoHide,
      intensityHide: intensityHide,
      // PCA Show ticks
      zijdTicks: zijdTicks,
      stereoTicks: stereoTicks,
      intensityTicks: intensityTicks,
      // PCA Show tooltips
      zijdTooltips: zijdTooltips,
      stereoTooltips: stereoTooltips,
      intensityTooltips: intensityTooltips,
      // PCA Error
      stereoError: stereoError,
      // PCA tools select type
      pcaToolsText: pcaToolsText,
      pcaToolsSelect: pcaToolsSelect,
    },
    stat: {
      // Stat chart
      statError: statError,
      statAnnotations: statAnnotations,
      statHighlight: statHighlight,
      statHover: statHover,
      statHide: statHide,
      statTicks: statTicks,
      statTooltips: statTooltips,
      statNumberMode: statNumberMode,
      statStepMode: statStepMode,
      statAllowOverlap: statAllowOverlap,
      statAddTextOutline: statAddTextOutline,
      statDir: statDir,
      statGC: statGC,
      // Stat tools select type
      statToolsText: statToolsText,
      statToolsSelect: statToolsSelect,
    },
    poles: {
      // Stat chart
      polesError: polesError,
      polesAnnotations: polesAnnotations,
      polesHighlight: polesHighlight,
      polesHover: polesHover,
      polesHide: polesHide,
      polesTicks: polesTicks,
      polesTooltips: polesTooltips,
      polesNumberMode: polesNumberMode,
      polesStepMode: polesStepMode,
      polesAllowOverlap: polesAllowOverlap,
      polesAddTextOutline: polesAddTextOutline,
      // Stat tools select type
      polesToolsText: polesToolsText,
      polesToolsSelect: polesToolsSelect,
    }
  };

  localStorage.setItem("settings", JSON.stringify(settings));

}

function init() {

  if (localStorage.settings != null) {
    var settings = JSON.parse(localStorage.getItem("settings"));

    Object.keys(settings).forEach((type, i) => {
      Object.entries(settings[type]).forEach(([key, value]) => {
        document.getElementById(key).checked = value;
      });
    });

  }
  else saveSettings();
}

init();

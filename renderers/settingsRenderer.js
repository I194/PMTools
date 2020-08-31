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

// Inner scripts

function reloadWins() {
  ipcRenderer.send('reload-specDataWin');
  ipcRenderer.send('reload-mainWin');
  ipcRenderer.send('reload-interpretDataWin');
  init();
}

function saveSettings() {

  // Global
  var blockMouseOnZoom = document.getElementById('block-mouse-on-zoom').checked;
  var autoSave = document.getElementById('auto-save').checked;
  var dashedLines = document.getElementById('dashed-lines').checked;
  // PCA Annotations
  var zijdAnnotations = document.getElementById('zijd-annotations').checked;
  var stereoAnnotations = document.getElementById('stereo-annotations').checked;
  var intensityAnnotations = document.getElementById('intensity-annotations').checked;
  var pcaNumberMode = document.getElementById('pca-number-mode').checked;
  var pcaStepMode = document.getElementById('pca-step-mode').checked;
  var pcaAllowOverlap = document.getElementById('pca-allow-overlap').checked;
  var pcaAddTextOutline = document.getElementById('pca-add-text-outline').checked;
  // PCA Highlight
  var zijdHighlight = document.getElementById('zijd-hover').checked;
  var stereoHighlight = document.getElementById('stereo-hover').checked;
  var intensityHighlight = document.getElementById('intensity-hover').checked;
  // PCA hover
  var zijdHover = document.getElementById('zijd-highlight').checked;
  var stereoHover = document.getElementById('stereo-highlight').checked;
  var intensityHover = document.getElementById('intensity-highlight').checked;
  // PCA Hide
  var zijdHide = document.getElementById('zijd-hide').checked;
  var stereoHide = document.getElementById('stereo-hide').checked;
  var intensityHide = document.getElementById('intensity-hide').checked;
  // PCA Show ticks
  var zijdTicks = document.getElementById('zijd-ticks').checked;
  var stereoTicks = document.getElementById('stereo-ticks').checked;
  var intensityTicks = document.getElementById('intensity-ticks').checked;
  // PCA tooltips
  var zijdTooltips = document.getElementById('zijd-tooltips').checked;
  var stereoTooltips = document.getElementById('stereo-tooltips').checked;
  var intensityTooltips = document.getElementById('intensity-tooltips').checked;
  // PCA error
  var stereoError = document.getElementById('stereo-evid-ellipse').checked;
  // PCA tools selet type
  var pcaToolsText = document.getElementById('pca-tools-text').checked;
  var pcaToolsSelect = document.getElementById('pca-tools-select').checked;


  // Stat chart
  var statError = document.getElementById('stat-evid-ellipse').checked;
  var statAnnotations = document.getElementById('stat-annotations').checked;
  var statHighlight = document.getElementById('stat-highlight').checked;
  var statHover = document.getElementById('stat-highlight').checked;
  var statHide = document.getElementById('stat-hide').checked;
  var statTicks = document.getElementById('stat-ticks').checked;
  var statTooltips = document.getElementById('stat-tooltips').checked;
  var statNumberMode = document.getElementById('stat-number-mode').checked;
  var statStepMode = document.getElementById('stat-step-mode').checked;
  var statAllowOverlap = document.getElementById('stat-allow-overlap').checked;
  var statAddTextOutline = document.getElementById('stat-add-text-outline').checked;
  // Stat tools selet type
  var statToolsText = document.getElementById('stat-tools-text').checked;
  var statToolsSelect = document.getElementById('stat-tools-select').checked;

  var settings = {
    global: {
      blockMouseOnZoom: blockMouseOnZoom,
      autoSave: autoSave,
      dashedLines: dashedLines,
    },
    pca: {
      // PCA Annotations
      zijdAnnotations: zijdAnnotations,
      stereoAnnotations: stereoAnnotations,
      intensityAnnotations: intensityAnnotations,
      numberMode: pcaNumberMode,
      stepMode: pcaStepMode,
      allowOverlap: pcaAllowOverlap,
      addTextOutline: pcaAddTextOutline,
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
      toolsText: pcaToolsText,
      toolsSelect: pcaToolsSelect,
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
      numberMode: statNumberMode,
      stepMode: statStepMode,
      allowOverlap: statAllowOverlap,
      addTextOutline: statAddTextOutline,
      // Stat tools select type
      toolsText: statToolsText,
      toolsSelect: statToolsSelect,
    }
  };
  console.log(settings);
  localStorage.setItem("settings", JSON.stringify(settings));

}

function init() {

  // Global
  var blockMouseOnZoom = document.getElementById('block-mouse-on-zoom');
  var autoSave = document.getElementById('auto-save');
  var dashedLines = document.getElementById('dashed-lines');
  // PCA Annotations
  var zijdAnnotations = document.getElementById('zijd-annotations');
  var stereoAnnotations = document.getElementById('stereo-annotations');
  var intensityAnnotations = document.getElementById('intensity-annotations');
  var pcaNumberMode = document.getElementById('pca-number-mode');
  var pcaStepMode = document.getElementById('pca-step-mode');
  var pcaAllowOverlap = document.getElementById('pca-allow-overlap');
  var pcaAddTextOutline = document.getElementById('pca-add-text-outline');
  // PCA Highlight
  var zijdHighlight = document.getElementById('zijd-highlight');
  var stereoHighlight = document.getElementById('stereo-highlight');
  var intensityHighlight = document.getElementById('intensity-highlight');
  // PCA Hover
  var zijdHover = document.getElementById('zijd-hover');
  var stereoHover = document.getElementById('stereo-hover');
  var intensityHover = document.getElementById('intensity-hover');
  // PCA Hide
  var zijdHide = document.getElementById('zijd-hide');
  var stereoHide = document.getElementById('stereo-hide');
  var intensityHide = document.getElementById('intensity-hide');
  // PCA Show ticks
  var zijdTicks = document.getElementById('zijd-ticks');
  var stereoTicks = document.getElementById('stereo-ticks');
  var intensityTicks = document.getElementById('intensity-ticks');
  // PCA tooltips
  var zijdTooltips = document.getElementById('zijd-tooltips');
  var stereoTooltips = document.getElementById('stereo-tooltips');
  var intensityTooltips = document.getElementById('intensity-tooltips');
  // PCA error
  var stereoError = document.getElementById('stereo-evid-ellipse');
  // PCA tools selet type
  var pcaToolsText = document.getElementById('pca-tools-text');
  var pcaToolsSelect = document.getElementById('pca-tools-select');

  // Stat error
  var statError = document.getElementById('stat-evid-ellipse');
  var statAnnotations = document.getElementById('stat-annotations');
  var statHighlight = document.getElementById('stat-highlight');
  var statHide = document.getElementById('stat-hide');
  var statTicks = document.getElementById('stat-ticks');
  var statTooltips = document.getElementById('stat-tooltips');
  var statNumberMode = document.getElementById('stat-number-mode');
  var statStepMode = document.getElementById('stat-step-mode');
  var statAllowOverlap = document.getElementById('stat-allow-overlap');
  var statAddTextOutline = document.getElementById('stat-add-text-outline');
  // Stat tools selet type
  var statToolsText = document.getElementById('stat-tools-text');
  var statToolsSelect = document.getElementById('stat-tools-select');

  if (localStorage.settings != null) {
    var settings = JSON.parse(localStorage.getItem("settings"));

    var globalSettings = [
      blockMouseOnZoom, autoSave, dashedLines
    ];

    var pcaSettings = [
      zijdAnnotations, stereoAnnotations, intensityAnnotations,
      pcaNumberMode, pcaStepMode, pcaAllowOverlap, pcaAddTextOutline,
      zijdHighlight, stereoHighlight, intensityHighlight,
      zijdHover, stereoHover, intensityHover,
      zijdHide, stereoHide, intensityHide,
      zijdTicks, stereoTicks, intensityTicks,
      zijdTooltips, stereoTooltips, intensityTooltips,
      stereoError,
      pcaToolsText, pcaToolsSelect,
    ];

    var statSettings = [
      statError, statAnnotations, statHighlight,
      statHover, statHide, statTicks, statTooltips,
      statNumberMode, statStepMode, statAllowOverlap,statAddTextOutline,
      statToolsText, statToolsSelect,
    ];

    var i = 0;
    for (option in settings.global) {
      globalSettings[i].checked = settings.global[option];
      i++;
    };

    var i = 0;
    for (option in settings.pca) {
      pcaSettings[i].checked = settings.pca[option];
      i++;
    };

    var i = 0;
    for (option in settings.stat) {
      statSettings[i].checked = settings.stat[option];
      i++;
    };
    console.log(settings);
  }
  else saveSettings();
}

init();
// saveSettings();

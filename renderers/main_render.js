const { BrowserWindow, Menu, MenuItem, app } = require('electron').remote;
const { remote, ipcRenderer, } = require('electron');
const path = require('path');
const customTitlebar = require('custom-electron-titlebar');
const dns = require("dns");
const fs = require("fs");
const dialog = require('electron').remote.dialog

var settings = JSON.parse(localStorage.getItem("settings"));

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
  clearLocalStorage();
  remote.app.quit();
})

// Describing child windows opening

const toggleSettingsWinBtn = document.getElementById('settings-toggle');
const toggleShortcutsWinBtn = document.getElementById('shortcuts-toggle');
const toggleFormatsWinBtn = document.getElementById('formats-toggle');
const toggleAboutWinBtn = document.getElementById('about-toggle');
const toggleSpecDataWinBtn = document.getElementById('specimen-data-toggle');
const toggleCollDataWinBtn = document.getElementById('collection-data-toggle');
const toggleInterpretDataWinBtn = document.getElementById('interpretation-data-toggle');
const toggleMeanDataWinBtn = document.getElementById('mean-data-toggle');
const toggleVGPDataWinBtn = document.getElementById('vgp-data-toggle');

toggleSettingsWinBtn.addEventListener('click', (event) => {
  if ($('#settings-toggle').is(":focus")) $('#settings-toggle').blur();
  else $('#settings-toggle').focus();
  ipcRenderer.send('toggle-settings');
});

toggleShortcutsWinBtn.addEventListener('click', (event) => {
  if ($('#shortcuts-toggle').is(":focus")) $('#shortcuts-toggle').blur();
  else $('#shortcuts-toggle').focus();
  $("#menu-help").click();
  ipcRenderer.send('toggle-shortcuts');
});

toggleFormatsWinBtn.addEventListener('click', (event) => {
  if ($('#formats-toggle').is(":focus")) $('#formats-toggle').blur();
  else $('#formats-toggle').focus();
  $("#menu-help").click();
  ipcRenderer.send('toggle-formats');
})

toggleAboutWinBtn.addEventListener('click', (event) => {
  if ($('#about-toggle').is(":focus")) $('#about-toggle').blur();
  else $('#about-toggle').focus();
  ipcRenderer.send('toggle-about');
});

toggleSpecDataWinBtn.addEventListener('click', (event) => {
  if ($('#specimen-data-toggle').is(":focus")) $('#specimen-data-toggle').blur();
  else $('#specimen-data-toggle').focus();
  ipcRenderer.send('toggle-specData');
});

toggleCollDataWinBtn.addEventListener('click', (event) => {
  if ($('#collection-data-toggle').is(":focus")) $('#collection-data-toggle').blur();
  else $('#collection-data-toggle').focus();
  localStorage.setItem("dirMode", DIRECTION_MODE);
  ipcRenderer.send('toggle-collData');
});

toggleInterpretDataWinBtn.addEventListener('click', (event) => {
  if ($('#interpretation-data-toggle').is(":focus")) $('#interpretation-data-toggle').blur();
  else $('#interpretation-data-toggle').focus();
  ipcRenderer.send('toggle-interpretData');
});

toggleMeanDataWinBtn.addEventListener('click', (event) => {
  if ($('#mean-data-toggle').is(":focus")) $('#mean-data-toggle').blur();
  else $('#mean-data-toggle').focus();
  localStorage.setItem("dirMode", DIRECTION_MODE);
  ipcRenderer.send('toggle-meansData');
});

toggleVGPDataWinBtn.addEventListener('click', (event) => {
  if ($('#vgp-data-toggle').is(":focus")) $('#vgp-data-toggle').blur();
  else $('#vgp-data-toggle').focus();
  ipcRenderer.send('toggle-vgpData');
})

ipcRenderer.on('saved-file', (event, path) => {
  if (!path) path = 'No path'
})

// focus and blur stat btns

const pcaToggle = document.getElementById('pca-btn');
const pca0Toggle = document.getElementById('pca0-btn');
const gcToggle = document.getElementById('gc-btn');
const gcnToggle = document.getElementById('gcn-btn');
// const fToggle = document.getElementById('f-btn');

// pcaToggle.addEventListener('click', (event) => {
//   if ($('#pca-btn').is(":focus")) $('#pca-btn').blur();
//   else $('#pca-btn').focus();
// });
//
// pca0Toggle.addEventListener('click', (event) => {
//   if ($('#pca0-btn').is(":focus")) $('#pca0-btn').blur();
//   else $('#pca0-btn').focus();
// });


// stat btns cancel and confirm

const cancelPCA = document.getElementById('pca-pca-cancel');
const confirmPCA = document.getElementById('pca-pca-confirm');
const cancelPCA0 = document.getElementById('pca-pca0-cancel');
const confirmPCA0 = document.getElementById('pca-pca0-confirm');
const cancelPCAGC = document.getElementById('pca-gc-cancel');
const confirmPCAGC = document.getElementById('pca-gc-confirm');
const cancelPCAGCn = document.getElementById('pca-gcn-cancel');
const confirmPCAGCn = document.getElementById('pca-gcn-confirm');
const cancelPCAErase = document.getElementById('pca-erase-cancel');
const confirmPCAErase = document.getElementById('pca-erase-confirm');

const confirmF = document.getElementById('stat-f-confirm');
const cancelF = document.getElementById('stat-f-cancel');
const confirmStatGC = document.getElementById('stat-gc-confirm');
const cancelStatGC = document.getElementById('stat-gc-cancel');
const confirmStatGCn = document.getElementById('stat-gcn-confirm');
const cancelStatGCn = document.getElementById('stat-gcn-cancel');
const confirmStatErase = document.getElementById('stat-erase-confirm');
const cancelStatErase = document.getElementById('stat-erase-cancel');

cancelPCA.addEventListener('click', (event) => {
  document.getElementById('pca-pca-btn').click();
  dotSelector.render(false);
});

confirmPCA.addEventListener('click', (event) => {
  if (settings.pca.toolsText) {
    dotSelector.readDots('pca-pca-text-input', 'specimen');
    if (document.getElementById('pca-pca-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('pca-pca-first-step', 'pca-pca-last-step');
  makeInterpretation("TAU1", false, undefined, "PCA");
  document.getElementById('pca-pca-btn').click();
});

cancelPCA0.addEventListener('click', (event) => {
  document.getElementById('pca-pca0-btn').click();
  dotSelector.render(false);
});

confirmPCA0.addEventListener('click', (event) => {
  if (settings.pca.toolsText) {
    dotSelector.readDots('pca-pca0-text-input', 'specimen');
  if (document.getElementById('pca-pca0-text-input', 'specimen').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('pca-pca0-first-step', 'pca-pca0-last-step');
  makeInterpretation("TAU1", true, undefined, "PCA0");
  document.getElementById('pca-pca0-btn').click();
});

cancelPCAGC.addEventListener('click', (event) => {
  document.getElementById('pca-gc-btn').click();
  dotSelector.render(false);
});

confirmPCAGC.addEventListener('click', (event) => {
  if (settings.pca.toolsText) {
    dotSelector.readDots('pca-gc-text-input', 'specimen');
  if (document.getElementById('pca-gc-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('pca-gc-first-step', 'pca-gc-last-step');
  makeInterpretation("TAU3", true, false, "GC PCA");
  document.getElementById('pca-gc-btn').click();
});

cancelPCAGCn.addEventListener('click', (event) => {
  document.getElementById('pca-gcn-btn').click();
  dotSelector.render(false);
});

confirmPCAGCn.addEventListener('click', (event) => {
  if (settings.pca.toolsText) {
    dotSelector.readDots('pca-gcn-text-input', 'specimen');
  if (document.getElementById('pca-gcn-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('pca-gcn-first-step', 'pca-gcn-last-step');
  makeInterpretation("TAU3", true, true, "GCn PCA");
  document.getElementById('pca-gcn-btn').click();
});

cancelPCAErase.addEventListener('click', (event) => {
  dotSelector.clearValue();
  document.getElementById('pca-erase-btn').click();
});

confirmPCAErase.addEventListener('click', (event) => {
  dotSelector.readDots('pca-erase-text-input', 'specimen');
  if (document.getElementById('pca-erase-text-input').classList.contains('error-input')) return;
  eraseSteps('specimen');
  document.getElementById('pca-erase-btn').click();
});

// stat

confirmStatErase.addEventListener('click', (event) => {
  dotSelector.readDots('stat-erase-text-input', 'collection');
  if (document.getElementById('stat-erase-text-input').classList.contains('error-input')) return;
  eraseSteps('collection');
  document.getElementById('stat-erase-btn').click();
});

cancelStatErase.addEventListener('click', (event) => {
  document.getElementById('stat-erase-btn').click();
  dotSelector.render(false);
});

confirmF.addEventListener('click', (event) => {
  if (settings.stat.toolsText) {
    dotSelector.readDots('stat-f-text-input', 'collection');
    if (document.getElementById('stat-f-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('stat-f-first-step', 'stat-f-last-step');
  makeFisherMean('collection');
  document.getElementById('stat-f-btn').click();
})

cancelF.addEventListener('click', (event) => {
  document.getElementById('stat-f-btn').click();
  dotSelector.render(false);
})

confirmStatGC.addEventListener('click', (event) => {
  if (settings.stat.toolsText) {
    dotSelector.readDots('stat-gc-text-input', 'collection');
    if (document.getElementById('stat-gc-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('stat-gc-first-step', 'stat-gc-last-step');
  makeStatGC(false);
  document.getElementById('stat-gc-btn').click();
})

cancelStatGC.addEventListener('click', (event) => {
  document.getElementById('stat-gc-btn').click();
  dotSelector.render(false);
})

confirmStatGCn.addEventListener('click', (event) => {
  if (settings.stat.toolsText) {
    dotSelector.readDots('stat-gcn-text-input', 'collection');
    if (document.getElementById('stat-gcn-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('stat-gcn-first-step', 'stat-gcn-last-step');
  makeStatGC(true);
  document.getElementById('stat-gcn-btn').click();
})

cancelStatGCn.addEventListener('click', (event) => {
  document.getElementById('stat-gcn-btn').click();
  dotSelector.render(false);
})

ipcRenderer.on('redraw', (event) => {
  console.log('що Hi');
  updateLocalStorage();
  dotSelector.render(redraw = true, hover = false);
})

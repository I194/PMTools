const { BrowserWindow, Menu, MenuItem, app } = require('electron').remote;
const { remote, ipcRenderer, } = require('electron');
const path = require('path');
const customTitlebar = require('custom-electron-titlebar');
const dns = require("dns");
const fs = require("fs");
const dialog = require('electron').remote.dialog

const shell = require('electron').shell;

// assuming $ is jQuery
$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

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

// ipcRenderer.on('init', () => {
//   __init__();
//
//   var keyboardEvent = document.createEvent("KeyboardEvent");
//   var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";
//
//   keyboardEvent[initMethod](
//     "keydown", // event type: keydown, keyup, keypress
//     true,      // bubbles
//     true,      // cancelable
//     window,    // view: should be window
//     false,     // ctrlKey
//     false,     // altKey
//     false,     // shiftKey
//     false,     // metaKey
//     116,        // keyCode: unsigned long - the virtual key code, else 0
//     // 0          // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
//   );
//   document.dispatchEvent(keyboardEvent);
// })

// Describing child windows opening

const toggleFileManagerWinBtn = document.getElementById('file-manager-toggle');
const toggleSettingsWinBtn = document.getElementById('settings-toggle');
const toggleShortcutsWinBtn = document.getElementById('shortcuts-toggle');
const toggleFormatsWinBtn = document.getElementById('formats-toggle');
const toggleAboutWinBtn = document.getElementById('about-toggle');
const toggleSpecDataWinBtn = document.getElementById('specimen-data-toggle');
const toggleCollDataWinBtn = document.getElementById('collection-data-toggle');
const toggleInterpretDataWinBtn = document.getElementById('interpretation-data-toggle');
const toggleMeanDataWinBtn = document.getElementById('mean-data-toggle');
const toggleVGPDataWinBtn = document.getElementById('vgp-data-toggle');
const togglePolesMeanWinBtn = document.getElementById('pole-means-toggle');
const toggleFoldtestWinBtn = document.getElementById('foldtest-toggle');
const toggleRevtestWinBtn = document.getElementById('revtest-toggle');
const toggleCommonMeanTestWinBtn = document.getElementById('commonMeanTest-toggle');
const toggleCongtestWinBtn = document.getElementById('congtest-toggle');

// const toggleMagicExport = document.getElementById('')

toggleFileManagerWinBtn.addEventListener('click', (event) => {
  if ($('#file-manager-toggle').is(":focus")) $('#file-manager-toggle').blur();
  else $('#file-manager-toggle').focus();
  ipcRenderer.send('toggle-file-manager');
});

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

toggleFoldtestWinBtn.addEventListener('click', (event) => {
  if ($('#foldtest-toggle').is(":focus")) $('#foldtest-toggle').blur();
  else $('#foldtest-toggle').focus();
  ipcRenderer.send('toggle-foldtest');
});

toggleRevtestWinBtn.addEventListener('click', (event) => {
  if ($('#revtest-toggle').is(":focus")) $('#revtest-toggle').blur();
  else $('#revtest-toggle').focus();
  ipcRenderer.send('toggle-revtest');
});

toggleCommonMeanTestWinBtn.addEventListener('click', (event) => {
  if ($('#commonMeanTest-toggle').is(":focus")) $('#commonMeanTest-toggle').blur();
  else $('#commonMeanTest-toggle').focus();
  ipcRenderer.send('toggle-commonMeanTest');
});

toggleCongtestWinBtn.addEventListener('click', (event) => {
  if ($('#congtest-toggle').is(":focus")) $('#congtest-toggle').blur();
  else $('#congtest-toggle').focus();
  ipcRenderer.send('toggle-congtest');
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

togglePolesMeanWinBtn.addEventListener('click', (event) => {
  if ($('#pole-means-toggle').is(":focus")) $('#pole-means-toggle').blur();
  else $('#pole-means-toggle').focus();
  localStorage.setItem("dirMode", DIRECTION_MODE);
  ipcRenderer.send('toggle-polesMeansData');
});

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

const confirmStatF = document.getElementById('stat-f-confirm');
const cancelStatF = document.getElementById('stat-f-cancel');
const confirmStatM = document.getElementById('stat-m-confirm');
const cancelStatM = document.getElementById('stat-m-cancel');
const confirmStatGC = document.getElementById('stat-gc-confirm');
const cancelStatGC = document.getElementById('stat-gc-cancel');
const confirmStatGCn = document.getElementById('stat-gcn-confirm');
const cancelStatGCn = document.getElementById('stat-gcn-cancel');
const confirmStatErase = document.getElementById('stat-erase-confirm');
const cancelStatErase = document.getElementById('stat-erase-cancel');
const confirmStatReverse = document.getElementById('stat-reverse-confirm');
const cancelStatReverse = document.getElementById('stat-reverse-cancel');

const confirmPolesF = document.getElementById('poles-f-confirm');
const cancelPolesF = document.getElementById('poles-f-cancel');
const confirmM = document.getElementById('poles-m-confirm');
const cancelM = document.getElementById('poles-m-cancel');
const confirmPolesGC = document.getElementById('poles-gc-confirm');
const cancelPolesGC = document.getElementById('poles-gc-cancel');
const confirmPolesGCn = document.getElementById('poles-gcn-confirm');
const cancelPolesGCn = document.getElementById('poles-gcn-cancel');
const confirmPolesErase = document.getElementById('poles-erase-confirm');
const cancelPolesErase = document.getElementById('poles-erase-cancel');
const confirmPolesReverse = document.getElementById('poles-reverse-confirm');
const cancelPolesReverse = document.getElementById('poles-reverse-cancel');

cancelPCA.addEventListener('click', (event) => {
  document.getElementById('pca-pca-btn').click();
  dotSelector.render(false);
});

confirmPCA.addEventListener('click', (event) => {
  var time = performance.now();
  if (settings.pca.pcaToolsText) {
    dotSelector.readDots('pca-pca-text-input', 'specimen');
    if (document.getElementById('pca-pca-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('pca-pca-first-step', 'pca-pca-last-step');
  time1 = performance.now() - time;
  console.log('Время выполнения (dot selector stuff) = ', time1);
  makeInterpretation("TAU1", false, undefined, "PCA");
  time2 = performance.now() - time;
  console.log('Время выполнения (interpretation stuff) = ', time2);
  document.getElementById('pca-pca-btn').click();
  time3 = performance.now() - time;
  console.log('Время выполнения (all) = ', time3);
});

cancelPCA0.addEventListener('click', (event) => {
  document.getElementById('pca-pca0-btn').click();
  dotSelector.render(false);
});

confirmPCA0.addEventListener('click', (event) => {
  if (settings.pca.pcaToolsText) {
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
  if (settings.pca.pcaToolsText) {
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
  if (settings.pca.pcaToolsText) {
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

confirmStatF.addEventListener('click', (event) => {
  if (settings.stat.statToolsText) {
    dotSelector.readDots('stat-f-text-input', 'collection');
    if (document.getElementById('stat-f-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('stat-f-first-step', 'stat-f-last-step');
  makeFisherMean('collection');
  document.getElementById('stat-f-btn').click();
})

cancelStatF.addEventListener('click', (event) => {
  document.getElementById('stat-f-btn').click();
  dotSelector.render(false);
})

confirmStatM.addEventListener('click', (event) => {
  if (settings.stat.statToolsText) {
    dotSelector.readDots('stat-m-text-input', 'collection');
    if (document.getElementById('stat-m-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('stat-m-first-step', 'stat-m-last-step');
  makeFisherMean('collection', true);
  document.getElementById('stat-m-btn').click();
})

cancelStatM.addEventListener('click', (event) => {
  document.getElementById('stat-m-btn').click();
  dotSelector.render(false);
})


confirmStatGC.addEventListener('click', (event) => {
  if (settings.stat.statToolsText) {
    dotSelector.readDots('stat-gc-text-input', 'collection');
    if (document.getElementById('stat-gc-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('stat-gc-first-step', 'stat-gc-last-step');
  makeStatGC(false, 'collection');
  document.getElementById('stat-gc-btn').click();
})

cancelStatGC.addEventListener('click', (event) => {
  document.getElementById('stat-gc-btn').click();
  dotSelector.render(false);
})

confirmStatGCn.addEventListener('click', (event) => {
  if (settings.stat.statToolsText) {
    dotSelector.readDots('stat-gcn-text-input', 'collection');
    if (document.getElementById('stat-gcn-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('stat-gcn-first-step', 'stat-gcn-last-step');
  makeStatGC(true, 'collection');
  document.getElementById('stat-gcn-btn').click();
})

cancelStatGCn.addEventListener('click', (event) => {
  document.getElementById('stat-gcn-btn').click();
  dotSelector.render(false);
})

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

confirmStatReverse.addEventListener('click', (event) => {
  dotSelector.readDots('stat-reverse-text-input', 'collection');
  if (document.getElementById('stat-reverse-text-input').classList.contains('error-input')) return;
  reverseDots('collection');
  document.getElementById('stat-reverse-btn').click();
});

cancelStatReverse.addEventListener('click', (event) => {
  document.getElementById('stat-reverse-btn').click();
  dotSelector.render(false);
});

// poleSeries

confirmPolesF.addEventListener('click', (event) => {
  if (settings.poles.polesToolsText) {
    dotSelector.readDots('poles-f-text-input', 'sitesSet');
    if (document.getElementById('poles-f-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('poles-f-first-step', 'poles-f-last-step');
  makeFisherMean('sitesSet');
  document.getElementById('poles-f-btn').click();
})

cancelPolesF.addEventListener('click', (event) => {
  document.getElementById('poles-f-btn').click();
  dotSelector.render(false);
})

confirmM.addEventListener('click', (event) => {
  if (settings.poles.polesToolsText) {
    dotSelector.readDots('poles-m-text-input', 'sitesSet');
    if (document.getElementById('poles-m-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('poles-m-first-step', 'poles-m-last-step');
  makeFisherMean('sitesSet', true);
  document.getElementById('poles-m-btn').click();
})

cancelM.addEventListener('click', (event) => {
  document.getElementById('poles-m-btn').click();
  dotSelector.render(false);
})

confirmPolesGC.addEventListener('click', (event) => {
  if (settings.poles.polesToolsText) {
    dotSelector.readDots('poles-gc-text-input', 'sitesSet');
    if (document.getElementById('poles-gc-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('poles-gc-first-step', 'poles-gc-last-step');
  makeStatGC(false, 'sitesSet');
  document.getElementById('poles-gc-btn').click();
})

cancelPolesGC.addEventListener('click', (event) => {
  document.getElementById('poles-gc-btn').click();
  dotSelector.render(false);
})

confirmPolesGCn.addEventListener('click', (event) => {
  if (settings.poles.polesToolsText) {
    dotSelector.readDots('poles-gcn-text-input', 'sitesSet');
    if (document.getElementById('poles-gcn-text-input').classList.contains('error-input')) return;
  }
  else dotSelector.selectSteps('poles-gcn-first-step', 'poles-gcn-last-step');
  makeStatGC(true, 'sitesSet');
  document.getElementById('poles-gcn-btn').click();
})

cancelPolesGCn.addEventListener('click', (event) => {
  document.getElementById('poles-gcn-btn').click();
  dotSelector.render(false);
})

confirmPolesErase.addEventListener('click', (event) => {
  dotSelector.readDots('poles-erase-text-input', 'sitesSet');
  if (document.getElementById('poles-erase-text-input').classList.contains('error-input')) return;
  eraseSteps('collection');
  document.getElementById('poles-erase-btn').click();
});

cancelPolesErase.addEventListener('click', (event) => {
  document.getElementById('poles-erase-btn').click();
  dotSelector.render(false);
});

confirmPolesReverse.addEventListener('click', (event) => {
  dotSelector.readDots('poles-reverse-text-input', 'sitesSet');
  if (document.getElementById('poles-reverse-text-input').classList.contains('error-input')) return;
  reverseDots('collection');
  document.getElementById('poles-reverse-btn').click();
});

cancelPolesReverse.addEventListener('click', (event) => {
  document.getElementById('poles-reverse-btn').click();
  dotSelector.render(false);
});

ipcRenderer.on('redraw', (event) => {
  updateLocalStorage();
  dotSelector.render(redraw = true, hover = false);
})

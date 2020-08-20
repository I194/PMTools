const {BrowserWindow} = require('electron').remote;
const { ipcRenderer } = require('electron');
const path = require('path');
const customTitlebar = require('custom-electron-titlebar');

const hidePCAWinBtn = document.getElementById('hide-pca');
const confirmPCAWinBtn = document.getElementById('confirm-pca');

hidePCAWinBtn.addEventListener('click', (event) => {
  ipcRenderer.send('hide-pca');
});

confirmPCAWinBtn.addEventListener('click', (event) => {
  // do pca
  // makeInterpretation(specimen, "TAU1", false);
  ipcRenderer.send('hide-pca');
})

document.addEventListener('keydown', (event) => {
  console.log(event)
  if (event.keyCode === 27) ipcRenderer.send('hide-pca'); // esc btn
  if (event.keyCode === 13) {
    // do pca
    // makeInterpretation(specimen, "TAU1", false);
    ipcRenderer.send('hide-pca');
  }
})

// Describe custom title bar

// new customTitlebar.Titlebar({
// 	backgroundColor: customTitlebar.Color.fromHex('#444'),
//   icon: "../img/pm-tools-app-icon-dark.ico",
//   hideWhenClickingClose: true,
//   minimizable: false,
//   maximizable: false,
// });

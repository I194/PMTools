const { BrowserWindow, Menu, MenuItem, app } = require('electron').remote;
const { remote, ipcRenderer, } = require('electron');
const path = require('path');
const customTitlebar = require('custom-electron-titlebar');
const dns = require("dns");
const fs = require("fs");
const dialog = require('electron').remote.dialog

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

ipcRenderer.on('redraw-table', (event) => {
  updateVGPTable();
})

ipcRenderer.on('export-poles-xlsx', (event) => {
  downloadVGPsXLSX();
})

ipcRenderer.on('export-poles-csv', (event) => {
  downloadVGPsCSV();
})

// Inner scripts

// CSV delimiters
const ITEM_DELIMITER = ",";
const TAB_DELIMITER = "\t";
const LINE_DELIMITER = "\n";

var tableContainer = document.getElementById("vgp-table-container");

window.addEventListener("resize", resizeTable);

function resizeTable() {

  tableContainer.style.height = window.innerHeight - document.getElementById('static-elements').offsetHeight - 5  + "px";

}

// Updates the table with information on interpreted components
function updateVGPTable() {

  /*
   * Function updateInterpretationTable
   * Updates the table with information on interpreted components
   */

  const COMMENT_LENGTH = 15;
  const ERROR_NO_MEANS = "<h6 class='text-muted text-center' title='Make means to see them'>No means available</h6>";
  const ChRM_COMMENT = "";

  var sitesSets = JSON.parse(localStorage.getItem("sitesSets"));
  var sitesSet = JSON.parse(localStorage.getItem("selectedSitesSet"));

  var coordinates = JSON.parse(localStorage.getItem("coordinates"));
  var COORDINATES = (coordinates) ? coordinates.data : {pca: 'specimen', stat: 'geographic', poles: 'geographic'};

  var system = 'geo';
  if (COORDINATES.poles == 'tectonic') system = 'strat';

  var saveBtns = new Array(
    "<div class='btn-group btn-block btn-group-sm btn-group-justified d-flex mx-auto'>",
    "  <button onclick='downloadVGPsCSV()' type='button' title='Save VGPs data as .csv' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    <i class='fal fa-file-csv'></i>",
    "  </button>",
    "  <button onclick='downloadVGPsXLSX()' type='button' title='Save VGPs data as .xlsx' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    <i class='fal fa-file-excel'></i>",
    "  </button>",
    "</div>"
  ).join("\n");

  var poleHeader = new Array(
    "<table id='meanDataTable' class='table table-sm table-bordered w-100 small text-center' style='text-align: center!important; margin: 0;'>",
    "  <thead class='thead-light fixed-header'>",
    "    <tr>",
    "      <th class='pb-0'>ID" + putCopyColBtn(".id") + "</th>",
    "      <th class='pb-0'>pole lat" + putCopyColBtn(".plat") + "</th>",
    "      <th class='pb-0'>pole lon" + putCopyColBtn(".plon") + "</th>",
    "      <th class='pb-0'>paleoLat" + putCopyColBtn(".paleolat") + "</th>",
    "      <th class='pb-0'>dp" + putCopyColBtn(".dp") + "</th>",
    "      <th class='pb-0'>dm" + putCopyColBtn(".dm") + "</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  // Start adding all the specimens

  var allPoleRows = new Array();

  sitesSet.sites.forEach(function(site, i) {

    var vgp = site.vgp;
    var num = vgp.index + 1;

    allPoleRows.push([
      "    <tr class='' title=''>",
      "      <td class='id'>" + num + "</td>",
      "      <td class='plat'>" + vgp[system].lat.toFixed(2) + "</td>",
      "      <td class='plon'>" + vgp[system].lng.toFixed(2) + "</td>",
      "      <td class='paleolat'>" + vgp[system].pLat.toFixed(2) + "</td>",
      "      <td class='dp'>" + vgp[system].dp.toFixed(2) + "</td>",
      "      <td class='dm'>" + vgp[system].dm.toFixed(2) + "</td>",
      "    </tr>",
    ].join("\n"));

  });

  var tableFooter = "</table>";
  document.getElementById("vgp-table-container").innerHTML = poleHeader + allPoleRows.join("\n") + tableFooter;
  document.getElementById("save-dataTable").innerHTML = saveBtns;
}

function saveLocalStorage(collections, selectedCollection) {

  /*
   * Function saveLocalStorage
   * Saves sample object to local storage
   */

  localStorage.setItem("sitesSets", JSON.stringify(sitesSets));
  localStorage.setItem("selectedSitesSet", JSON.stringify(selectedSitesSet));

}

// Downloads all interpreted components to a CSV (export data)
function downloadVGPsCSV() {

  var sitesSet = JSON.parse(localStorage.getItem("selectedSitesSet"));

  var coordinates = JSON.parse(localStorage.getItem("coordinates"));
  var COORDINATES = (coordinates) ? coordinates.data : {pca: 'specimen', stat: 'geographic', poles: 'geographic'};

  var system = 'geo';
  if (COORDINATES.poles == 'tectonic') system = 'strat';

  const FILENAME = "VGPs";

  const CSV_HEADER = new Array(
    "ID", "Pole lat", "Pole lon", "PaleoLat", "dp", "dm",
  );

  var rows = new Array(CSV_HEADER.join(","));

  sitesSet.sites.forEach(function(site, i) {

    var vgp = site.vgp;
    var num = vgp.index + 1;

    rows.push([
      num,
      vgp[system].lat.toFixed(2),
      vgp[system].lng.toFixed(2),
      vgp[system].pLat.toFixed(2),
      vgp[system].dp.toFixed(2),
      vgp[system].dm.toFixed(2)
    ].join(ITEM_DELIMITER));

  });

  outputVGPs = rows.join(LINE_DELIMITER);

  saveFile("Save VGPs data", FILENAME, outputVGPs);

}

function downloadVGPsXLSX() {

  var sitesSet = JSON.parse(localStorage.getItem("selectedSitesSet"));

  var coordinates = JSON.parse(localStorage.getItem("coordinates"));
  var COORDINATES = (coordinates) ? coordinates.data : {pca: 'specimen', stat: 'geographic', poles: 'geographic'};

  var system = 'geo';
  if (COORDINATES.poles == 'tectonic') system = 'strat';

  const FILENAME = "VGPs";

  const XLSX_HEADER = new Array(
    "ID", "Pole lat", "Pole lon", "PaleoLat", "dp", "dm",
  );

  var rows = [XLSX_HEADER];

  sitesSet.sites.forEach(function(site, i) {

    var vgp = site.vgp;
    var num = vgp.index + 1;

    rows.push([
      num,
      vgp[system].lat.toFixed(2),
      vgp[system].lng.toFixed(2),
      vgp[system].pLat.toFixed(2),
      vgp[system].dp.toFixed(2),
      vgp[system].dm.toFixed(2)
    ])

  });

  var outputVGPs = xlsx.build([{name: FILENAME, data: rows}]); // Returns a buffer

  saveFile("Save VGPs data", FILENAME, outputVGPs, 'xlsx');

}

function downloadAsCSV(filename, csv) {

  /*
   * Function downloadAsCSV
   * Downloads a particular CSV string as a BLOB
   */

  const MIME_TYPE = "data:text/csv;charset=utf-8";

  downloadURIComponent(filename, MIME_TYPE + "," + encodeURIComponent(csv));

}

function downloadURIComponent(name, string) {

  /*
   * Function downloadURIComponent
   * Creates a temporary link component used for downloading
   */

  var downloadAnchorNode = document.createElement("a");

  // Set some attribtues
  downloadAnchorNode.setAttribute("href", string);
  downloadAnchorNode.setAttribute("download", name);

  // Add and trigger click event
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();

  // Clean up
  document.body.removeChild(downloadAnchorNode);

}

updateVGPTable();
resizeTable();

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

// Inner scripts

// CSV delimiters
const ITEM_DELIMITER = ",";
const TAB_DELIMITER = "\t";
const LINE_DELIMITER = "\n";

ipcRenderer.on('redraw-table', (event) => {
  formatCollectionTable();
})

window.addEventListener("resize", resizeTable);

function resizeTable() {

  document.getElementById("collection-table-container").style.height = window.innerHeight - document.getElementById('static-elements').offsetHeight - 5  + "px";

}

// Formats table of imported data
function formatCollectionTable() {

  /*
   * Function StepSelector.formatStepTable
   * Formats parameter table at the top of the page
   */

  // var step = stepSelector.getCurrentStep();
  var collections = JSON.parse(localStorage.getItem("collections"));
  var collection = JSON.parse(localStorage.getItem("selectedCollection"));

  if (collections.length == 0) {
    document.getElementById("table-body-container").innerHTML = '';
    document.getElementById("save-dataTable").innerHTML = '';
    return;
  }

  var dirMode = localStorage.getItem('dirMode');

  var saveBtns = new Array(
    "<div class='btn-group btn-block btn-group-sm btn-group-justified d-flex mx-auto'>",
    "  <button onclick='downloadСollectionsCSV()' type='button' title='Save collections data as .csv' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    <i class='fal fa-file-csv'></i>",
    "  </button>",
    "  <button onclick='downloadCollectionsXLSX()' type='button' title='Save collections data as .xlsx' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    <i class='fal fa-file-excel'></i>",
    "  </button>",
    "</div>"
  ).join("\n");

  var tableHeader = new Array(
    "  <thead class='thead-light fixed-header'>",
    "    <tr>",
    "      <th>E</th>",
    "      <th>#</th>",
    "      <th>ID</th>",
    "      <th>Code</th>",
    "      <th>StepRange</th>",
    "      <th>N</th>",
    "      <th>Dspec</th>",
    "      <th>Ispec</th>",
    "      <th>Dgeo</th>",
    "      <th>Igeo</th>",
    "      <th>Dstrat</th>",
    "      <th>Istrat</th>",
    "      <th>MAD</th>",
    "      <th>Comment</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  var tableRows = collection.interpretations.map(function(interpretation, i) {

    var rowClass = '';
    var rowTitle = '';
    var num = interpretation.index + 1;
    var dotVisibleTitle = '<span title="Erase interpretation">';
    var dotVisibleIcon = '<i class="fad fa-eraser"></i>'
    if (!interpretation.visible) {
      rowClass = 'erase-row text-muted';
      num = '-';
      dotVisibleTitle = '<span title="Redraw interpretation">';
      dotVisibleIcon = '<i class="fad fa-pencil"></i>';
      rowTitle = 'Interpretation erased';
    }

    var dSpec = interpretation.Dspec[dirMode] ? interpretation.Dspec[dirMode].toFixed(2) : " ";
    var iSpec = interpretation.Ispec[dirMode] ? information.Ispec[dirMode].toFixed(2) : " ";
    var dGeo = interpretation.Dgeo[dirMode];
    var iGeo = interpretation.Igeo[dirMode];
    var dStrat = interpretation.Dstrat[dirMode];
    var iStrat = interpretation.Istrat[dirMode];
    console.log(interpretation.comment);
    return [
      "    <tr class='" + rowClass + "' title='    " + rowTitle + "'>",
      "      <td>" + dotVisibleTitle + "<button onclick='eraseDot(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotVisibleIcon + "</button></span></td>",
      "      <td>" + num + "</td>",
      "      <td>" + interpretation.id + "</td>",
      "      <td>" + interpretation.code + "</td>",
      "      <td>" + interpretation.stepRange + "</td>",
      "      <td>" + interpretation.n + "</td>",
      "      <td>" + dSpec + "</td>",
      "      <td>" + iSpec + "</td>",
      "      <td>" + dGeo.toFixed(2) + "</td>",
      "      <td>" + iGeo.toFixed(2) + "</td>",
      "      <td>" + dStrat.toFixed(2) + "</td>",
      "      <td>" + iStrat.toFixed(2) + "</td>",
      "      <td>" + interpretation.mad.toFixed(2) + "</td>",
      "      <td>" + interpretation.comment + "</td>",
      "    </tr>",
    ].join("\n");
  });

  var tableFooter = "</tbody>";

  document.getElementById("table-body-container").innerHTML = tableHeader + tableRows.join("\n") + tableFooter;
  document.getElementById("save-dataTable").innerHTML = saveBtns;

}

function eraseDot(dotToErase) {

  var collections = JSON.parse(localStorage.getItem("collections"));
  var selectedCollection = JSON.parse(localStorage.getItem("selectedCollection"));

  collections.forEach((collection, i) => {
    if (collection.created == selectedCollection.created) {
      var independentIndex = 0;
      collection.interpretations.forEach((interpretation, j) => {
        if (j == dotToErase) {
          collection.means = new Array();
          interpretation.visible = !interpretation.visible;
        }
        if (interpretation.visible) {
          interpretation.index = independentIndex;
          independentIndex++;
        }
        else interpretation.index = '-';
      });
      selectedCollection = collection;
    }
  });

  saveLocalStorage(collections, selectedCollection);
  //ipcRenderer.send('reload-mainWin');
  ipcRenderer.send('redraw-charts');
  formatCollectionTable();

}

function saveLocalStorage(collections, selectedCollection) {

  /*
   * Function saveLocalStorage
   * Saves sample object to local storage
   */

  // if(!force && (!document.getElementById("auto-save").checked || window.location.search)) {
  //   return;
  // }

  localStorage.setItem("collections", JSON.stringify(collections));
  localStorage.setItem("selectedCollection", JSON.stringify(selectedCollection));

  // try {
  //
  // } catch(exception) {
  //   console.log("danger", "Could not write to local storage. Export your data manually to save it.");
  // }

}

// Downloads all interpreted components to a CSV (export data)
function downloadСollectionsCSV() {

  /*
   * Function downloadInterpretationsCSV
   * Downloads all interpreted components to a CSV
   */

  var collections = JSON.parse(localStorage.getItem("collections"));
  var dirMode = localStorage.getItem('dirMode');

  const FILENAME = "Collection";

  const CSV_HEADER = new Array(
    "ID", "Code", "StepRange", "N", "Dspec", "Ispec", "Dgeo", "Igeo", "Dstrat", "Istrat", "MAD", "Comment",// "Date",
  );

  var rows = new Array(CSV_HEADER.join(","));

  // Export the interpreted components as CSV
  collections.forEach(function(collection) {
    collection.interpretations.forEach(function(interpretation) {

      // check if specimen is not defined
      var dSpec = interpretation.Dspec[dirMode] ? interpretation.Dspec[dirMode].toFixed(2) : " ";
      var iSpec = interpretation.Ispec[dirMode] ? information.Ispec[dirMode].toFixed(2) : " ";
      var dGeo = interpretation.Dgeo[dirMode];
      var iGeo = interpretation.Igeo[dirMode];
      var dStrat = interpretation.Dstrat[dirMode];
      var iStrat = interpretation.Istrat[dirMode];

      rows.push(new Array(
        interpretation.id,
        interpretation.code,
        interpretation.stepRange,
        interpretation.n,
        dSpec,
        iSpec,
        dGeo.toFixed(2),
        iGeo.toFixed(2),
        dStrat.toFixed(2),
        iStrat.toFixed(2),
        interpretation.mad,
        interpretation.comment,
      ).join(ITEM_DELIMITER));

    });
  });

  outputCollections = rows.join(LINE_DELIMITER);

  saveFile("Save collection data", FILENAME, outputCollections);

}

// Downloads all interpreted components to a CSV (export data)
function downloadCollectionsXLSX() {

  var collections = JSON.parse(localStorage.getItem("collections"));
  var dirMode = localStorage.getItem('dirMode');

  const FILENAME = "Collection";

  const XLSX_HEADER = new Array(
    "ID", "Code", "StepRange", "N", "Dspec", "Ispec", "Dgeo", "Igeo", "Dstrat", "Istrat", "MAD", "Comment",// "Date",
  );

  var rows = [XLSX_HEADER];

  collections.forEach(function(collection) {
    collection.interpretations.forEach(function(interpretation) {

      // check if specimen is not defined
      var dSpec = interpretation.Dspec[dirMode] ? interpretation.Dspec[dirMode].toFixed(2) : " ";
      var iSpec = interpretation.Ispec[dirMode] ? information.Ispec[dirMode].toFixed(2) : " ";
      var dGeo = interpretation.Dgeo[dirMode];
      var iGeo = interpretation.Igeo[dirMode];
      var dStrat = interpretation.Dstrat[dirMode];
      var iStrat = interpretation.Istrat[dirMode];

      rows.push([
        interpretation.id,
        interpretation.code,
        interpretation.stepRange,
        interpretation.n,
        dSpec,
        iSpec,
        dGeo.toFixed(2),
        iGeo.toFixed(2),
        dStrat.toFixed(2),
        iStrat.toFixed(2),
        interpretation.mad,
        interpretation.comment,
      ]);

    });
  });

  outputCollections = xlsx.build([{name: FILENAME, data: rows}]); // Returns a buffer

  saveFile("Save Collections data", FILENAME, outputCollections, 'xlsx');

}

formatCollectionTable();
resizeTable();

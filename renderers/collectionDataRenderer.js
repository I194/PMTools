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
    "      <th class='pb-0'>ID" + putCopyColBtn(".id") + "</th>",
    "      <th class='pb-0'>Code" + putCopyColBtn(".code") + "</th>",
    "      <th class='pb-0'>StepRange" + putCopyColBtn(".steprange") + "</th>",
    "      <th class='pb-0'>N" + putCopyColBtn(".n") + "</th>",
    "      <th class='pb-0'>Dgeo" + putCopyColBtn(".dgeo") + "</th>",
    "      <th class='pb-0'>Igeo" + putCopyColBtn(".igeo") + "</th>",
    "      <th class='pb-0'>Dstrat" + putCopyColBtn(".dstrat") + "</th>",
    "      <th class='pb-0'>Istrat" + putCopyColBtn(".istrat") + "</th>",
    "      <th class='pb-0'>MAD" + putCopyColBtn(".mad") + "</th>",
    "      <th class='pb-0'>Comment" + putCopyColBtn(".comment") + "</th>",
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

    // var dSpec = interpretation.Dspec[dirMode] ? interpretation.Dspec[dirMode].toFixed(1) : " ";
    // var iSpec = interpretation.Ispec[dirMode] ? information.Ispec[dirMode].toFixed(1) : " ";
    // if (iSpec < 0) iSpec = "<span class='text-danger'>" + iSpec + "</span>";
    // var dGeo = interpretation.Dgeo[dirMode].toFixed(1);
    // var iGeo = interpretation.Igeo[dirMode].toFixed(1);
    // if (iGeo < 0) iGeo = "<span class='text-danger'>" + iGeo + "</span>";
    // var dStrat = interpretation.Dstrat[dirMode].toFixed(1);
    // var iStrat = interpretation.Istrat[dirMode].toFixed(1);
    // if (iStrat < 0) iStrat = "<span class='text-danger'>" + iStrat + "</span>";

    return [
      "    <tr class='" + rowClass + "' title='    " + rowTitle + "'>",
      "      <td>" + dotVisibleTitle + "<button onclick='eraseDot(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotVisibleIcon + "</button></span></td>",
      "      <td>" + num + "</td>",
      "      <td class='id'>" + interpretation.id + "</td>",
      "      <td class='code'>" + interpretation.code + "</td>",
      "      <td class='steprange'>" + interpretation.stepRange + "</td>",
      "      <td class='n'>" + interpretation.n + "</td>",
      "      <td class='dgeo'>" + interpretation.geographic.dec[dirMode].toFixed(1) + "</td>",
      "      <td class='igeo'>" + interpretation.geographic.inc[dirMode].toFixed(1) + "</td>",
      "      <td class='dstrat'>" + interpretation.tectonic.dec[dirMode].toFixed(1) + "</td>",
      "      <td class='istrat'>" + interpretation.tectonic.inc[dirMode].toFixed(1) + "</td>",
      "      <td class='mad'>" + interpretation.geographic.mad.toFixed(1) + "</td>",
      "      <td class='comment'>" + interpretation.comment + "</td>",
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

  var collection = JSON.parse(localStorage.getItem("selectedCollection"));
  var dirMode = localStorage.getItem('dirMode');

  const FILENAME = "Collection";

  const CSV_HEADER = new Array(
    "ID", "Code", "StepRange", "N", "Dgeo", "Igeo", "Dstrat", "Istrat", "MAD", "Comment",// "Date",
  );

  var rows = new Array(CSV_HEADER.join(","));

  // Export the interpreted components as CSV
  collection.interpretations.forEach(function(interpretation) {

    // check if specimen is not defined
    // var dSpec = interpretation.Dspec[dirMode] ? interpretation.Dspec[dirMode].toFixed(1) : " ";
    // var iSpec = interpretation.Ispec[dirMode] ? information.Ispec[dirMode].toFixed(1) : " ";
    // var dGeo = interpretation.Dgeo[dirMode];
    // var iGeo = interpretation.Igeo[dirMode];
    // var dStrat = interpretation.Dstrat[dirMode];
    // var iStrat = interpretation.Istrat[dirMode];
    if (!interpretation.visible) return;

    rows.push(new Array(
      interpretation.id,
      interpretation.code,
      interpretation.stepRange,
      interpretation.n,
      // dSpec,
      // iSpec,
      interpretation.geographic.dec[dirMode].toFixed(1),
      interpretation.geographic.inc[dirMode].toFixed(1),
      // interpretation.geographic.mad.toFixed(1),
      interpretation.tectonic.dec[dirMode].toFixed(1),
      interpretation.tectonic.inc[dirMode].toFixed(1),
      interpretation.geographic.mad.toFixed(1),
      interpretation.comment,
    ).join(ITEM_DELIMITER));

  });

  outputCollections = rows.join(LINE_DELIMITER);

  saveFile("Save collection data", FILENAME, outputCollections);

}

// Downloads all interpreted components to a CSV (export data)
function downloadCollectionsXLSX() {

  var collection = JSON.parse(localStorage.getItem("selectedCollection"));
  var dirMode = localStorage.getItem('dirMode');

  const FILENAME = "Collection";

  const XLSX_HEADER = new Array(
    "ID", "Code", "StepRange", "N", "Dgeo", "Igeo", "Dstrat", "Istrat", "MAD", "Comment",// "Date",
  );

  var rows = [XLSX_HEADER];

  collection.interpretations.forEach(function(interpretation) {

    // check if specimen is not defined
    // var dSpec = interpretation.Dspec[dirMode] ? interpretation.Dspec[dirMode].toFixed(1) : " ";
    // var iSpec = interpretation.Ispec[dirMode] ? information.Ispec[dirMode].toFixed(1) : " ";
    // var dGeo = interpretation.Dgeo[dirMode];
    // var iGeo = interpretation.Igeo[dirMode];
    // var dStrat = interpretation.Dstrat[dirMode];
    // var iStrat = interpretation.Istrat[dirMode];

    if (!interpretation.visible) return;

    rows.push([
      interpretation.id,
      interpretation.code,
      interpretation.stepRange,
      interpretation.n,
      // dSpec,
      // iSpec,
      interpretation.geographic.dec[dirMode].toFixed(1),
      interpretation.geographic.inc[dirMode].toFixed(1),
      // interpretation.geographic.mad.toFixed(1),
      interpretation.tectonic.dec[dirMode].toFixed(1),
      interpretation.tectonic.inc[dirMode].toFixed(1),
      interpretation.geographic.mad.toFixed(1),
      interpretation.comment,
    ]);

  });

  outputCollections = xlsx.build([{name: FILENAME, data: rows}]); // Returns a buffer

  saveFile("Save Collections data", FILENAME, outputCollections, 'xlsx');

}

formatCollectionTable();
resizeTable();

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
  updateMeanTable();
})

ipcRenderer.on('export-means-xlsx', (event) => {
  downloadMeansXLSX();
})

ipcRenderer.on('export-means-csv', (event) => {
  downloadMeansCSV();
})

// Inner scripts

// CSV delimiters
const ITEM_DELIMITER = ",";
const TAB_DELIMITER = "\t";
const LINE_DELIMITER = "\n";

var tableContainer = document.getElementById("mean-table-container");

tableContainer.addEventListener("input", meanTableClickHandler);
window.addEventListener("resize", resizeTable);

function resizeTable() {

  tableContainer.style.height = window.innerHeight - document.getElementById('static-elements').offsetHeight - 5  + "px";

}

// Updates the table with information on interpreted components
function updateMeanTable() {

  /*
   * Function updateInterpretationTable
   * Updates the table with information on interpreted components
   */

  const COMMENT_LENGTH = 15;
  const ERROR_NO_MEANS = "<h6 class='text-muted text-center' title='Make means to see them'>No means available</h6>";
  const ChRM_COMMENT = "";

  var collections = JSON.parse(localStorage.getItem("collections"));
  var collection = JSON.parse(localStorage.getItem("selectedCollection"));
  var dirMode = localStorage.getItem('dirMode');

  // if (specimens.length == 0) {
  //   document.getElementById("mean-table-container").innerHTML = '';
  //   document.getElementById("save-dataTable").innerHTML = '';
  //   return;
  // }

  // No means to show
  var zeroMeans = true;
  for (let i = 0; i < collections.length; i++) {
    if (collections[i].means.length != 0) {
      zeroMeans = false;
      break;
    }
  }

  if (zeroMeans) return document.getElementById("mean-table-container").innerHTML = ERROR_NO_MEANS;

  var saveBtns = new Array(
    "<div class='btn-group btn-block btn-group-sm btn-group-justified d-flex mx-auto'>",
    "  <button onclick='ipcRenderer.send(" + '"' + 'open-magic-export' + '"' + ")' type='button' title='Save means data as MagIC' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    Export as MagIC <i class='fal fa-file-txt'></i>",
    "  </button>",
    "  <button onclick='downloadMeansCSV()' type='button' title='Save means data as .csv' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    Export as .csv <i class='fal fa-file-csv'></i>",
    "  </button>",
    "  <button onclick='downloadMeansXLSX()' type='button' title='Save means data as .xlsx' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    Export as .xlsx <i class='fal fa-file-excel'></i>",
    "  </button>",
    "  <button onclick='downloadMeansCSV(" + '"true"' + ")' type='button' title='' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    Open in Poles <i class='fas fa-arrow-square-right'></i>",
    "  </button>",
    "</div>"
  ).join("\n");

  var tableHeader = new Array(
    "<table id='meanDataTable' class='table table-sm table-bordered w-100 small text-center' style='text-align: center!important; margin: 0;'>",
    "  <thead class='thead-light'>",
    "    <tr>",
    "      <th><span title='Delete all means'><button onclick='deleteAllMeans()' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-trash-alt'></i></button></span></th>",
    "      <th class='pb-0'>ID" + putCopyColBtn(".id") + "</th>",
    "      <th class='pb-0'>N" + putCopyColBtn(".n") + "</th>",
    "      <th class='pb-0'>Dgeo" + putCopyColBtn(".dgeo") + "</th>",
    "      <th class='pb-0'>Igeo" + putCopyColBtn(".igeo") + "</th>",
    "      <th class='pb-0'>kg" + putCopyColBtn(".kg") + "</th>",
    "      <th class='pb-0'>a95g" + putCopyColBtn(".a95g") + "</th>",
    "      <th class='pb-0'>Dstrat" + putCopyColBtn(".dstrat") + "</th>",
    "      <th class='pb-0'>Istrat" + putCopyColBtn(".istrat") + "</th>",
    "      <th class='pb-0'>ks" + putCopyColBtn(".ks") + "</th>",
    "      <th class='pb-0'>a95s" + putCopyColBtn(".a95s") + "</th>",
    "      <th class='pb-0'>Code" + putCopyColBtn(".code") + "</th>",
    "      <th class='pb-0'>Steps" + putCopyColBtn(".steps") + "</th>",
    "      <th class='pb-0'>Comment" + putCopyColBtn(".comment") + "</th>",
    "    </tr>",
    "  </thead>",
  ).join("\n");

  // Start adding all the specimens

  var allCollRows = new Array();

  collections.forEach(function(collection, i) {
    var currSpecRows = collection.means.map(function(mean, j) {

      // Get the interpretation in the right reference frame
      var directionSpec = mean.specimen;
      var directionGeo = mean.geographic;
      var directionStrat = mean.tectonic;

      // Handle comments on mean
      if ((mean.comment === null) || !mean.comment) comment = ChRM_COMMENT;
      else comment = mean.comment;

      // Full code of mean

      var code = mean.code;
      // a95 angle (if forced this is unreliable)
      // var a95 = mean.a95.toFixed(1);
      var a95g = directionGeo.a95.toFixed(1);
      var a95s = directionStrat.a95.toFixed(1);
      if((mean.code == 'GC') || (mean.code == 'GCn')) {
        a95g = "<span class='text-primary' title='The MAD for anchored components is unreliable'>" + a95g + "</span>";
        a95s = "<span class='text-primary' title='The MAD for anchored components is unreliable'>" + a95s + "</span>";
      }
      var kg = (directionGeo.k) ? directionGeo.k.toFixed(1): "<span class='text-primary' title='The k for Bingham distribution is ambiguous'>" + '?' + "</span>";
      var ks = (directionStrat.k) ? directionStrat.k.toFixed(1): "<span class='text-primary' title='The k for Bingham distribution is ambiguous'>" + '?' + "</span>";

      // check if specimen is not defined
      var specDec = '';
      var specInc = '';
      if (directionSpec) {
        specDec = (directionSpec.dec) ? directionSpec.dec.toFixed(1) : '';
        specInc = (directionSpec.dec) ? directionSpec.inc.toFixed(1) : '';
      }
      // Number of dots
      var N = mean.dots.length;

      allCollRows.push(
      [
        "  </tr>",
        "    <td><span title='Delete mean'><button onclick='deleteAllMeans(" + i + ',' + j + ")' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-minus-square'></i></button></span></td>",
        "    <td class='id'>" + collection.name + "</td>",
        "    <td class='n'>" + N + "</td>",
        "    <td class='dgeo'>" + directionGeo.dec.toFixed(1) + "</td>",
        "    <td class='igeo'>" + directionGeo.inc.toFixed(1) + "</td>",
        "    <td class='kg'>" + kg + "</td>",
        "    <td class='a95g'>" + a95g + "</td>",
        "    <td class='dstrat'>" + directionStrat.dec.toFixed(1) + "</td>",
        "    <td class='istrat'>" + directionStrat.inc.toFixed(1) + "</td>",
        "    <td class='ks'>" + ks + "</td>",
        "    <td class='a95s'>" + a95s + "</td>",
        "    <td class='code'>" + code + "</td>",
        "    <td class='steps'>" + '"' + 'site avg' + '"' + "</td>",
        "    <td class='comment' contenteditable='true' style='cursor: pointer;' title='" + comment + "'>" + ((comment.length < COMMENT_LENGTH) ? comment : comment.slice(0, COMMENT_LENGTH) + "…") + "</td>",
        "  </tr>"
      ].join("\n"));
    });

    // allCollRows.push(currSpecRows);
  });

  var tableFooter = "</table>";
  document.getElementById("mean-table-container").innerHTML = tableHeader + allCollRows.join("\n") + tableFooter;
  document.getElementById("save-dataTable").innerHTML = saveBtns;
}

// Deletes all interpretations in a specimen
function deleteAllMeans(collectionIndex, meanIndex) {

  /*
   * Function deleteAllInterpretations
   * Deletes all interpretations in a specimen
   */

  collections = JSON.parse(localStorage.getItem("collections"));
  selectedCollection = JSON.parse(localStorage.getItem("selectedCollection"));

  // Reset
  if (collectionIndex === undefined) {
    collections.forEach((collection, i) => {
      collection.means = new Array();
      selectedCollection = collection;
    });
  }
  else if (meanIndex === undefined) {
    collections[collectionIndex].means = new Array();
    selectedCollection = collections[collectionIndex];
  }
  else {
    collections[collectionIndex].means.splice(meanIndex, 1);
    selectedCollection = collections[collectionIndex];
  }
  //var specimen = selectedSpecimen; // getSelectedSpecimen();


  // Reset
  // if(index === undefined) {
  //   specimen.interpretations = new Array();
  // } else {
  //   specimen.interpretations.splice(index, 1);
  // }

  //redrawCharts();
  saveLocalStorage(collections, selectedCollection);
  ipcRenderer.send('redraw-charts');

}

// Handlers a click on the interpreted component table
function meanTableClickHandler(event) {

  /*
   * Function interpretationTableClickHandler
   * Handlers a click on the interpreted component table
   */
  collections = JSON.parse(localStorage.getItem("collections"));

  var columnIndex = event.target.cellIndex;
  var rowIndex = event.target.parentElement.rowIndex;

  var collectionName = event.target.parentElement.querySelectorAll("td")[1].innerHTML;

  var tableRows = document.getElementById('mean-table-container').querySelectorAll("tr");
  // index of row where specimen specimenName starts (start -> 119_0, 119_0, start -> 118_0, 118_0, start -> 117_0, ...)
  var rowIndexFirstSpecName;
  for (let i = 0; i < tableRows.length; i++) {
    if (tableRows[i].cells[1].innerHTML == collectionName) {
      rowIndexFirstSpecName = i;
      break;
    }
  }
  var currSpecRowIndex = rowIndex - rowIndexFirstSpecName;

  var selectedCollection;
  for (let i = 0; i < collections.length; i++) {
    if (collections[i].name == collectionName) {
      selectedCollection = collections[i];
      break;
    }
  }

  if(columnIndex === 13) {
    selectedCollection.means[currSpecRowIndex].comment = event.target.innerHTML;
  }

  //redrawCharts();
  saveLocalStorage(collections);

}

function saveLocalStorage(collections, selectedCollection) {

  /*
   * Function saveLocalStorage
   * Saves sample object to local storage
   */
  console.log(collections);
  localStorage.setItem("collections", JSON.stringify(collections));
  localStorage.setItem("selectedCollection", JSON.stringify(selectedCollection));

}

// Downloads all interpreted components to a CSV (export data)
function downloadMeansCSV(andOpen) {

  /*
   * Function downloadInterpretationsCSV
   * Downloads all interpreted components to a CSV
   */

  var collections = JSON.parse(localStorage.getItem("collections"));
  var dirMode = localStorage.getItem('dirMode');

  const FILENAME = "Statistics";

  const CSV_UPHEADER = new Array(
    "from:", "dir_stat", "PMTools beta v" + getVersion(),
  ).join(ITEM_DELIMITER);

  var rows = new Array(CSV_UPHEADER);

  const CSV_HEADER = new Array(
    // "ID", "Code", "StepRange", "N", "Dspec", "Ispec", "Dgeo", "Igeo", "Dstrat", "Istrat", "k", "a95", "Comment",// "Date",
    "ID", "Code", "StepRange", "N", "Dgeo", "Igeo", "kg", "a95g", "Dstrat", "Istrat", "ks", "a95s", "Comment",// "Date",
  ).join(ITEM_DELIMITER);

  rows.push(CSV_HEADER);

  // Export the interpreted components as CSV
  collections.forEach(function(collection) {
    collection.means.forEach(function(mean) {

      // Full code of mean
      var code = mean.code;

      // check if specimen is not defined
      // var specDec = (mean.specimen.dec) ? mean.specimen.dec.toFixed(1) : '';
      // var specInc = (mean.specimen.dec) ? mean.specimen.inc.toFixed(1) : '';

      var kg = (mean.geographic.k) ? mean.geographic.k.toFixed(1) : "?";
      var ks = (mean.tectonic.k) ? mean.tectonic.k.toFixed(1) : "?";

      // Number of dots
      var N = mean.dots.length;

      rows.push(new Array(
        collection.name,
        code,
        "avg",
        N,
        // specDec,
        // specInc,
        mean.geographic.dec.toFixed(1),
        mean.geographic.inc.toFixed(1),
        kg,
        mean.geographic.a95.toFixed(1),
        mean.tectonic.dec.toFixed(1),
        mean.tectonic.inc.toFixed(1),
        ks,
        mean.tectonic.a95.toFixed(1),
        mean.comment,
      ).join(ITEM_DELIMITER));

    });
  });

  outputMeans = rows.join(LINE_DELIMITER);

  saveFile("Save statistics data", FILENAME, outputMeans, 'csv', andOpen);

}

function downloadMeansXLSX() {

  var collections = JSON.parse(localStorage.getItem("collections"));
  var dirMode = localStorage.getItem('dirMode');

  const FILENAME = "Statistics";

  const XLSX_UPHEADER = new Array(
    "from:", "dir_stat", "PMTools beta v" + getVersion(),
  );

  const XLSX_HEADER = new Array(
    // "ID", "Code", "StepRange", "N", "Dspec", "Ispec", "Dgeo", "Igeo", "Dstrat", "Istrat", "k", "a95", "Comment",// "Date",
    "ID", "Code", "StepRange", "N", "Dgeo", "Igeo", "kg", "a95g", "Dstrat", "Istrat", "ks", "a95s", "Comment",// "Date",
  );

  var rows = [XLSX_UPHEADER];

  rows.push(XLSX_HEADER);

  collections.forEach(function(collection, i) {
    collection.means.forEach(function(mean) {

      // Full code of mean
      var code = mean.code;

      // check if specimen is not defined
      var specDec = (mean.specimen.dec) ? mean.specimen.dec.toFixed(1) : '';
      var specInc = (mean.specimen.dec) ? mean.specimen.inc.toFixed(1) : '';

      // Number of dots
      var N = mean.dots.length;

      var kg = (mean.geographic.k) ? mean.geographic.k.toFixed(1) : "?";
      var ks = (mean.tectonic.k) ? mean.tectonic.k.toFixed(1) : "?";

      rows.push([
        collection.name,
        code,
        "avg",
        N,
        // specDec,
        // specInc,
        mean.geographic.dec.toFixed(1),
        mean.geographic.inc.toFixed(1),
        kg,
        mean.geographic.a95.toFixed(1),
        mean.tectonic.dec.toFixed(1),
        mean.tectonic.inc.toFixed(1),
        ks,
        mean.tectonic.a95.toFixed(1),
        mean.comment,
      ]);

    });
  });

  var outputMeans = xlsx.build([{name: FILENAME, data: rows}]); // Returns a buffer

  saveFile("Save statistics data", FILENAME, outputMeans, 'xlsx');

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

updateMeanTable();
resizeTable();

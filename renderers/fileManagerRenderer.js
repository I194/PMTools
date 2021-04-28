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
  remote.getCurrentWindow().hide();
})

// Inner scripts

// CSV delimiters
const ITEM_DELIMITER = ",";
const TAB_DELIMITER = "\t";
const LINE_DELIMITER = "\n";

ipcRenderer.on('reload-win', (event) => {
  settings = JSON.parse(localStorage.getItem("settings"));
  document.getElementById("append-input").checked = settings.global.appendFiles;
  formatCollectionTable();
})

document.getElementById("append-input").checked = settings.global.appendFiles;

var tableContainer = document.getElementById("files-table-container");

window.addEventListener("resize", resizeTable);

document.getElementById("append-input").addEventListener('click', (e) => {
  settings.global.appendFiles = document.getElementById("append-input").checked;
  localStorage.setItem("settings", JSON.stringify(settings));
  ipcRenderer.send('reload-settWin');
  ipcRenderer.send('reload-mainWin-appendFiles')
})

function resizeTable() {

  tableContainer.style.height = window.innerHeight - document.getElementById('static-elements').offsetHeight - 5  + "px";

}

$(document).ready(function() {
    var $chkboxes = $('.chkbox');
    var lastChecked = null;

    $chkboxes.click(function(e) {
        if (!lastChecked) {
            lastChecked = this;
            return;
        }

        if (e.shiftKey) {
            var start = $chkboxes.index(this);
            var end = $chkboxes.index(lastChecked);

            $chkboxes.slice(Math.min(start,end) + 1, Math.max(start,end)).click();//prop('checked', lastChecked.checked);
        }

        lastChecked = this;
    });
});

// document.getElementById('leaderbox').a
function clickAll() {
  var checkboxes = document.getElementsByClassName('chkbox');
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = document.getElementById('leaderbox').checked;
    selectFile(checkboxes[i]);
  }
}

function selectFile(checkElem) {

  var checkParams = checkElem.id.split('-');
  console.log(checkElem.id);

  if (checkParams[0] === 'spec') {
    var specimens = JSON.parse(localStorage.getItem("specimens"));
    specimens[checkParams[1]].selected = true;
    localStorage.setItem("specimens", JSON.stringify(specimens));
    return;
  }

  if (checkParams[0] === 'coll') {
    var collections = JSON.parse(localStorage.getItem("collections"));
    collections[checkParams[1]].selected = true;
    localStorage.setItem("collections", JSON.stringify(collections));
    return;
  }

  if (checkParams[0] === 'sitesSets') {
    var sitesSets = JSON.parse(localStorage.getItem("sitesSets"));
    sitesSets[checkParams[1]].selected = true;
    localStorage.setItem("sitesSets", JSON.stringify(sitesSets));
    return;
  }

}

function deleteFiles() {

  var specimens = JSON.parse(localStorage.getItem("specimens"));
  var collections = JSON.parse(localStorage.getItem("collections"));
  var sitesSets = JSON.parse(localStorage.getItem("sitesSets"));

  var newSpecimens = [], newCollections = [], newSitesSets = [];

  specimens.forEach((specimen, i) => {
    if (!specimen.selected) newSpecimens.push(specimen);
  });

  collections.forEach((collection, i) => {
    if (!collection.selected) newCollections.push(collection);
  });

  sitesSets.forEach((sitesSet, i) => {
    if (!sitesSet.selected) newSitesSets.push(sitesSet);
  });

  localStorage.removeItem('specimens');
  localStorage.removeItem('selectedSpecimen');
  localStorage.removeItem('collections');
  localStorage.removeItem('selectedCollection');
  localStorage.removeItem('sitesSets');
  localStorage.removeItem('selectedSitesSet');

  localStorage.setItem("specimens", JSON.stringify(newSpecimens));
  localStorage.setItem("collections", JSON.stringify(newCollections));
  localStorage.setItem("sitesSets", JSON.stringify(newSitesSets));

  ipcRenderer.send('reload-mainWin');
  formatCollectionTable();

}

// Formats table of imported data
function formatCollectionTable() {

  var specimens = JSON.parse(localStorage.getItem("specimens"));
  var collections = JSON.parse(localStorage.getItem("collections"));
  var sitesSets = JSON.parse(localStorage.getItem("sitesSets"));

  var tableHeader = new Array(
    "<table id='filesDataTable' class='table table-sm table-bordered w-100 small text-center' style=' text-align: center!important; vertical-align: middle; margin: 0;'>",
    "  <thead class='thead-light fixed-header'>",
    "    <tr>",
    "      <th class='hoverable-elem'><label class='full-div-label'>  <input type='checkbox' id='leaderbox' onclick='clickAll()'> </label></th>",
    "      <th>File name</th>",
    "      <th>File extension</th>",
    "      <th colspan='2'>Export XLSX</th>",
    "      <th colspan='2'>Export CSV</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  enoughInterperations = false;

  for (let i = 0; i < specimens.length; i++) {
    if (specimens[i].interpretations.length > 0) {
      enoughInterperations = true;
      break;
    }
  }

  enoughMeans = false;

  for (let i = 0; i < collections.length; i++) {
    if (collections[i].means.length > 0) {
      enoughMeans = true;
      break;
    }
  }

  enoughSitesMeans = false;

  for (let i = 0; i < sitesSets.length; i++) {
    if (sitesSets[i].means.length > 0) {
      enoughSitesMeans = true;
      break;
    }
  }

  var tableSpecRows = specimens.map(function(specimen, i) {

    var rowClass = '';
    var rowTitle = '';
    var rowStyle = '';

    if (i == (specimens.length - 1)) rowStyle = 'border-spacing: 3px;'

    var extension = '';
    if (specimen.format == 'PALEOMAC') extension = 'pmd';
    if (specimen.format == 'RMG') extension = 'IFZ-squid';

    var exportCells = [
      "      <td class='text-danger hoverable-elem' rowspan='" + specimens.length + "' colspan='2' onclick='' title='No interpretations available'>" + 'Interpretations' + "</td>",
      "      <td class='text-danger hoverable-elem' rowspan='" + specimens.length + "' colspan='2' onclick='' title='No interpretations available'>" + 'Interpretations' + "</td>",
    ]

    if (enoughInterperations) {
      exportCells = [
        "      <td class='text-primary hoverable-elem' rowspan='" + specimens.length + "' colspan='2' onclick='ipcRenderer.send(" + '"export-interpretations-xlsx"' + ")'>" + 'Interpretations' + "</td>",
        "      <td class='text-primary hoverable-elem' rowspan='" + specimens.length + "' colspan='2' onclick='ipcRenderer.send(" + '"export-interpretations-csv"' + ")'>" + 'Interpretations' + "</td>",
      ]
    }

    if (i != 0) exportCells = ["", ""];

    return [
      "    <tr class='" + rowClass + "' style='" + rowStyle + "' title='    " + rowTitle + "'>",
      "      <td class='hoverable-elem'><label class='full-div-label'> <input type='checkbox' class='chkbox' id='spec-" + i + "'> </label></td>",
      "      <td title='" + specimen.path + "'>" + specimen.name + "</td>",
      "      <td title='" + specimen.path + "'>" + extension + "</td>",
      exportCells[0],
      exportCells[1],
      "    </tr>",
    ].join("\n");

  }).join("\n");

  var tableCollRows = collections.map(function(collection, i) {

    var rowClass = '';
    var rowTitle = '';

    var extension = '';
    if (collection.format == 'PMM') extension = 'pmm';
    if (collection.format == 'DIR') extension = 'dir';

    var exportCells = [
      "      <td class='text-danger hoverable-elem' rowspan='" + collections.length + "' colspan='2' onclick='' title='No means available'>" + 'Stats' + "</td>",
      "      <td class='text-danger hoverable-elem' rowspan='" + collections.length + "' colspan='2' onclick='' title='No means available'>" + 'Stats' + "</td>",
    ]

    if (enoughMeans) {
      exportCells = [
        "      <td class='text-primary hoverable-elem' rowspan='" + collections.length + "' colspan='2' onclick='ipcRenderer.send(" + '"export-means-xlsx"' + ")'>" + 'Stats' + "</td>",
        "      <td class='text-primary hoverable-elem' rowspan='" + collections.length + "' colspan='2' onclick='ipcRenderer.send(" + '"export-means-csv"' + ")'>" + 'Stats' + "</td>",
      ]
    }

    if (i != 0) exportCells = ["", ""];

    return [
      "    <tr class='" + rowClass + "' title='    " + rowTitle + "'>",
      "      <td class='hoverable-elem'><label class='full-div-label'> <input type='checkbox' class='chkbox' id='coll-" + i + "'> </label></td>",
      "      <td title='" + collection.path + "'>" + collection.name + "</td>",
      "      <td title='" + collection.path + "'>" + extension + "</td>",
      exportCells[0],
      exportCells[1],
      "    </tr>",
    ].join("\n");

  }).join("\n");

  var tableSitesSetsRows = sitesSets.map(function(sitesSet, i) {

    var rowClass = '';
    var rowTitle = '';

    var extension = 'csv'

    var exportCells = [
      "      <td class='text-danger hoverable-elem' rowspan='" + sitesSets.length + "' colspan='2' onclick='' title='No means available'>" + 'Stats' + "</td>",
      "      <td class='text-danger hoverable-elem' rowspan='" + sitesSets.length + "' colspan='2' onclick='' title='No means available'>" + 'Stats' + "</td>",
    ]

    if (enoughSitesMeans) {
      exportCells = [
        "      <td class='text-primary hoverable-elem' rowspan='" + sitesSets.length + "' colspan='2' onclick='ipcRenderer.send(" + '"export-means-xlsx"' + ")'>" + 'Stats' + "</td>",
        "      <td class='text-primary hoverable-elem' rowspan='" + sitesSets.length + "' colspan='2' onclick='ipcRenderer.send(" + '"export-means-csv"' + ")'>" + 'Stats' + "</td>",
      ]
    }

    if (i != 0) exportCells = ["", ""];

    return [
      "    <tr class='" + rowClass + "' title='    " + rowTitle + "'>",
      "      <td class='hoverable-elem'><label class='full-div-label'> <input type='checkbox' class='chkbox' id='sitesSets-" + i + "'> </label></td>",
      "      <td title='" + sitesSet.path + "'>" + sitesSet.name + "</td>",
      "      <td title='" + sitesSet.path + "'>" + extension + "</td>",
      exportCells[0],
      exportCells[1],
      "    </tr>",
    ].join("\n");

  }).join("\n");

  var tableFooter = [
    "  </tbody>",
    "</table>",
  ].join("\n");

  document.getElementById("files-table-container").innerHTML = tableHeader + tableSpecRows + tableCollRows + tableSitesSetsRows + tableFooter;

  var checkboxes = document.getElementsByClassName('chkbox');
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener('click', (e) => selectFile(checkboxes[i]));
  }


}

// function eraseDot(dotToErase) {
//
//   var collections = JSON.parse(localStorage.getItem("collections"));
//   var selectedCollection = JSON.parse(localStorage.getItem("selectedCollection"));
//
//   collections.forEach((collection, i) => {
//     if (collection.created == selectedCollection.created) {
//       var independentIndex = 0;
//       collection.interpretations.forEach((interpretation, j) => {
//         if (j == dotToErase) {
//           collection.means = new Array();
//           interpretation.visible = !interpretation.visible;
//         }
//         if (interpretation.visible) {
//           interpretation.index = independentIndex;
//           independentIndex++;
//         }
//         else interpretation.index = '-';
//       });
//       selectedCollection = collection;
//     }
//   });
//
//   saveLocalStorage(collections, selectedCollection);
//   //ipcRenderer.send('reload-mainWin');
//   ipcRenderer.send('redraw-charts');
//   formatCollectionTable();
//
// }
//
// function saveLocalStorage(collections, selectedCollection) {
//
//   /*
//    * Function saveLocalStorage
//    * Saves sample object to local storage
//    */
//
//   // if(!force && (!document.getElementById("auto-save").checked || window.location.search)) {
//   //   return;
//   // }
//
//   localStorage.setItem("collections", JSON.stringify(collections));
//   localStorage.setItem("selectedCollection", JSON.stringify(selectedCollection));
//
//   // try {
//   //
//   // } catch(exception) {
//   //   console.log("danger", "Could not write to local storage. Export your data manually to save it.");
//   // }
//
// }
//
// // Downloads all interpreted components to a CSV (export data)
// function downloadСollectionsCSV() {
//
//   /*
//    * Function downloadInterpretationsCSV
//    * Downloads all interpreted components to a CSV
//    */
//
//   var collection = JSON.parse(localStorage.getItem("selectedCollection"));
//   var dirMode = localStorage.getItem('dirMode');
//
//   const FILENAME = "Collection";
//
//   const CSV_HEADER = new Array(
//     "ID", "Code", "StepRange", "N", "Dspec", "Ispec", "Dgeo", "Igeo", "Dstrat", "Istrat", "MAD", "Comment",// "Date",
//   );
//
//   var rows = new Array(CSV_HEADER.join(","));
//
//   // Export the interpreted components as CSV
//   collection.interpretations.forEach(function(interpretation) {
//
//     // check if specimen is not defined
//     var dSpec = interpretation.Dspec[dirMode] ? interpretation.Dspec[dirMode].toFixed(1) : " ";
//     var iSpec = interpretation.Ispec[dirMode] ? information.Ispec[dirMode].toFixed(1) : " ";
//     var dGeo = interpretation.Dgeo[dirMode];
//     var iGeo = interpretation.Igeo[dirMode];
//     var dStrat = interpretation.Dstrat[dirMode];
//     var iStrat = interpretation.Istrat[dirMode];
//
//     rows.push(new Array(
//       interpretation.id,
//       interpretation.code,
//       interpretation.stepRange,
//       interpretation.n,
//       dSpec,
//       iSpec,
//       dGeo.toFixed(1),
//       iGeo.toFixed(1),
//       dStrat.toFixed(1),
//       iStrat.toFixed(1),
//       interpretation.mad,
//       interpretation.comment,
//     ).join(ITEM_DELIMITER));
//
//   });
//
//   outputCollections = rows.join(LINE_DELIMITER);
//
//   saveFile("Save collection data", FILENAME, outputCollections);
//
// }
//
// // Downloads all interpreted components to a CSV (export data)
// function downloadCollectionsXLSX() {
//
//   var collection = JSON.parse(localStorage.getItem("selectedCollection"));
//   var dirMode = localStorage.getItem('dirMode');
//
//   const FILENAME = "Collection";
//
//   const XLSX_HEADER = new Array(
//     "ID", "Code", "StepRange", "N", "Dspec", "Ispec", "Dgeo", "Igeo", "Dstrat", "Istrat", "MAD", "Comment",// "Date",
//   );
//
//   var rows = [XLSX_HEADER];
//
//   collection.interpretations.forEach(function(interpretation) {
//
//     // check if specimen is not defined
//     var dSpec = interpretation.Dspec[dirMode] ? interpretation.Dspec[dirMode].toFixed(1) : " ";
//     var iSpec = interpretation.Ispec[dirMode] ? information.Ispec[dirMode].toFixed(1) : " ";
//     var dGeo = interpretation.Dgeo[dirMode];
//     var iGeo = interpretation.Igeo[dirMode];
//     var dStrat = interpretation.Dstrat[dirMode];
//     var iStrat = interpretation.Istrat[dirMode];
//
//     rows.push([
//       interpretation.id,
//       interpretation.code,
//       interpretation.stepRange,a
//       interpretation.n,
//       dSpec,
//       iSpec,
//       dGeo.toFixed(1),
//       iGeo.toFixed(1),
//       dStrat.toFixed(1),
//       iStrat.toFixed(1),
//       interpretation.mad,
//       interpretation.comment,
//     ]);
//
//   });
//
//   outputCollections = xlsx.build([{name: FILENAME, data: rows}]); // Returns a buffer
//
//   saveFile("Save Collections data", FILENAME, outputCollections, 'xlsx');
//
// }

formatCollectionTable();
resizeTable();

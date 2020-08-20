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
  resizeTable();
})

closeWinBtn.addEventListener('click', (event) => {
  remote.getCurrentWindow().hide();
})

ipcRenderer.on('redraw-table', (event) => {
  updateInterpretationTable();
})

// Inner scripts

// CSV delimiters
const ITEM_DELIMITER = ",";
const TAB_DELIMITER = "\t";
const LINE_DELIMITER = "\n";

const tableContainer = document.getElementById("interpretation-table-container");

tableContainer.addEventListener("input", interpretationTableClickHandler);
window.addEventListener("resize", resizeTable);

function resizeTable() {

  tableContainer.style.height = window.innerHeight - document.getElementById('static-elements').offsetHeight - 5   + "px";

}

// Updates the table with information on interpreted components
function updateInterpretationTable() {

  /*
   * Function updateInterpretationTable
   * Updates the table with information on interpreted components
   */

  const COMMENT_LENGTH = 15;
  const ERROR_NO_COMPONENTS = "<h6 class='text-muted text-center' title='Make interpretations to see them'>No components available</h6>";
  const ChRM_COMMENT = "";

  specimens = JSON.parse(localStorage.getItem("specimens"));
  specimen = JSON.parse(localStorage.getItem("selectedSpecimen"));

  if (specimens.length == 0) {
    document.getElementById("interpretation-table-container").innerHTML = '';
    document.getElementById("save-dataTable").innerHTML = '';
    return;
  }

  // No interpretations to show
  var zeroInterpretations = true;
  for (let i = 0; i < specimens.length; i++) {
    console.log(specimens[i].interpretations.length);
    if (specimens[i].interpretations.length != 0) {
      zeroInterpretations = false;
      break;
    }
  }

  if (zeroInterpretations) return document.getElementById("interpretation-table-container").innerHTML = ERROR_NO_COMPONENTS;

  var saveBtn = new Array(
    "<button onclick='downloadInterpretationsCSV()' type='button' title='Save interpretations data as .csv' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "   <i class='fal fa-file-csv'></i>",
    "</button>",
  ).join("\n");

  var tableHeader = new Array(
    "<table id='interpretDataTable' class='table table-sm table-bordered w-100 small text-center' style='text-align: center!important; margin: 0;'>",
    "  <thead class='thead-light'>",
    "    <tr>",
    "    <th><span title='Delete all interpretations'><button onclick='deleteAllInterpretations()' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-trash-alt'></i></button></span></th>",
    "      <th>ID</th>",
    "      <th>Dspec</th>",
    "      <th>Ispec</th>",
    "      <th>Dgeo</th>",
    "      <th>Igeo</th>",
    "      <th>Dstrat</th>",
    "      <th>Istrat</th>",
    "      <th>MAD</th>",
    "      <th>Code</th>",
    "      <th>Steps</th>",
    "      <th>N</th>",
    "      <th>Comment</th>",
    "    </tr>",
    "  </thead>",
  ).join("\n");

  // Start adding all the specimens

  var allSpecRows = new Array();

  specimens.forEach(function(specimen, i) {
    var currSpecRows = specimen.interpretations.map(function(interpretation, j) {

      // Get the interpretation in the right reference frame
      var componentSpec = interpretation['specimen'];
      var componentGeo = interpretation['geographic'];
      var componentTect = interpretation['tectonic'];

      var directionSpec = literalToCoordinates(componentSpec.coordinates).toVector(Direction);
      var directionGeo = literalToCoordinates(componentGeo.coordinates).toVector(Direction);
      var directionTect = literalToCoordinates(componentTect.coordinates).toVector(Direction);

      // Handle comments on interpretations
      if(interpretation.comment === null) {
        comment = ChRM_COMMENT;
      } else {
        comment = interpretation.comment;
      }

      // Full code of interpretation

      var code = "dirPCA";

      // Mad angle (if forced this is unreliable)
      var mad = interpretation.MAD.toFixed(2);
      if(interpretation.anchored) {
        mad = "<span class='text-primary' title='The MAD for anchored components is unreliable'>" + mad + "</span>";
        code = "dir0PCA";
      }

      //code += tauToMark(interpretation.type);
      //code = "<span title='dirPCA'>" + code + "</span>";

      // Intensity (also unreliable when forced)
      var intensity = interpretation.intensity.toFixed(2);
      if(interpretation.anchored) {
        intensity = "<span class='text-primary' title='The intensity for anchored components is unreliable'>" + intensity + "</span>";
      }
      // Number of steps
      var N = interpretation.steps.length;

      allSpecRows.push(
      [
        "  </tr>",
        "    <td><span title='Delete interpretation'><button onclick='deleteAllInterpretations(" + i + ',' + j + ")' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-minus-square'></i></button></span></td>",
        "    <td>" + specimen.name + "</td>",
        "    <td>" + directionSpec.dec.toFixed(2) + "</td>",
        "    <td>" + directionSpec.inc.toFixed(2) + "</td>",
        "    <td>" + directionGeo.dec.toFixed(2) + "</td>",
        "    <td>" + directionGeo.inc.toFixed(2) + "</td>",
        "    <td>" + directionTect.dec.toFixed(2) + "</td>",
        "    <td>" + directionTect.inc.toFixed(2) + "</td>",
        "    <td>" + mad + "</td>",
        "    <td>" + code + "</td>",
        "    <td>" + interpretation.steps[0].step + '-' + interpretation.steps[N-1].step + "</td>",
        "    <td>" + N + "</td>",
        "    <td class='' contenteditable='true' style='cursor: pointer;' title='" + comment + "'>" + ((comment.length < COMMENT_LENGTH) ? comment : comment.slice(0, COMMENT_LENGTH) + "…") + "</td>",
        "  </tr>"
      ].join("\n"));
    });
  });

  var tableFooter = "</table>";
  document.getElementById("interpretation-table-container").innerHTML = tableHeader + allSpecRows.join("\n") + tableFooter;
  document.getElementById("save-dataTable").innerHTML = saveBtn;
}

// Deletes all interpretations in a specimen
function deleteAllInterpretations(specimenIndex, interpretationIndex) {

  /*
   * Function deleteAllInterpretations
   * Deletes all interpretations in a specimen
   */

   specimens = JSON.parse(localStorage.getItem("specimens"));
   selectedSpecimen = JSON.parse(localStorage.getItem("selectedSpecimen"));

   // Reset
   if (specimenIndex === undefined) {
     specimens.forEach((specimen, i) => {
       specimen.interpretations = new Array();
       selectedSpecimen = specimen;
     });
   }
   else if (interpretationIndex === undefined) {
     specimens[specimenIndex].interpretations = new Array();
     selectedSpecimen = specimens[specimenIndex];
   }
   else {
     specimens[specimenIndex].interpretations.splice(interpretationIndex, 1);
     selectedSpecimen = specimens[specimenIndex];
   }


   //var specimen = selectedSpecimen; // getSelectedSpecimen();


  // Reset
  // if(index === undefined) {
  //   specimen.interpretations = new Array();
  // } else {
  //   specimen.interpretations.splice(index, 1);
  // }

  //redrawCharts();
  saveLocalStorage(specimens, selectedSpecimen);
  ipcRenderer.send('redraw-charts');

}

// Handlers a click on the interpreted component table (erase + comment)
function interpretationTableClickHandler(event) {

  /*
   * Function interpretationTableClickHandler
   * Handlers a click on the interpreted component table
   */
  specimens = JSON.parse(localStorage.getItem("specimens"));

  var columnIndex = event.target.cellIndex;
  var rowIndex = event.target.parentElement.rowIndex;

  var specimenName = event.target.parentElement.querySelectorAll("td")[1].innerHTML;

  var tableRows = document.getElementById('interpretation-table-container').querySelectorAll("tr");
  // index of row where specimen specimenName starts (start -> 119_0, 119_0, start -> 118_0, 118_0, start -> 117_0, ...)
  var rowIndexFirstSpecName;
  for (let i = 0; i < tableRows.length; i++) {
    if (tableRows[i].cells[1].innerHTML == specimenName) {
      rowIndexFirstSpecName = i;
      break;
    }
  }
  var currSpecRowIndex = rowIndex - rowIndexFirstSpecName;

  var selectedSpecimen;
  for (let i = 0; i < specimens.length; i++) {
    if (specimens[i].name == specimenName) {
      selectedSpecimen = specimens[i];
      break;
    }
  }

  if (columnIndex === 12) {
    selectedSpecimen.interpretations[currSpecRowIndex].comment = event.target.innerHTML;
  }

  saveLocalStorage(specimens);

}

function saveLocalStorage(specimens, selectedSpecimen) {

  /*
   * Function saveLocalStorage
   * Saves sample object to local storage
   */

  // if(!force && (!document.getElementById("auto-save").checked || window.location.search)) {
  //   return;
  // }

  localStorage.setItem("specimens", JSON.stringify(specimens));
  localStorage.setItem("selectedSpecimen", JSON.stringify(selectedSpecimen));

  // try {
  //
  // } catch(exception) {
  //   console.log("danger", "Could not write to local storage. Export your data manually to save it.");
  // }

}

// Downloads all interpreted components to a CSV (export data)
function downloadInterpretationsCSV() {

  /*
   * Function downloadInterpretationsCSV
   * Downloads all interpreted components to a CSV
   */

  const FILENAME = "interpretations";

  const CSV_HEADER = new Array(
    "ID", "Code", "StepRange", "N", "Dspec", "Ispec", "Dgeo", "Igeo", "Dstrat", "Istrat", "MAD", "Comment",// "Date",
  );

  var rows = new Array(CSV_HEADER.join(","));

  // Create CSV rows
  specimens.forEach(function(specimen) {
    specimen.interpretations.forEach(function(interpretation) {

      // Get the interpretation in the right reference frame
      var componentSpec = interpretation['specimen'];
      var componentGeo = interpretation['geographic'];
      var componentTect = interpretation['tectonic'];

      var directionSpec = literalToCoordinates(componentSpec.coordinates).toVector(Direction);
      var directionGeo = literalToCoordinates(componentGeo.coordinates).toVector(Direction);
      var directionTect = literalToCoordinates(componentTect.coordinates).toVector(Direction);

      var code = "dirPCA";
      if(interpretation.anchored) code = "dir0PCA";

      var N = interpretation.steps.length;

      console.log(interpretation.comment);

      rows.push(new Array(
        specimen.name,
        code,
        interpretation.steps[0].step + '-' + interpretation.steps[N-1].step,
        N,
        directionSpec.dec.toFixed(2),
        directionSpec.inc.toFixed(2),
        directionGeo.dec.toFixed(2),
        directionGeo.inc.toFixed(2),
        directionTect.dec.toFixed(2),
        directionTect.inc.toFixed(2),
        interpretation.MAD.toFixed(2),
        interpretation.comment,
        // interpretation.created
      ).join(ITEM_DELIMITER));

    });
  });

  outputInterpretations = rows.join(LINE_DELIMITER);

  saveFile("Save interpretations data", FILENAME, outputInterpretations);

  // Old way to save
  //downloadAsCSV(FILENAME, rows.join(LINE_DELIMITER));

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

updateInterpretationTable();
resizeTable();

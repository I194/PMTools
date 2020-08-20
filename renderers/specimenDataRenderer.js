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

ipcRenderer.on('redraw-table', (event) => {
  formatStepTable();
})

window.addEventListener("resize", resizeTable);

function resizeTable() {

  document.getElementById("specimen-table-container").style.height = window.innerHeight - document.getElementById('static-elements').offsetHeight - 15  + "px";

}

// Formats table of imported data
function formatStepTable() {

  /*
   * Function StepSelector.formatStepTable
   * Formats parameter table at the top of the page
   */

  // var step = stepSelector.getCurrentStep();
  specimens = JSON.parse(localStorage.getItem("specimens"));
  specimen = JSON.parse(localStorage.getItem("selectedSpecimen"));

  if (specimens.length == 0) {
    document.getElementById("table-head-container").innerHTML = '';
    document.getElementById("table-body-container").innerHTML = '';
    return;
  }

  var tableHeadHeader = new Array(
    "  <thead class='thead-light'>",
    "    <tr>",
    "      <th>Name</th>",
    "      <th>Core Azimuth</th>",
    "      <th>Core Dip</th>",
    "      <th>Bedding Strike</th>",
    "      <th>Bedding Dip</th>",
    "      <th>Volume, 10<sup>-6</sup>m<sup>3</sup></th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  var tableHeadRows = new Array(
    "    <tr>",
    "      <td>" + specimen.name + "</td>",
    "      <td>" + specimen.coreAzimuth + "</td>",
    "      <td>" + specimen.coreDip + "</td>",
    "      <td>" + specimen.beddingStrike + "</td>",
    "      <td>" + specimen.beddingDip + "</td>",
    "      <td>" + specimen.volume + "</td>",
    "    </tr>",
  );

  var tableHeadFooter = "</tbody>";

  var tableBodyHeader = new Array(
    "  <thead class='thead-light fixed-header'>",
    "    <tr>",
    "      <th>E</th>",
    "      <th>#</th>",
    "      <th>Step</th>",
    "      <th>Xspec, 10<sup>-12</sup>Am<sup>2</sup></th>",
    "      <th>Yspec, 10<sup>-12</sup>Am<sup>2</sup></th>",
    "      <th>Zspec, 10<sup>-12</sup>Am<sup>2</sup></th>",
    "      <th>Intensity, 10<sup>-6</sup>A/m</th>",
    "      <th>Dgeo</th>",
    "      <th>Igeo</th>",
    "      <th>Dstrat</th>",
    "      <th>Istrat</th>",
    "      <th>a95</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  var tableBodyRows = specimen.steps.map(function(step, i) {

    var directionGeo = inReferenceCoordinates("geographic", specimen, new Coordinates(step.x, step.y, step.z)).toVector(Direction);
    var directionTect = inReferenceCoordinates("tectonic", specimen, new Coordinates(step.x, step.y, step.z)).toVector(Direction);

    if (specimen.latitude === null || specimen.longitude === null || specimen.age === null && specimen.ageMin === null || specimen.ageMax === null || specimen.lithology === null || specimen.geology === null) {
      var specimenLocation = "<span style='pointer-events: none;' class='text-muted'>" + getSuccesfulLabel(false) + " Edit</span>";
    } else {
      var specimenLocation = "<span style='pointer-events: none;' class='text-muted'>" + getSuccesfulLabel(true) + " Edit</span>";
    }

    // Notify error in Utrecht format
    // if (isUtrechtIntensityBug(specimen)) {
    //   var intensity = "<span style='color: red' title='Intensity should be divided by sample volume (see changelog 2.0.2).'>" + (directionGeo.length / specimen.volume).toFixed(2) + "</span>";
    // }
    // else {
    var intensity = (directionGeo.length / specimen.volume).toFixed(0);
    // }

    var rowClass = '';
    var rowTitle = '';
    var num = step.index + 1;
    var stepVisibleTitle = '<span title="Erase step">';
    var stepVisibleIcon = '<i class="fad fa-eraser"></i>'
    if (!step.visible) {
      rowClass = 'erase-row text-muted';
      num = '-';
      stepVisibleTitle = '<span title="Redraw step">';
      stepVisibleIcon = '<i class="fad fa-pencil"></i>';
      rowTitle = 'Step erased';
    }

    console.log(step.index, num);

    return [
      "    <tr class='" + rowClass + "' title='" + rowTitle + "'>",
      "      <td>" + stepVisibleTitle + "<button onclick='eraseStep(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + stepVisibleIcon + "</button></span></td>",
      "      <td>" + num + "</td>",
      "      <td>" + step.step + "</td>",
      "      <td>" + step.x.toFixed(0) + "</td>",
      "      <td>" + step.y.toFixed(0) + "</td>",
      "      <td>" + step.z.toFixed(0) + "</td>",
      "      <td>" + intensity + "</td>",
      "      <td>" + directionGeo.dec.toFixed(2) + "</td>",
      "      <td>" + directionGeo.inc.toFixed(2) + "</td>",
      "      <td>" + directionTect.dec.toFixed(2) + "</td>",
      "      <td>" + directionTect.inc.toFixed(2) + "</td>",
      "      <td>" + step.error.toFixed(2) + "</td>",
      // "      <td>" + step.step + "</td>",
      // "      <td>" + COORDINATES + "</td>",
      // "      <td>" + direction.dec.toFixed(2) + "</td>",
      // "      <td>" + direction.inc.toFixed(2) + "</td>",
      // "      <td>" + intensity + "</td>",
      // "      <td>" + (step.error ? step.error.toFixed(2) : null ) + "</td>",
      // "      <td style='cursor: pointer;'>" + specimen.coreAzimuth + "</td>",
      // "      <td style='cursor: pointer;'>" + specimen.coreDip + "</td>",
      // "      <td style='cursor: pointer;'>" + specimen.beddingStrike + "</td>",
      // "      <td style='cursor: pointer;'>" + specimen.beddingDip + "</td>",
      // "      <td style='cursor: pointer;'>" + specimen.volume + "</td>",
      // "      <td style='cursor: pointer;'>" + specimenLocation + "</td>",
      "    </tr>",
    ].join("\n");
  });

  var tableBodyFooter = "</tbody>";

  document.getElementById("table-head-container").innerHTML = tableHeadHeader + tableHeadRows.join("\n") + tableHeadFooter;
  document.getElementById("table-body-container").innerHTML = tableBodyHeader + tableBodyRows.join("\n") + tableBodyFooter;

}

function eraseStep(stepToErase) {

  var specimens = JSON.parse(localStorage.getItem("specimens"));
  var selectedSpecimen = JSON.parse(localStorage.getItem("selectedSpecimen"));

  specimens.forEach((specimen, i) => {
    if (specimen.created == selectedSpecimen.created) {
      var independentIndex = 0;
      specimen.steps.forEach((step, j) => {
        if (j == stepToErase) {
          specimen.interpretations = new Array();
          step.visible = !step.visible;
        }
        if (step.visible) {
          step.index = independentIndex;
          independentIndex++;
        }
        else step.index = '-';
      });
      selectedSpecimen = specimen;
    }
  });

  saveLocalStorage(specimens, selectedSpecimen);
  //ipcRenderer.send('reload-mainWin');
  ipcRenderer.send('redraw-charts');
  console.log(JSON.parse(localStorage.getItem("specimens")), JSON.parse(localStorage.getItem("selectedSpecimen")));
  formatStepTable();

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

formatStepTable();
resizeTable();

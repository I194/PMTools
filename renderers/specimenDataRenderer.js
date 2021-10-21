const {BrowserWindow} = require('electron').remote;
const { remote, ipcRenderer } = require('electron');
const path = require('path');
const fs = require("fs");
const dialog = require('electron').remote.dialog;

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
  // downloadInterpretationsMagic()
  var saveBtns = new Array(
    "<div class='btn-group btn-block btn-group-sm btn-group-justified d-flex mx-auto'>",
    "  <button onclick='ipcRenderer.send(" + '"' + 'open-magic-export' + '"' + ")' type='button' title='Save measurements data as MagIC' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    Export as MagIC <i class='fal fa-file-txt'></i>",
    "  </button>",
    "  <button onclick='downloadMeansCSV()' type='button' title='Save measurements data as .csv' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    Export as .csv <i class='fal fa-file-csv'></i>",
    "  </button>",
    "  <button onclick='downloadMeansXLSX()' type='button' title='Save measurements data as .xlsx' class='btn btn-secondary btn btn-block' style='margin: 0; padding: 0; border: 0;'>",
    "    Export as .xlsx <i class='fal fa-file-excel'></i>",
    "  </button>",
    "</div>"
  ).join("\n");

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
    "      <td>" + ((specimen.volume) ? specimen.volume : '?') + "</td>",
    "    </tr>",
  );

  var tableHeadFooter = "</tbody>";

  var tableBodyHeader = new Array(
    "  <thead class='thead-light fixed-header'>",
    "    <tr>",
    "      <th>E</th>",
    "      <th class='pb-0'>#" + putCopyColBtn(".num") + "</th>",
    "      <th class='pb-0'>Step" + putCopyColBtn(".step") + "</th>",
    "      <th class='pb-0'>Xspec, 10<sup>-12</sup>Am<sup>2</sup>" + putCopyColBtn(".xspec") + "</th>",
    "      <th class='pb-0'>Yspec, 10<sup>-12</sup>Am<sup>2</sup>" + putCopyColBtn(".yspec") + "</th>",
    "      <th class='pb-0'>Zspec, 10<sup>-12</sup>Am<sup>2</sup>" + putCopyColBtn(".zspec") + "</th>",
    "      <th class='pb-0'>Intensity, 10<sup>-6</sup>A/m" + putCopyColBtn(".intens") + "</th>",
    "      <th class='pb-0'>Dgeo" + putCopyColBtn(".dgeo") + "</th>",
    "      <th class='pb-0'>Igeo" + putCopyColBtn(".igeo") + "</th>",
    "      <th class='pb-0'>Dstrat" + putCopyColBtn(".dstrat") + "</th>",
    "      <th class='pb-0'>Istrat" + putCopyColBtn(".istrat") + "</th>",
    "      <th class='pb-0'>a95" + putCopyColBtn(".a95") + "</th>",
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
    //   var intensity = "<span style='color: red' title='Intensity should be divided by sample volume (see changelog 2.0.2).'>" + (directionGeo.length / specimen.volume).toFixed(1) + "</span>";
    // }
    // else {
    var volume = (specimen.volume) ? specimen.volume : 1;
    var intensity = (directionGeo.length / volume);
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

    console.log(step);

    return [
      "    <tr class='" + rowClass + "' title='" + rowTitle + "'>",
      "      <td>" + stepVisibleTitle + "<button onclick='eraseStep(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + stepVisibleIcon + "</button></span></td>",
      "      <td class='num'>" + num + "</td>",
      "      <td class='step'>" + step.step + "</td>",
      "      <td class='xspec'>" + step.x.toExponential(2).toUpperCase() + "</td>",
      "      <td class='yspec'>" + step.y.toExponential(2).toUpperCase() + "</td>",
      "      <td class='zspec'>" + step.z.toExponential(2).toUpperCase() + "</td>",
      "      <td class='intens'>" + intensity.toExponential(2).toUpperCase() + "</td>",
      "      <td class='dgeo'>" + directionGeo.dec.toFixed(1) + "</td>",
      "      <td class='igeo'>" + directionGeo.inc.toFixed(1) + "</td>",
      "      <td class='dstrat'>" + directionTect.dec.toFixed(1) + "</td>",
      "      <td class='istrat'>" + directionTect.inc.toFixed(1) + "</td>",
      "      <td class='a95'>" + step.error.toFixed(1) + "</td>",
      "    </tr>",
    ].join("\n");
  });

  var tableBodyFooter = "</tbody>";

  document.getElementById("table-head-container").innerHTML = tableHeadHeader + tableHeadRows.join("\n") + tableHeadFooter;
  document.getElementById("table-body-container").innerHTML = tableBodyHeader + tableBodyRows.join("\n") + tableBodyFooter;
  document.getElementById("save-dataTable").innerHTML = saveBtns;

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

function saveFilePMD() {

  /*
  * Function downloadInterpretationsCSV
  * Downloads all interpreted components to a CSV
  */

  specimen = JSON.parse(localStorage.getItem("selectedSpecimen"));

  const addZeroToExp = number => {
  	let parts = number.split('E');
    let leftPart = parts[0];
    let rightPart = parts[1];
    rightPart = Math.abs(Number(rightPart)) < 10 ? rightPart[0] + '0' + rightPart[1] : rightPart;
    return leftPart + 'E' + rightPart;
  }

  const FILENAME = specimen.name;

  console.log(specimen.volume, specimen.volume.toExponential(1).toUpperCase().length)

  const headData = (
    '\n'
    + FILENAME + ' '.repeat(10 - FILENAME.length)
    + 'a=' + ' '.repeat(5 - specimen.coreAzimuth.toFixed(1).toString().length) + specimen.coreAzimuth.toFixed(1) + ' '.repeat(3)
    + 'b=' + ' '.repeat(5 - specimen.coreDip.toFixed(1).toString().length) + specimen.coreDip.toFixed(1) + ' '.repeat(3)
    + 's=' + ' '.repeat(5 - specimen.beddingStrike.toFixed(1).toString().length) + specimen.beddingStrike.toFixed(1) + ' '.repeat(3)
    + 'd=' + ' '.repeat(5 - specimen.beddingDip.toFixed(1).toString().length) + specimen.beddingDip.toFixed(1) + ' '.repeat(3)
    + 'v=' + ' '.repeat(7 - specimen.volume.toExponential(1).toUpperCase().length) + specimen.volume.toExponential(1).toUpperCase() + 'm3'
    + '\n'
  );

  const tableHeader = (
    'PAL' + ' '.repeat(3)
    + 'Xc (Am2)' + ' '.repeat(2)
    + 'Yc (Am2)' + ' '.repeat(2)
    + 'Zc (Am2)' + ' '.repeat(2)
    + 'MAG(A/m)' + ' '
    + '  Dg ' + ' '
    + '  Ig ' + ' '
    + '  Ds ' + ' '
    + '  Is ' + ' '
    + ' a95'
    + '\n'
  );

  const stepsData = specimen.steps.map((step, iter) => {

    const directionGeo = inReferenceCoordinates("geographic", specimen, new Coordinates(step.x, step.y, step.z)).toVector(Direction);
    const directionTect = inReferenceCoordinates("tectonic", specimen, new Coordinates(step.x, step.y, step.z)).toVector(Direction);

    const volume = (specimen.volume) ? specimen.volume : 1;
    const x = addZeroToExp(step.x.toExponential(2).toUpperCase());
    const y = addZeroToExp(step.y.toExponential(2).toUpperCase());
    const z = addZeroToExp(step.z.toExponential(2).toUpperCase());
    const intensity = addZeroToExp((directionGeo.length / volume).toExponential(2).toUpperCase());

    return (
      step.step + ' '.repeat(4 - step.step.length) + ' '
      + ' '.repeat(9 - x.length) + x + ' '
      + ' '.repeat(9 - y.length) + y + ' '
      + ' '.repeat(9 - z.length) + z + ' '
      + ' '.repeat(9 - intensity.length) + intensity + ' '
      + ' '.repeat(5 - directionGeo.dec.toFixed(1).toString().length) + directionGeo.dec.toFixed(1) + ' '
      + ' '.repeat(5 - directionGeo.inc.toFixed(1).toString().length) + directionGeo.inc.toFixed(1) + ' '
      + ' '.repeat(5 - directionTect.dec.toFixed(1).toString().length) + directionGeo.dec.toFixed(1) + ' '
      + ' '.repeat(5 - directionTect.inc.toFixed(1).toString().length) + directionGeo.inc.toFixed(1) + ' '
      + ' '.repeat(4 - step.error.toFixed(1).length) + step.error.toFixed(1)
      + '\n'
    )
  }).join('');

  outData = headData + tableHeader + stepsData;

  console.log(outData)

  saveFile("Save interpretations data", FILENAME, outData, 'txt');

}


formatStepTable();
resizeTable();

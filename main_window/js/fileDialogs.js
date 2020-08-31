// FILE IMPORTING
function importFiles(modal) {

  /*
   * Function fileSelectionHandler
   *  Callback fired when input files are selected
   */

  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!', lastOpenPath);
  $("#menu-file").click();

  // Options of openFileDialog
  var options = {
    title: "Open files",
    filters: [
      { name: 'PaleoMac', extensions: ['pmd', 'pmm', 'dir'] },
      // { name: 'Remasoft', extensions : ['rs3', 'rsf'] },
      // { name: 'JR5', extensions: ['JR5'] },
      // { name: 'JR6', extensions: ['JR6'] },
      { name: 'rmg non-format file', extensions: ['*'] },
        { name: 'Custom', extensions: ['csv', 'json'] },
    ],
    defaultPath: lastOpenPath,
    properties: [
      'multiSelections',
    ]
  }

  var importPaths = dialog.showOpenDialogSync(options);

  if (!importPaths) return console.log('Files not selected');

  var files = [];
  importPaths.forEach((path, i) => {
    files.push({
      name: path.replace(/^.*[\\\/]/, ''),
      path: path,
      data: fs.readFileSync(path, "utf8"),
    })
    lastOpenPath = path.split(path.replace(/^.*[\\\/]/, ''))[0];
    if (modal) localStorage.setItem("lastOpenPath", lastOpenPath);
  });

  loadCollectionFileCallback(files, modal);

  // var files = Array.from(event.target.files);
  // var filesContent = new Array();
  //
  // files.forEach((file, i) => {
  //   var importPath = file.path;
  //
  //   var openedFile = fs.readFileSync(importPath, (error, data) => {
  //     if (error) throw error;
  //     return data;
  //   });
  //
  //   filesContent.push(openedFile);
  // });
  //
  // console.log(filesContent);

  //readMultipleFiles(Array.from(event.target.files), loadCollectionFileCallback);

  // Reset value in case loading the same file
  this.value = null;

}

function loadCollectionFileCallback(files, modal) {

  //const format = document.getElementById("format-selection").value;
  const format = new Array();
  files.forEach((file, i) => {
    var filenameSplit = file.name.split('.');
    //format.push((/[.]/.exec(file.name)) ? /[^.]+$/.exec(file.name) : undefined);
    if (filenameSplit.length == 1) format.push(""); // подразумевается, что название не содержит точек
    else format.push(filenameSplit[filenameSplit.length - 1]);
  });
  // Drop the samples if not appending
  if (modal) {
    specimens = new Array();
    collections = new Array();
  }
  else if(!document.getElementById("append-input").checked) {
    specimens = new Array();
    collections = new Array();
  }

  var nSamples = specimens.length;

  // Try adding the demagnetization data
  addDegmagnetizationFiles(format, files);

  specimens.forEach((specimen, i) => {
    specimen.steps.forEach((step, i) => {
      step.index = i;
    });
  });
  collections.forEach((collection, i) => {
    if (collection.interpretations[0].index != 0) {
      var flipData = flipCollections(collection);
      collection.interpretations.forEach((interpretation, i) => {
        // add index
        interpretation.index = i;

        // add reversed data
        var dSpecR = flipData['specimen'] ? flipData['specimen'][i].x : interpretation.Dspec;
        var iSpecR = flipData['specimen'] ? flipData['specimen'][i].x : interpretation.Ispec;

        interpretation.Dspec = {normal: interpretation.Dspec, reversed: dSpecR};
        interpretation.Ispec = {normal: interpretation.Ispec, reversed: iSpecR};
        interpretation.Dgeo = {normal: interpretation.Dgeo, reversed: flipData['geographic'][i].x};
        interpretation.Igeo = {normal: interpretation.Igeo, reversed: flipData['geographic'][i].y};
        interpretation.Dstrat = {normal: interpretation.Dstrat, reversed: flipData['tectonic'][i].x};
        interpretation.Istrat = {normal: interpretation.Istrat, reversed: flipData['tectonic'][i].y};
      });
      // add vgp data
      var pole = getVGPData(collection);
      collection.vgp = pole;
      if ((document.getElementById('site-lat')) && (document.getElementById('site-lon'))) {
        document.getElementById("site-lat").value = collection.vgp.siteLat;
        document.getElementById("site-lon").value = collection.vgp.siteLon;
      }
    }
  });

  if (modal) {
    if (specimens.length > 0) localStorage.setItem("specimens", JSON.stringify(specimens));
    if (specimens.length > 0) localStorage.setItem("collections", JSON.stringify(collections));
    return ipcRenderer.send('init-pages');
  }
  else saveLocalStorage();

  ipcRenderer.send('reload-specDataWin');
  ipcRenderer.send('reload-interpretDataWin');
  ipcRenderer.send('reload-meansDataWin');

  updateFileSelect('specimen');
  updateFileSelect('collection');

  ipcRenderer.send('init-pages');
  redrawCharts();

  // if(specimens.length) {
  //   enableInterpretationTabs();
  // }

  //notify("success", "Succesfully added <b>" + (specimens.length - nSamples) + "</b> specimen(s) (" + format + ").");

}

function addDegmagnetizationFiles(format, files) {

  /*
   * Function addDegmagnetizationFiles
   * Adds files loaded by the Filehandler API and delegates to the correct handler
   */

  console.log(format);
  files.forEach((file, i) => {
    if (format[i] == "PMD" || format[i] == "pmd") format[i] = "PALEOMAC";
    switch(format[i]) {
      case "dir":
      case "DIR":
        return importDIR(file);
      case "pmm":
      case "PMM":
        return importPMM(file);
      case "UNKNOWN":
        return importUnknown(file);
      case "BLACKMNT":
        return importBlackMnt(file);
      case "UTRECHT":
        return importUtrecht(file);
      case "MUNICH":
        return importMunich(file);
      case "PMAGORG2":
        return importApplicationSave(file);
      case "PMAGORG":
        return importApplicationSaveOld(file);
      case "HELSINKI":
        return importHelsinki(file);
      case "CALTECH":
        return importCaltech(file);
      case "BCN2G":
        return importBCN2G(file);
      case "NGU":
        return importNGU(file);
      case "PALEOMAC":
        return importPaleoMac(file);
      case "OXFORD":
        return importOxford(file);
      case "RS3":
      case "rs3":
        return importRS3(file);
      case "BEIJING":
        return importBCN2G(file);
      case "CENIEH":
        return importCenieh(file);
      case "MAGIC":
        return importMagic(file);
      case "JR5":
      case "jr5":
        return importJR5(file);
      case "JR6":
      case "jr6":
        return importJR6(file);
      case "CJONES":
        return importPaleoMag(file);
      case "":
        return importRMG(file);
      default:
        throw(new Exception("Unknown importing format requested."));
    }
  });

}

// FILE EXPORTING
function saveFile(windowTitle, fileName, data, extension) {

  // Options of saveFileDialog
  if ((!extension) || (extension === 'csv')) {
    extension = 'csv';
    filterName = 'CSV UTF-8 (разделитель - запятая)'
  }

  if (extension === 'xlsx') {
    filterName = 'Книга Excel';
  }
  var options = {
    title: windowTitle,
    filters: [
      { name: filterName, extensions: [extension] }
    ],
    defaultPath: lastSavePath + '/' + fileName + '.' + extension,
  }

  var savePath = dialog.showSaveDialogSync(options);

  if (savePath) {
    // Check for extension
    if (savePath.slice(-4) != ('.' + extension)) savePath += '.' + extension;
    // Saving
    fs.writeFileSync(savePath, data, (error) => {
      if (error) throw error;
    });

    lastSavePath = savePath.split(savePath.replace(/^.*[\\\/]/, ''))[0];
  }
  // Save lastSavePath to localStorage

  localStorage.setItem("lastSavePath", lastSavePath);

}

function copyFile(windowTitle, filePath, extension) {

  // Options of saveFileDialog
  var options = {
    title: windowTitle,
    filters: [
      { name: extension, extensions: [extension] }
    ],
    defaultPath: lastSavePath + '/example.png'// + extension,
  }

  var savePath = dialog.showSaveDialogSync(options);

  if (savePath) {
    // // Check for extension
    // if (savePath.slice(-4) != '.csv') savePath += '.csv';
    // // Saving
    // fs.writeFileSync(savePath, data, (error) => {
    //   if (error) throw error;
    // });

    fs.copyFileSync('../../img/formats/pmd_example.png', savePath);

    lastSavePath = savePath.split(savePath.replace(/^.*[\\\/]/, ''))[0];
  }
  // Save lastSavePath to localStorage

  localStorage.setItem("lastSavePath", lastSavePath);

}

// PROJECT IMPORTING
function importProject() {
  /*
   * Function fileSelectionHandler
   *  Callback fired when input project are selected
   */
  $("#menu-file").click();
  // Options of openFileDialog
  var options = {
    title: "Open project",
    filters: [
     { name: 'application/json', extensions: ['json'] }
    ],
    defaultPath: lastOpenPath,
    multiSelections: false,
  }

  var importPath = dialog.showOpenDialogSync(options)[0];

  // Check on dialog closed and if not -> save project
  if (importPath.length > 0) {
    // Check for extension
    if (importPath.slice(-5) != '.json') {
      console.log("Extension is not .json");
      return;
    }
    // Saving
    var openedProject = fs.readFileSync(importPath, (error, data) => {
       if (error) throw error;
       console.log(data, importPath);
       return JSON.parse(data);
    });

    console.log(importPath);
    lastOpenPath = importPath.split(importPath.replace(/^.*[\\\/]/, ''))[0];
  }

  //readMultipleFiles(Array.from(event.target.files), loadProjectCallback);

  console.log(openedProject);

  loadProjectCallback(openedProject);

}

function loadProjectCallback(project) {

  // Double parse 'couse first is not a true parse
  project_data = JSON.parse(project);
  localStorage.setItem("specimens", JSON.stringify(project_data.specimens));
  localStorage.setItem("selectedSpecimen", JSON.stringify(project_data.selectedSpecimen));
  localStorage.setItem("settings", JSON.stringify(project_data.settings));

  ipcRenderer.send('reload-settWin');


  specimens = project_data.specimens;
  settings = project_data.settings;

  updateSpecimenSelect();
  redrawCharts();

}

// PROJECT EXPORTING
function saveProject() {

  $("#menu-file").click();
  // Collect data to save
  const PROJECT_NAME = "project.json";

  var project = JSON.stringify(
    {
      specimens: JSON.parse(localStorage.getItem("specimens")),
      selectedSpecimen: JSON.parse(localStorage.getItem("selectedSpecimen")),
      settings: JSON.parse(localStorage.getItem("settings")),
    }
  )

  // Options of saveFileDialog
  var options = {
    title: "Save project",
    filters: [
      { name: 'application/json', extensions: ['json'] }
    ],
    defaultPath: lastSavePath + '/project.json',
  }

  var savePath = dialog.showSaveDialogSync(options);

  // Check on dialog closed and if not -> save project
  if (savePath) {
    // Check for extension
    if (savePath.slice(-5) != '.json') savePath += '.json';
    // Saving
    fs.writeFileSync(savePath, project, (error) => {
      if (error) throw error;
    });

    lastSavePath = savePath.split(savePath.replace(/^.*[\\\/]/, ''))[0];
  }
  // Save lastSavePath to localStorage
  localStorage.setItem("lastSavePath", lastSavePath);
  // downloadAsJSON(PROJECT_NAME, project)

}

// SOME GLOBALS
var lastOpenPath = localStorage.getItem("lastOpenPath");
var lastSavePath = localStorage.getItem("lastSavePath");

if (lastOpenPath === null) lastOpenPath = app.getPath('documents');
if (lastSavePath === null) lastSavePath = app.getPath('documents');

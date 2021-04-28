// FILE IMPORTING
function importFiles(modal, add) {

  /*
   * Function fileSelectionHandler
   *  Callback fired when input files are selected
   */

  $("#menu-file").click();

  // Options of openFileDialog
  var options = {
    title: "Open files",
    filters: [
      { name: 'PMD', extensions: ['pmd'] },
      { name: 'PMM/DIR', extensions: ['pmm', 'dir'] },
      { name: 'JRA', extensions : ['jra'] },
      { name: 'RS3', extensions : ['rs3'] },
      // { name: 'MagIC', extensions: ['txt']},
      // { name: 'JR5', extensions: ['JR5'] },
      // { name: 'JR6', extensions: ['JR6'] },
      { name: 'rmg non-format file', extensions: ['*'] },
      { name: 'Custom', extensions: ['csv'] },
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

  loadCollectionFileCallback(files, modal, add);

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

function loadCollectionFileCallback(files, modal, add) {

  //const format = document.getElementById("format-selection").value;
  // var numPMM = 0, numDIR = 0, numRS3 = 0, numCSV = 0;
  var format = new Array();
  files.forEach((file, i) => {
    var filenameSplit = file.name.split('.');
    if (filenameSplit.length == 1) format.push(""); // подразумевается, что название не содержит точек
    else format.push(filenameSplit[filenameSplit.length - 1]);
  });
  var formats = format;

  if (add) { // one-time Add-mode initialization
    if (settings.global.appendFiles) add = false; // off one-time Add-mode
    else settings.global.appendFiles = true; // on one-time Add-mode
  }

  // Drop the samples if not appending
  if (modal || (!settings.global.appendFiles)) {
    specimens = new Array();
    collections = new Array();
    sitesSets = new Array();
  }

  var nSamples = specimens.length;

  numSpec = 0, numColls = 0, numSiteSets = 0; // подсчёт новых файлов
  // Try adding the demagnetization data
  format = addDegmagnetizationFiles(format, files);

  var headSpecNum = specimens.length - numSpec;
  var headCollNum = collections.length - numColls;
  var headSitesSetNum = sitesSets.length - numSiteSets;

  for (let i = headSpecNum; i < specimens.length; i++) {
    var specimen = specimens[i];
    specimen.steps.forEach((step, i) => {
      step.index = i;
    });
  }

  var combineData;
  if (numColls > 1) combineData = confirm('Combine data?');
  if (combineData) {
    var headCollNum = collections.length - numColls;
    for (let i = headCollNum + 1; i < collections.length; i++) {
      collections[headCollNum].interpretations = collections[headCollNum].interpretations.concat(collections[i].interpretations);
    }
    collections.splice(headCollNum + 1);
  }

  for (let i = headCollNum; i < collections.length; i++) {
    var collection = collections[i];
  // newCollections.forEach((collection, i) => {
    if (collection.interpretations[0].index != 0) {
      var flipData = flipCollections(collection, true);
      collection.interpretations.forEach((interpretation, i) => {
        // add index
        interpretation.index = i;
        if (interpretation.code.slice(0, 2) == 'GC') interpretation.gc = true;
        else interpretation.gc = false;

        // add reversed data
        // var dSpecR = flipData['specimen'] ? flipData['specimen'][i].x : interpretation.Dspec;
        // var iSpecR = flipData['specimen'] ? flipData['specimen'][i].x : interpretation.Ispec;
        //
        // interpretation.Dspec = {normal: interpretation.Dspec, reversed: dSpecR};
        // interpretation.Ispec = {normal: interpretation.Ispec, reversed: iSpecR};
        interpretation.geographic.dec = {normal: interpretation.geographic.dec, reversed: flipData['geographic'][i].x};
        interpretation.geographic.inc = {normal: interpretation.geographic.inc, reversed: flipData['geographic'][i].y};
        interpretation.tectonic.dec = {normal: interpretation.tectonic.dec, reversed: flipData['tectonic'][i].x};
        interpretation.tectonic.inc = {normal: interpretation.tectonic.inc, reversed: flipData['tectonic'][i].y};
      });
    }
  };

  for (let i = headSitesSetNum; i < sitesSets.length; i++) {
    var sitesSet = sitesSets[i];
  // newSitesSets.forEach((sitesSet, i) => {
    if (sitesSet.sites[0].index != 0) {
      var flipData = flipCollections(sitesSet, true, true);
      sitesSet.sites.forEach((site, i) => {
        // add index
        site.index = i;

        // add reversed data
        site.geographic.dec = {normal: site.geographic.dec, reversed: flipData['geographic'][i].x};
        site.geographic.inc = {normal: site.geographic.inc, reversed: flipData['geographic'][i].y};
        site.tectonic.dec = {normal: site.tectonic.dec, reversed: flipData['tectonic'][i].x};
        site.tectonic.inc = {normal: site.tectonic.inc, reversed: flipData['tectonic'][i].y};

        // add vgp data
        var pole = siteToVGP(site);
        site.vgp = pole;
        // if ((document.getElementById('site-lat')) && (document.getElementById('site-lon'))) {
        //   document.getElementById("site-lat").value = site.vgp.siteLat;
        //   document.getElementById("site-lon").value = site.vgp.siteLon;
        // }
      });
    }
  };

  if (modal) {
    if (specimens.length > 0) {
      localStorage.setItem("specimens", JSON.stringify(specimens));
      localStorage.setItem("selectedSpecimen", JSON.stringify(specimens[0]));
    }
    if (collections.length > 0) {
      localStorage.setItem("collections", JSON.stringify(collections));
      localStorage.setItem("selectedCollection", JSON.stringify(collections[0]));
    }
    if (sitesSets.length > 0) {
      localStorage.setItem("sitesSets", JSON.stringify(sitesSets));
      localStorage.setItem("selectedSitesSet", JSON.stringify(sitesSets[0]));
    }
    ipcRenderer.sendSync('init-pages', formats);
    return openCorresponindgPage(formats);
  }
  else saveLocalStorage();

  ipcRenderer.send('reload-specDataWin');
  ipcRenderer.send('reload-interpretDataWin');
  ipcRenderer.send('reload-meansDataWin');

  updateFileSelect('specimen');
  updateFileSelect('collection');
  updateFileSelect('sitesSet');

  ipcRenderer.send('init-pages');
  openCorresponindgPage(formats);
  redrawCharts();

  if (add) settings.global.appendFiles = false; // off one-time Add-mode

}

function addDegmagnetizationFiles(format, files) {

  /*
   * Function addDegmagnetizationFiles
   * Adds files loaded by the Filehandler API and delegates to the correct handler
   */
  var combineData;

  files.forEach((file, i) => {
    if (format[i] == "PMD" || format[i] == "pmd") {
      format[i] = "PALEOMAC";
    }
    switch(format[i]) {
      case "dir":
      case "DIR":
        importDIR(file);
        numColls += 1;
        return;
      case "pmm":
      case "PMM":
        importPMM(file);
        numColls += 1;
        return;
      case "csv":
        format[i] = importPMCSV(file, format);
        return;
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
        importPaleoMac(file);
        numSpec += 1;
        return;
      case "OXFORD":
        return importOxford(file);
      case "RS3":
      case "rs3":
        return importRS3(file);
      case "BEIJING":
        return importBCN2G(file);
      case "CENIEH":
        return importCenieh(file);
      case "txt": // it's a MagIC
        return importMagic(file);
      case "JR5":
      case "jr5":
      case "jra":
        numSpec += 1;
        return importJR5(file);
      case "JR6":
      case "jr6":
        return importJR6(file);
      case "CJONES":
        return importPaleoMag(file);
      case "":
        importRMG(file);
        numSpec += 1;
        return;
      default:
        throw(new Exception("Unknown importing format requested."));
    }
  });

  return format;

}

// FILE EXPORTING
function saveFile(windowTitle, fileName, data, extension, andOpen) {

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

    if (andOpen) {
      ipcRenderer.send('open-in-next-tab', savePath);
    }

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

  localStorage.setItem("specimens", JSON.stringify(project_data.specimens || []));
  localStorage.setItem("selectedSpecimen", JSON.stringify(project_data.selectedSpecimen));
  localStorage.setItem("collections", JSON.stringify(project_data.collections || []));
  localStorage.setItem("selectedCollection", JSON.stringify(project_data.selectedCollection));
  localStorage.setItem("sitesSets", JSON.stringify(project_data.sitesSets || []));
  localStorage.setItem("selectedSitesSet", JSON.stringify(project_data.selectedSitesSet));

  localStorage.setItem("settings", JSON.stringify(project_data.settings));

  ipcRenderer.send('reload-settWin');


  specimens = project_data.specimens;
  collections = project_data.collections;
  sitesSets = project_data.sitesSets;

  settings = project_data.settings;

  ipcRenderer.send('reload-specDataWin');
  ipcRenderer.send('reload-interpretDataWin');
  ipcRenderer.send('reload-meansDataWin');

  updateFileSelect('specimen');
  updateFileSelect('collection');
  updateFileSelect('sitesSet');

  ipcRenderer.send('init-pages');
  // openCorresponindgPage(formats);

  redrawCharts();

}

function loadPreviousProject() {

  ipcRenderer.send('hide-openFilesModal');

}

// PROJECT EXPORTING
function saveProject() {

  $("#menu-file").click();
  // Collect data to save
  const PROJECT_NAME = "project.json";

  var project = JSON.stringify(
    {
      specimens: JSON.parse(localStorage.getItem("specimens")),
      selectedSpecimen: JSON.parse((localStorage.getItem("selectedSpecimen") != "undefined") ? localStorage.getItem("selectedSpecimen") : "{}"),
      collections: JSON.parse(localStorage.getItem("collections")),
      selectedCollection: JSON.parse((localStorage.getItem("selectedCollection") != "undefined") ? localStorage.getItem("selectedCollection") : "{}"),
      sitesSets: JSON.parse(localStorage.getItem("sitesSets")),
      selectedSitesSet: JSON.parse((localStorage.getItem("selectedSitesSet") != "undefined") ? localStorage.getItem("selectedSitesSet") : "{}"),
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

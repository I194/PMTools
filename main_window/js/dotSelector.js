// Manages the navigation, visibility, and selection of steps
var DotSelector = function() {

  /*
   * Class DotSelector
   * Manages the navigation, visibility, and selection of steps
   */

  // Initialize
  this.reset();

}

// Sets the active step to a particular index
DotSelector.prototype.setActiveStep = function(index) {

  /*
   * Function DotSelector.setActiveStep
   * Sets the active step to a particular index
   */

  this._selectedStep = index;
  this.render(true);

}

// DotSelector.prototype._container = document.getElementById("step-container");
DotSelector.prototype._pcaSelectors = document.getElementById('pca-pca-selectors');
DotSelector.prototype._pca0Selectors = document.getElementById('pca-pca0-selectors');
DotSelector.prototype._PCAgcSelectors = document.getElementById('pca-gc-selectors');
DotSelector.prototype._gcnSelectors = document.getElementById('pca-gcn-selectors');
DotSelector.prototype._PCAeraseSelectors = document.getElementById('pca-erase-text-input');

DotSelector.prototype._statFSelectors = document.getElementById('stat-f-selectors');
DotSelector.prototype._statMSelectors = document.getElementById('stat-m-selectors');
DotSelector.prototype._statGCSelectors = document.getElementById('stat-gc-selectors');
DotSelector.prototype._statGCnSelectors = document.getElementById('stat-gcn-selectors');
DotSelector.prototype._statEraseSelectors = document.getElementById('stat-erase-text-input');
DotSelector.prototype._statReverseSelectors = document.getElementById('stat-reverse-text-input');

DotSelector.prototype._polesFSelectors = document.getElementById('poles-f-selectors');
DotSelector.prototype._polesMSelectors = document.getElementById('poles-m-selectors');
DotSelector.prototype._polesGCSelectors = document.getElementById('poles-gc-selectors');
DotSelector.prototype._polesGCnSelectors = document.getElementById('poles-gcn-selectors');
DotSelector.prototype._polesEraseSelectors = document.getElementById('poles-erase-text-input');
DotSelector.prototype._polesReverseSelectors = document.getElementById('poles-reverse-text-input');

// Resets the step selector for a new specimen
DotSelector.prototype.reset = function() {

  /*
   * Function DotSelector.reset
   * Resets the step selector for a new specimen
   */

  this._selectedStep = 0;
  this.render(false);

}

// Clears the HTML of the container
DotSelector.prototype.clear = function() {

  /*
   * Function DotSelector.clear
   * Clears the HTML of the container
   */

  // this._container.innerHTML = "";
  this._pcaSelectors.innerHTML = "";
  this._pca0Selectors.innerHTML = "";
  this._PCAgcSelectors.innerHTML = "";
  this._gcnSelectors.innerHTML = "";
  this._PCAeraseSelectors.value = "";

  this._statFSelectors.innerHTML = "";
  this._statMSelectors.innerHTML = "";
  this._statGCSelectors.innerHTML = "";
  this._statGCnSelectors.innerHTML = "";
  this._statEraseSelectors.value = "";
  this._statReverseSelectors.value = "";

  this._polesFSelectors.innerHTML = "";
  this._polesMSelectors.innerHTML = "";
  this._polesGCSelectors.innerHTML = "";
  this._polesGCnSelectors.innerHTML = "";
  this._polesEraseSelectors.value = "";
  this._polesReverseSelectors.value = "";
  // this._statFSelectors.innerHTML = "";

}

DotSelector.prototype.clearValue = function() {
  this._pcaSelectors.value = "";
  this._pca0Selectors.value = "";
  this._PCAgcSelectors.value = "";
  this._gcnSelectors.value = "";
  this._PCAeraseSelectors.value = "";

  this._statFSelectors.value = "";
  this._statMSelectors.innerHTML = "";
  this._statGCSelectors.value = "";
  this._statGCnSelectors.value = "";
  this._statEraseSelectors.value = "";
  this._statReverseSelectors.value = "";

  this._polesFSelectors.innerHTML = "";
  this._polesMSelectors.innerHTML = "";
  this._polesGCSelectors.innerHTML = "";
  this._polesGCnSelectors.innerHTML = "";
  this._polesEraseSelectors.value = "";
  this._polesReverseSelectors.value = "";
}

function renderPCA(isText, hover, selectorsPCA) {

  var specimen = getSelectedFile('specimen');

  if (isText) {
    if (!specimen) return redrawCharts(hover);
    var textInputIDList = [
      'pca-pca-text-input',
      'pca-pca0-text-input',
      'pca-gc-text-input',
      'pca-gcn-text-input',
    ];
    var lastStepNum = specimen.steps[specimen.steps.length - 1].index + 1;
    textInputIDList.forEach((Id, i) => {
      var textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.id = Id;
      textInput.classList.add('form-control');
      textInput.style = 'border-radius: 0; margin: 0;';
      textInput.placeholder = '1,2,3 or 1-' + lastStepNum;

      selectorsPCA[i].appendChild(textInput);
    });
  }
  else {
    if (!specimen) return redrawCharts(hover);
    var selectIDListPCA = [
      ['pca-pca-first-step', 'pca-pca-last-step'],
      ['pca-pca0-first-step', 'pca-pca0-last-step'],
      ['pca-gc-first-step', 'pca-gc-last-step'],
      ['pca-gcn-first-step', 'pca-gcn-last-step'],
    ];

    selectIDListPCA.forEach((Id, i) => {
      var firstStepSelect = document.createElement('select');
      firstStepSelect.id = Id[0];
      firstStepSelect.classList.add(['custom-select',]);
      firstStepSelect.style = 'border-radius: 0; margin: 0;'

      var lastStepSelect = document.createElement('select');
      lastStepSelect.id = Id[1];
      lastStepSelect.classList.add('custom-select');
      lastStepSelect.style = 'border-radius: 0; margin: 0;'

      // add options
      specimen.steps.forEach((step, i) => {
        var firstSelectOption = document.createElement("option");
        firstSelectOption.value = i;
        firstSelectOption.innerHTML = ('' + i) + ': ' + step.step;

        var lastSelectOption = document.createElement("option");
        lastSelectOption.value = i;
        lastSelectOption.innerHTML = ('' + i) + ': ' + step.step;

        firstStepSelect.appendChild(firstSelectOption);
        lastStepSelect.appendChild(lastSelectOption);
      });

      // select first and disable last
      firstStepSelect.value = '' + 0;
      firstStepSelect.getElementsByTagName('option')[specimen.steps.length - 1].disabled = true;
      // select last and disable first
      lastStepSelect.value = '' + (specimen.steps.length - 1);
      lastStepSelect.getElementsByTagName('option')[0].disabled = true;

      selectorsPCA[i].appendChild(firstStepSelect);
      selectorsPCA[i].appendChild(lastStepSelect);
    });
  }

}

function renderStat(isText, hover, selectorsStat) {

  var collection = getSelectedFile('collection');

  if (isText) {

    if (!collection) return redrawCharts(hover);
    var textInputIDList = [
      'stat-f-text-input',
      'stat-m-text-input',
      'stat-gc-text-input',
      'stat-gcn-text-input',
    ];

    var lastStepNum = getSelectedFile('collection').interpretations[getSelectedFile('collection').interpretations.length - 1].index + 1;
    textInputIDList.forEach((Id, i) => {
      var textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.id = Id;
      textInput.classList.add('form-control');
      textInput.style = 'border-radius: 0; margin: 0;';
      textInput.placeholder = '1,2,3 or 1-' + lastStepNum;

      selectorsStat[i].appendChild(textInput);
    });
  }
  else {

    if (!collection) return redrawCharts(hover);
    var selectIDListStat = [
      ['stat-f-first-dot', 'stat-f-last-dot'],
      ['stat-m-first-dot', 'stat-m-last-dot'],
      ['stat-gc-first-dot', 'stat-gc-last-dot'],
      ['stat-gcn-first-dot', 'stat-gcn-last-dot'],
    ];

    selectIDListStat.forEach((Id, i) => {
      var firstStepSelect = document.createElement('select');
      firstStepSelect.id = Id[0];
      firstStepSelect.classList.add(['custom-select',]);
      firstStepSelect.style = 'border-radius: 0; margin: 0;'

      var lastStepSelect = document.createElement('select');
      lastStepSelect.id = Id[1];
      lastStepSelect.classList.add('custom-select');
      lastStepSelect.style = 'border-radius: 0; margin: 0;'

      // add options
      collection.interpretations.forEach((interpretation, i) => {
        var firstSelectOption = document.createElement("option");
        firstSelectOption.value = i;
        firstSelectOption.innerHTML = ('' + i) + ': ' + interpretation.id;

        var lastSelectOption = document.createElement("option");
        lastSelectOption.value = i;
        lastSelectOption.innerHTML = ('' + i) + ': ' + interpretation.id;

        firstStepSelect.appendChild(firstSelectOption);
        lastStepSelect.appendChild(lastSelectOption);
      });

      // select first and disable last
      firstStepSelect.value = '' + 0;
      firstStepSelect.getElementsByTagName('option')[collection.interpretations.length - 1].disabled = true;
      // select last and disable first
      lastStepSelect.value = '' + (collection.interpretations.length - 1);
      lastStepSelect.getElementsByTagName('option')[0].disabled = true;

      selectorsStat[i].appendChild(firstStepSelect);
      selectorsStat[i].appendChild(lastStepSelect);
    });
  }

}

function renderPoles(isText, hover, selectorsPoles) {

  var sitesSet = getSelectedFile('sitesSet');

  if (isText) {

    if (!sitesSet) return redrawCharts(hover);
    var textInputIDList = [
      'poles-f-text-input',
      'poles-m-text-input',
      'poles-gc-text-input',
      'poles-gcn-text-input',
    ];

    var lastStepNum = getSelectedFile('sitesSet').sites[getSelectedFile('sitesSet').sites.length - 1].index + 1;
    textInputIDList.forEach((Id, i) => {
      var textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.id = Id;
      textInput.classList.add('form-control');
      textInput.style = 'border-radius: 0; margin: 0;';
      textInput.placeholder = '1,2,3 or 1-' + lastStepNum;

      selectorsPoles[i].appendChild(textInput);
    });
  }
  else {

    if (!sitesSet) return redrawCharts(hover);
    var selectIDListStat = [
      ['poles-f-first-dot', 'poles-f-last-dot'],
      ['poles-m-first-dot', 'poles-m-last-dot'],
      ['poles-gc-first-dot', 'poles-gc-last-dot'],
      ['poles-gcn-first-dot', 'poles-gcn-last-dot'],
    ];

    selectIDListStat.forEach((Id, i) => {
      var firstStepSelect = document.createElement('select');
      firstStepSelect.id = Id[0];
      firstStepSelect.classList.add(['custom-select',]);
      firstStepSelect.style = 'border-radius: 0; margin: 0;'

      var lastStepSelect = document.createElement('select');
      lastStepSelect.id = Id[1];
      lastStepSelect.classList.add('custom-select');
      lastStepSelect.style = 'border-radius: 0; margin: 0;'

      // add options
      sitesSet.sites.forEach((site, i) => {
        var firstSelectOption = document.createElement("option");
        firstSelectOption.value = i;
        firstSelectOption.innerHTML = ('' + i) + ': ' + site.id;

        var lastSelectOption = document.createElement("option");
        lastSelectOption.value = i;
        lastSelectOption.innerHTML = ('' + i) + ': ' + site.id;

        firstStepSelect.appendChild(firstSelectOption);
        lastStepSelect.appendChild(lastSelectOption);
      });

      // select first and disable last
      firstStepSelect.value = '' + 0;
      firstStepSelect.getElementsByTagName('option')[sitesSet.sites.length - 1].disabled = true;
      // select last and disable first
      lastStepSelect.value = '' + (sitesSet.sites.length - 1);
      lastStepSelect.getElementsByTagName('option')[0].disabled = true;

      selectorsPoles[i].appendChild(firstStepSelect);
      selectorsPoles[i].appendChild(lastStepSelect);
    });
  }

}

// Renders the stepSelector component with the current steps and properties
DotSelector.prototype.render = function(redraw, hover) {

  /*
  * Function DotSelector.render
  * Renders the stepSelector component with the current steps and properties
  */


  // var specimen = getSelectedFile('specimen');

  const HIDDEN_STEP_SYMBOL = "…";

  this.clear();

  var selectorsPCA = [this._pcaSelectors, this._pca0Selectors, this._PCAgcSelectors, this._gcnSelectors];
  var selectorsStat = [this._statFSelectors, this._statMSelectors, this._statGCSelectors, this._statGCnSelectors];
  var selectorsPoles = [this._polesFSelectors, this._polesMSelectors, this._polesGCSelectors, this._polesGCnSelectors];

  var pcaToolsText = settings.pca.pcaToolsText;
  var pcaToolsSelect = settings.pca.pcaToolsSelect;

  var statToolsText = settings.stat.statToolsText;
  var statToolsSelect = settings.stat.statToolsSelect;

  var polesToolsText = settings.poles.polesToolsText;
  var polesToolsSelect = settings.poles.polesToolsSelect;

  renderPCA(pcaToolsText, hover, selectorsPCA);
  renderStat(statToolsText, hover, selectorsStat);
  renderPoles(polesToolsText, hover, selectorsPoles);

  // Add each steps
  var listSteps = document.createElement("tbody");

  // Update the charts
  if (redraw) redrawCharts(hover);

}

// dot selector for methods
DotSelector.prototype.selectSteps = function(firstStepID, lastStepID, type) {

  var file = getSelectedFile(type);

  var allElems = {
    specimen: 'steps',
    collection: 'interpretations',
    sitesSet: 'sites',
  }
  var elems = allElems[type];

  var firstStep = parseInt(document.getElementById(firstStepID).value);
  var lastStep = parseInt(document.getElementById(lastStepID).value);

  file[elems].forEach(function(elem, i) {
    if ((i >= firstStep) && (i <= lastStep)) {
      elem.selected = elem.visible; // not visible - not use to PCA
    }
    else {
      elem.selected = false;
    }
  });
  saveLocalStorage();
  this.render(redraw = false);

  saveLocalStorage();
}

function selectByCondition(condition, file) {



}

DotSelector.prototype.readDots = function(inputID, type) {
  var time = performance.now();

  var file = getSelectedFile(type);

  var pageType = {
    specimen: 'pca',
    collection: 'stat',
    sitesSet: 'poles',
  }

  var allElems = {
    specimen: 'steps',
    collection: 'interpretations',
    sitesSet: 'sites',
  }

  var elems = allElems[type];

  var isErase = (inputID.split('-')[1] === 'erase');
  var textDots = document.getElementById(inputID).value;
  var lastStepNum = file[elems][file[elems].length - 1].index + 1;
  if (textDots.includes('==') || textDots.includes('<') || textDots.includes('>') || textDots.includes('!=') || textDots.includes('>=') || textDots.includes('<=')) {
    file[elems].forEach(function(elem, i) {
      var comment = elem.comment;
      var id = elem.id;
      var n = elem.n;
      var index = elem.index + 1;
      var dec, inc, MAG, mag, a95, MAD, mad, step, code;

      if (type == 'specimen') {
        var direction = inReferenceCoordinates(COORDINATES['pca'], file, new Coordinates(elem.x, elem.y, elem.z)).toVector(Direction);
        var volume = (file.volume) ? file.volume : 1;
        dec = direction.dec;
        inc = direction.inc;
        MAG = (new Coordinates(elem.x, elem.y, elem.z).length) / volume;
        mag = MAG;
        a95 = elem.error;
        step = elem.step;
      }
      else {
        var position = 'normal';
        if (elem.reversed) position = 'reversed';
        dec = elem[COORDINATES[pageType[type]]].dec[position];
        inc = elem[COORDINATES[pageType[type]]].inc[position];
        mad = elem[COORDINATES[pageType[type]]].mad;
        a95 = elem[COORDINATES[pageType[type]]].a95;
        code = elem.code;
      }

      if (eval(textDots)) {
        elem.selected = elem.visible;
      }
      else elem.selected = false;
    });
  }
  else if ((textDots.includes(',') && textDots.includes('-')) || (!textDots.includes(',') && !textDots.includes('-') && textDots)) {
    if (isErase) {
      selectedDot = parseInt(textDots);

      file[elems].forEach((elem, i) => {
        if (elem.visible && ((selectedDot - 1) == elem.index)) elem.selected = true;
        else elem.selected = false;
      });

    }
    else {
      document.getElementById(inputID).value = '';
      document.getElementById(inputID).placeholder = 'Invalid format, try again: 1,2,3, or 1-' + lastStepNum + ', or inc > 0';
      document.getElementById(inputID).classList.add('error-input');
      return console.log("invalid format");
    }
  }
  else if (textDots.includes(',')) {

    var dots = textDots.split(',');

    file[elems].forEach((elem, i) => {

      for (let j = 0; j < dots.length; j++) {
        if (elem.visible && ((parseInt(dots[j]) - 1) == elem.index)) {
          elem.selected = elem.visible; // not visible - not use to PCA
          break;
        }
        elem.selected = false;
      }

    });

  }
  else if (textDots.includes('-')) {
    var dots = textDots.split('-');

    var firstDot = parseInt(dots[0]) - 1;
    var lastDot = parseInt(dots[1]) - 1;

    file[elems].forEach(function(elem, i) {
      if (elem.visible && ((elem.index >= firstDot) && (elem.index <= lastDot))) {
        elem.selected = elem.visible; // not visible - not use to PCA
      }
      else elem.selected = false;
    });
  }
  else if (!textDots) {
    file[elems].forEach((elem, i) => {
      elem.selected = elem.visible;
    });
  }

  time2 = performance.now() - time;
  console.log('Время выполнения (elems selection)= ', time2);

  var invalidDataErr = false;

  var numSelectedDots = 0;
  file[elems].forEach((elem, i) => {
    if (elem.selected) numSelectedDots++;
  });
  if (!isErase && (numSelectedDots < 2)) invalidDataErr = true;
  if (isErase && (numSelectedDots < 1)) invalidDataErr = true;

  if (invalidDataErr) {
    document.getElementById(inputID).value = '';
    if (isErase) document.getElementById(inputID).placeholder = 'Invalid ' + elems + ' or format, try again: 1 or 1,2,3 or 1-' + lastStepNum;
    else document.getElementById(inputID).placeholder = 'Invalid ' + elems + ' or format, try again: 1,2,3 or 1-' + lastStepNum;
    document.getElementById(inputID).classList.add('error-input');
    return console.log('invalid ' + elems);
  }

  saveLocalStorage();
  time1 = performance.now() - time;
  console.log('Время выполнения (before render)= ', time1);

  // this.render(redraw = false);
  time3 = performance.now() - time;
  console.log('Время выполнения (elems render)= ', time3);

  saveLocalStorage();

  time = performance.now() - time;
  console.log('Время выполнения = ', time);
}

// Hover
DotSelector.prototype.hoverDot = function(dotIndex, type) {

  var file = getSelectedFile(type);

  var allElems = {
    specimen: 'steps',
    collection: 'interpretations',
    sitesSet: 'sites',
  }

  var elems = allElems[type];

  file[elems].forEach((elem, i) => {
    if ((elem.index == dotIndex) && (!elem.hover)) elem.hover = true;
    else elem.hover = false;
  });

  var hover = true;

  if (type == 'specimen') {
    formatSpecimenTable();
    plotZijderveldDiagram(hover);
    plotStereoDiagram(hover);
    plotIntensityDiagram(hover);
  }

  if (type == 'collection') {
    formatCollectionTable();
    statPlotStereoDiagram(hover);
  }

  if (type == 'sitesSet') {
    formatSitesTable();
    polesPlotStereoDiagrams(hover);
  }


}

// Container (class) for a single demagnetization step
var Measurement = function(step, coordinates, error, comment) {

  /*
   * Class Measurement
   * Container for a single demagnetization step
   */

  this.step = step.trim();

  this.x = Number(coordinates.x);
  this.y = Number(coordinates.y);
  this.z = Number(coordinates.z);

  if(isNaN(this.x) || isNaN(this.y) || isNaN(this.z)) {
    throw new Exception("Components are not a number for demagnetization step: " + step + ".");
  }

  this.error = Number(error);
  this.comment = comment;

  this.visible = true;
  this.selected = false;

}

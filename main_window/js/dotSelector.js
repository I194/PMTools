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

DotSelector.prototype._fSelectors = document.getElementById('stat-f-selectors');
DotSelector.prototype._statGCSelectors = document.getElementById('stat-gc-selectors');
DotSelector.prototype._statGCnSelectors = document.getElementById('stat-gcn-selectors');
DotSelector.prototype._statEraseSelectors = document.getElementById('stat-erase-text-input');

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

  this._statGCSelectors.innerHTML = "";
  this._statGCnSelectors.innerHTML = "";
  this._fSelectors.innerHTML = "";
  this._statEraseSelectors.value = "";
  // this._fSelectors.innerHTML = "";

}

DotSelector.prototype.clearValue = function() {
  console.log('hello s');
  this._pcaSelectors.value = "";
  this._pca0Selectors.value = "";
  this._PCAgcSelectors.value = "";
  this._gcnSelectors.value = "";
  this._PCAeraseSelectors.value = "";

  this._statGCSelectors.value = "";
  this._statGCnSelectors.value = "";
  this._fSelectors.value = "";
  this._statEraseSelectors.value = "";
}

// Renders the stepSelector component with the current steps and properties
DotSelector.prototype.render = function(redraw, hover) {

  /*
   * Function DotSelector.render
   * Renders the stepSelector component with the current steps and properties
   */

  const HIDDEN_STEP_SYMBOL = "…";

  this.clear();
  var specimen = getSelectedFile('specimen');
  var collection = getSelectedFile('collection')

  var selectorsPCA = [this._pcaSelectors, this._pca0Selectors, this._PCAgcSelectors, this._gcnSelectors];
  var selectorsStat = [this._fSelectors, this._statGCSelectors, this._statGCnSelectors];

  var pcaToolsText = settings.pca.toolsText;
  var pcaToolsSelect = settings.pca.toolsSelect;

  var statToolsText = settings.stat.toolsText;
  var statToolsSelect = settings.stat.toolsSelect;

  if (pcaToolsText) {
    if (!specimen) return redrawCharts(hover);
    var textInputIDList = [
      'pca-pca-text-input',
      'pca-pca0-text-input',
      'pca-gc-text-input',
      'pca-gcn-text-input',
    ];
    var lastStepNum = getSelectedFile('specimen').steps[getSelectedFile('specimen').steps.length - 1].index + 1;
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
    if (specimen === null) return redrawCharts(hover);
    var selectIDList = [
      ['pca-pca-first-step', 'pca-pca-last-step'],
      ['pca-pca0-first-step', 'pca-pca0-last-step'],
      ['pca-gc-first-step', 'pca-gc-last-step'],
      ['pca-gcn-first-step', 'pca-gcn-last-step'],
    ];

    selectIDList.forEach((Id, i) => {
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

  if (statToolsText) {

    if (!collection) return redrawCharts(hover);
    var textInputIDList = [
      'stat-f-text-input',
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
    if (collection === null) return redrawCharts(hover);
    var selectIDList = [
      ['stat-f-first-dot', 'stat-f-last-dot'],
      ['stat-gc-first-dot', 'stat-gc-last-dot'],
      ['stat-gcn-first-dot', 'stat-gcn-last-dot'],
    ];

    selectIDList.forEach((Id, i) => {
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

  // Add each steps
  var listSteps = document.createElement("tbody");

  specimen.steps.forEach( function(step, i) {
    // if (i % 5 == 0) listSteps.appendCh(document.createElement("tr"))
    var listStep = document.createElement("tr");

    listStep.value = i;

    // Attach some extra classes
    if (step.selected) listStep.className += "selected";

    // Highlight the current step
    if (this._selectedStep === i) listStep.className += " current";

    // Format step name
    var stepname = step.step;
    var demagType = specimen.demagnetizationType;
    if (demagType == "thermal") stepname = stepname.substr(1) + "℃";
    else if (demagType == "alternating") stepname = stepname.substr(1) + "nT"

    // Steps may be hidden
    if(step.visible) listStep.appendChild(document.createTextNode(stepname));
    else {
      listStep.appendChild(document.createTextNode(HIDDEN_STEP_SYMBOL));
      listStep.className += " text-muted";
    }

    listSteps.appendChild(listStep);

  }, this);

  // Update the charts
  if (redraw) redrawCharts(hover);

}

// !!its not using now!! Hides the currently active step if not selected
DotSelector.prototype.hideStep = function() {

  /*
   * Function DotSelector.hideStep
   * Hides the currently active step if not selected
   */

  var step = this.getCurrentStep();

  // Must not be selected
  if(!step.selected) {
    step.visible = !step.visible;
  }

  // Practical to move to the next step
  // this.handleStepScroll(1);

  this.render(redraw = true, hover = false);

  saveLocalStorage();

}

// !!its not using now!! Returns the currently selected step from the step selector
DotSelector.prototype.getCurrentStep = function() {

  /*
   * Function DotSelector.getCurrentStep
   * Returns the currently selected step from the step selector
   */

  return getSelectedFile('specimen').steps[this._selectedStep];

}

// !!its not using now!! Selects the currently active step if not hidden
DotSelector.prototype.selectStep = function() {

  /*
   * Function DotSelector.selectStep
   * Selects the currently active step if not hidden
   */

  var step = this.getCurrentStep();

  // Toggle select if the step is visible
  if(step.visible) {
    step.selected = !step.selected;
  }

  // Practical to move to the next step
  // this.handleStepScroll(1);

  this.render(redraw = false);


  saveLocalStorage();

}

// Actual step selector
DotSelector.prototype.selectSteps = function(firstStepID, lastStepID) {

  var specimen = getSelectedFile('specimen');

  var firstStep = parseInt(document.getElementById(firstStepID).value);
  var lastStep = parseInt(document.getElementById(lastStepID).value);

  specimen.steps.forEach(function(step, i) {
    console.log(step);
    if ((i >= firstStep) && (i <= lastStep)) {
      step.selected = step.visible; // not visible - not use to PCA
    }
    else {
      step.selected = false;
    }
  });
  console.log(specimen);
  saveLocalStorage();
  console.log(specimens);
  this.render(redraw = false);

  saveLocalStorage();
}

DotSelector.prototype.readDots = function(inputID, type) {

  var file = getSelectedFile(type);

  var allElems = {
    specimen: 'steps',
    collection: 'interpretations',
  }

  var elems = allElems[type];

  var isErase = (inputID.split('-')[1] === 'erase');
  console.log(isErase, inputID);
  var textDots = document.getElementById(inputID).value;
  var lastStepNum = file[elems][file[elems].length - 1].index + 1;

  if ((textDots.includes(',') && textDots.includes('-')) || (!textDots.includes(',') && !textDots.includes('-'))) {
    if (isErase) {
      selectedDot = parseInt(textDots);

      file[elems].forEach((elem, i) => {
        if (elem.visible && ((selectedDot - 1) == elem.index)) elem.selected = true;
        else elem.selected = false;
      });

    }
    else {
      document.getElementById(inputID).value = '';
      document.getElementById(inputID).placeholder = 'Invalid format, try again: 1,2,3, or 1-' + lastStepNum;
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
  else {
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

  this.render(redraw = false);

  saveLocalStorage();

}

// Handles increment/decrement of the selected step
// upd. container removed
// DotSelector.prototype.handleStepScroll = function(direction) {
//
//   /*
//    * Function DotSelector.handleStepScroll
//    * Handles increment/decrement of the selected step
//    */
//
//   var steps = this._container.getElementsByTagName("tr");
//
//   // There are no steps
//   if(steps.length === 0) {
//     return;
//   }
//
//   // Handle the scrolling logic
//   this._selectedStep = this._selectedStep + direction;
//
//   // Negative roll-over
//   if(this._selectedStep === -1) {
//     this._selectedStep = steps.length - 1;
//   }
//
//   // Positive roll-over
//   this._selectedStep = this._selectedStep % steps.length;
//
//   //this.render(redraw = true, hover = true);
//
//   if(this._selectedStep > 15) {
//     this._container.parentElement.scrollTop = (this._selectedStep - 15) * 24;
//   } else {
//     this._container.parentElement.scrollTop = 0;
//   }
//
// }


// Container (class) for a single demagnetization step
var Measurement = function(step, coordinates, error) {

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

  this.visible = true;
  this.selected = false;

}

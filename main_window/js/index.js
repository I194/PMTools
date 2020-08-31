function addNotCollapsedStyle(clickedBtnId) {

  var clickedBtn = document.getElementById(clickedBtnId)
  btnsIds = [
    'pca-pca-btn',
    'pca-pca0-btn',
    'pca-gc-btn',
    'pca-gcn-btn'
  ]

  var remove = false
  for (let i = 0; i < clickedBtn.classList.length; i++) {
    if (clickedBtn.classList[i] == "collapse-selected") {
      remove = true;
      break;
    }
  }

  if (remove) {
    clickedBtn.classList.remove("collapse-selected");
  }
  else clickedBtn.classList.add("collapse-selected");

  btnsIds.forEach((btnId, i) => {
    if (btnId != clickedBtnId) {
      document.getElementById(btnId).classList.remove("collapse-selected");
    }
  });

}

function registerEventHandlers() {

  // Simple listeners
  document.addEventListener("keydown", keyboardHandler);
  document.getElementById("container-center").addEventListener('click', mainContClickHandler);
  document.getElementById("stat-container-center").addEventListener('click', mainContClickHandler);
  document.getElementById("interpretation-table-container").addEventListener("input", interpretationTableClickHandler);
  document.getElementById("specimen-select").addEventListener("change", (e) => resetFileHandler('specimen'))
  document.getElementById("collection-select").addEventListener("change", (e) => resetFileHandler('collection'));
  document.getElementById("site-lat").addEventListener("input", (e) => formatVGPTable());
  document.getElementById("site-lon").addEventListener("input", (e) => formatVGPTable());

  document.getElementById("nav-pca-tab").addEventListener("click", (e) => localStorage.setItem("currPage", 'nav-pca-tab'));
  document.getElementById("nav-stat-tab").addEventListener("click", (e) => localStorage.setItem("currPage", 'nav-stat-tab'));

  // document.getElementById("stat-reversed").addEventListener('click', )
  window.addEventListener("resize", resizeTables);

  var chartContainersPCA = [
    document.getElementById('container-center'),
    document.getElementById('container-left'),
    document.getElementById('container-right'),
    document.getElementById('stat-container-center'),
  ]

  chartContainersPCA.forEach((container, i) => {
    container.addEventListener("contextmenu", (event) => {

      event.preventDefault();

      var contextMenu = makeChartContextMenu(container.children[3].classList[1]);//document.getElementById("chart-context-menu");

      var menuWidth = contextMenu.offsetWidth;
      var menuHeight = contextMenu.offsetHeight;
      var windowWidth = window.innerWidth;
      var windowHeight = window.innerHeight;

      if ((windowWidth - event.pageX) < menuWidth) contextMenu.style.left = windowWidth - menuWidth + "px";
      else contextMenu.style.left = event.pageX + "px";

      if ((windowHeight - event.pageY) < menuHeight) contextMenu.style.top = windowHeight - menuHeight + "px";
      else contextMenu.style.top = event.pageY + "px";

      contextMenu.classList.add("active");
      container.classList.add('add-context');

      chartContainersPCA.forEach((cont, i) => {
        if (cont.id != container.id) cont.classList.remove('add-context');
      });

      // console.log(contextMenu.style.top, contextMenu.style.left, contextMenu.classList, contextMenu);
    });
  });

  window.addEventListener("click", () => {
    document.getElementById("chart-context-menu").classList.remove("active");
  });
  //document.getElementById("table-container").addEventListener("click", handleTableClick);
  //document.getElementById("fitting-container-table-tbody").addEventListener("click", handleTableClickComponents);
  //document.getElementById("save-location").addEventListener("click", handleLocationSave);
  //document.getElementById("specimen-age-select").addEventListener("change", handleAgeSelection);
  // Redraw when requested
  // document.getElementById("normalize-intensities").addEventListener("change", plotIntensityDiagram.bind(null, false));

  // Radio class listeners
  // Upd. hide step table (and radio listeners of this table)
  // Array.from(document.getElementsByClassName("demagnetization-type-radio")).forEach(function(x) {
  //   x.addEventListener("click", function(event) {
  //
  //     let value = $(event.target).attr("value");
  //
  //     if(value === "null") {
  //       value = null;
  //     }
  //
  //     getSelectedFile('specimen').demagnetizationType = value;
  //
  //   });
  // });

  // Initialize controlled vocab
  // addLithologyOptions();
  // addGeologicalClassOptions();

}

function keyboardImitation(keyCode) {
  var event = document.createEvent("Event");
  switch (keyCode) {
    case 49: {
      event.initEvent("keydown", true, true);
      event.view = document.defaultView;
      event.altKey = false;
      event.ctrlKey = false;
      event.shiftKey = false;
      event.metaKey = false;
      event.key = "1";
      event.code = "Digit1";
      event.keyCode = 49;
    }
    case 49_0: {
      event.initEvent("keydown", true, true);
      event.view = document.defaultView;
      event.altKey = false;
      event.ctrlKey = true;
      event.shiftKey = false;
      event.metaKey = false;
      event.key = "1";
      event.code = "Digit1";
      event.keyCode = 49;
    }
    case 52: {
      event.initEvent("keydown", true, true);
      event.view = document.defaultView;
      event.altKey = false;
      event.ctrlKey = false;
      event.shiftKey = false;
      event.metaKey = false;
      event.key = "4";
      event.code = "Digit4";
      event.keyCode = 52;
    }
  }
  // if (keyCode == 49) {
  //   event.initEvent("keydown", true, true);
  //   event.view = document.defaultView;
  //   event.altKey = false;
  //   event.ctrlKey = false;
  //   event.shiftKey = false;
  //   event.metaKey = false;
  //   event.key = "1";
  //   event.code = "Digit1";
  //   event.keyCode = 49;
  //   keyboardHandler(event);
  // }
  // if (keyCode == 49_0) {
  //   event.initEvent("keydown", true, true);
  //   event.view = document.defaultView;
  //   event.altKey = false;
  //   event.ctrlKey = true;
  //   event.shiftKey = false;
  //   event.metaKey = false;
  //   event.key = "1";
  //   event.code = "Digit1";
  //   event.keyCode = 49;
  //   keyboardHandler(event);
  // }
  keyboardHandler(event);
}

function keyboardHandler(event) {

  /*
   * Function keyboardHandler
   * Handles keypresses on keyboard
   */

  const CODES = new Object({
    "ARROW_RIGHT": 39,
    "ARROW_LEFT": 37,
    "ARROW_UP": 38,
    "ARROW_DOWN": 40,
    "NUM_ARROW_UP": 104,
    "NUM_ARROW_RIGHT": 102,
    "NUM_ARROW_DOWN": 98,
    "NUM_ARROW_LEFT": 100,
    // "W_KEY": 87,
    "D_KEY": 68,
    "N_KEY": 78,
    "O_KEY": 79,
    "G_KEY": 71,
    "I_KEY": 73,
    "S_KEY": 83,
    // "A_KEY": 65,
    "C_KEY": 67,
    "X_KEY": 88,
    "Y_KEY": 89,
    "Z_KEY": 90,
    "Q_KEY": 81,
    "E_KEY": 69,
    "R_KEY": 82,
    "F_KEY": 70,
    "F5_KEY": 116,
    "MINUS_KEY": 189,
    "MINUS_KEY_NUM": 109,
    "PLUS_KEY": 187,
    "PLUS_KEY_NUM": 107,
    // "KEYPAD_ONE": 49,
    // "KEYPAD_TWO": 50,
    // "KEYPAD_THREE": 51,
    // "KEYPAD_FOUR": 52,
    // "KEYPAD_EIGHT": 56,
    // "KEYPAD_NINE": 57,
    "ESCAPE_KEY": 27,
    "TAB_KEY": 9,
  });

  if (document.activeElement.id.slice(-10) === 'text-input') {
    var textInputCodes = new Object({
      "ENTER_KEY": 13,
      "ENTER_NUMPAD_KEY": 98,
      "ESCAPE_KEY": 27,
    });

    if(!Object.values(textInputCodes).includes(event.keyCode)) {
      return;
    }
    var elemIdParts = document.activeElement.id.split('-');
    var methodAbbr = elemIdParts[0] + '-' + elemIdParts[1];

    event.preventDefault();

    switch(event.keyCode) {
      case textInputCodes.ESCAPE_KEY:
        return document.getElementById(methodAbbr + '-cancel').click();
      case textInputCodes.ENTER_NUMPAD_KEY:
      case textInputCodes.ENTER_KEY:
        return document.getElementById(methodAbbr + '-confirm').click();
    }
  }

  // Block all key events when no specimens are loaded
  // if(specimens.length === 0 && event.keyCode != CODES.O_KEY) {
  //   return;
  // }

  // Override the default handlers
  // console.log(Object, Object.values, Object.values(CODES));

  if(!Object.values(CODES).includes(event.keyCode)) {
    return;
  }

  event.preventDefault();
  var specimen = getSelectedFile('specimen');

  var pageID = getSelectedPage();

  var pageType = pageID.split('-')[1];
  var scrollerID = elemTypes[pageType][0] + '-select';

  var elems = elemTypes[pageType][1];

  var currPanPos = zoomContTypes[pageType].getPan();

  var file = getSelectedFile(elemTypes[pageType][0]);
  // else if (pageType == 'poles') scrollerID = 'smth-select';

  // Delegate to the appropriate handler
  switch(event.keyCode) {
    case CODES.TAB_KEY:
      if (event.shiftKey) {
        if (event.ctrlKey) return handlePageScroll(-1);
        else return handleFileScroll(-1, scrollerID);
      }
      else if (event.ctrlKey) return handlePageScroll(1);
      else return handleFileScroll(1, scrollerID);
    case CODES.PLUS_KEY:
      mainContPanZoomStat.zoomIn();
      zoomContTypes[pageType].zoomIn( { animate: false } );
      redrawCharts();
      elemTypes[pageType][2].click();
      return;
    case CODES.MINUS_KEY:
      zoomContTypes[pageType].zoomOut( { animate: false } );
      redrawCharts();
      elemTypes[pageType][2].click();
      return;
    case CODES.ESCAPE_KEY:
      zoomContTypes[pageType].reset();
      redrawCharts();
      elemTypes[pageType][2].click();
      return;
    // -x - right side, -y - down side
    case CODES.ARROW_RIGHT:
    case CODES.NUM_ARROW_RIGHT:
      return zoomContTypes[pageType].pan(currPanPos.x - 10, currPanPos.y)
    case CODES.ARROW_LEFT:
    case CODES.NUM_ARROW_LEFT:
      return zoomContTypes[pageType].pan(currPanPos.x + 10, currPanPos.y)
    case CODES.ARROW_UP:
    case CODES.NUM_ARROW_UP:
      return zoomContTypes[pageType].pan(currPanPos.x, currPanPos.y + 10)
    case CODES.ARROW_DOWN:
    case CODES.NUM_ARROW_DOWN:
      return zoomContTypes[pageType].pan(currPanPos.x, currPanPos.y - 10)
    // case CODES.ARROW_DOWN:
    // case CODES.S_KEY:
    //   return dotSelector.handleStepScroll(1);
    // case CODES .ARROW_UP:
    // case CODES.W_KEY:
    //   return dotSelector.handleStepScroll(-1);
    // case CODES .MINUS_KEY:
    // case CODES.MINUS_KEY_NUM:
    // case CODES.Z_KEY:
    //   return dotSelector.hideStep();
    // case CODES.PLUS_KEY:
    // case CODES.PLUS_KEY_NUM:
    // case CODES.X_KEY:
    //   return dotSelector.selectStep();
    // case CODES.G_KEY:
    //   return setActiveGroup();
    // case CODES.I_KEY:
    //   return $("#map-modal").modal("show");
    // case CODES.Q_KEY:
    //   return deleteCurrentSpecimen();

    case CODES.S_KEY:
      if (event.ctrlKey) return saveProject();
      else return;
    case CODES.R_KEY:
      if (event.ctrlKey) return reloadFiles(undefined, elemTypes[pageType][0]);
      else return reloadFiles(getSelectedFile(elemTypes[pageType][0]), elemTypes[pageType][0]);
    // case CODES.F5_KEY:
    //   ipcRenderer.send('reload-mainWin');
    //   ipcRenderer.send('reload-settWin');
    //   ipcRenderer.send('reload-specDataWin');
    //   ipcRenderer.send('reload-interpretDataWin');
    //   ipcRenderer.send('reload-meansDataWin');
    //   return;
    case CODES.O_KEY:
      if (event.ctrlKey) {
        if (event.shiftKey) return importProject();
        else return importFiles();
      }
      else {
        if ($('#pca0-btn').is(":focus")) $('#pca0-btn').blur();
        else $('#pca0-btn').focus();
        document.getElementById('pca-pca0-btn').click();
        document.getElementById('pca-pca0-text-input').focus();
        return;
      }
    case CODES.D_KEY:
      if ($('#pca-btn').is(":focus")) $('#pca-btn').blur();
      else $('#pca-btn').focus();
      document.getElementById('pca-pca-btn').click();//makeInterpretation(specimen, "TAU1", false);//{"type": "TAU1", "anchored": false});
      document.getElementById('pca-pca-text-input').focus();
      return;
    case CODES.G_KEY:
      if ($('#gc-btn').is(":focus")) $('#gc-btn').blur();
      else $('#gc-btn').focus();
      document.getElementById(pageType + '-gc-btn').click();//makeInterpretation(specimen, "TAU1", false);//{"type": "TAU1", "anchored": false});
      document.getElementById(pageType + '-gc-text-input').focus();
      return;
    case CODES.I_KEY:
      if ($('#pca-gcn-btn').is(":focus")) $('#pca-gcn-btn').blur();
      else $('#pca-gcn-btn').focus();
      document.getElementById(pageType + '-gcn-btn').click();
      document.getElementById(pageType + '-gcn-text-input').focus();
      return;
    case CODES.F_KEY:
      if ($('#stat-f-btn').is(":focus")) $('#stat-f-btn').blur();
      else $('#stat-f-btn').focus();
      document.getElementById('stat-f-btn').click();
      document.getElementById('stat-f-text-input').focus();
      return;
    case CODES.E_KEY:
      if ($('#erase-btn').is(":focus")) $('#erase-btn').blur();
      else $('#erase-btn').focus();
      document.getElementById(pageType + '-erase-text-input').placeholder = "1,2,3 or 1-" + (file[elems][file[elems].length - 1].index + 1);
      document.getElementById(pageType + '-erase-btn').click();
      document.getElementById(pageType + '-erase-text-input').focus();
      return;
    case CODES.Z_KEY:
      if (pageType == 'pca') {
        zoomContTypes[pageType].reset();
        if (event.shiftKey) swapChartsContainers(false, 0, 0, 0, -1);
        else swapChartsContainers(false, 0, 0, 0, 1);
        elemTypes[pageType][2].click();
      }
      return;
    case CODES.Y_KEY:
      return switchProjection(false, 0);
    case CODES.X_KEY:
      return switchCoordinateReference(false, 0, pageType);
    // case CODES.N_KEY:
    //   return switchDirectionsMode(false, 0, pageType);
    case CODES.C_KEY:
      return switchToCenter(false, 0, pageType);
  }

}

function mainContClickHandler(event) {

  var pageID = getSelectedPage();
  var pageType = pageID.split('-')[1];

  var currScale = zoomContTypes[pageType].getScale();

  if ((currScale != 1) && settings.global.blockMouseOnZoom) return elemTypes[pageType][2].classList.add('disable-mouse');
  else return elemTypes[pageType][2].classList.remove('disable-mouse');

}

function swapChartsContainers(from_btn, checkZijd, checkStereo, checkIntensity, rotDir) {

  if (from_btn) {
    if (checkZijd) {
      ChartContainersPCA = ['container-left', 'container-center', 'container-right'];
      stereoOnMain.checked = false;
      intensityOnMain.checked = false;
      zijdOnMain.checked = true;
    }
    else if (checkStereo) {
      ChartContainersPCA = ['container-center', 'container-right', 'container-left'];
      stereoOnMain.checked = true;
      intensityOnMain.checked = false;
      zijdOnMain.checked = false;
    }
    else if (checkIntensity) {
      ChartContainersPCA = ['container-right', 'container-left', 'container-center'];
      stereoOnMain.checked = false;
      intensityOnMain.checked = true;
      zijdOnMain.checked = false;
    }
  }
  else {
    for (let i = 0; i < AVAILABLE_CHARTS.length; i++) {
      if (AVAILABLE_CHARTS[i].checked) {
        AVAILABLE_CHARTS[i].checked = false;
        var next = ((i + rotDir) == -1) ? 2 : (i + rotDir) % AVAILABLE_CHARTS.length;
        if (rotDir == 1) ChartContainersPCA = ChartContainersPCA.splice(-1).concat(ChartContainersPCA);
        else {
          var tmp = ChartContainersPCA.splice(0, 1);
          ChartContainersPCA = ChartContainersPCA.concat(tmp);
        }
        AVAILABLE_CHARTS[next].checked = true;
        AVAILABLE_CHARTS[next].click();
        break;
      }
    }
  }

  redrawCharts(false);

}

function formatVGPTable() {

  var pole = getVGPData();

  if (!pole) return document.getElementById('vgp-table-container').innerHTML = '';

  var poleHeader = new Array(
    "  <thead class='thead-light fixed-header'>",
    "    <tr>",
    "      <th>pole lat</th>",
    "      <th>pole lon</th>",
    "      <th>paleoLat</th>",
    "      <th>dp</th>",
    "      <th>dm</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  var poleRow = [
    "    <tr class='' title=''>",
    "      <td>" + pole.lat.toFixed(2) + "</td>",
    "      <td>" + pole.lng.toFixed(2) + "</td>",
    "      <td>" + pole.pLat.toFixed(2) + "</td>",
    "      <td>" + pole.dp.toFixed(2) + "</td>",
    "      <td>" + pole.dm.toFixed(2) + "</td>",
    "    </tr>",
  ].join("\n");

  var tableFooter = "</tbody>";

  document.getElementById("vgp-table-container").innerHTML = poleHeader + poleRow + tableFooter;

}

function formatCollectionTable() {

  var collection = getSelectedFile('collection');

  if (!collection) return document.getElementById('collection-table-container').innerHTML = '';

  var dName, iName;

  if (COORDINATES.stat == 'specimen') {
    dName = 'Dspec';
    iName = 'Ispec';
  }
  else if (COORDINATES.stat == 'geographic') {
    dName = 'Dgeo';
    iName = 'Igeo';
  }
  else {
    dName = 'Dstrat';
    iName = 'Istrat';
  }

  document.getElementById("site-lat").value = collection.vgp.siteLat;
  document.getElementById("site-lon").value = collection.vgp.siteLon;

  formatVGPTable();

  var tableHeader = new Array(
    "  <thead class='thead-light fixed-header'>",
    "    <tr>",
    "      <th>E</th>",
    "      <th>#</th>",
    "      <th>ID</th>",
    "      <th>" + dName + "</th>",
    "      <th>" + iName + "</th>",
    "      <th>MAD</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  var tableRows = collection.interpretations.map(function(interpretation, i) {

    var rowClass = '';
    var rowTitle = '';
    var num = interpretation.index + 1;
    var dotVisibleTitle = '<span title="Erase step">';
    var dotVisibleIcon = '<i class="fad fa-eraser"></i>'

    if (!interpretation.visible) {
      rowClass = 'erase-row text-muted';
      num = '-';
      dotVisibleTitle = '<span title="Redraw interpretation">';
      dotVisibleIcon = '<i class="fad fa-pencil"></i>';
      rowTitle = 'Interpretation erased';
    }

    var dec = interpretation[dName][DIRECTION_MODE];
    var inc = interpretation[iName][DIRECTION_MODE];

    return [
      "    <tr class='" + rowClass + "' title='    " + rowTitle + "'>",
      "      <td>" + dotVisibleTitle + "<button onclick='eraseStep(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotVisibleIcon + "</button></span></td>",
      "      <td>" + num + "</td>",
      "      <td>" + interpretation.id + "</td>",
      "      <td>" + dec.toFixed(2) + "</td>",
      "      <td>" + inc.toFixed(2) + "</td>",
      "      <td>" + interpretation.mad.toFixed(2) + "</td>",
      "    </tr>",
    ].join("\n");

  });

  var tableFooter = "</tbody>";

  document.getElementById("collection-table-container").innerHTML = tableHeader + tableRows.join("\n") + tableFooter;

}

function formatSpecimenTable() {

  var specimen = getSelectedFile('specimen');

  if (!specimen) return document.getElementById('specimen-table-container').innerHTML = '';

  var dName, iName;

  if (COORDINATES.pca == 'specimen') {
    dName = 'Dspec';
    iName = 'Ispec';
  }
  else if (COORDINATES.pca == 'geographic') {
    dName = 'Dgeo';
    iName = 'Igeo';
  }
  else {
    dName = 'Dstrat';
    iName = 'Istrat';
  }

  var tableHeader = new Array(
    "  <thead class='thead-light fixed-header'>",
    "    <tr>",
    "      <th>E</th>",
    "      <th>#</th>",
    "      <th>Step</th>",
    "      <th>" + dName + "</th>",
    "      <th>" + iName + "</th>",
    "      <th>MAG</th>",
    "      <th>a95</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  var tableRows = specimen.steps.map(function(step, i) {

    var direction = inReferenceCoordinates(COORDINATES.pca, specimen, new Coordinates(step.x, step.y, step.z)).toVector(Direction);
    var intensity = (direction.length / specimen.volume).toFixed(0);
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

    return [
      "    <tr class='" + rowClass + "' title='    " + rowTitle + "'>",
      "      <td>" + stepVisibleTitle + "<button onclick='eraseStep(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + stepVisibleIcon + "</button></span></td>",
      "      <td>" + num + "</td>",
      "      <td>" + step.step + "</td>",
      "      <td>" + direction.dec.toFixed(2) + "</td>",
      "      <td>" + direction.inc.toFixed(2) + "</td>",
      "      <td>" + intensity + "</td>",
      "      <td>" + step.error.toFixed(2) + "</td>",
      "    </tr>",
    ].join("\n");
  });

  var tableFooter = "</tbody>";

  document.getElementById("specimen-table-container").innerHTML = tableHeader + tableRows.join("\n") + tableFooter;

}

function updateInterpretationTable(page) {

  /*
   * Function updateInterpretationTable
   * Updates the table with information on interpreted components
   */

  const COMMENT_LENGTH = 15;
  const ERROR_NO_COMPONENTS = "<h6 class='text-muted text-center'>No components available</h6>";
  const ERROR_NO_MEANS = "<h6 class='text-muted text-center'>No means available</h6>";
  const ChRM_COMMENT = "Click to add";

  var specimen = getSelectedFile('specimen');
  var collection = getSelectedFile('collection');

  // No interpretations to show
  if (page == 'pca') {
    if (!specimen) return document.getElementById('interpretation-table-container').innerHTML = '';

    if (specimen.interpretations.length === 0) {
      ipcRenderer.send('reload-interpretDataWin');
      document.getElementById("interpretation-table-container").innerHTML = ERROR_NO_COMPONENTS;
      return;
    }
  }
  else if (page == 'stat') {
    if (!collection) return document.getElementById('mean-table-container').innerHTML = '';

    if(collection.means.length === 0) {
      ipcRenderer.send('reload-meansDataWin');
      document.getElementById("mean-table-container").innerHTML = ERROR_NO_MEANS;
      return;
    }
  }

  var tableHeaderPCA = new Array(
    "<table class='table text-center table-sm small-table-elem table-bordered w-100 small' style='margin: 0; max-height: 100%;'>",
    //"<table id='interpretDataTable' class='table table-sm table-bordered w-100 small text-center' style='text-align: center!important; margin: 0;'>",
    "  <thead class='thead-light'>",
    "    <tr>",
    "      <th><button onclick='deleteAllResults(" + undefined + ',' + '"' + page + '"' +  ")' title='Delete all interpretations' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-trash-alt'></i></button></th>",
    "      <th>ID</th>",
    "      <th>Dg</th>",
    "      <th>Ig</th>",
    "      <th>Ds</th>",
    "      <th>Is</th>",
    "      <th>MAD</th>",
    "      <th>Code</th>",
    "      <th>Steps</th>",
    "      <th>N</th>",
    "    </tr>",
    "  </thead>",
  ).join("\n");

  var tableHeaderStat = new Array(
    "<table class='table text-center table-sm small-table-elem table-bordered w-100 small' style='margin: 0; max-height: 100%;'>",
    //"<table id='interpretDataTable' class='table table-sm table-bordered w-100 small text-center' style='text-align: center!important; margin: 0;'>",
    "  <thead class='thead-light'>",
    "    <tr>",
    "      <th><button onclick='deleteAllResults(" + undefined + ',' + '"' + page + '"' + ")' title='Delete all means' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-trash-alt'></i></button></th>",
    "      <th>ID</th>",
    "      <th>Dg</th>",
    "      <th>Ig</th>",
    "      <th>Ds</th>",
    "      <th>Is</th>",
    "      <th>a95</th>",
    "      <th>k</th>",
    "      <th>Code</th>",
    "      <th>Steps</th>",
    "      <th>N</th>",
    "    </tr>",
    "  </thead>",
  ).join("\n");

  // Start adding all the specimens
  var rows;

  if (page == 'pca') {
    rows = specimen.interpretations.map(function(interpretation, i) {

      // Get the interpretation in the right reference frame
      var componentGeo = interpretation['geographic'];
      var componentTect = interpretation['tectonic'];

      var directionGeo = literalToCoordinates(componentGeo.coordinates).toVector(Direction);
      var directionTect = literalToCoordinates(componentTect.coordinates).toVector(Direction);

      // Handle comments on interpretations
      if (interpretation.comment === null) comment = ChRM_COMMENT;
      else comment = interpretation.comment;

      // Full code of interpretation

      var code = interpretation.code;

      // Mad angle (if forced this is unreliable)
      var mad = interpretation.MAD.toFixed(2);
      if(interpretation.anchored) {
        mad = "<span class='text-primary' title='The MAD for anchored components is unreliable'>" + mad + "</span>";
        // code = "dir0PCA";
      }

      // Intensity (also unreliable when forced)
      var intensity = interpretation.intensity.toFixed(2);
      if(interpretation.anchored) {
        intensity = "<span class='text-primary' title='The intensity for anchored components is unreliable'>" + intensity + "</span>";
      }
      // Number of steps
      var N = interpretation.steps.length;

      return [
        "  </tr>",
        "    <td><button onclick='deleteAllResults(" + i + ',' + '"' + page + '"' + ")' title='Delete interpretation' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-minus-square'></i></button></td>",
        "    <td>" + specimen.name + "</td>",
        "    <td>" + directionGeo.dec.toFixed(2) + "</td>",
        "    <td>" + directionGeo.inc.toFixed(2) + "</td>",
        "    <td>" + directionTect.dec.toFixed(2) + "</td>",
        "    <td>" + directionTect.inc.toFixed(2) + "</td>",
        "    <td>" + mad + "</td>",
        "    <td>" + code + "</td>",
        "    <td>" + interpretation.steps[0].step + '-' + interpretation.steps[N-1].step + "</td>",
        "    <td>" + N + "</td>",
        "  </tr>"
      ].join("\n");

    });
  }
  else if (page == 'stat') {
    rows = collection.means.map((mean, i) => {

      // Get the mean in the right reference frame
      var dirType = 'normal';
      if (DIRECTION_MODE == 'reversed') dirType = 'reversed';

      var directionSpec = mean.specimen[dirType];
      var directionGeo = mean.geographic[dirType];
      var directionStrat = mean.tectonic[dirType];

      // Handle comments on mean
      if (mean.comment === null) comment = ChRM_COMMENT;
      else comment = mean.comment;

      // Full code of mean
      var code = mean.code;

      // a95 angle (if forced this is unreliable)
      var a95 = mean.a95[dirType].toFixed(2);
      if((mean.code == 'GC') || (mean.code == 'GCn')) {
        a95 = "<span class='text-primary' title='The MAD for anchored components is unreliable'>" + a95 + "</span>";
      }
      var k = (mean.k[dirType]) ? mean.k[dirType].toFixed(2) : "<span class='text-primary' title='The k for Bingham distribution is ambiguous'>" + '?' + "</span>";

      // Number of dots
      var N = mean.dots.length;

      return [
        "  </tr>",
        "    <td><button onclick='deleteAllResults(" + i + ',' + '"' + page + '"' + ")' title='Delete interpretation' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-minus-square'></i></button></td>",
        "    <td>" + collection.name + "</td>",
        "    <td>" + directionGeo.dec.toFixed(2) + "</td>",
        "    <td>" + directionGeo.inc.toFixed(2) + "</td>",
        "    <td>" + directionStrat.dec.toFixed(2) + "</td>",
        "    <td>" + directionStrat.inc.toFixed(2) + "</td>",
        "    <td>" + a95 + "</td>",
        "    <td>" + k + "</td>",
        "    <td>" + code + "</td>",
        "    <td>" + '"' + 'site avg' + '"' + "</td>",
        "    <td>" + N + "</td>",
        "  </tr>"
      ].join("\n");

    })
  }

  var tableFooter = "</table>";

  // Update full interpretation DataTable
  if (page == 'pca') {
  ipcRenderer.send('reload-interpretDataWin');
    document.getElementById("interpretation-table-container").innerHTML = tableHeaderPCA + rows.join("\n") + tableFooter;
  }
  else if (page == 'stat') {
  ipcRenderer.send('reload-meansDataWin');
    document.getElementById("mean-table-container").innerHTML = tableHeaderStat + rows.join("\n") + tableFooter;
  }

}

function deleteAllResults(index, page) {

  /*
   * Function deleteAllInterpretations
   * Deletes all interpretations in a specimen
   */

  var specimen = getSelectedFile('specimen');
  var collection = getSelectedFile('collection');

  if (page == 'pca') {
    if (index === undefined) specimen.interpretations = new Array();
    else specimen.interpretations.splice(index, 1);
  }
  else if (page == 'stat') {
    if (index === undefined) collection.means = new Array();
    else collection.means.splice(index, 1);
  }

  saveLocalStorage();
  updateInterpretationTable(page);
  redrawCharts();
}

function interpretationTableClickHandler(event) {

  /*
   * Function interpretationTableClickHandler
   * Handlers a click on the interpreted component table
   */

  var specimen = getSelectedFile('specimen');
  var collection = getSelectedFile('collection');

  var columnIndex = event.target.cellIndex;
  var rowIndex = event.target.parentElement.rowIndex;

  // A specific component was referenced
  if(rowIndex > 0) {

    // if(columnIndex === 8) {
    //   var comment = prompt("Enter the new group for this interpretation.", specimen.interpretations[rowIndex - 1].group);
    //   if(comment === null) return;
    //   if(comment === "") comment = "ChRM";
    //   specimen.interpretations[rowIndex - 1].group = comment;
    // }
    // console.log(columnIndex, rowIndex, event.target.innerHTML);
    if(columnIndex === 9) {
      // var comment = prompt("Enter a comment for this interpretation.", specimen.interpretations[rowIndex - 1].comment);
      // if(comment === null) return;
      // if(comment === "") comment = null;
      specimen.interpretations[rowIndex - 1].comment = event.target.innerHTML;
    }

  }

  //redrawCharts();
  saveLocalStorage();

}

function saveLocalStorage() {

  /*
   * Function saveLocalStorage
   * Saves sample object to local storage
   */

  localStorage.setItem("lastOpenPath", lastOpenPath);
  localStorage.setItem("lastSavePath", lastSavePath);

  localStorage.setItem("specimens", JSON.stringify(specimens));
  if (specimens.length > 0) localStorage.setItem("selectedSpecimen", JSON.stringify(getSelectedFile('specimen')));

  localStorage.setItem("collections", JSON.stringify(collections));
  if (collections.length > 0) localStorage.setItem("selectedCollection", JSON.stringify(getSelectedFile('collection')));

}

function clearLocalStorage() {

  if (settings.global.autoSave) return;
  localStorage.removeItem('specimens');
  localStorage.removeItem('selectedSpecimen');
  localStorage.removeItem('collections');
  localStorage.removeItem('selectedCollection');
  localStorage.removeItem('settings');

}

function updateLocalStorage() {
  specimens = JSON.parse(localStorage.getItem("specimens"));
  collections = JSON.parse(localStorage.getItem("collections"));
}

function reloadFiles(file, type) {
  var allElems = {
    specimen: 'steps',
    collection: 'interpretations',
  }

  var elems = allElems[type];
  if (file) {
    file[elems].forEach((elem, i) => {
      elem.visible = true;
      elem.selected = false;
      elem.index = i;
    });
    if (type == 'specimen') file.interpretations = new Array();
  }
  else {
    if (type == 'specimen') {
      specimens.forEach((specimen, i) => {
        specimen.steps.forEach((step, j) => {
          step.visible = true;
          step.selected = false;
          step.index = j;
        });
        specimen.interpretations = new Array();
      });
    }
    else if (type == 'collection') {
      collections.forEach((collection, i) => {
        collection.interpretations.forEach((interpretation, j) => {
          interpretation.visible = true;
          interpretation.selected = false;
          interpretation.index = j;
        });
      });
    }
  }

  mainContPanZoomPCA.reset();
  mainContPanZoomStat.reset();
  saveLocalStorage();
  if (type == "specimen") updateInterpretationTable("pca");
  if (type == 'collection') updateInterpretationTable("stat");
  redrawCharts();
}

function redrawCharts(hover, context) {
  /*
  * Function redrawCharts
  * Redraws all the charts for the active specimen
  */

  // Save the current scroll position for later, otherwise the scroll position will
  // jump to the top when a Highcharts chart is drawn
  // var tempScrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  var zijdOnMain = document.getElementById('zijd-on-main').checked
  var stereoOnMain = document.getElementById('stereo-on-main').checked
  if (context) {

    var chartContainers = [
      document.getElementById('container-center'),
      document.getElementById('container-left'),
      document.getElementById('container-right'),
      document.getElementById('stat-container-center'),
    ];

    var chart;
    chartContainers.forEach((container, i) => {
      for (let i = 0; i < container.classList.length; i++) {
        if (container.classList[i] == 'add-context') {
          chart = container.children[3].classList[1];
          break;
        }
      }
    });
    if (chart == 'zijd-plot') plotZijderveldDiagram(hover, zijdOnMain);
    else if (chart == 'stereo-plot') plotStereoDiagram(hover, stereoOnMain);
    else if (chart == 'intensity-plot') plotIntensityDiagram();
    else if (chart == 'stat-plot') statPlotStereoDiagram();
  }
  else {
    plotZijderveldDiagram(hover, zijdOnMain);
    plotStereoDiagram(hover, stereoOnMain);
    plotIntensityDiagram();
    updateInterpretationTable('pca');
    statPlotStereoDiagram();
    updateInterpretationTable('stat');
  }

  formatSpecimenTable();
  formatCollectionTable();

  ipcRenderer.send('redraw-collDataWin');
  ipcRenderer.send('redraw-specDataWin');
  ipcRenderer.send('redraw-meansDataWin');
  ipcRenderer.send('redraw-interpretDataWin');
  ipcRenderer.send('redraw-vgpDataWin');

}

function makeChartContextMenu(chart) {

  var chartType = chart.split('-')[0];

  var pageID = getSelectedPage();
  var pageType = pageID.split('-')[1];

  var typeStrPage = '"' + pageType + '"';
  var typeStrGlobal = '"' + 'global' + '"';

  var trueSymbol = "    <i class='far fa-check'></i>";
  var falseSymbol = "    <i class='far fa-times ml-1'></i>";

  var tooltipsCheck = falseSymbol;
  if (settings[pageType][chartType + 'Tooltips']) tooltipsCheck = trueSymbol;

  var annotationsCheck = falseSymbol;
  if (settings[pageType][chartType + 'Annotations']) annotationsCheck = trueSymbol;

  var ticksCheck = falseSymbol;
  if (settings[pageType][chartType + 'Ticks']) ticksCheck = trueSymbol;

  var hoverCheck = falseSymbol;
  if (settings[pageType][chartType + 'Highlight']) highlightCheck = trueSymbol;

  var highlightCheck = falseSymbol;
  if (settings[pageType][chartType + 'Hover']) hoverCheck = trueSymbol;

  var errorCheck = falseSymbol;
  if (settings[pageType][chartType + 'Error']) errorCheck = trueSymbol;

  var numberCheck = falseSymbol;
  if (settings[pageType].numberMode) numberCheck = trueSymbol;

  var stepCheck = falseSymbol;
  if (settings[pageType].stepMode) stepCheck = trueSymbol;

  var overlapCheck = falseSymbol;
  if (settings[pageType].allowOverlap) overlapCheck = trueSymbol;

  var outlineCheck = falseSymbol;
  if (settings[pageType].addTextOutline) outlineCheck = trueSymbol;

  var blockMouseOnZoomCheck = falseSymbol;
  if (settings.global.blockMouseOnZoom) blockMouseOnZoomCheck = trueSymbol;

  var dashedLinesCheck = falseSymbol;
  if (settings.global.dashedLines) dashedLinesCheck = trueSymbol;

  var currChartOpts = new Array(
    "  <div class='item mt-1' onclick='toggleContextChartOption(" + '"' +  (chartType + 'Tooltips') + '"' + ',' + false + ',' + typeStrPage + ")'>",
    tooltipsCheck,
    "    Tooltips",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  (chartType + 'Annotations') + '"' + ',' + false + ',' + typeStrPage + ")'>",
    annotationsCheck,
    "    Annotations",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  (chartType + 'Ticks') + '"' + ',' + false + ',' + typeStrPage + ")'>",
    ticksCheck,
    "    Ticks",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  (chartType + 'Highlight') + '"' + ',' + false + ',' + typeStrPage + ")'>",
    highlightCheck,
    "    Highlight selected",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  (chartType + 'Hover') + '"' + ',' + false + ',' + typeStrPage + ")'>",
    hoverCheck,
    "    Highlight on hover",
    "  </div>",
  ).join("\n");

  if ((chartType == 'stereo') || (chartType == 'stat')) {
    var showError = new Array(
      "  <div class='item' onclick='toggleContextChartOption(" + '"' +  (chartType + 'Error') + '"' + ',' + false + ',' + typeStrPage + ")'>",
      errorCheck,
      "    Error circles",
      "  </div>",
      "  <div class='item' onclick='toggleContextChartOption(" + '"' + 'dashedLines' + '"' + ',' + false + ',' + typeStrGlobal + ")'>",
      dashedLinesCheck,
      "    Dashed lines",
      "  </div>",
    ).join("\n");

    currChartOpts += showError;
  }

  var allChartsOpts = new Array(
    "  <hr>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  'numberMode' + '"' + ',' + true + ',' + typeStrPage + ")'>",
    numberCheck,
    "    Number mode",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  'stepMode' + '"' + ',' + true + ',' + typeStrPage + ")'>",
    stepCheck,
    "    Step mode",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  'allowOverlap' + '"' + ',' + true + ',' + typeStrPage + ")'>",
    overlapCheck,
    "    Overlap",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  'addTextOutline' + '"' + ',' + true + ',' + typeStrPage + ")'>",
    outlineCheck,
    "    Outline",
    "  </div>",
  ).join("\n");

  var globalOpts = new Array(
    "  <hr>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  'blockMouseOnZoom' + '"' + ',' + true + ',' + typeStrGlobal + ")'>",
    blockMouseOnZoomCheck,
    "    Block mouse",
    "  </div>",
    "  <div class='item mb-1' onclick='redrawCharts(undefined, true)'>",
    "    <i class='far fa-sync'></i> Redraw",
    "  </div>",
  ).join("\n");

  var contextMenu = document.getElementById('chart-context-menu');
  contextMenu.innerHTML = currChartOpts + allChartsOpts + globalOpts;

  return contextMenu;

}

function toggleContextChartOption(option, redrawAll, type) {

  settings[type][option] = !settings[type][option];
  localStorage.setItem("settings", JSON.stringify(settings));

  if (redrawAll) return redrawCharts(undefined, false);
  redrawCharts(undefined, true);

}

function resizeTables() {

  var titlebar = document.getElementById('titlebar');
  var pagemenu = document.getElementById('pagemenu');

  var pageHeight = (window.innerHeight - (titlebar.offsetHeight + pagemenu.offsetHeight));

  var collectionTable = document.getElementById('coll-data-table');
  var specimenTable = document.getElementById('spec-data-table');
  var interpretationTable = document.getElementById('interpretation-table-container');
  var meanTable = document.getElementById('mean-table-container');

  document.getElementById('container-top-right').style.height = pageHeight / 2 + 'px';
  document.getElementById('container-bot-right').style.height = pageHeight / 2 + 'px';
  document.getElementById('container-bot-left').style.height = pageHeight / 2 + 'px';
  document.getElementById('container-top-left').style.height = pageHeight / 2 + 'px';

  specimenTable.style.height = (pageHeight / 2) - document.getElementById('specimen-data-btns').offsetHeight - 5 + 'px';
  collectionTable.style.height = pageHeight - document.getElementById('collection-data-btns').offsetHeight - 5 + 'px';
  interpretationTable.style.height = (pageHeight / 2) - document.getElementById('pca-tools').offsetHeight - 5 + 'px';
  meanTable.style.height = pageHeight - document.getElementById('stat-tools').offsetHeight - 5 + 'px';

}

// Initialize the pages
function __init__() {

  /*
   * Function __init__
   * Initializes the Paleomagnetism 2.0.0 interpretation portal
   */

  // Check local storage
  // if(!window.localStorage) {
  //   return notify("warning", "Local storage is not supported by your browser. Save your work manually by exporting your data.");
  // }
  //
  // localStorage.clear();

  // load current page from localStorage
  var selectedPageID = (localStorage.getItem("currPage")) ? localStorage.getItem("currPage") : 'nav-pca-tab';
  document.getElementById(selectedPageID).click();

  // load some globals from localStorage
  lastOpenPath = localStorage.getItem("lastOpenPath");
  lastSavePath = localStorage.getItem("lastSavePath");

  var direction = JSON.parse(localStorage.getItem("direction"));
  var centered = JSON.parse(localStorage.getItem("centered"));
  var coordinates = JSON.parse(localStorage.getItem("coordinates"));
  var projection = JSON.parse(localStorage.getItem("projection"));

  DIRECTION_MODE = (direction) ? direction.data : "normal";
  document.getElementById('stat-' + DIRECTION_MODE).click();
  MODES_COUNTER = (direction) ? direction.counter : 0;
  CENTERED_MODE = (centered) ? centered.data : "standard";
  document.getElementById('stat-' + CENTERED_MODE).click();
  CENTERED_COUNTER = (centered) ? centered.counter : 0;
  COORDINATES = (coordinates) ? coordinates.data : {pca: 'specimen', stat: 'geographic'}
  document.getElementById('pca-' + COORDINATES['pca']).click();
  document.getElementById('stat-' + COORDINATES['stat']).click();
  COORDINATES_COUNTER = (coordinates) ? coordinates.data : { pca: 0, stat: 0}
  PROJECTION = (projection) ? projection.data : "upwest";
  document.getElementById('input-' + PROJECTION).click();
  PROJECTIONS_COUNTER = (projection) ? projection.counter : 0;

  // Load specimens from local storage
  specimens = JSON.parse(localStorage.getItem("specimens"));
  collections = JSON.parse(localStorage.getItem("collections"));


  if ((specimens === null) && (collections === null)) {
    return ipcRenderer.send('open-openFilesModal');
  }
  else ipcRenderer.send('hide-openFilesModal');

  if (specimens === null) specimens = new Array();
  if (collections === null) collections = new Array();
  if (lastOpenPath === null) lastOpenPath = app.getPath('documents');
  if (lastSavePath === null) lastSavePath = app.getPath('documents');
  __unlock__();

  if ((specimens.length > 0) || (collections.length > 0)) {
    redrawCharts();
  }
}

// unlock pages
function __unlock__() {

  /*
   * Function __unlock__
   * Application has initialized and handlers can be registered
   */

  // if(window.location.search) {
  //   json.forEach(function(sample, i) {
  //     sample.reference = window.location.search.slice(1) + "." + i;
  //   });
  // }

  // if(json.length) {
  //
  //   if(window.location.search) {
  //     notify("success", "Succesfully forked <b>" + json.length + "</b> specimen(s). Changes to this session will not be saved (<a href='#' onclick='persistFork()'><i class='fas fa-code-branch'></i><b> Persist Fork</b></a>).");
  //   } else {
  //     notify("success", "Welcome back! Succesfully loaded <b>" + json.length + "</b> specimen(s).");
  //   }
  //
  //   // enableInterpretationTabs();
  //
  // } else {
  //   notify("success", "Welcome to <b>PMTools</b>! Add data below to get started with your analysis.");
  // }

  registerEventHandlers();
  if (specimens.length > 0) updateFileSelect('specimen');
  if (collections.length > 0) updateFileSelect('collection');

  // load current specimen and collection
  var selectedSpecimen = JSON.parse(localStorage.getItem('selectedSpecimen'));
  var specimenSelector = document.getElementById('specimen-select');
  if ((specimens.length > 0) && selectedSpecimen) {
    for (let i = 0; i < specimens.length; i++) {
      if (specimens[i].name == selectedSpecimen.name) {
        specimenSelector.value  = i;
        break;
      }
    }
  }

  var selectedCollection = JSON.parse(localStorage.getItem('selectedCollection'));
  var collectionSelector = document.getElementById('collection-select');
  if ((collections.length > 0) && selectedCollection) {
    for (let i = 0; i < collections.length; i++) {
      if (collections[i].name == selectedCollection.name) {
        collectionSelector.value = i;
        break;
      }
    }
  }

  dotSelector.reset();

  // addMap();

}
// localStorage.clear();
// Some globals
var leafletMarker;
var map;
var ChartContainersPCA = ['container-left', 'container-center', 'container-right']
var COORDINATES_COUNTER = {
  pca: 0,
  stat: 0,
}
var COORDINATES = {
  pca: 'specimen',
  stat: 'geographic',
}
var DIRECTION_MODE = "normal";
var MODES_COUNTER = 0;
var CENTERED_MODE = "standard";
var CENTERED_COUNTER = 0;
var PROJECTIONS_COUNTER = 0;
var PROJECTION = "upwest";

var zijdOnMain = document.getElementById('zijd-on-main');
var stereoOnMain = document.getElementById('stereo-on-main');
var intensityOnMain = document.getElementById('intensity-on-main');

var AVAILABLE_CHARTS = [zijdOnMain, stereoOnMain, intensityOnMain];

var GROUP = "ChRM";
var UPWEST = true;
var specimens = new Array();
var collections = new Array();
var lastOpenPath = app.getPath('documents');
var lastSavePath = app.getPath('documents');
var project_json;

var dotSelector = new DotSelector();

const mainContainerPCA = document.getElementById('container-center');
const mainContainerStat = document.getElementById('stat-container-center');

var panzoomSettings = {
  contain: 'outside',
  minScale: 1,
  maxScale: 10,
  rangeStep: 0.05,
  increment: 0.3,
  animate: false,
  panOnlyWhenZoomed: true,
  beforeMouseDown: function(e) {
    // allow mouse-down panning only if altKey is down. Otherwise - ignore
    var shouldIgnore = !e.altKey;
    return shouldIgnore;
  },
  beforeWheel: false,
  cursor: 'default',
  disablePan: false,
  handleStartEvent: () => {}
}

const mainContPanZoomPCA = Panzoom(mainContainerPCA, panzoomSettings);
const mainContPanZoomStat = Panzoom(mainContainerStat, panzoomSettings);

// mainContPanZoomStat.zoom(2, { animate: true });
// console.log(mainContPanZoomStat.getScale());

const elemTypes = {
  pca: ['specimen', 'steps', mainContainerPCA],
  stat: ['collection', 'interpretations', mainContainerStat]
}

const zoomContTypes = {
  pca: mainContPanZoomPCA,
  stat: mainContPanZoomStat,
}

// Renderer opertaions

ipcRenderer.on('give-selected-specimen', (event) => {
  ipcRenderer.send('hold-selected-specimen', getSelectedFile('specimen'))
})

ipcRenderer.on('init', () => {
  __init__();

  var keyboardEvent = document.createEvent("KeyboardEvent");
  var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";

  keyboardEvent[initMethod](
    "keydown", // event type: keydown, keyup, keypress
    true,      // bubbles
    true,      // cancelable
    window,    // view: should be window
    false,     // ctrlKey
    false,     // altKey
    false,     // shiftKey
    false,     // metaKey
    116,        // keyCode: unsigned long - the virtual key code, else 0
    // 0          // charCode: unsigned long - the Unicode character associated with the depressed key, else 0
  );
  document.dispatchEvent(keyboardEvent);
})

ipcRenderer.on('clear-storage', () => {
  clearLocalStorage();
})

__init__();
resizeTables();

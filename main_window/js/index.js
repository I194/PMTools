;(function($) {
    $.fn.textfill = function(options) {
        var fontSize = options.maxFontPixels;
        var ourText = $('span:visible:first', this);
        var maxHeight = $(this).height();
        var maxWidth = $(this).width();
        var textHeight;
        var textWidth;
        do {
            ourText.css('font-size', fontSize);
            textHeight = ourText.height();
            textWidth = ourText.width();
            fontSize = fontSize - 1;
        } while ((textHeight > maxHeight || textWidth > maxWidth) && fontSize > 3);
        return this;
    }
})(jQuery);

$(document).ready(function() {
    $('.sitesSet-file-path').textfill({ maxFontPixels: 36 });
});

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

            $chkboxes.slice(Math.min(start,end), Math.max(start,end)+ 1).prop('checked', lastChecked.checked);
        }

        lastChecked = this;
    });
});

function addNotCollapsedStyle(clickedBtnId) {

  var clickedBtn = document.getElementById(clickedBtnId)
  btnsIds = [
    'pca-pca-btn',
    'pca-pca0-btn',
    'pca-gc-btn',
    'pca-gcn-btn',
    'pca-erase-btn',
    'stat-f-btn',
    'stat-gc-btn',
    'stat-gcn-btn',
    'stat-erase-btn',
    'stat-reverse-btn',
    'poles-f-btn',
    'poles-m-btn',
    'poles-gc-btn',
    'poles-gcn-btn',
    'poles-erase-btn',
    'poles-reverse-btn',
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

function chartsContainersSelection(id) {
  window.addEventListener('click', function(e){
    if (document.getElementById(id).contains(e.target)){
      document.getElementById(id).classList.add('selected');
    } else {
      document.getElementById(id).classList.remove('selected');
    }
  });
}

function copySelectedChart() {
  chartContainersIDList.forEach((id, i) => {
    if (document.getElementById(id).classList.contains("selected")) {
      Highcharts.exportCharts(
        [getChartByID(id)],
        {
          filename: "chart",
          extnsn: 'pdf',
        },
        'copy',
        // we can't use full svg code because it's contains not only chart
        // and so we must use highcharts processing like chart.getSVG()
        // even if it a little slower that custom processing
        // document.getElementById(id).children[3].children[0],
      );
    }
  });

}

function getChartByID(id) {

  var classes = Array.from(document.getElementById(id).children[3].classList);
  var selChartType = undefined;

  classes.forEach((elem, i) => {
    var elemParts = elem.split('-');
    if (elemParts.length == 2) {
      if (elemParts[1] === 'plot') selChartType = elemParts[0];
    }
  });

  var selChart = undefined;
  switch (selChartType) {
    case 'zijd':
      selChart = zijdPCA;//plotZijderveldDiagram();
      break;
    case 'stereo':
      selChart = stereoPCA;//plotStereoDiagram();
      break;
    case 'intensity':
      selChart = intensPCA;//plotIntensityDiagram();
      break;
    case 'stat':
      selChart = stereoStat;//statPlotStereoDiagram();
      break;
    case 'sites':
      selChart = stereoPoles.sites;//polesPlotStereoDiagrams().sites;
      break;
    case 'vgps':
      selChart = stereoPoles.vgps;//polesPlotStereoDiagrams().vgps;
      break;
  }
  // console.log(selChartType, selChart);
  return selChart;
}

function registerEventHandlers() {

  // Simple listeners
  document.addEventListener("keydown", keyboardHandler);
  // document.getElementById("container-center").addEventListener('click', mainContClickHandler);
  // document.getElementById("stat-container-center").addEventListener('click', mainContClickHandler);
  document.getElementById("interpretation-table-container").addEventListener("input", interpretationTableClickHandler);
  document.getElementById("sites-table-container").addEventListener("input", sitesTableClickHandler);
  document.getElementById("specimen-select").addEventListener("change", (e) => resetFileHandler('specimen'))
  document.getElementById("collection-select").addEventListener("change", (e) => resetFileHandler('collection'));
  document.getElementById("sitesSet-select").addEventListener("change", (e) => resetFileHandler('sitesSet'));
  // document.getElementById("add-files").addEventListener('click', (e) => importFiles(false, true));

  chartContainersIDList.forEach((id, i) => {
    chartsContainersSelection(id);
  });

  // document.getElementById("site-lat").addEventListener("input", (e) => formatVGPTable());
  // document.getElementById("site-lon").addEventListener("input", (e) => formatVGPTable());
  document.getElementById("append-input").addEventListener('click', (e) => {
    settings.global.appendFiles = document.getElementById("append-input").checked;
    localStorage.setItem("settings", JSON.stringify(settings));
    ipcRenderer.send('reload-settWin');
    ipcRenderer.send('reload-fileManager');
  })

  var pageID = getSelectedPage();
  var pageType = pageID.split('-')[1];

  // charts exporting
  document.getElementById('export-charts-pdf').addEventListener('click', (e) => {
    redrawCharts();
    Highcharts.exportCharts(
      chartsToExport,
      {
        filename: "charts_" + pageType,
        extnsn: 'pdf',
      },
      'save'
    );
  })
  // document.getElementById('export-charts-jpeg').addEventListener('click', (e) => {
  //   redrawCharts();
  //   Highcharts.exportCharts(
  //     chartsToExport,
  //     {
  //       filename: "charts_" + pageType,
  //       extnsn: 'jpg',
  //     },
  //     'save'
  //   );
  // })

  // pages navigation
  document.getElementById("nav-pca-tab").addEventListener("click", (e) => {
    localStorage.setItem("currPage", 'nav-pca-tab');
    chartsToExport = [zijdPCA.chartObj, stereoPCA.chartObj, intensPCA.chartObj]
    // redrawCharts();
  });
  document.getElementById("nav-stat-tab").addEventListener("click", (e) => {
    localStorage.setItem("currPage", 'nav-stat-tab');
    chartsToExport = [stereoStat];
    // redrawCharts();
  });
  document.getElementById("nav-poles-tab").addEventListener("click", (e) => {
    localStorage.setItem("currPage", 'nav-poles-tab');
    chartsToExport = [stereoPoles.sites, stereoPoles.vgps];
    // redrawCharts();
  });

  var collEraseCheckboxes = document.getElementsByClassName("chkbox1");
  console.log(collEraseCheckboxes);

  window.addEventListener("resize", resizeTables);

  var chartContainers = [
    document.getElementById('container-center'),
    document.getElementById('container-left'),
    document.getElementById('container-right'),
    document.getElementById('stat-container-center'),
    document.getElementById('poles-container-left'),
    document.getElementById('poles-container-right'),
  ]
  // settings the context menu for all charts containers
  chartContainers.forEach((container, i) => {
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

      chartContainers.forEach((cont, i) => {
        if (cont.id != container.id) cont.classList.remove('add-context');
      });

      // console.log(contextMenu.style.top, contextMenu.style.left, contextMenu.classList, contextMenu);
    });
  });

  window.addEventListener("click", () => {
    document.getElementById("chart-context-menu").classList.remove("active");
  });

}

function keyboardHandler(event) {

  /*
   * Function keyboardHandler
   * Handles keypresses on keyboard
   */

  var CODES = new Object({
    "ARROW_RIGHT": 39,
    "ARROW_LEFT": 37,
    "ARROW_UP": 38,
    "ARROW_DOWN": 40,
    // "W_KEY": 87,
    "D_KEY": 68,
    "N_KEY": 78,
    "O_KEY": 79,
    "G_KEY": 71,
    "I_KEY": 73,
    "S_KEY": 83,
    "A_KEY": 65,
    "C_KEY": 67,
    "lCTRL_KEY": 162,
    "rCTRL_KEY": 163,
    "X_KEY": 88,
    "Y_KEY": 89,
    "Z_KEY": 90,
    "Q_KEY": 81,
    "E_KEY": 69,
    "R_KEY": 82,
    "F_KEY": 70,
    "M_KEY": 77,
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

  var numArrowMode = true; // navigation by arrows from the NUM-block

  if (document.activeElement.id.slice(-10) === 'text-input') {
    var textInputCodes = new Object({
      "ENTER_KEY": 13,
      "ENTER_NUMPAD_KEY": 13,
      "ESCAPE_KEY": 27,
    });

    numArrowMode = false;

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

  if (document.activeElement.classList.contains('TableInput')) {
    var codes = new Object({
      "ARROW_RIGHT": 39,
      "ARROW_LEFT": 37,
      "ARROW_UP": 38,
      "ARROW_DOWN": 40,
      "NUM_ARROW_UP": 104,
      "NUM_ARROW_RIGHT": 102,
      "NUM_ARROW_DOWN": 98,
      "NUM_ARROW_LEFT": 100,
    });

    numArrowMode = false;

    if(!Object.values(codes).includes(event.keyCode)) {
      return;
    }

    // event.preventDefault();

    var cell = document.activeElement;
    var rowIndex = cell.parentNode.rowIndex;
    var colIndex = cell.cellIndex;
    var range = window.getSelection().getRangeAt(0);
    var selectedObj = window.getSelection();

    switch(event.keyCode) {
      // case textInputCodes.ENTER_NUMPAD_KEY:
      // case textInputCodes.ENTER_KEY:
      //   return document.getElementById(methodAbbr + '-confirm').click();
      case codes.ARROW_RIGHT:
      case codes.NUM_ARROW_RIGHT:
        if (!cell.childNodes.length) {
          event.preventDefault(); // stop caret moving
          return cell.nextElementSibling.focus();
        }
        if ((colIndex != (cell.parentNode.children.length - 1)) && (range.startOffset == cell.childNodes[0].length)) {
          event.preventDefault(); // stop caret moving
          return cell.nextElementSibling.focus();
        }
        return;
      case codes.ARROW_LEFT:
      case codes.NUM_ARROW_LEFT:
        if ((colIndex != 0) && (range.startOffset == 0)) {
          event.preventDefault();
          return cell.previousElementSibling.focus();
        }
        return;
      case codes.ARROW_UP:
      case codes.NUM_ARROW_UP:
        if (rowIndex != 1) cell.parentNode.previousElementSibling.children[colIndex].focus();
        return;
      case codes.ARROW_DOWN:
      case codes.NUM_ARROW_DOWN:
        if (rowIndex != (cell.parentNode.children.length - 1)) cell.parentNode.nextElementSibling.children[colIndex].focus();
        return;
    }
  }

  if(!Object.values(CODES).includes(event.keyCode)) {
    return;
  }

  if (numArrowMode) {
    CODES["NUM_ARROW_UP"] = 104;
    CODES["NUM_ARROW_RIGHT"] = 102;
    CODES["NUM_ARROW_DOWN"] = 98;
    CODES["NUM_ARROW_LEFT"] = 100;
  }

  event.preventDefault();

  var specimen = getSelectedFile('specimen');

  var pageID = getSelectedPage();

  var pageType = pageID.split('-')[1];
  var scrollerID = elemTypes[pageType][0] + '-select';

  var elems = elemTypes[pageType][1];

  var zoomContainer = zoomContTypes[pageType];
  if (pageType == 'poles') {
    if (document.getElementById("poles-container-right").classList.contains("selected")) {
      zoomContainer = zoomContainer[1];
    }
    else zoomContainer = zoomContainer[0];
  }

  var currPanPos = zoomContainer.getPan();

  var file = getSelectedFile(elemTypes[pageType][0]);

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
      zoomContainer.zoomIn( { animate: false } );
      zoomContainer.click();
      return;
    case CODES.MINUS_KEY:
      zoomContainer.zoomOut( { animate: false } );
      zoomContainer.click();
      return;
    case CODES.ESCAPE_KEY:
      zoomContainer.reset();
      redrawCharts();
      zoomContainer.click();
      return;
    // -x - right side, -y - down side
    case CODES.ARROW_RIGHT:
    case CODES.NUM_ARROW_RIGHT:
      return zoomContainer.pan(currPanPos.x - 10, currPanPos.y)
    case CODES.ARROW_LEFT:
    case CODES.NUM_ARROW_LEFT:
      return zoomContainer.pan(currPanPos.x + 10, currPanPos.y)
    case CODES.ARROW_UP:
    case CODES.NUM_ARROW_UP:
      return zoomContainer.pan(currPanPos.x, currPanPos.y + 10)
    case CODES.ARROW_DOWN:
    case CODES.NUM_ARROW_DOWN:
      return zoomContainer.pan(currPanPos.x, currPanPos.y - 10)
    case CODES.C_KEY:
      if (event.ctrlKey) return copySelectedChart();
      else return;
    case CODES.S_KEY:
      if (event.ctrlKey) return saveProject();
      else return;
    case CODES.R_KEY:
      if (event.ctrlKey) return reloadFiles(undefined, elemTypes[pageType][0]);
      else return reloadFiles(getSelectedFile(elemTypes[pageType][0]), elemTypes[pageType][0]);
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
      document.getElementById('pca-pca-btn').click();
      document.getElementById('pca-pca-text-input').focus();
      return;
    case CODES.G_KEY:
      if ($('#gc-btn').is(":focus")) $('#gc-btn').blur();
      else $('#gc-btn').focus();
      document.getElementById(pageType + '-gc-btn').click();
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
      document.getElementById(pageType + '-f-btn').click();
      document.getElementById(pageType + '-f-text-input').focus();
      return;
    case CODES.M_KEY:
      if ($('#stat-m-btn').is(":focus")) $('#stat-m-btn').blur();
      else $('#stat-m-btn').focus();
      document.getElementById(pageType + '-m-btn').click();
      document.getElementById(pageType + '-m-text-input').focus();
      return;
    case CODES.E_KEY:
      if ($('#erase-btn').is(":focus")) $('#erase-btn').blur();
      else $('#erase-btn').focus();
      document.getElementById(pageType + '-erase-text-input').placeholder = "1,2,3 or 1-" + (file[elems][file[elems].length - 1].index + 1);
      document.getElementById(pageType + '-erase-btn').click();
      document.getElementById(pageType + '-erase-text-input').focus();
      return;
    case CODES.A_KEY:
      if ($('#reverse-btn').is(":focus")) $('#reverse-btn').blur();
      else $('#reverse-btn').focus();
      document.getElementById(pageType + '-reverse-text-input').placeholder = "1,2,3 or 1-" + (file[elems][file[elems].length - 1].index + 1);
      document.getElementById(pageType + '-reverse-btn').click();
      document.getElementById(pageType + '-reverse-text-input').focus();
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
    case CODES.C_KEY:
      return switchToCenter(false, 0, pageType);
  }

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

  Highcharts.chart(ChartContainersPCA[0], stereoPCA.options);
  Highcharts.chart(ChartContainersPCA[1], zijdPCA.options);
  Highcharts.chart(ChartContainersPCA[2], intensPCA.options);

  // redrawCharts(false);

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

  var tableHeader = new Array(
    "  <thead class='thead-light fixed-header' style='vertical-align: middle;'>",
    "    <tr>",
    "      <th>\
           <button disabled class='btn' style='padding: 0; opacity: 1; font-size: inherit;'><i class='fas fa-yin-yang'></i></button>\
           <button onclick='reversePolarity()' class='btn btn-link' style='padding: 0; font-size: inherit;'><i class='fal fa-sync-alt'></i></button>\
           </th>",
    "      <th>\
           <button disabled class='btn' style='padding: 0; opacity: 1; font-size: inherit;'><i class='fad fa-eraser'></i></button>\
           <button onclick='reverseVisibility()' class='btn btn-link' style='padding: 0; font-size: inherit;'><i class='fal fa-sync-alt'></i></button>\
           </th>",
    "      <th>#</th>",
    "      <th>ID</th>",
    "      <th>" + dName + "</th>",
    "      <th>" + iName + "</th>",
    "      <th>MAD</th>",
    "      <th>Comment</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  var tableRows = collection.interpretations.map(function(interpretation, i) {

    var rowClassHidden = '', rowClassReversed = '', rowClass = '', rowTitle = '';
    var rowTitle = '';
    var num = interpretation.index + 1;
    var dotVisibleTitle = '<span title="Erase interpretation">';
    var dotVisibleIcon = '<i class="fad fa-eraser"></i>';
    var dorAntipodeTitle = '<span title="Reverse interpretation polarity">';
    var dotAntipodeIcon = '<i class="fas fa-yin-yang"></i>';

    if (interpretation.reversed) {
      rowClassReversed = 'erase-row text-muted';
      dotAntipodeIcon = '<i class="fas fa-yin-yang" style="transform: rotate(180deg);"></i>';
    }

    if (!interpretation.visible) {
      rowClassHidden = 'erase-row text-muted';
      num = '-';
      dotVisibleTitle = '<span title="Redraw interpretation">';
      dotVisibleIcon = '<i class="fad fa-pencil"></i>';
      rowTitle = 'Interpretation erased';
    }

    if (interpretation.hover) {
      rowClass = 'hover-row';
    }

    var position = 'normal';
    if (interpretation.reversed) position = 'reversed';
    var dec = interpretation[COORDINATES.stat].dec[position].toFixed(ROUND_NUM);
    var inc = interpretation[COORDINATES.stat].inc[position].toFixed(ROUND_NUM);
    var mad = interpretation[COORDINATES.stat].mad.toFixed(ROUND_NUM);

    if (inc < 0) inc = "<span class='text-danger'>" + inc + "</span>";
    return [
      "    <tr class='" + rowClass + "' title='" + rowTitle + "'>",
      "      <td class='" + rowClassReversed + "'>" + dorAntipodeTitle + "<button onclick='reverseDot(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotAntipodeIcon + "</button></span></td>",
      // "      <td><input type='checkbox' id='" + interpretation.id + "' class='chkbox' value='1'/></td>",
      // "      <td><input type='checkbox' class='chkbox1' value='" + i + "'/></td>",
      "      <td class='" + rowClassHidden + "'>" + dotVisibleTitle + "<button onclick='eraseStep(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotVisibleIcon + "</button></span></td>",
      "      <td>" + num + "</td>",
      "      <td>" + interpretation.id + "</td>",
      "      <td>" + dec + "</td>",
      "      <td>" + inc + "</td>",
      "      <td>" + mad + "</td>",
      "      <td>" + interpretation.comment + "</td>",
      "    </tr>",
    ].join("\n");

  });

  var tableFooter = "</tbody>";

  document.getElementById("collection-table-container").innerHTML = tableHeader + tableRows.join("\n") + tableFooter;

}

function formatSpecimenTable() {
  console.log('hello there');
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
    "      <th>\
           <button disabled class='btn' style='padding: 0; opacity: 1; font-size: inherit;'><i class='fad fa-eraser'></i></button>\
           <button onclick='reverseVisibility()' class='btn btn-link' style='padding: 0; font-size: inherit;'><i class='fal fa-sync-alt'></i></button>\
           </th>",
    "      <th>#</th>",
    "      <th>Step</th>",
    "      <th>" + dName + "</th>",
    "      <th>" + iName + "</th>",
    "      <th>MAG</th>",
    "      <th>a95</th>",
    "      <th>Comment</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  var tableRows = specimen.steps.map(function(step, i) {

    var volume = (specimen.volume) ? specimen.volume : 1;

    var direction = inReferenceCoordinates(COORDINATES.pca, specimen, new Coordinates(step.x, step.y, step.z)).toVector(Direction);
    var intensity = (direction.length / volume).toExponential(2);
    var dec = direction.dec.toFixed(ROUND_NUM);
    var inc = direction.inc.toFixed(ROUND_NUM);
    if (inc < 0) inc = "<span class='text-danger'>" + inc + "</span>";
    var rowClass = '';
    var rowTitle = '';
    var num = step.index + 1;
    var stepVisibleTitle = '<span title="Erase step">';
    var stepVisibleIcon = '<i class="fad fa-eraser"></i>';
    if (!step.visible) {
      rowClass = 'erase-row text-muted';
      num = '-';
      stepVisibleTitle = '<span title="Redraw step">';
      stepVisibleIcon = '<i class="fad fa-pencil"></i>';
      rowTitle = 'Step erased';
    }
    if (step.hover) {
      rowClass = 'hover-row';
    }

    return [
      "    <tr class='" + rowClass + "' title='    " + rowTitle + "'>",
      "      <td>" + stepVisibleTitle + "<button onclick='eraseStep(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + stepVisibleIcon + "</button></span></td>",
      "      <td>" + num + "</td>",
      "      <td>" + step.step + "</td>",
      "      <td>" + dec + "</td>",
      "      <td>" + inc + "</td>",
      "      <td>" + intensity + "</td>",
      "      <td>" + step.error.toFixed(ROUND_NUM) + "</td>",
      "      <td>" + step.comment + "</td>",
      "    </tr>",
    ].join("\n");
  });

  var tableFooter = "</tbody>";

  document.getElementById("specimen-table-container").innerHTML = tableHeader + tableRows.join("\n") + tableFooter;

}

function formatSitesTable() {

  var sitesSet = getSelectedFile('sitesSet');

  if (!sitesSet) return document.getElementById('sites-table-container').innerHTML = '';

  var tableHeader = new Array(
    "  <thead class='thead-light fixed-header'>",
    "    <tr>",
    "      <th>\
           <button disabled class='btn' style='padding: 0; opacity: 1; font-size: inherit;'><i class='fas fa-yin-yang'></i></button>\
           <button onclick='reversePolarity()' class='btn btn-link' style='padding: 0; font-size: inherit;'><i class='fal fa-sync-alt'></i></button>\
           </th>",
    "      <th>\
           <button disabled class='btn' style='padding: 0; opacity: 1; font-size: inherit;'><i class='fad fa-eraser'></i></button>\
           <button onclick='reverseVisibility()' class='btn btn-link' style='padding: 0; font-size: inherit;'><i class='fal fa-sync-alt'></i></button>\
           </th>",
    "      <th>#</th>",
    "      <th>ID</th>",
    "      <th>N</th>",
    "      <th>Dgeo</th>",
    "      <th>Igeo</th>",
    "      <th>kg</th>",
    "      <th>a95g</th>",
    "      <th>Dstrat</th>",
    "      <th>Istrat</th>",
    "      <th>ks</th>",
    "      <th>a95s</th>",
    "      <th>Code</th>",
    "      <th>Steps</th>",
    "      <th>Site Lon</th>",
    "      <th>Site Lat</th>",
    "      <th>Comment</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  var tableRows = sitesSet.sites.map(function(site, i) {

    var position = 'normal';
    if (site.reversed) position = 'reversed';

    var Dgeo = site.geographic.dec[position].toFixed(ROUND_NUM);
    var Igeo = site.geographic.inc[position].toFixed(ROUND_NUM);
    var Dstrat = site.tectonic.dec[position].toFixed(ROUND_NUM);
    var Istrat = site.tectonic.inc[position].toFixed(ROUND_NUM);
    if (Igeo < 0) Igeo = "<span class='text-danger'>" + Igeo + "</span>";
    if (Istrat < 0) Istrat = "<span class='text-danger'>" + Istrat + "</span>";

    var rowClassHidden = '', rowClassReversed = '', rowClass = '', rowTitle = '';
    var rowTitle = '';
    var num = site.index + 1;
    var dotVisibleTitle = '<span title="Erase site">';
    var dotVisibleIcon = '<i class="fad fa-eraser"></i>';
    var dorAntipodeTitle = '<span title="Reverse site polarity">';
    var dotAntipodeIcon = '<i class="fas fa-yin-yang"></i>';

    if (site.reversed) {
      rowClassReversed = 'erase-row text-muted';
      dotAntipodeIcon = '<i class="fas fa-yin-yang" style="transform: rotate(180deg);"></i>';
    }

    if (!site.visible) {
      rowClassHidden = 'erase-row text-muted';
      num = '-';
      dotVisibleTitle = '<span title="Redraw site">';
      dotVisibleIcon = '<i class="fad fa-pencil"></i>';
      rowTitle = 'Site erased';
    }

    if (site.hover) {
      rowClass = 'hover-row';
    }

    return [
      "    <tr class='" + rowClass + "' title='    " + rowTitle + "'>",
      "      <td class='" + rowClassReversed + "'>" + dorAntipodeTitle + "<button onclick='reverseDot(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotAntipodeIcon + "</button></span></td>",
      "      <td class='" + rowClassHidden + "'>" + dotVisibleTitle + "<button onclick='eraseStep(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotVisibleIcon + "</button></span></td>",
      "      <td>" + num + "</td>",
      "      <td>" + site.id + "</td>",
      "      <td>" + site.n + "</td>",
      "      <td>" + Dgeo + "</td>",
      "      <td>" + Igeo + "</td>",
      "      <td>" + site.geographic.k + "</td>",
      "      <td>" + site.geographic.a95.toFixed(ROUND_NUM) + "</td>",
      "      <td>" + Dstrat + "</td>",
      "      <td>" + Istrat + "</td>",
      "      <td>" + site.tectonic.k + "</td>",
      "      <td>" + site.tectonic.a95.toFixed(ROUND_NUM) + "</td>",
      "      <td>" + site.code + "</td>",
      "      <td>" + site.stepRange + "</td>",
      "      <td class='TableInput' contenteditable='true' style='cursor: pointer;' title='' id='" + (num - 1) + "-sLon'>" + site.sLon + "</td>",
      "      <td class='TableInput' contenteditable='true' style='cursor: pointer;' title='' id='" + (num - 1) + "-sLat'>" + site.sLat + "</td>",
      "      <td>" + site.comment + "</td>",
      "    </tr>",
    ].join("\n");
  });

  var tableFooter = "</tbody>";

  document.getElementById("sites-table-container").innerHTML = tableHeader + tableRows.join("\n") + tableFooter;

  formatVGPTable();

}

function sitesTableClickHandler(event) {

  var sitesSet = getSelectedFile('sitesSet');
  var siteNum = event.target.id.split('-')[0];
  var siteElem = event.target.id.split('-')[1];

  sitesSet.sites[siteNum][siteElem] = Number(document.getElementById(event.target.id).innerHTML);

  // if ((sitesSet.sites[siteNum].sLat > 0) && (sitesSet.sites[siteNum].sLon > 0))
  formatVGPTable();

  saveLocalStorage();

}

function formatVGPTable() {

  var VGPs = sitesSetToVGP();

  if (!VGPs) return document.getElementById('vgp-table-container').innerHTML = '';

  var tableHeader = new Array(
    "  <thead class='thead-light fixed-header'>",
    "    <tr>",
    "      <th>\
           <button disabled class='btn' style='padding: 0; opacity: 1; font-size: inherit;'><i class='fas fa-yin-yang'></i></button>\
           <button onclick='reversePolarity()' class='btn btn-link' style='padding: 0; font-size: inherit;'><i class='fal fa-sync-alt'></i></button>\
           </th>",
    "      <th>\
           <button disabled class='btn' style='padding: 0; opacity: 1; font-size: inherit;'><i class='fad fa-eraser'></i></button>\
           <button onclick='reverseVisibility()' class='btn btn-link' style='padding: 0; font-size: inherit;'><i class='fal fa-sync-alt'></i></button>\
           </th>",
    "      <th>#</th>",
    "      <th>pole lat</th>",
    "      <th>pole lon</th>",
    "      <th>paleoLat</th>",
    "      <th>dp</th>",
    "      <th>dm</th>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
  ).join("\n");

  var tableRows = VGPs.map(function(vgp, i) {

    if (!vgp) return;

    var rowClassHidden = '', rowClassReversed = '', rowTitle = '';
    var rowTitle = '';
    var num = vgp.index + 1;
    var dotVisibleTitle = '<span title="Erase site">';
    var dotVisibleIcon = '<i class="fad fa-eraser"></i>';
    var dorAntipodeTitle = '<span title="Reverse site polarity">';
    var dotAntipodeIcon = '<i class="fas fa-yin-yang"></i>';

    if (vgp.reversed) {
      rowClassReversed = 'erase-row text-muted';
      dotAntipodeIcon = '<i class="fas fa-yin-yang" style="transform: rotate(180deg);"></i>';
    }

    if (!vgp.visible) {
      rowClassHidden = 'erase-row text-muted';
      num = '-';
      dotVisibleTitle = '<span title="Redraw site">';
      dotVisibleIcon = '<i class="fad fa-pencil"></i>';
      rowTitle = 'Site erased';
    }

    var system = 'geo';
    if (COORDINATES.poles == 'tectonic') system = 'strat';

    return [
      "    <tr class='' title=''>",
      "      <td class='" + rowClassReversed + "'>" + dorAntipodeTitle + "<button onclick='reverseDot(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotAntipodeIcon + "</button></span></td>",
      "      <td class='" + rowClassHidden + "'>" + dotVisibleTitle + "<button onclick='eraseStep(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotVisibleIcon + "</button></span></td>",
      "      <td>" + num + "</td>",
      "      <td>" + vgp[system].lat.toFixed(2) + "</td>",
      // "      <td>" + vgp.strat.lat.toFixed(2) + "</td>",
      "      <td>" + vgp[system].lng.toFixed(2) + "</td>",
      // "      <td>" + vgp.strat.lng.toFixed(2) + "</td>",
      "      <td>" + vgp[system].pLat.toFixed(2) + "</td>",
      // "      <td>" + vgp.strat.pLat.toFixed(2) + "</td>",
      "      <td>" + vgp[system].dp.toFixed(2) + "</td>",
      // "      <td>" + vgp.strat.dp.toFixed(2) + "</td>",
      "      <td>" + vgp[system].dm.toFixed(2) + "</td>",
      // "      <td>" + vgp.strat.dm.toFixed(2) + "</td>",
      "    </tr>",
    ].join("\n");
  })

  // var poleRow = [
  //   "    <tr class='' title=''>",
  //   "      <td class='" + rowClassReversed + "'>" + dorAntipodeTitle + "<button onclick='reverseDot(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotAntipodeIcon + "</button></span></td>",
  //   "      <td class='" + rowClassHidden + "'>" + dotVisibleTitle + "<button onclick='eraseStep(" + i + ")' class='btn btn-sm btn-link' style='padding: 0;'>" + dotVisibleIcon + "</button></span></td>",
  //   "      <td>" + pole.lat.toFixed(2) + "</td>",
  //   "      <td>" + pole.lng.toFixed(2) + "</td>",
  //   "      <td>" + pole.pLat.toFixed(2) + "</td>",
  //   "      <td>" + pole.dp.toFixed(2) + "</td>",
  //   "      <td>" + pole.dm.toFixed(2) + "</td>",
  //   "    </tr>",
  // ].join("\n");

  var tableFooter = "</tbody>";
  if (tableRows[0] == undefined) document.getElementById("vgp-table-container").innerHTML = tableHeader + tableFooter;
  else document.getElementById("vgp-table-container").innerHTML = tableHeader + tableRows.join("\n") + tableFooter;

  var hover = false, update = true;
  stereoPoles = polesPlotStereoDiagrams(hover, update);
  chartsToExport = [stereoPoles.sites, stereoPoles.vgps];

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
  var sitesSet = getSelectedFile('sitesSet');

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
  else if (page == 'poles') {
    if (!sitesSet) return document.getElementById('sitesMean-table-container').innerHTML = '';

    if (sitesSet.means.length === 0) {
      ipcRenderer.send('reload-meansDataWin');
      document.getElementById("sitesMean-table-container").innerHTML = ERROR_NO_MEANS;
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
    "      <th>N</th>",
    "      <th>Dg</th>",
    "      <th>Ig</th>",
    "      <th>Ds</th>",
    "      <th>Is</th>",
    "      <th>MAD</th>",
    "      <th>Code</th>",
    "      <th>Steps</th>",
    "    </tr>",
    "  </thead>",
  ).join("\n");

  var tableHeaderStat = new Array(
    "<table class='table text-center table-sm small-table-elem table-bordered w-100 small' style='margin: 0; max-height: 100%;'>",
    //"<table id='interpretDataTable' class='table table-sm table-bordered w-100 small text-center' style='text-align: center!important; margin: 0;'>",
    "  <thead class='thead-light'>",
    "    <tr>",
    "      <th><button onclick='deleteAllResults(" + undefined + ',' + '"' + page + '"' + ")' title='Delete all means' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-trash-alt'></i></button></th>",
    // "      <th>ID</th>",
    "      <th>N</th>",
    "      <th>Dg</th>",
    "      <th>Ig</th>",
    "      <th>kg</th>",
    "      <th>a95g</th>",
    "      <th>Ds</th>",
    "      <th>Is</th>",
    "      <th>ks</th>",
    "      <th>a95s</th>",
    "      <th>Code</th>",
    "      <th>Steps</th>",
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
      var mad = interpretation.MAD.toFixed(ROUND_NUM);
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
        "    <td>" + N + "</td>",
        "    <td>" + directionGeo.dec.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + directionGeo.inc.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + directionTect.dec.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + directionTect.inc.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + mad + "</td>",
        "    <td>" + code + "</td>",
        "    <td>" + interpretation.steps[0].step + '-' + interpretation.steps[N-1].step + "</td>",
        "  </tr>"
      ].join("\n");

    });
  }
  else if (page == 'stat') {
    rows = collection.means.map((mean, i) => {

      // Get the mean in the right reference frame
      var dirType = 'normal';
      if (DIRECTION_MODE == 'reversed') dirType = 'reversed';

      var directionSpec = mean.specimen;
      var directionGeo = mean.geographic;
      var directionStrat = mean.tectonic;

      // Handle comments on mean
      if (mean.comment === null) comment = ChRM_COMMENT;
      else comment = mean.comment;

      // Full code of mean
      var code = mean.code;

      // a95 angle (if forced this is unreliable)
      // var a95 = mean.a95.toFixed(ROUND_NUM);
      var a95g = directionGeo.a95.toFixed(ROUND_NUM);
      var a95s = directionStrat.a95.toFixed(ROUND_NUM);
      if((mean.code == 'GC') || (mean.code == 'GCn')) {
        a95g = "<span class='text-primary' title='The MAD for anchored components is unreliable'>" + a95g + "</span>";
        a95s = "<span class='text-primary' title='The MAD for anchored components is unreliable'>" + a95s + "</span>";
      }
      var kg = (directionGeo.k) ? directionGeo.k.toFixed(ROUND_NUM): "<span class='text-primary' title='The k for Bingham distribution is ambiguous'>" + '?' + "</span>";
      var ks = (directionStrat.k) ? directionStrat.k.toFixed(ROUND_NUM): "<span class='text-primary' title='The k for Bingham distribution is ambiguous'>" + '?' + "</span>";

      // Number of dots
      var N = mean.dots.length;

      return [
        "  </tr>",
        "    <td><button onclick='deleteAllResults(" + i + ',' + '"' + page + '"' + ")' title='Delete interpretation' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-minus-square'></i></button></td>",
        // "    <td>" + collection.name + "</td>",
        "    <td>" + N + "</td>",
        "    <td>" + directionGeo.dec.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + directionGeo.inc.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + kg + "</td>",
        "    <td>" + a95g + "</td>",
        "    <td>" + directionStrat.dec.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + directionStrat.inc.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + ks + "</td>",
        "    <td>" + a95s + "</td>",
        // "    <td>" + k + "</td>",
        // "    <td>" + a95 + "</td>",
        "    <td>" + code + "</td>",
        "    <td>" + '"' + 'site avg' + '"' + "</td>",
        "  </tr>"
      ].join("\n");

    })
  }
  else if (page == 'poles') {
    rows = sitesSet.means.map((mean, i) => {

      // Get the mean in the right reference frame
      var dirType = 'normal';
      if (DIRECTION_MODE == 'reversed') dirType = 'reversed';

      var directionGeo = mean.geographic;
      var directionStrat = mean.tectonic;

      // Handle comments on mean
      if (mean.comment === null) comment = ChRM_COMMENT;
      else comment = mean.comment;

      // Full code of mean
      var code = mean.code;

      // a95 angle (if forced this is unreliable)
      // var a95 = mean.a95.toFixed(ROUND_NUM);
      // if((mean.code == 'GC') || (mean.code == 'GCn')) {
      //   a95 = "<span class='text-primary' title='The MAD for anchored components is unreliable'>" + a95 + "</span>";
      // }
      // var k = (mean.k) ? mean.k.toFixed(ROUND_NUM) : "<span class='text-primary' title='The k for Bingham distribution is ambiguous'>" + '?' + "</span>";

      var a95g = directionGeo.a95.toFixed(ROUND_NUM);
      var a95s = directionStrat.a95.toFixed(ROUND_NUM);
      if((mean.code == 'GC') || (mean.code == 'GCn')) {
        a95g = "<span class='text-primary' title='The MAD for anchored components is unreliable'>" + a95g + "</span>";
        a95s = "<span class='text-primary' title='The MAD for anchored components is unreliable'>" + a95s + "</span>";
      }
      var kg = (directionGeo.k) ? directionGeo.k.toFixed(ROUND_NUM): "<span class='text-primary' title='The k for Bingham distribution is ambiguous'>" + '?' + "</span>";
      var ks = (directionStrat.k) ? directionStrat.k.toFixed(ROUND_NUM): "<span class='text-primary' title='The k for Bingham distribution is ambiguous'>" + '?' + "</span>";

      // Number of dots
      var N = mean.dots.length;

      return [
        "  </tr>",
        "    <td><button onclick='deleteAllResults(" + i + ',' + '"' + page + '"' + ")' title='Delete interpretation' class='btn btn-sm btn-link' style='padding: 0;'><i class='far fa-minus-square'></i></button></td>",
        // "    <td>" + sitesSet.name + "</td>",
        "    <td>" + N + "</td>",
        "    <td>" + directionGeo.dec.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + directionGeo.inc.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + kg + "</td>",
        "    <td>" + a95g + "</td>",
        "    <td>" + directionStrat.dec.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + directionStrat.inc.toFixed(ROUND_NUM) + "</td>",
        "    <td>" + ks + "</td>",
        "    <td>" + a95s + "</td>",
        "    <td>" + code + "</td>",
        "    <td>" + '"' + 'avg' + '"' + "</td>",
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
  else if (page == 'poles') {
  ipcRenderer.send('reload-meansDataWin');
    document.getElementById("sitesMean-table-container").innerHTML = tableHeaderStat + rows.join("\n") + tableFooter;
  }

}

function deleteAllResults(index, page) {

  /*
   * Function deleteAllInterpretations
   * Deletes all interpretations in a specimen
   */

  var specimen = getSelectedFile('specimen');
  var collection = getSelectedFile('collection');
  var sitesSet = getSelectedFile('sitesSet');

  if (page == 'pca') {
    if (index === undefined) specimen.interpretations = new Array();
    else specimen.interpretations.splice(index, 1);
  }
  else if (page == 'stat') {
    if (index === undefined) collection.means = new Array();
    else collection.means.splice(index, 1);
  }
  else if (page == 'poles') {
    if (index === undefined) sitesSet.means = new Array();
    else sitesSet.means.splice(index, 1);
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

  localStorage.setItem("sitesSets", JSON.stringify(sitesSets));
  if (sitesSets.length > 0) localStorage.setItem("selectedSitesSet", JSON.stringify(getSelectedFile('sitesSet')));

}

function clearLocalStorage() {

  if (settings.global.autoSave) return;
  localStorage.removeItem('specimens');
  localStorage.removeItem('selectedSpecimen');
  localStorage.removeItem('collections');
  localStorage.removeItem('selectedCollection');
  localStorage.removeItem('sitesSets');
  localStorage.removeItem('selectedSitesSet');
  localStorage.removeItem('settings');
  localStorage.removeItem('coordinates');
  localStorage.removeItem('dirMode');
  localStorage.removeItem('dataMode');
  localStorage.removeItem('projection');
  localStorage.removeItem('centered');
  localStorage.removeItem('currPage');
}

function updateLocalStorage() {
  settings = JSON.parse(localStorage.getItem("settings"));
  specimens = JSON.parse(localStorage.getItem("specimens"));
  collections = JSON.parse(localStorage.getItem("collections"));
}

function reloadFiles(file, type) {
  var allElems = {
    specimen: 'steps',
    collection: 'interpretations',
  }

  var page = {
    specimen: 'pca',
    collection: 'stat',
  }

  var elems = allElems[type];
  if (file) {
    file[elems].forEach((elem, i) => {
      elem.visible = true;
      elem.reversed = false;
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
          interpretation.reversed = false;
          interpretation.selected = false;
          interpretation.index = j;
        });
      });
    }
  }
  deleteAllResults(undefined, page[type]);
  mainContPanZoomPCA.reset();
  mainContPanZoomStat.reset();
  saveLocalStorage();
  if (type == "specimen") updateInterpretationTable("pca");
  if (type == 'collection') updateInterpretationTable("stat");
  if (type == 'sitesSet') updateInterpretationTable("poles");
  redrawCharts();
}

function redrawCharts(hover, context) {
  var time = performance.now();
  /*
  * Function redrawCharts
  * Redraws all the charts for the active specimen
  */
  if (!INITIALIZED) return;

  var currentPage = getSelectedPage();

  // if (INITIALIZE) {
  //   // Charts creating
  //   // pca
  //   zijdPCA = plotZijderveldDiagram(hover);
  //   stereoPCA = plotStereoDiagram(hover);
  //   intensPCA = plotIntensityDiagram(hover);
  //   // stat
  //   stereoStat = statPlotStereoDiagram();
  //   // poles
  //   stereoPoles = polesPlotStereoDiagrams();
  //   // Tables creating
  //   // pca
  //   formatSpecimenTable();
  //   updateInterpretationTable('pca');
  //   ipcRenderer.send('redraw-specDataWin');
  //   ipcRenderer.send('redraw-interpretDataWin');
  //   // stat
  //   formatCollectionTable();
  //   updateInterpretationTable('stat');
  //   ipcRenderer.send('redraw-collDataWin');
  //   ipcRenderer.send('redraw-meansDataWin');
  //   // poles
  //   formatSitesTable();
  //   updateInterpretationTable('poles');
  //   ipcRenderer.send('redraw-vgpDataWin');
  //   // save data
  //   switch (currentPage) {
  //     case 'nav-pca-tab':
  //       chartsToExport = [zijdPCA.chartObj, stereoPCA.chartObj, intensPCA.chartObj];
  //       break;
  //     case 'nav-stat-tab':
  //       chartsToExport = [stereoStat];
  //       break;
  //     case 'nav-poles-tab':
  //       chartsToExport = [stereoPoles.sites, stereoPoles.vgps];
  //       break;
  //   }
  //
  //   saveLocalStorage();
  //
  //   // additional highcharts charts data processing - deleting of unwanted points
  //   document.querySelectorAll('.highcharts-a11y-dummy-point').forEach(function(a) {
  //     a.remove();
  //   })
  //
  //   INITIALIZE = false;
  //
  //   return;
  // }
  //
  // // actual redraw
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
    if (chart == 'zijd-plot') plotZijderveldDiagram(hover);
    else if (chart == 'stereo-plot') plotStereoDiagram(hover);
    else if (chart == 'intensity-plot') plotIntensityDiagram();
    else if (chart == 'stat-plot') statPlotStereoDiagram();
  }
  else {
    switch (currentPage) {
      case 'nav-pca-tab':
        zijdPCA = plotZijderveldDiagram(hover);
        stereoPCA = plotStereoDiagram(hover);
        intensPCA = plotIntensityDiagram(hover);
        break;
      case 'nav-stat-tab':
        stereoStat = statPlotStereoDiagram();
        break;
      case 'nav-poles-tab':
        stereoPoles = polesPlotStereoDiagrams();
        break;
    }
  }

  // tables redraw and data saving
  var chartsToExport = [];
  switch (currentPage) {
    case 'nav-pca-tab':
      formatSpecimenTable();
      updateInterpretationTable('pca');
      ipcRenderer.send('redraw-specDataWin');
      ipcRenderer.send('redraw-interpretDataWin');
      chartsToExport = [zijdPCA.chartObj, stereoPCA.chartObj, intensPCA.chartObj];
      break;
    case 'nav-stat-tab':
      formatCollectionTable();
      updateInterpretationTable('stat');
      ipcRenderer.send('redraw-collDataWin');
      ipcRenderer.send('redraw-meansDataWin');
      chartsToExport = [stereoStat];
      break;
    case 'nav-poles-tab':
      formatSitesTable();
      updateInterpretationTable('poles');
      ipcRenderer.send('redraw-vgpDataWin');
      chartsToExport = [stereoPoles.sites, stereoPoles.vgps];
      break;
  }

  if (TO_CENTER) {
    var collection = getSelectedFile('collection');
    if (collection.means.length == 0) document.getElementById('calculate-f').innerHTML = 'Calculate Fisher mean first'
  }
  else {
    document.getElementById('calculate-f').innerHTML = '';
  }

  saveLocalStorage();

  // additional highcharts charts data processing - deleting of unwanted points
  document.querySelectorAll('.highcharts-a11y-dummy-point').forEach(function(a) {
    a.remove();
  })

}

function makeChartContextMenu(chart) {

  if ((chart == 'sites-plot') || (chart == 'vgps-plot')) chart = 'poles-plot';

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

  var highlightCheck = falseSymbol;
  if (settings[pageType][chartType + 'Highlight']) highlightCheck = trueSymbol;

  var hideCheck = falseSymbol;
  if (settings[pageType][chartType + 'Hide']) hideCheck = trueSymbol;

  var hoverCheck = falseSymbol;
  if (settings[pageType][chartType + 'Hover']) hoverCheck = trueSymbol;

  var errorCheck = falseSymbol;
  if (settings[pageType][chartType + 'Error']) errorCheck = trueSymbol;

  var numberCheck = falseSymbol;
  if (settings[pageType][pageType + 'NumberMode']) numberCheck = trueSymbol;

  var stepCheck = falseSymbol;
  if (settings[pageType][pageType + 'StepMode']) stepCheck = trueSymbol;

  var overlapCheck = falseSymbol;
  if (settings[pageType][pageType + 'AllowOverlap']) overlapCheck = trueSymbol;

  var outlineCheck = falseSymbol;
  if (settings[pageType][pageType + 'AddTextOutline']) outlineCheck = trueSymbol;

  var blockMouseOnZoomCheck = falseSymbol;
  if (settings.global.blockMouseOnZoom) blockMouseOnZoomCheck = trueSymbol;

  var dashedLinesCheck = falseSymbol;
  if (settings.global.dashedLines) dashedLinesCheck = trueSymbol;

  var dirCheck = falseSymbol;
  if (settings.stat.statDir) dirCheck = trueSymbol;

  var gcCheck = falseSymbol;
  if (settings.stat.statGC) gcCheck = trueSymbol;

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
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  (chartType + 'Hide') + '"' + ',' + false + ',' + typeStrPage + ")'>",
    hideCheck,
    "    Hide unselected",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' +  (chartType + 'Hover') + '"' + ',' + false + ',' + typeStrPage + ")'>",
    hoverCheck,
    "    Highlight on hover",
    "  </div>",
  ).join("\n");

  if ((chartType == 'stereo') || (chartType == 'stat') || (chartType == 'poles')) {
    var stereoSettings = new Array(
      "<hr>",
      "  <div class='item' onclick='toggleContextChartOption(" + '"' +  (chartType + 'Error') + '"' + ',' + false + ',' + typeStrPage + ")'>",
      errorCheck,
      "    Error circles",
      "  </div>",
      "  <div class='item' onclick='toggleContextChartOption(" + '"' + 'dashedLines' + '"' + ',' + false + ',' + typeStrGlobal + ")'>",
      dashedLinesCheck,
      "    Dashed lines",
      "  </div>",
    ).join("\n");

    currChartOpts += stereoSettings;
  }

  if (chartType == 'stat' || chartType == 'poles') {
    var statSettings = new Array(
      "<hr>",
      "  <div class='item' onclick='toggleContextChartOption(" + '"' +  ('statDir') + '"' + ',' + false + ',' + typeStrPage + ")'>",
      dirCheck,
      "    Show GC dirs",
      "  </div>",
      "  <div class='item' onclick='toggleContextChartOption(" + '"' + 'statGC' + '"' + ',' + false + ',' + typeStrPage + ")'>",
      gcCheck,
      "    Show GC",
      "  </div>",
    ).join("\n");

    currChartOpts += statSettings;
  }

  var allChartsOpts = new Array(
    "  <hr>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' + pageType +  'NumberMode' + '"' + ',' + true + ',' + typeStrPage + ")'>",
    numberCheck,
    "    Number mode",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' + pageType + 'StepMode' + '"' + ',' + true + ',' + typeStrPage + ")'>",
    stepCheck,
    "    Step mode",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' + pageType + 'AllowOverlap' + '"' + ',' + true + ',' + typeStrPage + ")'>",
    overlapCheck,
    "    Overlap",
    "  </div>",
    "  <div class='item' onclick='toggleContextChartOption(" + '"' + pageType + 'AddTextOutline' + '"' + ',' + true + ',' + typeStrPage + ")'>",
    outlineCheck,
    "    Outline",
    "  </div>",
  ).join("\n");

  var globalOpts = new Array(
    "  <hr>",
    // "  <div class='item' onclick='toggleContextChartOption(" + '"' +  'blockMouseOnZoom' + '"' + ',' + true + ',' + typeStrGlobal + ")'>",
    // blockMouseOnZoomCheck,
    // "    Block mouse",
    // "  </div>",
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

  ipcRenderer.send('reload-settWin');

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
   * Initializes the PMTools
   */
   console.log('ПРивет...')
  // load current page from localStorage
  var selectedPageID = (localStorage.getItem("currPage")) ? localStorage.getItem("currPage") : 'nav-pca-tab';
  document.getElementById(selectedPageID).click();

  // load some globals from localStorage
  lastOpenPath = localStorage.getItem("lastOpenPath");
  lastSavePath = localStorage.getItem("lastSavePath");

  var direction = JSON.parse(localStorage.getItem("direction"));
  var centered = JSON.parse(localStorage.getItem("dataMode"));
  var coordinates = JSON.parse(localStorage.getItem("coordinates"));
  var projection = JSON.parse(localStorage.getItem("projection"));

  DIRECTION_MODE = (direction) ? direction.data : "normal";
  // document.getElementById('stat-' + DIRECTION_MODE).click();
  MODES_COUNTER = (direction) ? direction.counter : 0;
  DATA_MODE = (centered) ? centered.data : "directions";
  // document.getElementById('stat-' + DATA_MODE).click();
  DATA_MODES_COUNTER = (centered) ? centered.counter : 0;
  COORDINATES = (coordinates) ? coordinates.data : {pca: 'geographic', stat: 'geographic', poles: 'geographic'};
  document.getElementById('pca-' + COORDINATES['pca']).click();
  document.getElementById('stat-' + COORDINATES['stat']).click();
  COORDINATES_COUNTER = (coordinates) ? coordinates.counter : { pca: 0, stat: 0}
  PROJECTION = (projection) ? projection.data : "upwest";
  document.getElementById('input-' + PROJECTION).click();
  PROJECTIONS_COUNTER = (projection) ? projection.counter : 0;

  // allow to redraw charts
  INITIALIZED = true;
  INITIALIZE = true;

  // Load specimens from local storage
  specimens = JSON.parse(localStorage.getItem("specimens"));
  collections = JSON.parse(localStorage.getItem("collections"));
  sitesSets = JSON.parse(localStorage.getItem("sitesSets"));

  // var disableOpenPrev = false;
  // // if there is no previous project then this button in OpenFiles window will be disabled
  // if ((specimens === null) && (collections === null) && (sitesSets === null)) {
  //   disableOpenPrev = true;
  // }

  if ((specimens === null) && (collections === null) && (sitesSets === null)) {
    return ipcRenderer.send('open-openFilesModal');
  }
  else ipcRenderer.send('hide-openFilesModal');

  if (specimens === null) specimens = new Array();
  if (collections === null) collections = new Array();
  if (sitesSets === null) sitesSets = new Array();
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

  registerEventHandlers();
  if (specimens.length > 0) updateFileSelect('specimen');
  if (collections.length > 0) updateFileSelect('collection');
  if (sitesSets.length > 0) updateFileSelect('sitesSet');

  // load current specimen and collection
  var selectedSpecimen = localStorage.getItem('selectedSpecimen');
  var specimenSelector = document.getElementById('specimen-select');
  if (selectedSpecimen && (selectedSpecimen != 'undefined')) selectedSpecimen = JSON.parse(selectedSpecimen);
  if ((specimens.length > 0) && selectedSpecimen) {
    for (let i = 0; i < specimens.length; i++) {
      if (specimens[i].name == selectedSpecimen.name) {
        specimenSelector.value  = i;
        break;
      }
    }
  }

  var selectedCollection = localStorage.getItem('selectedCollection');
  var collectionSelector = document.getElementById('collection-select');
  if (selectedCollection && (selectedCollection != 'undefined')) selectedCollection = JSON.parse(selectedCollection);
  if ((collections.length > 0) && selectedCollection) {
    for (let i = 0; i < collections.length; i++) {
      if (collections[i].name == selectedCollection.name) {
        collectionSelector.value = i;
        break;
      }
    }
  }

  dotSelector.reset();
}
// localStorage.clear();
// Some globals
var numSpec = 0, numColls = 0, numSiteSets = 0;

var ChartContainersPCA = ['container-left', 'container-center', 'container-right']
var COORDINATES_COUNTER = {
  pca: 0,
  stat: 0,
  poles: 0,
}

var COORDINATES = {
  pca: 'specimen',
  stat: 'geographic',
  poles: 'geographic',
}

var DIRECTION_MODE = "normal";
var MODES_COUNTER = 0;
var DATA_MODE = "directions";
var DATA_MODES_COUNTER = 0;
var TO_CENTER = false;
var PROJECTIONS_COUNTER = 0;
var PROJECTION = "upwest";
var ROUND_NUM = 1;

var zijdOnMain = document.getElementById('zijd-on-main');
var stereoOnMain = document.getElementById('stereo-on-main');
var intensityOnMain = document.getElementById('intensity-on-main');

var AVAILABLE_CHARTS = [zijdOnMain, stereoOnMain, intensityOnMain];

var GROUP = "ChRM";
var UPWEST = true;
var specimens = new Array();
var collections = new Array();
var sitesSets = new Array();
var lastOpenPath = app.getPath('documents');
var lastSavePath = app.getPath('documents');
var project_json;

var stereoPCA, zijdPCA, intensPCA, stereoStat, stereoPoles;
var stereoOptsPCA, zijdOptsPCA, intensOptsPCA;
var chartsToExport = [];

var dotSelector = new DotSelector();

const mainContainerPCA = document.getElementById('container-center');
const mainContainerStat = document.getElementById('stat-container-center');
const leftContainerPoles = document.getElementById('poles-container-left');
const rightContainerPoles = document.getElementById('poles-container-right');

var chartContainersIDList = [
  // pca containers selection
  "container-left",
  "container-right",
  "container-center",
  // stat container selection
  "stat-container-center",
  // poles containers selection
  "poles-container-left",
  "poles-container-right",
]

var panzoomSettings = {
  contain: 'outside',
  minScale: 1,
  maxScale: 10,
  rangeStep: 0.05,
  increment: 0.3,
  animate: false,
  zoomSpeed: 0.065,
  panOnlyWhenZoomed: true,
  beforeMouseDown: false,
  mouseWheelZoomEnabled: true,
  cursor: 'default',
}

const mainContPanZoomPCA = Panzoom(mainContainerPCA, panzoomSettings);
const mainContPanZoomStat = Panzoom(mainContainerStat, panzoomSettings);
const leftContPanZoomPoles = Panzoom(leftContainerPoles, panzoomSettings);
const rightContPanZoomPoles = Panzoom(rightContainerPoles, panzoomSettings);

const elemTypes = {
  pca: ['specimen', 'steps', mainContainerPCA],
  stat: ['collection', 'interpretations', mainContainerStat],
  poles: ['sitesSet', 'sites', leftContainerPoles, rightContainerPoles],
}

const zoomContTypes = {
  pca: mainContPanZoomPCA,
  stat: mainContPanZoomStat,
  poles: [leftContPanZoomPoles, rightContPanZoomPoles],
}

function panzoom_mousewheel() {

  var pageID = getSelectedPage();
  var pageType = pageID.split('-')[1];

  var delta = event.delta || event.wheelDelta;
  var zoomOut = delta ? delta < 0 : event.originalEvent.deltaY > 0;

  var zoomContainer = zoomContTypes[pageType];
  if (pageType == 'poles') {
    if (document.getElementById("poles-container-right").classList.contains("selected")) {
      zoomContainer = zoomContainer[1];
    }
    else zoomContainer = zoomContainer[0];
  }
  // DON'T DELETE ME!!!
  // if you will update modules and then it accidently stops working
  // probably problem with minScale in node_modules/@panzoom/panzoom/dist/panzoom.js function constrainScale(toScale, zoomOptions)
  // if it is then you must change code in this function like this:
  // result.scale = Math.min(Math.max(toScale, (opts.minScale) ? opts.minScale : 1), opts.maxScale);
  var scale = zoomContainer.getScale();
  if (zoomOut) {
    scale -= 0.1;
    if (scale < 1) scale = 1;
  }
  else {
    scale += 0.1;
    if (scale > 10) scale = 10;
  }

  zoomContainer.zoomToPoint(scale, { clientX: event.clientX, clientY: event.clientY });

}

document.getElementById('container-center').addEventListener('wheel', panzoom_mousewheel);
// $('#container-center').on('mousewheel', panzoom_mousewheel);
$('#stat-container-center').on('mousewheel', panzoom_mousewheel);
$('#poles-container-left').on('mousewheel', panzoom_mousewheel);
$('#poles-container-right').on('mousewheel', panzoom_mousewheel);

document.getElementById("append-input").checked = settings.global.appendFiles;

// Renderer opertaions

ipcRenderer.on('give-selected-specimen', (event) => {
  ipcRenderer.send('hold-selected-specimen', getSelectedFile('specimen'))
})

var INITIALIZED = false;

ipcRenderer.on('init', (event, formats) => {
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

  openCorresponindgPage(formats);
})

ipcRenderer.on('clear-storage', () => {
  clearLocalStorage();
})

ipcRenderer.on('import-files', () => {
  importFiles();
})

ipcRenderer.on('import-project', () => {
  importProject();
})

ipcRenderer.on('reload-appendFiles', () => {
  updateLocalStorage();
  document.getElementById("append-input").checked = settings.global.appendFiles;
})

ipcRenderer.on('open-in-next-tab', (event, savePath) => {
  ipcRenderer.send('hide-interpretData');
  ipcRenderer.send('hide-meansData');

  var files = [{
    name: savePath.replace(/^.*[\\\/]/, ''),
    path: savePath,
    data: fs.readFileSync(savePath, "utf8"),
  }];

  loadCollectionFileCallback(files, false);
})

__init__();
resizeTables();

// Files

function getSelectedFile(type, addID) {

  var file = {
    specimen: specimens,
    collection: collections,
    sitesSet: sitesSets,
  }

  if (file[type].length == 0) return undefined
  // if ((type == 'specimen') && specimens.length == 0) return undefined;
  // if ((type == 'collection') && collections.length == 0) return undefined;
  // if ((type == 'sitesSet') && sitesSet.length == 0) return undefined;

  var scrollerID = type + '-select';
  // if (type == 'specimen') scrollerID = 'specimen-select';
  // else if (type == 'collection') scrollerID = 'collection-select';
  // else if (type == 'sitesSet') scrollerID = 'sitesSet-select';

  const selectElement = document.getElementById(scrollerID);

  var selectedIndex = selectElement.selectedIndex;

  if (selectedIndex === -1) return null;

  document.getElementById(type + '-file-path').innerHTML = file[type][selectedIndex].path;
  // localStorage.setItem("selectedSpecimen", JSON.stringify(specimens[selectedIndex]));
  if (addID) return {data: file[type][selectedIndex], id: selectedIndex}
  return file[type][selectedIndex];

  // if (type == 'specimen') {
  //   document.getElementById(type + '-file-path').innerHTML = specimens[selectedIndex].path;
  //   // localStorage.setItem("selectedSpecimen", JSON.stringify(specimens[selectedIndex]));
  //   if (addID) return {data: specimens[selectedIndex], id: selectedIndex}
  //   return specimens[selectedIndex];
  // }
  // else {
  //   document.getElementById(type + '-file-path').innerHTML = collections[selectedIndex].path;
  //   // localStorage.setItem("selectedCollection", JSON.stringify(collections[selectedIndex]));
  //   if (addID) return {data: collections[selectedIndex], id: selectedIndex};
  //   return collections[selectedIndex];
  // }

}

function handleFileScroll(direction, scrollerID) {

  /*
   * Function handleFileScroll
   * Handles scrolling of the file selection box in both directions
   */
  const selectElement = document.getElementById(scrollerID);
  const options = selectElement.getElementsByTagName("option");

  // Zero or one sample: do nothing
  if(options.length < 2) {
    return;
  }

  // Get the currently selected index
  var selectedIndex = selectElement.selectedIndex;

  // Scrolling logic
  var newIndex = selectedIndex + direction;

  if(newIndex === -1) {
    newIndex = options.length - 1;
  }

  // Select the new index
  options[newIndex % options.length].selected = "selected";

  // Manually dispatch a change event
  selectElement.dispatchEvent(new Event("change"));

  localStorage.setItem("selectedSpecimen", JSON.stringify(getSelectedFile('specimen')));
  localStorage.setItem("selectedCollection", JSON.stringify(getSelectedFile('collection')));
  localStorage.setItem("selectedSitesSet", JSON.stringify(getSelectedFile('sitesSet')));

  // Change spec DataTable when arrowLeft/Right clicked
  ipcRenderer.send('redraw-specDataWin')
  ipcRenderer.send('redraw-collDataWin')
  // redrawCharts();
  saveLocalStorage();

}

function resetFileHandler(type) {

  /*
   * Function resetSpecimenHandler
   * Handler for when a new specimen is selected
   */
  var file = getSelectedFile(type);

  if (file === null) return;

  document.getElementById(type + '-file-path').innerHTML = file.path;

  if (type == 'specimen') {
    localStorage.setItem("selectedSpecimen", JSON.stringify(getSelectedFile('specimen')));
    ipcRenderer.send('redraw-specDataWin');
  }
  else if (type == 'collection') {
    localStorage.setItem("selectedCollection", JSON.stringify(getSelectedFile('collection')));
    ipcRenderer.send('redraw-collDataWin');
  }
  else if (type == 'sitesSet') {
    localStorage.setItem("selectedSitesSet", JSON.stringify(getSelectedFile('sitesSet')));
    // ipcRenderer.send('redraw-collDataWin');
  }

  // Change spec DataTable when arrowLeft/Right clicked

  redrawCharts();
  saveLocalStorage();

}

function updateFileSelect(type, index, id) {

  /*
   * Function updateSpecimenSelect
   * Updates the specimenSelector with new samples
   */

  var elemID = (id) ? id : type + '-select';
  var scrollerElem = document.getElementById(elemID);
  removeOptions(scrollerElem);

  JSON.parse(localStorage.getItem(type + 's')).forEach((file, i) => {
    var option = document.createElement('option');

    option.text = file.name;
    option.value = i;
    file.index = i;

    scrollerElem.add(option);
  });

  scrollerElem.selectedIndex = index || 0;
  // saveLocalStorage();

}

function removeOptions(selectbox) {

  /*
   * Function removeOptions
   * Removes options from a select box
   */

  Array.from(selectbox.options).forEach(function(x) {
    selectbox.remove(x);
  });

}

// Pages

function getSelectedPage() {

  var pageSelector =  document.getElementById('page-selector');
  return currentPage = pageSelector.getElementsByClassName('active')[0].id;

}

function handlePageScroll(direction) {
  const pages = [
    'nav-pca-tab',
    'nav-stat-tab',
    'nav-poles-tab'
  ]

  currentPage = getSelectedPage();

  // Find current page and click on next/prev page (depend on direction)
  for (let i = 0; i < pages.length; i++) {
    if (pages[i] == currentPage) {
      nextPageNum = (i + direction)  % pages.length;
      if (nextPageNum == -1) nextPageNum = pages.length - 1;
      return document.getElementById(pages[nextPageNum]).click();
    }
  }

}

function openCorresponindgPage(formats) {

  if (formats.length > 0) {
    corrFormat = formats[formats.length - 1].toLowerCase();
    if (corrFormat == 'pmd' || corrFormat == 'rmg' || corrFormat == 'paleomac' || corrFormat == 'jra' || corrFormat == 'jr5') {
      document.getElementById('nav-pca-tab').click();
    }
    else if (corrFormat == 'pmm' || corrFormat == 'dir' || corrFormat == 'csv_dir') {
      document.getElementById('nav-stat-tab').click();
    }
    else if (corrFormat == 'csv_poles') {
      document.getElementById('nav-poles-tab').click();
    }
  }

}

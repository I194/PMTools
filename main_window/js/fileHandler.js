// Files

function getSelectedFile(type, addID) {

  if ((type == 'specimen') && specimens.length == 0) return undefined;
  if ((type == 'collection') && collections.length == 0) return undefined;

  var scrollerID;
  if (type == 'specimen') scrollerID = 'specimen-select';
  else if (type == 'collection') scrollerID = 'collection-select';

  const selectElement = document.getElementById(scrollerID);

  var selectedIndex = selectElement.selectedIndex;

  if (selectedIndex === -1) return null;

  if (type == 'specimen') {
    document.getElementById(type + '-file-path').innerHTML = specimens[selectedIndex].path;
    // localStorage.setItem("selectedSpecimen", JSON.stringify(specimens[selectedIndex]));
    if (addID) return {data: specimens[selectedIndex], id: selectedIndex}
    return specimens[selectedIndex];
  }
  else {
    document.getElementById(type + '-file-path').innerHTML = collections[selectedIndex].path;
    // localStorage.setItem("selectedCollection", JSON.stringify(collections[selectedIndex]));
    if (addID) return {data: collections[selectedIndex], id: selectedIndex};
    return collections[selectedIndex];
  }

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

  // Change spec DataTable when arrowLeft/Right clicked
  ipcRenderer.send('redraw-specDataWin')
  ipcRenderer.send('redraw-collDataWin')
  redrawCharts();
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
  else {
    localStorage.setItem("selectedCollection", JSON.stringify(getSelectedFile('collection')));
    ipcRenderer.send('redraw-collDataWin');
  }

  // Change spec DataTable when arrowLeft/Right clicked

  redrawCharts();
  saveLocalStorage();

}

function updateFileSelect(type, index) {

  /*
   * Function updateSpecimenSelect
   * Updates the specimenSelector with new samples
   */
  var scrollerElem = document.getElementById(type + '-select');
  removeOptions(scrollerElem);

  JSON.parse(localStorage.getItem(type + 's')).forEach((x, i) => {
    var option = document.createElement('option');

    option.text = x.name;
    option.value = i;
    x.index = i;

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
    // 'nav-poles-tab'
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

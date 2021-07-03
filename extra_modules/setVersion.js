var VERSION = "0.9.25";

function setVersion() {
  var versionLines = document.getElementsByClassName("pmtools-version");
  for (let i = 0; i < versionLines.length; i++) {
    var splittedVLine = versionLines[i].textContent.split('v');
    versionLines[i].textContent = splittedVLine[0] + "beta " + "v" + VERSION;
  }
  return;
}

function getVersion() {
  return VERSION;
}

setVersion();

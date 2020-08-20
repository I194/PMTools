// Clears the local storage of the webpage
function clearLocalStorage(item) {

  const COLLECTION_STORAGE_ITEM = "collections";
  const SPECIMEN_STORAGE_ITEM = "specimens";

  function clearStorage(item) {

    /*
     * Function clearStorage
     * Clears a particular item or full storage
     */

    switch(item) {
      case "interpretation":
        return localStorage.removeItem(SPECIMEN_STORAGE_ITEM);
      case "statistics":
        return localStorage.removeItem(COLLECTION_STORAGE_ITEM);
      default:
        return localStorage.clear();
    }
  }

  // Clear the requested item
  clearStorage(item);

}

function readMultipleFiles(files, callback) {

  /*
   * Function readMultipleFiles
   * Uses the HTML5 FileReader API to read mutliple fires and fire a callback with its contents
   */

  var readFile, file, reader
  var fileContents = new Array();

  // IIFE to read multiple files
  (readFile = function(file) {

    // All files were read
    if(!files.length) {
      return callback(fileContents);
    }

    // Next queued file: create a new filereader instance
    file = files.shift();
    reader = new FileReader();

    // XML should be readable as text
    reader.readAsText(file);

    // Callback when one file is read (this is async)
    reader.onload = function() {

      console.debug("FileReader read file " + file.name + " (" + file.size + " bytes)");

      // Append the result
      fileContents.push({
        "name": file.name,
        "data": reader.result,
        //"size": file.size
      });
      // More files to read: continue
      readFile();

    }

  })();

}

function eraseSteps(type) {

  var pageID = getSelectedPage();
  var pageType = pageID.split('-')[1];

  var elems = {
    specimen: 'steps',
    collection: 'interpretations',
  }

  file = getSelectedFile(type);
  var independentIndex = 0;
  file[elems[type]].forEach((elem, i) => {
    if (elem.selected) elem.visible = !elem.selected;
    if (elem.visible) {
      elem.index = independentIndex;
      independentIndex++;
    }
    else elem.index = '-';
  });

  saveLocalStorage();
  deleteAllResults(undefined, pageType);

  ipcRenderer.send('redraw-specDataWin');
  ipcRenderer.send('redraw-collDataWin');

  dotSelector.render(redraw = true, hover = false);

}

function eraseStep(dotToErase) {
  // we cant get type as a function argument, so we get type from selected page
  var pageID = getSelectedPage();

  var elemTypes = {
    pca: 'specimen',
    stat: 'collection',
  }
  var pageType = pageID.split('-')[1];
  var type = elemTypes[pageType];

  var elems = {
    specimen: 'steps',
    collection: 'interpretations',
  }

  file = getSelectedFile(type);

  var independentIndex = 0;
  file[elems[type]].forEach((elem, i) => {
    if (i == dotToErase) {
      elem.visible = !elem.visible;
    }
    if (elem.visible) {
      elem.index = independentIndex;
      independentIndex++;
    }
    else elem.index = '-';
  });

  saveLocalStorage();
  deleteAllResults(undefined, pageType);
  redrawCharts();
  formatCollectionTable();

}

function nullMatrix() {

  /*
   * Function nullMatrix
   * Returns an empty 3D matrix
   */

  return new Array(nullVector(), nullVector(), nullVector());

}

function nullVector() {

  /*
   * Function nullVector
   * Returns an empty 1D vector
   */

  return new Array(0, 0, 0);

}

function TMatrix(data) {

  /*
   * Function TMatrix
   * Returns the orientation matrix for a set of directions
   */

  var T = nullMatrix();

  data.forEach(function(vector) {
    for(var k = 0; k < 3; k++) {
      for(var l = 0; l < 3; l++) {
        T[k][l] += (vector[k] * vector[l]) / data.length
      }
    }
  });

  return T;

}

function getRotationMatrix(lambda, phi) {

  /*
   * Function getRotationMatrix
   * Returns the rotation matrix (parameters are poorly named)
   * but this function is re-used througouth the application. It may be azimuth, plunge
   * or co-latitude, longitude of Euler pole
   * Note: we use actual core dip: Tauxe A3.12 uses the plunge of the lab arrow which is x - 90
   * Rewritten some of the cos -> sin using trig. identities and replacing (x - 90) with x
   */

  return new Array(
    new Array(Math.cos(lambda) * Math.sin(phi), -Math.sin(lambda), Math.cos(phi) * Math.cos(lambda)),
    new Array(Math.sin(phi) * Math.sin(lambda), Math.cos(lambda), Math.sin(lambda) * Math.cos(phi)),
    new Array(-Math.cos(phi), 0, Math.sin(phi))
  );

}

function getRotationMatrixR(lambda, phi) {

  /*
   * Function getRotationMatrixR
   * Returns the reversed rotation matrix (transpose)
   */

  var matrix = getRotationMatrix(lambda, phi);

  // Return the transpose (inverse rotation)
  return new Array(
    new Array(matrix[0][0], matrix[1][0], matrix[2][0]),
    new Array(matrix[0][1], matrix[1][1], matrix[2][1]),
    new Array(matrix[0][2], matrix[1][2], matrix[2][2])
  );

}

function getStatisticalParameters(components) {

  /*
   * Function getStatisticalParameters
   * Returns statistical parameters based on on a directional distribution
   */

  // Create a fake site at 0, 0 since we only look at the distritbuion of VGPs and not the actual positions
  var site = new Site(0, 0);

  // Get the directions and pole for each vector
  //var directions = components.filter(x => !x.rejected).map(x => literalToCoordinates(x.coordinates).toVector(Direction));
  var directions;
  if (COORDINATES.stat == 'specimen') directions = components.map(x => new Direction(x.Dspec[DIRECTION_MODE], x.Ispec[DIRECTION_MODE]));
  else if (COORDINATES.stat == 'geographic') directions = components.map(x => new Direction(x.Dgeo[DIRECTION_MODE], x.Igeo[DIRECTION_MODE]));
  else if (COORDINATES.stat == 'tectonic') directions = components.map(x => new Direction(x.Dstrat[DIRECTION_MODE], x.Istrat[DIRECTION_MODE]));

  // if (DIRECTION_MODE == 'reversed') {
  //   var dirs = directions.map(function(x) {
  //     return {d: x.dec, i: x.inc};
  //   });
  //   dirs = flipData(dirs, true)
  //   directions = dirs.map(x => new Direction(x.x, x.y));
  // }

  var poles = directions.map(x => site.poleFrom(x));
  var directionDistribution = new DirectionDistribution(directions);
  var poleDistribution = new PoleDistribution(poles);

  // Butler parameters are a function of A95, the inclination (paleolatitude)
  var butler = getButlerParameters(poleDistribution.confidence, directionDistribution.mean.inc);

  return {
    "dir": directionDistribution,
    "pole": poleDistribution,
    "butler": butler
  }

}

function getButlerParameters(confidence, inclination) {

  /*
   * Function getButlerParameters
   * Returns butler parameters for a distribution
   */

  // Convert to radians
  var A95 = confidence * RADIANS;
  var palat = paleolatitude(inclination) * RADIANS;
  var inc = inclination * RADIANS;

  // The errors are functions of paleolatitude
  var dDx = Math.asin(Math.sin(A95) / Math.cos(palat));
  var dIx = 2 * A95 / (1 + 3 * Math.pow(Math.sin(palat), 2));

  // Calculate the minimum and maximum Paleolatitude from the error on the inclination
  var palatMax = Math.atan(0.5 * Math.tan(inc + dIx));
  var palatMin = Math.atan(0.5 * Math.tan(inc - dIx));

  return new Object({
    "dDx": dDx / RADIANS,
    "dIx": dIx / RADIANS,
    "palatMin": palatMin / RADIANS,
    "palatMax": palatMax / RADIANS
  });

}

function paleolatitude(inc) {

  /*
   * Function paleolatitude
   * Calculates the paleolatitude from an inclination
   */

  return Math.atan(Math.tan(inc * RADIANS) / 2) / RADIANS;

}

function meanDirection(vectors) {

  /*
   * Function meanDirection
   * Calculates the mean vector from a set of directions
   */

  var sumVector = new Coordinates(0, 0, 0);

  vectors.forEach(function(coordinates) {
    sumVector = sumVector.add(coordinates);
  });

  return sumVector.toVector(Direction);

}

function normalize(intensities) {

  // Normalize the intensities to the maximum resultant intensity
  // if(document.getElementById("normalize-intensities").checked) {
  //   var normalizationFactor = Math.max.apply(null, intensities.map(x => x.y));
  // } else {
  //   var normalizationFactor = 1;
  // }
  var specimen = getSelectedFile('specimen');
  var intensitiesForNormalize = new Array();
  specimen.steps.forEach((step, i) => {
    if (step.visible) {
      intensitiesForNormalize.push({
        "x": parseInt(step.step.match(/\d+/)),
        "y": new Coordinates(step.x, step.y, step.z).length
      });
    }
  });

  var normalizationFactor = Math.max.apply(null, intensitiesForNormalize.map(x => x.y));

  return intensities.map(function(x) {
    return {
      "x": x.x,
      "y": x.y / normalizationFactor,
      "stepIndex": x.stepIndex,
      "step": x.step,
      "intensity": x.y,
      "maxIntensity": normalizationFactor
    }
  });

}

// Sorts eigenvalues and corresponding eigenvectors from highest to lowest
var sortEigenvectors = function(eig) {

  /*
   * Function sortEigenvectors
   * sorts eigenvalues and corresponding eigenvectors from highest to lowest
   */

  // Algorithm to sort eigenvalues and corresponding eigenvectors
  // as taken from the PmagPY library
  var t1 = 0;
  var t2 = 0;
  var t3 = 1;
  var ind1 = 0;
  var ind2 = 1;
  var ind3 = 2;

  // Normalize eigenvalues (impure)
  normalizeEigenValues(eig);

  //Determine what eigenvalues are largest and smallest
  eig.lambda.x.forEach(function(value, i) {

    // Find the largest eigenvalue
    if(value > t1) {
      t1 = value;
      ind1 = i;
    }

    // Find the smallest eigenvalue
    if(value < t3) {
      t3 = value;
      ind3 = i;
    }

  });

  // Middle eigenvector
  eig.lambda.x.forEach(function(value, i) {
    if(value !== t1 && value !== t3) {
      t2 = value;
      ind2 = i;
    }
  });

  // Sort eigenvectors
  return {
    "v1": new Array(eig.E.x[0][ind1], eig.E.x[1][ind1], eig.E.x[2][ind1]),
    "v2": new Array(eig.E.x[0][ind2], eig.E.x[1][ind2], eig.E.x[2][ind2]),
    "v3": new Array(eig.E.x[0][ind3], eig.E.x[1][ind3], eig.E.x[2][ind3]),
    "tau": new Array(t1, t2, t3)
  }

}

// Modifies the eigen object in place and normalizes the eigenvalues to within [0, 1]
function normalizeEigenValues(eig) {

  /*
   * Function normalizeEigenValues
   * Modifies the eigen object in place and normalizes the eigenvalues to within [0, 1]
   */

  var trace = 0;

  // Get the trace of the matrix
  for(var i = 0; i < 3; i++) {
    trace += eig.lambda.x[i];
  }

  for(var i = 0; i < 3; i++) {
    eig.lambda.x[i] = eig.lambda.x[i] / trace;
  }

}

function getAngleBetween(dec1, inc1, dec2, inc2) {

  var xyz1 = dir_to_xyz(dec1, inc1, 1);
  var xyz2 = dir_to_xyz(dec2, inc2, 1);

  var dot = (xyz1.x * xyz1.y * xyz1.z) + (xyz2.x * xyz2.y * xyz2.z);
  var mag1 = Math.sqrt(xyz1.x * xyz1.x + xyz1.y * xyz1.y + xyz1.z * xyz1.z)
  var mag2 = Math.sqrt(xyz2.x * xyz2.x + xyz2.y * xyz2.y + xyz2.z * xyz2.z)

  var angle = Math.acos(dot/(mag1*mag2)) * RADIANS;
  return angle;

}

function flipDir(dec, inc) {
  // flips lower hemisphere data to upper hemisphere

  if (inc < 0) {
    inc = -inc;
    dec = (dec + 180) % 360;
  }

  return {dec: dec, inc: inc};

}

function makePrincipalComponents(dirs) {

  var centerMass = new Array(0, 0, 0);

  var vectors = dirs.map(function(dir) {
    if (dir.x) return new Array(dir.x, dir.y, dir.z);
    else {
      var xyz = dir_to_xyz(dir.d, dir.i, 1);
      return new Array(xyz.x, xyz.y, xyz.z);
    }
  });

  for(var i = 0; i < vectors.length; i++) {
    for(var j = 0; j < 3; j++) {
      centerMass[j] += vectors[i][j] / dirs.length;
    }
  }

  for(var i = 0; i < vectors.length; i++) {
    for(var j = 0; j < 3; j++) {
      vectors[i][j] = vectors[i][j] - centerMass[j];
    }
  }

  var eig = sortEigenvectors(numeric.eig(TMatrix(vectors)));

  var princDir = xyz_to_dir(eig.v1[0], eig.v1[1], eig.v1[2]);

  return flipDir(princDir.dec, princDir.inc);

}

function flipData(data, combine) {

  var princDir = makePrincipalComponents(data);

  var D1 = [], D2 = [], D3 = [];

  data.forEach((dir, j) => {
    var angle = getAngleBetween(dir.d, dir.i, princDir.dec, princDir.inc);
    if (angle > 80) {
      var d = (dir.d - 180) % 360;
      var i = -dir.i;
      D2.push({x: d, y: i})
      D3.push({x: d, y: i})
    }
    else {
      D1.push({x: dir.d, y: dir.i});
      D3.push({x: dir.d, y: dir.i});
    }
  });

  if (combine) return D3;
  else return {normal: D1,  reversed: D2};

}

function flipCollections(collection) {

  // var collection = getSelectedFile('collection');

  var dirs = {
    specimen: [],
    geographic: [],
    stratigraphic: [],
  };

  collection.interpretations.forEach((interpretation, i) => {
    dirs.specimen.push({d: interpretation.Dspec, i: interpretation.Ispec});
    dirs.geographic.push({d: interpretation.Dgeo, i: interpretation.Igeo});
    dirs.stratigraphic.push({d: interpretation.Dstrat, i: interpretation.Istrat});
  });


  if (!dirs.specimen[0].d) dirs.specimen = undefined;
  else dirs.specimen = flipData(dirs.specimen, true);
  dirs.geographic = flipData(dirs.geographic, true);
  dirs.tectonic = flipData(dirs.stratigraphic, true);

  return dirs;

}

function makeStatGC(normalized) {

  collection = getSelectedFile('collection');

  var centerMass = new Array(0, 0, 0);
  var code = (normalized) ? 'GCn' : 'GC';

  var selectedDots = collection.interpretations.filter((interpretation) => {
    return interpretation.selected;
  });

  if (selectedDots.length < 2) return;

  data = {
    spec: [],
    geo: [],
    strat: [],
  }

  selectedDots.forEach((dot, i) => {
    data.spec.push({'x': dot.Dspec, 'y': dot.Ispec})
    data.geo.push({'x': dot.Dgeo, 'y': dot.Igeo})
    data.strat.push({'x': dot.Dstrat, 'y': dot.Istrat})
  });


  var vectorsSpec = makeVectorsForEig(data.spec);
  var vectorsGeo = makeVectorsForEig(data.geo);
  var vectorsStrat = makeVectorsForEig(data.strat);
  var vectorsSpecReversed = makeVectorsForEig(statReverse(data.spec));
  var vectorsGeoReversed = makeVectorsForEig(statReverse(data.geo));
  var vectorsStratReversed = makeVectorsForEig(statReverse(data.strat));

  var specSeries = makeGCSeries(vectorsSpec, code);
  var geoSeries = makeGCSeries(vectorsGeo, code);
  var stratSeries = makeGCSeries(vectorsStrat, code);
  var specReversedSeries = makeGCSeries(vectorsSpecReversed, code);
  var geoReversedSeries = makeGCSeries(vectorsGeoReversed, code);
  var stratReversedSeries = makeGCSeries(vectorsStratReversed, code);

  var comment = null;

  collection.means.push({
    "dots": selectedDots,
    "created": new Date().toISOString(),
    "code": code,
    "a95": {normal: geoSeries[1], reversed: geoReversedSeries[1]},
    "k": {normal: '', reversed: ''},
    "dirSpec": {normal: specSeries[2], reversed: specReversedSeries[2]},
    "dirGeo": {normal: geoSeries[2], reversed: geoReversedSeries[2]},
    "dirStrat": {normal: stratSeries[2], reversed: stratReversedSeries[2]},
    "comment": comment,
    "specimen": {normal: specSeries[0], reversed: specReversedSeries[0]},
    "geographic": {normal: geoSeries[0], reversed: geoReversedSeries[0]},
    "tectonic": {normal: stratSeries[0], reversed: stratReversedSeries[0]},
    "version": __VERSION__,
  });

  saveLocalStorage();

  redrawCharts(false);

}

function makeVectorsForEig(data) {

  if (!data[0].x) return undefined;
  var vectors = data.map(function(dot) {
    var Dot = dir_to_xyz(dot.x, dot.y, 1);

    var normalizer = Math.sqrt((Dot.x * Dot.x) + (Dot.y * Dot.y) + (Dot.z * Dot.z));
    return new Array(Dot.x / normalizer, Dot.y / normalizer, Dot.z / normalizer);
  });

  return vectors.concat(vectors);

}

function makeGCSeries(vectors, name) {

  if (!vectors) return [undefined, undefined, undefined];

  var eig = sortEigenvectors(numeric.eig(TMatrix(vectors)));
  var vectorTAU3 = new Coordinates(...eig.v3);

  var s1 = Math.sqrt((eig.tau[2] / eig.tau[1]) + (eig.tau[2] / eig.tau[0]));

  var MAD = Math.atan(s1) * RADIANS;

  if (isNaN(MAD)) MAD = 0;

  if (vectorTAU3.z > 0) vectorTAU3 = vectorTAU3.reflect();

  var direction = new Coordinates(vectorTAU3.x, vectorTAU3.y, vectorTAU3.z).toVector(Direction);

  direction.dec += 180;
  direction.dec %= 360;

  var evidEllipse = getSmallCircle(direction.dec, direction.inc, MAD, true);

  var series = [];

  series.push(
    {
      data: getPlaneData(direction).positive,
      linkedTo: ":previous",
      type: "line",
      color: "#119DFF",
      enableMouseTracking: false,
      marker: {
        enabled: false
      }
    },
    {
      data: getPlaneData(direction).negative,
      linkedTo: ":previous",
      type: "line",
      color: "#119DFF",
      enableMouseTracking: false,
      dashStyle: "LongDash",
      marker: {
        enabled: false
      }
    },
    {
      name: "GC",
      type: "scatter",
      zIndex: 100,
      color: "#4169E1",
      marker: {
        symbol: "circle",
        lineColor: "#119DFF",
        radius: 2,
        lineWidth: 1,
        fillColor: (direction.inc < 0) ? "white" : "#4169E1"
      },
      data: [{
        x: direction.dec,
        y: Math.abs(direction.inc), // projectInclination(direction.inc),
        inc: direction.inc,
      }]
    },
    {
      enableMouseTracking: false,
      type: 'line',
      lineWidth: 1,
      color: "#119DFF",
      linkedTo: ":previous",
      data: evidEllipse.pos,
      connectEnds: false,
      zIndex: 50,
      marker: {
        enabled: false,
      }
    },
    {
      enableMouseTracking: false,
      type: 'line',
      lineWidth: 1,
      color: "#119DFF",
      linkedTo: ":previous",
      data: evidEllipse.neg,
      zIndex: 50,
      dashStyle: "LongDash",
      connectEnds: false,
      marker: {
        enabled: false,
      },
    }
  );

  return [series, MAD, direction];
}

function makeFisherMean(type) {

  // Get selected specimen
  file = getSelectedFile(type);

  var allElems = {
    specimen: 'steps',
    collection: 'interpretations',
  }

  var elems = allElems[type];

  // Get the selected steps
  var selectedDots = file[elems].filter(function(elem) {
    return elem.selected;
  });

  if (selectedDots.length < 2) {
    return;
  }

  var dataPos = new Array(), dataNeg = new Array(), dataAbs = new Array();
  var data = [];
  var specMean, geoMean, stratMean;

  if  (type == 'specimen') {
    selectedDots.forEach(function(dot, i) {
      var direction = new Coordinates(dot.x, dot.y, dot.z).toVector(Direction);
      data.push({'x': direction.dec, 'y': direction.inc});
    });
    specMean = fisherMean(data);
    var fMeanXYZ = dir_to_xyz(specMean.dec, specMean.inc, 1);
    geoMean = inReferenceCoordinates("geographic", file, new Coordinates(fMeanXYZ.x, fMeanXYZ.y, fMeanXYZ.z)).toVector(Direction);
    stratMean = inReferenceCoordinates("tectonic", file, new Coordinates(fMeanXYZ.x, fMeanXYZ.y, fMeanXYZ.z)).toVector(Direction);
    geoMean.a95 = specMean.a95;
    stratMean.a95 = specMean.a95;
  }
  else if (type == 'collection')  {
    data = {
      spec: [],
      geo: [],
      strat: [],
    }

    selectedDots.forEach((dot, i) => {
      data.spec.push({'x': dot.Dspec, 'y': dot.Ispec})
      data.geo.push({'x': dot.Dgeo, 'y': dot.Igeo})
      data.strat.push({'x': dot.Dstrat, 'y': dot.Istrat})
    });

    specMean = fisherMean(data.spec);
    geoMean = fisherMean(data.geo);
    stratMean = fisherMean(data.strat);
    specReversedMean = fisherMean(statReverse(data.spec));
    geoReversedMean = fisherMean(statReverse(data.geo));
    stratReversedMean = fisherMean(statReverse(data.strat));
  }

  // get evidence ellipses
  var specEvidEllipse = getSmallCircle(specMean.dec, specMean.inc, specMean.a95, true);
  var geoEvidEllipse = getSmallCircle(geoMean.dec, geoMean.inc, geoMean.a95, true);
  var stratEvidEllipse = getSmallCircle(stratMean.dec, stratMean.inc, stratMean.a95, true);
  var specReversedEvidEllipse = getSmallCircle(specReversedMean.dec, specReversedMean.inc, specReversedMean.a95, true);
  var geoReversedEvidEllipse = getSmallCircle(geoReversedMean.dec, geoReversedMean.inc, geoReversedMean.a95, true);
  var stratReversedEvidEllipse = getSmallCircle(stratReversedMean.dec, stratReversedMean.inc, stratReversedMean.a95, true);

  // get series
  var specSeries = makeFisherSeries(specMean, specEvidEllipse);
  var geoSeries = makeFisherSeries(geoMean, geoEvidEllipse);
  var stratSeries = makeFisherSeries(stratMean, stratEvidEllipse);
  var specReversedSeries = makeFisherSeries(specReversedMean, specReversedEvidEllipse);
  var geoReversedSeries = makeFisherSeries(geoReversedMean, geoReversedEvidEllipse);
  var stratReversedSeries = makeFisherSeries(stratReversedMean, stratReversedEvidEllipse);


  var comment = null;

  file.means.push({
    "dots": selectedDots,
    "created": new Date().toISOString(),
    "code": 'Fisher',
    "a95": {normal: geoMean.a95, reversed: geoReversedMean.a95},
    "k": {normal: geoMean.k, reversed: geoReversedMean.k},
    "dirSpec": {normal: specMean, reversed: specReversedMean},
    "dirGeo": {normal: geoMean, reversed: geoReversedMean},
    "dirStrat": {normal: stratMean, reversed: stratReversedMean},
    "comment": comment,
    "specimen": {normal: specSeries, reversed: specReversedSeries},
    "geographic": {normal: geoSeries, reversed: geoReversedSeries},
    "tectonic": {normal: stratSeries, reversed: stratReversedSeries},
    "version": __VERSION__,
  });
  redrawCharts();
  saveLocalStorage();

}

function fisherMean(data) {

  /*
  Calculates the Fisher mean and associated parameter from a di_block
  Parameters
  ----------
  di_block : a nested list of [dec,inc] or [dec,inc,intensity]
  Returns
  -------
  fpars : dictionary containing the Fisher mean and statistics
      dec : mean declination
      inc : mean inclination
      r : resultant vector length
      n : number of data points
      k : Fisher k value
      csd : Fisher circular standard deviation
      alpha95 : Fisher circle of 95% confidence
  -------
  credit : PmagPY module for Python 3
  */

  var R = 0, Xbar = [0, 0, 0], X = [], fpars = {};
  var N = data.length;
  if (N < 2) return fpars;
  for (let i = 0; i < data.length; i++) {
    xyz = dir_to_xyz(data[i].x, data[i].y, 1);
    X.push([xyz.x, xyz.y, xyz.z]);
    for (let j = 0; j < 3; j++) Xbar[j] += X[i][j];
  }
  for (let j = 0; j  < 3; j++) R += Math.pow(Xbar[j], 2);
  R = Math.sqrt(R);
  for (let j = 0; j  < 3; j++) Xbar[j] /= R; //Xbar[j]/R
  dir = xyz_to_dir(Xbar[0], Xbar[1], Xbar[2]);
  if (N != R) {
    k = (N - 1) / (N - R);
    csd = 81 / Math.sqrt(k);
  }
  else {
    k = Infinity;
    csd = 0;
  }
  b = Math.pow(20, (1./(N - 1.))) - 1;
  a = 1 - b * (N - R) / R;
  if (a < -1) a = -1;
  var a95 = Math.degrees(Math.acos(a));
  if (a < 0) a95 = 180;
  fpars = {dec: dir.dec, inc: dir.inc, n: N, r: R, k: k, a95: a95, csd: csd};
  return fpars
}

function makeFisherSeries(mean, ellipse) {

  var series = [
    {
      type: "scatter",
      name: 'Fisher mean',
      data: [{'x': mean.dec, 'y': Math.abs(mean.inc)}],
      zIndex: 50,
      marker: {
        radius: 2,
        lineColor: "#119DFF",
        lineWidth: 0.5,
        fillColor: mean.inc > 0 ? '#119DFF' : 'white',
        symbol: "circle",
      },
      color: "#119DFF",
    },
    {
      enableMouseTracking: false,
      type: 'line',
      lineWidth: 1,
      color: "#119DFF",
      linkedTo: ":previous",
      data: ellipse.pos,
      connectEnds: false,
      zIndex: 50,
      marker: {
        enabled: false,
      }
    },
    {
      enableMouseTracking: false,
      type: 'line',
      lineWidth: 1,
      color: "#119DFF",
      linkedTo: ":previous",
      data: ellipse.neg,
      zIndex: 50,
      dashStyle: "LongDash",
      connectEnds: false,
      marker: {
        enabled: false,
      }
    }
  ]

  return series;
}

function statReverse(data) {

  if (data[0].x) {
    var dirs = data.map(function(dir) {
      return {d: dir.x, i: dir.y};
    });
    data = flipData(dirs, true);
  }

  return data;

}

// Does a PCA interpretation on the selected steps
function makeInterpretations(type, anchored, normalized, selectedSteps, reference) {

  /*
   * Function makeInterpretation
   * Does a PCA interpretation on the selected steps
   */

  // var anchored = options.anchored;
  // var type = options.type;

  // var specimen = getSelectedSpecimen();

  var centerMass = new Array(0, 0, 0);

  var vectors = selectedSteps.map(function(step) {
    var normalizer = 1;
    if (normalized) normalizer = Math.sqrt((step.x * step.x) + (step.y * step.y) + (step.z * step.z));
    return new Array(step.x / normalizer, step.y / normalizer, step.z / normalizer);
  });

  // Vector of first & last step
  var firstVector = new Coordinates(...vectors[0]);

  // When anchoring we mirror the points and add them
  if(anchored) {
    vectors = vectors.concat(selectedSteps.map(function(step) {
      var normalizer = 1;
      if (normalized) normalizer = Math.sqrt((step.x * step.x) + (step.y * step.y) + (step.z * step.z));
      return new Array(step.x / normalizer, step.y / normalizer, step.z / normalizer);
    }));
  }

  var lastVector = new Coordinates(...vectors[vectors.length - 1]);

  // Transform to the center of mass (not needed when anchoring)
  if(!anchored) {

    for(var i = 0; i < vectors.length; i++) {
      for(var j = 0; j < 3; j++) {
        centerMass[j] += vectors[i][j] / selectedSteps.length;
      }
    }

    for(var i = 0; i < vectors.length; i++) {
      for(var j = 0; j < 3; j++) {
        vectors[i][j] = vectors[i][j] - centerMass[j];
      }
    }

  }

  // Library call (numeric.js) to get the eigenvector / eigenvalues
  var eig = sortEigenvectors(numeric.eig(TMatrix(vectors)));

  // try {
  //   var eig = sortEigenvectors(numeric.eig(TMatrix(vectors)));
  // } catch(exception) {
  //   throw(new Exception("Could not calculate the eigenvectors."));
  // }

  // Extract all the steps used in the interpretation
  var stepValues = selectedSteps.map(x => x.step)
  var centerMassCoordinates = new Coordinates(...centerMass);
  var directionVector = firstVector.subtract(lastVector);
  var intensity = directionVector.length;

  var vectorTAU1 = new Coordinates(...eig.v1);
  var vectorTAU3 = new Coordinates(...eig.v3);

  if(directionVector.dot(vectorTAU1) < 0) {
    vectorTAU1 = vectorTAU1.reflect();
  }

  // Determine what eigenvector to use (tau1 for directions; tau3 for planes)
  switch(type) {

    case "TAU1":

      // Calculation of maximum angle of deviation
      var s1 = Math.sqrt(eig.tau[0]);
      var MAD = Math.atan(Math.sqrt(eig.tau[1] + eig.tau[2]) / s1)  * RADIANS;

      // Get the dec/inc of the maximum eigenvector stored in v1
      var eigenVectorCoordinates = vectorTAU1;

      break;

    case "TAU3":

      // Calculation of maximum angle of deviation
      var s1 = Math.sqrt((eig.tau[2] / eig.tau[1]) + (eig.tau[2] / eig.tau[0]));
      var MAD = Math.atan(s1) * RADIANS;
      // console.log('dsdads@@@@', eig.tau);
      // console.log('------------>>>', MAD, (Math.atan(Math.sqrt(eig.tau[1] + eig.tau[2]) / Math.sqrt(eig.tau[0]))  * RADIANS),);
      // console.log('------------>>>', MAD, (Math.atan(Math.sqrt(eig.tau[2] + eig.tau[2]) / Math.sqrt(eig.tau[0]))  * RADIANS),);
      // console.log('------------>>>', MAD, (Math.atan(Math.sqrt(eig.tau[1] + eig.tau[1]) / Math.sqrt(eig.tau[0]))  * RADIANS),);
      // console.log('------------>>>', MAD, (Math.atan(Math.sqrt(eig.tau[1] + eig.tau[1]) / Math.sqrt(eig.tau[1]))  * RADIANS),);
      // console.log('------------>>>', MAD, (Math.atan(Math.sqrt(eig.tau[1] + eig.tau[2]) / Math.sqrt(eig.tau[1]))  * RADIANS),);
      // console.log('------------>>>', MAD, (Math.atan(Math.sqrt(eig.tau[1] + eig.tau[2]) / Math.sqrt(eig.tau[2]))  * RADIANS),);
      // console.log('!!!!!!!!!!!->>>', MAD, (Math.atan(Math.sqrt((eig.tau[2] / eig.tau[1]) + (eig.tau[2] / eig.tau[1])))  * RADIANS),);
      // console.log('!!!!!!!!!!!->>>', MAD, (Math.atan(Math.sqrt((eig.tau[1] / eig.tau[1]) + (eig.tau[2] / eig.tau[0])))  * RADIANS),);
      // console.log('!!!!!!!!!!!->>>', MAD, (Math.atan(Math.sqrt((eig.tau[2] / eig.tau[1]) + (eig.tau[1] / eig.tau[0])))  * RADIANS),);
      // console.log('!!!!!!!!!!!->>>', MAD, (Math.atan(Math.sqrt((eig.tau[2] / eig.tau[1]) + (eig.tau[1] / eig.tau[2])))  * RADIANS),);
      // console.log('!!!!!!!!!!!->>>', MAD, (Math.atan(Math.sqrt((eig.tau[2] / eig.tau[1]) + (eig.tau[2] / eig.tau[1])))  * RADIANS),);
      // console.log('!!!!!!!!!!!->>>', MAD, (Math.atan(Math.sqrt((eig.tau[0] / eig.tau[2]) + (eig.tau[1] / eig.tau[2])))  * RADIANS),);
      // console.log('!!!!!!!!!!!->>>', MAD, (Math.atan(Math.sqrt((eig.tau[0] / eig.tau[2]) + (eig.tau[0] / eig.tau[2])))  * RADIANS),);
      // console.log('!!!!!!!!!!!->>>', MAD, (Math.atan(Math.sqrt((eig.tau[1] / eig.tau[2]) + (eig.tau[0] / eig.tau[1])))  * RADIANS),);
      // console.log('!!!!!!!!!!!->>>', MAD, (Math.atan(Math.sqrt((eig.tau[1] / eig.tau[2]) + (eig.tau[1] / eig.tau[1])))  * RADIANS),);

      // Get the coordinates of the maximum eigenvector stored in v3
      var eigenVectorCoordinates = vectorTAU3;

      // Always take the negative pole by convention
      if(eigenVectorCoordinates.z > 0) {
        eigenVectorCoordinates = eigenVectorCoordinates.reflect();
      }

      break;

    default:
      throw(new Exception("Unknown interpretation type requested."));

  }

  if(isNaN(MAD)) {
    MAD = 0;
  }

  return {
    "component": {
      "coordinates": eigenVectorCoordinates,
      "centerMass": centerMassCoordinates
    },
    "intensity": intensity,
    "MAD": MAD
  }

}

// Does a PCA on the selected specimen (and its selected steps)
function makeInterpretation(type, anchored, normalized, code) {

  /*
   * Function makeInterpretation
   * Does a PCA on the selected specimen (and its selected steps)
   */
  // Get selected specimen
  specimen = getSelectedFile('specimen');

  // Get the selected steps
  var selectedSteps = specimen.steps.filter(function(step) {
    return step.selected;
  });

  if (selectedSteps.length < 2) {
    return;
  }

  var stepValues = selectedSteps.map(x => x.step);

  // Check if the interpretation already exists
  // var exists = Boolean(specimen.interpretations.filter(function(interpretation) {
  //   return interpretation.steps.join() === stepValues.join() && interpretation.type === options.type && interpretation.anchored === options.anchored;
  // }).length);
  //
  // if(exists) {
  //   return notify("warning", "This component already exists.");
  // }

  // Get the prinicple component
  var PCA = makeInterpretations(type, anchored, normalized, selectedSteps, "specimen");

  // Rotate component to geographic coordinates
  var geoCoordinates = inReferenceCoordinates("geographic", specimen, PCA.component.coordinates);
  var geoMass = inReferenceCoordinates("geographic", specimen, PCA.component.centerMass);

  // Rotate component to tectonic coordinates
  var tectCoordinates = inReferenceCoordinates("tectonic", specimen, PCA.component.coordinates);
  var tectMass = inReferenceCoordinates("tectonic", specimen, PCA.component.centerMass);

  var comment = "";

  // if(document.getElementById("auto-comment").checked) {
  //   comment = prompt("Enter a comment for this interpretation.");
  // } else {
  //   comment = null
  // }
  // Attach the interpretation to the specimen \

  specimen.interpretations.push({
  // specimen.interpretations = [{
    "steps": selectedSteps,
    "anchored": anchored,
    "type": type,
    "code": code,
    "created": new Date().toISOString(),
    "group": GROUP,
    "MAD": PCA.MAD,
    "intensity": PCA.intensity,
    "comment": comment,
    "fitted": false,
    "specimen": PCA.component,
    "geographic": {"coordinates": geoCoordinates, "centerMass": geoMass},
    "tectonic": {"coordinates": tectCoordinates, "centerMass": tectMass},
    "version": __VERSION__,
  });

  saveLocalStorage();

  redrawCharts(false);
}

function getConfidenceEllipseDouble(dDx, dIx, N) {

  /*
   * Function getConfidenceEllipse
   * Returns confidence ellipse around up North
   */

  // Define the number of discrete points on an ellipse
  const NUMBER_OF_POINTS = N;

  dDx = dDx / RADIANS;
  dIx = dIx / RADIANS;
  var vectors = new Array();
  var iPoint = ((NUMBER_OF_POINTS - 1) / 2);

  // Create a circle around the pole with angle confidence
  for(var i = 0; i < NUMBER_OF_POINTS; i++) {

    var psi = i * Math.PI / iPoint;
    var x = Math.sin(dIx) * Math.cos(psi);
    var y = Math.sin(dDx) * Math.sin(psi);
    // Resulting coordinate
    var z = Math.sqrt(1 - Math.pow(x, 2) - Math.pow(y, 2));

    if(isNaN(z)) {
      z = 0;
    }

    vectors.push(new Coordinates(x, y, z).toVector(Direction));

  }

  // Handle the correct distribution type
  return vectors;

}

// Converts tau to text format
function tauToMark(tau) {

  return tau === "TAU3" ? "τ3" : "τ1";

}

// Get dot's coordinates and graphsScale from selected steps
function coordsFromSteps(steps) {

  var specimen = getSelectedFile('specimen');

  // Data buckets for inclination/declination lines and scale
  var horizontal = new Array();
  var vertical = new Array();
  var dirs = new Array();
  var intensities = new Array();
  var graphScale = new Array();
  var selectedStepIndex = null;


  steps.forEach(function(step, i) {

    // If the step is not visible: stop
    if(!step.visible) {
      return;
    }
    // Save index of the active step for displaying the hover icon
    if (dotSelector._selectedStep === i) {
      selectedStepIndex = horizontal.length;
    }

    // Calculate the correction direction for this step
    var coordinates = inReferenceCoordinates(COORDINATES['pca'], specimen, new Coordinates(step.x, step.y, step.z));
    coordinates.x = Math.round(coordinates.x);
    coordinates.y = Math.round(coordinates.y);
    coordinates.z = Math.round(coordinates.z);

    var direction = coordinates.toVector(Direction);
    var title = titleToSpec(COORDINATES['pca'], PROJECTION);

    dirs.push({
      "x": direction.dec,
      "y": Math.abs(direction.inc),
      "stepIndex": step.index,
    })
    intensities.push({
      "x": parseInt(step.step.match(/\d+/)),
      "y": direction.length,
      "stepIndex": step.index,
    })

    // var normalizationFactor = Math.max.apply(null, intensities.map(x => x.y));
    //
    // return intensities.map(function(x) {
    //   return {
    //     "x": x.x,
    //     "y": x.y / normalizationFactor,
    //     "stepIndex": x.stepIndex,
    //     "step": x.step,
    //     "intensity": x.y,
    //     "maxIntensity": normalizationFactor
    //   }
    // });


    if (PROJECTION == "upwest") {
      // Horizontal projection is in the x, y plane
      horizontal.push({
        "x": coordinates.x,
        "y": -coordinates.y,
        "dec": direction.dec,
        "inc": direction.inc,
        "intensity": direction.length,
        "step": step.step,
        "stepIndex": step.index,
        "title": title[0],
      });
      // Vertical projection is in the x, z plane
      vertical.push({
        "x": coordinates.x,
        "y": -coordinates.z,
        "dec": direction.dec,
        "inc": direction.inc,
        "intensity": direction.length,
        "step": step.step,
        "stepIndex": step.index,
        "title": title[1],
      });
    }
    else if (PROJECTION == "upnorth"){
      // Horizontal projection is in the x, y plane
      horizontal.push({
        "x": coordinates.y,
        "y": coordinates.x,
        "dec": direction.dec,
        "inc": direction.inc,
        "intensity": direction.length,
        "step": step.step,
        "stepIndex": step.index,
        "title": title[0],
      });
      // Vertical projection is in the x, z plane
      vertical.push({
        "x": coordinates.y,
        "y": -coordinates.z,
        "dec": direction.dec,
        "inc": direction.inc,
        "intensity": direction.length,
        "step": step.step,
        "stepIndex": step.index,
        "title": title[1],
      });
    }
    else {
      // Horizontal projection is in the y, x plane
      horizontal.push({
        "x": coordinates.y,
        "y": coordinates.x,
        "dec": direction.dec,
        "inc": direction.inc,
        "intensity": direction.length,
        "step": step.step,
        "stepIndex": step.index,
        "title": title[0],
      });
      // Vertical projection is in the -z, x plane
      vertical.push({
        "x": -coordinates.z,
        "y": coordinates.x,
        "dec": direction.dec,
        "inc": direction.inc,
        "intensity": direction.length,
        "step": step.step,
        "stepIndex": step.index,
        "title": title[1],
      });
    }

    graphScale.push(Math.abs(coordinates.x), Math.abs(coordinates.y), Math.abs(coordinates.z));
  })

  var output = {
    "hor": horizontal,
    "vert": vertical,
    "dirs": dirs,
    "intensities": normalize(intensities),
    "scale": graphScale,
    "selStepIndex": selectedStepIndex,
  }

  return output;

}

function literalToCoordinates(coordinates) {

  /*
   * Function literalToCoordinates
   * Returns an object literal {x, y, z} to a Coordinate instance
   */

  return new Coordinates(coordinates.x, coordinates.y, coordinates.z);

}

function getSuccesfulLabel(bool) {

  /*
   * Function getSuccesfulLabel
   * Maps TRUE to success and FALSE to error label
   */

  return (bool ? "<i class='fas fa-check text-success'></i>" : "<i class='fas fa-times text-danger'></i>");

}

function isUtrechtIntensityBug(specimen) {
  var version = splitVersion(specimen.version);
  return specimen.format === "UTRECHT" && version.version === 2 && version.major === 0 && version.minor <= 1;
}

function splitVersion(version) {

  let parameters = version.split(".");
  let minor = parameters[2].split("-")[0];

  return {
    "minor": Number(minor),
    "major": Number(parameters[1]),
    "version": Number(parameters[0])
  }

}

function booleanToCheck(bool) {

  return bool ? "Yes" : "No";

}

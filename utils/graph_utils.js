Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function dir_to_xyz(d, i, r) {
  d = Math.radians(d);
  i = Math.radians(i);
  var x = r * Math.cos(i) * Math.cos(d);
  var y = r * Math.cos(i) * Math.sin(d);
  var z = r * Math.sin(i);
  return {x: x, y: y, z: z};
};

function xyz_to_dir(x, y, z) {
  var R = Math.sqrt(x * x + y * y + z * z);
  var D = Math.degrees(Math.acos(x / Math.sqrt(x * x + y * y)));
  if (R == 0) {
    D = Math.degrees(Math.acos(0));
  }
  if (y < 0) {
    D = -D;
  }
  var dr = D - 360 * Math.floor(D / 360);
  if (dr < 0) {
    dr += 360;
  }
  D = dr;
  var I = Math.degrees(Math.asin(z / R));
  return {dec: D, inc: I, r: R};
};

function dir_to_polar(decinc, r, scaleX, scaleY) {
  let polar_data = [];
  for (let i = 0; i < decinc.length; i++) {
    let I = decinc[i].inc;
    let D = Math.radians(450 - decinc[i].dec);
    polar_data.push(
      {x: scaleX(r * (Math.cos(D) * (90 - Math.abs(I)) / 90)),
       y: scaleY(r * (Math.sin(D) * (90 - Math.abs(I)) / 90)),
       inc_sign: Math.sign(I),}
    );
  }
  return polar_data;
};

function plot_big_circle(dec_start, inc_start, dec_end, inc_end) {

  // dec то же что longitude, inc то же что и latitude
  var reverse = new Boolean(false);
  if (dec_start > dec_end) { // упорядочивание
    [dec_start, dec_end] = [dec_end, dec_start];
    reverse = new Boolean(true);
  }

  if ((dec_end - dec_start) > 180) { // проверка, является ли путь кратчайшим
    reverse = !reverse;
    [dec_start, dec_end] = [dec_end, dec_start + 360];
  }

  var big_circ = [];

  if (dec_end == dec_start) {
    if (inc_start > inc_end) {
      [inc_start, inc_end] = [inc_end, inc_start];
    }
    var step = (inc_end - inc_start) / 50;
    for (let inc = inc_start; inc < inc_end; inc += step) {
      big_circ.push({x: dec_end, y: inc});
    }
    return big_circ;
  }

  dec_start = Math.radians(dec_start);
  dec_end = Math.radians(dec_end);
  inc_start = Math.radians(inc_start);
  inc_end = Math.radians(inc_end);

  var step = (dec_end - dec_start) / 50;
  for (let dec = dec_start; dec < dec_end; dec += step) {
    let inc = Math.degrees(
      Math.atan(
        (Math.tan(inc_start) * Math.sin(dec_end - dec) / Math.sin(dec_end - dec_start)) +
        (Math.tan(inc_end) * Math.sin(dec - dec_start) / Math.sin(dec_end - dec_start))
      )
    );

    big_circ.push({x: Math.degrees(dec), y: Math.abs(inc)});
  }

  if (reverse == true) {
    var reversed_bc = []
    for (let i = big_circ.length - 1, j = 0; i >= 0; i--, j++) {
      reversed_bc.push({x: big_circ[i].x, y: big_circ[j].y});
    }
    return reversed_bc;
  }

  return big_circ;

}

function great_circle_debug1(start_dec, end_dec, reverse) {

   if (start_dec > 180 && start_dec < 270 && end_dec > 90 && end_dec <= 180) {
     start_dec = 270 + (270 - start_dec);
     end_dec = 90 - (end_dec - 90);
     reverse = "34";
   }
   if (end_dec > 180 && end_dec < 270 && start_dec > 90 && start_dec < 180) {
     end_dec = 270 + (270 - end_dec);
     start_dec = 90 - (start_dec - 90);
     reverse = "43";
   }
   if (end_dec > 270 && end_dec < 360 && start_dec > 90 && start_dec < 180 && ((end_dec - start_dec) < 180)) {
     start_dec = (end_dec - 180) - (start_dec - (end_dec - 180));
     reverse = "24";
   }
   if (start_dec > 270 && start_dec < 360 && end_dec > 90 && end_dec < 180 && ((start_dec - end_dec) < 180)) {
     end_dec = (start_dec - 180) - (end_dec - (start_dec - 180));
     reverse = "42";
   }
   if (end_dec > 180 && end_dec < 270 && start_dec > 0 && start_dec < 90 && ((end_dec - start_dec) < 180)) {
     start_dec = (end_dec - 180) - (start_dec - (end_dec - 180));
     reverse = "13";
   }
   if (start_dec > 180 && start_dec < 270 && end_dec > 0 && end_dec < 90 && ((start_dec - end_dec) < 180)) {
     end_dec = (start_dec - 180) - (end_dec - (start_dec - 180));
     reverse = "31"
   }
  return [start_dec, end_dec, reverse];

}

function great_circle_debug2(start_dec, end_dec, dec, reverse) {

  if (dec < 0) dec += 360;

  if (reverse == "34") {
    if (dec >= 270 && dec <= 360) dec  = 270 - (dec - 270);
    if (dec >= 0 && dec <= 90) dec = 90 + (90 - dec);
  }
  if (reverse == "43") {
    if (dec >= 270 && dec <= 360) dec  = 270 - (dec - 270);
    if (dec >= 0 && dec <= 90) dec = 90 + (90 - dec);
  }
  if (reverse == "42") dec += 2*((start_dec - 180) - dec);
  if (reverse == "24") dec += 2*((end_dec - 180) - dec);
  if (reverse == "31") dec += 2*((start_dec - 180) - dec);
  if (reverse == "13") dec += 2*((end_dec - 180) - dec);
  if (dec < 0) dec += 360;

  return dec;

}

function getSmallCircle(dec_mean, inc_mean, radius, split) {

  // сначала корректируем координаты (не является необходимой частью алгоритма)
  if (radius == 180) return [];
  dec_mean = 360 - dec_mean;
  inc_mean = 90 - Math.abs(inc_mean);
  radius = 90 - radius;
  var small_circ = []
  for (let dec = 0; dec < 361; dec++) { // создаем малый круг на полюсе
    let xyz = dir_to_xyz(dec, radius, 1); // и тут же переводим в декартовы
    small_circ.push([xyz.x, xyz.y, xyz.z]);
  }
  var rot_y = roty3(inc_mean); // матрица поворота вокруг оси Y
  var rot_z = rotz3(dec_mean); // матрица поворота вокруг оси Z
  var rot_yz = multiply(rot_y, rot_z); // поворот вокруг Y и затем вокруг Z
  small_circ = multiply(small_circ, rot_yz); // поворот малого круга из полюса в
                                             // правильное положение на сфере
  var tmp_small_circ = [];
  var posneg = {pos: [], neg: []};

  for (let i = 0; i < 361; i++) { // обратный перевод в сферические координаты

    let x = small_circ[i][0];
    let y = small_circ[i][1];
    let z = small_circ[i][2];
    let decinc = xyz_to_dir(x, y, z);
    /* не надо тут так преобразовывать, у меня своя функция
    для этого есть; p.s. Это взято из библиотека RFOC для R)
    let eq_area_x = scaleX(r * Math.sin(Math.radians(decinc.inc / 2)) *
     Math.sqrt(2) * Math.sin(Math.radians(decinc.dec)));
    let eq_area_y = scaleY(r * Math.sin(Math.radians(decinc.inc / 2)) *
     Math.sqrt(2) * Math.cos(Math.radians(decinc.dec)));
    tmp_small_circ.push({x: eq_area_x, y: eq_area_y});*/
    if (decinc.inc >= 0) posneg.pos.push({x: decinc.dec, y: decinc.inc});
    else posneg.neg.push({x: decinc.dec, y: Math.abs(decinc.inc)});

    tmp_small_circ.push({x: decinc.dec, y: Math.abs(decinc.inc)});
  }
  // Делим массив с отриц. числами на два и затем "сортируем"
  // sorting
  posneg.neg.sort((a, b) => {
    return (a.x - b.x);
  })
  // splitting
  var negSlicePostn;
  for (let i = 1; i < posneg.neg.length - 1; i++) {
    var dot = posneg.neg[i];
    if (Math.abs(dot.x - posneg.neg[i + 1].x) > (Math.abs(dot.x - posneg.neg[i - 1].x + 0.25) * 4)) {
      negSlicePostn = i;
      break;
    }
  }
  if (negSlicePostn) {
    var neg1 = posneg.neg.slice(negSlicePostn + 1, posneg.neg.length);
    var neg2 = posneg.neg.slice(0, negSlicePostn);
    posneg.neg = neg1.concat(neg2);
  }
  // output
  if (split) return posneg;
  return tmp_small_circ;

}

function splitSmallCirc(data) {

  var slicePostn;
  for (let i = 1; i < data.length - 1; i++) {
    var dot = posneg.neg[i];
    if (Math.abs(dot.x - data[i + 1].x) > (Math.abs(dot.x - data[i - 1].x) * 2)) {
      slicePostn = i;
      break;
    }
  }

  var neg1 = data.slice(slicePostn + 1, data.length);
  var neg2 = data.slice(0, slicePostn);

}

function getGCPath(data, split) {

  var big_circle_path = [];
  var posneg = {pos: [], neg: []};
  var reverse = "";
  // var reverse34 = new Boolean(false);
  // var reverse43 = new Boolean(false);
  // var reverse31 = new Boolean(false);
  // var reverse13 = new Boolean(false);
  // var reverse24 = new Boolean(false);
  // var reverse42 = new Boolean(false);
  for (let i = 0; i < data.length - 1; i++) {

    var start_dec = data[i].x, start_inc = data[i].y;
    var end_dec = data[i+1].x, end_inc = data[i+1].y;
    // первая часть 'дебага' - переводим начало и конец в симметричное положение
    var circ_debug = great_circle_debug1(start_dec, end_dec, reverse);
    [start_dec, end_dec, reverse] = [circ_debug[0], circ_debug[1], circ_debug[2]];

    var start = turf.point([start_dec, start_inc - 0.001]);
    var end = turf.point([end_dec, end_inc]);
    var bc_path_tmp = turf.greatCircle(start, end);
    bc_path_tmp = bc_path_tmp.geometry.coordinates;
    var posneg_tmp = {pos: [], neg: []};

    for (let j = 0; j < bc_path_tmp.length; j++) {
      var dec = bc_path_tmp[j][0];
      var inc = bc_path_tmp[j][1];

      // вторая часть 'дебага' - возвращаем dec в правильный квадрант
      dec = great_circle_debug2(start_dec, end_dec, dec, reverse);

      if (inc >= 0) posneg_tmp.pos.push({x: dec, y: inc});
      else posneg_tmp.neg.push({x: dec, y: Math.abs(inc)});

      big_circle_path.push({x: dec, y: Math.abs(inc)})
    }

    posneg.pos.push(posneg_tmp.pos);
    posneg.neg.push(posneg_tmp.neg);

    reverse = "";

  }
  // // Делим массив с отриц. числами на два и затем "сортируем"
  // var negSlicePostn;
  // for (let i = 1; i < posneg.neg.length - 1; i++) {
  //   var dot = posneg.neg[i];
  //   if (Math.abs(dot.x - posneg.neg[i + 1].x) > (Math.abs(dot.x - posneg.neg[i - 1].x) * 4)) {
  //     negSlicePostn = i;
  //     break;
  //   }
  // }
  //
  // var neg1 = posneg.neg.slice(negSlicePostn + 1, posneg.neg.length);
  // var neg2 = posneg.neg.slice(0, negSlicePostn);
  // posneg.neg = neg1.concat(neg2);

  // output
  if (split) return posneg;
  return big_circle_path;

}

function data_to_pos(data) {
  var abs_data = [], neg_data = [], pos_data = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].y < 0) neg_data.push({x: data[i].x, y: Math.abs(data[i].y)});
    else pos_data.push(data[i]);
    abs_data.push({x: data[i].x, y: Math.abs(data[i].y)});
  }
  return {abs: abs_data, neg: neg_data, pos: pos_data};
}

function roty3(angle) {
  angle = Math.radians(angle);
  var roty_matrix = [
    [Math.cos(angle), 0, -Math.sin(angle)],
    [0, 1, 0],
    [Math.sin(angle), 0, Math.cos(angle)]
  ]
  return roty_matrix;
}

function rotz3(angle) {
  angle = Math.radians(angle);
  var rotz_matrix = [
    [Math.cos(angle), -Math.sin(angle), 0],
    [Math.sin(angle), Math.cos(angle), 0],
    [0, 0, 1],
  ]
  return rotz_matrix;
}

function multiply(m1, m2) {
    var result = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = [];
        for (var j = 0; j < m2[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

function rotateTo(data, dec, inc) {

  var dataXYZ = []
  let xyz = dir_to_xyz(data.dec, data.inc, 1); // переводим в декартовы
  dataXYZ.push([xyz.x, xyz.y, xyz.z]);
  var rot_y = roty3(inc); // матрица поворота вокруг оси Y
  var rot_z = rotz3(dec); // матрица поворота вокруг оси Z
  var rot_yz = multiply(rot_z, rot_y); // поворот вокруг Y и затем вокруг Z
  dataXYZ = multiply(dataXYZ, rot_yz); // поворот в нужное положение на сфере
  dataXYZ = {x: dataXYZ[0][0], y: dataXYZ[0][1], z: dataXYZ[0][2]};
  var decinc = xyz_to_dir(dataXYZ.x, dataXYZ.y, dataXYZ.z);

  return decinc;

}

function projectInclination(inc) {

  /*
   * Function projectInclination
   * Converts the inclination to a project inclination (equal area; equal angle)
   * used in the equal area projection plots
   */

  // Value can be treated as being absolute since the
  // lower & upper hemisphere are both being projected
  var inc = Math.abs(inc);
  var PROJECTION_TYPE = "AREA";
  switch(PROJECTION_TYPE) {
    case "AREA":
      return 90 - (Math.sqrt(2) * 90 * Math.sin(Math.PI * (90 - inc) / 360));
    case "ANGLE":
      return 90 - (90 * Math.tan(Math.PI * (90 - inc) / 360));
    default:
      throw(new Exception("Unknown projection type requested."));
  }

}

function getPlaneData(direction, angle, angle2, N) {

  /*
   * Function getPlaneData
   * Returns plane data
   */

  function rotateEllipse(x) {

    /*
     * Function 	Data::rotateEllipse
     * Rotates each point on an ellipse (plane) to the correct direction
     */
    return x.toCartesian().rotateTo(direction.dec, direction.inc).toVector(Direction).highchartsData();

  }

  if(N === undefined) {
    N = 101;
  }

  // No angle is passed: assume a plane (angle = 90)
  if(angle === undefined) {
    angle = 90;
  }

  if(angle2 === undefined) {
    angle2 = angle;
  }

  var ellipse = getConfidenceEllipseDouble(angle, angle2, N).map(rotateEllipse);

  // Flip the ellipse when requested. Never flip great circles (angle = 90)
  if(angle !== 90 && document.getElementById("flip-ellipse") && document.getElementById("flip-ellipse").checked) {
    return flipEllipse(direction.inc, ellipse);
  }

  // Different series for positive, negative
  if(angle === 90) {
    return flipPlane(direction.inc, ellipse);
  }

  return ellipse;
}

function inReferenceCoordinates(reference, specimen, coordinates) {

  /*
   * Function inReferenceCoordinates
   * Gets the coordinates in the reference coordinates
   */

  if(reference == "specimen") {
    return coordinates;
  }

  // Do the geographic correction
  coordinates = coordinates.rotateTo(specimen.coreAzimuth, specimen.coreDip);

  if(reference == "geographic") {
    return coordinates;
  }

  // Do the tectonic correction
  // See Lisa Tauxe: 9.3 Changing coordinate systems; last paragraph
  return coordinates.correctBedding(specimen.beddingStrike, specimen.beddingDip);



}

function fromReferenceCoordinates(reference, specimen, coordinates) {

  /*
   * Function fromReferenceCoordinates
   * Rotates all the way back to specimen coordinates
   */

  // We are already in specimen coordinates
  if(reference === "specimen") {
    return coordinates;
  }

  // In geographic: rotate backwards to specimen
  if(reference === "geographic") {
    return coordinates.rotateFrom(specimen.coreAzimuth, specimen.coreDip);
  }

  // In tectonic coordinates: inverse bedding correction
  // and geographic correction at the end
  var dipDirection = specimen.beddingStrike + 90;
  return coordinates.rotateTo(-dipDirection, 90).rotateFrom(0, 90 - specimen.beddingDip).rotateTo(dipDirection, 90).rotateFrom(specimen.coreAzimuth, specimen.coreDip);

}

function switchCoordinateReference(fromRadio, system, type) {

  /*
   * Function switchCoordinateReference
   * Cycles through the available coordinate reference frames
   */
   var AVAILABLE_COORDINATES = new Array(
     "specimen",
     "geographic",
     "tectonic"
   );

  if ((type == 'stat') && !getSelectedFile('collection').interpretations[0].Dspec) {
    document.getElementById('stat-specimen').getElementsByTagName('input')[0].disabled = true;
    document.getElementById('stat-specimen').classList.add('no-hover');
    AVAILABLE_COORDINATES = new Array(
      "geographic",
      "tectonic"
    );
  }

  document.getElementById(type + '-' + COORDINATES[type]).classList.remove('active', 'focus');//.style.background = '#B0C4DE';
  // Increment the counter
  if (fromRadio) {
    for (let i = 0; i < AVAILABLE_COORDINATES.length ; i++) {
      if (system == AVAILABLE_COORDINATES[i]) COORDINATES_COUNTER[type] = i;
    }
  }
  else COORDINATES_COUNTER[type]++;

  COORDINATES_COUNTER[type] %= AVAILABLE_COORDINATES.length;
  COORDINATES[type] = AVAILABLE_COORDINATES[COORDINATES_COUNTER[type]];

  document.getElementById(type + '-' + COORDINATES[type]).classList.add('active');//.style.background = '#4682B4';

  if (type == 'pca') {
    if (COORDINATES[type] == "specimen") {
      document.getElementById("upwest").innerHTML = document.getElementById("upwest").innerHTML.replace("W, UP", "-y, -z");
      document.getElementById("upnorth").innerHTML = document.getElementById("upnorth").innerHTML.replace("N, UP", "x, -z");
      document.getElementById("nn").innerHTML = document.getElementById("nn").innerHTML.replace("N, N", "x, x");
    }
    else {
      document.getElementById("upwest").innerHTML = document.getElementById("upwest").innerHTML.replace("-y, -z", "W, UP");
      document.getElementById("upnorth").innerHTML = document.getElementById("upnorth").innerHTML.replace("x, -z", "N, UP");
      document.getElementById("nn").innerHTML = document.getElementById("nn").innerHTML.replace("x, x", "N, N");
    }
  }

  redrawCharts();

  localStorage.setItem("coordinates", JSON.stringify({data: COORDINATES, counter: COORDINATES_COUNTER}));

}

function switchProjection(fromRadio, projection) {

/*
 * Function switchProjection
 * Toggles the projection between Up/West and Up/North
 */

  const AVAILABLE_PROJECTIONS = new Array(
   "upwest",
   "upnorth",
   "nn"
  );

  document.getElementById(PROJECTION).classList.remove('active', 'focus');//.style.background = '#B0C4DE';
  // Increment the counter
  if (fromRadio) {
   for (let i = 0; i < AVAILABLE_PROJECTIONS.length ; i++) {
     if (projection == AVAILABLE_PROJECTIONS[i]) {
       //if (COORDINATES_COUNTER % 3 == i) return;
       PROJECTIONS_COUNTER = i;
     }
   }
  }
  else {
   PROJECTIONS_COUNTER++;
  }

  PROJECTIONS_COUNTER %= 3;
  PROJECTION = AVAILABLE_PROJECTIONS[PROJECTIONS_COUNTER];

  document.getElementById(PROJECTION).classList.add('active');//.style.background = '#4682B4';

  // Toggle and redraw Zijderveld diagram
  var zijdOnMain = document.getElementById('zijd-on-main').checked;
  plotZijderveldDiagram(false, zijdOnMain);

  localStorage.setItem("projection", JSON.stringify({data: PROJECTION, counter: PROJECTIONS_COUNTER}));

}

function switchDirectionsMode(fromRadio, mode, type) {

  var AVAILABLE_MODES = new Array(
    "normal",
    "reversed",
  );

  document.getElementById(type + '-' + DIRECTION_MODE).classList.remove('active', 'focus');//.style.background = '#B0C4DE';
  // Increment the counter
  if (fromRadio) {
    for (let i = 0; i < AVAILABLE_MODES.length ; i++) {
      if (mode == AVAILABLE_MODES[i]) MODES_COUNTER = i;
    }
  }
  else MODES_COUNTER++;

  MODES_COUNTER %= AVAILABLE_MODES.length;
  DIRECTION_MODE = AVAILABLE_MODES[MODES_COUNTER];

  if (DIRECTION_MODE == 'reversed') document.getElementById('reverse-selector').disabled = false;
  else document.getElementById('reverse-selector').disabled = true;
  document.getElementById(type + '-' + DIRECTION_MODE).classList.add('active');//.style.background = '#4682B4';
  localStorage.setItem("dirMode", DIRECTION_MODE);
  ipcRenderer.send('redraw-meansDataWin');
  ipcRenderer.send('redraw-collDataWin');

  redrawCharts();

  localStorage.setItem("direction", JSON.stringify({data: DIRECTION_MODE, counter: MODES_COUNTER}));

}

function switchToCenter(fromRadio, mode, type) {

  var AVAILABLE_MODES = new Array(
    "standard",
    "centered",
  );

  document.getElementById(type + '-' + CENTERED_MODE).classList.remove('active', 'focus');//.style.background = '#B0C4DE';
  // Increment the counter
  if (fromRadio) {
    for (let i = 0; i < CENTERED_MODE.length; i++) {
      if (mode == AVAILABLE_MODES[i]) CENTERED_COUNTER = i;
    }
  }
  else CENTERED_COUNTER++;

  CENTERED_COUNTER %= AVAILABLE_MODES.length;
  CENTERED_MODE = AVAILABLE_MODES[CENTERED_COUNTER];

  document.getElementById(type + '-' + CENTERED_MODE).classList.add('active');//.style.background = '#4682B4';

  redrawCharts();

  localStorage.setItem("centered", JSON.stringify({data: CENTERED_MODE, counter: CENTERED_COUNTER}));

}

function titleToSpec(reference, projection) {
  if (reference == "specimen") {
    if (projection == "upwest") {
      return ["x, x", "-y, -z"];
    }
    else if (projection == "upnorth") {
      return ["y, y", "x, -z"];
    }
    else return ["y, -z", "x, x"];
  }
  else {
    if (projection == "upwest") {
      return ["N, N", "W, UP"];
    }
    else if (projection == "upnorth") {
      return ["E, E", "N, UP"];
    }
    else return ["E, UP", "N, N"];
  }
}

// Formats the series used for showing interpretated directions
function formatInterpretationSeries(intensity, interpretations) {

  /*
   * Function formatInterpretationSeries
   * Formats the series used for showing interpretated directions
   */

  // Make the lines double as long as the intensity
  var scaling = 2 * intensity;
  var series = new Array();

  interpretations.forEach(function(interpretation) {

    // Only show TAU1
    if(interpretation.type === "TAU3") {
      return;
    }

    var component = interpretation[COORDINATES['pca']];

    // Handle the projection
    if(PROJECTION == "upwest") {
      // Create a line that represents the vector
      // Add line for horizontal projection (x, y)
      var linearFitHorizontal = [{
        "x": component.centerMass.x + component.coordinates.x * scaling,
        "y": -component.centerMass.y - component.coordinates.y * scaling
      }, {
        "x": component.centerMass.x - component.coordinates.x * scaling,
        "y": -component.centerMass.y + component.coordinates.y * scaling
      }];
      // Do the same for line for horizontal projection (y, z)
      var linearFitVertical = [{
        "x": component.centerMass.x + component.coordinates.x * scaling,
        "y": -component.centerMass.z - component.coordinates.z * scaling
      }, {
        "x": component.centerMass.x - component.coordinates.x * scaling,
        "y": -component.centerMass.z + component.coordinates.z * scaling
      }];
    }
    else if (PROJECTION == "upnorth") {
      var linearFitHorizontal = [{
        "x": component.centerMass.y + component.coordinates.y * scaling,
        "y": component.centerMass.x + component.coordinates.x * scaling
      }, {
        "x": component.centerMass.y - component.coordinates.y * scaling,
        "y": component.centerMass.x - component.coordinates.x * scaling
      }];
      var linearFitVertical = [{
        "x": component.centerMass.y + component.coordinates.y * scaling,
        "y": -component.centerMass.z - component.coordinates.z * scaling
      }, {
        "x": component.centerMass.y - component.coordinates.y * scaling,
        "y": -component.centerMass.z + component.coordinates.z * scaling
      }];
    }
    else {
      var linearFitHorizontal = [{
        "x": component.centerMass.y + component.coordinates.y * scaling,
        "y": component.centerMass.x + component.coordinates.x * scaling
      }, {
        "x": component.centerMass.y - component.coordinates.y * scaling,
        "y": component.centerMass.x - component.coordinates.x * scaling
      }];
      var linearFitVertical = [{
        "x": -component.centerMass.z - component.coordinates.z * scaling,
        "y": component.centerMass.x + component.coordinates.x * scaling
      }, {
        "x": -component.centerMass.z + component.coordinates.z * scaling,
        "y": component.centerMass.x - component.coordinates.x * scaling
      }];
    }

    var code = interpretation.code;
    var name = "Interpretation (" + code + ")";//tauToMark(interpretation.type) + ")";

    if(interpretation.fitted) {
      name = name + " - fitted";
    }

    series.push({
      name: name,
      data: linearFitHorizontal,
      enableMouseTracking: false,
      lineWidth: 1,
      dashStyle: interpretation.fitted ? "LongDash" : "Solid",
      color: "#119DFF",
      marker: {
        enabled : false
      }
    });

    series.push({
      data: linearFitVertical,
      lineWidth: 1,
      linkedTo: ":previous",
      enableMouseTracking: false,
      dashStyle: interpretation.fitted ? "LongDash" : "Solid",
      color: "#9933FF",
      marker: {
        enabled: false
      }
    });

    // selected dots must be highlighted
    var selectedDots = coordsFromSteps(interpretation["steps"]);

    if (settings.pca.zijdHighlight) {
      series.push({
        type: "scatter",
        linkedTo: ":previous",
        data: selectedDots['hor'],
        color: "rgba(17, 157, 255, 0.25)",
        enableMouseTracking: false,
        marker: {
          radius: 4,
          lineWidth: 0.5,
          symbol: "circle",
          lineColor: "rgba(17, 157, 255, 0.25)",
          fillColor: "rgba(17, 157, 255, 0.25)",
        }
      });
      series.push({
        type: "scatter",
        linkedTo: ":previous",
        data: selectedDots['vert'],
        color: "rgba(153, 51, 255, 0.25)",
        enableMouseTracking: false,
        marker: {
          radius: 4,
          lineWidth: 0.5,
          symbol: "circle",
          lineColor: "rgba(153, 51, 255, 0.25)",
          fillColor: "rgba(153, 51, 255, 0.25)",
        }
      });
    }
    else {
      series.push({
        type: "scatter",
        linkedTo: ":previous",
        data: [],
        color: "rgba(17, 157, 255, 0.25)",
        enableMouseTracking: false,
        marker: {
          radius: 4,
          lineWidth: 0.5,
          symbol: "circle",
          lineColor: "rgba(17, 157, 255, 0.25)",
          fillColor: "rgba(17, 157, 255, 0.25)",
        }
      });
      series.push({
        type: "scatter",
        linkedTo: ":previous",
        data: [],
        color: "rgba(153, 51, 255, 0.25)",
        enableMouseTracking: false,
        marker: {
          radius: 4,
          lineWidth: 0.5,
          symbol: "circle",
          lineColor: "rgba(153, 51, 255, 0.25)",
          fillColor: "rgba(153, 51, 255, 0.25)",
        }
      });
    }

  });

  if (interpretations.length > 0) {
    if (interpretations[interpretations.length - 1].type === "TAU3") return [];
  }
  if (series.length > 4) {
    return series.slice(series.length - 4);
  }
  return series;

}

function formatInterpretationSeriesArea(interpretations) {

  /*
   * Function formatInterpretationSeriesArea
   * Description
   */

  const SHOW_TAU3 = true;

  var series = new Array();
  var sliceCoef = 3;

  // Extract TAU3 interpretations for plotting
  interpretations.forEach(function(interpretation) {

    var component = interpretation[COORDINATES['pca']];
    var direction = new Coordinates(component.coordinates.x, component.coordinates.y, component.coordinates.z).toVector(Direction);
    if (interpretation.type === "TAU3") direction.dec += 180;
    var PCAEvidEllipse = getSmallCircle(direction.dec, direction.inc, interpretation.MAD, true);
    if (interpretation.type === "TAU1" || SHOW_TAU3) {

      var code = interpretation.code;
      var name = "Interpretation (" + code + ")";//tauToMark(interpretation.type) + ")";
      if (interpretation.fitted) name = name + " - fitted";
      console.log(PCAEvidEllipse);
      series.push(
        {
          name: name,
          type: "scatter",
          zIndex: 100,
          color: "#4169E1",
          marker: {
            symbol: interpretation.fitted ? "diamond" : "circle",
            lineColor: "#4169E1",
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
          color: "#4169E1",
          linkedTo: ":previous",
          data: PCAEvidEllipse.pos,
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
          color: "#4169E1",
          linkedTo: ":previous",
          data: PCAEvidEllipse.neg,
          zIndex: 50,
          dashStyle: (settings.global.dashedLines) ? "LongDash" : "Solid",
          connectEnds: false,
          marker: {
            enabled: false,
          }
        },
      );

      // selected dots must be highlighted
      var selectedDots = coordsFromSteps(interpretation["steps"]);
      if (settings.pca.stereoHighlight) {
        series.push({
          type: "scatter",
          linkedTo: ":previous",
          data: selectedDots.dirs,
          color: "rgba(65, 105, 225, 0.25)",
          enableMouseTracking: false,
          marker: {
            radius: 4,
            lineWidth: 0.5,
            symbol: "circle",
            lineColor: "rgba(65, 105, 225, 0.25)",
            fillColor: "rgba(65, 105, 225, 0.25)",
          }
        });
      }
      else series.push({
        type: "scatter",
        linkedTo: ":previous",
        data: [],
        color: "rgba(65, 105, 225, 0.25)",
        enableMouseTracking: false,
        marker: {
          radius: 4,
          lineWidth: 0.5,
          symbol: "circle",
          lineColor: "rgba(65, 105, 225, 0.25)",
          fillColor: "rgba(65, 105, 225, 0.25)",
        }
      });

    }
    // Get the plane data (confidence ellipse with angle 90)
    // Only for TAU3
    console.log();
    if(interpretation.type === "TAU3") {

      series.push({
        data: getPlaneData(direction).positive,
        linkedTo: ":previous",
        type: "line",
        color: "#4169E1",
        enableMouseTracking: false,
        marker: {
          enabled: false
        }
      },
      {
        data: getPlaneData(direction).negative,
        linkedTo: ":previous",
        type: "line",
        color: "#4169E1",
        enableMouseTracking: false,
        dashStyle: (settings.global.dashedLines) ? "LongDash" : "Solid",
        marker: {
          enabled: false
        }
      },
      {
        name: name,
        type: "scatter",
        zIndex: 100,
        color: "#4169E1",
        marker: {
          symbol: interpretation.fitted ? "diamond" : "circle",
          lineColor: "#4169E1",
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
        color: "#4169E1",
        linkedTo: ":previous",
        data: PCAEvidEllipse.pos,
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
        color: "#4169E1",
        linkedTo: ":previous",
        data: PCAEvidEllipse.neg,
        zIndex: 50,
        dashStyle: (settings.global.dashedLines) ? "LongDash" : "Solid",
        connectEnds: false,
        marker: {
          enabled: false,
        }
      },
    );

      // selected dots must be highlighted
      var selectedDots = coordsFromSteps(interpretation["steps"]);
      if (settings.pca.stereoHighlight) {
        series.push({
          type: "scatter",
          linkedTo: ":previous",
          data: selectedDots.dirs,
          color: "rgba(65, 105, 225, 0.25)",
          enableMouseTracking: false,
          marker: {
            radius: 4,
            lineWidth: 0.5,
            symbol: "circle",
            lineColor: "rgba(65, 105, 225, 0.25)",
            fillColor: "rgba(65, 105, 225, 0.25)",
          }
        });
      }
      else series.push({
        type: "scatter",
        linkedTo: ":previous",
        data: [],
        color: "rgba(65, 105, 225, 0.25)",
        enableMouseTracking: false,
        marker: {
          radius: 4,
          lineWidth: 0.5,
          symbol: "circle",
          lineColor: "rgba(65, 105, 225, 0.25)",
          fillColor: "rgba(65, 105, 225, 0.25)",
        }
      });
    }
  });
  // Cut previous interpretations
  var sliceCoef = series.length;
  if (interpretations.length > 1) {
    if (interpretations[interpretations.length - 1].type === "TAU3") sliceCoef = 6;
    else sliceCoef = 4;
  }

  if (series.length > sliceCoef) {
    return series.slice(series.length - sliceCoef);
  }
  return series;
}

function formatInterpretationSeriesIntensity(interpretations) {

  const SHOW_TAU3 = true;

  var series = new Array();

  interpretations.forEach(function(interpretation) {

    var component = interpretation[COORDINATES['pca']];
    var direction = new Coordinates(component.coordinates.x, component.coordinates.y, component.coordinates.z).toVector(Direction);
    var PCAEvidEllipse = getSmallCircle(direction.dec, direction.inc, interpretation.MAD);

    if (interpretation.type === "TAU1" || SHOW_TAU3) {

      var code = interpretation.code;
      var name = "Interpretation (" + code + ")";//tauToMark(interpretation.type) + ")";
      if (interpretation.fitted) name = name + " - fitted";

      // selected dots must be highlighted
      var selectedDots = coordsFromSteps(interpretation["steps"]);

      if (settings.pca.intensityHighlight) {
        series.push({
          name: name,
          type: "scatter",
          data: selectedDots.intensities,
          color: "rgba(65, 105, 225, 0.25)",
          enableMouseTracking: false,
          marker: {
            radius: 4,
            lineWidth: 0.5,
            symbol: "circle",
            lineColor: "rgba(65, 105, 225, 0.25)",
            fillColor: "rgba(65, 105, 225, 0.25)",
          }
        });
      }
      else series.push([]);
    }
  });

  if (series.length > 1) {
    return series.slice(series.length-1);
  }
  return series;

}

function formatMeansSeries(means, type) {

  var series = [];
  // means.forEach(function(mSeries, i) {
  //   series = mSeries[COORDINATES[type]];
  //   if (DIRECTION_MODE == 'reversed') series = series.reversed;
  //   else series = series.normal;
  // });

  means.forEach((mean, i) => {
    var meanDIR = mean[COORDINATES.stat][DIRECTION_MODE];
    var evidEllipse = getSmallCircle(meanDIR.dec, meanDIR.inc, meanDIR.a95, settings.global.dashedLines);
    if (mean.code == 'Fisher') {
      var mSeries = makeFisherSeries(meanDIR, evidEllipse, settings.global.dashedLines);
    }
    else if ((mean.code == 'GC') || (mean.code == 'GCn')) {
      console.log(meanDIR);
      var mSeries = makeGCSeries(meanDIR, evidEllipse, settings.global.dashedLines)
    }
    mSeries.forEach((s, i) => {
      series.push(s);
    });
  });
  console.log(series);

  // Cut previous interpretations
  var sliceCoef = series.length;
  if (means.length > 1) {
    var lastCode = means[means.length - 1].code;
    if ((lastCode === "GC") || (lastCode === "GCn")) sliceCoef = 4;
    else sliceCoef = 2;
  }
  if (settings.global.dashedLines) sliceCoef += 1;
  if (series.length > sliceCoef) {
    console.log(series.slice(series.length - sliceCoef));
    return series.slice(series.length - sliceCoef);
  }
  console.log(series);
  return series;

}

// Resets the marker size to the default size when exporting
function resetMarkerSize() {

  /*
   * Function resetMarkerSize
   * Resets the marker size to the default size when exporting
   */

  if(this.options.chart.forExport) {

    this.series.forEach(function(serie) {
      serie.data.forEach(function(point) {

        // Update the point if it exists
        if(point.marker && point.marker.radius === MARKER_RADIUS_SELECTED) {
          point.update({
            "marker": {
              "radius": 4,
              "fillColor": point.marker.fillColor,
              "lineColor": point.marker.lineColor,
              "lineWidth": point.marker.lineWidth
            }
          }, false);

        }
      });
    });

    this.redraw();

  }

}

function getProjectionTitle() {

  function getDirection() {

    // In specimen coordinates
    // if(COORDINATES === "specimen") {
    //   if(UPWEST) return "-y/-z";
    //   else return "+x/-z";
    // }

    // In geographic or tectonic coordinates
    if(true) return "Up/West";
    else return "Up/North";
  }

  return getDirection() + " (" + "geographic" + ")";

}

function getProjection(projection_type, coordinates, directions) {
  var horizontal = [], vertical = [];
  if(projection_type == 'upwest') {
    for (let i = 0; i < coordinates.length; i++) {
      // Horizontal projection is in the x, y plane
      horizontal.push({
        x: coordinates[i].x,
        y: coordinates[i].y,
        dec: directions[i].dec,
        inc: directions[i].inc,
        intensity: directions.length,
        // step: step.step,
        // stepIndex: i
      });

      // Vertical projection is in the x, z plane
      // the vertical axis is reversed
      vertical.push({
        x: coordinates[i].x,
        y: coordinates[i].z,
        dec: directions[i].dec,
        inc: directions[i].inc,
        intensity: directions.length,
        // step: step.step,
        // stepIndex: i
      });
    }
  }
  else {
    for (let i = 0; i < coordinates.length; i++) {
      // Horizontal projection is in the x, y plane
      horizontal.push({
        x: coordinates[i].y,
        y: -coordinates[i].x,
        dec: directions[i].dec,
        inc: directions[i].inc,
        intensity: directions.length,
        // step: step.step,
        // stepIndex: i
      });

      // Vertical projection is in the x, z plane
      // the vertical axis is reversed
      vertical.push({
        x: coordinates[i].y,
        y: coordinates[i].z,
        dec: directions[i].dec,
        inc: directions[i].inc,
        intensity: directions.length,
        // step: step.step,
        // stepIndex: i
      });
    }
  }
   return {hor: horizontal, vert: vertical};
}

function fisher_mean(data) {
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

function PCA(data, origin, anchor) {
  if (data.length < 2) return;

  var len = data.length;
  var ux = 0, uy = 0, uz = 0;
  var u_matrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  if (anchor == true) {
    if (origin == true) len += 1;
    else ux = data[0].x, uy = data[0].y, uz = data[0].z;

    for (let i = 0; i < len - 1; i++) {
      u_matrix[0][0] += Math.pow((data[i].x - ux), 2);
      u_matrix[0][1] += ((data[i].x - ux) * (data[i].y - uy));
      u_matrix[0][2] += ((data[i].x - ux) * (data[i].z - uz));
      u_matrix[1][1] += Math.pow((data[i].y - uy), 2);
      u_matrix[1][2] += ((data[i].z - uz) * (data[i].z - uz));
      u_matrix[2][2] += Math.pow((data[i].z - uz), 2);
    }
    u_matrix[1][0] = u_matrix[0][1];
    u_matrix[2][0] = u_matrix[0][2];
    u_matrix[2][1] = u_matrix[1][2];
    var norm = u_matrix[0][0];

    if (norm == 0) return;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        u_matrix[i][j] /= norm;
      }
    }
  }
  else {
    if (origin == true) len += 1;

    for (let i = 0; i < len; i++) {
      ux += data[i].x;
      uy += data[i].y;
      uz += data[i].z;
    }
    ux /= len, uy /= len, uz /= len;

    if (origin == true) {
      u_matrix[0][0] = ux * ux;
      u_matrix[0][1] = ux * uy;
      u_matrxi[0][2] = ux * uz;
      u_matrix[1][1] = uy * uy;
      u_matrix[1][2] = uy * uz;
      u_matrix[2][2] = uz * uz;
    }

    for (let i = 0; i < len; i++) {
      u_matrix[0][0] += Math.pow((data[i].x - ux), 2);
      u_matrix[0][1] += ((data[i].x - ux) * (data[i].y - uy));
      u_matrix[0][2] += ((data[i].x - ux) * (data[i].z - uz));
      u_matrix[1][1] += Math.pow((data[i].y - uy), 2);
      u_matrix[1][2] += ((data[i].z - uz) * (data[i].z - uz));
      u_matrix[2][2] += Math.pow((data[i].z - uz), 2);
    }
    u_matrxi[1][0] = u_matrix[0][1];
    u_matrix[2][0] = u_matrix[0][2];
    u_matrix[2][1] = u_matrix[1][2];
  }
  var eig = math.eigs(u_matrix);
  var eigv = eig.values, eigw = eig.vectors;

  var MAD = 0;
  if ((eigv[1] + eigv[0] / eigv[2]) > 0) MAD = Math.degrees(Math.atan(Math.sqrt((eigv[1] + eigv[0] / eigv[2]))));

  var mmx = data[0].x - ux, mmy = data[0].y - uy, mmz = data[0].z - uz;

  if (Math.sign(eigw[2, 0] != Math.sign(mmz))) {
    eigw[0][0] *= -1;
    eigw[1][0] *= -1;
    eigw[2][0] *= -1;
  }
  var module = Math.sqrt(mmx * mmx + mmy * mmy + mmz * mmz);
  var x = eigw[0][0] * module;
  var y = eigw[1][0] * module;
  var z = eigw[2][0] * module;
  var dir = xyz_to_dir(x, y, z);
  var comp = {
    x: x,
    y: y,
    z: z,
    dec: dir.dec,
    inc: dir.inc,
    mad: Math.round(MAD, 1),
    module: module,
  }
  var udir = xyz_to_dir(ux, uy, uz);
}

function makeDataLabel(point) {
  var dataLabel;
  pointStep = (point.step === 'NRM') ? point.step : point.step.match(/\d/g).join("");
  if (settings.pca.numberMode & settings.pca.stepMode) {
    dataLabel = (point.stepIndex + 1) + ": " + pointStep;
  }
  else if (settings.pca.numberMode) dataLabel = (point.stepIndex + 1);
  else if (settings.pca.stepMode) dataLabel = pointStep;
  else dataLabel = '';

  return dataLabel;
}

function makeDataLabelStat(point) {

  var dataLabel;
  if (settings.stat.numberMode & settings.stat.stepMode) {
    dataLabel = (point.dotIndex + 1) + ": " + point.id;
  }
  else if (settings.stat.numberMode) dataLabel = (point.dotIndex + 1);
  else if (settings.stat.stepMode) dataLabel = point.id;
  else dataLabel = '';

  return dataLabel;
}

function flipPlane(inclination, ellipse) {

  let negative = new Array();
  let positive = new Array();
  let sign = 0;

  // Go over all the points on the ellipse
  for(var i = 1; i < ellipse.length; i++) {

    let point = ellipse[i];
    let pointSign = Math.sign(point.inc);

    // Sign changed: add null to prevent Highcharts drawing a connection
    if(sign !== pointSign) {
      (pointSign < 0 ? positive : negative).push(ellipse[i - 1]);
      (pointSign < 0 ? negative : positive).push(null);
    }

    (point.inc < 0 ? positive : negative).push(point);

    // Sign for next iteration
    sign = pointSign;

  }

  return { negative, positive };

}

Highcharts.SVGRenderer.prototype.symbols.download = function (x, y, w, h) {
    var path = [
        // Arrow stem
        'M', x + w * 0.5, y,
        'L', x + w * 0.5, y + h * 0.7,
        // Arrow head
        'M', x + w * 0.3, y + h * 0.5,
        'L', x + w * 0.5, y + h * 0.7,
        'L', x + w * 0.7, y + h * 0.5,
        // Box
        'M', x, y + h * 0.9,
        'L', x, y + h,
        'L', x + w, y + h,
        'L', x + w, y + h * 0.9
    ];
    return path;
};

// Define a custom symbol paths
// ZIJD
// Centered for export
Highcharts.SVGRenderer.prototype.symbols.EVlineZ = function (x, y, w, h) {
    return ['M', x + w * 0.5, y - 1, 'L', x + w * 0.5, y + h];
};
Highcharts.SVGRenderer.prototype.symbols.EHlineZ = function (x, y, w, h) {
    return ['M', x - 1, y + h * 0.5, 'L', x + w, y + h * 0.5];
};
// Centered for pmtools
Highcharts.SVGRenderer.prototype.symbols.VlineZ = function (x, y, w, h) {
    return ['M', x + w * 0.5, y - 1, 'L', x + w * 0.5, y + h];
};
Highcharts.SVGRenderer.prototype.symbols.HlineZ = function (x, y, w, h) {
    return ['M', x, y + h * 0.5, 'L', x + 1 + w, y + h * 0.5];
};
// STEREO
Highcharts.SVGRenderer.prototype.symbols.EVlineS = function (x, y, w, h) {
    return ['M', x + 0.5 + w * 0.5, y, 'L', x + 0.5 + w * 0.5, y + h];
};
Highcharts.SVGRenderer.prototype.symbols.EHlineSTop = function (x, y, w, h) {
    return ['M', x, y + h * 0.5, 'L', x + w, y + h * 0.5];
};
Highcharts.SVGRenderer.prototype.symbols.EHlineSBot = function (x, y, w, h) {
    return ['M', x + 1, y + h * 0.5, 'L', x + 1 + w, y + h * 0.5];
};
// Centered for pmtools
Highcharts.SVGRenderer.prototype.symbols.VlineS = function (x, y, w, h) {
    return ['M', x + w * 0.5, y, 'L', x + w * 0.5, y + h];
};
Highcharts.SVGRenderer.prototype.symbols.HlineSTop = function (x, y, w, h) {
    return ['M', x, y + h * 0.5, 'L', x + w, y + h * 0.5];
};
Highcharts.SVGRenderer.prototype.symbols.HlineSBot = function (x, y, w, h) {
    return ['M', x, y + h * 0.5, 'L', x + w, y + h * 0.5];
};
if (Highcharts.VMLRenderer) {
    Highcharts.VMLRenderer.prototype.symbols.Vline = Highcharts.SVGRenderer.prototype.symbols.Vline;
    Highcharts.VMLRenderer.prototype.symbols.Hline = Highcharts.SVGRenderer.prototype.symbols.Hline;
}

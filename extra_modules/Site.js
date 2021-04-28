"use strict";

var Site = function(lng, lat) {

  /*
   * Class Site
   * Container class for site locations
   */

  // Keep latitude and longitude between [-90, 90] and [-180, 180]
  if(lng > 180) {
    lng = lng - 360;
  }
  if(lat > 90) {
    lat = lat - 180;
  }

  this.lng = lng;
  this.lat = lat;

}

Site.prototype.poleFrom = function(siteMean) {

  /*
   * Function Site.poleFrom
   * Returns the pole for this site from a given direction
   */

  // Confirm we are translating a site to a pole
  // if(!(direction instanceof Direction)) {
  //   throw(new Exception("The passed direction is not of class Direction."));
  // }

  // if (typeof DIRECTION_MODE === 'undefined') var DIRECTION_MODE = 'normal';

  // var fpars;
  var dName = 'Dgeo';
  var iName = 'Igeo'

  if (COORDINATES.poles == 'tectonic') {
    dName = 'Dstrat';
    iName = 'Istrat';
  }

  var position = 'normal';
  if (siteMean.reversed) position = 'reversed';

  var siteLatitude = this.lat / RADIANS;
  var siteLongitude = this.lng / RADIANS;
  var Dgeo = siteMean.geographic.dec[position] / RADIANS;
  var Igeo = siteMean.geographic.inc[position] / RADIANS;
  var a95g = siteMean.geographic.a95 / RADIANS;
  var Dstrat = siteMean.tectonic.dec[position] / RADIANS;
  var Istrat = siteMean.tectonic.inc[position] / RADIANS;
  var a95s = siteMean.tectonic.a95 / RADIANS;

  var poleGeo = calcVGP(Dgeo, Igeo, a95g, siteLatitude, siteLongitude);
  var poleStrat = calcVGP(Dstrat, Istrat, a95s, siteLatitude, siteLongitude);

  return {geo: poleGeo, strat: poleStrat};

  //
  // if (mode == 'stat') {
  //   var data = [];
  //   var collection = (givenCollection) ? givenCollection : getSelectedFile('collection');
  //   collection.interpretations.forEach((dot, i) => {
  //     if (dot.visible) data.push({'x': dot[dName][DIRECTION_MODE], 'y': dot[iName][DIRECTION_MODE]});
  //   });
  //   console.log(data);
  //   fpars = fisherMean(data);
  // }
  //
  // if (fpars) {
  //   declination = fpars.dec / RADIANS;
  //   inclination = fpars.inc / RADIANS;
  //   a95 = fpars.a95 / RADIANS;
  // }
  // Convert to radians



}

function calcVGP(declination, inclination, a95, siteLatitude, siteLongitude) {

  var p = 0.5 * Math.PI - Math.atan(Math.tan(inclination) / 2);
  var poleLatitude = Math.asin(Math.sin(siteLatitude) * Math.cos(p) + Math.cos(siteLatitude) * Math.sin(p) * Math.cos(declination));
  var beta = Math.asin((Math.sin(p) * Math.sin(declination) / Math.cos(poleLatitude)).toFixed(2));
  if (Math.cos(p) - Math.sin(poleLatitude) * Math.sin(siteLatitude) < 0) {
    var poleLongitude = siteLongitude + Math.PI - beta;
  }
  else {
    var poleLongitude = siteLongitude + beta;
  }
  // Bind the plate longitude between [0, 360]
  if (poleLongitude < 0) {
    poleLongitude += 2 * Math.PI;
  }

  var paleoLat = paleolatitude(inclination);
  var dp, dm;
  // if (fpars) {
  dp = 2 * a95 / (1  + 3 * Math.pow(Math.cos(inclination), 2));
  dm = a95 * Math.sin(p) / Math.cos(inclination);
  // }

  return new Pole(
    poleLongitude * RADIANS,
    poleLatitude * RADIANS,
    paleoLat * RADIANS,
    dp * RADIANS,
    dm * RADIANS,
    a95 * RADIANS,
    siteLatitude * RADIANS,
    siteLongitude * RADIANS,
  );

}

Site.prototype.directionFrom = function(pole) {

  /*
   * Function Site.directionFrom
   * Returns the direction for this pole at a given site location
   */

  // Confirm that the constructor is a pole
  if(!(pole instanceof Pole)) {
    throw(new Exception("The passed pole is not of class Pole."));
  }

  // Convert to Radians
  var siteLat = this.lat / RADIANS;
  var siteLong = this.lng / RADIANS;
  var poleLat = pole.lat / RADIANS;
  var poleLong = pole.lng / RADIANS

  // Make sure siteLong and pole & site longitudes are in the same range
  if(siteLong < 0) {
    siteLong += 2 * Math.PI;
  }

  if(poleLong < 0) {
    poleLong += 2 * Math.PI;
  }

  var cosp = Math.sin(poleLat) * Math.sin(siteLat) + Math.cos(poleLat) * Math.cos(siteLat) * Math.cos(poleLong - siteLong);
  var sinp = Math.sqrt(1 - Math.pow(cosp, 2));

  // Clamp number between -1 and 1 (range of acos). Floating point errors may result in math.acos(1.0000000000000002) which turns in to NaN
  var declination = Math.acos(((Math.sin(poleLat) - Math.sin(siteLat) * cosp) / (Math.cos(siteLat) * sinp)).clamp(-1, 1));

  // Put in the right quadrant
  if(poleLong > siteLong && (poleLong - siteLong) > Math.PI) {
    declination = 2 * Math.PI - declination;
  }

  if(poleLong < siteLong && (siteLong - poleLong) < Math.PI) {
    declination = 2 * Math.PI - declination;
  }

  // Make sure that we are in the right quadrant
  var inclination = Math.atan2(2 * cosp, sinp);

  return new Direction(
    declination * RADIANS,
    inclination * RADIANS
  );

}

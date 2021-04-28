function watsonCongtest() {
  /*
  The Watson (1956) test of a directional data set for randomness compares the resultant vector (R)
  of a group of directions to values of Ro. If R exceeds Ro, the null-hypothesis of randomness is
  rejected. If R is less than Ro, the null-hypothesis is considered to not be disproved.
  Parameters
  ----------
  R : the resultant vector length of the directions
  n : the number of directions
  Returns
  -------
  printed text : text describing test result
  result : a dictionary with the Watson (1956) R values
  */

  // Get a list of the selected sites
  var collections = JSON.parse(localStorage.getItem("collections"));
  var collection = JSON.parse(localStorage.getItem("selectedCollection"));
  // var dirMode = localStorage.getItem('dirMode');

  if (!collection) return;

  // var coordinates = JSON.parse(localStorage.getItem("coordinates")).stat;

  document.getElementById('current-file').innerHTML = collection.name;

  // Calculate a fisherain mean from data

  var diBlock = [];

  collection.interpretations.forEach((dir, i) => {
    var position = 'normal';
    if (dir.reversed) position = 'reversed';
    diBlock.push({x: dir.geographic.dec[position], y: dir.geographic.inc[position]});
  });

  var fpars = fisher_mean(diBlock);
  var R = fpars.r, n = fpars.n;

  // Test

  Ro_values = {
    5: {95: 3.50, 99: 4.02}, 6: {95: 3.85, 99: 4.48},
    7: {95: 4.18, 99: 4.89}, 8: {95: 4.48, 99: 5.26},
    9: {95: 4.76, 99: 5.61}, 10: {95: 5.03, 99: 5.94},
    11: {95: 5.29, 99: 6.25}, 12: {95: 5.52, 99: 6.55},
    13: {95: 5.75, 99: 6.84}, 14: {95: 5.98, 99: 7.11},
    15: {95: 6.19, 99: 7.36}, 16: {95: 6.40, 99: 7.60},
    17: {95: 6.60, 99: 7.84}, 18: {95: 6.79, 99: 8.08},
    19: {95: 6.98, 99: 8.33}, 20: {95: 7.17, 99: 8.55},
  };

  if (n < 5) {
    console.log('too few directions for a conglomerate test');
    return;
  }
  else if (n < 21) {
    Ro_95 = Ro_values[n][95];
    Ro_99 = Ro_values[n][99];
  }
  else {
    Ro_95 = Math.sqrt(7.815 * (n / 3));
    Ro_99 = Math.sqrt(11.345 * (n / 3));
  }

  console.log('R = ' + R);
  console.log('Ro_95 = ' + Ro_95);
  console.log('Ro_99 = ' + Ro_99);

  var result_description = '';

  if (R < Ro_95) result_description = 'This population "passes" a conglomerate test as the null hypothesis of randomness <b>cannot be rejected</b> at the 95% confidence level';
  if (R > Ro_95) result_description = 'The null hypothesis of randomness can be <b>rejected</b> at the 95% confidence level';
  if (R > Ro_99) result_description = 'The null hypothesis of randomness can be <b>rejected</b> at the 99% confidence level';

  document.getElementById('test-result-message').innerHTML = result_description;
  document.getElementById('test-result-pars').innerHTML = 'n = ' + n + ';' + '<br>' +
   'R = ' + R.toFixed(2) + ';' +  '<br>' +
   'R₀╷₉₅ = ' + Ro_95.toFixed(2) + ';' + '<br>' +
   'R₀╷₉₉ =  ' + Ro_99.toFixed(2) + '.';


  var result = {'n': n, 'R': R, 'Ro_95': Ro_95, 'Ro_99': Ro_99};
  return result;

}

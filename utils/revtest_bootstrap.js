const progressBarElement = $("#revtest-progress");

var chartsToExport = [];

function bootstrapRevtest(plot_stereo) {
  /*
  Conduct a reversal test using bootstrap statistics (Tauxe, 2010) to
  determine whether two populations of directions could be from an antipodal
  common mean.
  Parameters
  ----------
  dec: list of declinations
  inc: list of inclinations
      or
  di_block: a nested list of [dec,inc]
      A di_block can be provided in which case it will be used instead of
      dec, inc lists.
  plot_stereo : before plotting the CDFs, plot stereonet with the
      bidirectionally separated data (default is False)
  save : boolean argument to save plots (default is False)
  save_folder : directory where plots will be saved (default is current directory, '.')
  fmt : format of saved figures (default is 'svg')
  Returns
  -------
  plots : Plots of the cumulative distribution of Cartesian components are
      shown as is an equal area plot if plot_stereo = True
  Examples
  --------
  Populations of roughly antipodal directions are developed here using
  ``ipmag.fishrot``. These directions are combined into a single di_block
  given that the function determines the principal component and splits the
  data accordingly by polarity.
  >>> directions_n = ipmag.fishrot(k=20, n=30, dec=5, inc=-60)
  >>> directions_r = ipmag.fishrot(k=35, n=25, dec=182, inc=57)
  >>> directions = directions_n + directions_r
  >>> ipmag.reversal_test_bootstrap(di_block=directions, plot_stereo = True)
  Data can also be input to the function as separate lists of dec and inc.
  In this example, the di_block from above is split into lists of dec and inc
  which are then used in the function:
  >>> direction_dec, direction_inc, direction_moment = ipmag.unpack_di_block(directions)
  >>> ipmag.reversal_test_bootstrap(dec=direction_dec,inc=direction_inc, plot_stereo = True)
  */

  const NUMBER_OF_BOOTSTRAPS = 1000;
  // Get a list of the selected sites
  var collections = JSON.parse(localStorage.getItem("collections"));
  var collection = JSON.parse(localStorage.getItem("selectedCollection"));

  if (!collection) return;

  // var coordinates = JSON.parse(localStorage.getItem("coordinates")).stat;

  document.getElementById('current-file').innerHTML = collection.name;

  // var flipData = antiCollection(collection, false);
  var diBlock = [];
  var diBlockNormal = [], diBlockRev = [];

  collection.interpretations.forEach((dir, i) => {
    diBlock.push({dec: dir.geographic.dec.normal, inc: dir.geographic.inc.normal});
  });

  splittedDirs = flipData(diBlock);

  splittedDirs.normal.forEach((dir, i) => {
    diBlockNormal.push([dir.x, dir.y]);
  });

  splittedDirs.reversed.forEach((dir, i) => {
    diBlockRev.push([dir.x, dir.y]);
  });

  chartsToExport = [];
  bootstrapCommonMean(diBlockNormal, diBlockRev, NUMBER_OF_BOOTSTRAPS, 'revtest');
}

function bootstrapCommonMeanTest() {

  const NUMBER_OF_BOOTSTRAPS = 1000;
  // Get a list of the selected sites
  var collections = JSON.parse(localStorage.getItem("collections"));

  var collectionSelector1 = document.getElementById('collection-select-1');
  var selectedIndex1 = collectionSelector1.selectedIndex;

  var collectionSelector2 = document.getElementById('collection-select-2');
  var selectedIndex2 = collectionSelector2.selectedIndex;

  // document.getElementById(type + '-file-path').innerHTML = file[type][selectedIndex].path;
  collection1 = collections[selectedIndex1];
  collection2 = collections[selectedIndex2];

  if (!collection1 || !collection2) return;

  // var coordinates = JSON.parse(localStorage.getItem("coordinates")).stat;

  document.getElementById('current-file').innerHTML = collection1.name + '; ' + collection2.name;

  // var flipData = antiCollection(collection, false);
  var diBlock1 = [], diBlock2 = [];

  collection1.interpretations.forEach((dir, i) => {
    diBlock1.push([dir.geographic.dec.normal, dir.geographic.inc.normal]);
  });

  collection2.interpretations.forEach((dir, i) => {
    diBlock2.push([dir.geographic.dec.normal, dir.geographic.inc.normal]);
  });

  chartsToExport = [];
  bootstrapCommonMean(diBlock1, diBlock2, NUMBER_OF_BOOTSTRAPS, 'common-mean');

}

function bootstrapCommonMean(Data1, Data2, NumSims, testName) {
  /*
  Conduct a bootstrap test (Tauxe, 2010) for a common mean on two declination,
  inclination data sets. Plots are generated of the cumulative distributions
  of the Cartesian coordinates of the means of the pseudo-samples (one for x,
  one for y and one for z). If the 95 percent confidence bounds for each
  component overlap, the two directions are not significantly different.
  Parameters
  ----------
  Data1 : a nested list of directional data [dec,inc] (a di_block)
  Data2 : a nested list of directional data [dec,inc] (a di_block)
          if Data2 is length of 1, treat as single direction
  NumSims : number of bootstrap samples (default is 1000)
  save : optional save of plots (default is False)
  save_folder : path to directory where plots should be saved
  fmt : format of figures to be saved (default is 'svg')
  figsize : optionally adjust figure size (default is (7, 2.3))
  x_tick_bins : because they occasionally overlap depending on the data, this
      argument allows you adjust number of tick marks on the x axis of graphs
      (default is 4)
  Returns
  -------
  three plots : cumulative distributions of the X, Y, Z of bootstrapped means
  Examples
  --------
  Develop two populations of directions using ``ipmag.fishrot``. Use the
  function to determine if they share a common mean (through visual inspection
  of resulting plots).
  >>> directions_A = ipmag.fishrot(k=20, n=30, dec=40, inc=60)
  >>> directions_B = ipmag.fishrot(k=35, n=25, dec=42, inc=57)
  >>> ipmag.common_mean_bootstrap(directions_A, directions_B)
  */
  if (!NumSims) NumSims = 1000;

  var counter = 0, cart = [];

  var BDI1 = di_boot(Data1, NumSims);
  var cart1 = transpose(dir2cart(BDI1))//.transpose();
  var X1 = cart1[0], Y1 = cart1[1], Z1 = cart1[2];
  var X2, Y2, Z2;
  $("#revtest-progress").css("width", "0%");

  var BDI2 = (Data2.length) ? di_boot(Data2, NumSims) : Data2;
  var cart2 = transpose(dir2cart(BDI2))//.transpose();
  X2 = cart2[0], Y2 = cart2[1], Z2 = cart2[2];

  var type = "commonMeanTest";
  if (testType == "Revtest") type = "revtest";
  localStorage.setItem(type, JSON.stringify([{x: X1, y: Y1, z: Z1}, {x: X2, y: Y2, z: Z2}]));

  plotCDF(X1, X2, 'X', 'x-container');
  plotCDF(Y1, Y2, 'Y', 'y-container');
  plotCDF(Z1, Z2, 'Z', 'z-container');

}

function plotCDF(data1, data2, componentName, chartContainer) {

  function tooltip() {

    if (this.series.name === "Bootstraps") {
      return [
        "<b>Original Data</b>",
        "<b>Unfolding Percentage</b>: " + this.x + "%",
        "<b>Maximum Eigenvalue</b>: " + this.y.toFixed(3)
      ].join("<br>");
    }
    else if (this.series.name === "CDF") {
      return [
        "<b>Cumulative Probability</b>",
        "<b>Component</b>: " + this.x + "%",
        "<b>CDF</b>: " + this.y.toFixed(3)
      ].join("<br>");
    }

  }

  $("#progress").css("width", "0%");

  if (!data1) return;

  var cdf1 = getCDF(data1);
  var cdf2 = (data2.length > 1) ? getCDF(data2) : getVerticalLine(data1[0]);

  var minimum = parseInt(0.025 * data1.length);
  var maximum = parseInt(0.975 * data1.length);

  bounds1 = [data1[minimum], data1[maximum]];
  bounds2 = (data2.length > 1) ? [data2[minimum], data2[maximum]] : undefined;

  var mySeries = [{
    name: (testType == "Revtest") ? "CDF normal" : "CDF 1",
    type: "line",
    color: '#119DFF',
    step: true,
    data: cdf1,
    marker: {
      enabled: false
    }
  },{
    name: (testType == "Revtest") ? "CDF reversed" : "CDF 2",
    type: "line",
    color: '#9933FF',
    step: true,
    data: cdf2,
    marker: {
      enabled: false
    }
  }]

  mySeries.push({
    name: 'Confidence interval',
    id: 'confidence95_1',
    type: 'line',
    color: '#119DFF',
    dashStyle: 'dash',
    data: getVerticalLine(bounds1[0]),
    enableMouseTracking: false,
    marker: {
      enabled: false,
    }
  },{
    linkedTo: 'confidence95_1',
    type: 'line',
    color: '#119DFF',
    dashStyle: 'dash',
    data: getVerticalLine(bounds1[1]),
    enableMouseTracking: false,
    marker: {
      enabled: false,
    }
  });

  mySeries.push({
    name: 'Confidence interval',
    id: 'confidence95_2',
    type: 'line',
    color: '#9933FF',
    dashStyle: 'dash',
    data: (bounds2) ? getVerticalLine(bounds2[0]) : [],
    enableMouseTracking: false,
    marker: {
      enabled: false,
    }
  },{
    linkedTo: 'confidence95_2',
    type: 'line',
    color: '#9933FF',
    dashStyle: 'dash',
    data: (bounds2) ? getVerticalLine(bounds2[1]) : [],
    enableMouseTracking: false,
    marker: {
      enabled: false,
    }
  });

  var xAxisName = componentName + ' Component';
  var yAxisName = 'CDF';

  var chart = new Highcharts.chart(document.getElementById(chartContainer), {
    chart: {
      id: "revtest_" + componentName,
      zoomType: "x",

      plotBorderWidth: 1,
      plotBorderColor: "black",
    },
    title: {
      text: xAxisName,
    },

    // subtitle: {
    //   text: "highest τ1 between [" + lower + ", " + upper + "] % unfolding (" + cdf.length + " bootstraps)",
    // },

    exporting: {
      filename: "revtest",
      sourceWidth: 500,
      sourceHeight: 500,
      resources: JSON.stringify({"css": ".highcharts-xaxis .highcharts-tick {transform: translateY(-1.05%); stroke: black;}"}),
      menuItemDefinitions: {
        // Custom definition
        downloadJPEG: {
          text: 'Save as JPEG'
        },
        downloadPNG: {
          text: 'Save as PNG'
        },
        downloadSVG: {
          text: 'Save as SVG'
        },
        // separator: {
        //   style: {"margin-top": 0.5rem;
        //   "margin-bottom": 0.5rem;}
        // }
      },
      buttons: {
        contextButton: {
          symbolStroke: "#119DFF",
          align: "right",
          symbol: 'download',
          // menuItems: ["downloadJPEG", "downloadPDF", "downloadSVG"],
          menuItems: [
            'downloadPNG',
            'downloadJPEG',
            {
            	text: 'Save as PDF',
            	onclick: function () {
                Highcharts.exportCharts(
                  [this],
                  {
                    type: 'application/pdf',
                    filename: (testType == "Revtest") ? 'revtest-' + xAxisName : 'common-mean-test-' + xAxisName,
                  },
                  undefined,
                  'intensity'
                );
            	}
            },
            'downloadSVG',
          ],
        },
      },
    },

    navigation: {
      menuItemStyle: {
          fontWeight: 'normal',
          background: 'none'
      },
      menuItemHoverStyle: {
          // fontWeight: 'bold',
          background: '#119DFF',
          color: 'white'
      }
    },

    xAxis: {
      min: Math.min(cdf1[0].x, cdf2[0].x) - 0.1,
      max: Math.max(cdf1[cdf1.length - 1].x, cdf2[cdf2.length - 1].x) + 0.1,
      tickInterval: 0.25,
      pointInterval: 10,
      tickColor: "black",
      tickLength: 6,
      startOnTick: false,
      endOnTick: false,
      labels: {
        useHTML: true,
        style: {
          color: "black",
        }
      },
      lineWidth: 1,
      lineColor: "black",
      title: {
        text: xAxisName,
        style: {
          color: "black",
        }
      },
      // plotBands: plotBands
    },

    yAxis: {
      floor: 0,
      ceiling: 1,
      gridLineColor: "black",
      minorGridLineWidth: 0,
      gridLineDashStyle: "Dash",
      type: "linear",
      lineColor: "black",
      startOnTick: false,
      endOnTick: false,
      labels: {
        useHTML: true,
        x: -5,
        style: {
          color: "black",
        }
      },
      title: {
        text: yAxisName,
        align: 'high',
        rotation: 0,
        style: {color: 'black'},
        offset: 0,
        x: 10,
        y: -10,
     }
    },
    credits: {
      text: 'PMTools v' + getVersion(),
    },
    tooltip: {
      enabled: true,
      formatter: tooltip
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        },
      },
      series : {
        animation: false,
        cursor: "pointer",
        turboThreshold: 10000,
      }
    },
    series: mySeries
  });

  chartsToExport.push(chart);

}

function di_boot(DIs, nb) {
  /*
   returns bootstrap means  for Directional data
   Parameters
   _________________
   DIs : nested list of Dec,Inc pairs
   nb : number of bootstrap pseudosamples
   Returns
  -------
   BDIs:   nested list of bootstrapped mean Dec,Inc pairs
  */

  //now do bootstrap to collect BDIs  bootstrap means

  // if (!nb) nb = 5000;
  nb = 1000;

  BDIs = []  // number of bootstraps, list of bootstrap directions

  for (let i = 0; i < nb; i++) {  // repeat nb times
    // if k % 50 == 0 : print k,' out of ',nb
    // pDIs = pseudo(DIs);  // get a pseudosample
    var pDIs = drawBootstrap(DIs);
    pDIsData = [];
    for (let i = 0; i < pDIs.length; i++) {
      pDIsData.push({x: pDIs[i][0], y: pDIs[i][1]});
    }
    bfpars = fisher_mean(pDIsData); // get bootstrap mean bootstrap sample
    BDIs.push([bfpars['dec'], bfpars['inc']]);

    // Update the DOM progress bar with the percentage completion
    // progressBarElement.css("width", 100 * (i / nb) + "%");
  }

  return BDIs;
}

function pseudo(DIs) {
  /*
  Draw a bootstrap sample of directions returning as many bootstrapped samples
  as in the input directions

  Parameters
  ----------
  DIs : nested list of dec, inc lists (known as a di_block)
  random_seed : set random seed for reproducible number generation (default is None)

  Returns
  -------
  Bootstrap_directions : nested list of dec, inc lists that have been
  bootstrapped resampled
  */
  // if (random_seed) np.random.seed(random_seed);
  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  Inds = new Array(DIs.length).fill(getRandomInt(DIs.length));//, size=len(DIs))
  // D = np.array(DIs)
  return DIs[Inds];
}

function __init__() {

  var data = [];

  var revtestData = JSON.parse(localStorage.getItem("revtest"));
  var commonMeanData = JSON.parse(localStorage.getItem("commonMeanTest"));
  if (testType == "Revtest") data = revtestData;
  else {
    updateFileSelect("collection", 0, 'collection-select-1');
    updateFileSelect("collection", 0, 'collection-select-2');
    data = commonMeanData;
  }
  if (data) {
    plotCDF(data[0].x, data[1].x, 'X', 'x-container');
    plotCDF(data[0].y, data[1].y, 'Y', 'y-container');
    plotCDF(data[0].z, data[1].z, 'Z', 'z-container');
  }
}

const testType = document.title;
__init__();

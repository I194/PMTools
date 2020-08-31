function statPlotStereoDiagram(hover) {

  var collection = getSelectedFile('collection');

  if (!collection) return document.getElementById('stat-container-center').innerHTML = '';

  // Get the Boolean flags for the graph
  var enableLabels = settings.stat.statAnnotations;
  var enableTooltips = settings.stat.statTooltips;
  var allowOverlap = settings.stat.allowOverlap;
  var addTextOutline = settings.stat.addTextOutline;
  var showError = settings.stat.statError;

  // Format a Highcharts data bucket for samples that are visible
  var dataPos = new Array(), dataNeg = new Array(), dataAbs = new Array();

  var dataSeries = new Array(), dataErrors = new Array();
  var dataSeriesPole = new Array();
  var dataSeriesFlip = new Array();
  var selectedInterpretationIndex = null;

  var interpretations = collection.interpretations;
  // var flipData = flipCollections();

  var statistics = getStatisticalParameters(collection.interpretations);

  var baseSite = getSite() // new Site(0, 0);

  interpretations.forEach(function(interpretation, i) {

    if (!interpretation.visible) return;

    var mean = collection.means[0];
    if (collection.means.length > 1) mean = collection.means[collection.means.length - 1];

    var dec, inc, meanDec, meanInc;
    if (COORDINATES['stat'] == 'specimen') {
      dec = interpretation.Dspec[DIRECTION_MODE];
      inc = interpretation.Ispec[DIRECTION_MODE];
    }
    else if (COORDINATES['stat'] == 'geographic') {
      dec = interpretation.Dgeo[DIRECTION_MODE];
      inc = interpretation.Igeo[DIRECTION_MODE];
    }
    else {
      dec = interpretation.Dstrat[DIRECTION_MODE];
      inc = interpretation.Istrat[DIRECTION_MODE];
    }

    var pole = baseSite.poleFrom(new Direction(dec, inc));

    // Simple rotation rotate all vectors with mean vector to up/north
    pole = pole.toCartesian().rotateTo(-statistics.pole.mean.lng, 90).rotateFrom(0, statistics.pole.mean.lat).rotateTo(statistics.pole.mean.lng, 90).toVector(Pole);

    // if (DIRECTION_MODE == 'reversed') {
    //   dec = flipData[COORDINATES.stat][i].x;
    //   inc = flipData[COORDINATES.stat][i].y;
    // }

    dataSeriesPole.push({
      x: pole.lng,
      y: projectInclination(pole.lat),
      inc: pole.lat,
      id: interpretation.id,
      dotIndex: interpretation.index,
      // "marker": {
      //   "fillColor": (pole.lat < 0 ? 'white' : 'black'),
      //   "lineWidth": 1,
      //   "lineColor": 'black',
      // }
    });

    var interpret_data = {
      x: dec,
      y: Math.abs(inc),
      inc: inc,
      dotIndex: interpretation.index,
      id: interpretation.id,
    };
    dataSeries.push({
      x: dec,
      y: Math.abs(inc),
      inc: inc,
      // marker: {
      //   fillColor: (inc < 0 ? 'white' : 'black'),
      //   lineWidth: 1,
      //   lineColor: 'black',
      // },
      dotIndex: interpretation.index,
      id: interpretation.id,
      innerColor: (inc < 0 ? 'white' : 'black'),
    });

    if (showError) {
      if (settings.global.dashedLines) {
        dataErrors.push(
          getSmallCircle(dec, Math.abs(inc), interpretation.mad, true)
        )
      }
      else {
        dataErrors.push(
          getSmallCircle(dec, Math.abs(inc), interpretation.mad, false)
        )
      }
    };

    if (inc < 0) dataNeg.push(interpret_data);
    else dataPos.push(interpret_data);
    dataAbs.push({
      x: dec,
      y: inc,
      inc: inc,
      index: interpretation.index,
      id: interpretation.id,
      dotIndex: interpretation.index,
    });

  });

  var selectedDot;
  if (selectedInterpretationIndex === null) {
    selectedDot = {"x": null, "y": null}
  } else {
    selectedDot = dataSeries[selectedStepIndex];
  }

  var markerSize = {
    radius: 2.5,
    lineWidth: 0.6,
  }

  var chartContainer = document.getElementById('stat-container-center'),
    chartIndex = chartContainer.getAttribute('data-highcharts-chart'),
    chart = Highcharts.charts[chartIndex];

  // Only redraw the hover series (series: 0, data: 0)
  if (chart && hover) {
    // chart.series[0].data[0].update(selectedDot);
    chart.series[0].update({
      type: "scatter",
      linkedTo: "Directions",
      zIndex: 10,
      data: [selectedDot], // [{x: selectedDot.x, y:selectedDot.y}],
      marker: {
        lineWidth: 1,
        symbol: "square",
        radius: 3,
        lineColor: 'black',
        fillColor: selectedDot['innerColor'],
      }
    });
    return;
  }

  var A95Ellipse = getConfidenceEllipse(statistics.pole.confidence);
  var a95ellipse = getPlaneData(statistics.dir.mean, statistics.dir.confidence);
  // Initialize basic polar series
  var basicSeries = [
    {
      type: "scatter",
      name: 'Up',
      id: "Up",
      data: dataPos,//plot_directions.pos,
      zIndex: 5,
      marker: {
        radius: markerSize.radius,
        lineColor: "black",
        lineWidth: markerSize.lineWidth,
        fillColor: "black",
        symbol: "circle",
      },
      dataLabels: {
        color: "grey",
        enabled: enableLabels,
        allowOverlap: allowOverlap,
        padding: 0,
        style: {
          fontSize: "10px",
          textOutline: (addTextOutline) ? "1px contrast" : "0px",
        },
        formatter: function() {
          return makeDataLabelStat(this.point);
        }
      },
      color: "black",
    },
    {
      type: "scatter",
      name: 'Down',
      id: 'Down',
      data: dataNeg,
      zIndex: 5,
      marker: {
        radius: markerSize.radius,
        lineColor: "black",
        lineWidth: markerSize.lineWidth,
        fillColor: "white",
        symbol: "circle",
      },
      dataLabels: {
        color: "grey",
        enabled: enableLabels,
        allowOverlap: allowOverlap,
        padding: 0,
        style: {
          fontSize: "10px",
          textOutline: (addTextOutline) ? "1px contrast" : "0px",
        },
        formatter: function() {
          return makeDataLabelStat(this.point);
        }
      },
      color: "black",
    },
  ];
  var poleSeries = [
    {
      type: "scatter",
      name: 'VGP',
      data: dataSeriesPole,//plot_directions.pos,
      zIndex: 5,
      marker: {
        radius: markerSize.radius,
        lineColor: "black",
        lineWidth: markerSize.lineWidth,
        fillColor: "black",
        symbol: "circle",
      },
      dataLabels: {
        color: "grey",
        enabled: enableLabels,
        allowOverlap: allowOverlap,
        padding: 0,
        style: {
          fontSize: "10px",
          textOutline: (addTextOutline) ? "1px contrast" : "0px",
        },
        formatter: function() {
          return makeDataLabelStat(this.point);
        }
      },
      color: "black",
    },
    {
      "name": "Confidence Ellipse",
      "type": "line",
      "color": '#119dff',
      "data": A95Ellipse.map(prepareDirectionData),
      "enableMouseTracking": false,
      "marker": {
        "enabled": false
      }
    }
  ];

  var selectedSeries = {
    type: "scatter",
    linkedTo: "Directions",
    zIndex: 10,
    data: [selectedDot], // [{x: selectedDot.x, y:selectedDot.y}],
    marker: {
      lineWidth: 1,
      symbol: "square",
      radius: 3,
      lineColor: 'black',
      fillColor: selectedDot['innerColor'],
    }
  }

  // var bcPath = plot_big_circle_path(dataAbs);

  var element_width = chartContainer.offsetWidth;
  element_width -= element_width % 10;

  var ticksN = new Array();
  var ticksE = new Array();
  var ticksS = new Array();
  var ticksW = new Array();
  for (let tick = 0; tick <= 90; tick += 10) {
    ticksN.push({x: 0, y: tick});
    ticksE.push({x: 90, y: tick});
    ticksS.push({x: 180, y: tick});
    ticksW.push({x: 270, y: tick});
  }
  var ticksX = ticksW.concat(ticksE);
  var tickSeriesX = {
    type: "scatter",
    enableMouseTracking: false,
    data: ticksX,
    zIndex: 5,
    color: "black",
    showInLegend: false,
    marker: {
      radius: 2,
      lineWidth: 1,
      symbol: "VlineS",
      lineColor: "black",
    }
  }
  var tickSeriesTop = {
    type: "scatter",
    enableMouseTracking: false,
    data: ticksN,
    zIndex: 5,
    color: "black",
    showInLegend: false,
    marker: {
      radius: 2,
      lineWidth: 1,
      symbol: "HlineSTop",
      lineColor: "black",
    }
  }
  var tickSeriesBot = {
    type: "scatter",
    enableMouseTracking: false,
    data: ticksS,
    zIndex: 5,
    color: "black",
    showInLegend: false,
    marker: {
      radius: 2,
      lineWidth: 1,
      symbol: "HlineSBot",
      lineColor: "black",
    }
  }

  if (settings.stat.statTicks) {
    basicSeries.push(tickSeriesX, tickSeriesTop, tickSeriesBot);
    poleSeries.push(tickSeriesX, tickSeriesTop, tickSeriesBot);
  }

  if (settings.global.dashedLines) {
    dataErrors.forEach((errorCircle, i) => {
      var errorSeriesPos = {
        enableMouseTracking: false,
        type: "line",
        name: "error_circles",
        linkedTo: "Up",
        lineWidth: 0.5,
        data: errorCircle.pos,
        connectEnds: false,
        marker: {
          enabled: false
        }
      };
      var errorSeriesNeg = {
        enableMouseTracking: false,
        type: "line",
        name: "error_circles",
        linkedTo: "Down",
        lineWidth: 0.5,
        data: errorCircle.neg,
        dashStyle: "LongDash",
        connectEnds: false,
        marker: {
          enabled: false
        }
      };

      basicSeries.push(errorSeriesPos);
      basicSeries.push(errorSeriesNeg);
      poleSeries.push(errorSeriesPos);
      poleSeries.push(errorSeriesNeg);
    });
  }
  else {
    dataErrors.forEach((errorCircle, i) => {
      var errorSeries = {
        enableMouseTracking: false,
        type: "line",
        name: "error_circles",
        linkedTo: "Up",
        lineWidth: 0.5,
        data: errorCircle,
        connectEnds: false,
        marker: {
          enabled: false
        }
      };

      basicSeries.push(errorSeries);
      poleSeries.push(errorSeries);
    });
  }

  var series = (CENTERED_MODE == 'centered') ? poleSeries : basicSeries;

  if (CENTERED_MODE != 'centered') series = series.concat(formatMeansSeries(collection.means, 'stat'),);

  var options = {

    chart: {
      // styledMode: true,
      polar: true,
      className: "stat-plot",
      animation: false,
      // events: {
      //   load: resetMarkerSize,
      // },
    },

    tooltip: {
      enabled: enableTooltips,
      formatter: generateStereoTooltip,
    },

    title: {
      text: ''
    },

    // legend: {
    //   enabled: false,
    //   align: 'right',
    //   verticalAlign: 'top',
    //   layout: 'vertical',
    //   x: 0,
    //   y: 50
    // },

    pane: {
      startAngle: 0,
      endAngle: 360
    },

    exporting: {
      url: 'http://export.highcharts.com/index-utf8-encode.php',
      filename: "stereo_chart",
      sourceWidth: 500,
      sourceHeight: 500,
      menuItemDefinitions: {
        // Custom definition
        downloadJPEG: {
          text: 'Save as JPEG'
        },
        downloadPDF: {
          text: "Save as PDF"
        },
        downloadSVG: {
          text: "Save as SVG"
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
          menuItems: ["downloadJPEG", "downloadPDF", "downloadSVG"],
          // menuItems: [
          //   {
          //   	textKey: 'downloadPNG',
          //   	onclick: function () { this.exportChart(); }
          //   }, {
          //   	textKey: 'downloadJPEG',
          //   	onclick: function () {
          //   		this.exportChart({
          //   			type: 'image/jpeg'
          //   		});
          //   	}
          //   },
          //   { separator: true },
          //   {
          //   	textKey: 'downloadPDF',
          //   	onclick: function () {
          //   		this.exportChart({
          //   			type: 'application/pdf'
          //   		});
          //   	}
          //   }, {
          //   	textKey: 'downloadSVG',
          //   	onclick: function () {
          //   		this.exportChart({
          //   			type: 'image/svg+xml'
          //   		});
          //   	}
          //   },
          // ],
        },
      },
      chartOptions: {
        chart: {
          events: {
            load: function () {
              // update tick series
              // horzontal
              this.series[2].update({
                marker: {
                	symbol: 'EVlineS',
                }
              });
              // vertical
              this.series[3].update({
                marker: {
                	symbol: 'EHlineSTop',
                }
              });
              this.series[4].update({
                marker: {
                	symbol: 'EHlineSBot',
                }
              });
            }
          }
        }
      }
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

    // mapNavigation: {
    //     enableMouseWheelZoom: true
    // },

    credits: {
      enabled: false,
      text: "PMTools.com (Zijderveld Diagram)",
      href: ""
    },

    xAxis: {
      minorTickPosition: "outside",
      lineColor: "black",
      // gridLineDashStyle: "Dot",
      // gridLineColor: "black",
      gridLineWidth: 0,
      minorGridLineWidth: 0,
      type: "linear",
      min: 0,
      max: 360,
      tickPositions: [0, 90, 180, 270, 360],
      minorTickColor: "black",
      minorTickInterval: 90,
      minorTickLength: 5,
      minorTickWidth: 1,
      min: 0,
      max: 360,
      labels: {
        formatter: function() {
          if (this.value == 0) return 'N';
          if (this.value == 90) return 'E';
          if (this.value == 180) return 'S';
          if (this.value == 270) return 'W';
        },
        style: {
          color: "black",
        }
      },
    },

    yAxis: {
      type: "linear",
      gridLineWidth: 0,
      minorGridLineWidth: 0,
      visible: false,
      reversed: true,
      labels: {
        enabled: false
      },
      tickInterval: 90,
      min: 0,
      max: 90,
    },

    plotOptions: {
      line: {
        lineWidth: 1,
        color: "black",
        connectEnds: false,
        // enableMouseTracking: false,
      },
      series : {
        animation: false,
        cursor: "pointer",
        turboThreshold: 10000,
        states: {
          hover: {
            enabled: settings.stat.statHover,
          },
          inactive: {
            opacity: 1
          }
        }
      }
    },

    series: series,
  }

  var chart = Highcharts.chart('stat-container-center', options)

}

function generateStereoTooltip() {

  /*
   * Function generateHemisphereTooltip
   * Generates the Hemisphere chart tooltip
   */

  if (this.series.name === "Directions") {
    return [
      "<b>#: </b>" + (this.point.stepIndex + 1),
      "<b>Step: </b>" + this.point.step,
      "<b>Dec: </b>" + this.x.toFixed(2),
      "<b>Inc </b>" + this.point.inc.toFixed(2)
    ].join("<br>");
  }
  else if (this.series.name === "VGP") {
    return [
      "<b>VGP</b>",
      "<b>Sample id: </b>" + this.point.id,
      "<b>Longitude: </b>" + this.x.toFixed(2),
      "<b>Latitude: </b>" + this.point.inc.toFixed(2)
    ].join("<br>");
  }
  else {
    return [
      "<b>Direction</b>",
      "<b>Sample id: </b>" + this.point.id,
      "<b>Dec: </b>" + this.x.toFixed(2),
      "<b>Inc: </b>" + this.point.inc.toFixed(2)
    ].join("<br>");
  }

}

function prepareDirectionData(direction) {

  /*
   * Function prepareDirectionData
   * Prepared a direction for plotting by projecting the inclination
   */

  return {
    "x": direction.dec,
    "y": projectInclination(direction.inc),
    "inc": direction.inc
  }

}

function getConfidenceEllipse(angle) {

  /*
   * Function getConfidenceEllipse
   * Returns confidence ellipse around up North
   */

  // Define the number of discrete points on an ellipse
  const NUMBER_OF_POINTS = 101;

  var vectors = new Array();

  // Create a circle around the pole with angle confidence
  for(var i = 0; i < NUMBER_OF_POINTS; i++) {
    vectors.push(new Direction((i * 360) / (NUMBER_OF_POINTS - 1), 90 - angle));
  }

  // Handle the correct distribution type
  return vectors;

}

function statPlotStereoDiagram(hover) {

  var collection = getSelectedFile('collection');

  if (!collection) return document.getElementById('stat-container-center').innerHTML = '';

  // Get the Boolean flags for the graph
  var enableLabels = settings.stat.statAnnotations;
  var enableTooltips = settings.stat.statTooltips;
  var allowOverlap = settings.stat.statAllowOverlap;
  var addTextOutline = settings.stat.statAddTextOutline;
  var showError = settings.stat.statError;
  var showDir = settings.stat.statDir;
  var showGC = settings.stat.statGC;

  // Format a Highcharts data bucket for samples that are visible
  var dataPos = new Array(), dataNeg = new Array(), dataAbs = new Array();
  var dirDataPos = new Array(), dirDataNeg = new Array();
  // var dataPosGCpos = new Array(), dataGCneg = new Array();

  var dataSeries = new Array(), dataErrors = new Array();
  var dataSeriesPole = new Array();
  var dataSeriesFlip = new Array();
  var hoverIndex;

  var interpretations = collection.interpretations;

  interpretations.forEach(function(interpretation, i) {

    if (!interpretation.visible) return;
    if (interpretation.hover) hoverIndex = interpretation.index;

    var mean = undefined;
    if (collection.means.length > 0) mean = collection.means[collection.means.length - 1][COORDINATES.stat];

    var position = 'normal';
    if (interpretation.reversed) position = 'reversed';

    var dec, inc, meanDec, meanInc, mad;
    var dec = interpretation[COORDINATES.stat].dec[position];
    var inc = interpretation[COORDINATES.stat].inc[position];
    var mad = interpretation[COORDINATES.stat].mad;

    if (TO_CENTER && mean) {
      document.getElementById('calculate-f').innerHTML = '';
      tmpdir = rotateTo({dec: dec, inc: inc}, mean.dec, 0);
      tmpdir = rotateTo(tmpdir, 0, -(90-mean.inc));
      dec = tmpdir.dec;
      inc = tmpdir.inc;
    }

    var interpret_data = {
      x: dec,
      y: Math.abs(inc),
      inc: inc,
      mad: mad,
      dotIndex: interpretation.index,
      id: interpretation.id,
    };

    dataSeries.push({
      x: dec,
      y: Math.abs(inc),
      inc: inc,
      mad: mad,
      // marker: {
      //   fillColor: (inc < 0 ? 'white' : 'black'),
      //   lineWidth: 1,
      //   lineColor: 'black',
      // },
      dotIndex: interpretation.index,
      id: interpretation.id,
      innerColor: (inc < 0) ? 'white' : 'black',
    });

    if (showError && ((!showDir && interpretation.code.slice(0, 2) != 'GC') || showDir)) {
      interpret_data.errorCircle = getSmallCircle(dec, Math.abs(inc), interpretation[COORDINATES.stat].mad, true);
    };

    if ((interpretation.code.slice(0, 2) == 'GC') && showGC) {
      var direction = new Direction(dec, inc);
      interpret_data.GCpos = getPlaneData(direction).positive;
      interpret_data.GCneg = getPlaneData(direction).negative;
    }

    if (interpretation.code.slice(0, 2) != 'GC') {
      if (inc < 0) dirDataNeg.push(interpret_data);
      else dirDataPos.push(interpret_data);
    }

    if (inc < 0) dataNeg.push(interpret_data);
    else dataPos.push(interpret_data);
    dataAbs.push({
      x: dec,
      y: inc,
      inc: inc,
      mad: mad,
      index: interpretation.index,
      id: interpretation.id,
      dotIndex: interpretation.index,
    });

  });

  var hoverDot;
  if (!hoverIndex && (hoverIndex != 0)) hoverDot = {"x": null, "y": null}
  else hoverDot = dataSeries[hoverIndex];

  var markerSize = {
    radius: 2.5,
    lineWidth: 0.6,
  }

  var chartContainer = document.getElementById('stat-container-center'),
    chartIndex = chartContainer.getAttribute('data-highcharts-chart'),
    chart = Highcharts.charts[chartIndex];

  // Only redraw the hover series (series: 0, data: 0)
  if (chart && hover) {
    chart.series[0].data[0].update(hoverDot);
    return;
  }

  var hoverSeries = {
    type: "scatter",
    linkedTo: "Down",
    zIndex: 10,
    data: [hoverDot],
    marker: {
      lineWidth: 1,
      symbol: "circle",
      radius: 4,
      lineColor: 'black',
      fillColor: hoverDot['innerColor'],
    }
  }

  // Initialize basic polar series
  var basicSeries = [
    hoverSeries,
    {
      type: "scatter",
      name: 'Down',
      id: "Down",
      data: (showDir) ? dataPos : dirDataPos,
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
      name: 'Up',
      id: 'Up',
      data: (showDir) ? dataNeg : dirDataNeg,
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

  dataPos.forEach((dir, i) => {
    basicSeries = basicSeries.concat({
      data: (dir.GCpos) ? dir.GCpos : [],
      linkedTo: "Down",
      type: "line",
      color: "black",
      enableMouseTracking: false,
      marker: {
        enabled: false
      }
    }, {
      data: (dir.GCneg) ? dir.GCneg : [],
      linkedTo: "Down",
      type: "line",
      color: "black",
      enableMouseTracking: false,
      dashStyle: (settings.global.dashedLines) ? "LongDash" : "Solid",
      marker: {
        enabled: false
      }
    }, {
      enableMouseTracking: false,
      type: "line",
      name: "error_circles",
      linkedTo: "Down",
      lineWidth: 0.5,
      data: (dir.errorCircle) ? dir.errorCircle.pos : [],
      connectEnds: false,
      marker: {
        enabled: false
      }
    }, {
      enableMouseTracking: false,
      type: "line",
      name: "error_circles",
      linkedTo: "Down",
      lineWidth: 0.5,
      data: (dir.errorCircle) ? dir.errorCircle.neg : [],
      dashStyle: (settings.global.dashedLines) ? "LongDash" : "Solid",
      connectEnds: false,
      marker: {
        enabled: false
      }
    })
  });

  dataNeg.forEach((dir, i) => {
    basicSeries = basicSeries.concat({
      data: (dataNeg[i].GCpos) ? dataNeg[i].GCpos : [],
      linkedTo: "Up",
      type: "line",
      color: "black",
      enableMouseTracking: false,
      marker: {
        enabled: false
      }
    }, {
      data: (dataNeg[i].GCneg) ? dataNeg[i].GCneg : [],
      linkedTo: "Up",
      type: "line",
      color: "black",
      enableMouseTracking: false,
      dashStyle: (settings.global.dashedLines) ? "LongDash" : "Solid",
      marker: {
        enabled: false
      }
    },  {
      enableMouseTracking: false,
      type: "line",
      name: "error_circles",
      linkedTo: "Up",
      lineWidth: 0.5,
      data: (dir.errorCircle) ? dir.errorCircle.pos : [],
      connectEnds: false,
      marker: {
        enabled: false
      }
    }, {
      enableMouseTracking: false,
      type: "line",
      name: "error_circles",
      linkedTo: "Up",
      lineWidth: 0.5,
      data: (dir.errorCircle) ? dir.errorCircle.neg : [],
      dashStyle: (settings.global.dashedLines) ? "LongDash" : "Solid",
      connectEnds: false,
      marker: {
        enabled: false
      }
    })
  });

  var element_width = chartContainer.offsetWidth;
  element_width -= element_width % 10;

  // Chart ticks
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
  }

  // Final series
  var series = basicSeries.concat(formatMeansSeries(collection.means[collection.means.length - 1], 'stat'),);

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

    boost: {
      enabled: false,
      // useGPUTranslations: true,
      // usePreallocated: true,
    },

    tooltip: {
      enabled: enableTooltips,
      formatter: generateStereoTooltipStat,
    },

    title: {
      text: 'DirStat | ' + COORDINATES['stat'],
      align: 'left',
      margin: -25
    },

    // subtitle: {
    //   text: 'System: ' + COORDINATES['poles'],
    //   align: 'left',
    //   margin: -50
    // },

    credits: {
      text: 'PMTools v' + getVersion(),
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
                    filename: "stereo_chart",
                  },
                  undefined,
                  'stereo'
                );
            	}
            },
            'downloadSVG',
          ],
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
      gridLineWidth: 1,
      minorGridLineWidth: 1,
      visible: true,
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
        point: {
          events: {
            click: function () {
              dotSelector.hoverDot(this.dotIndex, 'collection');
            },
          }
        },
        states: {
          hover: {
            enabled: settings.stat.statHover,
          },
          inactive: {
            opacity: 1
          }
        },
        stickyTracking: false
      }
    },

    series: series,
  }

  var chart = Highcharts.chart('stat-container-center', options)

  return chart;

}

function generateStereoTooltipStat() {

  /*
   * Function generateHemisphereTooltip
   * Generates the Hemisphere chart tooltip
   */

  if ((this.series.name === "Down") || (this.series.name === "Up")) {
    return [
      "<b>Direction</b>",
      "<b>#: </b>" + (this.point.dotIndex + 1),
      "<b>Dec: </b>" + this.x.toFixed(2),
      "<b>Inc </b>" + this.point.inc.toFixed(2),
      "<b>MAD </b>" + this.point.mad.toFixed(2)
    ].join("<br>");
  }
  else {
    return [
      "<b>Mean Direction</b>",
      "<b>Dec: </b>" + this.x.toFixed(2),
      "<b>Inc: </b>" + this.point.inc.toFixed(2),
      "<b>a95: </b>" + this.point.a95.toFixed(2)
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

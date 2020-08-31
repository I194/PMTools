function plotZijderveldDiagram(hover, onMain) {

  var proj_type = 'upwest';

  var specimen = getSelectedFile('specimen');

  if (!specimen) return document.getElementById('container-center').innerHTML = '';

  //Specimen metadata (core and bedding orientations)
  var coreBedding = specimen.coreAzimuth;
  var coreDip = specimen.coreDip;
  var beddingStrike = specimen.beddingStrike;
  var beddingDip = specimen.beddingDip;

  // Data bucket for inclination/declination lines and scale
  // var horizontal = new Array();
  // var vertical = new Array();
  // var graphScale = new Array();

  var steps = specimen.steps;

  if (settings.pca.zijdHide) {
    if (specimen.interpretations.length > 0) {
      steps = specimen.interpretations[specimen.interpretations.length - 1].steps;
    }
  }

  var dataBucket = coordsFromSteps(steps);

  var selectedStepIndex = dataBucket['selStepIndex'];

  // If the step is not visible hide the hover point or otherwise highlight selected step
  if (selectedStepIndex === null) {
    vSelectedDot = {"x": null, "y": null};
    hSelectedDot = {"x": null, "y": null};
  }
  else {
    vSelectedDot = dataBucket['vert'][selectedStepIndex];
    hSelectedDot = dataBucket['hor'][selectedStepIndex];
  }

  var chartContainer = ChartContainersPCA[1];
  var markerSize = {
    radius: 2.5,
    lineWidth: 0.6,
  }
  // if (!onMain) {
  //   chartContainer = 'container-left';
  //   markerSize.radius = 2;
  //   markerSize.lineWidth = 0.5;
  // }

  var container = document.querySelector('#'+chartContainer),
    chartIndex = container.getAttribute('data-highcharts-chart'),
    chart = Highcharts.charts[chartIndex];

  if(chart && hover) {
    chart.series[0].data[0].update(hSelectedDot);
    chart.series[1].data[0].update(vSelectedDot);
    return;
  }

  var graphScale = Math.max.apply(Math, dataBucket['scale']);//graphScale);
  var tickFlag = false;
  // var graphScale = [];
  // graphScale = border_dot + 1;

  var enableLabels = settings.pca.zijdAnnotations;
  var enableTooltips = settings.pca.zijdTooltips;
  var allowOverlap = settings.pca.allowOverlap;
  var addTextOutline = settings.pca.addTextOutline;

  var element_width = document.getElementById(chartContainer).clientWidth;
  var element_height = document.getElementById(chartContainer).clientHeight;
  element_width -= element_width % 10;
  element_height -= element_height % 10;
  var chart_size = Math.min(element_width, element_height);

  var selectedSeriesHorizontal = {
     "type": "scatter",
     "data": [hSelectedDot],
     "linkedTo": "horizontal",
     "zIndex": 10,
     "marker": {
       "lineWidth": 1,
       "symbol": "square",
       "radius": 3,
       "lineColor": 'black',
       "fillColor": 'black'
     }
   }

  var selectedSeriesVertical = {
     "type": "scatter",
     "data": [vSelectedDot],
     "linkedTo": "vertical",
     "zIndex": 10,
     "marker": {
       "symbol": "square",
       "lineWidth": 1,
       "radius": 3,
       "lineColor": 'black',
       "fillColor": 'white',
     }
   }

  var ticksX = new Array();
  var ticksY = new Array();
  for (let tick = -graphScale; tick.toFixed(1) <= graphScale; tick += graphScale/5) {
    if (tick == 0) continue;
    ticksX.push({x: tick, y: 0});
    ticksY.push({x: 0, y: tick});
  }

  var tickSeriesX = [{
    type: "scatter",
    enableMouseTracking: false,
    data: ticksX,
    color: "black",
    showInLegend: false,
    marker: {
      lineWidth: 1,
      symbol: "VlineZ",
      lineColor: "black",
    }
  }]
  var tickSeriesY = [{
    type: "scatter",
    enableMouseTracking: false,
    data: ticksY,
    color: "black",
    showInLegend: false,
    marker: {
      lineWidth: 1,
      symbol: "HlineZ",
      lineColor: "black",
    }
  }]

  var tickSeries = [];
  if (settings.pca.zijdTicks) tickSeries = tickSeriesX.concat(tickSeriesY);
  var basicSeries = [
    // selectedSeriesHorizontal,
    // selectedSeriesVertical,
    {
      type: "line",
      linkedTo: "horizontal",
      enableMouseTracking: false,
      data: dataBucket['hor'],
      color: 'black',
      marker: {
        enabled: false
      }
    },
    {
      type: "scatter",
      id: "horizontal",
      name: "Horizontal Projection",
      data: dataBucket['hor'],
      color: "black",
      marker: {
        radius: markerSize.radius,
        lineWidth: markerSize.lineWidth,
        symbol: "circle",
        lineColor: "black",
        fillColor: "black"
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
        onArea: false,
        formatter: function() {
          return makeDataLabel(this.point);
        }
      }
    },
    {
      name: "Vertical Projection",
      type: "line",
      linkedTo: "vertical",
      enableMouseTracking: false,
      data: dataBucket['vert'],
      color: "black",
      marker: {
        enabled: false
      }
    },
    {
      type: "scatter",
      id: "vertical",
      name: "Vertical Projection",
      data: dataBucket['vert'],
      color: "black",
      marker: {
        radius: markerSize.radius,
        symbol: "circle",
        lineWidth: markerSize.lineWidth,
        lineColor: "black",
        fillColor: "white"
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
          return makeDataLabel(this.point);
        }
      }
    },
  ].concat(tickSeries);

  var zoomType = 'xy';

  // if (mainContPanZoom.getScale() != 1) zoomType = 'none';

  var options = {

    chart: {
      //styledMode: true,
      type: "line",
      animation: false,
      // height: chart_size,
      // width: chart_size,
      zoomType: zoomType,
      // panning: {
      //     enabled: true,
      //     type: 'xy'
      // },
      // panKey: 'shift',
      marginTop: 50,
      marginBottom: 50,
      marginLeft: 50,
      marginRight: 50,
      className: "zijd-plot justify-content-center text-center mx-auto d-block",
      // events: {
      //   load: resetMarkerSize
      // }
    },

    title: {
      text: ''
    },

    tooltip: {
      enabled: enableTooltips,
      formatter: generateZijderveldTooltip
    },

    exporting: {
      filename: "zijderveld-diagram",
      sourceWidth: 500,
      sourceHeight: 500,
      type: "application/pdf",
      resources: JSON.stringify({"css": ".highcharts-xaxis .highcharts-tick {transform: translateY(-1.05%); stroke: black;}"}),
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
              // vertical
              this.series[4].update({
                  marker: {
                  	symbol: 'EVlineZ',
                  }
              });
              // horizontal
              this.series[5].update({
                  marker: {
                  	symbol: 'EHlineZ',
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

    xAxis: {
      zoomEnabled: true,
      lineColor: "black",
      crossing: 0,
      min: -graphScale,
      max: graphScale,
      gridLineWidth: 0,
      startOnTick: false,
      endOnTick: false,
      tickWidth: 0,
      tickColor: "black",
      tickLength: -10,
      tickInterval: graphScale/5,
      lineWidth: 1,
      opposite: true,
      // offset: -(chart_size - 100) / 2,
      // width: chart_size - 100,
      title: {
        align: 'high',
        // offset: 0,
        text: dataBucket['hor'][0].title,
        rotation: 0,
        x: 30,
        y: 11,
        style: {color: 'black'},
      },
      labels: {
        enabled: tickFlag,
        formatter: function () {
          if(this.value === 0) return "";
          else return this.value;
        }
      }
    },

    yAxis: {
      //reversed: true,
      zoomEnabled: true,
      crossing: 0,
      min: -graphScale,
      max: graphScale,
      gridLineWidth: 0,
      startOnTick: false,
      endOnTick: false,
      tickWidth: 0,
      tickColor: "black",
      tickLength: -10,
      tickInterval: graphScale/5,
      lineWidth: 1,
      lineColor: "black",
      // offset: -(chart_size - 100) / 2,
      // width: chart_size - 100,
      title: {
        align: 'high',
        // offset: 0,
        text: dataBucket['vert'][0].title,
        rotation: 0,
        y: -6,
        x: 25,
        style: {color: 'black'},
      },
      labels: {
        enabled: tickFlag,
        formatter: function () {
          if(this.value === 0) return "";
          else return this.value;
        }
      }
    },

    plotOptions: {
      series: {
        cursor: "pointer",
        point: {
          // events: {
          //   click: function () {
          //     dotSelector.setActiveStep(this.stepIndex);
          //   }
          // }
        },
        resources: {
          css: ".highcharts-xaxis .highcharts-tick {transform: translateY(-1.05%);}"
        },
        animation: false,
        accessibility: {
          enabled: false,
          keyboardNavigation: {
            enabled: false,
          }
        },
        states: {
          hover: {
            enabled: settings.pca.zijdHover,
          },
          inactive: {
            opacity: 1
          }
        }
      },
      line: {
        lineWidth: 1,
      }
    },

    credits: {
      enabled: false,
      text: "PMTools.com (Zijderveld Diagram)",
      href: ""
    },

    series: basicSeries.concat(formatInterpretationSeries(graphScale, specimen.interpretations))

  }

  var chart = Highcharts.chart(chartContainer, options);

  setZijderveldRatio(chart);

  //console.log([chart.axes[0].width, chart.axes[1].height, chart.axes[0].width / chart.axes[1].height])

}

function setZijderveldRatio(chart) {

  /*
   * Function setZijderveldRatio
   * Sets the correct ratio of the Zijderveld diagram (true angle)
   */

  var [xAxis, yAxis] = chart.axes;

  // Determine the ratio between width/height
  var ratio = (xAxis.width / yAxis.height);

  if(xAxis.width === yAxis.height) {
    return;
  } else if(xAxis.width > yAxis.height) {
    xAxis.setExtremes(xAxis.min * ratio, xAxis.max * ratio);
  } else if(xAxis.width < yAxis.height) {
    yAxis.setExtremes(yAxis.min / ratio, yAxis.max / ratio);
  }

}

function generateZijderveldTooltip() {

  /*
   * Function generateZijderveldTooltip
   * Generates the Zijderveld chart tooltip
   */

  // if(!document.getElementById("zijderveld-tooltip").checked) {
  //   return false;
  // }
  return [
    "<b>" + this.series.name + "</b>",
    "<b>#: </b>" + (this.point.stepIndex + 1),
    "<b>Step: </b>" + this.point.step,
    "<b>Dec: </b>" + this.point.dec.toFixed(2),
    "<b>Inc: </b>" + this.point.inc.toFixed(2),
    "<b>Intensity: </b>" + this.point.intensity.toFixed(2) + "µA/m"
  ].join("<br>");

}

function plotStereoDiagram(hover, onMain) {

  var specimen = getSelectedFile('specimen');

  if (!specimen) return document.getElementById('container-left').innerHTML = '';

  //Get the bedding and core parameters from the sample object
  var coreAzi = specimen.coreAzimuth;
  var coreDip = specimen.coreDip;
  var beddingStrike = specimen.beddingStrike;
  var beddingDip = specimen.beddingDip;

  // Get the Boolean flags for the graph
  var enableLabels = settings.pca.stereoAnnotations;
  var enableTooltips = settings.pca.stereoTooltips;
  var allowOverlap = settings.pca.allowOverlap;
  var addTextOutline = settings.pca.addTextOutline;
  var showError = settings.pca.stereoError;

  // Format a Highcharts data bucket for samples that are visible
  var dataPos = new Array(), dataNeg = new Array(), dataAll = new Array();
  var dataSeries = new Array(), dataErrors = new Array();
  var selectedStepIndex = null;

  var steps = specimen.steps;

  if (settings.pca.stereoHide) {
    if (specimen.interpretations.length > 0) {
      steps = specimen.interpretations[specimen.interpretations.length - 1].steps;
    }
  }

  steps.forEach(function(step, i) {

    if(!step.visible) {
      return;
    }

    if(dotSelector._selectedStep === i) {
      selectedStepIndex = dataSeries.length;
    }

    var direction = inReferenceCoordinates(COORDINATES['pca'], specimen, new Coordinates(step.x, step.y, step.z)).toVector(Direction);
    var step_data = {
      x: direction.dec,
      y: Math.abs(direction.inc),
      inc: direction.inc,
      step: step.step,
      stepIndex: step.index,
    }
    dataSeries.push({
      x: direction.dec,
      y: Math.abs(direction.inc),
      inc: direction.inc,
      step: step.step,
      stepIndex: step.index,
      innerColor: (direction.inc < 0 ? 'white' : 'black'),
    });

    if (showError) {
      if (settings.global.dashedLines) {
        dataErrors.push(
          getSmallCircle(direction.dec, Math.abs(direction.inc), step.error, true)
        )
      }
      else {
        dataErrors.push(
          getSmallCircle(direction.dec, Math.abs(direction.inc), step.error, false)
        )
      }
    };

    if (direction.inc < 0) dataNeg.push(step_data);
    else dataPos.push(step_data);
    dataAll.push({
      x: direction.dec,
      y: direction.inc,
      inc: direction.inc,
      step: step.step,
      stepIndex: step.index,
    });

  });

  var selectedDot;
  if (selectedStepIndex === null) selectedDot = {"x": null, "y": null};
  else selectedDot = dataSeries[selectedStepIndex];

  var chartContainer = ChartContainersPCA[0];
  var markerSize = {
    radius: 2.5,
    lineWidth: 0.6,
  }

  // if (!onMain) {
  //   chartContainer = 'container-left';
  //   markerSize.radius = 2;
  //   markerSize.lineWidth = 0.5;
  // }

  var container = document.querySelector('#'+chartContainer),
    chartIndex = container.getAttribute('data-highcharts-chart'),
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

  // Initialize stereo basic series
  var basicSeries = [
    // selectedSeries,
    {
      type: "scatter",
      name: 'Up',
      id: 'Up',
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
          return makeDataLabel(this.point);
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
          return makeDataLabel(this.point);
        }
      },
      color: "black",
    },
    {
      enableMouseTracking: false,
      type: "line",
      name: "error_circles",
      linkedTo: ":previous",
      lineWidth: 0.5,
      data: dataErrors,
      marker: {
        enabled: false
      }
    },
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
  // Get сonnection lines for dots
  var bcPath = (settings.global.dashedLines) ? getGCPath(dataAll, true) : getGCPath(dataAll, false);

  var element_width = document.getElementById(chartContainer).offsetWidth;
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
  };
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
  };
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
  };

  var tickSeries = [];
  if (settings.pca.stereoTicks) basicSeries.push(tickSeriesX, tickSeriesTop, tickSeriesBot);

  if (settings.global.dashedLines) {
    dataErrors.forEach((errorCircle, i) => {
      var errorSeriesPos = {
        enableMouseTracking: false,
        type: "line",
        name: "error_circles",
        linkedTo: ":previous",
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
        linkedTo: ":previous",
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
    });

    for (let i = 0; i < bcPath.pos.length; i++) {
      var pos = {
        enableMouseTracking: false,
        type: "line",
        name: "Up",
        linkedTo: "Up",
        lineWidth: 0.5,
        data: bcPath.pos[i],
        connectEnds: false,
        marker: {
          enabled: false
        }
      };
      var neg = {
        enableMouseTracking: false,
        type: "line",
        name: "Down",
        linkedTo: "Down",
        lineWidth: 0.5,
        data: bcPath.neg[i],
        dashStyle: "LongDash",
        connectEnds: false,
        marker: {
          enabled: false
        }
      }

      basicSeries.push(pos);
      basicSeries.push(neg);
    }
  }
  else {
    // basicSeries.push(errorSeries, tickSeries);
    dataErrors.forEach((errorCircle, i) => {
      var errorSeries = {
        enableMouseTracking: false,
        type: "line",
        name: "error_circles",
        linkedTo: ":previous",
        lineWidth: 0.5,
        data: errorCircle,
        connectEnds: false,
        marker: {
          enabled: false
        }
      };

      basicSeries.push(errorSeries);
    });

    var path = {
      enableMouseTracking: false,
      type: "line",
      name: "Up",
      linkedTo: "Up",
      lineWidth: 0.5,
      data: bcPath,
      connectEnds: false,
      marker: {
        enabled: false
      }
    };

    basicSeries.push(path);
  }


  var options = {

    chart: {
      // styledMode: true,
      polar: true,
      className: "stereo-plot",
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
              this.series[3].update({
                marker: {
                	symbol: 'EVlineS',
                }
              });
              // vertical
              this.series[4].update({
                marker: {
                	symbol: 'EHlineSTop',
                }
              });
              this.series[5].update({
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
      text: "PMTools v1.0 (Zijderveld Diagram)",
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
            enabled: settings.pca.stereoHover,
          },
          inactive: {
            opacity: 1
          }
        }
      }
    },

    series: basicSeries.concat(formatInterpretationSeriesArea(specimen.interpretations)),
  }

  var chart = Highcharts.chart(chartContainer, options)

}

function generateStereoTooltip() {

  /*
   * Function generateHemisphereTooltip
   * Generates the Hemisphere chart tooltip
   */

  if(this.series.name === "Directions") {
    return [
      "<b>#: </b>" + (this.point.stepIndex + 1),
      "<b>Step: </b>" + this.point.step,
      "<b>Dec: </b>" + this.x.toFixed(2),
      "<b>Inc </b>" + this.point.inc.toFixed(2)
    ].join("<br>");
  } else {
    return [
      "<b>Interpretation</b>",
      "<b>Dec: </b>" + this.x.toFixed(2),
      "<b>Inc: </b>" + this.point.inc.toFixed(2)
    ].join("<br>");
  }

}

function plotIntensityDiagram() {

  var specimen = getSelectedFile('specimen');

  if (!specimen) return document.getElementById('container-right').innerHTML = '';

  var intensities = new Array();
  var categories = new Array();

  var steps = specimen.steps;

  if (settings.pca.intensityHide) {
    if (specimen.interpretations.length > 0) {
      steps = specimen.interpretations[specimen.interpretations.length - 1].steps;
    }
  }

  steps.forEach(function(step, i) {

    // On show steps that are visible
    //Remove mT, μT, C or whatever from step - just take a number
    if(!step.visible) {
      return;
    }

    // Use categories to stop mixing AF / TH
    categories.push(parseInt(step.step.match(/\d+/)));

    intensities.push({
      "x": (step.step === 'NRM') ? 0: parseInt(step.step.match(/\d+/)),
      "y": (new Coordinates(step.x, step.y, step.z).length)/specimen.volume,
      "stepIndex": step.index,
      "step": step.step,
    });

  });

  var titleX = "?";

  if (specimen.demagnetizationType == "thermal") titleX = '\u1d52C';
  else if (specimen.demagnetizationType == "alternating") titleX = "nT";

  var normalizedIntensities = normalize(intensities);

  var element_width = document.getElementById('container-right').offsetWidth;
  element_width -= element_width % 10;

  var maxIntensity = normalizedIntensities[0].maxIntensity;

  var enableLabels = settings.pca.intensityAnnotations;
  var enableTooltips = settings.pca.intensityTooltips;
  var allowOverlap = settings.pca.allowOverlap;
  var addTextOutline = settings.pca.addTextOutline;

  var options = {

    chart: {
      animation: false,
      zoomType: "xy",
      className: "intensity-plot",
      // height: element_width,
      // width: element_width,
      marginLeft: 40,
      plotBorderWidth: 1,
      plotBorderColor: "black",
      marginRight: 40,
      style: {
        //fontFamily: 'Arial',
      }
      // events: {
      //   load: resetMarkerSize
      // }
    },

    tooltip: {
      enabled: enableTooltips,
      formatter: generateIntensityTooltip,
    },

    exporting: {
      url: 'http://export.highcharts.com/index-utf8-encode.php',
      filename: "intensity_chart",
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
          xAxis: {
            title: {
              rotation: 90,
              //text: '°C',
              // load: function () {
              //   this.renderer.text('°C', 448, 412).add()
              // }
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

    title: {
      text: "",
    },

    legend: {
      enabled: false,
      align: 'right',
      verticalAlign: 'top',
      layout: 'vertical',
      x: 0,
      y: 50
    },

    subtitle: {
      text: ' Mmax = ' + maxIntensity.toExponential(2)+' μA/m',
      y: 23.5,
      x: 0,
      style: {
        color: "black",
        fontWeight: 'bold'
      }
    },

    credits: {
      enabled: false,
      text: "PMTools.com (Intensity Diagram)",
      href: ""
    },

    xAxis: {
      //width: element_width - 0.18 * element_width,
      type: "linear",
      min: 0,
      max: ((Math.floor(categories[categories.length - 1] / 100)) + 1) * 100,
      tickColor: "black",
      tickLength: 6,
      tickInterval: 100,
      lineWidth: 1,
      lineColor: "black",
      startOnTick: false,
      endOnTick: false,
      labels: {
        useHTML: true,
        style: {
          color: "black",
        }
      },
      title: {
        useHTML: true,
        align: 'high',
        rotation: 0,
        style: {color: 'black'},
        offset: -7,
        x: 20,
        text: titleX, //'&#8451;',
      }
    },

    yAxis: {
      //width: element_width - 0.12 * element_width,
      gridLineWidth:  (settings.pca.intensityTicks) ? 1 : 0,
      gridLineDashStyle: "Dash",
      gridLineColor: "black",
      minorGridLineWidth: 0,
      type: "linear",
      tickInterval: 0.1,
      lineWidth: 1,
      lineColor: "black",
      min: 0,
      max: 1,
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
        useHTML: true,
        align: 'high',
        rotation: 0,
        style: {color: 'black'},
        // offset: 0,
        x: 80,
        y: -10,
        text: 'M/Mmax'//+' Mmax = '+data[0].mag.toExponential(2)+' A/m'
      }
      // title: {
      //   text: document.getElementById("normalize-intensities").checked ? "Fraction" : "Intensity (μA/m)"
      // }
    },
    // tooltip: {
    //   formatter: intensityTooltip
    // },

    plotOptions: {
      series : {
        animation: false,
        cursor: "pointer",
        point: {
          // events: {
          //   click: function () {
          //     dotSelector.setActiveStep(this.stepIndex);
          //   }
          // }
        },
        states: {
          hover: {
            enabled: settings.pca.intensityHover,
          },
          inactive: {
            opacity: 1
          }
        }
      }
    },

    series: [{
      type: "scatter",
      name: "Resultant Intensity",
      data: normalizedIntensities,
      color: "black",
      lineWidth: 1,
      zIndex: 1,
      marker: {
        radius: 2,
        lineWidth: 0.5,
        symbol: "circle",
        lineColor: "black",
        fillColor: "black"
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
          return makeDataLabel(this.point);
        }
      }
    }].concat(formatInterpretationSeriesIntensity(specimen.interpretations))
  }

  var chart = Highcharts.chart(ChartContainersPCA[2], options);

}

function generateIntensityTooltip() {

  /*
   * Function createIntensityDiagram::intensityTooltip
   * Formats the Highcharts intensity diagram tooltip
   */

  return [
    "<b>#: </b>" + (this.point.stepIndex + 1),
    "<b>Step: </b>" + this.point.step,
    "<b>Intensity </b>" + this.y.toFixed(2) + " (" + Math.round(this.point.intensity) + "μA/m" + ")"
  ].join("<br>");

}

(function (H) {

  const EXPORT_BUTTON_TEXT = "Download CSV";

  // Crossing at 0, 0
  H.wrap(H.Axis.prototype, "render", function(proceed) {

    var chart = this.chart, otherAxis;

    if(typeof this.options.crossing === "number") {
      otherAxis = chart[this.isXAxis ? "yAxis" : "xAxis"][0];
      this.offset = otherAxis.toPixels(this.options.crossing, true);
      chart.axisOffset[this.side] = 10;
    }

    proceed.call(this);

  });

  // // Add data download button
  // H.Chart.prototype.generateCSV = function() {
  //
  //   switch(this.renderTo.id) {
  //     case "zijderveld-container":
  //       return downloadAsCSV("zijderveld.csv", getZijderveldCSV(this.series));
  //     case "intensity-container":
  //       return downloadAsCSV("intensity.csv", getIntensityCSV(this.series));
  //     case "hemisphere-container":
  //       return downloadAsCSV("hemisphere.csv", getHemisphereCSV(this.series));
  //     case "fitting-container":
  //       return downloadAsCSV("components.csv", getFittedCSV(this.series));
  //     default:
  //       notify("danger", new Exception("Data export for this chart has not been implemented."));
  //   }
  //
  // }
  //
  // // Add the button to the exporting menu
  // H.getOptions().exporting.buttons.contextButton.menuItems.push({
  //   "text": EXPORT_BUTTON_TEXT,
  //   "onclick": function() {
  //     this.generateCSV()
  //   }
  // });

}(Highcharts));

function polesPlotStereoDiagrams(hover) {

  var sitesSet = getSelectedFile('sitesSet');

  if (!sitesSet) {
    document.getElementById('poles-container-left').innerHTML = '';
    document.getElementById('poles-container-right').innerHTML = '';
    return;
  }

  // Get the Boolean flags for the graph
  var enableLabels = settings.poles.polesAnnotations;
  var enableTooltips = settings.poles.polesTooltips;
  var allowOverlap = settings.poles.polesAllowOverlap;
  var addTextOutline = settings.poles.polesAddTextOutline;
  var showError = settings.poles.polesError;

  // Format a Highcharts data bucket for samples that are visible
  var dataPos = new Array(), dataNeg = new Array(), dataAbs = new Array();
  var dataPosVGP = new Array(), dataNegVGP = new Array(), dataAbsVGP = new Array();

  var dataSeriesSites = new Array(), dataErrorsSites = new Array();
  var dataSeriesVGPs = new Array(), dataErrorsVGPs = new Array();
  var hoverIndex;

  var sites = sitesSet.sites;

  var system = 'geo';
  if (COORDINATES['poles'] == 'tectonic') {
    system = 'strat';
  }

  // var statistics = getStatisticalParameters(collection.interpretations);

  var baseSite = getSite() // new Site(0, 0);

  sites.forEach(function(site, i) {

    if (!site.visible) return;
    if (site.hover) hoverIndex = site.index;

    // var mean = undefined;
    // if (site.means.length > 0) mean = collection.means[collection.means.length - 1][COORDINATES.stat];

    var position = 'normal';
    if (site.reversed) position = 'reversed';

    // var dec, inc; //meanDec, meanInc;
    var dec = site[COORDINATES.poles].dec[position];
    var inc = site[COORDINATES.poles].inc[position];
    // var dec = site.Dgeo[position];
    // var inc = site.Igeo[position];
    // if (COORDINATES['poles'] == 'tectonic') {
    //   dec = site.Dstrat[position];
    //   inc = site.Istrat[position];
    // }

    dataSeriesSites.push({
      x: dec,
      y: Math.abs(inc),
      inc: inc,
      dotIndex: site.index,
      id: site.id,
      innerColor: (inc < 0 ? 'white' : 'black'),
      a95: site[COORDINATES.poles].a95,
    });

    if (site.vgp && (site.sLat || site.sLon)) {
      var vgp_data = {
        x: site.vgp[system].lng,
        y: Math.abs(site.vgp[system].lat),
        inc: site.vgp[system].lat,
        dotIndex: site.vgp.index,
        id: site.id,
        pLat: site.vgp[system].pLat,
        dp: site.vgp[system].dp,
        dm: site.vgp[system].dm,
      }

      dataSeriesVGPs.push(vgp_data)

      if (site.vgp[system].lat > 0) dataPosVGP.push(vgp_data);
      else dataNegVGP.push(vgp_data);
    }

    if (showError) {
      if (settings.global.dashedLines) {
        dataErrorsSites.push(
          getSmallCircle(dec, Math.abs(inc), sites[COORDINATES.poles].a95, true)
        )
      }
      else {
        dataErrorsSites.push(
          getSmallCircle(dec, Math.abs(inc), sites[COORDINATES.poles].a95, false)
        )
      }
    };

    var interpret_data = {
      x: dec,
      y: Math.abs(inc),
      inc: inc,
      dotIndex: site.index,
      id: site.id,
      a95: site[COORDINATES.poles].a95,
    };

    if (inc < 0) dataNeg.push(interpret_data);
    else dataPos.push(interpret_data);
    dataAbs.push({
      x: dec,
      y: inc,
      inc: inc,
      index: site.index,
      id: site.id,
      dotIndex: site.index,
    });

  });

  var hoverDotSites, hoverDotVGPs;
  if (!hoverIndex && (hoverIndex != 0)) {
    hoverDotSites = {"x": null, "y": null};
    hoverDotVGPs = {"x": null, "y": null};
  }
  else {
    hoverDotSites = dataSeriesSites[hoverIndex];
    hoverDotVGPs = dataSeriesVGPs[hoverIndex];
  }

  var markerSize = {
    radius: 2.5,
    lineWidth: 0.6,
  }

  var chartContainerLeft = document.getElementById('poles-container-left'),
    chartIndex = chartContainerLeft.getAttribute('data-highcharts-chart'),
    chartLeft = Highcharts.charts[chartIndex];

  var chartContainerRight = document.getElementById('poles-container-right'),
    chartIndex = chartContainerRight.getAttribute('data-highcharts-chart'),
    chartRight = Highcharts.charts[chartIndex];

  // Only redraw the hover series (series: 0, data: 0)
  if (chartLeft && hover) {
    chartLeft.series[0].data[0].update(hoverDotSites);
    chartRight.series[0].data[0].update(hoverDotVGPs);
    return;
  }

  var selectedSeries = {
    type: "scatter",
    linkedTo: "Down",
    zIndex: 10,
    data: [hoverDotSites],
    marker: {
      lineWidth: 1,
      symbol: "circle",
      radius: 4,
      lineColor: 'black',
      fillColor: hoverDotSites['innerColor'],
    }
  }

  // Initialize basic polar series
  var sitesSeries = [
    selectedSeries,
    {
      type: "scatter",
      name: 'Down',
      id: "Down",
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
          return makeDataLabelPoles(this.point);
        }
      },
      color: "black",
    },
    {
      type: "scatter",
      name: 'Up',
      id: 'Up',
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
          return makeDataLabelPoles(this.point);
        }
      },
      color: "black",
    },
  ];

  var vgpSeries = [
    selectedSeries,
    {
      type: "scatter",
      name: 'Down',
      id: "Down",
      data: dataPosVGP,//plot_directions.pos,
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
          return makeDataLabelPoles(this.point);
        }
      },
      color: "black",
    },
    {
      type: "scatter",
      name: 'Up',
      id: 'Up',
      data: dataNegVGP,
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
          return makeDataLabelPoles(this.point);
        }
      },
      color: "black",
    },
  ];

  // var bcPath = plot_big_circle_path(dataAbs);

  var element_width = chartContainerLeft.offsetWidth;
  element_width -= element_width % 10;

  // Charts ticks
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

  if (settings.poles.polesTicks) {
    sitesSeries.push(tickSeriesX, tickSeriesTop, tickSeriesBot);
    vgpSeries.push(tickSeriesX, tickSeriesTop, tickSeriesBot);
  }

  if (settings.global.dashedLines) {
    dataErrorsSites.forEach((errorCircle, i) => {
      var errorSeriesPos = {
        enableMouseTracking: false,
        type: "line",
        name: "error_circles",
        linkedTo: "Down",
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
        linkedTo: "Up",
        lineWidth: 0.5,
        data: errorCircle.neg,
        dashStyle: "LongDash",
        connectEnds: false,
        marker: {
          enabled: false
        }
      };

      sitesSeries.push(errorSeriesPos);
      sitesSeries.push(errorSeriesNeg);
      // poleSeries.push(errorSeriesPos);
      // poleSeries.push(errorSeriesNeg);
    });
  }
  else {
    dataErrorsSites.forEach((errorCircle, i) => {
      var errorSeries = {
        enableMouseTracking: false,
        type: "line",
        name: "error_circles",
        linkedTo: "Down",
        lineWidth: 0.5,
        data: errorCircle,
        connectEnds: false,
        marker: {
          enabled: false
        }
      };

      sitesSeries.push(errorSeries);
      // poleSeries.push(errorSeries);
    });
  }

  var optionsSites = {

    chart: {
      // styledMode: true,
      polar: true,
      className: "sites-plot",
      animation: false,
      // spacing: [0, 0, 0, 0],
      // events: {
      //   load: resetMarkerSize,
      // },
    },

    boost: {
      useGPUTranslations: true,
      usePreallocated: true,
    },

    tooltip: {
      enabled: enableTooltips,
      formatter: generateStereoTooltipPolesSites,
    },

    title: {
        text: 'Sites | ' + COORDINATES['poles'],
        align: 'left',
        margin: -25
        // x: 70
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
      filename: "sites_stereo_chart",
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
                    filename: "sites_stereo_chart",
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
              dotSelector.hoverDot(this.dotIndex, 'sitesSet');
            },
          }
        },
        states: {
          hover: {
            enabled: settings.poles.polesHover,
          },
          inactive: {
            opacity: 1
          }
        }
      }
    },

    series: sitesSeries.concat(formatMeansSeries(sitesSet.means[sitesSet.means.length - 2], 'poles')),
  }

  var optionsVGPs = {

    chart: {
      // styledMode: true,
      polar: true,
      className: "vgps-plot",
      animation: false,
      // events: {
      //   load: resetMarkerSize,
      // },
    },

    boost: {
      useGPUTranslations: true,
      usePreallocated: true,
    },

    tooltip: {
      enabled: enableTooltips,
      formatter: generateStereoTooltipPolesVGP,
    },

    title: {
        text: 'VGPs | ' + COORDINATES['poles'],
        align: 'left',
        margin: -25
        // x: 70
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
      filename: "vgps_stereo_chart",
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
                    filename: "vgps_stereo_chart",
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

    // mapNavigation: {
    //     enableMouseWheelZoom: true
    // },

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
              dotSelector.hoverDot(this.dotIndex, 'sitesSet');
            },
          }
        },
        states: {
          hover: {
            enabled: settings.poles.polesHover,
          },
          inactive: {
            opacity: 1
          }
        }
      }
    },

    series: vgpSeries.concat(formatMeansSeries(sitesSet.means[sitesSet.means.length - 1], 'poles')),
  }

  var chartSites = Highcharts.chart('poles-container-left', optionsSites)
  var chartVGPs = Highcharts.chart('poles-container-right', optionsVGPs)
  // if (update) return;
  return {sites: chartSites, vgps: chartVGPs};

}

function generateStereoTooltipPolesSites() {

  /*
   * Function generateHemisphereTooltip
   * Generates the Hemisphere chart tooltip
   */

  if ((this.series.name === "Down") || (this.series.name === "Up")) {
    return [
      "<b>Site</b>",
      "<b>#: </b>" + (this.point.dotIndex + 1),
      "<b>Site id: </b>" + this.point.id,
      "<b>Longitude: </b>" + this.x.toFixed(2),
      "<b>Latitude: </b>" + this.point.inc.toFixed(2),
      "<b>a95: </b>" + this.point.a95.toFixed(2),
    ].join("<br>");
  }
  else {
    return [
      "<b>Mean site</b>",
      "<b>Longitude: </b>" + this.x.toFixed(2),
      "<b>Latitude: </b>" + this.point.inc.toFixed(2),
    ].join("<br>");
  }

}

function generateStereoTooltipPolesVGP() {

  /*
   * Function generateHemisphereTooltip
   * Generates the Hemisphere chart tooltip
   */

  if ((this.series.name === "Down") || (this.series.name === "Up")) {
    return [
      "<b>VGP</b>",
      "<b>Site id: </b>" + this.point.id,
      "<b>pLon: </b>" + this.x.toFixed(2),
      "<b>pLat: </b>" + this.point.inc.toFixed(2),
      "<b>paleo lat: </b>" + this.point.pLat.toFixed(2),
      "<b>dp: </b>" + this.point.dp.toFixed(2),
      "<b>dm: </b>" + this.point.dm.toFixed(2),
    ].join("<br>");
  }
  else {
    return [
      "<b>Mean site</b>",
      "<b>pLon: </b>" + this.x.toFixed(2),
      "<b>pLat: </b>" + this.point.inc.toFixed(2),
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

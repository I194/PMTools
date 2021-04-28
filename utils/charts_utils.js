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

  H.getSVG = function(charts, chartsOpt, type) {
    if (!type) type = 'multiple';

    var svgArr = [],
      top = 500,
      left = 0,
      width = 500;

    switch (type) {
      case 'multiple':
        if (charts.length == 3) {
          charts.forEach((chart, i) => {
            if (i == 0) {
              chart.series[6].update({
                  marker: {
                    symbol: 'EVlineZ',
                  }
              });
              chart.series[7].update({
                  marker: {
                    symbol: 'EHlineZ',
                  }
              });
            };
            if (i == 1) {
              chart.series[4].update({
                marker: {
                  symbol: 'EVlineS',
                }
              });
              // vertical
              chart.series[5].update({
                marker: {
                  symbol: 'EHlineSTop',
                }
              });
              chart.series[6].update({
                marker: {
                  symbol: 'EHlineSBot',
                }
              });
            }
          });
        }
        else {
          charts.forEach((chart, i) => {
            chart.series[3].update({
              marker: {
                symbol: 'EVlineS',
              }
            });
            // vertical
            chart.series[4].update({
              marker: {
                symbol: 'EHlineSTop',
              }
            });
            chart.series[5].update({
              marker: {
                symbol: 'EHlineSBot',
              }
            });
          });
        }
        break;
      case 'zijd':
        charts.forEach((chart, i) => {
          chart.series[6].update({
              marker: {
                symbol: 'EVlineZ',
              }
          });
          chart.series[7].update({
              marker: {
                symbol: 'EHlineZ',
              }
          });
        })
        break;
      case 'stereo-pca':
        charts.forEach((chart, i) => {
          chart.series[4].update({
            marker: {
              symbol: 'EVlineS',
            }
          });
          // vertical
          chart.series[5].update({
            marker: {
              symbol: 'EHlineSTop',
            }
          });
          chart.series[6].update({
            marker: {
              symbol: 'EHlineSBot',
            }
          });
        })
        break;
      case 'intensity': break;
      case 'stereo':
        charts.forEach((chart, i) => {
          chart.series[3].update({
            marker: {
              symbol: 'EVlineS',
            }
          });
          // vertical
          chart.series[4].update({
            marker: {
              symbol: 'EHlineSTop',
            }
          });
          chart.series[5].update({
            marker: {
              symbol: 'EHlineSBot',
            }
          });
        });
        break;
      case 'foldtest':
        top = 800;
        width = 1200;
        break;
      case 'no-changes':
        break;
    }

    charts.forEach((chart, i) => {


      var svg = chart.getSVG(chartsOpt);
      svg = svg.replace(
        '<svg',
        '<g transform="translate(' + left + ',' + 0 + ')" ',
        '<g transform="translate(' + left + ',' + 0 + ')" '
      );
      svg = svg.replace('</svg>', '</g>');

      // top += 2 * chart.chartHeight;
      if (charts.length != 1) {
        left += 500;
        // width = Math.max(width, chart.chartWidth);
        width = Math.max(width, left, chart.chartWidth);
      }

      svgArr.push(svg);
    });

    return '<svg height="' + top + '" width="' + width + '"\
      version="1.1" xmlns="http://www.w3.org/2000/svg">' +
      svgArr.join('') + '</svg>';
  };

  H.exportCharts = function(charts, options, chartsOpt, type) {

    // Merge the options
    var initialOpts = H.getOptions();

    options = H.merge(H.getOptions().exporting, options);

    // Post to export server
    H.post(options.url, {
      filename: options.filename || 'chart',
      type: options.type,
      width: options.width,
      svg: H.getSVG(charts, chartsOpt, type)
    });
  };

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

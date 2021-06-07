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

  H.getSVG = function(charts, type) {
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

      var svg = chart.getSVG();
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

      svg = svg.replace('NaN', '0');

      svgArr.push(svg);
    });

    return '<svg height="' + top + '" width="' + width + '"\
      version="1.1" xmlns="http://www.w3.org/2000/svg">' +
      svgArr.join('') + '</svg>';
  };

  H.exportCharts = async function(charts, options, exType, svgElement) {

    var initialOpts = H.getOptions();
    options = H.merge(H.getOptions().exporting, options);
    // get raw svg data
    var svgData = H.getSVG(charts, options.type);

    if (!svgElement) {
      // tmp container for svg data for next conversion
      var tmpDivSVG = document.createElement("div");
      tmpDivSVG.style.display = 'none';
      tmpDivSVG.innerHTML = svgData;

      // chart bounds params
      svgElement = tmpDivSVG.firstElementChild;
    }

    svgElement.getBoundingClientRect();
    const width = svgElement.width.baseVal.value;
    const height = svgElement.height.baseVal.value;

    svgElement.querySelectorAll('.highcharts-a11y-dummy-point').forEach(function(a) {
      a.remove();
    })

    // get raw pdf data
    const pdf = new jsPDF(width > height ? 'l' : 'p', 'pt', [width, height]);
    await pdf.svg(svgElement, {width, height});
    var pdfData = pdf.output();
    // console.log(pdfData);

    // get raw png data
    // inexplicable encoding problem, idk how to solve it

    // Chart exporting
    var path = undefined; // user can specify file destination

    if (exType == 'copy') {
      path = './tmp_charts';
      options.filename = 'pmtools_chart'//new Date().getTime();
    }

    var chartData = svgData;
    switch (options.extnsn) {
      case 'pdf':
        chartData = pdfData;
        break;
      case 'png':
        chartData = pngData;
        break;
      case 'jpeg':
        chartData = jpegData;
        break;
    }
    if (exType == 'copy' && options.extnsn == 'pdf') pdf.output("save", "./tmp_charts/pmtools_chart.pdf");
    else saveFile('Export chart', options.filename, chartData, options.extnsn, false, path);

    if (exType == 'copy') {
      var copyFileCS = edge.func(function () {/*
      #r "System.Windows.Forms.dll"

      using System;
      using System.IO;
      using System.Net;
      using System.Text;
      using System.Threading;
      using System.Collections;
      using System.Collections.Specialized;
      using System.Windows.Forms;

      async (input) => {
          string path = @"tmp_charts\" + input.ToString();

          StringCollection paths = new StringCollection();
          paths.Add(Path.GetFullPath(path));

          Thread thread = new Thread(() => Clipboard.SetFileDropList(paths));
          thread.SetApartmentState(ApartmentState.STA);
          thread.Start();
          thread.Join();

          return ".NET Welcomes " + Path.GetFullPath(path);
      }
      */});

      function copy() {
        copyFileCS(options.filename + '.' + options.extnsn, function (error, result) {
            if (error) throw error;
            console.log(result);
        });
      }
      copy()
      // setTimeout(copy, 500);
    }

    // Post to export server
    // H.post(
    //   options.url,
    //   {
    //     filename: options.filename || 'chart',
    //     type: options.type,
    //     width: options.width,
    //     svg: data,
    //     // noDownload: false,
    //   }
    // );

  };

}(Highcharts));

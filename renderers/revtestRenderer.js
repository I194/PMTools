const {BrowserWindow} = require('electron').remote;
const { remote, ipcRenderer } = require('electron');
const path = require('path');

const allWindows = BrowserWindow.getAllWindows();

const mainWin = allWindows[0];
const settingsWin = allWindows[1];
const aboutWin = allWindows[2];
const helpWin = allWindows[3];
const specDataWin = allWindows[4];

// Describe custom title bar functionality

const minimizeWinBtn = document.getElementById('minimize-button');
const minmaxWinBtn = document.getElementById('min-max-button');
const closeWinBtn = document.getElementById('close-button')

minimizeWinBtn.addEventListener('click', (event) => {
  remote.getCurrentWindow().minimize();
})

minmaxWinBtn.addEventListener('click', (event) => {
  const currWin = remote.getCurrentWindow();
  if (currWin.isMaximized()) currWin.unmaximize();
  else currWin.maximize();
})

closeWinBtn.addEventListener('click', (event) => {
  remote.getCurrentWindow().hide();
})

ipcRenderer.on('reload-win', (e) => {
  init();
})



// Inner scripts

// charts exporting
document.getElementById('export-charts-pdf').addEventListener('click', (e) => {
  Highcharts.exportCharts(
    chartsToExport,
    {
      type: 'application/pdf',
      filename: 'revtest'
    },
    undefined,
    'no-changes'
  );
})

document.getElementById('export-charts-jpeg').addEventListener('click', (e) => {
  Highcharts.exportCharts(
    chartsToExport,
    {
      type: 'image/jpeg',
      filename: 'revtest'
    },
    undefined,
    'no-changes'
  );
})

function reloadWins() {
  ipcRenderer.send('reload-specDataWin');
  ipcRenderer.send('reload-mainWin');
  ipcRenderer.send('reload-interpretDataWin');
  ipcRenderer.send('reload-fileManager');
  init();
}

function init() {
  console.log('hi');
}

// (function (H) {
//
//   const EXPORT_BUTTON_TEXT = "Download CSV";
//
//   // Crossing at 0, 0
//   H.wrap(H.Axis.prototype, "render", function(proceed) {
//
//     var chart = this.chart, otherAxis;
//
//     if(typeof this.options.crossing === "number") {
//       otherAxis = chart[this.isXAxis ? "yAxis" : "xAxis"][0];
//       this.offset = otherAxis.toPixels(this.options.crossing, true);
//       chart.axisOffset[this.side] = 10;
//     }
//
//     proceed.call(this);
//
//   });
//
//   H.getSVG = function(charts, chartsOpt, type) {
//     var svgArr = [],
//       top = 500,
//       left = 0,
//       width = 500;
//
//     charts.forEach((chart, i) => {
//
//       var svg = chart.getSVG(chartsOpt);
//       svg = svg.replace(
//         '<svg',
//         '<g transform="translate(' + left + ',' + 0 + ')" ',
//         '<g transform="translate(' + left + ',' + 0 + ')" '
//       );
//       svg = svg.replace('</svg>', '</g>');
//
//       // top += 2 * chart.chartHeight;
//       top = 500;
//       if (charts.length > 1) {
//         left += 500;
//         // width = Math.max(width, chart.chartWidth);
//         width = Math.max(width, left, chart.chartWidth);
//       }
//
//       svgArr.push(svg);
//     });
//
//     return '<svg height="' + top + '" width="' + width + '"\
//       version="1.1" xmlns="http://www.w3.org/2000/svg">' +
//       svgArr.join('') + '</svg>';
//   };
//
//   H.exportCharts = function(charts, options, chartsOpt, type) {
//
//     // Merge the options
//     var initialOpts = H.getOptions();
//
//     options = H.merge(H.getOptions().exporting, options);
//
//     // Post to export server
//     H.post(options.url, {
//       filename: options.filename || 'chart',
//       type: options.type,
//       width: options.width,
//       svg: H.getSVG(charts, chartsOpt, type)
//     });
//   };
//
//   // // Add data download button
//   // H.Chart.prototype.generateCSV = function() {
//   //
//   //   switch(this.renderTo.id) {
//   //     case "zijderveld-container":
//   //       return downloadAsCSV("zijderveld.csv", getZijderveldCSV(this.series));
//   //     case "intensity-container":
//   //       return downloadAsCSV("intensity.csv", getIntensityCSV(this.series));
//   //     case "hemisphere-container":
//   //       return downloadAsCSV("hemisphere.csv", getHemisphereCSV(this.series));
//   //     case "fitting-container":
//   //       return downloadAsCSV("components.csv", getFittedCSV(this.series));
//   //     default:
//   //       notify("danger", new Exception("Data export for this chart has not been implemented."));
//   //   }
//   //
//   // }
//   //
//   // // Add the button to the exporting menu
//   // H.getOptions().exporting.buttons.contextButton.menuItems.push({
//   //   "text": EXPORT_BUTTON_TEXT,
//   //   "onclick": function() {
//   //     this.generateCSV()
//   //   }
//   // });
//
// }(Highcharts));

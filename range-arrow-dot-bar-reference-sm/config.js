config = {
  graphicDataUrl: "data.csv",
  chartType: "dot",
  // can be range, dot, arrow or bar (for bar with reference point)
  colourPaletteDots: [ONScolours.oceanBlue, ONScolours.springGreen],
  colourPaletteDotsStroke: [ONScolours.white, ONScolours.white],
  //default stroke is none. Can be added for contrast or emphasis
  colourPaletteArrows: [ONScolours.oceanBlue, ONScolours.coralPink],
  colourPaletteBar: [ONScolours.skyBlue],
  sourceText: "Office for National Statistics",
  accessibleSummary: "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
  dataLabels: {
    show: false,
    numberFormat: ".0%",
  },
  xDomain: "auto",
  // either "auto" or an array for the x domain e.g. [0,100]
  xAxisLabel: "x axis label",
  //show guidelines on range or arrow plot (default is false for both)
  // guidelines must always show on dot, and not show on bar
  showGuidelines: {
    range: false,
    arrow: false,
  },
  chartEvery: {
    sm: 1,
    md: 2,
    lg: 2,
  },
  margin: {
    sm: {
      top: 30,
      right: 20,
      bottom: 50,
      left: 150,
    },
    md: {
      top: 30,
      right: 40,
      bottom: 50,
      left: 150,
    },
    lg: {
      top: 30,
      right: 40,
      bottom: 50,
      left: 150,
    },
  },
  seriesHeight: {
    sm: 30,
    md: 30,
    lg: 30,
  },
  xAxisTicks: {
    sm: 2,
    md: 2,
    lg: 4,
  },
  dropYAxis: true,
  elements: { select: 0, nav: 0, legend: 0, titles: 0 },
  chartBuild: {},
};

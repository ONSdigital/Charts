config = {
  graphicDataUrl: "data.csv",
  showMarkers: true,
  showLine: true,
  lineSeries: "Total",
  //line will only be shown if the markers are also shown
  colourPalette: ONSpalette,
  lineColour: "#222222",
  sourceText: "Office for National Statistics",
  accessibleSummary: "Here is the screenreader text describing the chart.",
  xAxisTickFormat: {
    sm: "%b %Y",
    md: "%b %Y",
    lg: "%b %Y",
  },
  yAxisTickFormat: ".0%",
  xAxisNumberFormat: ".0f",
  dateFormat: "%b-%y",
  //the format your date data has in data.csv
  yDomain: "auto",
  // either "auto" or an array for the x domain e.g. [0,100]
  yAxisLabel: "y axis label",
  stackOffset: "stackOffsetDiverging",
  // options include
  // stackOffsetNone means the baseline is set at zero
  // stackOffsetExpand to do 100% charts
  // stackOffsetDiverging for data with positive and negative values
  stackOrder: "stackOrderNone",
  // other options include
  // stackOrderNone means the order is taken from the datafile
  // stackOrderAppearance the earliest series (according to the maximum value) is at the bottom
  // stackOrderAscending the smallest series (according to the sum of values) is at the bottom
  // stackOrderDescending the largest series (according to the sum of values) is at the bottom
  // stackOrderReverse reverse the order as set from the data file
  margin: {
    sm: {
      top: 30,
      right: 5,
      bottom: 50,
      left: 40,
    },
    md: {
      top: 30,
      right: 20,
      bottom: 50,
      left: 40,
    },
    lg: {
      top: 30,
      right: 20,
      bottom: 50,
      left: 40,
    },
  },
  aspectRatio: {
    sm: [1.33, 1],
    md: [1.5, 1],
    lg: [1.5, 1],
  },
  xAxisTicksEvery: {
    sm: 6,
    md: 4,
    lg: 2,
  },
  yAxisTicks: {
    sm: 4,
    md: 8,
    lg: 10,
  },
  addFirstDate: false,
  addFinalDate: false,
  mobileBreakpoint: 510,
  mediumBreakpoint: 600,
  elements: { select: 0, nav: 0, legend: 0, titles: 0 },
  chartBuild: {},
};

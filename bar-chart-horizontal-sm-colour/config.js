config = {
  graphic_data_url: "data.csv", 
  colour_palette: ONSpalette,
  sourceText: "Office for National Statistics",
  accessibleSummary: "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
  xDomain: [0, 80],
  // either "auto" or an array for the x domain e.g. [0,100]
  xAxisTickFormat: ".0f",
  xAxisLabel: "Percentage (%)",
  stackOffset: "stackOffsetNone",
  // options include
  // stackOffsetNone means the baseline is set at zero
  // stackOffsetExpand to do 100% charts
  // stackOffsetDivergine for data with positive and negative values
  stackOrder: "stackOrderNone",
  // other options include
  // stackOrderNone means the order is taken from the datafile
  // stackOrderAppearance the earliest series (according to the maximum value) is at the bottom
  // stackOrderAscending the smallest series (according to the sum of values) is at the bottom
  // stackOrderDescending the largest series (according to the sum of values) is at the bottom
  // stackOrderReverse reverse the order as set from the data file
  chart_every: {
    sm: 1,
    md: 2,
    lg: 2, // This indicates you want 2 charts side by side
  },
  // aspectRatio: {
  //   sm: [3, 4],
  //   md: [3, 4],
  //   lg: [3, 4], //lg: [1.4, 2], can be used to make a 2x wide grid
  // },
  margin: {
    sm: {
      top: 60,
      right: 20,
      bottom: 50,
      left: 160,
    },
    md: {
      top: 60,
      right: 20,
      bottom: 50,
      left: 160,
    },
    lg: {
      top: 60,
      right: 20,
      bottom: 50,
      left: 160,
    },
  },
  chartGap: 10,
  seriesHeight: {
    sm: 30,
    md: 30,
    lg: 30,
  },
  xAxisTicks: {
    sm: 3,
    md: 3,
    lg: 3,
  },
  mobileBreakpoint: 510,
  mediumBreakpoint: 1920,
  dropYAxis: true,
  elements: { select: 0, nav: 0, legend: 1, titles: 0 },
};

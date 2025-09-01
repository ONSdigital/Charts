config = {
  essential: {
    graphic_data_url: "data.csv",
    showMarkers: true,
    showLine: true,
    colour_palette: ["#206095", "#A8BD3A", "#871A5B", "#F66068", "#05341A"],
    line_colour: "#222222",
    sourceText: "Office for National Statistics",
    accessibleSummary: "Here is the screenreader text describing the chart.",
    xAxisTickFormat: {
      sm: "%b",
      md: "%b",
      lg: "%b",
    },
    xAxisNumberFormat: ".0f",
    yAxisTickFormat: ".0f",
    dateFormat: "%b-%y",
    //the format your date data has in data.csv
    yDomain: "auto",
    // either "auto" or an array for the x domain e.g. [0,100]
    line_series: "Total",
    yAxisLabel: "y axis label",
    stackOffset: "stackOffsetNone",
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
  },
  optional: {
    margin: {
      sm: {
        top: 50,
        right: 5,
        bottom: 50,
        left: 40,
      },
      md: {
        top: 50,
        right: 20,
        bottom: 50,
        left: 40,
      },
      lg: {
        top: 50,
        right: 30,
        bottom: 50,
        left: 40,
      },
    },
    chartGap: 10,
    chart_every: {
      sm: 2,
      md: 2,
      lg: 2,
    },
    aspectRatio: {
      sm: [1.5, 1],
      md: [1.5, 1],
      lg: [1.5, 1],
    },
    xAxisTicksEvery: {
      // this is the interval of ticks on the x axis - always including the first and last date
      sm: 12,
      md: 2,
      lg: 2,
    },
    yAxisTicks: {
      sm: 4,
      md: 4,
      lg: 6,
    },
    legendColumns: 4,
    mobileBreakpoint: 510,
    mediumBreakpoint: 600,
    dropYAxis: true,
  },
  elements: { select: 0, nav: 0, legend: 0, titles: 0 },
  chart_build: {},
};

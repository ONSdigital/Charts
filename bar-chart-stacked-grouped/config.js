config={
  "graphicDataURL": "../example-data/categorical-stacked-grouped.csv",
  "colourPalette": ONSpalette,
  "sourceText": "Office for National Statistics",
  "accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
  "xDomain":"auto",
  // either "auto" or an array for the x domain e.g. [0,100]
  "xAxisTickFormat":".0%",
  "xAxisLabel":"x axis label",
  "stackOffset":"stackOffsetNone",
  // options include
  // stackOffsetNone means the baseline is set at zero
  // stackOffsetExpand to do 100% charts
  // stackOffsetDiverging for data with positive and negative values
  "stackOrder":"stackOrderNone",
  // other options include
  // stackOrderNone means the order is taken from the datafile
  // stackOrderAppearance the earliest series (according to the maximum value) is at the bottom
  // stackOrderAscending the smallest series (according to the sum of values) is at the bottom
  // stackOrderDescending the largest series (according to the sum of values) is at the bottom
  // stackOrderReverse reverse the order as set from the data file
  "margin": {
    "sm": {
      "top": 10,
      "right": 20,
      "bottom": 40,
      "left": 170
    },
    "md": {
      "top": 10,
      "right": 20,
      "bottom": 40,
      "left": 170
    },
    "lg": {
      "top": 10,
      "right": 20,
      "bottom": 40,
      "left": 170
    }
  },
  "seriesHeight":{
    "sm":40,
    "md":40,
    "lg":40
  },
  "xAxisTicks":{
    "sm":3,
    "md":4,
    "lg":5
  },
  "elements":{"select":0, "nav":0, "legend":1, "titles":0}
};
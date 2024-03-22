config={
    "essential": {
      "graphic_data_url": "data.csv",
      "colour_palette": ["#206095","#27A0CC","#871A5B","#A8BD3A","#F66068"],
      "sourceText": "Office for National Statistics",
      "accessibleSummary":"Bar chart showing that...",
      "xDomain":"auto",
      // either "auto" or an array for the x domain e.g. [0,100]
      "xAxisTickFormat":".0%",
      "xAxisLabel":"x axis label",
      "stackOffset":"stackOffsetNone",
      // options include
      // stackOffsetNone means the baseline is set at zero
      // stackOffsetExpand to do 100% charts
      // stackOffsetDiverging for data with positive and negative values
      "stackOrder":"stackOrderNone"
      // other options include
      // stackOrderNone means the order is taken from the datafile
      // stackOrderAppearance the earliest series (according to the maximum value) is at the bottom
      // stackOrderAscending the smallest series (according to the sum of values) is at the bottom
      // stackOrderDescending the largest series (according to the sum of values) is at the bottom
      // stackOrderReverse reverse the order as set from the data file
    },
    "optional": {
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
      "mobileBreakpoint": 510,
      "mediumBreakpoint": 600
    },
    "elements":{"select":0, "nav":0, "legend":1, "titles":0}
  };
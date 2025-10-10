config={
  "graphicDataURL": "data.csv",
  "legendLabels": {"min":"2015-2019", "max":"2020"},
  //the keys match the column names
  "colourPalette": ONScolours.oceanBlue,
  "sourceText": "Office for National Statistics",
  "accessibleSummary":"This chart has been hidden from screen readers. The main message of the chart is summarised in the chart title.",
  "dataLabels":{
    "show":true,
    "numberFormat":".0%"
  },
  "xAxisFormat": ".0%",
  "xAxisLabel": "x-axis label",
  "xDomain": "auto",
  // either auto or a custom domain as an array e.g [0,100]
  "margin": {
    "sm": {
      "top": 5,
      "right": 20,
      "bottom": 20,
      "left": 120
    },
    "md": {
      "top": 5,
      "right": 20,
      "bottom": 20,
      "left": 120
    },
    "lg": {
      "top": 5,
      "right": 20,
      "bottom": 40,
      "left": 160
    }
  },
  "seriesHeight":{
    "sm":40,
    "md":40,
    "lg":40
  },
  "xAxisTicks":{
    "sm":3,
    "md":8,
    "lg":10
  },
  "mobileBreakpoint": 510,
  "mediumBreakpoint": 600
};

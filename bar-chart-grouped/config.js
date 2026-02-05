config={
  "graphicDataURL": "../example-data/categorical-grouped.csv",
  "legendLabels": {"min":"2015-2019", "max":"2020"},
  //the keys match the column names
  "colourPalette": ONScolours.oceanBlue,
  "sourceText": "Office for National Statistics",
  "accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
  "dataLabels":{
    "show":true,
    "numberFormat":".0f"
  },
  "xAxisFormat": ".0f",
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
  }
};

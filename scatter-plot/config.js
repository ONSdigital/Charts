config={
  "graphicDataURL": "bubbleplotdata.csv",
  "colourPalette": [ONScolours.oceanBlue,ONScolours.springGreen,ONScolours.coralPink,ONScolours.skyBlue],
  "sourceText": "Office for National Statistics",
  "accessibleSummary":"Here is the screenreader text describing the chart.",
  "xDomain":[0,1],
  "yDomain":[-0.14,1], // either "auto" or an array for the x/y domain e.g. [0,100]
  "xAxisLabel":"Change since last month",
  "yAxisLabel":"Difference from trend",
  "xAxisFormat":".0%",
  "yAxisFormat":".0%",
  "groupLabel":'Group',
  "sizeLabel":"Size", // Label for size for tooltips
  "sizeLabelFormat":".0f",
  // Size scaling configuration
  "sizeConfig":{
      "enabled": true, // Set to false to disable size scaling
      "minSize": 25,   // Minimum circle size in pixels
      "maxSize": 500,  // Maximum circle size in pixels
      "sizeField": 'size' // Field name in data that contains size values
  },
  "aspectRatio": {
    "sm": [1, 1],
    "md": [1, 1],
    "lg": [1, 1]
  },
  "margin": {
    "sm": {
      "top": 30,
      "right": 20,
      "bottom": 75,
      "left": 50
    },
    "md": {
      "top": 30,
      "right": 20,
      "bottom": 75,
      "left": 50
    },
    "lg": {
      "top": 30,
      "right":50,
      "bottom": 75,
      "left": 50
    }
  },
  "xAxisTicks":{
    "sm":4,
    "md":8,
    "lg":8
  },
  "yAxisTicks":{
    "sm":4,
    "md":4,
    "lg":10
  },
  "elements":{"select":0, "nav":0, "legend":0, "titles":0}
};

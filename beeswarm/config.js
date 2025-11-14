config = {
  "graphicDataURL": "data.csv",
  "colourPalette": ONScolours.oceanBlue,
  "sourceText": "Office for National Statistics",
  "accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
  "xAxisFormat": ".0f",
  "layoutMethod": "force",// 'binned' or 'force'
  "forceOptions": {
    "strength": 0.5,        // Collision force strength (0-1)
    "iterations": 120,      // Number of simulation iterations
    "velocityDecay": 0.2,   // How quickly nodes slow down (0-1)
    "alphaMin": 0.001,      // When to stop the simulation
    "centerStrength": 0.1   // Strength of centering force (0-1)
  },
  "xAxisLabel": "Percentage",
  "radius": 'auto',//either auto which is x-range / number of bins
  "xDomain": [5, 22.5],// either auto or a custom domain as an array e.g [0,100]
  "circleDist": 'auto', //Vertical distance between centres of circles as a diameter of the radius or 'auto'
  "numBands": 75, //number of bins,
  "averages": {
    "show": true,  // Whether to show average lines
    "showLabels": false,  // Whether to show labels for the average lines
    "colour": ONScolours.grey100,  // Color of the average lines
    "strokeWidth": 3,  // Width of the average lines
    "strokeDash": "",  // Dash pattern for the lines
    "labelColour": ONScolours.grey100,  // Color of the labels
    "labelFormat": ".1f",  // Format for the label numbers
    "labelPrefix": "Mean: ",  // Text to show before the value
    "labelOffset": {  // Offset for label positioning
      x: 5,
      y: 0
    },
    "values": [  // Array of average values for each group
      { group: "Wales", value: 14.3 },
      { group: "Scotland", value: 14.7 },
      { group: "Northern Ireland", value: 14.3 },
      { group: "England", value: 13.0 }
      // ... add more groups as needed
    ],
  },
  "margin": {
    "sm": {
      "top": 5,
      "right": 0,
      "bottom": 20,
      "left": 0
    },
    "md": {
      "top": 5,
      "right": 0,
      "bottom": 20,
      "left": 0
    },
    "lg": {
      "top": 0,
      "right": 0,
      "bottom": 25,
      "left": 0
    }
  },
  "seriesHeight": {
    "sm": 100,
    "md": 100,
    "lg": 80
  },
  "xAxisTicks": {
    "sm": 3,
    "md": 8,
    "lg": 10
  },
};

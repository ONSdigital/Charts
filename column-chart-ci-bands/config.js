config = {
    "graphicDataURL": "../example-data/time-series-ci-bands.csv",
    "colourPalette": ONScolours.oceanBlue,
    "lineColour": ONScolours.nightBlue,
    "sourceText": "Office for National Statistics",
    "accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
    "xAxisTickFormat": {
        "sm": "%Y",
        "md": "%Y",
        "lg": "%b-%y"
    },
    "yAxisTickFormat": ".1f",
    "xAxisNumberFormat": ".0f",
    //the format your date data has in data.csv
    "dateFormat": "%d/%m/%Y",
    // either "auto" or an array for the y domain e.g. [0,100]
    "yDomain": ["auto"],
    "yAxisLabel": "y axis label",
    "xAxisLabel": "x axis label",
    "legendIntervalText": "Likely range (95% confidence interval)",
    "legendEstimateText": 'Estimate',
    "margin": {
        "sm": {
            "top": 45,
            "right": 20,
            "bottom": 60,
            "left": 50
        },
        "md": {
            "top": 35,
            "right": 20,
            "bottom": 60,
            "left": 70
        },
        "lg": {
            "top": 35,
            "right": 20,
            "bottom": 60,
            "left": 70
        }
    },
    "aspectRatio": {
        "sm": [1.5, 1],
        "md": [1.5, 1],
        "lg": [2, 1]
    },
    "xAxisTicksEvery": {
        "sm": 4,
        "md": 4,
        "lg": 2
    },
    "labelSpans": {
        enabled: true,
        timeUnit:"month",//set to "day","month",'quarter' or 'year'
        secondaryTimeUnit:"false",//can be 'auto', false to disable or override with "day","month",'quarter' or 'year'
    },
    "yAxisTicks": {
        "sm": 4,
        "md": 5,
        "lg": 5
    },
    "elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 }
};

config = {
    "graphic_data_url": "data.csv",
    "colourPalette": ONScolours.oceanBlue,
    "line_colour": ONScolours.nightBlue,
    "sourceText": "Office for National Statistics",
    "accessibleSummary": "This chart has been hidden from screen readers. The main message of the chart is summarised in the chart title, and the data is available to download below.",
    "xAxisTickFormat": {
        "sm": "%Y",
        "md": "%Y",
        "lg": "%b-%y"
    },
    "yAxisTickFormat": ".1f",
    "xAxisNumberFormat": ".0f",
    //the format your date data has in data.csv:
    "dateFormat": "%d/%m/%Y",
    // either "auto" or an array for the y domain e.g. [0,100]
    "yDomain": ["auto"],
    "yAxisLabel": "y axis label",
    "xAxisLabel": "x axis label",
    "CI_legend_text": "Likely range (95% confidence interval)",
    "est_text": 'Estimate',

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
    "yAxisTicks": {
        "sm": 4,
        "md": 5,
        "lg": 5
    },
    "mobileBreakpoint": 510,
    "mediumBreakpoint": 600,
    "elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 },
    "chart_build": {}
};

config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONSpalette,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "Here is the screen reader text describing the chart.",
	"xDomain": "auto",
	// either "auto" or an array for the x domain e.g. [0,100]
	"xAxisTickFormat": {
		"sm": "%y",
		"md": "%Y",
		"lg": "%Y"
	},
	"yAxisTickFormat": ".0%",
	"dateFormat": "%Y",
	"xAxisLabel": "x axis label",
	"yAxisLabel": "y axis label",
	"stackOffset": "stackOffsetExpand",
	// options include
	// stackOffsetNone means the baseline is set at zero
	// stackOffsetExpand to do 100% charts
	// stackOffsetDiverging for data with positive and negative values
	"stackOrder": "stackOrderNone",
	// other options include
	// stackOrderNone means the order is taken from the datafile
	// stackOrderAppearance the earliest series (according to the maximum value) is at the bottom
	// stackOrderAscending the smallest series (according to the sum of values) is at the bottom
	// stackOrderDescending the largest series (according to the sum of values) is at the bottom
	// stackOrderReverse reverse the order as set from the data file
	"aspectRatio": {
		"sm": [1, 1],
		"md": [1, 1],
		"lg": [1, 1]
	},
	"margin": {
		"sm": {
			"top": 15,
			"right": 20,
			"bottom": 50,
			"left": 50
		},
		"md": {
			"top": 15,
			"right": 50,
			"bottom": 50,
			"left": 50
		},
		"lg": {
			"top": 30,
			"right": 50,
			"bottom": 50,
			"left": 50
		}
	},
	"xAxisTicks": {
		"sm": 7,
		"md": 5,
		"lg": 8
	},
	"addFirstDate": false,
	"addFinalDate": false,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

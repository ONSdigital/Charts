config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONSpalette,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "Here is the screenreader text describing the chart.",
	"xAxisTickFormat": {
		"sm": "%Y",
		"md": "%Y",
		"lg": "%b-%y"
	},
	"xAxisNumberFormat": ".0f",
	"yAxisTickFormat": ".0f",
	"dateFormat": "%b-%y",
	//the format your date data has in data.csv
	"yDomain": "auto",
	// either "auto" or an array for the x domain e.g. [0,100]
	"yAxisLabel": "y axis label",
	"stackOffset": "stackOffsetNone",
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
	"margin": {
		"sm": {
			"top": 50,
			"right": 20,
			"bottom": 50,
			"left": 70
		},
		"md": {
			"top": 50,
			"right": 20,
			"bottom": 50,
			"left": 70
		},
		"lg": {
			"top": 50,
			"right": 20,
			"bottom": 50,
			"left": 70
		}
	},
	"chartGap": 10,
	"chartEvery": {
		"sm": 1,
		"md": 2,
		"lg": 2
	},
	"aspectRatio": {
		"sm": [1, 1],
		"md": [1, 1],
		"lg": [4, 3]
	},
	"xAxisTicksEvery": { // this is the interval of ticks on the x axis - always including the first and last date
		"sm": 4,
		"md": 4,
		"lg": 3
	},
	"yAxisTicks": {
		"sm": 10,
		"md": 8,
		"lg": 4
	},
	"legendColumns": 4,
	"dropYAxis": true,
	"elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 }
};

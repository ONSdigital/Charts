config = {
	"graphicDataURL": "../example-data/categorical-stacked-grouped.csv",
	"colourPalette": ONSdivPlatte,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"xAxisTickFormat": {
		"sm": ".0f",
		"md": ".0f",
		"lg": ".0f"
	},
	"dateFormat": "%b-%y",
	//the format your date data has in data.csv
	"yDomain": [0,100],
	// either "auto" or an array for the x domain e.g. [0,100]
	"yAxisLabel": "yAxis Label",
	"xAxisLabel": "xAxis Label",
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
			"top": 35,
			"right": 20,
			"bottom": 45,
			"left": 95
		},
		"md": {
			"top": 35,
			"right": 20,
			"bottom": 45,
			"left": 95
		},
		"lg": {
			"top": 35,
			"right": 20,
			"bottom": 45,
			"left": 95
		}
	},
	"chartGap": 20,
	"chartEvery": {
		"sm": 1,
		"md": 2,
		"lg": 2
	},
	"aspectRatio": {
		"sm": [1.2, 1],
		"md": [1, 1],
		"lg": [4, 3]
	},
	"xAxisTicks": {
		"sm": 5,
		"md": 5,
		"lg": 5
	},
	"legendColumns": 2,
	"dropYAxis": true,
	"elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 }
};

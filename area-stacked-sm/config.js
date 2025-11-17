config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONSpalette,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"xDomain": "auto",
	// either "auto" or an array for the x domain e.g. [0,100]
	"xAxisTickFormat": {
		"sm": "%y",
		"md": "%Y",
		"lg": "%Y"
	},
	"yAxisFormat": ".0%",
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
	"chartEvery": {
		"sm": 1,
		"md": 1,
		"lg": 2
	},
	"aspectRatio": {
		"sm": [1, 1],
		"md": [1, 1],
		"lg": [1, 1]
	},
	"margin": {
		"sm": {
			"top": 50,
			"right": 20,
			"bottom": 50,
			"left": 50
		},
		"md": {
			"top": 50,
			"right": 20,
			"bottom": 50,
			"left": 50
		},
		"lg": {
			"top": 50,
			"right": 20,
			"bottom": 50,
			"left": 50
		}
	},
	"chartGap": 20,
	"xAxisTicksEvery": {
		"sm": 7,
		"md": 5,
		"lg": 4
	},
	"legendColumns": 4,
	"dropYAxis": true,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

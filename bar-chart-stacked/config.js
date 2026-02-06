config = {
	"graphicDataURL": "../example-data/categorical-stacked.csv",
	"colourPalette": ONSpalette,
	"drawLegend": true, // set to false to remove the legend (still working on this)
	"someOtherVariable": "someOtherValue",
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"xDomain": "auto",
	// either "auto" or an array for the x domain e.g. [0,100]
	"xAxisTickFormat": ".0f",
	"xAxisLabel": "x axis label",
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
			"top": 15,
			"right": 20,
			"bottom": 50,
			"left": 120
		},
		"md": {
			"top": 15,
			"right": 20,
			"bottom": 50,
			"left": 120
		},
		"lg": {
			"top": 15,
			"right": 20,
			"bottom": 50,
			"left": 120
		}
	},
	"seriesHeight": {
		"sm": 30,
		"md": 30,
		"lg": 30
	},
	"xAxisTicks": {
		"sm": 4,
		"md": 8,
		"lg": 10
	}
};

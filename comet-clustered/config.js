config = {
	"graphicDataURL": "data.csv",
	"seriesLabels": { "series0": "Series 1", "series1": "Series 2" },
	"legendLabels": { "min": "FYE 2022", "max": "FYE 2023" },
	//the keys match the column names
	"colourPalette": ONSpalette,
	"colourMinText": ONScolours.grey75,
	"legendColour": ONScolours.grey75,
	"sourceText": "Country and Regional Public Sector Finances from the Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"numberFormat": ".1f",
	"xAxisNumberFormat": ".0f",
	"numberSuffix": "",
	"xAxisLabel": "£ billion",
	// "xDomain": "auto",
	"xDomain": [-10, 250],
	// either auto or a custom domain as an array e.g [0,100]
	"dotsize": 5.5,
	"legendItems": ["Inc", "Dec"],
	//Choose which items to include in the legend, and the order that they appear
	"legendLineLength": 60,
	"legendItemWidth": 205,
	"showDataLabels": true,
	"margin": {
		"sm": {
			"top": 10,
			"right": 20,
			"bottom": 20,
			"left": 100
		},
		"md": {
			"top": 10,
			"right": 20,
			"bottom": 20,
			"left": 100
		},
		"lg": {
			"top": 10,
			"right": 20,
			"bottom": 40,
			"left": 100
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
	},
	"legendHeight": {
		"sm": 40,
		"md": 40,
		"lg": 40
	},
	"mobileBreakpoint": 510,
	"mediumBreakpoint": 600,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

config = {
	"graphicDataURL": "data.csv",
	"legendLabels": ["Category 1 goes here", "Category 2 goes here"],
	"colourPalette": ONSpalette,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"dataLabels": {
		"show": true,
		"numberFormat": ".0%"
	},
	"xDomain": "auto",
	// either "auto" or an array for the x domain e.g. [0,100]
	"xAxisLabel": "x axis label",
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
		"sm": 28,
		"md": 28,
		"lg": 28
	},
	"xAxisTicks": {
		"sm": 4,
		"md": 8,
		"lg": 10
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

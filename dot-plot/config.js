config = {
	"graphicDataURL": "data.csv",
	"legendLabels": ["2015-2019", "2020", "Average", "Another series"],
	"colourPalette": ONSpalette,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "Here is the screenreader text describing the chart.",
	"xAxisNumberFormat": ".0f",
	"xAxisLabel": "x axis label",
	"xDomain": "auto",
	"categoriesToMakeDiamonds": ["min", 'average'],
	// either auto or a custom domain as an array e.g [0,100]
	"margin": {
		"sm": {
			"top": 15,
			"right": 20,
			"bottom": 30,
			"left": 100
		},
		"md": {
			"top": 15,
			"right": 20,
			"bottom": 30,
			"left": 100
		},
		"lg": {
			"top": 15,
			"right": 20,
			"bottom": 30,
			"left": 100
		}
	},
	"seriesHeight": {
		"sm": 40,
		"md": 40,
		"lg": 40
	},
	"xAxisTicks": {
		"sm": 4,
		"md": 8,
		"lg": 10
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

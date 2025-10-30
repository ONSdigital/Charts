config = {
	"graphicDataURL": "data.csv",
	"legendLabels": { "min": "2011", "max": "2021" },
	//the keys match the column names
	"colourPalette": [ONScolours.oceanBlue, ONScolours.coralPink, ONScolours.grey50],
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "Here is the screenreader text describing the chart.",
	"numberFormat": ".0f",
	"xAxisNumberFormat": ".0f",
	"xAxisLabel": "x axis label",
	"xDomain": [0, 100],
	// either auto or a custom domain as an array e.g [0,100]
	"dotsize": 6,
	"legendItems": ["Inc", "Dec", "No"],
	//Choose which items to include in the legend, and the order that they appear
	"legendLineLength": 60,
	"legendItemWidth": 150,
	"showDataLabels": true,
	"margin": {
		"sm": {
			"top": 5,
			"right": 20,
			"bottom": 20,
			"left": 100
		},
		"md": {
			"top": 5,
			"right": 20,
			"bottom": 20,
			"left": 100
		},
		"lg": {
			"top": 5,
			"right": 20,
			"bottom": 40,
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
	"legendHeight": {
		"sm": 40,
		"md": 40,
		"lg": 40
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

config = {
	"graphic_data_url": "data.csv",
	"colour_palette": ONScolours.oceanBlue,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "Here is the screenreader text describing the chart.",
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
			"left": 150
		},
		"md": {
			"top": 15,
			"right": 20,
			"bottom": 50,
			"left": 180
		},
		"lg": {
			"top": 15,
			"right": 20,
			"bottom": 50,
			"left": 200
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
	"mobileBreakpoint": 510,
	"mediumBreakpoint": 600,
	"elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 },
	"chart_build": {}
};

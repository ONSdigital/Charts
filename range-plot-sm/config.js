config = {
	"graphic_data_url": "data.csv",
	"legendLabels": { "min": "Moved travel to work area (TTWA)", "max": "Moved region" },
	//the keys match the column names
	"colourPalette": [ONScolours.grey60, ONScolours.oceanBlue],
	"sourceText": "Office for National Statistics (ONS) analysis using Longitudinal Education Outcomes (LEO) from the Department for Education (DfE)",
	"accessibleSummary": "Here is the screenreader text describing the chart.",
	"numberFormat": ".0%",
	"xAxisTickFormat": ".0%",
	"xAxisLabel": "Percentage",
	"xDomain": [0.2, 0.95],
	// either auto or a custom domain as an array e.g [0,100]
	"showDataLabels": false,
	"chartEvery": {
		"sm": 1,
		"md": 2,
		"lg": 2
	},
	"dropYAxis": true,
	"margin": {
		"sm": {
			"top": 20,
			"right": 20,
			"bottom": 20,
			"left": 140
		},
		"md": {
			"top": 20,
			"right": 20,
			"bottom": 20,
			"left": 140
		},
		"lg": {
			"top": 20,
			"right": 20,
			"bottom": 40,
			"left": 150
		}
	},
	"seriesHeight": {
		"sm": 40,
		"md": 40,
		"lg": 40
	},
	"xAxisTicks": {
		"sm": 5,
		"md": 5,
		"lg": 5
	},
	"mobileBreakpoint": 510,
	"mediumBreakpoint": 600
};

config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONSlinePalette,
	"textColourPalette": ONStextPalette,
	"sourceText": "Census 2011 and Census 2021 from the Office for National Statistics",
	"accessibleSummary": "",
	"lineCurveType": "curveLinear",
	"yDomain": [0, 550000],
	// either "auto" or an array for the x domain e.g. [0,2000]
	"xAxisTickFormat": {
		"sm": "%b %y",
		"md": "%b %y",
		"lg": "%B %Y"
	},
	"xAxisNumberFormat": ".0f",
	"yAxisNumberFormat": ",.0f",
	"dateFormat": "%d-%m-%Y",
	// default is 75
	"chartHeight": {
		"sm": 350,
		"md": 350,
		"lg": 350
	},
	"chartWidth": {
		"sm": 75,
		"md": 75,
		"lg": 75
	},
	"margin": {
		"sm": {
			"top": 30,
			"right": 0, //Not needed - right margin calculated from chartwidth etc.
			"bottom": 25,
			"left": 70
		},
		"md": {
			"top": 30,
			"right": 0, //Not needed - right margin calculated from chartwidth etc.
			"bottom": 15,
			"left": 70
		},
		"lg": {
			"top": 30,
			"right": 0, //Not needed - right margin calculated from chartwidth etc.
			"bottom": 15,
			"left": 70
		}
	},
	"mobileBreakpoint": 510,
	"mediumBreakpoint": 600,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

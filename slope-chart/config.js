config = {
	"graphicDataURL": "../example-data/slope.csv",
	"colourPalette": ONSlinePalette,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"lineCurveType": "curveLinear",
	"yDomainMin": "auto",
	"yDomainMax": "auto",
	// yDomainMin and yDomainMax can be "auto", "data", or a numeric value
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
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

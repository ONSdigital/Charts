config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONScolours.oceanBlue,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "Here is the screenreader text describing the chart.",
	"xAxisTickFormat": {
		"sm": "%b-%y",
		"md": "%b-%y",
		"lg": "%b-%y"
	},
	"xAxisNumberFormat": ".0f",
	"yAxisTickFormat": ".0%",
	"dateFormat": "%b-%y",
	//the format your date data has in data.csv
	"yDomain": "auto",
	// either "auto" or an array for the x domain e.g. [0,100]
	"yAxisLabel": "y axis label",
	"chartEvery": {
		"sm": 1,
		"md": 2,
		"lg": 2
	},
	"aspectRatio": {
		"sm": [1, 1],
		"md": [1, 1],
		"lg": [1, 1]
	},
	"margin": {
		"sm": {
			"top": 40,
			"right": 20,
			"bottom": 50,
			"left": 70
		},
		"md": {
			"top": 40,
			"right": 20,
			"bottom": 50,
			"left": 70
		},
		"lg": {
			"top": 40,
			"right": 20,
			"bottom": 50,
			"left": 70
		}
	},
	"chartGap": 20,
	"xAxisTicksEvery": { // this is the interval of ticks on the x axis - always including the first and last date
		"sm": 3,
		"md": 5,
		"lg": 4
	},
	"yAxisTicks": {
		"sm": 4,
		"md": 8,
		"lg": 10
	},
	"dropYAxis": true,
	"elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 }
};

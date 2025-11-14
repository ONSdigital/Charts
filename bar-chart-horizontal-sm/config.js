config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONScolours.oceanBlue,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"dataLabels": {
		"show": 1,
		"numberFormat": ".0%"
	},
	"xDomain": "auto",
	// either "auto" or an array for the x domain e.g. [0,100]
	"xAxisLabel": "x axis label",
	"chartEvery": {
		"sm": 1,
		"md": 1,
		"lg": 2
	},
	// "aspectRatio": {
	//   "sm": [1, 2],
	//   "md": [1, 2],
	//   "lg": [1, 2]
	// },
	"margin": {
		"sm": {
			"top": 30,
			"right": 20,
			"bottom": 50,
			"left": 200
		},
		"md": {
			"top": 30,
			"right": 20,
			"bottom": 50,
			"left": 200
		},
		"lg": {
			"top": 30,
			"right": 20,
			"bottom": 50,
			"left": 200
		}
	},
	"chartGap": 10,
	"seriesHeight": {
		"sm": 30,
		"md": 30,
		"lg": 30
	},
	"xAxisTicks": {
		"sm": 2,
		"md": 2,
		"lg": 4
	},
	"mobileBreakpoint": 510,
	"mediumBreakpoint": 600,
	"dropYAxis": true,
	"elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 }
};

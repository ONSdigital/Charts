config = {
	"graphicDataURL": "../example-data/categorical-clustered.csv",
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
	"chartEvery": {
		"sm": 1,
		"md": 1,
		"lg": 2
	},
	// "aspectRatio": {
	// 	"sm": [1, 2],
	// 	"md": [1, 2],
	// 	"lg": [1, 2]
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
		"sm": 60,
		"md": 60,
		"lg": 60
	},
	"xAxisTicks": {
		"sm": 2,
		"md": 2,
		"lg": 4
	},
	"dropYAxis": true,
	"elements": { "select": 0, "nav": 0, "legend": 0, "titles": 0 }
};

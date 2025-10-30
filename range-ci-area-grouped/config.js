config = {
	"graphicDataURL": "data.csv",
	"colourPalette": ONSpalette,
	"sourceText": "Office for National Statistics",
	"accessibleSummary": "A range plot with confidence intervals. This chart is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
	"xAxisTickFormat": ".0f",
	"xAxisLabel": "x axis label",
	"xDomain": [0, 160],
	// either auto or a custom domain as an array e.g [0,100]
	"ciLegend": true,
	"legendIntervalText": "Likely range (95% confidence interval)",
	"legendEstimateText": "Estimated value",
	// If you have a third series, make sure to add it at the end of the script for the time being. This needs to be added as a reference option in config.
	// If you want a clustered chart, true
	"clustered": true,
	"margin": {
		"sm": {
			"top": 5,
			"right": 20,
			"bottom": 40,
			"left": 100
		},
		"md": {
			"top": 5,
			"right": 20,
			"bottom": 40,
			"left": 100
		},
		"lg": {
			"top": 5,
			"right": 20,
			"bottom": 40,
			"left": 120
		}
	},
	"seriesHeight": {
		"sm": 20,
		"md": 20,
		"lg": 20
	},
	"xAxisTicks": {
		"sm": 4,
		"md": 8,
		"lg": 10
	},
};

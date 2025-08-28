config = {
	"essential": {
		"graphic_data_url": "data.csv",
		"colour_palette": [
			"#206095",
			"#871A5B",
			"#8D8C8E",
			"#27A0CC",
			"#A8BD3A",
			"#F66068",
			"#118C7B"
		],
		"sourceText": "Office for National Statistics",
		"accessibleSummary":
			"A range plot with confidence intervals. This chart is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
		"xAxisTickFormat": ".0f",
		"xAxisLabel": "x axis label",
		"xDomain": [0,160],
		// either auto or a custom domain as an array e.g [0,100]
		"CI_legend": true,
		"CI_legend_interval_text": "Likely range (95% confidence interval)",
		"CI_legend_text": "Estimated value",
		// If you have a third series, make sure to add it at the end of the script for the time being. This needs to be added as a reference option in config.
		// If you want a clustered chart, true
		"clustered": true, 
	},
	"optional": {
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
		"mobileBreakpoint": 510,
		"mediumBreakpoint": 600
	}
};

config = {
	"essential": {
		"graphic_data_url": "datanumeric.csv",
		"colour_palette": [
			"#206095",
			"#27A0CC",
			"#871A5B",
			"#A8BD3A",
			"#F66068",
			"#118C7B"
		],
		"text_colour_palette": [
			"#206095",
			"#1F80A3",
			"#871A5B",
			"#6E7E26",
			"#F66068",
			"#118C7B"
		],
		"drawLegend": false,
		"sourceText": "Office for National Statistics",
		"accessibleSummary": "Here is the screen reader text describing the chart.",
		"lineCurveType": "curveLinear", // Set the default line curve type
		// Examples of line curve types
		// "lineCurveType": "curveLinear", // Straight line segments
		// "lineCurveType": "curveStep", // Step-wise line
		// "lineCurveType": "curveStepBefore", // Step-before line
		// "lineCurveType": "curveStepAfter", // Step-after line
		// "lineCurveType": "curveBasis", // B-spline curve
		// "lineCurveType": "curveCardinal", // Cardinal spline curve
		// "lineCurveType": "curveCatmullRom" // Catmull-Rom spline curve
		// "lineCurveType": "curveMonotoneX" // Monotone spline curve
		"xDomain": "auto",
		"yDomain": [0,7],
		// either "auto" or an array for the x domain e.g. [0,2000]
		"xAxisTickFormat": {
			"sm": "%b %y",
			"md": "%b %y",
			"lg": "%b %y"
		},
		"xAxisNumberFormat": ".0f",
		"dateFormat": "%d/%m/%Y",
		"yAxisLabel": "y axis label",
		"CI_legend_interval_text": "Likely range (95% confidence interval)",
		"CI_legend_text": "Estimated value",
		"zeroLine": "0"
	},
	"optional": {
		"aspectRatio": {
			"sm": [1, 1],
			"md": [4, 3],
			"lg": [16, 9]
		},
		"margin": {
			"sm": {
				"top": 30,
				"right": 30,
				"bottom": 50,
				"left": 30
			},
			"md": {
				"top": 30,
				"right": 100,
				"bottom": 50,
				"left": 30
			},
			"lg": {
				"top": 30,
				"right": 100,
				"bottom": 50,
				"left": 30
			}
		},
		"xAxisTicks": { // this is the number of ticks on the x axis - add the first and last date with the options below
			"sm": 3,
			"md": 5,
			"lg": 7
		},
		"yAxisTicks": {
			"sm": 7,
			"md": 5,
			"lg":8
		},
		"addFirstDate": false,
		"addFinalDate": false,
		"mobileBreakpoint": 510,
		"mediumBreakpoint": 600
	},
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

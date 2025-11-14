config = {
	"graphicDataURL": "datanumeric.csv",
	"colourPalette": ONSlinePalette,
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
	// either "auto" or an array for the x domain e.g. [0,2000]
	"xAxisTickFormat": {
		"sm": "%b %y",
		"md": "%b %y",
		"lg": "%b %y"
	},
	"dateFormat": "%d/%m/%Y",
	"xAxisNumberFormat": ".0f",
	"yAxisNumberFormat": ".0f",
	"xAxisLabel": "x axis label",
	"yAxisLabel": "y axis label",
	"zeroLine": "0",
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
			"top": 50,
			"right": 50,
			"bottom": 50,
			"left": 60
		},
		"md": {
			"top": 50,
			"right": 50,
			"bottom": 50,
			"left": 60
		},
		"lg": {
			"top": 50,
			"right": 50,
			"bottom": 50,
			"left": 60
		}
	},
	"chartGap": 20,
	"xAxisTickMethod": "total", // "interval" or "total"
	"xAxisTickCount": { // for "total" method
		"sm": 2,
		"md": 2,
		"lg": 6
	},
	"xAxisTickInterval": { // for "interval" method
		"unit": "year", // "year", "month", "quarter", "day"
		"step": { // every x "units"
			"sm": 2,
			"md": 2,
			"lg": 2
		}
	},
	"yAxisTicks": {
		"sm": 7,
		"md": 5,
		"lg":8
	},
	"dropYAxis": true,
	"freeYAxisScales": false, //If true dropYAxis will be ignored - each chart will always have a y-axis
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

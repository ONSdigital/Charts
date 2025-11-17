config = {
	"graphicDataURL": "data.csv",
	"colourPalette": [
		ONScolours.oceanBlue,
		ONScolours.skyBlue,
		ONScolours.grey20
	],
	"labelFinalPoint": true,
	"referenceCategory": "England",// Highlighted on each chart and doesn't get it's own chart - leave blank to turn off
	"legendLabel": "selected group",
	"allLabel": "all other groups",
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
	"yDomain": "auto",
	// either "auto" or an array for the y domain e.g. [0,2000]
	"xAxisTickFormat": {
		"sm": "%b %y",
		"md": "%b %y",
		"lg": "%b %y"
	},
	"xAxisNumberFormat": ".0f",
	"dateFormat": "%d/%m/%Y",
	"yAxisLabel": "y axis label",
	"xAxisLabel": "x axis label",
	"zeroLine": "0",
	"interpolateGaps": true,
	"chartEvery": {
		"sm": 2,
		"md": 2,
		"lg": 3
	},
	"aspectRatio": {
		"sm": [1, 1],
		"md": [1, 1],
		"lg": [1, 1]
	},
	"margin": {
		"sm": {
			"top": 45,
			"right": 50,
			"bottom": 50,
			"left": 60
		},
		"md": {
			"top": 45,
			"right": 50,
			"bottom": 50,
			"left": 60
		},
		"lg": {
			"top": 45,
			"right": 50,
			"bottom": 50,
			"left": 60
		}
	},
	"chartGap": 20,
	"xAxisTicksEvery": { // this is the interval of ticks on the x axis - always including the first and last date
		"sm": 12,
		"md": 4,
		"lg": 5
	},
	"yAxisTicks": {
		"sm": 7,
		"md": 5,
		"lg": 8
	},
	"addFirstDate": false,
	"addFinalDate": false,
	"dropYAxis": true,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};

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
	"accessibleSummary": "The chart canvas is hidden from screen readers. The main message is summarised by the chart title and the data behind the chart is available to download below.",
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
	"yDomainMin": "auto",
	"yDomainMax": "auto",
	// Options: "auto" (smart trimming with zero baseline), "data" (exact data bounds), or numeric values
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
		"sm": [5, 4],
		"md": [5, 4],
		"lg": [5, 4]
	},
	"margin": {
		"sm": {
			"top": 45,
			"right": 55,
			"bottom": 50,
			"left": 60
		},
		"md": {
			"top": 45,
			"right": 55,
			"bottom": 50,
			"left": 60
		},
		"lg": {
			"top": 45,
			"right": 55,
			"bottom": 55,
			"left": 60
		}
	},
	"chartGap": 20,
	// New tick config
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
		"lg": 8
	},
	"addFirstDate": false,
	"addFinalDate": false,
	"labelSpans": {
		"enabled": true,
		"timeUnit": 'quarter',//set to "day","month",'quarter' or 'year'
		secondaryTimeUnit: 'auto'//can be 'auto' or false to disable. set to "day","month",'quarter' or 'year' to override
	},
	"dropYAxis": true,
	"addEndMarkers": true,
	"elements": { "select": 0, "nav": 0, "legend": 1, "titles": 0 }
};
